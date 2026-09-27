import { NextRequest, NextResponse } from 'next/server';
import { SITUATIONS } from '@/lib/situations';
import { TranslationRequest, TranslationResponse } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// High-availability model pool prioritized for free-tier resilience
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemma-4-26b-a4b-it'
];

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const body: TranslationRequest = await req.json();
    const {
      input,
      speaker = 'auto',
      situation,
      history = [],
      audioBase64,
      audioMimeType,
      ambientFilter = false,
    } = body;

    if ((!input || !input.trim()) && !audioBase64) {
      return NextResponse.json(
        { error: 'Either input text or audio is required' },
        { status: 400 }
      );
    }

    const situationConfig = SITUATIONS[situation] || SITUATIONS.general;

    const formattedHistory = history
      .slice(-6)
      .map(
        (h, i) =>
          `Turn ${i + 1} [${h.speaker === 'tourist' ? 'Tourist (EN)' : 'Local Staff (JA)'}]: Input="${h.input}" | Output="${h.japanese || h.english}"${h.situationalIntent ? ` | Context="${h.situationalIntent}"` : ''}`
      )
      .join('\n');

    const systemPrompt = `You are "Genshi (言視)", an elite real-time Japanese travel translation copilot for foreign travelers visiting Japan.

${
  ambientFilter
    ? `CRITICAL MODE: AMBIENT COPILOT (PASSENGER / EAVESDROP MODE ACTIVE)
The foreign traveler is in a taxi, car, train, or restaurant. They may be talking to their family or friends in ENGLISH.
RULE:
- If the audio is in ENGLISH (or non-Japanese family chatter):
  YOU MUST RETURN ONLY:
  {
    "isIgnored": true,
    "japanese": "",
    "romaji": "",
    "english": "",
    "situationalIntent": "",
    "nuance": "",
    "culturalTip": "",
    "suggestedReplies": []
  }
- ONLY if someone speaks JAPANESE (e.g. taxi driver, conductor, waiter, cashier speaking Japanese):
  Set "isIgnored": false, "detectedSpeaker": "local", transcribe the Japanese, translate to English, decode intent, and provide 1-tap polite replies with clear Hepburn Romaji!`
    : `SPEAKER CLASSIFICATION RULES:
- The TOURIST is a foreigner who ONLY speaks English.
- The LOCAL is a Japanese resident or staff member who ONLY speaks Japanese.
- If the speaker spoke or typed ENGLISH:
  * detectedSpeaker MUST BE "tourist".
  * "english": The input English text.
  * "japanese": Natural, polite travel Japanese translation for the tourist to say.
  * "romaji": Syllable-spaced Hepburn Romaji.
  * "nuance": Explanation of why this Japanese phrasing was chosen over alternatives.
  * "suggestedReplies": Common follow-up questions the tourist might ask.

- If the speaker spoke or typed JAPANESE:
  * detectedSpeaker MUST BE "local".
  * "japanese": The input Japanese text.
  * "romaji": Hepburn Romaji for the Japanese.
  * "english": Natural English translation of what they said.
  * "situationalIntent": What the clerk/local actually means in this situation (e.g. asking for bags, bento heating, chopsticks, point cards, receipts, payments).
  * "suggestedReplies": 2 to 4 quick, polite Japanese response options for the tourist to reply with.`
}

CURRENT SITUATION:
${situationConfig.name} (${situationConfig.japaneseName})
${situationConfig.systemPromptContext}

CONVERSATION HISTORY:
${formattedHistory ? formattedHistory : 'No prior turns.'}

DESIRED SPEAKER MODE: ${speaker}

${input ? `CURRENT TEXT INPUT: "${input.trim()}"` : 'AUDIO INPUT ATTACHED: Analyze the audio, determine the language, and process accordingly.'}

Respond ONLY with a valid JSON object matching this schema:
{
  "isIgnored": false,
  "detectedSpeaker": "tourist | local",
  "transcribedInput": "The exact words spoken in the audio (or echo the text input)",
  "japanese": "Japanese text",
  "romaji": "Hepburn Romaji with clear word/syllable spacing",
  "english": "English text",
  "situationalIntent": "Detailed explanation of what is actually happening in this situation",
  "nuance": "Linguistic & cultural nuance. Explain why this phrase or grammatical form was chosen over literal alternatives",
  "culturalTip": "A practical travel tip on Japanese etiquette, physical gestures, or expectations",
  "suggestedReplies": [
    {
      "label": "Short button label in English",
      "japanese": "Polite natural Japanese reply",
      "romaji": "Romaji pronunciation",
      "meaning": "English meaning"
    }
  ]
}`;

    const parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: audioMimeType || 'audio/webm',
          data: audioBase64,
        },
      });
    }
    parts.push({ text: systemPrompt });

    let lastError: any = null;
    let rawText: string | null = null;

    // Cycle through high-availability model pool
    for (const model of FALLBACK_MODELS) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: parts,
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 3000,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) break;
        } else {
          const errText = await response.text();
          console.warn(`Model ${model} returned ${response.status}: ${errText.slice(0, 100)}`);
          lastError = errText;
        }
      } catch (fetchErr) {
        console.warn(`Fetch error for ${model}:`, fetchErr);
        lastError = fetchErr;
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { error: 'All Gemini model endpoints failed or were busy', details: lastError },
        { status: 503 }
      );
    }

    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    const parsed: TranslationResponse = JSON.parse(cleanedText);

    // ================= AMBIENT FILTER & LANGUAGE GUARD =================
    const textToCheck = (parsed.transcribedInput || input || '').trim();
    const hasJapaneseCharacters = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(textToCheck);
    const hasEnglishWords = /[a-zA-Z]{2,}/.test(textToCheck);

    // If Ambient Copilot is active and no Japanese was spoken, ignore English chatter!
    if (ambientFilter) {
      if (!hasJapaneseCharacters && (hasEnglishWords || parsed.isIgnored)) {
        return NextResponse.json({ isIgnored: true });
      }
    }

    if (speaker === 'auto') {
      if (hasJapaneseCharacters) {
        parsed.detectedSpeaker = 'local';
      } else if (hasEnglishWords) {
        parsed.detectedSpeaker = 'tourist';
      }
    } else if (speaker === 'tourist') {
      parsed.detectedSpeaker = 'tourist';
    } else if (speaker === 'local') {
      parsed.detectedSpeaker = 'local';
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Translation route failure:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
