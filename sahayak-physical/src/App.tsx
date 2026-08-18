import { useState, useEffect, useRef } from 'react';
import { OCRComponent } from './components/OCRComponent';
import { parseCommand, generateResponse } from './utils/commandProcessor';
import { saveItem, getAllItems, deleteItem, clearAllItems, SavedItem } from './utils/storage';
import { executeCommand } from './utils/accessibilityService';
import { FaceTracker } from './components/FaceTracker';
import { EyeTracking } from './components/EyeTracking';
import { SwitchControl } from './components/SwitchControl';
import { auth, signOut } from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Login } from './components/Login';
import { LogOut } from 'lucide-react';
// Disable standard TS error for window SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function App() {
  const [currentMode, setCurrentMode] = useState('voice');
  const [ocrText, setOcrText] = useState('');
  const [voiceCommand, setVoiceCommand] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const recognitionRef = useRef<any>(null);

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Load saved items ---
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const items = await getAllItems();
    setSavedItems(items);
  };

  // --- Speak text (TTS) ---
  const speakText = (text: string) => {
    if (!text) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  // --- Process voice command with real AI (Gemini) or local AI ---
  const processCommand = async (transcript: string) => {
    setIsLoading(true);
    setVoiceCommand(transcript);
    
    try {
      // Try Gemini first (if API key is available)
      let result = null;
      
      // Check if Gemini is available
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (geminiKey && geminiKey.length > 0) {
        try {
          const { processWithGemini } = await import('./utils/geminiService');
          result = await processWithGemini(transcript, ocrText);
          if (result && result.message) {
            setAiResponse(result.message || result.text || '');
            speakText(result.message || result.text || '');
            
            // Save to storage
            await saveItem({
              type: 'command',
              content: `${transcript} → ${result.message}`,
              timestamp: Date.now()
            });
            await loadItems();
            
            // Log execution
            setExecutionLogs([
              `🎤 Command: "${transcript}"`,
              `🤖 AI Response: ${result.message}`,
              `✅ Completed`
            ]);
            
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.log('Gemini error, falling back to local AI:', e);
        }
      }
      
      // Fallback to local AI
      const command = parseCommand(transcript);
      const response = generateResponse(command, ocrText);
      setAiResponse(response);
      speakText(response);
      
      // Save to storage
      await saveItem({
        type: 'command',
        content: `${transcript} → ${response}`,
        timestamp: Date.now()
      });
      await loadItems();
      
      // Execute command (simulate Accessibility Service)
      const execution = await executeCommand(transcript, ocrText);
      setExecutionLogs(execution.logs);
      
    } catch (error) {
      console.error('Command processing error:', error);
      setAiResponse('Sorry, I could not process that command.');
      speakText('Sorry, I could not process that command.');
    }
    
    setIsLoading(false);
  };

  // --- Voice recognition ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser. Please use Chrome on Android.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
      speakText('I didn\'t catch that. Please try again.');
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // --- Face Tracker handler ---
  const handleFaceGesture = (gesture: string) => {
    let commandStr = '';
    switch (gesture) {
      case 'OPEN_MOUTH':
        commandStr = 'click 1'; // Default action
        break;
      case 'BLINK_LEFT':
        commandStr = 'go back';
        break;
      case 'BLINK_RIGHT':
        commandStr = 'go home';
        break;
      case 'BLINK_BOTH':
        commandStr = 'scroll down';
        break;
      default:
        return;
    }
    
    // Play a small sound or give TTS feedback so user knows it worked
    speakText(`Gesture detected: ${commandStr}`);
    processCommand(commandStr);
  };

  // --- OCR handler ---
  const handleTextExtracted = async (text: string) => {
    setOcrText(text);
    await saveItem({
      type: 'scan',
      content: text,
      timestamp: Date.now()
    });
    await loadItems();
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!user) {
    return <Login />;
  }

  // --- Render ---
  return (
    <div className="app-container min-h-screen bg-gray-50 text-gray-900 p-4 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight flex items-center gap-2">
            <span className="text-4xl">🤝</span> Sahayak
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Offline Accessibility Assistant</p>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Mode Selector */}
      <div className="mode-selector grid grid-cols-3 gap-3 mb-6">
        {['voice', 'switch', 'face', 'eye', 'hybrid'].map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode)}
            className={`mode-btn p-3 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              currentMode === mode 
                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 ring-offset-1' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {mode === 'voice' && '🎤 Voice'}
            {mode === 'switch' && '🔘 Switch'}
            {mode === 'face' && '👤 Face'}
            {mode === 'eye' && '👁️ Eye'}
            {mode === 'hybrid' && '🔀 Hybrid'}
          </button>
        ))}
      </div>

      {/* OCR Component */}
      <div className="card bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-5">
        <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
          <span>📷</span> Scan Text
        </h2>
        <OCRComponent 
          onTextExtracted={handleTextExtracted} 
          speakText={speakText}
        />
        {ocrText && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Scanned Result</p>
            <p className="text-gray-800 font-medium">{ocrText}</p>
          </div>
        )}
      </div>

      {/* Face Tracker */}
      <div className="mb-5">
         <FaceTracker 
            isActive={currentMode === 'face' || currentMode === 'hybrid'} 
            onGesture={handleFaceGesture} 
         />
      </div>

      {/* Eye Tracker */}
      <div className="mb-5">
         <EyeTracking 
            isActive={currentMode === 'eye' || currentMode === 'hybrid'} 
            onCommand={processCommand} 
         />
      </div>

      {/* Switch Control */}
      <div className="mb-5">
         <SwitchControl 
            isActive={currentMode === 'switch' || currentMode === 'hybrid'} 
            onCommand={processCommand}
         />
      </div>

      {/* Voice Control */}
      <div className="card bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-5">
        <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
          <span>🎤</span> Speak Command
        </h2>
        <button
          onClick={startListening}
          disabled={isLoading || (currentMode !== 'voice' && currentMode !== 'hybrid')}
          className={`w-full py-4 rounded-xl text-xl font-bold transition-all shadow-sm border ${
            currentMode !== 'voice' && currentMode !== 'hybrid'
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : isListening 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
          }`}
        >
          {isListening ? '⏳ Listening...' : isLoading ? '🔄 Processing...' : '🎙️ Tap & Speak'}
        </button>
        
        {voiceCommand && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">You said</p>
            <p className="text-gray-800 font-medium">{voiceCommand}</p>
          </div>
        )}
        
        {aiResponse && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Assistant</p>
            <p className="text-blue-900 font-medium text-lg">{aiResponse}</p>
            <button
              onClick={() => speakText(aiResponse)}
              className="mt-3 px-3 py-1.5 bg-white text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <span>🔊</span> Listen Again
            </button>
          </div>
        )}
      </div>

      {/* Execution Logs */}
      {executionLogs.length > 0 && (
        <div className="card bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📋</span> Execution Logs
          </h2>
          <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100 font-mono text-xs">
            {executionLogs.map((log, i) => (
              <p key={i} className="text-gray-600 border-b border-gray-200 pb-1 last:border-0">{log}</p>
            ))}
          </div>
        </div>
      )}

      {/* Saved Items */}
      <div className="card bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>💾</span> Saved Items
          </h2>
          {savedItems.length > 0 && (
            <button
              onClick={async () => {
                await clearAllItems();
                await loadItems();
              }}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-100"
            >
              Clear All
            </button>
          )}
        </div>
        {savedItems.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-400 font-medium">No saved items yet.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {savedItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
                <div className="flex-1 mr-4">
                  <p className="text-gray-800 font-medium break-words leading-snug">{item.content}</p>
                  <p className="text-gray-400 text-xs mt-2 font-medium">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await deleteItem(item.id!);
                    await loadItems();
                  }}
                  className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 bg-gray-50 rounded-full transition-colors flex-shrink-0"
                  aria-label="Delete item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center mt-8 pb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Offline</span>
          <span>•</span>
          <span>WCAG Compliant</span>
          <span>•</span>
          <span>No Typing</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Sahayak Project - Accessible by Design</p>
      </footer>
    </div>
  );
}

export default App;
