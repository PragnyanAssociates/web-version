import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

// Scroll-based visibility hook (EXACT SAME as TeacherAdminHealthScreen)
const useScrollButtonVisibility = () => {
  const [showBackButton, setShowBackButton] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowBackButton(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowBackButton(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  return showBackButton;
};

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = useScrollButtonVisibility();

  // Retrieve email passed from ForgotPasswordScreen
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!code || !password || !confirmPassword) {
      return window.alert("Error: Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return window.alert("Error: Passwords do not match.");
    }
    if (password.length < 6) {
      return window.alert("Error: Password must be at least 6 characters long.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          token: code,
          newPassword: password,
        }),
      });

      const data = await response.json();
      console.log("Backend Response:", { status: response.status, body: data });

      if (response.ok) {
        window.alert(data.message || "Password reset successful!");
        navigate("/login");
      } else {
        window.alert(data.message || "Reset failed. Please try again.");
      }
    } catch (error) {
      console.error("Fatal API Call Error on password reset:", error);
      window.alert(
        "Network Error: Unable to connect to the server. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {/* EXACT SAME Back Button as TeacherAdminHealthScreen */}
      <button
        onClick={() => navigate(-1)}
        className={`fixed top-8 left-4 sm:left-8 z-50 w-10 h-10 sm:w-8 sm:h-8 bg-teal-500 shadow-lg flex items-center justify-center rounded-full hover:bg-teal-600 active:scale-95 transition-all duration-300 ${
          showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        title="Back"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 pb-4">
        {/* Enhanced Title with Icon - SAME STYLE as TeacherAdminHealthScreen */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
              Reset Your Password
            </h1>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
        </div>

        {/* Content Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 transform transition-all duration-500 hover:shadow-3xl">
            {/* Email Display */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                A reset code was sent to <span className="font-semibold text-teal-700">{email}</span>. Please enter it below.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Code Input */}
              <div className="relative">
                <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                  6-Digit Reset Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM9 12h6m-6 4h6m-6-8h6"
                      />
                    </svg>
                  </div>
                  <input
                    id="code"
                    type="text"
                    placeholder="6-Digit Code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="border-2 border-gray-200/60 rounded-2xl p-4 pl-12 w-full text-center focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* New Password Input */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-gray-200/60 rounded-2xl p-4 pl-12 w-full focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-2 border-gray-200/60 rounded-2xl p-4 pl-12 w-full focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base"
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-teal-50/80 backdrop-blur-sm rounded-xl p-4 border border-teal-100">
                <p className="text-sm text-teal-700 font-medium mb-2">Password Requirements:</p>
                <ul className="text-xs text-teal-600 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Both passwords must match</li>
                </ul>
              </div>

              {/* Submit Button - SAME STYLE as TeacherAdminHealthScreen */}
              <button
                onClick={handleReset}
                disabled={loading}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl w-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="relative">
                      <div className="h-5 w-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                    </div>
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Reset Password</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {/* Footer Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code?{" "}
                <button
                  onClick={() => navigate(-1)}
                  className="font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200 focus:outline-none focus:underline"
                >
                  Go Back
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
