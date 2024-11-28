import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function textToSpeech(text: string, voice: string) {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Speech generation error:', error);
    throw new Error('Failed to generate speech');
  }
}