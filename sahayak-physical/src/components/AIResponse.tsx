import { Volume2 } from 'lucide-react';
import { speakText } from '../hooks/useSpeechRecognition';

interface AIResponseProps {
  message?: string;
  action?: string;
}

export function AIResponse({ message, action }: AIResponseProps) {
  if (!message) return null;

  return (
    <div className="flex flex-col gap-4 w-full bg-black border border-yellow-500 rounded-2xl p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-yellow-400">🤖 Sahayak AI Response</h2>
        {action && (
          <span className="text-xs bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full font-bold uppercase font-mono">
            {action}
          </span>
        )}
      </div>

      <p className="text-lg text-yellow-300 font-semibold leading-relaxed">
        {message}
      </p>

      <button
        onClick={() => speakText(message)}
        className="w-full py-4 mt-2 bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors"
      >
        <Volume2 size={20} /> Speak Response
      </button>
    </div>
  );
}
