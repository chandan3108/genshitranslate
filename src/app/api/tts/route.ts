import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory cache for synthesized audio to make repeat phrases instant
const audioCache = new Map<string, ArrayBuffer>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'ja';

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text query parameter is required' }, { status: 400 });
    }

    const cleanText = text.trim().slice(0, 200); // limit length for single utterance
    const cacheKey = `${lang}:${cleanText}`;

    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return new NextResponse(cached, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Google Translate TTS endpoint with high-definition Japanese neural pronunciation
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      lang
    )}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `TTS upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    // Cache up to 100 phrases
    if (audioCache.size < 100) {
      audioCache.set(cacheKey, arrayBuffer);
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('TTS route failure:', error);
    return NextResponse.json(
      { error: 'Internal TTS error', message: error.message },
      { status: 500 }
    );
  }
}
