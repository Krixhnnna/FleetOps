import React from 'react';

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-white border-t border-slate-200/80 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
            >
              <div className="bg-blue-600 p-1 rounded-md shadow-xs flex items-center justify-center">
                <svg 
                  className="w-3.5 h-3.5 text-white" 
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
              <span className="font-semibold text-sm tracking-tight text-slate-900">
                Fleet<span className="text-blue-600 font-extrabold">Ops</span>
              </span>
            </button>
            <p className="text-xs text-slate-500 mt-1">
              &copy; {currentYear} FleetOps Technologies, Inc. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-slate-500">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-slate-950 transition-colors focus:outline-none focus-visible:text-blue-600 cursor-pointer"
            >
              About
            </button>
            <a 
              href="mailto:support@fleetops.net"
              className="hover:text-slate-950 transition-colors focus:outline-none focus-visible:text-blue-600"
            >
              Contact
            </a>
            <a 
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-slate-950 transition-colors focus:outline-none focus-visible:text-blue-600"
            >
              Privacy Policy
            </a>
          </div>

          {/* System Version */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>v2.4.1-stable</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
