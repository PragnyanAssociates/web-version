import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from "../../apiConfig";
import { ConversationView } from './DonorSuggestionsScreen';
import { MdArrowBack } from 'react-icons/md';

// --- Icon Components for Header ---
function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" strokeLinecap="round" />
      <path d="M5.5 21a6.5 6.5 0 0113 0" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4m8-10v9a1 1 0 01-1 1h-4m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

// Custom SVG Icons for Suggestions page
function SuggestionIcon() {
  return (
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function StatusBadge({ status }) {
    const colorMap = {
        Open: "bg-yellow-100 text-yellow-800 border-yellow-200",
        "Under Review": "bg-cyan-100 text-cyan-800 border-cyan-200",
        Implemented: "bg-green-100 text-green-800 border-green-200",
        Closed: "bg-red-100 text-red-800 border-red-200",
    };
    const colors = colorMap[status] || "bg-gray-100 text-gray-800";
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold select-none border ${colors}`}>
            {status}
        </span>
    );
}

export default function AdminSuggestionsScreen() {
  const navigate = useNavigate();
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  
  // --- State for Suggestions functionality ---
  const [view, setView] = useState("list");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [filter, setFilter] = useState("Open");
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // --- Hooks for Header Functionality ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
      if (!token) {
        setUnreadCount?.(0);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
          setLocalUnreadCount(count);
          setUnreadCount?.(count);
        } else {
          setUnreadCount?.(0);
        }
      } catch {
        setUnreadCount?.(0);
      }
    }
    fetchUnreadNotifications();
    const id = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(id);
  }, [token, setUnreadCount]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
        if (res.ok) {
          setProfile(await res.json());
        } else {
          setProfile({
            id: user.id,
            username: user.username || "Unknown",
            full_name: user.full_name || "User",
            role: user.role || "user",
          });
        }
      } catch {
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [user]);

  // --- Hook for Suggestions functionality ---
  useEffect(() => {
    if (view !== "list") return;

    async function fetchSuggestions() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/suggestions?status=${encodeURIComponent(filter)}`
        );
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        alert("Error fetching suggestions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, [filter, view]);

  // --- Helper Functions ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/");
    }
  };

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    if (user.role === 'student') return '/StudentDashboard';
    return '/';
  };

  const handleSelect = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setCurrentStatus(suggestion.status);
    setView("details");
  };

  const handleBack = () => {
    setSelectedSuggestion(null);
    setView("list");
  };

  async function handleChangeStatus(newStatus) {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/suggestion/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: selectedSuggestion.id, status: newStatus, adminId: user.id }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setCurrentStatus(newStatus);
      setSuggestions(prev => prev.map(s => s.id === selectedSuggestion.id ? { ...s, status: newStatus } : s));
      alert(`Status updated to "${newStatus}"`);
    } catch (err) {
      alert("Error updating status.");
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  }

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.subject.toLowerCase().includes(query.toLowerCase()) ||
    suggestion.donor_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Manage Suggestions</h1>
              <p className="text-xs sm:text-sm text-slate-600">Review and update suggestions</p>
            </div>
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="relative">
                <input
                  id="module-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
              </div>
              <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />
              <div className="flex items-center gap-2 sm:gap-3">
                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                  <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
                  <BellIcon />
                  {unreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(getDefaultDashboardRoute())}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            title="Back to Dashboard"
          >
            <MdArrowBack />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        {/* --- [DESIGN CHANGED] TAB-STYLE FILTER --- */}
        <div className="flex border-b border-slate-200 mb-8">
          {["Open", "Under Review", "Implemented", "Closed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 -mb-px ${
                filter === status
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-t-lg"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {(loading || loadingProfile) ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SuggestionIcon />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Suggestions Found</h3>
            <p className="text-slate-600">There are no suggestions with the status "{filter}".</p>
          </div>
        ) : (
          // --- [DESIGN CHANGED] CARD-BASED SUGGESTIONS LIST ---
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSelect(suggestion)}
                className="w-full flex items-center gap-4 p-5 text-left transition-all duration-300 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400/50 hover:scale-[1.01]"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
              >
                <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg select-none">{suggestion.donor_name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-blue-600 truncate">{suggestion.subject}</p>
                  <p className="text-sm text-slate-500 mt-1">From: {suggestion.donor_name}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {suggestion.created_at ? new Date(suggestion.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  <StatusBadge status={suggestion.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* --- MODAL IS UNCHANGED --- */}
      {view === "details" && selectedSuggestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-h-[90vh] overflow-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-6 sm:mb-8">
                <button onClick={handleBack} className="mr-4 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 flex-shrink-0">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15.75 19.5L8.25 12l7.5-7.5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <h2 className="flex-1 text-2xl sm:text-3xl font-bold text-slate-800 mr-4 min-w-0 truncate">{selectedSuggestion.subject}</h2>
                <div className="flex-shrink-0">
                  <StatusBadge status={currentStatus} />
                </div>
              </div>
              <div className="mb-8">
                <ConversationView suggestionId={selectedSuggestion.id} isAdmin hideBack />
              </div>
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                <label className="block text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                  Admin: Change Status
                </label>
                <select value={currentStatus} onChange={(e) => handleChangeStatus(e.target.value)} disabled={updatingStatus} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all bg-white disabled:opacity-50">
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Implemented">Implemented</option>
                  <option value="Closed">Closed</option>
                </select>
                {updatingStatus && (
                  <div className="flex items-center mt-3 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                    <span className="text-sm">Updating status...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}