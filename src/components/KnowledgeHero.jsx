import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import AnimatedBackground from './hero/AnimatedBackground';
import SearchForm from './hero/SearchForm';
import FeatureCards from './hero/FeatureCards';
import PlaylistView from './playlist/PlaylistView';

export default function KnowledgeHero() {
  const container = useRef(null);
  const playlistRef = useRef(null);
  const [processedPayload, setProcessedPayload] = useState(null);

  // Hero entrance animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });

      tl.from('.anim-sun', { y: 150, opacity: 0, scale: 0.5, duration: 1.5 })
        .from('.anim-mountain-bg', { y: 100, opacity: 0 }, '-=1.2')
        .from('.anim-mountain-mid', { y: 100, opacity: 0 }, '-=1')
        .from('.anim-mountain-fg', { y: 100, opacity: 0 }, '-=1')
        .from('.anim-bird-1', { x: -50, y: 30, opacity: 0 }, '-=0.8')
        .from('.anim-bird-2', { x: 50, y: 30, opacity: 0 }, '-=0.9')
        .from('.anim-tree-top', { scaleY: 0, opacity: 0 }, '-=0.5')
        .from('.anim-tree-bottom', { scaleY: 0, opacity: 0 }, '-=1')
        .from('.anim-search-bar', { scale: 0.8, y: 20, opacity: 0, ease: 'back.out(1.5)' }, '-=0.8')
        .from('.anim-card', { opacity: 0, y: 40, scale: 0.8, rotateX: -30, stagger: 0.15 }, '-=0.6');

      gsap.to('.anim-sun', {
        rotate: 360,
        duration: 120,
        repeat: -1,
        ease: 'linear',
        transformOrigin: 'center center'
      });
    },
    { scope: container }
  );

  // Smooth transition & scroll focus when payload is ready
  useGSAP(() => {
    if (processedPayload && playlistRef.current) {
      gsap.fromTo(
        playlistRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          ease: 'power3.out',
          onStart: () => {
            playlistRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      );
    }
  }, [processedPayload]);
const handleVideoProcessed = (response) => {
  const payload = (response.playlistId || response.isPlaylist) ? response : {
    playlistId: null,
    playlistTitle: response.title,
    channelTitle: response.channelTitle,
    totalVideos: 1,
    videos: [
      {
        videoId: response.videoId,
        title: response.title,
        transcript: response.transcript,
        fullText: response.fullText,
      },
    ],
  };

  // Save the payload to localStorage so the new tab can read it
  localStorage.setItem('playlist_payload', JSON.stringify(payload));
  
  // Open your dedicated playlist page/route in a new tab
  window.open('/playlist-view', '_blank');
};
  return (
    <div
      ref={container}
      className="relative bg-[#FAF9F6] text-gray-900 font-sans antialiased min-h-screen flex flex-col justify-center items-center overflow-x-hidden selection:bg-red-500 selection:text-white"
    >
      <AnimatedBackground />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 w-full flex flex-col items-center text-center perspective-1000">
        
        {/* Tree & Search Container */}
        <div className="relative w-full max-w-5xl my-8 flex flex-col items-center justify-center min-h-[500px]">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent w-full pointer-events-none"></div>
          <SearchForm onVideoProcessed={handleVideoProcessed} />
        </div>

        {/* Unified View with Smooth GSAP Entry & Focus */}
        {processedPayload && (
          <div ref={playlistRef} className="w-full opacity-0">
            <PlaylistView playlistData={processedPayload} />
          </div>
        )}

      </main>
    </div>
  );
}