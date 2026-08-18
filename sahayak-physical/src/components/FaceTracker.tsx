import { useEffect, useRef } from 'react';
import { useFaceTracking, FaceGestures } from '../hooks/useFaceTracking';

interface FaceTrackerProps {
  onGesture: (gesture: string) => void;
  isActive: boolean;
}

export function FaceTracker({ onGesture, isActive }: FaceTrackerProps) {
  const { status, gestures, setGestures, videoRef, isMockMode } = useFaceTracking(isActive);
  const lastGestureTime = useRef<number>(0);

  // Handle detected gestures
  useEffect(() => {
    if (!isActive) return;

    const now = Date.now();
    if (now - lastGestureTime.current > 1500) {
      if (gestures.mouthOpen) {
        onGesture('OPEN_MOUTH');
        lastGestureTime.current = now;
      } else if (gestures.winkLeft) {
        onGesture('BLINK_LEFT');
        lastGestureTime.current = now;
      } else if (gestures.winkRight) {
        onGesture('BLINK_RIGHT');
        lastGestureTime.current = now;
      } else if (gestures.smile) {
        onGesture('SMILE');
        lastGestureTime.current = now;
      } else if (gestures.eyebrowsRaised) {
        onGesture('EYEBROWS_RAISED');
        lastGestureTime.current = now;
      }
    }
  }, [gestures, isActive, onGesture]);

  if (!isActive) return null;

  const triggerMockGesture = (gestureKey: keyof FaceGestures) => {
    setGestures(prev => ({ ...prev, [gestureKey]: true }));
    setTimeout(() => {
      setGestures(prev => ({ ...prev, [gestureKey]: false }));
    }, 500);
  };

  return (
    <div className="flex flex-col items-center p-5 bg-black shadow-sm rounded-2xl border border-yellow-500">
      <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
        <span>👤</span> Face Tracker {isMockMode ? '(Simulator)' : 'Active'}
      </h3>
      
      {!isMockMode ? (
        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-400 shadow-md">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="w-full h-full object-cover transform -scale-x-100"
          ></video>
        </div>
      ) : (
        <div className="w-full bg-zinc-950 p-4 rounded-xl border border-yellow-500/20 text-center mb-2 flex flex-col gap-2">
          <p className="text-xs text-yellow-500 font-bold">🖥️ WEB SCREEN SIMULATOR</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerMockGesture('mouthOpen')}
              className="py-3 bg-yellow-400 text-black font-bold rounded-lg text-xs"
            >
              👄 Open Mouth
            </button>
            <button
              onClick={() => triggerMockGesture('smile')}
              className="py-3 bg-yellow-400 text-black font-bold rounded-lg text-xs"
            >
              😊 Smile
            </button>
            <button
              onClick={() => triggerMockGesture('winkLeft')}
              className="py-3 bg-yellow-400 text-black font-bold rounded-lg text-xs"
            >
              😉 Left Wink
            </button>
            <button
              onClick={() => triggerMockGesture('winkRight')}
              className="py-3 bg-yellow-400 text-black font-bold rounded-lg text-xs"
            >
              😉 Right Wink
            </button>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm font-medium text-black bg-yellow-400 px-3 py-1 rounded-full">{status}</p>
      
      <div className="mt-4 text-xs font-medium text-yellow-300 text-center space-y-1 bg-zinc-900 p-3 rounded-xl border border-yellow-500/30 w-full">
        <p>👄 <span className="text-yellow-400">Open Mouth</span> = Scroll Down</p>
        <p>😊 <span className="text-yellow-400">Smile</span> = Click</p>
        <p>🤨 <span className="text-yellow-400">Raise Eyebrows</span> = Right Click / Menu</p>
        <p>😉 <span className="text-yellow-400">Left Wink</span> = Go Back</p>
        <p>😉 <span className="text-yellow-400">Right Wink</span> = Go Home</p>
      </div>
    </div>
  );
}
