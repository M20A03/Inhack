import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface FaceTrackerProps {
  onGesture: (gesture: string) => void;
  isActive: boolean;
}

export function FaceTracker({ onGesture, isActive }: FaceTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const lastGestureTime = useRef<number>(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    let active = true;
    const initializeTracker = async () => {
      try {
        setStatus('Loading Face Model...');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });
        if (active) {
          setFaceLandmarker(landmarker);
          setStatus('Ready');
        }
      } catch (err) {
        console.error(err);
        if (active) setStatus('Error loading model');
      }
    };
    initializeTracker();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isActive || !faceLandmarker) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let videoElement = videoRef.current;
    if (!videoElement) return;

    const startCamera = async () => {
      try {
        setStatus('Starting camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 320, height: 240 } 
        });
        videoElement.srcObject = stream;
        
        videoElement.onloadeddata = () => {
          setStatus('Detecting Gestures...');
          predictWebcam();
        };
      } catch (err) {
        console.error(err);
        setStatus('Camera access denied');
      }
    };

    const predictWebcam = async () => {
      if (!isActive || !videoElement || !faceLandmarker) return;
      
      let startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(videoElement, startTimeMs);

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const blendshapes = results.faceBlendshapes[0].categories;
        
        // Find specific blendshapes
        const jawOpen = blendshapes.find(b => b.categoryName === 'jawOpen')?.score || 0;
        const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
        const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;

        const now = Date.now();
        // Cooldown to prevent spam (1500ms)
        if (now - lastGestureTime.current > 1500) {
          if (jawOpen > 0.4) {
            onGesture('OPEN_MOUTH');
            lastGestureTime.current = now;
          } else if (eyeBlinkLeft > 0.5 && eyeBlinkRight < 0.2) {
            onGesture('BLINK_LEFT');
            lastGestureTime.current = now;
          } else if (eyeBlinkRight > 0.5 && eyeBlinkLeft < 0.2) {
            onGesture('BLINK_RIGHT');
            lastGestureTime.current = now;
          } else if (eyeBlinkLeft > 0.5 && eyeBlinkRight > 0.5) {
             onGesture('BLINK_BOTH');
             lastGestureTime.current = now;
          }
        }
      }

      if (isActive) {
        requestRef.current = requestAnimationFrame(predictWebcam);
      }
    };

    startCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, faceLandmarker]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center p-5 bg-white shadow-sm rounded-2xl border border-gray-200">
      <h3 className="text-gray-800 font-bold mb-3 flex items-center gap-2">
        <span>👤</span> Face Tracker Active
      </h3>
      <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          className="w-full h-full object-cover transform -scale-x-100"
        ></video>
      </div>
      <p className="mt-4 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{status}</p>
      <div className="mt-4 text-xs font-medium text-gray-500 text-center space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full">
        <p>👄 <span className="text-gray-700">Open Mouth</span> = Click</p>
        <p>😉 <span className="text-gray-700">Left Wink</span> = Go Back</p>
        <p>😉 <span className="text-gray-700">Right Wink</span> = Go Home</p>
      </div>
    </div>
  );
}
