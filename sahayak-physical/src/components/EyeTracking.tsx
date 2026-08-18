import { useEffect, useRef } from 'react';
import { Eye, Focus, MousePointerClick } from 'lucide-react';
import { useFaceTracking } from '../hooks/useFaceTracking';

interface EyeTrackingProps {
  isActive: boolean;
  onCommand: (cmd: string) => void;
}

export function EyeTracking({ isActive, onCommand }: EyeTrackingProps) {
  const { status, gestures, setGestures, videoRef, isMockMode } = useFaceTracking(isActive);
  const lastGestureTime = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const now = Date.now();
    // Detect double blink or sustained blink (both eyes closed)
    if (now - lastGestureTime.current > 2000) {
      if (gestures.blinkBoth) {
         onCommand('read text'); // Default action for eye blink
         lastGestureTime.current = now;
      }
    }
  }, [gestures, isActive, onCommand]);

  if (!isActive) return null;

  const triggerMockBlink = () => {
    setGestures(prev => ({ ...prev, blinkBoth: true }));
    setTimeout(() => {
      setGestures(prev => ({ ...prev, blinkBoth: false }));
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-black border border-yellow-500 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
          <Eye className="text-yellow-400" />
          Eye Tracking {isMockMode ? '(Simulator)' : '(Blink Detect)'}
        </h2>
      </div>

      <p className="text-sm text-yellow-300 font-medium mb-4">
        Blink firmly with both eyes to trigger the "Read Text" command.
      </p>

      {/* Real Eye Tracking Area */}
      {!isMockMode ? (
        <div className="w-full aspect-video bg-zinc-900 rounded-xl border border-yellow-500 relative overflow-hidden flex items-center justify-center shadow-inner">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-50 blur-[2px]"
          ></video>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-12 h-12 rounded-full border-4 border-yellow-500/50 animate-pulse flex items-center justify-center">
               <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-black/90 p-2 rounded-lg backdrop-blur shadow-sm border border-yellow-500/30 flex justify-between items-center">
               <span className="text-xs font-mono font-bold text-yellow-400 truncate mr-2">{status}</span>
               <div className="flex gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-zinc-950 p-4 rounded-xl border border-yellow-500/20 text-center mb-2 flex flex-col gap-2">
          <p className="text-xs text-yellow-500 font-bold">🖥️ EYE BLINK SIMULATOR</p>
          <button
            onClick={triggerMockBlink}
            className="py-4 bg-yellow-400 text-black font-bold rounded-lg text-sm w-full"
          >
            👁️ Blink Both Eyes
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-2">
         <div className="bg-zinc-900 p-3 rounded-xl flex items-center gap-2 border border-yellow-500/30">
           <Focus size={16} className="text-yellow-400" />
           <div className="text-xs">
             <span className="block text-yellow-500 font-medium">Tracking</span>
             <span className="font-bold text-yellow-300">Active</span>
           </div>
         </div>
         <div className="bg-zinc-900 p-3 rounded-xl flex items-center gap-2 border border-yellow-500/30">
           <MousePointerClick size={16} className="text-yellow-400" />
           <div className="text-xs">
             <span className="block text-yellow-500 font-medium">Action</span>
             <span className="font-bold text-yellow-300">Firm Blink</span>
           </div>
         </div>
      </div>
    </div>
  );
}
