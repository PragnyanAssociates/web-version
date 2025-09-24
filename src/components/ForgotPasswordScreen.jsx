import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const showBackButton = useScrollButtonVisibility();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailToValidate) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleSendCodeRequest = async () => {
    if (!email.trim()) {
      return window.alert("Email Required: Please enter your email address.");
    }
    if (!validateEmail(email)) {
      return window.alert("Invalid Email: Please enter a valid email address.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        window.alert(data.message || "If this email exists, a reset code was sent.");
        // Navigate to Reset Password screen with email as param
        navigate("/ResetPasswordScreen", { state: { email } });
      } else {
        window.alert(data.message || "An error occurred on the server.");
      }
    } catch (error) {
      console.error("Forgot Password network error:", error);
      window.alert("Connection Error: Could not connect to the server.");
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
              Forgot Password
            </h1>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
        </div>

        {/* Content Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 transform transition-all duration-500 hover:shadow-3xl">
            {/* Description */}
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-wide">
                Reset Your Password
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Enter the email address associated with your Donor account. If an
                account exists, we will send a 6-digit reset code.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                  Email Address
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
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-gray-200/60 rounded-2xl p-4 pl-12 w-full focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Submit Button - SAME STYLE as TeacherAdminHealthScreen */}
              <button
                onClick={handleSendCodeRequest}
                disabled={loading}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl w-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="relative">
                      <div className="h-5 w-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                    </div>
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Send Reset Code</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {/* Footer Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Remember your password?{" "}
                <button
                  onClick={() => navigate(-1)}
                  className="font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200 focus:outline-none focus:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
