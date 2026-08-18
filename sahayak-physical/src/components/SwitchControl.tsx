import { useState, useEffect } from 'react';
import { ToggleRight, Bluetooth } from 'lucide-react';

export function SwitchControl() {
  const [isActive, setIsActive] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  // Simulate scanning navigation when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setActiveItem(prev => (prev + 1) % 4);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex flex-col gap-4 w-full glass-panel rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ToggleRight className="text-accent" />
          Switch Access (Mock)
        </h2>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Bluetooth size={14} className={isActive ? 'text-blue-400' : ''} />
          {isActive ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Connect a Bluetooth switch. The system will auto-scan items. Click your switch to select.
      </p>

      {/* Simulated App Area showing Scanning */}
      <div className="w-full bg-black rounded-lg border border-gray-700 p-4 mb-2">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 0, label: 'Open Maps' },
            { id: 1, label: 'Read Messages' },
            { id: 2, label: 'Emergency Contact' },
            { id: 3, label: 'System Settings' }
          ].map(item => (
            <div 
              key={item.id}
              className={`p-4 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                isActive && activeItem === item.id 
                  ? 'item-scanning bg-gray-800 text-accent border-accent' 
                  : 'bg-gray-900 border border-gray-800 text-gray-500'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 p-3 rounded-lg flex flex-col gap-2 border border-gray-800 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Scan Speed</span>
          <span className="font-bold text-accent">1.5s</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Switch 1</span>
          <span className="font-bold">Select</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Switch 2</span>
          <span className="font-bold">Next</span>
        </div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className={`w-full py-4 mt-2 rounded-xl font-bold text-lg shadow-lg transition-all ${
          isActive 
            ? 'bg-red-900/50 text-red-400 border border-red-900 hover:bg-red-900/70'
            : 'bg-accent text-accent-fg hover:bg-yellow-400'
        }`}
      >
        {isActive ? 'Stop Scanning' : 'Connect Switch & Start'}
      </button>
    </div>
  );
}
