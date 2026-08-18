import { useState } from 'react';
import { Eye, Focus, MousePointerClick, Activity } from 'lucide-react';

export function EyeTracking() {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const toggleTracking = () => {
    if (!isActive) {
      setIsCalibrating(true);
      setTimeout(() => {
        setIsCalibrating(false);
        setIsActive(true);
      }, 2000);
    } else {
      setIsActive(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full glass-panel rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Eye className="text-accent" />
          Eye Tracking (Mock)
        </h2>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Your gaze controls the cursor. Stare at an element for 1.5s (dwell) or blink twice to click.
      </p>

      {/* Simulated Eye Tracking Area */}
      <div className="w-full aspect-video bg-black rounded-lg border border-gray-700 relative overflow-hidden flex items-center justify-center">
        {isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Gaze point indicator */}
            <div className="absolute top-[40%] left-[60%] w-12 h-12 rounded-full border-4 border-accent/50 animate-pulse flex items-center justify-center">
               <div className="w-2 h-2 bg-accent rounded-full"></div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-2 rounded backdrop-blur flex justify-between items-center">
               <span className="text-xs font-mono text-accent">GAZE LOCK: 94%</span>
               <div className="flex gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               </div>
            </div>
          </div>
        ) : isCalibrating ? (
          <div className="text-center">
            <Activity className="animate-spin text-accent mx-auto mb-2" size={32} />
            <p className="text-sm text-accent font-bold">Calibrating Gaze...</p>
            <p className="text-xs text-gray-400 mt-1">Please follow the dot on screen</p>
          </div>
        ) : (
          <div className="text-gray-600 text-center">
            <Eye size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">Scanner Offline</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
         <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-2 border border-gray-800">
           <Focus size={16} className="text-gray-400" />
           <div className="text-xs">
             <span className="block text-gray-500">Dwell Click</span>
             <span className="font-bold">Stare for 1.5s</span>
           </div>
         </div>
         <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-2 border border-gray-800">
           <MousePointerClick size={16} className="text-gray-400" />
           <div className="text-xs">
             <span className="block text-gray-500">Instant Click</span>
             <span className="font-bold">Double Blink</span>
           </div>
         </div>
      </div>

      <button
        onClick={toggleTracking}
        disabled={isCalibrating}
        className={`w-full py-4 mt-2 rounded-xl font-bold text-lg shadow-lg transition-all ${
          isActive 
            ? 'bg-red-900/50 text-red-400 border border-red-900 hover:bg-red-900/70'
            : 'bg-accent text-accent-fg hover:bg-yellow-400'
        }`}
      >
        {isActive ? 'Stop Tracking' : 'Start Eye Tracking'}
      </button>
    </div>
  );
}
