import { NextResponse } from 'next/server';
import { translateText } from '@/lib/api/translate';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (text.length > 4000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 4000 characters' },
        { status: 400 }
      );
    }

    const translatedText = await translateText(text, targetLanguage);
    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error('Translation route error:', error);
    
    const errorMessage = error.message || 'Translation failed';
    const statusCode = error.message.includes('API key') ? 401 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}