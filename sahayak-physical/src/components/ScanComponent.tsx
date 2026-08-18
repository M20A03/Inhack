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
        <div className="p-5 bg-surface-dark border border-emerald-900/30 shadow-md rounded-3xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-accent-gold text-xs font-bold tracking-wider uppercase">
            <FileText size={14} /> Extracted Text
          </div>
          <p className="text-sm text-on-surface font-semibold bg-deep-forest/40 p-4 rounded-2xl border border-emerald-900/20">{scannedText}</p>
          <button
            onClick={() => speakText(scannedText)}
            className="w-full min-h-[48px] bg-primary hover:bg-primary-container text-on-primary rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            🔊 Read Aloud
          </button>
        </div>
      )}
    </div>
  );
}

