import React, { useState, useEffect, useRef } from 'react';
import { OCRComponent } from './components/OCRComponent';
import { parseCommand, generateResponse } from './utils/commandProcessor';
import { saveItem, getAllItems, deleteItem, clearAllItems, SavedItem } from './utils/storage';
import { executeCommand } from './utils/accessibilityService';
import { FaceTracker } from './components/FaceTracker';

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
  const recognitionRef = useRef<any>(null);

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

  // --- Render ---
  return (
    <div className="app-container min-h-screen bg-black text-yellow-400 p-4 font-sans">
      {/* Header */}
      <header className="text-center py-4">
        <h1 className="text-4xl font-bold">🤝 Sahayak</h1>
        <p className="text-gray-400 text-sm">Offline Accessibility Assistant</p>
      </header>

      {/* Mode Selector */}
      <div className="mode-selector grid grid-cols-3 gap-2 mb-4">
        {['voice', 'switch', 'face', 'eye', 'hybrid'].map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode)}
            className={`mode-btn p-3 rounded-xl text-sm font-bold transition-all ${
              currentMode === mode 
                ? 'bg-yellow-400 text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
      <div className="card bg-gray-900 rounded-2xl p-4 border border-yellow-600 mb-4">
        <h2 className="text-xl font-bold mb-2 text-white">📷 Scan Text</h2>
        <OCRComponent 
          onTextExtracted={handleTextExtracted} 
          speakText={speakText}
        />
        {ocrText && (
          <div className="mt-3 p-3 bg-black rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">📄 Scanned:</p>
            <p className="text-white">{ocrText}</p>
          </div>
        )}
      </div>

      {/* Face Tracker */}
      <div className="mb-4">
         <FaceTracker 
            isActive={currentMode === 'face' || currentMode === 'hybrid'} 
            onGesture={handleFaceGesture} 
         />
      </div>

      {/* Voice Control */}
      <div className="card bg-gray-900 rounded-2xl p-4 border border-yellow-600 mb-4">
        <h2 className="text-xl font-bold mb-2 text-white">🎤 Speak Command</h2>
        <button
          onClick={startListening}
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl text-2xl font-bold transition-colors ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-yellow-400 text-black hover:bg-yellow-300'
          }`}
        >
          {isListening ? '⏳ Listening...' : isLoading ? '🔄 Processing...' : '🎙️ Tap & Speak'}
        </button>
        {voiceCommand && (
          <div className="mt-3 p-3 bg-black rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">🗣️ You said:</p>
            <p className="text-white">{voiceCommand}</p>
          </div>
        )}
        {aiResponse && (
          <div className="mt-3 p-4 bg-green-900/30 rounded-lg border border-green-500">
            <p className="text-sm text-green-400">🤖 Assistant:</p>
            <p className="text-white text-lg">{aiResponse}</p>
            <button
              onClick={() => speakText(aiResponse)}
              className="mt-2 text-sm text-yellow-400 hover:text-yellow-300"
            >
              🔊 Listen Again
            </button>
          </div>
        )}
      </div>

      {/* Execution Logs */}
      {executionLogs.length > 0 && (
        <div className="card bg-gray-900 rounded-2xl p-4 border border-blue-600 mb-4">
          <h2 className="text-xl font-bold text-blue-400 mb-2">📋 Execution Logs</h2>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {executionLogs.map((log, i) => (
              <p key={i} className="text-sm text-gray-300">{log}</p>
            ))}
          </div>
        </div>
      )}

      {/* Saved Items */}
      <div className="card bg-gray-900 rounded-2xl p-4 border border-gray-600">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">💾 Saved Items</h2>
          {savedItems.length > 0 && (
            <button
              onClick={async () => {
                await clearAllItems();
                await loadItems();
              }}
              className="text-red-400 text-sm hover:text-red-300 font-bold"
            >
              Clear All
            </button>
          )}
        </div>
        {savedItems.length === 0 ? (
          <p className="text-gray-500 text-sm">No saved items yet.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-3 bg-black rounded-lg border border-gray-800">
                <div className="flex-1 mr-2">
                  <p className="text-white text-sm break-words">{item.content}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await deleteItem(item.id!);
                    await loadItems();
                  }}
                  className="text-red-500 text-lg hover:text-red-400 bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center"
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
      <footer className="text-center text-gray-500 text-xs mt-6 pb-6">
        Offline • WCAG Compliant • No Typing Required
      </footer>
    </div>
  );
}

export default App;
