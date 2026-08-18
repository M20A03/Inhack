import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceComponentProps {
  onCommand: (transcript: string) => void;
}

export function VoiceComponent({ onCommand }: VoiceComponentProps) {
  const { isListening, transcript, error, startListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onCommand(transcript);
    }
  }, [transcript, isListening, onCommand]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`w-full py-6 flex items-center justify-center gap-3 rounded-xl font-bold text-xl shadow-lg transition-colors ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
        aria-label={isListening ? "Listening..." : "Tap to speak a command"}
      >
        {isListening ? (
          <>
            <MicOff size={32} />
            Listening...
          </>
        ) : (
          <>
            <Mic size={32} />
            Voice Command
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-400 text-sm text-center" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
