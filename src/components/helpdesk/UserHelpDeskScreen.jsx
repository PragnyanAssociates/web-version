import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHelpOutline, MdArrowForward, MdSend, MdArrowBack, MdHistory, MdExpandMore } from "react-icons/md";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE_URL } from "../../apiConfig";
import { HistoryView, TicketDetailsView } from "./AdminHelpDeskScreen"; // Shared components

// --- Icon Components for Header ---
// NOTE: All icon components (UserIcon, HomeIcon, etc.) from the original code are unchanged.
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
function ProfileAvatar() {
  const { getProfileImageUrl } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const hasValidImage = getProfileImageUrl() && !imageError && imageLoaded
  
  return (
    <div className="relative w-7 h-7 sm:w-9 sm:h-9">
      {/* Always render the user placeholder */}
      <div className={`absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center border-2 border-slate-400 transition-opacity duration-200 ${hasValidImage ? 'opacity-0' : 'opacity-100'}`}>
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
        </svg>
      </div>
      
      {/* Profile image overlay */}
      {getProfileImageUrl() && (
        <img 
          src={getProfileImageUrl()} 
          alt="Profile" 
          className={`absolute inset-0 w-full h-full rounded-full border border-slate-200 object-cover transition-opacity duration-200 ${hasValidImage ? 'opacity-100' : 'opacity-0'}`}
          onError={() => {
            setImageError(true)
            setImageLoaded(false)
          }}
          onLoad={() => {
            setImageError(false)
            setImageLoaded(true)
          }}
        />
      )}
    </div>
  )
}   



const UserHelpDeskScreen = () => {
  const navigate = useNavigate();
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  
  // --- State for Help Desk Functionality ---
  const [view, setView] = useState("main");
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const pageInfo = useMemo(() => {
    switch(view) {
        case "history":
            return { title: "My Query History", subtitle: "View the status of your submitted queries" };
        case "details":
            return { title: "Ticket Details", subtitle: `Viewing details for ticket #${selectedTicketId}` };
        default: // main
            return { title: "Help Desk & Support", subtitle: "Find answers or submit a support request" };
    }
  }, [view, selectedTicketId]);

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
          if (!user?.id) return;
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
          }
      }
      fetchProfile();
  }, [user]);

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
  
  const handleBackNavigation = () => {
    if (view === 'details') {
      setView('history');
      setSelectedTicketId(null);
    } else if (view === 'history') {
      setView('main');
    } else {
      navigate(getDefaultDashboardRoute());
    }
  };

  const handleViewHistory = () => setView("history");
  const handleViewDetails = (ticketId) => {
    setSelectedTicketId(ticketId);
    setView("details");
  };
  
  const renderContent = () => {
    switch (view) {
        case "history":
            // The onBack prop is removed to avoid a second back button
            return <HistoryView onViewDetails={handleViewDetails} />;
        case "details":
            // The onBack prop is removed to avoid a second back button
            return <TicketDetailsView ticketId={selectedTicketId} isAdmin={false} />;
        default: // main
            return <MainHelpView onViewHistory={handleViewHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
           <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">{pageInfo.title}</h1>
                        <p className="text-xs sm:text-sm text-slate-600">{pageInfo.subtitle}</p>
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
                            <button
                                onClick={() => navigate(getDefaultDashboardRoute())}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                                type="button"
                                title="Home"
                            >
                                <HomeIcon />
                                <span className="hidden md:inline">Home</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button
                                onClick={() => navigate("/AcademicCalendar")}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                                type="button"
                                title="Calendar"
                            >
                                <CalendarIcon />
                                <span className="hidden md:inline">Calendar</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button
                                onClick={() => navigate("/ProfileScreen")}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                                type="button"
                                title="Profile"
                            >
                                <UserIcon />
                                <span className="hidden md:inline">Profile</span>
                            </button>
                        </div>

                        <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />

                        <div className="flex items-center gap-2 sm:gap-3">
                                <ProfileAvatar />
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">
                                    {profile?.full_name || profile?.username || "User"}
                                </span>
                                <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                <span className="hidden sm:inline">Logout</span>
                                <span className="sm:hidden">Exit</span>
                            </button>
                            <button
                                onClick={() => navigate("/NotificationsScreen")}
                                className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                aria-label="Notifications"
                                title="Notifications"
                                type="button"
                            >
                                <BellIcon />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
                <button
                    onClick={handleBackNavigation}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back"
                >
                    <MdArrowBack />
                    <span>
                        {view === 'main' && 'Back to Dashboard'}
                        {view === 'history' && 'Back to Help Desk'}
                        {view === 'details' && 'Back to Query History'}
                    </span>
                </button>
            </div>
            {renderContent()}
        </main>
    </div>
  );
};

const MainHelpView = ({ onViewHistory }) => {
  const [faqs, setFaqs] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/helpdesk/faqs`)
      .then((res) => res.json())
      .then(setFaqs)
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      alert("Please provide both a subject and a description.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/helpdesk/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, subject, description }),
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        setSubject("");
        setDescription("");
      }
    } catch {
      alert("Could not submit query.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

      {/* --- LEFT COLUMN: Query Submission Form --- */}
      <div className="lg:col-span-3 bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 p-6 md:p-8">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Submit a New Query</h2>
            <p className="text-slate-600 mt-1">Can't find an answer? Let us know how we can help.</p>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
            <input
              id="subject"
              type="text"
              placeholder="e.g., Issue with assignment submission"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition duration-200 bg-white"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea
              id="description"
              placeholder="Please describe your issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 rounded-md border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition duration-200 bg-white resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
                disabled={submitting}
                onClick={handleSubmit}
                className={`inline-flex items-center gap-2.5 font-semibold py-2.5 px-5 rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                submitting 
                    ? "bg-slate-400 cursor-not-allowed text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500"
                }`}
            >
                {submitting ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                </>
                ) : (
                <>
                    <MdSend size={18} />
                    <span>Submit Query</span>
                </>
                )}
            </button>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: History Link & FAQs --- */}
      <div className="lg:col-span-2 space-y-8">
        
        <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 p-6">
             <h3 className="font-bold text-slate-800 text-lg mb-3">Track Your Queries</h3>
            <button
              onClick={onViewHistory}
              className="w-full flex justify-between items-center bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <MdHistory size={20} />
                <span>View My Query History</span>
              </div>
              <MdArrowForward size={20} />
            </button>
        </div>

        <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-800">Quick Answers</h2>
            <p className="text-slate-600 mt-1">Find answers to common questions below.</p>
          </div>
          <div className="space-y-2">
            {faqs.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MdHelpOutline size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-600">No FAQs available.</p>
              </div>
            ) : (
              faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="flex justify-between items-center w-full p-4 text-left hover:bg-slate-100/70 transition-colors duration-200 rounded-t-md"
                  >
                    <span className="font-medium text-slate-800 pr-4">{faq.question}</span>
                    <MdExpandMore className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4 bg-white/50">
                      <p className="text-slate-700 leading-relaxed text-sm pt-2">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserHelpDeskScreen;