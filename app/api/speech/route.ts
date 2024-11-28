import { NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/api/speech';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();

    if (!text || !voice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const audioBuffer = await textToSpeech(text, voice);
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Speech generation route error:', error);
    return NextResponse.json(
      { error: 'Speech generation failed' },
      { status: 500 }
    );
  }
}