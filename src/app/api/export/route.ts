import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(req: Request) {
  try {
    const { text, language = 'en' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Valid text is required' }, { status: 400 });
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: 'Text is too long (limit 50,000 characters)' }, { status: 400 });
    }

    // Google TTS API has a strict 200 character limit per request.
    // The getAllAudioBase64 method safely chunks the text, fires concurrent requests,
    // and returns an array of Base64 encoded MP3 strings.
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
      timeout: 30000,
      splitPunct: ',.?!;।', // Add standard punctuation and Bengali Dari to split points safely
    });

    if (!results || results.length === 0) {
      throw new Error('No audio returned from Google TTS');
    }

    // Convert all base64 chunks to binary Buffers and concatenate them into one massive MP3
    const buffers = results.map((result) => Buffer.from(result.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);

    return new NextResponse(finalBuffer, {
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
