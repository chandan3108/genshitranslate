import { NextRequest, NextResponse } from 'next/server';
import { SITUATIONS } from '@/lib/situations';
import { TranslationRequest, TranslationResponse } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// High-availability model pool prioritized by response latency and verified endpoints
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest'
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
  * "japanese": Natural, polite travel Japanese translation for the tourist to say with standard Kanji.
  * "kanaReading": Pure phonetic Hiragana reading of the entire Japanese sentence (e.g. "しぶやまでいくらくらいかかりますか？"). This provides the unambiguous reading layer fed directly into TTS speech synthesis so Kanji readings are never mispronounced!
  * "romaji": Syllable-spaced Hepburn Romaji.
  * "english": Faithful, accurate English meaning of the generated Japanese phrase (e.g. if the Japanese politely adds "kurai" (about/approximately) or softening particles, explicitly reflect "About how much..." so the traveler understands the exact nuance of what they are saying!).
  * "nuance": Explanation of why this Japanese phrasing was chosen over alternatives.
  * "situationalIntent": "" (leave empty string for tourist)
  * "suggestedReplies": [] (MUST BE EMPTY ARRAY for tourist! 1-tap polite replies are ONLY generated for the Japanese local staff so the tourist can respond to them!)

- If the speaker spoke or typed JAPANESE:
  * detectedSpeaker MUST BE "local".
  * "japanese": The input Japanese text.
  * "kanaReading": Pure phonetic Hiragana reading of the Japanese sentence.
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

AUDIO HUMAN SPEECH VALIDATION RULE:
1. First, strictly analyze the audio for genuine human speech.
2. If the audio contains NO human speech (e.g. pure silence, breathing, microphone click/rustle, room tone, air conditioner, or background static):
   You MUST return:
   {
     "isIgnored": true,
     "noSpeechDetected": true,
     "detectedSpeaker": "tourist",
     "transcribedInput": "",
     "japanese": "",
     "kanaReading": "",
     "romaji": "",
     "english": "",
     "situationalIntent": "",
     "nuance": "",
     "culturalTip": "",
     "suggestedReplies": []
   }
   CRITICAL: Do NOT copy, invent, or hallucinate phrases from the situation guide or conversation history if the audio is silent or unintelligible noise!

3. ONLY if clear human speech is genuinely spoken in the audio:
   Set "isIgnored": false and "noSpeechDetected": false, transcribe the exact spoken words, translate them accurately, and provide context.

Respond ONLY with a valid JSON object matching this schema:
{
  "isIgnored": false,
  "noSpeechDetected": false,
  "detectedSpeaker": "tourist | local",
  "transcribedInput": "The exact words spoken in the audio (empty string if no speech)",
  "japanese": "Japanese text with standard Kanji (empty string if no speech)",
  "kanaReading": "Pure Hiragana phonetic reading matching the Romaji (empty string if no speech)",
  "romaji": "Hepburn Romaji with clear word/syllable spacing (empty string if no speech)",
  "english": "English text (empty string if no speech)",
  "situationalIntent": "Detailed explanation of what is actually happening in this situation (empty string if no speech)",
  "nuance": "Linguistic & cultural nuance (empty string if no speech)",
  "culturalTip": "Practical travel tip on Japanese etiquette (empty string if no speech)",
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

    // ================= SILENCE & NO-SPEECH GUARD =================
    if (parsed.noSpeechDetected || parsed.isIgnored) {
      return NextResponse.json({
        isIgnored: true,
        noSpeechDetected: true,
        japanese: '',
        romaji: '',
        english: '',
        situationalIntent: '',
        nuance: '',
        culturalTip: '',
        suggestedReplies: [],
      });
    }

    const transcribed = (parsed.transcribedInput || input || '').trim();
    // If there is no input text and transcribed is empty or lacks alphanumeric/kana characters
    const hasMeaningfulCharacters = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFFa-zA-Z0-9]/.test(transcribed);
    if (!input && !hasMeaningfulCharacters) {
      return NextResponse.json({
        isIgnored: true,
        noSpeechDetected: true,
        japanese: '',
        romaji: '',
        english: '',
        situationalIntent: '',
        nuance: '',
        culturalTip: '',
        suggestedReplies: [],
      });
    }

    // ================= AMBIENT FILTER & LANGUAGE GUARD =================
    const textToCheck = transcribed;
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

    if (parsed.detectedSpeaker === 'tourist') {
      parsed.suggestedReplies = [];
      parsed.situationalIntent = '';
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
