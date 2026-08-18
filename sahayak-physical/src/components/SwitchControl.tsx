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
    <div className="flex flex-col gap-4 w-full bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <ToggleRight className="text-blue-600" />
          Switch Control
        </h2>
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
          <Bluetooth size={14} className={isScanning ? 'text-blue-500' : 'text-gray-400'} />
          {isScanning ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <p className="text-sm text-gray-500 font-medium">
        Press <kbd className="bg-gray-100 border border-gray-200 px-1 rounded text-gray-700">Space</kbd> or <kbd className="bg-gray-100 border border-gray-200 px-1 rounded text-gray-700">Enter</kbd> (or external Bluetooth switch) to select the highlighted action.
      </p>

      {/* Real Commands Area showing Scanning */}
      <div className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 mt-2 mb-2 shadow-inner">
        <div className="grid grid-cols-2 gap-3">
          {COMMANDS.map(item => (
            <div 
              key={item.id}
              className={`p-4 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2 ${
                isScanning && activeItem === item.id 
                  ? 'bg-blue-100 text-blue-700 border-blue-500 scale-105 shadow-md ring-2 ring-blue-300 ring-offset-1' 
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-3 border border-gray-200 text-sm mt-2">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="text-gray-500 font-medium">Scan Speed</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">1.5s</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Switch Input</span>
          <span className="font-bold text-gray-700">Space / Enter</span>
        </div>
      </div>

      <button
        onClick={() => setIsScanning(!isScanning)}
        className={`w-full py-4 mt-4 rounded-xl font-bold text-lg shadow-sm transition-all border ${
          isScanning 
            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
        }`}
      >
        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>
    </div>
  );
}
