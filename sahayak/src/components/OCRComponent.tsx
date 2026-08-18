import { useState, useEffect, useRef } from 'react';
import { PaddleOCR } from '@paddleocr/paddleocr-js';

interface OCRComponentProps {
  onTextExtracted: (text: string) => void;
  speakText: (text: string) => void;
}

export function OCRComponent({ onTextExtracted, speakText }: OCRComponentProps) {
  const [ocrEngine, setOcrEngine] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize OCR once
  useEffect(() => {
    const initOCR = async () => {
      try {
        setStatus('Loading OCR model...');
        const instance = await PaddleOCR.create({
          lang: 'en',
          ocrVersion: 'PP-OCRv5',
          ortOptions: { backend: 'wasm' }
        });
        setOcrEngine(instance);
        setStatus('✅ OCR Ready');
      } catch (error) {
        console.error('OCR init failed:', error);
        setStatus('⚠️ OCR Failed. Using fallback.');
      }
    };
    initOCR();
  }, []);

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatus('🔍 Scanning...');

    try {
      if (ocrEngine) {
        const [result] = await ocrEngine.predict(file);
        const extractedText = result.items.map((item: any) => item.text).join(' ');
        onTextExtracted(extractedText);
        speakText(`Scanned: ${extractedText.substring(0, 60)}...`);
        setStatus('✅ Scan complete!');
      } else {
        // Fallback: use hardcoded text
        const fallbackText = 'Paracetamol 500mg. Take one tablet every 6 hours. Store below 30°C.';
        onTextExtracted(fallbackText);
        speakText('Using fallback text.');
        setStatus('⚠️ Using fallback text.');
      }
    } catch (error) {
      console.error('OCR failed:', error);
      setStatus('❌ Scan failed. Try again.');
    } finally {
      setIsLoading(false);
      // Reset input so same file can be re-selected
      event.target.value = '';
    }
  };

  return (
    <div className="ocr-component w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
        id="camera-input"
        aria-label="Open camera to scan text"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full text-2xl py-6 rounded-2xl bg-yellow-400 text-black font-bold border-2 border-yellow-500 hover:bg-yellow-300 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? '⏳ Scanning...' : '📸 Open Camera'}
      </button>
      <p className="text-sm text-yellow-500 mt-2 text-center font-semibold">{status}</p>
    </div>
  );
}
