import { TranslationCard } from '@/components/tts/translation-card';

export default function Home() {
  return (
    <div className="container mx-auto py-6 h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Text to Speech</h1>
        <p className="text-muted-foreground">
          Translate text and convert it to speech in multiple languages
        </p>
      </div>
      <TranslationCard />
    </div>
  );
}