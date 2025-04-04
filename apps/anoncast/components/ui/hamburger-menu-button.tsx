'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function HamburgerMenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

  
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
  
  <button
  className="fflex right-6 z-50 w-14 h-14 flex items-center justify-center bg-black/70 text-white rounded-full shadow-xl transition-transform duration-300 hover:scale-105 gradient-border-wrapper"
  onClick={toggleMenu}
  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
  style={{
    background: "rgba(0, 0, 0, 0.7) !important",
    backdropFilter: "blur(8px)", // Adjust blur intensity as needed
    WebkitBackdropFilter: "blur(8px)", // Safari support
  }}
>
  {isMenuOpen ? '✕' : '☰'}
</button>


   
      {isMenuOpen &&
  createPortal(
    <div className="fixed inset-0 z-40 bg-black/50 bg-opacity-95 backdrop-blur-xl flex flex-col items-center justify-center gap-12 overflow-hidden">
      <nav className="flex flex-col items-center gap-12 text-4xl text-white">
        <div className="flex flex-col items-center gap-6"> 
          <a href="https://dexscreener.com/base/0x1CEcCbE4d3a19cB62DbBd09756A52Cfe5394Fab8" target="_blank" rel="noopener noreferrer" className="font-bold hover:scale-105 hover:rotate-2 hover:text-primary">
            Dex Screener
          </a>
          <a href="https://app.uniswap.org/swap?outputCurrency=0x1CEcCbE4d3a19cB62DbBd09756A52Cfe5394Fab8&chain=base" target="_blank" rel="noopener noreferrer" className="font-bold hover:scale-105 hover:rotate-2 hover:text-primary">
            Uniswap
          </a>
          <a href="https://www.geckoterminal.com/base/pools/0xe43e9d214a4bcb01c2fade45359bea37e74f314e" target="_blank" rel="noopener noreferrer" className="font-bold hover:scale-105 hover:rotate-2 hover:text-primary">
            GeckoTerminal
          </a>
          <a href="https://web3.bitget.com/en/swap/base/0x1CEcCbE4d3a19cB62DbBd09756A52Cfe5394Fab8?isShowHint=false" target="_blank" rel="noopener noreferrer" className="font-bold hover:scale-105 hover:rotate-2 hover:text-primary">
            Bitget
          </a>
        </div>
        <div className="flex flex-col items-center gap-6"> 
          <a href="https://github.com/Diskyeth/RumourCast-V2" target="_blank" rel="noopener noreferrer" className="font-light hover:scale-105 hover:rotate-2 hover:text-primary">
            Github
          </a>
          <a href="https://paragraph.xyz/@disky.eth/rumourcast-roadmap" target="_blank" rel="noopener noreferrer" className="font-light hover:scale-105 hover:rotate-2 hover:text-primary">
            Roadmap
          </a>
        </div>
      </nav>
    </div>,
    document.body
  )}


    </>
  );
}
