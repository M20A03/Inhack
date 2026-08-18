import React, { useEffect } from 'react';
import { Mic, MicOff, Command } from 'lucide-react';
import { useSpeechRecognition, speakText } from '../hooks/useSpeechRecognition';

interface VoiceControlProps {
  onCommandParsed: (transcript: string) => void;
}

export function VoiceControl({ onCommandParsed }: VoiceControlProps) {
  const { isListening, transcript, error, startListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onCommandParsed(transcript);
    }
  }, [transcript, isListening, onCommandParsed]);

  return (
    <div className="flex flex-col gap-4 w-full glass-panel rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Command className="text-accent" />
          Voice Control
        </h2>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Try saying: "Open WhatsApp", "Go back", or "Read screen".
      </p>

      <button
        onClick={startListening}
        disabled={isListening}
        className={`w-full py-8 flex items-center justify-center gap-4 rounded-xl font-bold text-2xl shadow-lg transition-all transform ${
          isListening 
            ? 'bg-red-600 text-white scale-95'
            : 'bg-accent text-accent-fg hover:bg-yellow-400'
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
        <div className="text-red-400 text-sm text-center mt-2 font-bold p-2 bg-red-900/20 rounded" role="alert">
          {error}
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-4 bg-black/50 rounded-lg border border-gray-800">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Heard:</span>
          <p className="text-lg italic mt-1 text-gray-300">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}
