import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Matter from 'matter-js';
import p5 from 'p5';
import gsap from 'gsap';

import Navbar from './hero/Navbar';
import Hero from './hero/Hero';

const historyData = [
  { id: 1, title: "Calculus in 10 Minutes", timeSpent: "10:24", channel: "MathPro", thumb: "https://img.youtube.com/vi/WUvTyaaNkzM/hqdefault.jpg" },
  { id: 2, title: "Introduction to Mechanics", timeSpent: "45:12", channel: "Physics Today", thumb: "https://img.youtube.com/vi/qP1Z7P-4lU0/hqdefault.jpg" },
  { id: 3, title: "Learn React in 30 Mins", timeSpent: "28:05", channel: "Code Academy", thumb: "https://img.youtube.com/vi/hQAHSlTtcmY/hqdefault.jpg" },
  { id: 4, title: "The Roman Empire History", timeSpent: "1:15:30", channel: "History Buffs", thumb: "https://img.youtube.com/vi/3PszVWZNWVA/hqdefault.jpg" },
  { id: 5, title: "Machine Learning Explained", timeSpent: "15:40", channel: "AI Simplified", thumb: "https://img.youtube.com/vi/Gv9_4yMHFhI/hqdefault.jpg" },
  { id: 6, title: "Balancing Equations", timeSpent: "12:11", channel: "Chem Tutors", thumb: "https://img.youtube.com/vi/2mBjePAFGEA/hqdefault.jpg" },
  { id: 7, title: "Data Structures Mastery", timeSpent: "2:10:00", channel: "Tech Prep", thumb: "https://img.youtube.com/vi/RBSGKlAvoiM/hqdefault.jpg" },
  { id: 8, title: "Scale of the Universe", timeSpent: "08:50", channel: "Space Nerd", thumb: "https://img.youtube.com/vi/17jymDn0W6U/hqdefault.jpg" },
  { id: 9, title: "Advanced Quantum Computing", timeSpent: "32:10", channel: "Tech Futures", thumb: "https://img.youtube.com/vi/JhHMJCUmq28/hqdefault.jpg" },
  { id: 10, title: "Art History: The Renaissance", timeSpent: "41:00", channel: "Art Lens", thumb: "https://img.youtube.com/vi/xf2G2Il8crw/hqdefault.jpg" }
];

const YatnizeSystem = () => {
  const [mounted, setMounted] = useState(false);
  const [gridCols, setGridCols] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const mainWrapperRef = useRef(null);
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const leafRefs = useRef([]);
  const gridRefs = useRef([]); 
  
  const [isFallen, setIsFallen] = useState(false);
  const [activeView, setActiveView] = useState(1); 
  
  const activeViewRef = useRef(1);
  activeViewRef.current = activeView;

  const engineRef = useRef(null);
  const stringsRef = useRef([]);
  const vanishingStringsRef = useRef([]); 
  const navBodyRef = useRef(null);
  const floorRef = useRef(null);
  
  const isFallenRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const isZoomingRef = useRef(false);
  const isZoomingOutRef = useRef(false);

  const NAV_MAX_WIDTH = 640;
  const NAV_HEIGHT = 70;
  const CANVAS_HEIGHT = 1200; 
  
  const getHeroInputY = () => window.innerWidth < 768 ? 700 : 850;
  const HERO_NAVBAR_LANDING_Y = getHeroInputY() - 50; 

  const leafStates = useRef(historyData.map(d => ({ ...d, isFallen: false })));
  const leafPositionsRef = useRef([]); 

  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => { document.body.style.overflowX = ''; };
  }, []);

  useEffect(() => {
    const calculateColumns = () => {
      setGridCols(Math.ceil(window.innerWidth / 40));
      setIsMobile(window.innerWidth < 768);
    };
    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    return () => window.removeEventListener('resize', calculateColumns);
  }, []);

  const gridThumbnails = useMemo(() => {
    if (gridCols === 0) return [];
    const rows = 15; 
    const totalItems = gridCols * rows;
    return Array.from({ length: totalItems }).map((_, i) => ({
      ...historyData[Math.floor(Math.random() * historyData.length)],
      gridId: i
    }));
  }, [gridCols]);

  // OPTIMIZED GSAP Random Thumbnail Animation
  useEffect(() => {
    // 1. Immediately abort on mobile to save performance
    if (!mounted || gridThumbnails.length === 0 || isMobile) return;

    let ctx = gsap.context(() => {
      const animateRandom = () => {
        const available = gridRefs.current.filter(ref => 
          ref && 
          !ref.dataset.animating && 
          !ref.parentElement.matches(':hover')
        );
        
        if (available.length === 0) return;
        
        const el = available[Math.floor(Math.random() * available.length)];
        el.dataset.animating = "true"; 

        const img = el.querySelector('img');
        const caption = el.querySelector('.thumb-caption');
        const parentContainer = el.parentElement;

        // 2. Safely capture existing transitions
        const originalElTransition = el.style.transition;
        const originalImgTransition = img.style.transition;
        const originalCaptionTransition = caption ? caption.style.transition : 'none';
        
        // 3. Forcefully kill CSS transitions so GSAP doesn't fight them (fixes the glitch/lag)
        el.style.setProperty('transition', 'none', 'important');
        img.style.setProperty('transition', 'none', 'important');
        if(caption) caption.style.setProperty('transition', 'none', 'important');

        const tl = gsap.timeline({
          onComplete: () => {
            el.dataset.animating = "";
            el.style.transition = originalElTransition;
            img.style.transition = originalImgTransition;
            if(caption) caption.style.transition = originalCaptionTransition;
            
            gsap.set([el, img, caption, parentContainer], { clearProps: "all" });
            gsap.delayedCall(Math.random() * 2 + 1, animateRandom);
          }
        });

        // 4. Added force3D and exact endpoint mapping (borderRadius 1px) to prevent snappy artifacts
        tl.to(parentContainer, { zIndex: 50, duration: 0 })
          .to(el, { scale: 4.5, borderRadius: "2px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", duration: 0.6, ease: "power2.out", force3D: true }, 0)
          .to(img, { opacity: 1, filter: "grayscale(0%)", duration: 0.6, ease: "power2.out" }, 0)
          .to(caption, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0)
          .to(el, { scale: 1, borderRadius: "1px", boxShadow: "0 0px 0px rgba(0,0,0,0)", duration: 0.6, ease: "power2.inOut", delay: 1.5, force3D: true }, "out")
          .to(img, { opacity: 0.15, filter: "grayscale(100%)", duration: 0.6, ease: "power2.inOut" }, "out")
          .to(caption, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "out")
          .to(parentContainer, { zIndex: 1, duration: 0 });
      };

      // Reduced to 2 concurrent pops for better sustained 60fps performance
      for (let i = 0; i < 2; i++) {
        gsap.delayedCall(Math.random() * 3, animateRandom);
      }
    });

    return () => ctx.revert(); 
  }, [mounted, gridThumbnails, isMobile]);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    let gMouseIsPressed = false;
    let gMouseX = 0;
    let gMouseY = 0;

    const handleDown = (e) => { if (e.button === 0) gMouseIsPressed = true; };
    const handleUp = () => { gMouseIsPressed = false; };
    const handleMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        gMouseX = e.clientX - rect.left;
        gMouseY = e.clientY - rect.top;
      }
    };

    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('mousemove', handleMove);

    const { Engine, World, Bodies, Constraint, Vector } = Matter;
    const engine = Engine.create({ positionIterations: 16, velocityIterations: 16, constraintIterations: 20 });
    engineRef.current = engine;

    const getNavWidth = () => Math.min(NAV_MAX_WIDTH, window.innerWidth - 32);

    const navBody = Bodies.rectangle(window.innerWidth / 2, 60, getNavWidth(), NAV_HEIGHT, {
      restitution: 0.1, frictionAir: 0.08, density: 0.05, friction: 0.8, slop: 0.01
    });
    navBodyRef.current = navBody;

    const floor = Bodies.rectangle(window.innerWidth / 2, HERO_NAVBAR_LANDING_Y + (NAV_HEIGHT / 2), window.innerWidth, 20, { isStatic: true, render: { visible: false } });
    floorRef.current = floor;

    const createStrings = (anchorYOffset = 0, currentNavWidth) => {
      const strings = [];
      const anchorX = window.innerWidth / 2;
      
      strings.push(Constraint.create({
        pointA: { x: anchorX, y: anchorYOffset },
        bodyB: navBodyRef.current,
        pointB: { x: 0, y: (-NAV_HEIGHT / 2) + 5 },
        stiffness: 0.9, damping: 0.3, length: 40,
      }));

      return strings;
    };

    let activeStrings = createStrings(0, getNavWidth());
    stringsRef.current = activeStrings;
    World.add(engine.world, [navBody, floor, ...activeStrings]);

    let p5Canvas;
    const sketch = (p) => {
      let branchGrowth = 0;
      let framePMouseX = 0;
      let framePMouseY = 0;
      const requiredLeaves = historyData.length;
      const targetDepth = Math.max(2, Math.ceil(Math.log2(requiredLeaves)) + 1);

      p.setup = () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        
        p5Canvas = p.createCanvas(window.innerWidth, CANVAS_HEIGHT);
        p5Canvas.parent(containerRef.current);
        
        gsap.to({ val: 0 }, {
          val: 1, duration: 2.5, ease: "power3.out",
          onUpdate: function() { branchGrowth = this.targets()[0].val; }
        });
      };

      const distToSegment = (px, py, x1, y1, x2, y2) => {
        const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
        if (l2 === 0) return p.dist(px, py, x1, y1);
        let t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2));
        return p.dist(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
      };

      const lineIntersects = (a, b, c, d, p1, q, r, s) => {
        let det = (c - a) * (s - q) - (r - p1) * (d - b);
        if (det === 0) return false;
        let lambda = ((s - q) * (r - a) + (p1 - r) * (s - b)) / det;
        let gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
      };

      const drawTreeAbsolute = (startX, startY, angle, len, depth) => {
        if (depth <= 0) return;
        const currentLen = len * branchGrowth;
        const endX = startX + Math.cos(angle) * currentLen;
        const endY = startY + Math.sin(angle) * currentLen;

        p.strokeWeight(Math.max(1, depth * 1.2)); 
        p.stroke(0, 0, 0, 200);
        p.line(startX, startY, endX, endY);

        if (depth > 1) { 
          const sway1 = Math.sin(p.frameCount * 0.02 + depth) * 0.03;
          const sway2 = Math.cos(p.frameCount * 0.02 + depth) * 0.03;
          drawTreeAbsolute(endX, endY, angle + (Math.PI / 5) + sway1, len * 0.75, depth - 1);
          drawTreeAbsolute(endX, endY, angle - (Math.PI / 5) + sway2, len * 0.75, depth - 1);
        } else if (depth === 1) {
          leafPositionsRef.current.push({ x: endX, y: endY });
        }
      };

      p.draw = () => {
        p.clear();
        Engine.update(engine);

        const w = window.innerWidth;
        const mobileCheck = w < 768;
        
        if (activeViewRef.current === 2 && !isTransitioningRef.current) {
          const targetY = window.scrollY + window.innerHeight / 2;
          const targetX = w - 50; 
          Matter.Body.setPosition(navBody, { x: targetX, y: navBody.position.y + (targetY - navBody.position.y) * 0.1 });
          Matter.Body.setAngle(navBody, Math.PI / 2); 
        }

        if (activeViewRef.current === 1 && activeStrings.length > 0) {
          Matter.Body.setAngle(navBody, navBody.angle * 0.90); 
        }

        leafPositionsRef.current = [];
        p.strokeCap(p.ROUND);
        
        const treeRootY = getHeroInputY() + 10; 
        const initialBranchLength = mobileCheck ? 50 : 70;
        drawTreeAbsolute(w / 2, treeRootY, -Math.PI / 2, initialBranchLength, targetDepth);

        leafStates.current.forEach((leaf, i) => {
            const domNode = leafRefs.current[i];
            if (!domNode) return;
            if (!leaf.isFallen) {
                const pos = leafPositionsRef.current[i];
                if (pos) gsap.set(domNode, { x: pos.x, y: pos.y, xPercent: -50, yPercent: -50, scale: branchGrowth });
            }
        });

        if (activeViewRef.current === 1) {
          for (let i = activeStrings.length - 1; i >= 0; i--) {
            const constraint = activeStrings[i];
            const posA = constraint.pointA;
            const rotatedPointB = Vector.rotate(constraint.pointB, navBody.angle);
            const posB = Vector.add(navBody.position, rotatedPointB);
            
            const distToMouse = distToSegment(gMouseX, gMouseY, posA.x, posA.y, posB.x, posB.y);
            const isHovered = distToMouse < 60;
            
            p.stroke(0); p.strokeWeight(3); p.noFill();
            if (isHovered && !isTransitioningRef.current) p.bezier(posA.x, posA.y, gMouseX, gMouseY, gMouseX, gMouseY, posB.x, posB.y);
            else p.line(posA.x, posA.y, posB.x, posB.y);

            if (gMouseIsPressed && !isTransitioningRef.current) {
              if (isHovered || lineIntersects(framePMouseX, framePMouseY, gMouseX, gMouseY, posA.x, posA.y, posB.x, posB.y)) {
                vanishingStringsRef.current.push({ x1: posA.x, y1: posA.y, x2: posB.x, y2: posB.y, opacity: 255 });
                World.remove(engine.world, constraint);
                activeStrings.splice(i, 1);
              }
            }
          }
        }

        framePMouseX = gMouseX; framePMouseY = gMouseY;

        for (let i = vanishingStringsRef.current.length - 1; i >= 0; i--) {
          let v = vanishingStringsRef.current[i];
          v.opacity -= 12; 
          if (v.opacity <= 0) { vanishingStringsRef.current.splice(i, 1); continue; }
          p.stroke(0, v.opacity); p.strokeWeight(3); p.line(v.x1, v.y1, v.x2, v.y2); 
        }

        if (activeViewRef.current === 1 && activeStrings.length === 0 && !isTransitioningRef.current) {
          if (mobileCheck && !isFallenRef.current) {
             Matter.Body.setStatic(navBody, true);
             Matter.Body.setPosition(navBody, { x: window.innerWidth / 2, y: 60 });
             Matter.Body.setAngle(navBody, 0);
             
             isFallenRef.current = true;
             setTimeout(() => setIsFallen(true), 150);
          } else if (!mobileCheck) {
             if (!isZoomingRef.current && !isZoomingOutRef.current) {
                isZoomingRef.current = true;
                mainWrapperRef.current.style.transformOrigin = "50% 350px"; 
                gsap.to(mainWrapperRef.current, { scale: 1.15, duration: 2.5, ease: "power2.out" });
             }
          }
        }

        if (navRef.current) {
          const { x, y } = navBody.position;
          navRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${navBody.angle}rad) `;
          navRef.current.style.opacity = `1`; 
          
          if (activeViewRef.current === 1 && activeStrings.length === 0 && !isFallenRef.current) {
            if (!mobileCheck && y > HERO_NAVBAR_LANDING_Y - 30) {
              isFallenRef.current = true;
              setTimeout(() => setIsFallen(true), 150); 
              isZoomingRef.current = false;
              isZoomingOutRef.current = true;
              gsap.to(mainWrapperRef.current, { scale: 1, duration: 1.5, ease: "power2.inOut", onComplete: () => { isZoomingOutRef.current = false; } });
            }
          }
        }
      };
    };

    const p5Instance = new p5(sketch);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const mobileCheck = window.innerWidth < 768;

      if (mobileCheck) return; 

      if (scrollY > 400 && activeViewRef.current === 1 && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        setActiveView(2); setIsFallen(false); 
        Matter.Body.setPosition(floorRef.current, { x: window.innerWidth/2, y: 9999 });

        if (!isFallenRef.current && activeStrings.length > 0) World.remove(engine.world, activeStrings);
        Matter.Body.setStatic(navBody, true);

        const { x: startX, y: startY } = navBody.position;
        const startAngle = navBody.angle;
        
        gsap.to({ progress: 0 }, {
          progress: 1, duration: 0.7, ease: "power3.inOut", 
          onUpdate: function() {
            const p = this.targets()[0].progress;
            const targetX = window.innerWidth - 50; 
            const liveTargetY = window.scrollY + window.innerHeight / 2; 
            Matter.Body.setPosition(navBody, { x: startX + (targetX - startX) * p, y: startY + (liveTargetY - startY) * p });
            Matter.Body.setAngle(navBody, startAngle + (Math.PI / 2 - startAngle) * p);
          },
          onComplete: () => { 
            Matter.Body.setStatic(navBody, false); 
            isTransitioningRef.current = false;
            if (window.scrollY < 50) handleScroll(); 
          }
        });
      }
      
      if (scrollY < 50 && activeViewRef.current === 2 && !isTransitioningRef.current) {
        isTransitioningRef.current = true; setActiveView(1);
        Matter.Body.setStatic(navBody, true);

        const { x: startX, y: startY } = navBody.position;
        const startAngle = navBody.angle;
        
        gsap.to({ progress: 0 }, {
          progress: 1, duration: 0.7, ease: "power3.inOut",
          onUpdate: function() {
            const p = this.targets()[0].progress;
            const targetX = window.innerWidth / 2;
            const targetY = isFallenRef.current ? HERO_NAVBAR_LANDING_Y : 60;
            Matter.Body.setPosition(navBody, { x: startX + (targetX - startX) * p, y: startY + (targetY - startY) * p });
            Matter.Body.setAngle(navBody, startAngle + (0 - startAngle) * p);
          },
          onComplete: () => {
            Matter.Body.setStatic(navBody, false);
            Matter.Body.setPosition(floorRef.current, { x: window.innerWidth/2, y: HERO_NAVBAR_LANDING_Y + (NAV_HEIGHT/2) });
            if (!isFallenRef.current && activeStrings.length > 0) World.add(engine.world, activeStrings);
            isTransitioningRef.current = false;
            if (window.scrollY > 400) handleScroll(); 
          }
        });
      }
    };

    const handleResize = () => {
      if (p5Canvas) p5Canvas.size(window.innerWidth, CANVAS_HEIGHT);
      Matter.Body.setPosition(floorRef.current, { x: window.innerWidth / 2, y: floorRef.current.position.y });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mousemove', handleMove);
      p5Instance.remove();
      World.clear(engine.world);
      Engine.clear(engine);
    };
  }, []);

  const handleLeafCut = (index) => {
    const leaf = leafStates.current[index];
    if (leaf.isFallen) return; 
    
    const domNode = leafRefs.current[index];
    if (!domNode) return;

    leaf.isFallen = true;
    const startPos = leafPositionsRef.current[index];
    const mobileCheck = window.innerWidth < 768;
    const isLeftEdge = Math.random() > 0.5;
    
    const targetX = isLeftEdge 
        ? (mobileCheck ? 20 : 50) + Math.random() * 40
        : window.innerWidth - (mobileCheck ? 20 : 50) - Math.random() * 40;
    const targetY = 800 + Math.random() * 400; 

    const tl = gsap.timeline();
    tl.to(domNode, { y: startPos.y - 80 - Math.random() * 50, x: startPos.x + (Math.random() - 0.5) * 80, scale: 1, duration: 0.4, ease: "power2.out" })
      .to(domNode, { x: targetX, y: targetY, duration: 1.5 + Math.random(), ease: "power1.inOut" });
  };

  return (
    <div className="relative w-full h-[1200px] bg-white text-black font-sans overflow-x-hidden selection:bg-black selection:text-white ">
      <div ref={mainWrapperRef} className="absolute top-0 left-0 w-full h-[1200px] z-10  transform-gpu">
        <div className="absolute inset-0 z-[0] bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNDBMMDAgMEw0MCA0MFoiIGZpbGw9IiNlN2U3ZTciLz48L3N2Zz4=')] border-b-4 border-black z-[10] pointer-events-none"></div>

        <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none">
          <div className="absolute inset-0 flex flex-wrap opacity-25 content-start" style={{ width: `${gridCols * 40}px` }}>
            {gridThumbnails.map((item, i) => (
               <div key={item.gridId} className="relative w-[40px] h-[40px] pointer-events-auto group/thumb z-[1] hover:z-[50]">
                 {/* 5. Added will-change-transform for native GPU acceleration */}
                 <div
                   ref={el => gridRefs.current[i] = el}
                   className="will-change-transform absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/thumb:scale-[4.5] group-hover/thumb:shadow-[0_20px_40px_rgba(0,0,0,0.5)] origin-center group-hover/thumb:z-[50] rounded-[1px] group-hover/thumb:rounded-[2px] overflow-hidden"
                 >
                   <img src={item.thumb} alt={item.title} className="w-full h-full object-cover filter grayscale opacity-15 transition-all duration-300 group-hover/thumb:grayscale-0 group-hover/thumb:opacity-100" />
                   <div className="thumb-caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-[1.5px] opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100 flex flex-col justify-end">
                     <p className="text-white font-bold text-[3px] leading-tight line-clamp-2">{item.title}</p>
                     <p className="text-white/80 font-bold text-[1.5px] mt-[0.5px] uppercase tracking-widest">{item.channel}</p>
                   </div>
                 </div>
               </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white to-transparent z-[5] pointer-events-none"></div>
        </div>

        <div className="absolute top-[600px] left-0 w-full h-48 bg-gradient-to-b from-white to-transparent z-[5] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white to-transparent z-[5] pointer-events-none"></div>
        
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[20]"></div>

        <div className="pointer-events-auto z-[3]">
          <Hero isFallen={isFallen} activeView={activeView} heroInputY={getHeroInputY()} />
        </div>

        {historyData.map((item, i) => (
           <div 
              key={item.id}
              ref={el => leafRefs.current[i] = el}
              onClick={() => handleLeafCut(i)}
              className="absolute top-0 left-0 w-10 h-10 md:w-12 md:h-12 rounded-full cursor-pointer group z-[60] pointer-events-auto will-change-transform animate-pulse flex items-center justify-center"
              style={{ background: 'radial-gradient(circle, rgba(255,255,220,0.8) 5%, rgba(100,255,100,0.4) 30%, rgba(100,255,100,0) 70%)' }}
           >
              <div className="absolute bottom-3/4 left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-white border-2 border-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <img src={item.thumb} alt={item.title} className="w-full h-24 object-cover rounded mb-2 border border-black" />
                  <p className="font-bold text-xs md:text-sm text-black mb-1 line-clamp-2 leading-tight">{item.title}</p>
                  <div className="flex flex-col gap-1 text-[9px] md:text-[10px] text-gray-600 font-semibold uppercase tracking-wider border-t border-gray-200 pt-1 mt-1">
                      <span>Watched: {item.timeSpent}</span>
                      <span>{item.channel}</span>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-black transform rotate-45 -mt-2"></div>
              </div>
           </div>
        ))}
      </div>

      {mounted && typeof document !== 'undefined'
        ? createPortal(
            <Navbar 
              navRef={navRef} 
              activeView={activeView} 
              maxWidth={NAV_MAX_WIDTH} 
              height={NAV_HEIGHT}
              isMobile={isMobile}
            />,
            document.body
          )
        : null}

    </div>
  );
};

export default YatnizeSystem;