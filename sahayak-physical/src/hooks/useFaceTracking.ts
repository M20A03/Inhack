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
  const [isMockMode, setIsMockMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number>();

  // Load MediaPipe FaceLandmarker model
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
            delegate: 'CPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });

        if (active) {
          setFaceLandmarker(landmarker);
          setStatus('Face Model Ready');
        }
      } catch (err) {
        console.warn('Face landmarker model fallback:', err);
        if (active) {
          setIsMockMode(true);
          setStatus('Gesture Triggers Active');
        }
      }
    };
    initializeTracker();
    return () => { active = false; };
  }, []);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
  }, []);

  // Manage camera and predictions
  useEffect(() => {
    if (!isActive) return;

    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    const startCamera = async () => {
      try {
        setStatus('Requesting Camera Access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } } 
        });
        
        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        activeStream = stream;

        // Poll until videoRef is mounted on DOM
        const checkVideoMount = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
              setStatus('👤 Face Tracking Live!');
              predictWebcam();
            }).catch(e => console.error("Video play err:", e));
          } else if (!isCancelled) {
            setTimeout(checkVideoMount, 100);
          }
        };
        checkVideoMount();

      } catch (err) {
        console.error('Camera start error:', err);
        setIsMockMode(true);
        setStatus('Gesture Triggers Active');
      }
    };

    const predictWebcam = () => {
      const videoElement = videoRef.current;
      if (isCancelled || !isActive || !videoElement) return;

      if (faceLandmarker && videoElement.readyState >= 2) {
        try {
          const startTimeMs = performance.now();
          const results = faceLandmarker.detectForVideo(videoElement, startTimeMs);

          let isSmile = false;
          let isMouthOpen = false;
          let isEyebrowsUp = false;
          let isWinkLeft = false;
          let isWinkRight = false;

          // 1. Primary: Blendshape detection
          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            const jawOpen = blendshapes.find(b => b.categoryName === 'jawOpen')?.score || 0;
            const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
            const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
            const mouthSmileLeft = blendshapes.find(b => b.categoryName === 'mouthSmileLeft')?.score || 0;
            const mouthSmileRight = blendshapes.find(b => b.categoryName === 'mouthSmileRight')?.score || 0;
            const browOuterUpLeft = blendshapes.find(b => b.categoryName === 'browOuterUpLeft')?.score || 0;

            isSmile = mouthSmileLeft > 0.25 || mouthSmileRight > 0.25;
            isMouthOpen = jawOpen > 0.18;
            isEyebrowsUp = browOuterUpLeft > 0.25;
            isWinkLeft = eyeBlinkLeft > 0.3 && eyeBlinkRight < 0.2;
            isWinkRight = eyeBlinkRight > 0.3 && eyeBlinkLeft < 0.2;
          }

          // 2. Fallback/Enhancement: Direct 3D Landmark Coordinate Geometry
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            if (landmarks.length > 300) {
              const topInnerLip = landmarks[13];
              const bottomInnerLip = landmarks[14];
              const mouthLeftCorner = landmarks[61];
              const mouthRightCorner = landmarks[291];
              const leftEyeTop = landmarks[159];
              const leftEyeBottom = landmarks[145];
              const rightEyeTop = landmarks[386];
              const rightEyeBottom = landmarks[374];

              const verticalMouthGap = Math.hypot(topInnerLip.x - bottomInnerLip.x, topInnerLip.y - bottomInnerLip.y);
              const horizontalMouthWidth = Math.hypot(mouthLeftCorner.x - mouthRightCorner.x, mouthLeftCorner.y - mouthRightCorner.y);
              const leftEyeGap = Math.hypot(leftEyeTop.x - leftEyeBottom.x, leftEyeTop.y - leftEyeBottom.y);
              const rightEyeGap = Math.hypot(rightEyeTop.x - rightEyeBottom.x, rightEyeTop.y - rightEyeBottom.y);

              if (verticalMouthGap > 0.045) isMouthOpen = true;
              if (horizontalMouthWidth > 0.42) isSmile = true;
              if (leftEyeGap < 0.012 && rightEyeGap > 0.02) isWinkLeft = true;
              if (rightEyeGap < 0.012 && leftEyeGap > 0.02) isWinkRight = true;
            }
          }

          setGestures({
            smile: isSmile,
            eyebrowsRaised: isEyebrowsUp,
            mouthOpen: isMouthOpen,
            winkLeft: isWinkLeft,
            winkRight: isWinkRight,
            blinkBoth: isWinkLeft && isWinkRight,
          });

        } catch (e) {
          console.warn('Prediction frame error:', e);
        }
      }

      if (isActive && !isCancelled) {
        requestRef.current = requestAnimationFrame(predictWebcam);
      }
    };


    startCamera();

    return () => {
      isCancelled = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isActive, faceLandmarker]);

  return { status, gestures, setGestures, videoRef, setVideoRef, isMockMode };
}


