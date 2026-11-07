import React, { useState } from 'react';
import SearchForm from './SearchForm';
import PlaylistView from '../playlist/PlaylistView';

const Hero = ({ isFallen, activeView, heroInputY }) => {
  const [processedPayload, setProcessedPayload] = useState(null);
    const handleVideoProcessed = (response) => {
    if (response.playlistId || response.isPlaylist) {
      setProcessedPayload(response);
      return;
    }

    setProcessedPayload({
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
    });
  };

  return (
    <>
      {/* REDUCED MOBILE GAP: Changed top-[180px] down to top-[140px] to move the headline up slightly on mobile */}
      <div className="absolute top-[140px] md:top-[220px] left-1/2 -translate-x-1/2 w-full max-w-4xl text-center px-4 md:px-6 pointer-events-auto z-10">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-3 md:mb-6 text-black drop-shadow-sm">
          Architectural Information System
        </h1>
        <p className="text-gray-700 text-xs md:text-base font-medium max-w-2xl mx-auto leading-relaxed border-l-4 border-black pl-3 md:pl-4">
          Slice the structural cords above to initialize core protocols, uncover deep system analytics, and deploy interactive exploratory frameworks.
        </p>
      </div>

      {/* REDUCED MOBILE GAP: Changed top-[360px] down to top-[300px] to pull the cards up closer to the headline */}
      <div className="absolute top-[300px] md:top-[420px] left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 md:px-6 pointer-events-auto z-10">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 relative">
          <div className={`bg-white border-4 border-black rounded-3xl p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-700 delay-100 ${
            isFallen && activeView === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
          }`}>
            <div className="inline-block bg-black text-white font-bold uppercase px-3 py-1 rounded-full text-[10px] md:text-xs mb-3 md:mb-6">What is Yatnize?</div>
            <p className="text-black font-medium text-xs md:text-sm leading-relaxed">
              Yatnize serves as a conceptual interactive hub, routing user intent seamlessly through multi-directional layout paradigms and spatial navigation protocols.
            </p>
          </div>

          <div className={`bg-white border-4 border-black rounded-3xl p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-700 delay-200 ${
            isFallen && activeView === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
          }`}>
            <div className="inline-block bg-black text-white font-bold uppercase px-3 py-1 rounded-full text-[10px] md:text-xs mb-3 md:mb-6">Input Field Function</div>
            <p className="text-black font-medium text-xs md:text-sm leading-relaxed mb-3">
              Engage directly below to search system components or command active interface structures.
            </p>
            <div className="bg-gray-100 p-2.5 md:p-4 border-2 border-black rounded-xl font-mono text-[11px] md:text-xs text-black">
              <div className="border-b-2 border-black pb-2 mb-2">- query = ∞ dynamic</div>
              <div>- execution mapping active</div>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="absolute left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl flex flex-col items-center px-4 md:px-6 pointer-events-auto"
        style={{ top: heroInputY }} 
      >
        <div className={`relative w-full transition-transform duration-700 ${isFallen && activeView === 1 ? 'scale-105' : 'scale-100'}`}>
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
   
          </div>
               <SearchForm onVideoProcessed={handleVideoProcessed} />
        </div>
      </div>

       {processedPayload && (
          <PlaylistView playlistData={processedPayload} />
       )}
      
    </>
  );
};

export default Hero;