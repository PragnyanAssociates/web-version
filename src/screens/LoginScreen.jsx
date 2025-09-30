// 📂 File: src/screens/LoginScreen.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import pragnyanLogo from '../assets/pragnyanlatest.png'; // Correct logo path
import { useAuth } from '../context/AuthContext.tsx';
import { API_BASE_URL } from '../apiConfig';

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const role = location.state?.role || 'student';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const showAlert = (title, message) => {
    alert(`${title}: ${message}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!username || !password) {
      showAlert("Input Required", "Please enter your details.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.user.role !== role) {
          showAlert("Login Failed", `You are not registered as a ${role}. Please check your credentials or selected role.`);
          setIsLoggingIn(false);
          return;
        }
        await login(data.user, data.token);
        // Navigate based on role
        navigate(`/${capitalize(data.user.role)}Dashboard`);
      } else {
        showAlert("Login Failed", data.message || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert("An Error Occurred", "Could not connect to the server. Please try again later.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 opacity-50">
        <div className="w-96 h-96 bg-blue-200/50 rounded-full blur-3xl" />
      </div>
      <div className="pointer-events-none absolute -bottom-40 -right-40 opacity-50">
        <div className="w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl z-10 animate-slide-up">
        <div className="grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl shadow-slate-300/60 overflow-hidden border border-slate-200/50">
          
          {/* Left Column: Branding & Illustration */}
          <div className="hidden md:flex flex-col justify-center items-center p-8 md:p-12 bg-gradient-to-br from-slate-100 to-gray-200/70 border-r border-slate-200/50">
            <img src={pragnyanLogo} alt="Pragnyan Logo" className="w-28 h-28 object-contain mb-6" />
            <h1 className="text-2xl font-bold text-slate-800 text-center">PRAGNYAN ASSOCIATES</h1>
            <p className="text-slate-600 mt-2 text-center">Secure, Simple, and Efficient.</p>
          </div>

          {/* Right Column: Form */}
          <div className="p-8 md:p-12">
            <div className="flex md:hidden items-center justify-center mb-6">
                <img src={pragnyanLogo} alt="Pragnyan Logo" className="w-20 h-20 object-contain" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-1">
              {capitalize(role)} Login
            </h2>
            <p className="text-center text-slate-500 mb-8">Welcome back! Please enter your details.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username / Student ID */}
              <div>
                <label htmlFor="username" className="block mb-2 text-slate-700 font-semibold tracking-wide">
                  {role === 'student' ? 'Student ID' : 'Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    id="username" type="text"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={role === 'student' ? 'Enter your student ID' : 'Enter your username'}
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block mb-2 text-slate-700 font-semibold tracking-wide">
                  Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                  <input
                    id="password" type="password"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit" disabled={isLoggingIn}
                className={`w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 ease-out transform hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 active:scale-[0.98] text-lg tracking-wide ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4z"></path></svg>
                    <span>Signing In...</span>
                  </div>
                ) : 'Login'}
              </button>

              <div className="text-center">
                 <button type="button" onClick={() => navigate(-1)} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                    Back to Role Selection
                 </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up { animation: slide-up 0.7s ease-out both; }
      `}</style>
    </div>
  );
}