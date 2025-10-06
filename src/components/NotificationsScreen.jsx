import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import apiClient from '../api/client.js';

// --- Icon Components (Unchanged) ---
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

// --- Helper Icon for Refresh ---
function RefreshIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

const notificationIcons = {
  default: 'https://cdn-icons-png.flaticon.com/128/8297/8297354.png',
  homework: 'https://cdn-icons-png.flaticon.com/128/2158/2158507.png',
  submission: 'https://cdn-icons-png.flaticon.com/128/17877/17877365.png',
  event: 'https://cdn-icons-png.flaticon.com/128/9592/9592283.png',
  announcement: 'https://cdn-icons-png.flaticon.com/128/11779/11779894.png',
  calendar: 'https://cdn-icons-png.flaticon.com/128/2693/2693507.png',
  timetable: 'https://cdn-icons-png.flaticon.com/128/1254/1254275.png',
  exam: 'https://cdn-icons-png.flaticon.com/128/4029/4029113.png',
  report: 'https://cdn-icons-png.flaticon.com/128/9913/9913576.png',
  syllabus: 'https://cdn-icons-png.flaticon.com/128/1584/1584937.png',
  gallery: 'https://cdn-icons-png.flaticon.com/128/8418/8418513.png',
  health: 'https://cdn-icons-png.flaticon.com/128/3004/3004458.png',
  lab: 'https://cdn-icons-png.flaticon.com/128/9562/9562280.png',
  sport: 'https://cdn-icons-png.flaticon.com/128/3429/3429456.png',
  transport: 'https://cdn-icons-png.flaticon.com/128/2945/2945694.png',
  food: 'https://cdn-icons-png.flaticon.com/128/2276/2276931.png',
  ad: 'https://cdn-icons-png.flaticon.com/128/4944/4944482.png',
  helpdesk: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png',
  suggestion: 'https://cdn-icons-png.flaticon.com/128/9722/9722906.png',
  payment: 'https://cdn-icons-png.flaticon.com/128/1198/1198291.png',
  kitchen: 'https://cdn-icons-png.flaticon.com/128/3081/3081448.png',
};

const getIconForTitle = (title = '') => {
  const lowerCaseTitle = title.toLowerCase();
  if (lowerCaseTitle.includes('homework') || lowerCaseTitle.includes('assignment')) return notificationIcons.homework;
  if (lowerCaseTitle.includes('submit') || lowerCaseTitle.includes('submission')) return notificationIcons.submission;
  if (lowerCaseTitle.includes('event')) return notificationIcons.event;
  if (lowerCaseTitle.includes('announcement')) return notificationIcons.announcement;
  if (lowerCaseTitle.includes('calendar')) return notificationIcons.calendar;
  if (lowerCaseTitle.includes('timetable') || lowerCaseTitle.includes('schedule')) return notificationIcons.timetable;
  if (lowerCaseTitle.includes('exam')) return notificationIcons.exam;
  if (lowerCaseTitle.includes('report')) return notificationIcons.report;
  if (lowerCaseTitle.includes('syllabus')) return notificationIcons.syllabus;
  if (lowerCaseTitle.includes('gallery')) return notificationIcons.gallery;
  if (lowerCaseTitle.includes('health')) return notificationIcons.health;
  if (lowerCaseTitle.includes('lab')) return notificationIcons.lab;
  if (lowerCaseTitle.includes('sport') || lowerCaseTitle.includes('application')) return notificationIcons.sport;
  if (lowerCaseTitle.includes('transport') || lowerCaseTitle.includes('route')) return notificationIcons.transport;
  if (lowerCaseTitle.includes('food') || lowerCaseTitle.includes('menu')) return notificationIcons.food;
  if (lowerCaseTitle.includes('ad') || lowerCaseTitle.includes('advertisement')) return notificationIcons.ad;
  if (lowerCaseTitle.includes('ticket') || lowerCaseTitle.includes('help desk')) return notificationIcons.helpdesk;
  if (lowerCaseTitle.includes('suggestion')) return notificationIcons.suggestion;
  if (lowerCaseTitle.includes('payment') || lowerCaseTitle.includes('sponsorship')) return notificationIcons.payment;
  if (lowerCaseTitle.includes('stock') || lowerCaseTitle.includes('kitchen')) return notificationIcons.kitchen;
  return notificationIcons.default;
};

const NotificationsScreen = ({ onUnreadCountChange }) => {
  const { user, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- Header state ---
  const [profile, setProfile] = useState(null);
  const [headerQuery, setHeaderQuery] = useState("");
  const [headerUnreadCount, setHeaderUnreadCount] = useState(0);

  // --- Page state ---
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch profile (via apiClient) ---
  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      if (!user?.id) return;
      try {
        const res = await apiClient.get(`/profiles/${user.id}`);
        if (mounted) setProfile(res.data);
      } catch {
        if (mounted) {
          setProfile({
            id: user.id,
            username: user.username || "Unknown",
            full_name: user.full_name || "User",
            role: user.role || "user",
          });
        }
      }
    }
    fetchProfile();
    return () => { mounted = false; };
  }, [user]);

  // --- Header unread badge polling (via apiClient) ---
  useEffect(() => {
    let alive = true;
    async function fetchHeaderNotifications() {
      try {
        const res = await apiClient.get('/notifications');
        const data = Array.isArray(res.data) ? res.data : [];
        const count = data.filter(n => !n.is_read).length;
        if (!alive) return;
        setHeaderUnreadCount(count);
        setUnreadCount?.(count);
      } catch {
        if (!alive) return;
        setUnreadCount?.(0);
      }
    }
    fetchHeaderNotifications();
    const id = setInterval(fetchHeaderNotifications, 60000);
    return () => { alive = false; clearInterval(id); };
  }, [setUnreadCount]);

  // --- Main notifications fetch (via apiClient) ---
  const fetchNotifications = useCallback(async () => {
    setError(null);
    try {
      const res = await apiClient.get('/notifications');
      const data = Array.isArray(res.data) ? res.data : [];
      const sortedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(sortedData);
      const unreadCount = data.filter(n => !n.is_read).length;
      onUnreadCountChange?.(unreadCount);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to connect to the server.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    const tapped = notifications.find(n => n.id === notificationId);
    if (tapped?.is_read) return;
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      // Optimistic UI update for snappy UX, then sync
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      fetchNotifications();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Could not mark notification as read.';
      alert(msg);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterStatus === 'unread') return !notification.is_read;
    if (filterStatus === 'read') return !!notification.is_read;
    return true;
  });

  const unreadCountOnPage = notifications.filter(n => !n.is_read).length;

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'student') return '/StudentDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    if (user.role === 'donor') return '/DonorDashboard';
    return '/';
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* --- HEADER --- */}
      <header className="border-b border-slate-200 bg-slate-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Notifications</h1>
              <p className="text-xs sm:text-sm text-slate-600">Your recent alerts and updates</p>
            </div>
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="relative">
                <input
                  id="module-search"
                  type="text"
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  placeholder="Search ..."
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
                  {headerUnreadCount > 0 && (
                    <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">
                      {headerUnreadCount > 99 ? "99+" : headerUnreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Content Container with consistent spacing */}
          <div className="min-h-[calc(100vh-120px)] flex flex-col py-8">
            {/* Filter + Refresh */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center p-1 space-x-1 bg-slate-200/60 rounded-lg">
                {['all', 'unread', 'read'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`relative px-4 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
                      filterStatus === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status === 'unread' && unreadCountOnPage > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCountOnPage}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors disabled:opacity-50"
                title="Refresh Notifications"
              >
                <RefreshIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Notifications Container - Flexible growth */}
            <div className="flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading notifications...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <div className="text-center py-12 px-6 bg-red-50 border border-red-200 rounded-lg max-w-md">
                    <p className="text-2xl mb-2">😟</p>
                    <p className="font-semibold text-red-700 mb-1">Oops, something went wrong.</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <div className="text-center py-12 px-6 bg-slate-100/80 rounded-lg max-w-md">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="font-semibold text-slate-700 text-lg">You're all caught up!</p>
                    <p className="text-slate-500 mt-1">There are no notifications to show.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="relative pl-5">
                    {/* Vertical timeline bar */}
                    <div className="absolute left-5 top-0 h-full w-0.5 bg-slate-200" aria-hidden="true"></div>
                    <div className="space-y-6 pb-8">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`relative pl-8 ${!notification.is_read ? 'cursor-pointer' : ''}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          {/* Timeline Icon Marker */}
                          <div className="absolute left-5 top-0.5 -translate-x-1/2 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white ring-4 ring-slate-50 flex items-center justify-center">
                              <img
                                src={getIconForTitle(notification.title)}
                                alt=""
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                          </div>

                          {/* Notification Card */}
                          <div
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                              notification.is_read
                                ? 'bg-white border-slate-200'
                                : 'bg-blue-50/70 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <h3 className={`text-base pr-2 ${notification.is_read ? 'font-medium text-slate-600' : 'font-bold text-slate-800'}`}>
                                {notification.title}
                              </h3>
                              <p
                                className="text-xs text-slate-400 flex-shrink-0"
                                title={format(new Date(notification.created_at), "MMM d, yyyy - h:mm a")}
                              >
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <p className={`mt-1 text-sm leading-relaxed ${notification.is_read ? 'text-slate-500' : 'text-slate-700'}`}>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsScreen;
