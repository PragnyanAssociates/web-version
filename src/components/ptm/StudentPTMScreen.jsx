import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
    MdPersonOutline,
    MdOutlineSchool,
    MdOutlineBook,
    MdLink,
    MdVideocam,
    MdArrowBack
} from 'react-icons/md';

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

// Custom SVG Icon for PTM Schedule
function PTMScheduleIcon() {
  return (
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

const StudentPTMScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for PTM Screen ---
  const [meetings, setMeetings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const fetchMeetings = useCallback(async () => {
    try {
      setError(null);
      // ★★★ 4. USE apiClient - SIMPLIFIED TO MATCH MOBILE VERSION ★★★
      const response = await apiClient.get('/ptm');
      const meetingsData = response.data;
      meetingsData.sort((a, b) => new Date(b.meeting_datetime) - new Date(a.meeting_datetime));
      setMeetings(meetingsData);
      
      // ★★★ 5. OPTIONAL: FETCH TEACHERS IF NEEDED FOR WEB VERSION ★★★
      try {
        const teachersResponse = await apiClient.get('/ptm/teachers');
        setTeachers(teachersResponse.data);
      } catch (teacherError) {
        // Teachers data is optional for display, continue without it
        console.warn('Could not fetch teacher data:', teacherError);
        setTeachers([]);
      }
    } catch (error) {
      // ★★★ 6. MATCH MOBILE ERROR HANDLING ★★★
      setError(error.response?.data?.message || 'Could not fetch meeting schedules.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMeetings();
  };

  const handleJoinMeeting = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      // ★★★ 7. MATCH MOBILE ALERT STYLE ★★★
      alert('Error: Meeting link is not available.');
    }
  };
  
  const renderContent = () => {
    if (isLoading || loadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-4">
                <div className="h-12 w-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin shadow-lg"></div>
                <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-blue-400 animate-pulse"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading meetings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50/80 rounded-3xl shadow-xl border border-red-200/50 p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-red-700 mb-3">Error Loading Meetings</h3>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
        );
    }
    
    return (
        <>
            <div className="mb-6 flex justify-end">
                <button 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshing ? (
                    <>
                      <div className="h-6 w-6 border-4 border-white/30 rounded-full border-t-white animate-spin"></div>
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                      <span>Refresh</span>
                    </>
                  )}
                </button>
            </div>

            {meetings.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"><PTMScheduleIcon /></div><h3 className="text-xl font-bold text-gray-700 mb-3">No Meetings Found</h3><p className="text-gray-600">No meetings have been scheduled.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {meetings.map((item) => {
                        const teacher = teachers.find(t => t.id === item.teacher_id);
                        const meetingDate = new Date(item.meeting_datetime);
                        const isJoinable = item.status === 'Scheduled' && item.meeting_link;

                        return (
                            <div key={item.id} className="bg-slate-50 rounded-xl shadow-sm border border-slate-200/80 transition-all duration-300 hover:shadow-md hover:border-blue-300">
                                <div className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5">
                                    <div className="flex-shrink-0 text-center w-full sm:w-24 bg-white border border-slate-200 rounded-lg p-3">
                                        <p className="text-blue-600 font-bold text-lg">{meetingDate.toLocaleString('en-US', { month: 'short' })}</p>
                                        <p className="text-slate-800 font-extrabold text-3xl my-0.5">{meetingDate.getDate()}</p>
                                        <p className="text-slate-500 text-sm">{meetingDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex items-center gap-3 text-base"><MdPersonOutline className="w-5 h-5 text-slate-400 flex-shrink-0" /><span className="font-semibold text-slate-800 truncate">{teacher ? teacher.full_name : 'N/A'}</span></div>
                                        <div className="flex items-center gap-3 text-sm"><MdOutlineSchool className="w-5 h-5 text-slate-400 flex-shrink-0" /><span className="text-slate-600">Class: <span className="font-medium text-slate-700">{item.class_group}</span></span></div>
                                        <div className="flex items-center gap-3 text-sm"><MdOutlineBook className="w-5 h-5 text-slate-400 flex-shrink-0" /><span className="text-slate-600">Focus: <span className="font-medium text-slate-700">{item.subject_focus || 'General'}</span></span></div>
                                        {item.meeting_link && (<div className="flex items-center gap-3 text-sm"><MdLink className="w-5 h-5 text-slate-400 flex-shrink-0" /><a href={item.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate">Meeting Link</a></div>)}
                                    </div>
                                    
                                    <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-none border-slate-200/80">
                                        <span className={`self-end px-2.5 py-1 text-xs font-semibold rounded-full ${ item.status === 'Completed' ? 'bg-slate-100 text-slate-800' : 'bg-blue-100 text-blue-800' }`}>{item.status}</span>
                                        <div className="flex-grow"></div>
                                        {isJoinable && (
                                            <button 
                                                onClick={() => handleJoinMeeting(item.meeting_link)}
                                                className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                                            >
                                                <MdVideocam className="w-5 h-5" />
                                                Join Meeting
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Meeting Schedules</h1>
                        <p className="text-xs sm:text-sm text-slate-600">View upcoming and past Parent-Teacher Meetings</p>
                    </div>

                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <input
                                id="module-search"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search meetings..."
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
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
            }
        `}</style>
    </div>
  );
};

export default StudentPTMScreen;
