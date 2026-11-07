import React, { useEffect, useRef, useState } from 'react';

const SIREN_AUDIO_URL = 'https://res.cloudinary.com/spha2pko/video/upload/v1786250957/siren_qu9rtt.mp3';

export default function DistractionMonitor({ onDistractionStateChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [distractionStatus, setDistractionStatus] = useState('focused'); // 'focused' | 'distracted' | 'no_face'
  const [alertMessage, setAlertMessage] = useState('');
  const [isSirenMode, setIsSirenMode] = useState(false);

  // Counters to prevent false positives (~1.5 to 2 seconds threshold at 30fps)
  const distractedFramesRef = useRef(0);
  const DISTRACTION_THRESHOLD_FRAMES = 30;

  // Initialize Audio Instance
  useEffect(() => {
    const audio = new Audio(SIREN_AUDIO_URL);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Handle Siren Sound Loop on Distraction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isSirenMode && distractionStatus !== 'focused') {
      audio.play().catch((err) => {
        console.warn('Browser prevented autoplay. User must interact with the page first:', err);
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [distractionStatus, isSirenMode]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    // Access MediaPipe classes loaded via index.html scripts
    const FaceMeshClass = window.FaceMesh;
    const CameraClass = window.Camera;

    if (!FaceMeshClass || !CameraClass) {
      console.error('MediaPipe scripts not loaded. Check index.html <script> tags.');
      return;
    }

    // Initialize Face Mesh
    const faceMesh = new FaceMeshClass({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // Enables iris/pupil tracking landmarks
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(handleFaceMeshResults);

    // Setup Camera Pipeline
    const camera = new CameraClass(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();
    setIsMonitoring(true);

    return () => {
      camera.stop();
      faceMesh.close();
    };
  }, []);

  /**
   * Process face mesh landmarks to detect gaze direction, head pose, & eye closure
   */
  const handleFaceMeshResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Check if face is present in frame
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      handleDistraction('No face detected in camera!', 'no_face');
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];

    // Eye Height Check (Closed Eyes / Sleeping)
    const leftEyeHeight = Math.abs(landmarks[159].y - landmarks[145].y);
    const rightEyeHeight = Math.abs(landmarks[386].y - landmarks[374].y);
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;

    // Iris Horizontal Ratio Check (Gaze Looking Left/Right)
    const leftEyeWidth = Math.abs(landmarks[133].x - landmarks[33].x);
    const leftIrisOffset = (landmarks[468].x - landmarks[33].x) / (leftEyeWidth + 0.0001);

    // Head Yaw Check (Nose Tip: 1 vs Left Cheek: 234 & Right Cheek: 454)
    const noseX = landmarks[1].x;
    const cheekDistLeft = Math.abs(noseX - landmarks[234].x);
    const cheekDistRight = Math.abs(noseX - landmarks[454].x);
    const yawRatio = cheekDistLeft / (cheekDistRight + 0.0001);

    // Evaluate Distraction Conditions
    let reason = '';
    let isDistracted = false;

    if (avgEyeHeight < 0.015) {
      isDistracted = true;
      reason = 'Eyes Closed / Sleeping!';
    } else if (leftIrisOffset < 0.25 || leftIrisOffset > 0.75) {
      isDistracted = true;
      reason = 'Gaze turned away from video!';
    } else if (yawRatio < 0.45 || yawRatio > 2.2) {
      isDistracted = true;
      reason = 'Head turned away from screen!';
    }

    if (isDistracted) {
      handleDistraction(reason, 'distracted');
    } else {
      distractedFramesRef.current = 0;
      setDistractionStatus('focused');
      setAlertMessage('');
      if (onDistractionStateChange) {
        onDistractionStateChange({ isDistracted: false });
      }
    }

    // Draw eye/iris tracking indicators on canvas overlay
    ctx.fillStyle = isDistracted ? '#ef4444' : '#22c55e';
    [468, 473].forEach((idx) => {
      const point = landmarks[idx];
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const handleDistraction = (reason, status) => {
    distractedFramesRef.current += 1;

    if (distractedFramesRef.current >= DISTRACTION_THRESHOLD_FRAMES) {
      setDistractionStatus(status);
      setAlertMessage(reason);
      if (onDistractionStateChange) {
        onDistractionStateChange({ isDistracted: true, reason });
      }
    }
  };

  // Toggle Siren Mode & Pre-load Audio Stream
  const toggleSirenMode = () => {
    setIsSirenMode((prev) => {
      const nextState = !prev;
      if (nextState && audioRef.current) {
        audioRef.current.load(); // Primes browser audio context on user click
      }
      return nextState;
    });
  };

  return (
    <div className={`relative flex flex-col items-center bg-slate-900 rounded-2xl p-4 border transition-all ${
      isSirenMode && distractionStatus !== 'focused'
        ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
        : 'border-slate-800 shadow-xl'
    } text-white`}>
      
      {/* Video & Tracking Canvas */}
      <div className="relative w-64 h-48 rounded-xl overflow-hidden bg-black border-2 border-slate-700">
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform -scale-x-100"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
        />

        {/* Live Status Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-semibold">
          <span
            className={`w-2 h-2 rounded-full animate-ping ${
              distractionStatus === 'focused' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          {isMonitoring ? 'AI Eye Shield Active' : 'Initializing...'}
        </div>
      </div>

      {/* Siren Mode Toggle Switch */}
      <div className="mt-3 w-full flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-sm">🚨</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-none">Siren Mode</span>
            <span className="text-[10px] text-slate-400">Audio alert on distraction</span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSirenMode}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isSirenMode ? 'bg-red-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isSirenMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Real-time Alert Banner */}
      {distractionStatus !== 'focused' && alertMessage && (
        <div className="mt-2 w-full bg-red-600/90 text-white px-3 py-2 rounded-lg text-xs font-bold text-center animate-bounce shadow-lg flex items-center justify-center gap-2">
          <span>🚨 ATTENTION ALERT:</span>
          <span>{alertMessage}</span>
        </div>
      )}
    </div>
  );
}