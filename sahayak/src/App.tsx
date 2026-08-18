import React, { useState, useEffect } from 'react';
import { ModeSelector, AppMode } from './components/ModeSelector';
import { ScanComponent } from './components/ScanComponent';
import { VoiceComponent } from './components/VoiceComponent';
import { AIResponse } from './components/AIResponse';
import { SpotifyControls } from './components/SpotifyControls';
import { AccessibilityServiceDemo } from './components/AccessibilityServiceDemo';
import { SavedItems } from './components/SavedItems';
import { InstallButton } from './components/InstallButton';
import { processCommand } from './utils/localAI';
import { saveItem } from './utils/storage';
import { speakText } from './hooks/useSpeechRecognition';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('general');
  const [ocrText, setOcrText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [refreshSavedItems, setRefreshSavedItems] = useState(0);

  // Update body class for styling based on mode
  useEffect(() => {
    document.body.className = `mode-${currentMode}`;
    if (currentMode === 'visual') {
      speakText('Visual mode activated.');
    }
  }, [currentMode]);

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleScanComplete = (text: string) => {
    setOcrText(text);
    setAiResponse('');
  };

  const handleVoiceCommand = (transcript: string) => {
    const result = processCommand(transcript, ocrText);
    
    // Cognitive mode limits responses to bullet points / simple structures
    let finalResponse = result.response;
    if (currentMode === 'cognitive' && result.type !== 'simplify') {
      finalResponse = `• Action: ${result.type}\n• ${result.response}`;
    }
    
    setAiResponse(finalResponse);

    if (currentMode === 'visual' || currentMode === 'general') {
      speakText(finalResponse);
    }
    
    if (currentMode === 'hearing') {
      document.body.classList.add('flashing-border');
      setTimeout(() => document.body.classList.remove('flashing-border'), 2000);
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  const handleSaveTrigger = () => {
    setRefreshSavedItems(prev => prev + 1);
  };

  return (
    <div className="min-h-screen p-4 pb-24 max-w-2xl mx-auto">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-accent focus:text-black focus:z-50 rounded">
        Skip to main content
      </a>

      <header className="mb-8 mt-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-accent">Sahayak</h1>
        <p className="text-gray-400 mt-2 cognitive-hide">Your Adaptive Companion</p>
      </header>

      <main id="main-content">
        <ModeSelector currentMode={currentMode} onModeChange={handleModeChange} />
        
        <div className="flex flex-col gap-6">
          <ScanComponent onScanComplete={handleScanComplete} currentMode={currentMode} />
          
          {ocrText && (
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Scanned Text</h3>
              <p className="text-lg whitespace-pre-wrap">{ocrText}</p>
            </div>
          )}

          <div className="mt-4">
            <VoiceComponent onCommand={handleVoiceCommand} />
          </div>

          <AIResponse 
            response={aiResponse} 
            currentMode={currentMode} 
            onSave={handleSaveTrigger}
          />

          <SpotifyControls />

          <AccessibilityServiceDemo />

          <SavedItems refreshTrigger={refreshSavedItems} />
        </div>
      </main>

      <InstallButton />
    </div>
  );
}

export default App;
