import React from 'react';
import Logo from './Logo';

const navItems = [
  { name: 'Home', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> },
  { name: 'About', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
  { name: 'Contact', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> },
  { name: 'Data', icon: <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg> }
];

const Navbar = ({ navRef, activeView, maxWidth, height, isMobile }) => {
  
  const shouldRotate = activeView === 2 && !isMobile;

  return (
    <nav 
      ref={navRef}
      className="absolute top-0 left-0 z-[9999] flex items-center justify-between px-4 md:px-10 bg-white/80 backdrop-blur-md border-4 border-black rounded-[100px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] pointer-events-auto overflow-hidden"
      style={{ width: `${maxWidth}px`, maxWidth: 'calc(100vw - 32px)', height: `${height}px`, willChange: 'transform' }}
    >
      <div 
        className="flex items-center text-lg md:text-2xl font-black uppercase tracking-tighter text-black transition-transform duration-700 origin-center"
        style={{ transform: shouldRotate ? 'rotate(-90deg)' : 'rotate(0deg)' }}
      >
        <Logo />
        <span className={`transition-all duration-300 ${shouldRotate ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto ml-2 md:ml-3'}`}>
          Yatnize
        </span>
      </div>
      <ul className="flex space-x-2 md:space-x-8 text-xs md:text-base font-bold uppercase text-black items-center">
        {navItems.map((item) => (
          <li 
            key={item.name}
            className="cursor-pointer transition-all duration-700 origin-center flex items-center justify-center"
            style={{ transform: shouldRotate ? 'rotate(-90deg)' : 'rotate(0deg)', width: shouldRotate ? '35px' : 'auto' }}
            title={item.name}
          >
            {activeView === 1 || isMobile ? (
              <span className="hover:underline decoration-4 underline-offset-4 text-xs md:text-base">{item.name}</span>
            ) : (
              <div className="p-1.5 md:p-2 hover:bg-black hover:text-white rounded-full transition-colors">{item.icon}</div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;