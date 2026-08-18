import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Image as ImageIcon, Sparkles } from 'lucide-react';



interface OCRComponentProps {
  onTextExtracted: (text: string) => void;
  speakText: (text: string) => void;
}

export function OCRComponent({ onTextExtracted, speakText }: OCRComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('Ready (OCR Scanner)');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-process image on HTML canvas to boost OCR accuracy for medicine strips & labels
  const preprocessImage = (imageSrc: string | File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc));
          return;
        }
        canvas.width = Math.min(img.width, 1024);
        canvas.height = Math.round((canvas.width / img.width) * img.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Enhance contrast for medicine labels
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
          const v = avg > 125 ? 255 : 0;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        resolve(typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc));
      };
      img.src = typeof imageSrc === 'string' ? imageSrc : URL.createObjectURL(imageSrc);
    });
  };

  const processOCRSource = async (source: string | File) => {
    setIsLoading(true);
    setStatus('🔍 Reading Text & Medicine Details...');
    setProgress('0%');

    try {
      const previewUrl = typeof source === 'string' ? source : URL.createObjectURL(source);
      setImagePreview(previewUrl);

      const processedSource = await preprocessImage(source);

      const result = await Tesseract.recognize(
        processedSource,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(`${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const extractedText = result.data.text.trim();
      
      if (extractedText && extractedText.length > 2) {
        onTextExtracted(extractedText);
        speakText(`Text scanned successfully: ${extractedText}`);
        setStatus('✅ Text Read Successfully!');
      } else {
        const warningText = "Could not detect clear text. Please hold camera closer under good lighting.";
        onTextExtracted(warningText);
        speakText(warningText);
        setStatus('⚠️ Low contrast. Try closer photo.');
      }
    } catch (error) {
      console.error('Tesseract OCR error:', error);
      const errText = "Camera OCR failed to read image. Please ensure photo is sharp and clear.";
      onTextExtracted(errText);
      speakText(errText);
      setStatus('❌ OCR Scan Error');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processOCRSource(file);
    if (event.target.value) {
      event.target.value = '';
    }
  };

  // Instant Sample Presets for Invigilators / Demo Testing
  const handlePresetScan = (sampleType: 'medicine' | 'doc') => {
    if (sampleType === 'medicine') {
      const sampleMedicine = "PARACETAMOL TABLETS 500mg\nBatch: B94821\nDosage: 1 Tablet every 6 hours after food.\nExpiry: 12/2027\nKeep out of reach of children.";
      setImagePreview('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60');
      onTextExtracted(sampleMedicine);
      speakText(`Medicine scanned: ${sampleMedicine}`);
      setStatus('✅ Sample Medicine Read!');
    } else {
      const sampleDoc = "SAHAYAK COMMUNITY WELFARE ACCESSIBILITY ENGINE\nProviding Hands-Free Navigation & Camera OCR for Persons with Motor & Speech Impairments.";
      setImagePreview('https://images.unsplash.com/photo-1555421689-491a97ff2040?w=500&auto=format&fit=crop&q=60');
      onTextExtracted(sampleDoc);
      speakText(`Document scanned: ${sampleDoc}`);
      setStatus('✅ Sample Document Read!');
    }
  };

  return (
    <div className="ocr-component w-full bg-surface-dark border border-emerald-900/30 p-6 rounded-3xl shadow-lg flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2 font-display">
          <Camera className="text-primary" /> Scan Text & Medicine
        </h3>
        <p className="text-xs text-on-surface-variant">
          Capture photo with camera or upload image. Text is extracted & read aloud.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="camera-input"
        aria-label="Open camera or gallery to scan text"
      />

      {/* Live Image Preview Window */}
      {imagePreview && (
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-emerald-900/20 bg-slate-900 shadow-inner">
          <img src={imagePreview} alt="Scanned Preview" className="w-full h-full object-contain" />
          <span className="absolute top-2 right-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
            Captured Photo
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.setAttribute('capture', 'environment');
              fileInputRef.current.click();
            }
          }}
          className="py-4 px-4 rounded-2xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 text-sm"
          disabled={isLoading}
        >
          <Camera size={18} />
          {isLoading ? `⏳ Reading (${progress})...` : '📸 Open Camera'}
        </button>

        <button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
            }
          }}
          className="py-4 px-4 rounded-2xl bg-deep-forest/40 border border-emerald-900/30 text-primary font-bold hover:bg-surface-dark/80 transition-all active:scale-98 shadow-xs flex items-center justify-center gap-2 text-sm"
          disabled={isLoading}
        >
          <ImageIcon size={18} />
          <span>🖼️ Choose Photo</span>
        </button>
      </div>

      {/* 1-Tap Preset Test Buttons for Demo */}
      <div className="flex flex-col gap-1.5 bg-deep-forest/40 p-3 rounded-2xl border border-emerald-900/20">
        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={12} className="text-accent-gold" /> 1-Tap Sample Scan Presets
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePresetScan('medicine')}
            className="py-2 px-3 bg-surface-dark text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs hover:bg-deep-forest/60 transition-all"
          >
            💊 Medicine Strip Sample
          </button>
          <button
            onClick={() => handlePresetScan('doc')}
            className="py-2 px-3 bg-surface-dark text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs hover:bg-deep-forest/60 transition-all"
          >
            📄 Prescription Sample
          </button>
        </div>
      </div>

      <p className="text-xs text-accent-gold text-center font-bold tracking-wide uppercase mt-0.5">
        {status}
      </p>
    </div>
  );
}


