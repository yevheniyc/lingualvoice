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
    const { text, targetLanguage } = JSON.parse(event.body || '{}');

    if (!text || !targetLanguage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    if (text.length > 4000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text exceeds maximum length of 4000 characters' }),
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original formatting and tone. Only respond with the translated text, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ translatedText: response.choices[0]?.message?.content }),
    };
  } catch (error: any) {
    console.error('Translation error:', error);
    
    const errorMessage = error.message || 'Translation failed';
    const statusCode = error.message.includes('API key') ? 401 : 500;
    
    return {
      statusCode: statusCode,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};