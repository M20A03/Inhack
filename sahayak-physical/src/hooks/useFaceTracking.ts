import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface FaceGestures {
  smile: boolean;
  eyebrowsRaised: boolean;
  mouthOpen: boolean;
  winkLeft: boolean;
  winkRight: boolean;
  blinkBoth: boolean;
}

export function useFaceTracking(isActive: boolean) {
  const [status, setStatus] = useState<string>('Initializing...');
  const [gestures, setGestures] = useState<FaceGestures>({
    smile: false,
    eyebrowsRaised: false,
    mouthOpen: false,
    winkLeft: false,
    winkRight: false,
    blinkBoth: false,
  });
  
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number>();

  // Load MediaPipe FaceLandmarker model with a timeout fallback
  useEffect(() => {
    let active = true;
    const initializeTracker = async () => {
      try {
        setStatus('Loading Face Model...');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        const landmarkerPromise = FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Face Model Timeout')), 4000)
        );

        const landmarker = await Promise.race([landmarkerPromise, timeoutPromise]) as FaceLandmarker;
        if (active) {
          setFaceLandmarker(landmarker);
          setStatus('Model Ready');
        }
      } catch (err) {
        console.warn('Face model loading failed or timed out, activating simulation mode:', err);
        if (active) {
          setIsMockMode(true);
          setStatus('⚠️ Model Timed Out. Simulator Active.');
        }
      }
    };
    initializeTracker();
    return () => { active = false; };
  }, []);

  // Manage camera and predictions inside the hook
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!isActive || !videoElement) {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    if (isMockMode) {
      // In mock mode we don't start the webcam, the UI will present buttons
      return;
    }

    if (!faceLandmarker) return;

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setStatus('Starting camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 320, height: 240 } 
        });
        activeStream = stream;
        videoElement.srcObject = stream;
        videoElement.play();
        
        videoElement.onloadeddata = () => {
          setStatus('Detecting gestures...');
          predictWebcam();
        };
      } catch (err) {
        console.error(err);
        setIsMockMode(true);
        setStatus('⚠️ Camera blocked. Simulator Active.');
      }
    };

    const predictWebcam = () => {
      if (!isActive || !videoElement || !faceLandmarker) return;

      let startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(videoElement, startTimeMs);

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const blendshapes = results.faceBlendshapes[0].categories;
        
        const jawOpen = blendshapes.find(b => b.categoryName === 'jawOpen')?.score || 0;
        const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
        const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
        const mouthSmileLeft = blendshapes.find(b => b.categoryName === 'mouthSmileLeft')?.score || 0;
        const mouthSmileRight = blendshapes.find(b => b.categoryName === 'mouthSmileRight')?.score || 0;
        const browOuterUpLeft = blendshapes.find(b => b.categoryName === 'browOuterUpLeft')?.score || 0;
        const browOuterUpRight = blendshapes.find(b => b.categoryName === 'browOuterUpRight')?.score || 0;

        setGestures({
          smile: (mouthSmileLeft > 0.4 && mouthSmileRight > 0.4),
          eyebrowsRaised: (browOuterUpLeft > 0.45 || browOuterUpRight > 0.45),
          mouthOpen: jawOpen > 0.35,
          winkLeft: eyeBlinkLeft > 0.5 && eyeBlinkRight < 0.25,
          winkRight: eyeBlinkRight > 0.5 && eyeBlinkLeft < 0.25,
          blinkBoth: eyeBlinkLeft > 0.55 && eyeBlinkRight > 0.55,
        });
      }

      if (isActive) {
        requestRef.current = requestAnimationFrame(predictWebcam);
      }
    };

    startCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
      setGestures({
        smile: false,
        eyebrowsRaised: false,
        mouthOpen: false,
        winkLeft: false,
        winkRight: false,
        blinkBoth: false,
      });
    };
  }, [isActive, faceLandmarker, isMockMode]);

  return { status, gestures, setGestures, videoRef, isMockMode };
}
