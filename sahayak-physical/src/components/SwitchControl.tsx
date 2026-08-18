import { useState, useEffect, useCallback } from 'react';
import { ToggleRight, Bluetooth } from 'lucide-react';

interface SwitchControlProps {
  isActive: boolean;
  onCommand: (cmd: string) => void;
}

const COMMANDS = [
  { id: 0, label: 'Read Text', command: 'read text' },
  { id: 1, label: 'Clear History', command: 'clear history' },
  { id: 2, label: 'What time is it?', command: 'what time is it' },
  { id: 3, label: 'Help', command: 'help' }
];

export function SwitchControl({ isActive, onCommand }: SwitchControlProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  // Auto-scan items
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && isScanning) {
      interval = setInterval(() => {
        setActiveItem(prev => (prev + 1) % COMMANDS.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isActive, isScanning]);

  // Handle Switch Press (Space or Enter)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || !isScanning) return;
    
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault(); // Prevent page scroll
      const selectedCommand = COMMANDS[activeItem].command;
      onCommand(selectedCommand);
    }
  }, [isActive, isScanning, activeItem, onCommand]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-4 w-full bg-black border border-yellow-500 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
          <ToggleRight className="text-yellow-400" />
          Switch Control
        </h2>
        <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-zinc-900 px-2 py-1 rounded-full border border-yellow-500/30">
          <Bluetooth size={14} className={isScanning ? 'text-yellow-400' : 'text-zinc-600'} />
          {isScanning ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <p className="text-sm text-yellow-300 font-medium">
        Press <kbd className="bg-zinc-900 border border-yellow-500/50 px-1 rounded text-yellow-400">Space</kbd> or <kbd className="bg-zinc-900 border border-yellow-500/50 px-1 rounded text-yellow-400">Enter</kbd> (or external Bluetooth switch) to select the highlighted action.
      </p>

      {/* Real Commands Area showing Scanning */}
      <div className="w-full bg-zinc-900 rounded-xl border border-yellow-500/30 p-4 mt-2 mb-2 shadow-inner">
        <div className="grid grid-cols-2 gap-3">
          {COMMANDS.map(item => (
            <div 
              key={item.id}
              className={`p-4 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2 ${
                isScanning && activeItem === item.id 
                  ? 'bg-yellow-400 text-black border-yellow-500 scale-105 shadow-md ring-2 ring-yellow-300 ring-offset-1' 
                  : 'bg-black border-yellow-500/50 text-yellow-400/70'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl flex flex-col gap-3 border border-yellow-500/30 text-sm mt-2">
        <div className="flex justify-between items-center border-b border-yellow-500/20 pb-2">
          <span className="text-yellow-500 font-medium">Scan Speed</span>
          <span className="font-bold text-black bg-yellow-400 px-2 py-0.5 rounded">1.5s</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-yellow-500 font-medium">Switch Input</span>
          <span className="font-bold text-yellow-300">Space / Enter</span>
        </div>
      </div>

      <button
        onClick={() => setIsScanning(!isScanning)}
        className={`w-full py-4 mt-4 rounded-xl font-bold text-lg shadow-sm transition-all border ${
          isScanning 
            ? 'bg-zinc-900 text-red-500 border-red-500 hover:bg-zinc-800'
            : 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-300'
        }`}
      >
        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>
    </div>
  );
}
