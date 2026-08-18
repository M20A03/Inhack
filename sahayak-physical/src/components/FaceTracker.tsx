import { useEffect, useRef } from 'react';
import { useFaceTracking } from '../hooks/useFaceTracking';

interface FaceTrackerProps {
  onGesture: (gesture: string) => void;
  isActive: boolean;
}

export function FaceTracker({ onGesture, isActive }: FaceTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, gestures, startCamera, stopCamera } = useFaceTracking(isActive);
  const lastGestureTime = useRef<number>(0);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startCamera(videoRef.current);
    } else {
      stopCamera();
    }
  }, [isActive, startCamera, stopCamera]);

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

  return (
    <div className="flex flex-col items-center p-5 bg-black shadow-sm rounded-2xl border border-yellow-500">
      <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
        <span>👤</span> Face Tracker Active
      </h3>
      <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-400 shadow-md">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          className="w-full h-full object-cover transform -scale-x-100"
        ></video>
      </div>
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
