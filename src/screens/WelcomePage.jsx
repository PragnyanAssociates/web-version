// src/screens/WelcomePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import vspngoLogo from '../assets/pragnyanlatest.png'; // Assuming 'Pragnyan' is the ERP name

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/HomeScreen');
  };

  return (
    // A clean, subtle background for a professional feel, covering the whole screen
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      {/* Decorative background gradients for a modern touch */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      {/* Main content directly on the page, centered */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-4 text-center">
        
        {/* Logo - Significantly increased in size */}
        <img
          src={vspngoLogo}
          alt="Pragnyan ERP Logo"
          className="mx-auto mb-8 h-40 w-40 object-contain" // Increased h- and w- values for a much larger logo
        />

        {/* Title */}
       

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 max-w-md mx-auto">
          The unified platform to manage your institution's resources and operations.
        </p>
        
        {/* Decorative Divider */}
        <div className="mx-auto mt-8 h-1.5 w-28 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />

        {/* Call-to-Action Button */}
        <button
          type="button"
          onClick={handleGetStarted}
          aria-label="Proceed to the application"
          className="mt-12 inline-flex items-center justify-center rounded-full bg-indigo-600 px-10 py-4 text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95"
        >
          <span>Get Started</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-5 w-5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>

      </div>
    </div>
  );
}