import { toast } from 'sonner';
import { SPEECH_CONSTANTS } from '@/lib/constants/speech';

async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function generateSpeechChunk(
  text: string,
  voice: string,
  retryCount = 0
): Promise<ArrayBuffer> {
  try {
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Speech generation failed with status ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error: any) {
    console.error('Speech generation chunk error:', {
      chunk: text.substring(0, 100) + '...',
      error: error.message,
      retryCount,
    });

    if (retryCount < SPEECH_CONSTANTS.MAX_RETRIES) {
      await delay(SPEECH_CONSTANTS.RETRY_DELAY * (retryCount + 1));
      return generateSpeechChunk(text, voice, retryCount + 1);
    }
    throw error;
  }
}

export async function generateSpeechWithProgress(
  chunks: string[],
  voice: string,
  onProgress: (progress: number) => void
): Promise<Blob[]> {
  const audioChunks: Blob[] = [];
  let failedChunks = 0;

  for (let i = 0; i < chunks.length; i++) {
    try {
      const audioBuffer = await generateSpeechChunk(chunks[i], voice);
      audioChunks.push(new Blob([audioBuffer], { type: 'audio/mpeg' }));
      console.log(`Successfully generated speech for chunk ${i + 1}/${chunks.length}`);
    } catch (error: any) {
      console.error(`Failed to generate speech for chunk ${i + 1}/${chunks.length}:`, error);
      failedChunks++;
      toast.error(`Failed to generate speech for part ${i + 1}`, {
        description: error.message || 'This section will be skipped.',
      });
    }

    onProgress(((i + 1) / chunks.length) * 100);

    if (i < chunks.length - 1) {
      await delay(SPEECH_CONSTANTS.RETRY_DELAY);
    }
  }

  if (failedChunks > 0) {
    toast.error(`Speech generation partially completed`, {
      description: `${failedChunks} out of ${chunks.length} sections failed.`,
    });
  }

  return audioChunks;
}