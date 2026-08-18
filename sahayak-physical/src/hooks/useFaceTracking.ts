import { useEffect, useRef, useState, useCallback } from 'react';
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  const startCamera = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      setStatus('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 320, height: 240 } 
      });
      videoElement.srcObject = stream;
      videoElement.play();
      videoRef.current = videoElement;
      setStatus('Tracking Active');
    } catch (err) {
      console.error(err);
      setStatus('Camera access denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setGestures({
      smile: false,
      eyebrowsRaised: false,
      mouthOpen: false,
      winkLeft: false,
      winkRight: false,
      blinkBoth: false,
    });
  }, []);

  useEffect(() => {
    if (!isActive || !faceLandmarker || !videoRef.current) {
      stopCamera();
      return;
    }

    const predictWebcam = () => {
      const videoElement = videoRef.current;
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

    videoRef.current.onloadeddata = () => {
      predictWebcam();
    };

    // Run prediction if metadata/loadeddata already fired
    if (videoRef.current.readyState >= 2) {
      predictWebcam();
    }

  }, [isActive, faceLandmarker, stopCamera]);

  return { status, gestures, startCamera, stopCamera };
}
