import { useState } from 'react';
import { OCRComponent } from './OCRComponent';
import { FileText } from 'lucide-react';
import { speakText } from '../hooks/useSpeechRecognition';

interface ScanComponentProps {
  onTextExtracted: (text: string) => void;
}

export function ScanComponent({ onTextExtracted }: ScanComponentProps) {
  const [scannedText, setScannedText] = useState<string>('');

  const handleTextExtracted = (text: string) => {
    setScannedText(text);
    onTextExtracted(text);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <OCRComponent onTextExtracted={handleTextExtracted} speakText={speakText} />

      {scannedText && (
        <div className="p-5 bg-surface-dark border border-outline-variant/35 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-accent-gold text-xs font-bold font-mono">
            <FileText size={14} /> EXTRACTED TEXT
          </div>
          <p className="text-sm text-on-surface font-semibold bg-deep-forest/40 p-3 rounded-xl border border-outline-variant/20">{scannedText}</p>
          <button
            onClick={() => speakText(scannedText)}
            className="w-full min-h-[48px] bg-deep-forest text-primary border border-outline-variant/35 rounded-xl text-xs font-bold hover:bg-surface-dark active:scale-95 duration-150"
          >
            🔊 Read Aloud
          </button>
        </div>
      )}
    </div>
  );
}
