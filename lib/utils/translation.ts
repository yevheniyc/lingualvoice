import { toast } from 'sonner';
import { TRANSLATION_CONSTANTS } from '@/lib/constants/translation';

async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function translateChunk(
  text: string,
  targetLanguage: string,
  retryCount = 0
): Promise<string> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Translation chunk error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
      });
      throw new Error(data.error || `Translation failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.translatedText) {
      throw new Error('No translation received from the server');
    }

    return data.translatedText;
  } catch (error: any) {
    console.error('Translation chunk error details:', {
      chunk: text.substring(0, 100) + '...',
      error: error.message,
      retryCount,
    });

    if (retryCount < TRANSLATION_CONSTANTS.MAX_RETRIES) {
      console.log(`Retrying chunk translation (attempt ${retryCount + 1}/${TRANSLATION_CONSTANTS.MAX_RETRIES})`);
      await delay(TRANSLATION_CONSTANTS.RETRY_DELAY * (retryCount + 1));
      return translateChunk(text, targetLanguage, retryCount + 1);
    }
    throw error;
  }
}

export async function translateWithProgress(
  chunks: string[],
  targetLanguage: string,
  onProgress: (progress: number) => void
): Promise<string> {
  const translations: string[] = [];
  let failedChunks = 0;
  
  for (let i = 0; i < chunks.length; i++) {
    try {
      const translation = await translateChunk(chunks[i], targetLanguage);
      translations.push(translation);
      console.log(`Successfully translated chunk ${i + 1}/${chunks.length}`);
    } catch (error: any) {
      console.error(`Failed to translate chunk ${i + 1}/${chunks.length}:`, {
        error: error.message,
        chunkLength: chunks[i].length,
      });
      translations.push(chunks[i]); // Keep original text for failed chunks
      failedChunks++;
      toast.error(`Failed to translate part ${i + 1}`, {
        description: error.message || 'Original text will be kept for this section.',
      });
    }
    
    onProgress(((i + 1) / chunks.length) * 100);
    
    if (i < chunks.length - 1) {
      await delay(TRANSLATION_CONSTANTS.RETRY_DELAY);
    }
  }

  if (failedChunks > 0) {
    toast.error(`Translation partially completed`, {
      description: `${failedChunks} out of ${chunks.length} sections failed to translate.`,
    });
  }

  return translations.join('\n\n');
}