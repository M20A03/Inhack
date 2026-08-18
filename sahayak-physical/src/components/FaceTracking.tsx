import { useState } from 'react';
import { ScanFace, Settings2, MousePointerClick, Activity } from 'lucide-react';

export function FaceTracking() {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const toggleTracking = () => {
    if (!isActive) {
      setIsCalibrating(true);
      // Simulate calibration time
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
          <ScanFace className="text-accent" />
          Face Tracking (Mock)
        </h2>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Move your head to control the cursor. Smile to click. Raise eyebrows to right-click.
      </p>

      {/* Simulated Camera Feed Area */}
      <div className="w-full aspect-video bg-black rounded-lg border border-gray-700 relative overflow-hidden flex items-center justify-center">
        {isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: 'linear-gradient(#FFD700 1px, transparent 1px), linear-gradient(90deg, #FFD700 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            {/* Simulated Face Mesh Box */}
            <div className="w-32 h-40 border-2 border-accent rounded-full border-dashed animate-pulse flex items-center justify-center">
               <ScanFace size={64} className="text-accent opacity-50" />
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-2 rounded backdrop-blur flex justify-between items-center">
               <span className="text-xs font-mono text-accent">TRACKING ACTIVE</span>
               <div className="flex gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               </div>
            </div>
          </div>
        ) : isCalibrating ? (
          <div className="text-center">
            <Activity className="animate-spin text-accent mx-auto mb-2" size={32} />
            <p className="text-sm text-accent font-bold">Calibrating FaceMesh...</p>
            <p className="text-xs text-gray-400 mt-1">Please look straight ahead</p>
          </div>
        ) : (
          <div className="text-gray-600 text-center">
            <ScanFace size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">Camera Offline</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
         <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-2 border border-gray-800">
           <MousePointerClick size={16} className="text-gray-400" />
           <div className="text-xs">
             <span className="block text-gray-500">Left Click</span>
             <span className="font-bold">Smile</span>
           </div>
         </div>
         <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-2 border border-gray-800">
           <Settings2 size={16} className="text-gray-400" />
           <div className="text-xs">
             <span className="block text-gray-500">Scroll</span>
             <span className="font-bold">Open Mouth</span>
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
        {isActive ? 'Stop Tracking' : 'Start Face Tracking'}
      </button>
    </div>
  );
}
