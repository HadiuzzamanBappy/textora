import { NextResponse } from 'next/server';
import { chunkText } from '../../../utils/textChunker';

import * as googleTTS from 'google-tts-api';

export async function POST(req: Request) {
  try {
    const { text, language = 'en', gender = 'FEMALE' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Valid text is required' }, { status: 400 });
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: 'Text is too long (limit 50,000 characters)' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    let finalBuffer: Buffer | null = null;

    // 1. Try official Google Cloud TTS first if API key is provided
    if (apiKey) {
      try {
        const chunks = chunkText(text, 4000);
        const audioBuffers: Buffer[] = [];

        for (const chunk of chunks) {
          const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
          const payload = {
            input: { text: chunk },
            voice: { languageCode: language, ssmlGender: gender },
            audioConfig: { audioEncoding: 'MP3' }
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Google TTS API Error: ${errorData}`);
          }

          const data = await response.json();
          if (!data.audioContent) {
            throw new Error('No audio content returned from Google TTS API');
          }

          audioBuffers.push(Buffer.from(data.audioContent, 'base64'));
        }
        finalBuffer = Buffer.concat(audioBuffers);
      } catch (cloudError) {
        console.warn('Official Cloud TTS failed (likely 403 Permission Denied). Falling back to free scraper...', cloudError);
      }
    }

    // 2. Fallback to the free google-tts-api scraper if Cloud API failed or no key
    // Note: The free scraper does not support Gender selection, it will use the default voice.
    if (!finalBuffer) {
      const results = await googleTTS.getAllAudioBase64(text, {
        lang: language,
        slow: false,
        host: 'https://translate.google.com',
        timeout: 30000,
        splitPunct: ',.?!;।', 
      });

      if (!results || results.length === 0) {
        throw new Error('No audio returned from Google TTS scraper');
      }

      const buffers = results.map((result) => Buffer.from(result.base64, 'base64'));
      finalBuffer = Buffer.concat(buffers);
    }

    return new NextResponse(finalBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="textora-export.mp3"',
        'Content-Length': finalBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Audio Export Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Failed to generate audio export', details: message },
      { status: 500 }
    );
  }
}
