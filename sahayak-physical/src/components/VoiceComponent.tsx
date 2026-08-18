import { useEffect } from 'react';
import { Mic, MicOff, Command } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceComponentProps {
  onCommandParsed: (transcript: string) => void;
}

export function VoiceComponent({ onCommandParsed }: VoiceComponentProps) {
  const { isListening, transcript, error, startListening, stopListening, clearTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      const commandToRun = transcript;
      clearTranscript();
      onCommandParsed(commandToRun);
    }
  }, [transcript, isListening, onCommandParsed, clearTranscript]);

  return (
    <div className="flex flex-col gap-4 w-full bg-surface-dark border border-emerald-900/30 rounded-3xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary font-display">
          <Command className="text-primary" />
          Voice Control
        </h2>
      </div>

      <p className="text-sm text-on-surface-variant mb-2">
        Try saying: <span className="font-semibold text-primary">"Open WhatsApp"</span>, <span className="font-semibold text-primary">"Go back"</span>, or <span className="font-semibold text-primary">"Read screen"</span>.
      </p>

      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full py-7 flex items-center justify-center gap-4 rounded-2xl font-bold text-xl shadow-md transition-all active:scale-98 ${
          isListening 
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 animate-pulse'
            : 'bg-primary hover:bg-primary-container text-on-primary shadow-emerald-900/20'
        }`}
        aria-label={isListening ? "Listening... Tap to stop" : "Tap to activate voice control"}
      >
        {isListening ? (
          <>
            <MicOff size={32} />
            Listening... (Tap to Stop)
          </>
        ) : (
          <>
            <Mic size={32} />
            Start Voice Command
          </>
        )}
      </button>

      {error && (
        <div className="text-rose-400 text-xs text-center font-semibold p-3 bg-rose-950/40 rounded-2xl border border-rose-900/50" role="alert">
          {error}
        </div>
      )}

      {/* Quick Action Command Launcher */}
      <div className="mt-2 flex flex-col gap-2 bg-deep-forest/40 p-4 rounded-2xl border border-emerald-900/20">
        <span className="text-xs text-accent-gold font-bold uppercase tracking-wider">⚡ 1-Tap Quick App Launcher</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onCommandParsed('open whatsapp')}
            className="py-2.5 px-3 bg-surface-dark hover:bg-deep-forest/60 text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={() => onCommandParsed('open youtube')}
            className="py-2.5 px-3 bg-surface-dark hover:bg-deep-forest/60 text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            ▶️ YouTube
          </button>
          <button
            onClick={() => onCommandParsed('open spotify')}
            className="py-2.5 px-3 bg-surface-dark hover:bg-deep-forest/60 text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            🎵 Spotify
          </button>
          <button
            onClick={() => onCommandParsed('open maps')}
            className="py-2.5 px-3 bg-surface-dark hover:bg-deep-forest/60 text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            🗺️ Maps
          </button>
          <button
            onClick={() => onCommandParsed('open phone')}
            className="py-2.5 px-3 bg-surface-dark hover:bg-deep-forest/60 text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            📞 Phone
          </button>
          <button
            onClick={() => onCommandParsed('open settings')}
            className="py-2.5 px-3 bg-surface-dark hover:bg-deep-forest/60 text-primary border border-emerald-900/30 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {transcript && (
        <div className="mt-2 p-4 bg-deep-forest/40 rounded-2xl border border-emerald-900/20">
          <span className="text-xs text-primary uppercase font-bold tracking-wider">Heard:</span>
          <p className="text-base font-medium mt-1 text-on-surface">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}


