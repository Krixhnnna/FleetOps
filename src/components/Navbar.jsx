import React, { useState } from 'react';

export default function Navbar({ onNavigate, currentView }) {
  const [isOpen, setIsOpen] = useState(false);

  // Simple helper to scroll to sections
  const handleScroll = (id) => {
    setIsOpen(false);
    if (currentView !== 'home') {
      onNavigate('home');
      // Wait for view update
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (view) => {
    setIsOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => handleNavigate('home')} 
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm flex items-center justify-center">
            {/* Custom premium geometric logo */}
            <svg 
              className="w-5 h-5 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-900">
            Fleet<span className="text-blue-600 font-extrabold">Ops</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => handleNavigate('home')}
            className={`text-sm font-medium transition-colors focus:outline-none focus-visible:text-blue-600 cursor-pointer ${
              currentView === 'home' 
                ? 'text-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => handleScroll('features')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus-visible:text-blue-600 cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => handleScroll('why-fleetops')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus-visible:text-blue-600 cursor-pointer"
          >
            Why FleetOps
          </button>
          <button 
            onClick={() => handleScroll('contact')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus-visible:text-blue-600 cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Desktop CTA & Hamburger Wrapper */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {currentView === 'login' ? (
              <button
                onClick={() => handleNavigate('home')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 cursor-pointer"
              >
                Back to Home
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigate('login')}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleScroll('contact')}
                  className="hidden sm:inline-flex text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors px-4 py-2 rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer"
                >
                  Request Demo
                </button>
              </>
            )}
          </div>

          {/* Hamburger Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md shadow-lg animate-in slide-in-from-top-4 duration-200">
          <div className="px-6 py-4 flex flex-col gap-4 text-left">
            <button 
              onClick={() => handleNavigate('home')}
              className={`text-sm font-semibold py-1.5 focus:outline-none cursor-pointer ${
                currentView === 'home' ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handleScroll('features')}
              className="text-sm font-semibold text-slate-600 py-1.5 focus:outline-none cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => handleScroll('why-fleetops')}
              className="text-sm font-semibold text-slate-600 py-1.5 focus:outline-none cursor-pointer"
            >
              Why FleetOps
            </button>
            <button 
              onClick={() => handleScroll('contact')}
              className="text-sm font-semibold text-slate-600 py-1.5 focus:outline-none cursor-pointer"
            >
              Contact
            </button>
            
            <hr className="border-slate-100 my-1" />
            
            {currentView === 'login' ? (
              <button
                onClick={() => handleNavigate('home')}
                className="text-sm font-semibold text-slate-600 py-2 focus:outline-none cursor-pointer text-center"
              >
                Back to Home
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleNavigate('login')}
                  className="w-full text-center text-sm font-semibold text-slate-700 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleScroll('contact')}
                  className="w-full text-center text-sm font-semibold text-white bg-blue-600 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  Request Demo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
