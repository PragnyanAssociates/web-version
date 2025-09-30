import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { MdErrorOutline, MdArrowBack } from 'react-icons/md';

// --- Icon Components for Header (Unchanged) ---
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

const StudentExamScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  
  // --- State for Exam Screen ---
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showList, setShowList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Hooks for Header ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
        if (!token) { setUnreadCount?.(0); return; }
        try {
            // ★★★ 2. USE apiClient FOR NOTIFICATIONS ★★★
            const response = await apiClient.get('/notifications');
            const data = response.data;
            const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
            setLocalUnreadCount(count);
            setUnreadCount?.(count);
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
          if (!user?.id) { setLoadingProfile(false); return; }
          setLoadingProfile(true);
          try {
              // ★★★ 3. USE apiClient FOR PROFILE ★★★
              const response = await apiClient.get(`/profiles/${user.id}`);
              setProfile(response.data);
          } catch {
              setProfile({
                  id: user.id,
                  username: user.username || "Unknown",
                  full_name: user.full_name || "User",
                  role: user.role || "user",
              });
          } finally {
              setLoadingProfile(false);
          }
      }
      fetchProfile();
  }, [user]);

  // --- Helper Functions (Unchanged) ---
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

  const fetchSchedule = useCallback(async () => {
    if (!user || !user.class_group) {
      setError("You are not assigned to a class.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // ★★★ 4. USE apiClient FOR EXAM SCHEDULES - MATCHES MOBILE VERSION ★★★
      const response = await apiClient.get(`/exam-schedules/class/${user.class_group}`);
      const data = response.data;
      
      if (Array.isArray(data)) {
        setSchedules(data);
        if (data.length === 1) {
          setSelectedSchedule(data[0]);
          setShowList(false);
        } else if (data.length > 1) {
          setSelectedSchedule(data[0]);
          setShowList(true);
        } else { // Handle empty array case
          throw new Error("No exam schedule has been published for your class yet.");
        }
      } else { // Handle single object case
        setSchedules([data]);
        setSelectedSchedule(data);
        setShowList(false);
      }
    } catch (error) {
      // ★★★ 5. MATCH MOBILE ERROR HANDLING PATTERNS ★★★
      const errorMessage = error.response?.status === 404 
        ? "No exam schedule has been published for your class yet."
        : error.response?.data?.message || "Failed to fetch the exam schedule.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const renderScheduleSelector = () => {
    if (!showList || schedules.length <= 1) return null;

    return (
      <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Available Schedules ({schedules.length})
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule, index) => (
            <button
              key={schedule.id || index}
              onClick={() => setSelectedSchedule(schedule)}
              className={`text-left p-4 rounded-lg border transition-all duration-300 transform hover:-translate-y-1 ${
                selectedSchedule?.id === schedule.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="font-semibold text-sm mb-1 line-clamp-2">
                {schedule.title}
              </div>
              {schedule.subtitle && (
                <div className="text-xs opacity-80 line-clamp-1">
                  {schedule.subtitle}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (!selectedSchedule || !selectedSchedule.schedule_data) return null;
    
    return (
      <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-md">
        {/* --- Desktop Table Header --- */}
        <div className="hidden md:grid md:grid-cols-12 bg-slate-50 border-b border-slate-200">
          <div className="col-span-3 text-left font-semibold text-sm text-slate-600 py-3 px-4 tracking-wide uppercase">Date</div>
          <div className="col-span-5 text-left font-semibold text-sm text-slate-600 py-3 px-4 tracking-wide uppercase">Subject</div>
          <div className="col-span-2 text-center font-semibold text-sm text-slate-600 py-3 px-4 tracking-wide uppercase">Time</div>
          <div className="col-span-2 text-center font-semibold text-sm text-slate-600 py-3 px-4 tracking-wide uppercase">Block</div>
        </div>

        <div>
          {selectedSchedule.schedule_data.map((row, index) => {
            if (row.type === "special") {
              return (
                <div key={index} className="bg-blue-50/70 p-4 text-center border-b border-slate-200" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                  <p className="font-semibold text-blue-800 text-sm sm:text-base">{row.mainText}</p>
                  {row.subText && (<p className="text-blue-600 text-xs sm:text-sm mt-1">{row.subText}</p>)}
                </div>
              );
            }
            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 items-center border-b border-slate-200 last:border-b-0 transition-all duration-300 hover:bg-slate-50/70 group" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}>
                
                {/* --- NEW Mobile View Layout (Vertical Key-Value) --- */}
                <div className="md:hidden p-4 space-y-2">
                    <h3 className="font-bold text-base text-slate-800 mb-2">{row.subject}</h3>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                      <span className="font-medium text-slate-500">Date:</span>
                      <span className="font-medium text-slate-700">{row.date}</span>

                      <span className="font-medium text-slate-500">Time:</span>
                      <span className="font-medium text-slate-700">{row.time}</span>

                      <span className="font-medium text-slate-500">Block:</span>
                      <span className="font-bold text-blue-600">{row.block}</span>
                    </div>
                </div>

                {/* --- Desktop View Layout --- */}
                <div className="hidden md:contents">
                  <div className="col-span-3 py-4 px-4 font-medium text-slate-700">{row.date}</div>
                  <div className="col-span-5 py-4 px-4 font-bold text-slate-800">{row.subject}</div>
                  <div className="col-span-2 text-center py-4 px-4 font-medium text-slate-700">{row.time}</div>
                  <div className="col-span-2 text-center py-4 px-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 group-hover:bg-slate-200 transition-colors duration-300 px-4 py-1.5 rounded-full text-xs">
                      {row.block}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    if (isLoading || loadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                    <div className="h-12 w-12 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin shadow-lg"></div>
                </div>
                <p className="mt-4 text-slate-600 font-medium">Loading your exam schedule...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-16">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MdErrorOutline size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">No Schedules Found</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">{error}</p>
                </div>
            </div>
        );
    }
    
    if (selectedSchedule) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 pb-3 tracking-tight relative inline-block">
                        {selectedSchedule.title}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    </h2>
                    {selectedSchedule.subtitle && (
                        <p className="text-lg text-slate-600 font-medium mt-3">{selectedSchedule.subtitle}</p>
                    )}
                </div>
                {renderScheduleSelector()}
                {renderTable()}
            </div>
        );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Exam Schedule</h1>
                        <p className="text-xs sm:text-sm text-slate-600">{user?.class_group ? `Class: ${user.class_group}` : "View your exam schedule"}</p>
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
                            <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home">
                                <HomeIcon />
                                <span className="hidden md:inline">Home</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar">
                                <CalendarIcon />
                                <span className="hidden md:inline">Calendar</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile">
                                <UserIcon />
                                <span className="hidden md:inline">Profile</span>
                            </button>
                        </div>

                        <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />

                        <div className="flex items-center gap-2 sm:gap-3">
                            <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                                <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                            </div>
                            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <span className="hidden sm:inline">Logout</span>
                                <span className="sm:hidden">Exit</span>
                            </button>
                            <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
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
                    onClick={() => navigate(getDefaultDashboardRoute())}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back to Dashboard"
                >
                    <MdArrowBack />
                    <span>Back to Dashboard</span>
                </button>
            </div>
            {renderContent()}
        </main>
        <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .line-clamp-1 {
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
            }

            .line-clamp-2 {
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
        `}</style>
    </div>
  );
};

export default StudentExamScreen;
