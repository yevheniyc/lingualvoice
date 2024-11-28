import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateText(text: string, targetLanguage: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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

    if (!response.choices[0]?.message?.content) {
      throw new Error('No translation received from OpenAI');
    }

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('Translation error details:', {
      error: error.message,
      code: error.code,
      type: error.type,
      param: error.param,
      status: error.status,
      model: 'gpt-4o'
    });
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded');
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key');
    }
    
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }

    if (error.code === 'model_not_found') {
      throw new Error('The specified translation model is not available');
    }

    if (error.message.includes('maximum context length')) {
      throw new Error('Text chunk exceeds maximum allowed length. Please try with a smaller chunk.');
    }

    throw new Error(error.message || 'Failed to translate text');
  }
}