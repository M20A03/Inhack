import { useEffect } from 'react';
import { Mic, MicOff, Command } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceComponentProps {
  onCommandParsed: (transcript: string) => void;
}

export function VoiceComponent({ onCommandParsed }: VoiceComponentProps) {
  const { isListening, transcript, error, startListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onCommandParsed(transcript);
    }
  }, [transcript, isListening, onCommandParsed]);

  return (
    <div className="flex flex-col gap-4 w-full bg-black border border-yellow-500 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
          <Command className="text-yellow-400" />
          Voice Control
        </h2>
      </div>

      <p className="text-sm text-yellow-300 mb-4">
        Try saying: "Open WhatsApp", "Go back", or "Read screen".
      </p>

      <button
        onClick={startListening}
        disabled={isListening}
        className={`w-full py-8 flex items-center justify-center gap-4 rounded-xl font-bold text-2xl shadow-lg transition-all transform ${
          isListening 
            ? 'bg-zinc-900 text-red-500 border border-red-500 scale-95'
            : 'bg-yellow-400 text-black hover:bg-yellow-300'
        }`}
        aria-label={isListening ? "Listening... Please speak your command." : "Tap to activate voice control"}
      >
        {isListening ? (
          <>
            <MicOff size={36} className="animate-pulse" />
            Listening...
          </>
        ) : (
          <>
            <Mic size={36} />
            Start Voice Command
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-500 text-sm text-center mt-2 font-bold p-2 bg-red-950/20 rounded border border-red-500" role="alert">
          {error}
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-4 bg-zinc-900 rounded-lg border border-yellow-500/30">
          <span className="text-xs text-yellow-500 uppercase font-bold tracking-wider">Heard:</span>
          <p className="text-lg italic mt-1 text-yellow-300">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}
