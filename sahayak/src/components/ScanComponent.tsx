import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { performOCR } from '../utils/ocr';
import { speakText } from '../hooks/useSpeechRecognition';
import { AppMode } from './ModeSelector';

interface ScanComponentProps {
  onScanComplete: (text: string) => void;
  currentMode: AppMode;
}

export function ScanComponent({ onScanComplete, currentMode }: ScanComponentProps) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const text = await performOCR(file);
      onScanComplete(text);
      if (currentMode === 'visual' || currentMode === 'general') {
        speakText(`Scanning complete. Found text: ${text}`);
      }
      if (currentMode === 'hearing') {
        // Flash the screen visually
        document.body.classList.add('flashing-border');
        setTimeout(() => document.body.classList.remove('flashing-border'), 2000);
      }
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setIsScanning(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCapture}
        className="hidden"
        aria-hidden="true"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="w-full py-6 flex items-center justify-center gap-3 bg-accent text-accent-fg rounded-xl font-bold text-xl shadow-lg disabled:opacity-50"
        aria-label="Open camera to scan text"
      >
        {isScanning ? (
          <>
            <Loader2 className="animate-spin" size={32} />
            Scanning...
          </>
        ) : (
          <>
            <Camera size={32} />
            Scan Item
          </>
        )}
      </button>
    </div>
  );
}
