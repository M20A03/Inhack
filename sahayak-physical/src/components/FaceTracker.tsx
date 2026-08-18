import { useEffect, useRef } from 'react';
import { useFaceTracking, FaceGestures } from '../hooks/useFaceTracking';

interface FaceTrackerProps {
  onGesture: (gesture: string) => void;
  isActive: boolean;
}

export function FaceTracker({ onGesture, isActive }: FaceTrackerProps) {
  const { status, gestures, setGestures, setVideoRef, isMockMode } = useFaceTracking(isActive);
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
    <div className="flex flex-col items-center p-6 bg-surface-dark shadow-lg rounded-3xl border border-emerald-900/30 transition-all duration-300 w-full">
      <div className="flex justify-between items-center w-full mb-3">
        <h3 className="text-primary font-bold flex items-center gap-2 text-lg font-display">
          <span className="text-xl">👤</span> Face & Gesture Control
        </h3>
        <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/30">
          {isMockMode ? 'Interactive Triggers' : 'Camera Active'}
        </span>
      </div>

      {/* Always-Live Camera Preview */}
      <div className="relative w-full flex flex-col items-center justify-center my-2 gap-3">
        <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-primary shadow-md bg-slate-900">
          <video 
            ref={setVideoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          ></video>
          {/* Active Gesture Overlay Badge */}
          {Object.values(gestures).some(Boolean) && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-pulse">
              <span className="bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {gestures.mouthOpen ? '👄 Open Mouth' : gestures.smile ? '😊 Smile' : gestures.winkLeft ? '😉 Left Wink' : gestures.winkRight ? '😉 Right Wink' : gestures.eyebrowsRaised ? '🤨 Eyebrows Up' : 'Active'}
              </span>
            </div>
          )}
        </div>

        {/* 1-Tap Gesture Trigger Controls */}
        <div className="w-full bg-deep-forest/40 p-4 rounded-2xl border border-emerald-900/20 text-center flex flex-col gap-2.5 shadow-inner">
          <span className="text-xs text-primary font-bold uppercase tracking-wider">⚡ 1-Tap Gesture Triggers (Demo & Camera Sync)</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerMockGesture('mouthOpen')}
              className={`py-3 px-2 font-bold rounded-xl text-xs shadow-xs transition-all border ${
                gestures.mouthOpen 
                  ? 'bg-primary text-on-primary border-primary scale-105' 
                  : 'bg-surface-dark text-primary border-emerald-900/30 hover:border-primary'
              }`}
            >
              👄 Open Mouth (Scroll)
            </button>
            <button
              onClick={() => triggerMockGesture('smile')}
              className={`py-3 px-2 font-bold rounded-xl text-xs shadow-xs transition-all border ${
                gestures.smile 
                  ? 'bg-primary text-on-primary border-primary scale-105' 
                  : 'bg-surface-dark text-primary border-emerald-900/30 hover:border-primary'
              }`}
            >
              😊 Smile (Click)
            </button>
            <button
              onClick={() => triggerMockGesture('winkLeft')}
              className={`py-3 px-2 font-bold rounded-xl text-xs shadow-xs transition-all border ${
                gestures.winkLeft 
                  ? 'bg-primary text-on-primary border-primary scale-105' 
                  : 'bg-surface-dark text-primary border-emerald-900/30 hover:border-primary'
              }`}
            >
              😉 Left Wink (Back)
            </button>
            <button
              onClick={() => triggerMockGesture('winkRight')}
              className={`py-3 px-2 font-bold rounded-xl text-xs shadow-xs transition-all border ${
                gestures.winkRight 
                  ? 'bg-primary text-on-primary border-primary scale-105' 
                  : 'bg-surface-dark text-primary border-emerald-900/30 hover:border-primary'
              }`}
            >
              😉 Right Wink (Home)
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs font-semibold text-accent-gold bg-deep-forest/40 px-4 py-1.5 rounded-full border border-emerald-900/20">
        {status}
      </p>

      {/* Gesture Action Legend */}
      <div className="mt-4 text-xs font-medium text-on-surface-variant space-y-1.5 bg-deep-forest/40 p-4 rounded-2xl border border-emerald-900/20 w-full shadow-xs">
        <p className="font-bold text-on-surface text-[11px] uppercase tracking-wider mb-2 border-b border-emerald-900/20 pb-1">Gesture Commands:</p>
        <p className="flex justify-between">
          <span>👄 Open Mouth:</span>
          <span className="font-bold text-primary">Scroll Down</span>
        </p>
        <p className="flex justify-between">
          <span>😊 Smile:</span>
          <span className="font-bold text-primary">Select Item</span>
        </p>
        <p className="flex justify-between">
          <span>🤨 Eyebrows Up:</span>
          <span className="font-bold text-primary">Open Menu</span>
        </p>
        <p className="flex justify-between">
          <span>😉 Left Wink:</span>
          <span className="font-bold text-primary">Go Back</span>
        </p>
        <p className="flex justify-between">
          <span>😉 Right Wink:</span>
          <span className="font-bold text-primary">Go Home</span>
        </p>
      </div>
    </div>
  );
}


