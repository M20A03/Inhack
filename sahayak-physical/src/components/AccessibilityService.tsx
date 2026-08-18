import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldAlert, CheckCircle, Terminal } from 'lucide-react';
import { mockAccessibilityServiceStatus, toggleAccessibilityService } from '../utils/accessibility';
import { AIResponse } from '../utils/localAI';
import { saveItem } from '../utils/storage';

interface AccessibilityServiceProps {
  latestCommand?: AIResponse | null;
  onLogSave?: () => void;
}

export function AccessibilityService({ latestCommand, onLogSave }: AccessibilityServiceProps) {
  const [isEnabled, setIsEnabled] = useState(mockAccessibilityServiceStatus());
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    toggleAccessibilityService(newState);
    if (newState) {
      setLogs(['Service bound to com.sahayak.AccessibilityService', 'Waiting for commands...']);
    } else {
      setLogs([]);
    }
  };

  useEffect(() => {
    if (latestCommand && isEnabled && latestCommand.logs && latestCommand.logs.length > 0) {
      executeSimulatedLogs(latestCommand.logs);
    }
  }, [latestCommand, isEnabled]);

  const executeSimulatedLogs = async (commandLogs: string[]) => {
    setIsExecuting(true);
    setLogs([]); // Clear previous specific execution
    
    for (let i = 0; i < commandLogs.length; i++) {
      setLogs(prev => [...prev, `> ${commandLogs[i]}`]);
      // Simulate delay between accessibility node traversals/actions
      await new Promise(r => setTimeout(r, 600)); 
    }
    
    setLogs(prev => [...prev, '> ✅ Execution Complete.']);
    setIsExecuting(false);
    
    // Save to offline storage automatically
    if (latestCommand?.response) {
      await saveItem(latestCommand.response, 'voice_command');
      if (onLogSave) onLogSave();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full glass-panel rounded-2xl p-6 border-blue-900/50 mt-4">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Smartphone className={isEnabled ? "text-blue-400" : "text-gray-600"} size={40} />
          <ShieldAlert className="absolute -bottom-2 -right-2 text-accent" size={20} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold flex items-center justify-between">
            Universal App Control
            {isEnabled && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
          </h2>
          <p className="text-sm text-gray-400 mt-1 leading-snug">
            Grants Sahayak permission to read screens and simulate touches inside <b>ANY</b> installed app hands-free.
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 ${
          isEnabled ? 'bg-blue-900/50 text-blue-300 border border-blue-800' : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
      >
        {isEnabled ? (
          <>
            <CheckCircle size={20} />
            Accessibility Service Active
          </>
        ) : (
          'Enable Android Service (Mock)'
        )}
      </button>

      {isEnabled && (
        <div className="mt-2 bg-black border border-gray-800 rounded-lg p-3 font-mono text-xs text-green-400 overflow-hidden relative">
           <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-gray-800 pb-2">
             <Terminal size={14} />
             <span>Accessibility Node Dispatcher</span>
             {isExecuting && <Activity size={14} className="ml-auto text-accent animate-spin" />}
           </div>
           
           <div className="flex flex-col gap-1 min-h-[100px] max-h-[200px] overflow-y-auto pb-4">
              {logs.length === 0 && <span className="text-gray-600">Awaiting commands... Say something like "Open WhatsApp".</span>}
              {logs.map((log, i) => (
                <div key={i} className="animate-fade-in">{log}</div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
