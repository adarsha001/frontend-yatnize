import React from 'react';

const CARDS = [
  {
    sides: 'Hexagon',
    clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
    title: 'Instant Answers',
    desc: 'Get accurate transcript points in seconds.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    sides: 'Heptagon',
    clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
    title: 'Deep Understanding',
    desc: 'Structured timestamps mapped directly to video topics.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    ),
  },
  {
    sides: 'Octagon',
    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    title: 'Trusted Sources',
    desc: 'Real captions extracted directly from YouTube.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    sides: 'Nonagon',
    clipPath: 'polygon(50% 0%, 84% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 16% 12%)',
    title: 'Always Evolving',
    desc: 'Ready for AI quiz generation & focus checks.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12 px-4">
      {CARDS.map((card, index) => (
        <div key={index} className="anim-card drop-shadow-[0_15px_25px_rgba(220,38,38,0.12)] h-72 group cursor-pointer">
          <div 
            className="bg-white/95 backdrop-blur-sm w-full h-full p-8 flex flex-col items-center justify-center text-center transition-colors duration-300 group-hover:bg-red-50"
            style={{ clipPath: card.clipPath }}
          >
            <div className="w-12 h-12 mb-3 text-red-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {card.icon}
              </svg>
            </div>
            <div className="text-sm font-bold text-gray-900 mb-2">{card.title}</div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[140px]">{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}