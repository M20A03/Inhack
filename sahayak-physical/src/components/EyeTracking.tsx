import { useEffect, useRef, useState } from 'react';
import { Eye, Focus, MousePointerClick } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface EyeTrackingProps {
  isActive: boolean;
  onCommand: (cmd: string) => void;
}

export function EyeTracking({ isActive, onCommand }: EyeTrackingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const lastGestureTime = useRef<number>(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    let active = true;
    const initializeTracker = async () => {
      try {
        setStatus('Loading Eye Model...');
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
          setStatus('Detecting Blinks...');
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
        
        const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
        const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;

        const now = Date.now();
        // Cooldown 2000ms
        if (now - lastGestureTime.current > 2000) {
          // Detect strong double blink or sustained blink (both eyes > 0.6)
          if (eyeBlinkLeft > 0.6 && eyeBlinkRight > 0.6) {
             onCommand('read text'); // Default action for eye blink
             lastGestureTime.current = now;
             setStatus('Blink Detected: Reading Text!');
             setTimeout(() => { if (isActive) setStatus('Detecting Blinks...'); }, 2000);
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
  }, [isActive, faceLandmarker, onCommand]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-4 w-full bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <Eye className="text-blue-600" />
          Eye Tracking (Blink Detect)
        </h2>
      </div>

      <p className="text-sm text-gray-500 font-medium mb-4">
        Blink firmly with both eyes to trigger the "Read Text" command.
      </p>

      {/* Real Eye Tracking Area */}
      <div className="w-full aspect-video bg-gray-50 rounded-xl border border-gray-200 relative overflow-hidden flex items-center justify-center shadow-inner">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-50 blur-[2px]"
        ></video>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-12 h-12 rounded-full border-4 border-blue-500/50 animate-pulse flex items-center justify-center">
             <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-2 rounded-lg backdrop-blur shadow-sm border border-gray-100 flex justify-between items-center">
             <span className="text-xs font-mono font-bold text-blue-600 truncate mr-2">{status}</span>
             <div className="flex gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
         <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-2 border border-gray-200">
           <Focus size={16} className="text-gray-400" />
           <div className="text-xs">
             <span className="block text-gray-500 font-medium">Tracking</span>
             <span className="font-bold text-gray-700">Active</span>
           </div>
         </div>
         <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-2 border border-gray-200">
           <MousePointerClick size={16} className="text-gray-400" />
           <div className="text-xs">
             <span className="block text-gray-500 font-medium">Action</span>
             <span className="font-bold text-gray-700">Firm Blink</span>
           </div>
         </div>
      </div>
    </div>
  );
}
