import { Volume2 } from 'lucide-react';
import { speakText } from '../hooks/useSpeechRecognition';

interface AIResponseProps {
  message?: string;
  action?: string;
}

export function AIResponse({ message, action }: AIResponseProps) {
  if (!message) return null;

  return (
    <div className="flex flex-col gap-4 w-full bg-surface-dark border border-emerald-900/30 rounded-3xl p-6 shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary font-display">🤖 Sahayak AI Response</h2>
        {action && (
          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {action}
          </span>
        )}
      </div>

      <p className="text-base text-on-surface font-semibold leading-relaxed bg-deep-forest/40 p-4 rounded-2xl border border-emerald-900/20">
        {message}
      </p>

      <button
        onClick={() => speakText(message)}
        className="w-full py-4 bg-primary hover:bg-primary-container text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md"
      >
        <Volume2 size={20} /> Speak Response
      </button>
    </div>
  );
}

