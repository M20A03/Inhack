import { useState, useEffect } from 'react';
import { LogOut, LogIn, User as UserIcon, X } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';

// Firebase
import { auth, signOut } from './utils/firebase';

// Components
import { AuthComponent } from './components/AuthComponent';
import { ModeSelector, ControlMode } from './components/ModeSelector';
import { ScanComponent } from './components/ScanComponent';
import { VoiceComponent } from './components/VoiceComponent';
import { FaceTracker } from './components/FaceTracker';
import { AIResponse as AIResponseView } from './components/AIResponse';
import { SavedItems } from './components/SavedItems';
import { InstallButton } from './components/InstallButton';

// Hooks
import { useLocalAI } from './hooks/useLocalAI';
import { speakText } from './hooks/useSpeechRecognition';

// Utils
import { AIResponse as LocalAIResponse } from './utils/localAI';
import { executeDeepLink } from './utils/deepLinks';
import { saveItem } from './utils/storage';


function App() {
  const [currentMode, setCurrentMode] = useState<ControlMode>('voice');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
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
      if (currentUser) {
        setIsAuthOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Dynamic Body Classes based on mode ---
  useEffect(() => {
    document.body.className = '';
    if (currentMode === 'face') {
      document.body.classList.add('mode-visual');
    } else if (currentMode === 'voice') {
      document.body.classList.add('mode-cognitive');
    } else if (currentMode === 'scan') {
      document.body.classList.add('mode-visual');
    } else if (currentMode === 'hybrid') {
      document.body.classList.add('mode-motor');
    }
  }, [currentMode]);

  // --- OCR Text Extracted ---
  const handleTextExtracted = async (text: string) => {
    setOcrText(text);
    await saveItem({
      type: 'scan',
      content: `Scanned: ${text}`,
      timestamp: Date.now()
    });
    setRefreshHistory(prev => prev + 1);
  };

  // --- Process Voice / Face Gesture Command ---
  const handleCommand = async (transcript: string) => {
    const result = await processVoiceCommand(transcript, ocrText);
    setLatestCommand(result);

    // Auto read response aloud
    if (result && result.response) {
      speakText(result.response);

      // Save to IndexedDB offline history (only meaningful commands, not nav spam)
      const skipHistoryActions = ['BACK', 'HOME', 'SCROLL_DOWN', 'SCROLL_UP', 'SWIPE_LEFT', 'SWIPE_RIGHT'];
      if (!skipHistoryActions.includes(result.type)) {
        await saveItem({
          type: 'command',
          content: `Command: "${transcript}" → ${result.response}`,
          timestamp: Date.now()
        });
      }
    }

    setRefreshHistory(prev => prev + 1);

    // Execute deep link / native action for ALL command types
    if (result && result.type) {
      executeDeepLink(result.type, result.command?.target, result.command?.text || result.command?.contact);
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
    
    speakText(`Gesture: ${commandStr}`);
    handleCommand(commandStr);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-forest text-primary font-body">
        <p className="text-xl font-bold animate-pulse">Loading Sahayak...</p>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-deep-forest text-on-surface p-4 font-body max-w-4xl mx-auto flex flex-col gap-6 antialiased page-transition">
      {/* Header */}
      <header className="flex justify-between items-center bg-surface-dark border border-emerald-900/30 p-4 rounded-3xl shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Sahayak Logo" className="w-12 h-12 rounded-2xl object-cover shadow-md border border-primary/20" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-primary font-display flex items-center gap-1.5">
              sahayak
            </h1>
            <p className="text-accent-gold text-[10px] font-bold tracking-widest uppercase mt-0.5">ALWAYS HERE TO HELP</p>
          </div>
        </div>

        {/* Profile / Login */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-deep-forest/40 border border-emerald-900/30 p-2 rounded-2xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-10 h-10 rounded-full border border-primary/40" />
              ) : (
                <div className="w-10 h-10 bg-surface-dark rounded-full flex items-center justify-center border border-emerald-900/30">
                  <UserIcon className="text-primary" size={20} />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-on-surface truncate max-w-[120px]">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-on-surface-variant truncate max-w-[120px]">{user.email}</p>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-2 bg-surface-dark text-rose-400 hover:text-rose-300 rounded-xl border border-emerald-900/30 shadow-xs"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-2xl border border-primary hover:bg-primary-container transition-colors text-sm font-bold shadow-md"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-deep-forest/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-surface-dark p-6 rounded-3xl border border-emerald-900/30">
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-on-surface-variant hover:text-on-surface"
            >
              <X size={24} />
            </button>
            <AuthComponent />
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />

      {/* Main Content */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input Modes */}
        <div className="flex flex-col gap-6">
          {(currentMode === 'scan' || currentMode === 'hybrid') && (
            <ScanComponent onTextExtracted={handleTextExtracted} />
          )}

          {(currentMode === 'voice' || currentMode === 'hybrid') && (
            <VoiceComponent onCommandParsed={handleCommand} />
          )}

          {(currentMode === 'face' || currentMode === 'hybrid') && (
            <FaceTracker 
              isActive={true} 
              onGesture={handleFaceGesture} 
            />
          )}
        </div>

        {/* Right: Response + History */}
        <div className="flex flex-col gap-6">
          {latestCommand && (
            <AIResponseView 
              message={latestCommand.response} 
              action={latestCommand.type} 
            />
          )}

          <SavedItems refreshTrigger={refreshHistory} />
        </div>
      </main>

      {/* PWA Install */}
      <InstallButton />

      {/* Footer */}
      <footer className="text-center mt-8 pb-8 flex flex-col items-center gap-2 border-t border-emerald-900/20 pt-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span> Offline Mode
          </span>
          <span>•</span>
          <span>WCAG AAA</span>
          <span>•</span>
          <span>Zero Touch</span>
        </div>
        <p className="text-xs text-accent-gold font-bold uppercase tracking-wider">Sahayak • Accessibility Engine</p>
      </footer>
    </div>
  );
}

export default App;
