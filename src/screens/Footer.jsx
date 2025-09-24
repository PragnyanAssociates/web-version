import React from "react";
import { useNavigate } from "react-router-dom";

// Email Icon Component
function EmailIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="22,6 12,13 2,6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Phone Icon Component
function PhoneIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative w-full bg-slate-100 py-3 mt-16 shadow-sm border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main Content - Two Rows */}
        <div className="space-y-3">
          {/* Row 1: Copyright Section */}
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">
              © 2025 Pragnyan Associates. All rights reserved.
            </p>
          </div>

          {/* Row 2: Contact Info and Version Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Contact Options */}
            <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-1">
              <a
                href="mailto:pragnyanhyd@gmail.com"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                title="Send Email"
              >
                <EmailIcon />
                <span className="text-sm">pragnyanhyd@gmail.com</span>
              </a>

              <a
                href="tel:+918019353556"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                title="Call Us"
              >
                <PhoneIcon />
                <span className="text-sm">+91 8019353556</span>
              </a>
            </div>

            {/* Version Info */}
            <div className="flex items-center space-x-3 text-xs text-gray-500 order-1 sm:order-2">
              <span className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                Version 1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
