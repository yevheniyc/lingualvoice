import { TRANSLATION_CONSTANTS } from '@/lib/constants/translation';

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If a single paragraph is longer than maxLength, split by sentences
    if (paragraph.length > TRANSLATION_CONSTANTS.MAX_CHUNK_SIZE) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length + 1 <= TRANSLATION_CONSTANTS.MAX_CHUNK_SIZE) {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          // If a single sentence is longer than maxLength, split by words
          if (sentence.length > TRANSLATION_CONSTANTS.MAX_CHUNK_SIZE) {
            const words = sentence.split(' ');
            currentChunk = '';
            
            for (const word of words) {
              if (currentChunk.length + word.length + 1 <= TRANSLATION_CONSTANTS.MAX_CHUNK_SIZE) {
                currentChunk += (currentChunk ? ' ' : '') + word;
              } else {
                if (currentChunk) {
                  chunks.push(currentChunk.trim());
                }
                currentChunk = word;
              }
            }
          } else {
            currentChunk = sentence;
          }
        }
      }
    } else {
      if (currentChunk.length + paragraph.length + 2 <= TRANSLATION_CONSTANTS.MAX_CHUNK_SIZE) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = paragraph;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}