'use client';

import { Textarea } from '@/components/ui/textarea';

interface TextEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function TextEditor({ value, onChange, readOnly }: TextEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      className="h-full min-h-[300px] resize-none"
      placeholder={readOnly ? 'Translated text will appear here...' : 'Enter text to translate...'}
    />
  );
}