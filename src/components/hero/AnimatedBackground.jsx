import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[0] opacity-20 overflow-hidden flex flex-col justify-end">
      {/* Sun */}
      <svg className="anim-sun absolute top-12 md:top-24 left-1/2 -translate-x-1/2 w-64 md:w-96 h-auto text-yellow-500 fill-current" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" />
        <path d="M50 0 L50 10 M50 90 L50 100 M0 50 L10 50 M90 50 L100 50 M15 15 L22 22 M78 78 L85 85 M15 85 L22 78 M78 15 L85 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      
      {/* Birds (Left) */}
      <svg className="anim-bird-1 absolute top-32 left-1/4 w-32 h-32 text-gray-800 fill-none stroke-current drop-shadow-md" style={{ strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 100 100">
        <path d="M 10 30 Q 20 20 30 30 Q 40 20 50 30" />
        <path d="M 45 45 Q 52 38 60 45 Q 67 38 75 45" />
        <path d="M 60 15 Q 65 10 70 15 Q 75 10 80 15" />
      </svg>

      {/* Birds (Right) */}
      <svg className="anim-bird-2 absolute top-48 right-1/4 w-24 h-24 text-gray-800 fill-none stroke-current drop-shadow-md" style={{ strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 100 100">
        <path d="M 10 30 Q 20 20 30 30 Q 40 20 50 30" />
        <path d="M 40 10 Q 47 3 55 10 Q 62 3 70 10" />
      </svg>

      {/* Layered Mountains */}
      <svg className="w-full h-auto min-h-[35vh] max-h-[50vh] text-slate-500 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path className="anim-mountain-bg" d="M0,320 L0,150 L250,50 L550,200 L900,20 L1250,150 L1440,80 L1440,320 Z" opacity="0.4"/>
        <path className="anim-mountain-mid" d="M0,320 L0,200 L350,100 L700,220 L1050,60 L1440,180 L1440,320 Z" opacity="0.6"/>
        <path className="anim-mountain-fg" d="M0,320 L0,250 L450,150 L850,280 L1200,120 L1440,220 L1440,320 Z" opacity="0.8"/>
      </svg>
    </div>
  );
}