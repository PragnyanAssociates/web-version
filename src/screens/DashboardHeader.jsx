import React from 'react';
import logo from '../assets/pragnyanlatest.png'; // Correct path from screens folder to assets

// Logo Component using imported image
function AcademyLogo() {
  return (
    <img
      src={logo}
      alt="Pragnyan Academy Logo"
      className="w-8 h-8 lg:w-12 lg:h-12 object-contain"
    />
  );
}

// Email Icon Component
function EmailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Phone Icon Component
function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardHeader() {
  return (
    <nav className="sticky top-0 z-40 bg-slate-100 shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 py-2 h-12 flex items-center">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between lg:hidden w-full">
          {/* Logo and Title - Left side on mobile */}
          <div className="flex items-center gap-1.5">
            <AcademyLogo />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 text-pretty mb-0">
              PRAGNYAN ASSOCIATES
            </h1>
          </div>
          
          {/* Contact Options - Right side on mobile */}
          <div className="flex items-center gap-1.5 text-xs">
            <a
              href="mailto:pragnyanhyd@gmail.com"
              className="flex items-center gap-1 px-2 py-0.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
              title="Send Email"
            >
              <EmailIcon />
              <span className="font-semibold">Email</span>
            </a>
            
            <a
              href="tel:+918019353556"
              className="flex items-center gap-1 px-2 py-0.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
              title="Call Us"
            >
              <PhoneIcon />
              <span className="font-semibold">Call</span>
            </a>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between w-full">
          {/* Logo and Title - Left side on desktop */}
          <div className="flex items-center gap-2">
            <AcademyLogo />
            <h1 className="text-base xl:text-xl font-bold text-slate-900 leading-none">
              PRAGNYAN ASSOCIATES
            </h1>
          </div>
          
          {/* Contact Options - Right corner on desktop */}
          <div className="flex items-center gap-2 text-sm">
            <a
              href="mailto:pragnyanhyd@gmail.com"
              className="flex items-center gap-2 px-3 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
              title="Send Email"
            >
              <EmailIcon />
              <span className="group-hover:underline font-bold">pragnyanhyd@gmail.com</span>
            </a>
            
            <a
              href="tel:+918019353556"
              className="flex items-center gap-2 px-3 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
              title="Call Us"
            >
              <PhoneIcon />
              <span className="group-hover:underline font-bold">+91 8019353556</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}