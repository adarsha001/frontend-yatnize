import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, 
  ShieldCheck, 
  Clock, 
  Target, 
  Shield, 
  QrCode, 
  Sprout, 
  Link as LinkIcon,
  Eye,
  Brain
} from 'lucide-react';
import Logo from './Logo';

const useTypewriter = (words, typingSpeed = 100, deletingSpeed = 50, pauseTime = 1500) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentWord = words[wordIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
        if (text.length === currentWord.length) {
          timer = setTimeout(() => setIsDeleting(true), pauseTime);
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};

export default function App() {
  const certificateRef = useRef(null);
  const sigContainerRef = useRef(null);
  const [name, setName] = useState('');
  
  const [tiltStyle, setTiltStyle] = useState({ 
    transform: 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s ease-out'
  });

  const handleMouseMove = (e) => {
    if (!certificateRef.current) return;
    const { left, top, width, height } = certificateRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    const maxTilt = 4; 
    const rotateX = (0.5 - y) * maxTilt;
    const rotateY = (x - 0.5) * maxTilt;
    
    setTiltStyle({
      transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s ease-out'
    });
  };

  const typewriterText = useTypewriter([
    'Web Development Masterclass',
    'Full Stack React & Microservices',
    'UI/UX Design Fundamentals',
    'DevOps & Cloud Architecture',
    'Data Analysis & Visualization',
    'Machine Learning Deep Dive'
  ]);

  const features = [
    {
      title: "Tamper-Proof QR Verification",
      desc: "Every credential embeds a unique cryptographic QR code. Recruiters and LinkedIn visitors can scan it instantly to view a live verification page.",
      icon: QrCode
    },
    {
      title: "Gaze & Focus Discipline Score",
      desc: "Unlike traditional certificates that only track video playback, Yatnize verifies active attention using local MediaPipe gaze tracking.",
      icon: Eye
    },
    {
      title: "Anti-Skimming Active Recall Proof",
      desc: "Certifies that you didn't just play the video in the background—it validates post-lecture comprehension through instant AI-generated quiz scores.",
      icon: Brain
    },
    {
      title: "Real-World Environmental Impact",
      desc: "Every completed playlist reserves and plants a real tree through partner NGOs (like SankalpTaru) with a live batch tracking ID.",
      icon: Sprout
    }
  ];

  useEffect(() => {
    const gsapScript = document.createElement('script');
    gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    gsapScript.async = true;
    
    gsapScript.onload = () => {
      const stScript = document.createElement('script');
      stScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      stScript.async = true;
      
      stScript.onload = () => {
        if (window.gsap && window.ScrollTrigger && sigContainerRef.current) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          
          // Target paths in order specified by class/id structure (rsh then line)
          const paths = sigContainerRef.current.querySelectorAll('path');
          
          paths.forEach((path) => {
            const length = path.getTotalLength();
            // Start at 75% offset so that 25% of the path is already drawn initially
            const initialOffset = length * 0.35;
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = initialOffset;

            window.gsap.to(path, {
              strokeDashoffset: 0,
              scrollTrigger: {
                trigger: certificateRef.current,
                start: 'top 145%',
                end: 'bottom 20%',
                scrub: 1, // Smooth scrub effect linked directly to scrolling
              },
              ease: 'none'
            });
          });
        }
      };
      document.body.appendChild(stScript);
    };
    document.body.appendChild(gsapScript);

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => t.kill());
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white flex flex-col xl:flex-row items-center justify-center p-4 md:p-8 gap-6 xl:gap-10 font-sans text-black overflow-hidden selection:bg-[#00FFA3] selection:text-black">
      
      {/* Themed page background: white base + soft leaf-green glows + faint grid (matches hero theme) */}
 

      {/* Left Column: Key Features */}
      <div className="relative z-10 w-full xl:w-[400px] shrink-0 flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] w-fit">
          <Shield className="w-4 h-4 text-[#00FFA3] fill-black" />
          <span className="font-black text-xs tracking-widest uppercase">Proof of Work</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
          More than just<br />a piece of paper.
        </h1>
        
        <div className="flex flex-col gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-3.5 p-3.5 bg-white border-[2px] border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
              <div className="p-2.5 bg-[#00FFA3] border-[2px] border-black rounded-lg h-fit shrink-0">
                <feature.icon className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-xs tracking-tight uppercase mb-0.5">{feature.title}</h3>
                <p className="text-[11px] font-semibold text-slate-600 leading-snug">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Interactive Larger 3D Certificate CTA */}
      <div className="relative z-10 w-full max-w-[1050px] flex-1 flex justify-center perspective-[2000px]">
        <div 
          ref={certificateRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={tiltStyle}
          className="relative w-full flex flex-col justify-between bg-white border-[4px] md:border-[5px] border-black rounded-2xl p-6 sm:p-8 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] will-change-transform h-auto"
        >
          {/* Inner decorative grid background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10 rounded-xl overflow-hidden"
            style={{
              backgroundImage: 'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          <div className="relative z-20 flex flex-col h-full w-full">
            
            {/* Header row */}
            <div className="flex flex-row justify-between items-center mb-6 gap-2">
              <div className="flex items-center gap-2 bg-white border-[2px] border-black rounded-full px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Logo className="w-4 h-4 text-black fill-black" />
                <span className="text-base font-black tracking-tighter uppercase">Yatnize</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black text-white rounded-full px-4 py-2">
                <ShieldCheck className="w-4 h-4 text-[#00FFA3]" />
                <span className="text-[10px] font-bold tracking-widest">VERIFIED</span>
              </div>
            </div>

            {/* Title section */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-[2.4rem] font-black uppercase tracking-tight leading-none mb-1 text-black">
                Certificate of Mastery
                <br />
                <span className="text-xs sm:text-sm md:text-[1.2rem] flex items-center justify-center gap-2 mt-2">
                  <div className="h-0.5 w-12 bg-[#00FFA3]"></div>
                  &amp; IMPACT VERIFICATION
                  <div className="h-0.5 w-12 bg-[#00FFA3]"></div>
                </span>
              </h2>
            </div>

            {/* Recipient area */}
            <div className="text-center flex flex-col items-center mb-6">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                This is presented to
              </p>
              
              {/* Name Input Field */}
              <div className="relative w-full max-w-md mb-5 flex flex-col items-center">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Your Name..."
                  className="w-full text-center text-xl sm:text-2xl md:text-[2.8rem] font-bold bg-transparent border-b-[2px] border-gray-300 focus:border-[#00FFA3] outline-none pb-1 px-2 transition-colors duration-300 placeholder:text-gray-300 text-black leading-tight"
                />
                
                {/* Register CTA Button */}
                <div className={`mt-3 overflow-hidden transition-all duration-500 ease-out w-full flex justify-center ${name.trim().length > 0 ? 'max-h-20 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}>
                  <button className="relative group inline-flex items-center justify-center font-black text-xs px-6 py-2.5 bg-[#00FFA3] text-black border-[2px] border-black rounded-full cursor-pointer hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    <span className="relative flex items-center gap-1.5">
                      Register to Claim
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                  </button>
                </div>
              </div>
              
              <p className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-1">
                For successfully completing the course playlist:
              </p>
              <div className="text-sm sm:text-base md:text-[1.3rem] font-extrabold h-9 flex items-center justify-center text-black">
                “{typewriterText}<span className="inline-block w-1.5 h-4 bg-[#00FFA3] ml-1 animate-pulse"></span>”
              </div>
              <p className="text-[10px] font-semibold text-gray-500 mt-0.5">
                (Channel: Yatnize Masterclass)
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 w-full max-w-3xl mx-auto">
              <div className="flex items-center gap-3 bg-white border-[2px] border-black rounded-full px-5 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-2 border-[2px] border-black rounded-full flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#00FFA3]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-black leading-tight">Duration Watched</span>
                  <span className="text-xs font-black leading-tight mt-0.5">8 Hours 45 Mins</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#00FFA3] border-[2px] border-black rounded-full px-5 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
                <div className="p-2 border-[2px] border-black rounded-full bg-transparent flex-shrink-0">
                  <Target className="w-4 h-4 text-black" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-black leading-tight">Quiz Score</span>
                  <span className="text-base font-black leading-none mt-0.5 tracking-tighter">95%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white border-[2px] border-black rounded-full px-5 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-2 border-[2px] border-black rounded-full flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#00FFA3]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-black leading-tight">Focus Shield</span>
                  <span className="text-xs font-black leading-tight mt-0.5">99% <span className="text-[7px] font-bold text-gray-500">(MediaPipe)</span></span>
                </div>
              </div>
            </div>

            {/* Footer Row: QR code, Tree badge, and GSAP signature */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-5 w-full pt-5 border-t border-gray-200">
              
              {/* QR Code */}
              <div className="flex items-center gap-3">
                <div className="border-[2px] border-black p-2 rounded-lg bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <QrCode className="w-10 h-10" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-black">Scan to Verify</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-black mb-0.5">Batch & Growth</span>
                  <LinkIcon className="w-3.5 h-3.5 text-[#00FFA3] stroke-[3]" />
                </div>
              </div>

              {/* Plantation Badge */}
              <div className="flex items-center gap-3 bg-white border-[2px] border-black rounded-xl px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Sprout className="w-5 h-5 text-[#00FFA3] stroke-[2.5] flex-shrink-0" />
                <div className="flex flex-col text-left border-r-[2px] border-gray-200 pr-3">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Plantation Region:</span>
                  <span className="text-[11px] font-bold text-black">Karnataka Afforestation</span>
                </div>
                <div className="flex flex-col text-left pl-1">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Status:</span>
                  <span className="text-[11px] font-bold text-black">Reserved (SankalpTaru)</span>
                </div>
              </div>

              {/* Signature Area with GSAP Scroll Scrub in strict order */}
              <div className="flex flex-col items-center relative min-w-[190px] h-[90px] justify-end">
                <div className="absolute bottom-[16px] w-[170px] h-auto right-[-4px] pointer-events-none" ref={sigContainerRef}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full h-auto drop-shadow-sm">
                    <path style={{fill: 'none', stroke: 'rgb(0, 0, 0)', strokeWidth: '3px', strokeLinecap: 'round'}} d="M 80.765 359.049 C 86.679 365.437 129.059 296.445 146.962 256.025 C 153.336 241.635 157.299 231.328 154.446 228.69 C 152.15 229.073 153.613 281.177 157.204 316.969 C 159.086 335.728 162.533 350.251 164.217 349.97 C 171.381 349.572 125.174 325.813 119.719 326.116 C 105.629 318.226 11.001 322.814 21.73 328.822 C 38.071 333.566 117.617 304.288 165.403 285.664 C 186.897 277.287 202.758 267.37 202.758 267.37 C 202.758 267.37 226.1 249.643 220.877 240.758 C 216.833 233.879 204.911 242.308 199.321 246.401 C 179.642 260.811 176.283 297.132 175.937 321.971 C 175.648 342.687 180.122 362.535 193.06 378.717 C 197.918 384.794 213.338 390.274 213.338 390.274"></path>
                    <path style={{fill: 'none', stroke: 'rgb(0, 0, 0)', strokeWidth: '3px'}} d="M 254.99 309.447 C 254.99 309.447 252.939 308.813 249.905 308.722 C 247.375 308.646 244.126 309.017 241.144 309.786 C 234.91 311.394 228.484 314.686 224.868 317.624 C 217.338 323.741 209.837 332.066 214.404 339.418 C 218.066 345.313 227.978 339.068 233.632 335.821 C 238.519 333.014 240.794 327.801 244.692 323.033 C 249.97 316.578 253.775 309.042 254.99 309.447 Z"></path>
                    <path style={{fill: 'none', stroke: 'rgb(0, 0, 0)', strokeWidth: '3px', strokeLinecap: 'round'}} d="M 248.882 317.409 C 247.396 323.351 250.733 332.316 254.317 332.482 C 257.435 332.627 262.017 329.442 264.957 326.669 C 268.156 323.651 273.718 314.063 273.718 314.063 C 273.718 314.063 269.091 326.925 273.795 328.699 C 279.058 330.684 286.175 325.13 290.637 318.828 C 292.042 316.843 293.686 315.827 294.49 313.986 C 295.721 311.165 295.543 309.372 295.543 309.372 C 295.543 309.372 301.275 314.126 307.031 319.052 C 312.976 324.139 319.133 328.006 318.844 333.215 C 318.618 337.285 313.655 336.426 309.691 337.375 C 303.512 338.854 294.816 339.777 290.798 334.855 C 286.939 330.128 292.058 318.439 292.058 318.439 C 292.058 318.439 333.455 285.09 339.967 261.27 C 341.205 256.742 342.584 249.714 338.03 248.579 C 333.099 247.35 330.091 255.691 328.584 260.544 C 323.172 277.969 326.702 308.465 330.128 324.341 C 331.481 330.614 330.973 332.996 334.297 334.604 C 336.915 335.871 339.903 335.968 342.673 332.161 C 344.714 329.354 344.892 324.18 347.429 323.762 C 350.159 323.313 351.186 327.428 354.307 329.469 C 359.47 332.848 368.461 338.308 368.461 338.308" id="rsh"></path>
                    <path style={{fill: 'none', stroke: 'rgb(0, 0, 0)', strokeWidth: '3px'}} d="M 254.494 309.936 C 255.856 310.844 237.052 322.655 237.052 322.655 L 190.651 343.286 L 100.75 378.564 C 100.08 376.158 128.465 373.011 169.334 366.039 C 211.723 358.808 267.515 347.71 316.676 343.205 C 341.725 340.909 366.218 338.266 385.734 338.841 C 395.988 339.143 418.786 339.352 412.777 344.751 C 411.387 346 413.003 345.057 409.567 346.919 C 407.039 348.289 404.1 349.394 404.1 349.394 C 404.1 349.394 395.798 353.174 389.269 354.378 C 360.068 359.764 298.388 360.035 300.245 358.488" id="line"></path>
                  </svg>
                </div>
                
                <div className="w-[140px] border-t-[2px] border-black pt-1 text-center mt-auto z-10 bg-white/50">
                  <span className="text-[8px] font-black uppercase tracking-widest text-black">Founder, Yatnize</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}