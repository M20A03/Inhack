import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';

// Firebase
import { auth, signOut } from './utils/firebase';

// Components
import { AuthComponent } from './components/AuthComponent';
import { ModeSelector, ControlMode } from './components/ModeSelector';
import { ScanComponent } from './components/ScanComponent';
import { FaceTracker } from './components/FaceTracker';
import { EyeTracking } from './components/EyeTracking';
import { SwitchControl } from './components/SwitchControl';
import { VoiceComponent } from './components/VoiceComponent';
import { AIResponse as AIResponseView } from './components/AIResponse';
import { SpotifyControls } from './components/SpotifyControls';
import { AccessibilityServiceDemo } from './components/AccessibilityServiceDemo';
import { SavedItems } from './components/SavedItems';
import { InstallButton } from './components/InstallButton';
import { HelpDesk } from './components/HelpDesk';

// Hooks
import { useLocalAI } from './hooks/useLocalAI';
import { speakText } from './hooks/useSpeechRecognition';

// Utils
import { AIResponse as LocalAIResponse } from './utils/localAI';

function App() {
  const [currentMode, setCurrentMode] = useState<ControlMode>('voice');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // History refresh trigger
  const [refreshHistory, setRefreshHistory] = useState(0);

  // Command & AI Response State
  const { processVoiceCommand } = useLocalAI();
  const [latestCommand, setLatestCommand] = useState<LocalAIResponse | null>(null);
  const [ocrText, setOcrText] = useState('');

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Dynamic Body Classes based on mode ---
  useEffect(() => {
    document.body.className = ''; // Reset
    if (currentMode === 'eye') {
      document.body.classList.add('mode-visual');
    } else if (currentMode === 'switch') {
      document.body.classList.add('mode-motor');
    } else if (currentMode === 'voice') {
      document.body.classList.add('mode-cognitive');
    }
  }, [currentMode]);

  // --- OCR Text Extracted ---
  const handleTextExtracted = (text: string) => {
    setOcrText(text);
  };

  // --- Process Voice / Switch / Eye Command ---
  const handleCommand = async (transcript: string) => {
    const result = await processVoiceCommand(transcript, ocrText);
    setLatestCommand(result);
    setRefreshHistory(prev => prev + 1);
    
    // Auto read response
    if (result && result.response) {
      speakText(result.response);
    }
  };

  // --- Face Tracker handler ---
  const handleFaceGesture = (gesture: string) => {
    let commandStr = '';
    switch (gesture) {
      case 'OPEN_MOUTH':
        commandStr = 'scroll down';
        break;
      case 'BLINK_LEFT':
        commandStr = 'go back';
        break;
      case 'BLINK_RIGHT':
        commandStr = 'go home';
        break;
      case 'SMILE':
        commandStr = 'click 1';
        break;
      case 'EYEBROWS_RAISED':
        commandStr = 'help';
        break;
      default:
        return;
    }
    
    speakText(`Gesture detected: ${commandStr}`);
    handleCommand(commandStr);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
        <p className="text-xl font-bold animate-pulse">Loading Sahayak...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent />;
  }

  return (
    <div className="app-container min-h-screen bg-black text-yellow-400 p-4 font-sans max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-yellow-500/20 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <span className="text-4xl">🤝</span> Sahayak
          </h1>
          <p className="text-yellow-300 text-sm font-medium mt-1">Hands-Free Accessibility Engine</p>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 px-4 py-3 bg-zinc-950 text-yellow-400 rounded-xl border border-yellow-500/30 hover:bg-zinc-900 transition-colors text-sm font-bold"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </header>

      {/* Control Mode Selection */}
      <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />

      {/* Main Grid Layout */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Input Modes */}
        <div className="flex flex-col gap-6">
          {/* Scan Camera Input */}
          <ScanComponent onTextExtracted={handleTextExtracted} />

          {/* Voice Command Input */}
          {(currentMode === 'voice' || currentMode === 'hybrid') && (
            <VoiceComponent onCommandParsed={handleCommand} />
          )}

          {/* Face Tracker */}
          <FaceTracker 
            isActive={currentMode === 'face' || currentMode === 'hybrid'} 
            onGesture={handleFaceGesture} 
          />

          {/* Eye Tracker */}
          <EyeTracking 
            isActive={currentMode === 'eye' || currentMode === 'hybrid'} 
            onCommand={handleCommand} 
          />

          {/* Switch Control */}
          <SwitchControl 
            isActive={currentMode === 'switch' || currentMode === 'hybrid'} 
            onCommand={handleCommand}
          />
        </div>

        {/* Right Column: AI Response, Music, Community, Accessibility Logs */}
        <div className="flex flex-col gap-6">
          {/* AI Response Box */}
          {latestCommand && (
            <AIResponseView 
              message={latestCommand.response} 
              action={latestCommand.type} 
            />
          )}

          {/* Accessibility Service Logs */}
          <AccessibilityServiceDemo 
            latestCommand={latestCommand} 
            onLogSave={() => setRefreshHistory(prev => prev + 1)} 
          />

          {/* Spotify Playback Controls */}
          <SpotifyControls />

          {/* Q&A Help Desk */}
          <HelpDesk />
          
          {/* Saved History */}
          <SavedItems refreshTrigger={refreshHistory} />
        </div>
      </main>

      {/* PWA Floating Install Button */}
      <InstallButton />

      {/* Footer */}
      <footer className="text-center mt-8 pb-8 flex flex-col items-center gap-2 border-t border-yellow-500/20 pt-4">
        <div className="flex items-center gap-3 text-sm font-bold text-yellow-500/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Offline Mode
          </span>
          <span>•</span>
          <span>WCAG AAA Compliant</span>
          <span>•</span>
          <span>Zero Touch</span>
        </div>
        <p className="text-xs text-yellow-600 font-medium">Sahayak Project • Accessible by Design</p>
      </footer>
    </div>
  );
}

export default App;
