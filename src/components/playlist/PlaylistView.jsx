import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DistractionMonitor from '../video/DistractionMonitor';

export default function PlaylistView({ playlistData }) {
  const [selectedVideo, setSelectedVideo] = useState(playlistData.videos[0] || null);

  // Distraction & MFA States
  const [isMfaLocked, setIsMfaLocked] = useState(false);
  const [distractionReason, setDistractionReason] = useState('');
  const [isFocusRegained, setIsFocusRegained] = useState(false);

  // MFA Code & Timers
  const [mfaCode, setMfaCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [distractionTimeSeconds, setDistractionTimeSeconds] = useState(0);

  // Interactive Notes State
  const [activeNoteTab, setActiveNoteTab] = useState('canvas'); // 'canvas' | 'snapshot'

  const viewContainerRef = useRef(null);
  const playerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Smooth entrance transition & auto-focus on mount
  useGSAP(() => {
    gsap.fromTo(
      viewContainerRef.current,
      { opacity: 0, y: 50, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
    if (viewContainerRef.current) {
      viewContainerRef.current.focus();
    }
  }, { scope: viewContainerRef });

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize or update YouTube Player
  useEffect(() => {
    if (!selectedVideo) return;

    const initPlayer = () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(`yt-player-${selectedVideo.videoId}`, {
        videoId: selectedVideo.videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [selectedVideo]);

  // Distraction Timer Controller
  useEffect(() => {
    if (isMfaLocked && !isFocusRegained) {
      timerIntervalRef.current = setInterval(() => {
        setDistractionTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isMfaLocked, isFocusRegained]);

  const handleDistractionStateChange = ({ isDistracted, reason }) => {
    if (isDistracted) {
      if (!isMfaLocked) {
        setIsMfaLocked(true);
        setIsFocusRegained(false);
        setDistractionReason(reason);
        setDistractionTimeSeconds(0);

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setMfaCode(code);
        setUserInputCode('');

        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      }
    } else {
      if (isMfaLocked) {
        setIsFocusRegained(true);
      }
    }
  };

  const handleVerifyUnlock = (e) => {
    e.preventDefault();
    if (userInputCode === mfaCode) {
      setIsMfaLocked(false);
      setIsFocusRegained(false);
      setDistractionTimeSeconds(0);

      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    }
  };

  return (
    <div
      ref={viewContainerRef}
      tabIndex={-1}
      className="w-full max-w-6xl my-8 bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl p-6 text-left flex flex-col gap-6 text-zinc-100 font-sans outline-none focus:ring-1 focus:ring-zinc-700"
    >
      {/* Header Controls */}
      <div className="border-b border-zinc-800 pb-4 flex justify-between items-center">
        <div>
          <span className="inline-flex items-center text-[10px] font-bold tracking-widest text-black bg-white px-3 py-1 rounded-sm uppercase mb-3">
            {playlistData.totalVideos > 1 ? `Playlist (${playlistData.totalVideos} Videos)` : 'Single Lesson'}
          </span>
          <h2 className="text-2xl font-semibold text-white mt-1">
            {playlistData.playlistTitle || selectedVideo?.title}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Channel: {playlistData.channelTitle}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Video Player & MFA Lock */}
        <div className="lg:col-span-2 flex flex-col gap-3 relative">
          
          {/* MFA LOCK MODAL */}
          {isMfaLocked && (
            <div className="absolute inset-0 z-[9999] bg-zinc-950/95 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6 text-center text-white border border-zinc-700 animate-fade-in">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-700 rounded-sm text-white text-xs font-bold uppercase tracking-widest mb-6">
                <span className={`w-2 h-2 rounded-full ${isFocusRegained ? 'bg-white' : 'bg-white animate-ping'}`} />
                {isFocusRegained ? 'Eyes Detected — Freeze Active' : 'Distraction Active — Video Paused'}
              </div>

              <div className="text-center mb-6">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Time Lost to Distraction
                </div>
                <div className={`text-6xl font-mono font-bold tracking-tighter ${isFocusRegained ? 'text-zinc-300' : 'text-white'}`}>
                  {Math.floor(distractionTimeSeconds / 60)}m {distractionTimeSeconds % 60}s
                </div>
              </div>

              <div className="flex items-center justify-center max-w-sm mb-6">
                {isFocusRegained ? (
                  <div className="flex items-start text-left text-sm text-zinc-300 bg-zinc-900 p-3 rounded-md border border-zinc-800">
                    <svg className="w-5 h-5 mr-3 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Focus regained. Enter the code below to resume your session.</span>
                  </div>
                ) : (
                  <div className="flex items-start text-left text-sm text-zinc-300 bg-zinc-900 p-3 rounded-md border border-zinc-800">
                    <svg className="w-5 h-5 mr-3 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{distractionReason}. Look back at the screen to freeze the timer.</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Verification Code
                </div>
                <div className="text-4xl font-mono font-bold text-white tracking-[0.2em] select-none bg-zinc-900 px-8 py-3 rounded-md border border-zinc-800">
                  {mfaCode}
                </div>
              </div>

              <form onSubmit={handleVerifyUnlock} className="w-full max-w-xs flex flex-col items-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={userInputCode}
                  onChange={(e) => setUserInputCode(e.target.value)}
                  placeholder="0000"
                  className="w-full text-center text-2xl font-mono tracking-widest bg-black border border-zinc-700 rounded-md py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={userInputCode !== mfaCode}
                  className="w-full flex items-center justify-center py-3 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-600 text-black rounded-md font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Verify & Resume
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* YouTube Target */}
          {selectedVideo && (
            <div className="w-full rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video relative z-0">
              <div id={`yt-player-${selectedVideo.videoId}`} className="w-full h-full" />
            </div>
          )}

          <h3 className="text-lg font-medium text-white">{selectedVideo?.title}</h3>
        </div>

        {/* Right Col: AI Eye Tracking */}
        <div className="flex flex-col gap-4">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            AI Focus Shield
          </div>
          <div className="bg-black border border-zinc-800 rounded-xl p-3">
            <DistractionMonitor onDistractionStateChange={handleDistractionStateChange} />
          </div>
        </div>

      </div>

      {/* Interactive Study Notes */}
      <div className="w-full border-t border-zinc-800 pt-6 mt-2">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveNoteTab('canvas')}
            className={`flex items-center px-4 py-2.5 rounded-md text-xs font-semibold tracking-wide transition-all border ${
              activeNoteTab === 'canvas'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Canvas Scratchpad
          </button>

          <button
            onClick={() => setActiveNoteTab('snapshot')}
            className={`flex items-center px-4 py-2.5 rounded-md text-xs font-semibold tracking-wide transition-all border ${
              activeNoteTab === 'snapshot'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Frame Annotator
          </button>
        </div>
      </div>
    </div>
  );
}