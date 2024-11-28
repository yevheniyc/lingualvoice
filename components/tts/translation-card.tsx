'use client';

import { useState } from 'react';
import { languages } from '@/lib/constants/languages';
import { voices } from '@/lib/constants/voices';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TextEditor } from './text-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { chunkText } from '@/lib/utils/text-chunker';
import { translateWithProgress } from '@/lib/utils/translation';
import { generateSpeechWithProgress } from '@/lib/utils/speech';

export function TranslationCard() {
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('ru');
  const [selectedVoice, setSelectedVoice] = useState('onyx');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!originalText.trim()) {
      toast.error('Please enter some text to translate');
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);
    
    try {
      const chunks = chunkText(originalText);
      const result = await translateWithProgress(
        chunks,
        targetLanguage,
        (progress) => setTranslationProgress(progress)
      );
      
      setTranslatedText(result);
      toast.success('Translation completed');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to translate text';
      toast.error(errorMessage, {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
  };

  const handleCreateSpeech = async () => {
    if (!translatedText.trim()) {
      toast.error('Please translate some text first');
      return;
    }

    setIsGeneratingSpeech(true);
    setSpeechProgress(0);
    
    try {
      const chunks = chunkText(translatedText);
      const audioChunks = await generateSpeechWithProgress(
        chunks,
        selectedVoice,
        (progress) => setSpeechProgress(progress)
      );

      // Combine all audio chunks into a single blob
      const combinedBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(combinedBlob);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      toast.success('Speech generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate speech', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setIsGeneratingSpeech(false);
      setSpeechProgress(0);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'speech.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Original Text</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex-1">
            <TextEditor value={originalText} onChange={setOriginalText} />
          </div>
          <div className="flex items-center gap-4">
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex-1"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </Button>
          </div>
          {isTranslating && (
            <div className="space-y-2">
              <Progress value={translationProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Translating... {Math.round(translationProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Translated Text</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex-1">
            <TextEditor value={translatedText} onChange={setTranslatedText} readOnly />
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleCreateSpeech}
              disabled={isGeneratingSpeech}
              className="flex-1"
            >
              {isGeneratingSpeech ? 'Generating...' : 'Create Speech'}
            </Button>
          </div>
          {isGeneratingSpeech && (
            <div className="space-y-2">
              <Progress value={speechProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Generating speech... {Math.round(speechProgress)}%
              </p>
            </div>
          )}
          {audioUrl && (
            <div className="space-y-4">
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mpeg" />
              </audio>
              <Button onClick={handleDownloadAudio} variant="outline" className="w-full">
                Download Audio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}