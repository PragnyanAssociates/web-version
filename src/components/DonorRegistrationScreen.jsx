import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

const DonorRegistrationScreen = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !username.trim() || !password.trim() || !email.trim()) {
      return window.alert("All fields are required.");
    }

    setLoading(true);

    try {
      const userResponse = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username: username,
          password: password,
          email: email,
          role: "donor",
          class_group: "N/A",
        }),
      });

      const userData = await userResponse.json();
      if (!userResponse.ok) {
        throw new Error(userData.message || "Failed to create user account.");
      }

      window.alert("Registration successful! You can now log in.");
      navigate(-1);
    } catch (error) {
      window.alert(`Registration Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-[#f8f8ff] to-blue-50">
      {/* Header */}
      <header className="py-6 px-6 bg-[#e0f2f7] border-b border-[#b2ebf2] shadow-sm relative">
        <div className="max-w-6xl mx-auto flex items-center justify-center relative">
          {/* Back Button (absolute left aligned) */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-teal-600 hover:text-teal-700 transition"
            aria-label="Go Back"
          >
            <svg height={28} width={28} fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Centered Title */}
          <h1 className="text-2xl font-bold text-teal-700">Donor Registration</h1>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 my-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            Create your donor account
          </h2>

          {/* Form */}
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-12 px-5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
            <input
              type="email"
              placeholder="Email Address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
            <input
              type="text"
              placeholder="Username *"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
            <input
              type="password"
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />

            <button
              onClick={handleRegister}
              disabled={loading}
              className={`w-full h-12 rounded-full flex justify-center items-center font-bold text-lg text-white transition
                ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md"}
              `}
            >
              {loading ? (
                <span className="animate-spin border-4 border-white border-t-transparent rounded-full w-6 h-6"></span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorRegistrationScreen;
