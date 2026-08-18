import { useState } from 'react';
import { OCRComponent } from './OCRComponent';
import { Camera, FileText } from 'lucide-react';
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
    <div className="flex flex-col gap-4 w-full bg-black border border-yellow-500 rounded-2xl p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
        <Camera /> Scan Text / Objects
      </h2>
      <p className="text-sm text-yellow-300">
        Align a document, pill bottle, or product in front of your camera. The app will read the text automatically.
      </p>

      <OCRComponent onTextExtracted={handleTextExtracted} speakText={speakText} />

      {scannedText && (
        <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-yellow-500/30 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold font-mono">
            <FileText size={14} /> EXTRACTED TEXT
          </div>
          <p className="text-sm text-yellow-400 font-semibold">{scannedText}</p>
          <button
            onClick={() => speakText(scannedText)}
            className="mt-2 py-3 bg-zinc-950 border border-yellow-500 text-yellow-400 rounded-lg text-xs font-bold hover:bg-zinc-900"
          >
            🔊 Read Aloud
          </button>
        </div>
      )}
    </div>
  );
}
