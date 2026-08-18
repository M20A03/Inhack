import { useState, useCallback, useRef, useEffect } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // cleanup
        }
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Speech stop warning:', e);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');

    if (!SpeechRecognitionAPI) {
      setError('Speech Recognition API is not supported on this browser. Use 1-Tap Quick Launcher below!');
      return;
    }

    // Safely abort any prior active recognition session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          stream.getTracks().forEach(track => track.stop());
        }).catch(err => {
          console.warn('Mic permission check:', err);
        });
      }
    } catch (err) {
      console.warn('getUserMedia check:', err);
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        const current = event.resultIndex;
        const t = event.results[current][0].transcript;
        if (t) {
          setTranscript(t.trim());
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Grant mic access in Android App Settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech heard. Hold phone closer & speak clearly.');
      } else if (event.error !== 'aborted') {
        setError(`Speech error: ${event.error}. Use 1-Tap Quick Launcher buttons below.`);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Speech recognition start failed:', e);
      setError('Mic busy. Try again in 1 second.');
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [SpeechRecognitionAPI]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return { isListening, transcript, error, startListening, stopListening, clearTranscript };
}

export function speakText(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; 
    window.speechSynthesis.speak(utterance);
  }
}

