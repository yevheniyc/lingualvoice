import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text, voice } = JSON.parse(event.body || '{}');

    if (!text || !voice) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return {
      statusCode: 200,
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    };
  } catch (error: any) {
    console.error('Speech generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Speech generation failed' }),
    };
  }
};