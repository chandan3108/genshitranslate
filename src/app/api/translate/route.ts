import { NextRequest, NextResponse } from 'next/server';
import { SITUATIONS } from '@/lib/situations';
import { TranslationRequest, TranslationResponse } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Ultra-low latency model pool prioritized by fast response speed
const FAST_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
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
      tone = 'polite',
      customContext = '',
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

    const toneInstruction = (() => {
      switch (tone) {
        case 'casual':
          return `ACTIVE TONE: CASUAL & FRIENDLY (ため口 / Plain Form - Casual Izakaya, Friends, & Peer Talk)
- CRITICAL: The traveler has EXPLICITLY chosen CASUAL tone.
- STRICTLY FORBIDDEN: DO NOT use stiff polite forms (です, ます, でございます) or rigid keigo.
- REQUIRED: Use natural, friendly, colloquial plain-form Japanese (e.g. だよ, じゃない？, これ美味しいね, お願い, ありがとう, どこ？, ちょうだい, 行こう).
- Match the warmth and informality of chatting with friends, peers at an izakaya or counter bar, host families, or casual local acquaintances.
- Keep it natural, warm, and friendly without grammatical stiffness.`;
        case 'formal':
          return `ACTIVE TONE: FORMAL & BUSINESS (敬語 / Respectful Keigo)
- Use high-level polite and respectful Japanese (丁寧語, 謙譲語, 尊敬語) where appropriate.
- Suitable for formal business meetings, high-end Ryokan, luxury dining, or ceremonial occasions.`;
        case 'polite':
        default:
          return `ACTIVE TONE: NATURAL POLITE (丁寧語 / Desu-Masu - Standard Travel)
- Use standard, respectful, natural polite Japanese (です/ます).
- Clean, polite, and accessible for general everyday travel without sounding overly bureaucratic or robotic.`;
      }
    })();

    const customContextBlock = customContext?.trim()
      ? `CUSTOM USER CONTEXT & TRAVELER PROFILE:
"${customContext.trim()}"
MANDATORY CONTEXT-AWARENESS DIRECTIVES:
1. The traveler has provided the above personal context, dietary restrictions, party details, or social setting.
2. Adapt ALL translations, vocabulary choices, answers, and suggested replies according to this context:
   - Dietary restrictions (e.g. vegetarian, vegan, halal, allergies, no pork, no dashi): When food, drinks, or ingredients are discussed or ordered, actively reflect these restrictions and clarify ingredients if needed.
   - Social companions (e.g. traveling with kids, elderly parents, friends): Adjust phrasing and suggestions to suit the party.
   - Social dynamic (e.g. drinking at a bar with new friends, chatting with Airbnb host): Tailor conversational nuance to this exact relationship.`
      : `CUSTOM USER CONTEXT: None specified. Follow general travel context for the active venue.`;

    const systemPrompt = `You are "Genshi (言視)", an elite real-time Japanese travel translation copilot for foreign travelers visiting Japan.

${toneInstruction}

${customContextBlock}

DEEP CONVERSATIONAL CONTINUITY & CONTEXT AWARENESS:
1. Examine the CONVERSATION HISTORY closely. Maintain seamless continuity across turns.
2. If the local staff previously asked a question (e.g. "Do you need a bag?", "Do you have a point card?", "Is this for here or to go?"), interpret short tourist answers like "No thanks", "Yes please", or "To go" directly in response to that question (e.g. "大丈夫です、袋はいらないです" or "持ち帰りでお願いします").
3. If the tourist asks a question that builds on previous context (e.g. "How much for both?" or "Do you have another one?"), maintain reference continuity.
4. When translating Japanese staff remarks, explain the real underlying situational intent rather than giving literal dictionary translations.

SPEED & CONCISENESS DIRECTIVE (CRITICAL FOR REAL-TIME TRAVEL SPEED):
1. Be ultra-concise, fast, and natural.
2. "nuance": Exactly 1 short, crisp sentence explaining why this Japanese phrasing fits the situation and tone.
3. "culturalTip": Exactly 1 short, practical tip (under 15 words) on Japanese etiquette or custom.
4. "situationalIntent": Exactly 1 short sentence explaining what the clerk actually means.
5. "suggestedReplies": 2 to 3 concise 1-tap options matching the active situation.
6. Strictly avoid long essays or filler words so the response generates in milliseconds!

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
  * "japanese": Natural travel Japanese translation for the tourist to say with standard Kanji, strictly reflecting the ACTIVE TONE (${tone.toUpperCase()}) and CUSTOM USER CONTEXT.
  * "kanaReading": Pure phonetic Hiragana reading of the entire Japanese sentence (e.g. "しぶやまでいくらくらいかかりますか？"). This provides the unambiguous reading layer fed directly into TTS speech synthesis so Kanji readings are never mispronounced! For words like 故郷, ALWAYS write "ふるさと" (furusato) in kanaReading.
  * "romaji": Syllable-spaced Hepburn Romaji.
  * "english": Faithful, accurate English meaning of the generated Japanese phrase (e.g. if the Japanese politely adds "kurai" (about/approximately) or colloquial softening particles, explicitly reflect "About how much..." so the traveler understands the exact nuance of what they are saying!).
  * "nuance": Explanation of why this Japanese phrasing was chosen over alternatives and how it aligns with the tone and context.
  * "situationalIntent": "" (leave empty string for tourist)
  * "suggestedReplies": [] (MUST BE EMPTY ARRAY for tourist! 1-tap polite replies are ONLY generated for the Japanese local staff so the tourist can respond to them!)

- If the speaker spoke or typed JAPANESE:
  * detectedSpeaker MUST BE "local".
  * "japanese": The input Japanese text.
  * "kanaReading": Pure phonetic Hiragana reading of the Japanese sentence. For words like 故郷, ALWAYS write "ふるさと" (furusato).
  * "romaji": Hepburn Romaji for the Japanese.
  * "english": Natural English translation of what they said.
  * "situationalIntent": What the clerk/local actually means in this situation (e.g. asking for bags, bento heating, chopsticks, point cards, receipts, payments).
  * "suggestedReplies": 2 to 4 quick Japanese response options for the tourist to reply with. Tailor these responses to match the active TONE (${tone.toUpperCase()}) and CUSTOM USER CONTEXT!`
}

${audioBase64 ? `
STRICT HUMAN SPEECH MANDATE (ZERO TOLERANCE FOR HALLUCINATION):
1. Listen ONLY to the audio recording.
2. If the audio is silent, quiet room tone, microphone rustling/clicks, breathing, or contains NO audible spoken human words:
   You MUST return EXACTLY:
   {
     "isIgnored": true,
     "noSpeechDetected": true,
     "detectedSpeaker": "${speaker === 'local' ? 'local' : 'tourist'}",
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
3. ABSOLUTE BAN ON HALLUCINATION: NEVER fabricate, guess, or output any Japanese or English phrase (such as "お弁当温めますか？", "袋はご利用ですか？", "いらっしゃいませ", etc.) unless those exact words were audibly and distinctly spoken in the audio recording!
4. FAR-FIELD & SOFT SPEECH RESILIENCE: In real travel settings (convenience store counters, train ticket gates, hotel desks, restaurants), clerks and staff often speak softly, rapidly, or from across a counter with background ambient noise. Listen carefully: if human speech IS present—even if quiet, low-volume, or brief—faithfully transcribe and translate every word.
` : ''}

CURRENT SITUATION:
${situationConfig.name} (${situationConfig.japaneseName})
${audioBase64 ? situationConfig.description : situationConfig.systemPromptContext}

CONVERSATION HISTORY:
${formattedHistory ? formattedHistory : 'No prior turns.'}

DESIRED SPEAKER MODE: ${speaker}

${input ? `CURRENT TEXT INPUT: "${input.trim()}"` : 'AUDIO INPUT ATTACHED: Transcribe ONLY if words are audibly spoken in the recording.'}

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
      "japanese": "Natural Japanese reply matching active tone",
      "kanaReading": "Pure Hiragana reading",
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

    // Cycle through low-latency model pool
    for (const model of FAST_MODELS) {
      const is25 = model.includes('2.5');
      const generationConfig: Record<string, any> = {
        temperature: audioBase64 ? 0.0 : 0.1,
        maxOutputTokens: 750,
        responseMimeType: 'application/json',
      };
      // Disable internal chain-of-thought to eliminate 2-4s of thinking latency on Gemini 2.5
      if (is25) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      // Try up to 2 attempts for transient 503 spikes
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(7500),
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) break;
          } else {
            const errText = await response.text();
            console.warn(`Model ${model} (attempt ${attempt + 1}) returned ${response.status}: ${errText.slice(0, 100)}`);
            lastError = errText;
            if (response.status === 503 && attempt === 0) {
              await new Promise((r) => setTimeout(r, 250));
              continue;
            }
            break;
          }
        } catch (fetchErr) {
          console.warn(`Fetch error for ${model} (attempt ${attempt + 1}):`, fetchErr);
          lastError = fetchErr;
          break;
        }
      }

      if (rawText) break;
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

    // If audio was submitted, but transcribedInput is empty or lacks actual speech
    if (audioBase64 && (!parsed.transcribedInput || !parsed.transcribedInput.trim())) {
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
    } else if (parsed.suggestedReplies && Array.isArray(parsed.suggestedReplies)) {
      // Ensure all suggested replies have unambiguous phonetic readings
      parsed.suggestedReplies = parsed.suggestedReplies.map((r) => ({
        ...r,
        kanaReading: (r.kanaReading || r.japanese || '').replace(/故郷/g, 'ふるさと'),
      }));
    }

    // Guarantee kanaReading is populated and disambiguates 故郷 -> ふるさと
    if (parsed.japanese) {
      parsed.kanaReading = (parsed.kanaReading || parsed.japanese).replace(/故郷/g, 'ふるさと');
    }

    parsed.appliedTone = tone;
    if (customContext?.trim()) {
      parsed.appliedContext = customContext.trim();
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
