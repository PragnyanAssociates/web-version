import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
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


// --- Icons for Redesigned Body ---
const ShieldCheckIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.002 12.053 12.053 0 0010 18.018a12.053 12.053 0 007.834-13.016A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
  </svg>
);

const UserGroupIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
);

const CalendarClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 15.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrophyAwardIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M11 3a1 1 0 100 2h2.586l-2.293 2.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
  </svg>
);

const WhistleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a1 1 0 100-2H8a1 1 0 100 2h4zm-1 4a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd" />
  </svg>
);

// Enhanced Spinner Loader
const Loader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="text-center">
      <div className="relative mx-auto mb-4">
        <div 
          className="h-20 w-20 border-4 border-slate-200 rounded-full border-t-4 animate-spin"
          style={{ borderTopColor: '#3b82f6' }} // Blue 500
        ></div>
        <div 
          className="absolute inset-0 h-20 w-20 border-4 border-transparent rounded-full border-r-4 animate-pulse"
          style={{ borderRightColor: '#3b82f640' }}
        ></div>
      </div>
      <p className="font-semibold text-lg" style={{ color: '#1d4ed8' }}>Loading Your Activities...</p> {/* Blue 700 */}
      <p className="text-sm text-slate-500">Getting everything ready for you.</p>
    </div>
  </div>
);

// --- New Empty State Components ---
const EmptyRegistered = ({ onSwitchTab }) => (
    <div className="text-center bg-white rounded-xl shadow-sm border border-slate-200/80 p-12 mt-4">
      <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheckIcon className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">No Registered Activities</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-8">It looks like you haven't joined any sports or activities yet. Explore the available options to get started!</p>
      <button 
        onClick={onSwitchTab}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
      >
        View Available Activities
      </button>
    </div>
);

const EmptyAvailable = () => (
    <div className="text-center bg-white rounded-xl shadow-sm border border-slate-200/80 p-12 mt-4">
      <div className="w-24 h-24 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">All Caught Up!</h3>
      <p className="text-slate-500 max-w-md mx-auto">There are no new activities available for you to join at the moment. Please check back later for new opportunities.</p>
    </div>
);

const StudentSportsScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // --- State for Sports ---
    const [view, setView] = useState('registered');
    const [registered, setRegistered] = useState([]);
    const [available, setAvailable] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Hooks for Header Functionality ---
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) {
                setUnreadCount?.(0);
                return;
            }
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
            if (!user?.id) {
                setLoadingProfile(false);
                return;
            }
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

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // ★★★ 4. USE apiClient WITH PROMISE.ALL - MATCHES MOBILE VERSION ★★★
            const [regRes, availRes] = await Promise.all([
                apiClient.get(`/sports/my-registrations/${user.id}`),
                apiClient.get(`/sports/available/${user.id}`)
            ]);
            // ★★★ 5. USE response.data PATTERN - MATCHES MOBILE VERSION ★★★
            setRegistered(regRes.data);
            setAvailable(availRes.data);
        } catch (error) {
            console.error("Error fetching sports data:", error);
            // ★★★ 6. MATCH MOBILE ERROR HANDLING ★★★
            window.alert("Error: Could not load sports activities.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApply = async (activityId) => {
        try {
            // ★★★ 7. USE apiClient.post - MATCHES MOBILE VERSION ★★★
            const response = await apiClient.post('/sports/apply', { 
                userId: user.id, 
                activityId 
            });

            // ★★★ 8. USE response.ok AND response.data - MATCHES MOBILE VERSION ★★★
            window.alert(response.ok ? "Success: " + response.data.message : "Info: " + response.data.message);
            if (response.ok) {
                fetchData(); // Refresh the lists
            }
        } catch (error) {
            console.error("Application error:", error);
            // ★★★ 9. MATCH MOBILE ERROR HANDLING ★★★
            window.alert("Error: An application error occurred. Please try again.");
        }
    };
    
    // --- Filtered Data Logic ---
    const filteredRegistered = useMemo(() =>
        registered.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.coach_name.toLowerCase().includes(query.toLowerCase())
        ), [registered, query]);

    const filteredAvailable = useMemo(() =>
        available.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.coach_name.toLowerCase().includes(query.toLowerCase())
        ), [available, query]);

    const renderContent = () => {
        if (loading || loadingProfile) {
            return <Loader />;
        }

        if (view === 'registered') {
            return registered.length === 0 ? (
                <EmptyRegistered onSwitchTab={() => setView('available')} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRegistered.map((item, idx) => <ActivityCard key={`reg-${idx}`} item={item} />)}
                </div>
            );
        }

        if (view === 'available') {
            return available.length === 0 ? (
                <EmptyAvailable />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAvailable.map((item) => <AvailableCard key={`avail-${item.id}`} item={item} onApply={handleApply} />)}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
               <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Sports & Activities</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Track participation, schedules & achievements</p>
                        </div>

                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input
                                    id="module-search"
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search activities..."
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
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(getDefaultDashboardRoute())}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors self-start"
                        title="Back to Dashboard"
                    >
                        <MdArrowBack className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>
                    
                    {/* New Tab Design */}
                    <div className="p-1 bg-slate-200/80 rounded-xl flex items-center gap-1 self-start sm:self-center">
                        <button
                            onClick={() => setView('registered')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${view === 'registered' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                            aria-current={view === 'registered' ? 'page' : undefined}
                        >
                            My Activities <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${view === 'registered' ? 'bg-blue-100 text-blue-800' : 'bg-slate-300 text-slate-700'}`}>{registered.length}</span>
                        </button>
                        <button
                            onClick={() => setView('available')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${view === 'available' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                            aria-current={view === 'available' ? 'page' : undefined}
                        >
                            Available to Join <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${view === 'available' ? 'bg-blue-100 text-blue-800' : 'bg-slate-300 text-slate-700'}`}>{available.length}</span>
                        </button>
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

// --- REDESIGNED CARD COMPONENTS ---

const ActivityCard = ({ item }) => (
  <div className="bg-white rounded-xl shadow-md border border-slate-200/60 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col">
    <div className="p-6">
        <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">{item.name}</h3>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ml-4 border-4 border-white shadow-sm">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
        </div>

        <div className="space-y-4 mb-6 text-sm text-slate-600">
            {item.team_name && (
            <div className="flex items-center gap-3">
                <UserGroupIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div><strong>Team:</strong> {item.team_name}</div>
            </div>
            )}
            <div className="flex items-center gap-3">
                <WhistleIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div><strong>Coach:</strong> {item.coach_name}</div>
            </div>
            <div className="flex items-center gap-3">
                <CalendarClockIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div><strong>Schedule:</strong> <span className="text-slate-800 font-medium">{item.schedule_details}</span></div>
            </div>
        </div>
    </div>
    
    <div className="bg-slate-50/70 mt-auto p-6 border-t border-slate-200/60">
        <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-3 text-base">
            <TrophyAwardIcon className="w-5 h-5" />
            Achievements
        </h4>
        <ul className="space-y-2 text-slate-700 text-sm list-disc list-inside">
            {item.achievements && item.achievements.trim()
                ? item.achievements.split('\n').map((ach, i) => (
                    <li key={i} className="pl-1">{ach.trim()}</li>
                    ))
                : <li className="text-slate-500 italic list-none">No achievements recorded yet.</li>}
        </ul>
    </div>
  </div>
);

const AvailableCard = ({ item, onApply }) => (
    <div className="bg-white rounded-xl shadow-md border border-slate-200/60 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col p-6">
      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-4">{item.name}</h3>
        
        <div className="space-y-4 mb-6 text-sm text-slate-600">
            {item.team_name && (
                <div className="flex items-center gap-3">
                    <UserGroupIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div><strong>Team:</strong> {item.team_name}</div>
                </div>
            )}
            <div className="flex items-center gap-3">
                <WhistleIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div><strong>Coach:</strong> {item.coach_name}</div>
            </div>
            <div className="flex items-center gap-3">
                <CalendarClockIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div><strong>Schedule:</strong> <span className="text-slate-800 font-medium">{item.schedule_details}</span></div>
            </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
            onClick={() => onApply(item.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            type="button"
            aria-label={`Apply to join ${item.name}`}
        >
            Apply to Join
        </button>
      </div>
    </div>
);

export default StudentSportsScreen;
