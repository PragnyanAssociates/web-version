import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../apiConfig';
import {
  MdOpacity,
  MdHeight,
  MdMonitorWeight,
  MdCalculate,
  MdEvent,
  MdWarning,
  MdLocalHospital,
  MdHealing,
  MdArrowBack
} from "react-icons/md";

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

const StudentHealthScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Health Data ---
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);

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

  useEffect(() => {
    const fetchHealthRecord = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/health/my-record/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setHealthData(data);
        } else {
          console.error("Failed to fetch health record");
        }
      } catch (error) {
        console.error("Error fetching health record:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthRecord();
  }, [user]);

  const calculatedBmi = useMemo(() => {
    if (healthData?.height_cm && healthData?.weight_kg) {
      const heightM = healthData.height_cm / 100;
      const bmi = healthData.weight_kg / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  }, [healthData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Recorded';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  
  const renderContent = () => {
    if (loading || loadingProfile) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content Column */}
          <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-slate-800">
                  {profile?.full_name || "Your"}'s Health Profile
              </h2>
              <p className="text-slate-500 mt-1">
                  Last updated on {formatDate(healthData?.last_checkup_date)}
              </p>
              
              <div className="mt-8 space-y-8">
                  <DetailItem
                      icon={<MdWarning className="text-orange-500" />}
                      title="Allergies & Sensitivities"
                      content={healthData?.allergies}
                  />
                  <DetailItem
                      icon={<MdLocalHospital className="text-cyan-600" />}
                      title="Chronic Conditions"
                      content={healthData?.medical_conditions}
                  />
                  <DetailItem
                      icon={<MdHealing className="text-indigo-500" />}
                      title="Current Medications"
                      content={healthData?.medications}
                  />
              </div>
          </div>

          {/* Visual Summary Column */}
          <div className="md:col-span-1 row-start-1 md:row-start-auto">
              <div className="sticky top-24">
                  <div className="relative flex justify-center">
                      <svg viewBox="0 0 100 250" xmlns="http://www.w3.org/2000/svg" className="w-32 h-80 text-slate-200">
                          <path d="M50 45C61.0457 45 70 36.0457 70 25C70 13.9543 61.0457 5 50 5C38.9543 5 30 13.9543 30 25C30 36.0457 38.9543 45 50 45Z" fill="currentColor"/>
                          <path d="M85.95 85.5H14.05C9.24 85.5 5 89.74 5 94.55V187.45C5 192.26 9.24 196.5 14.05 196.5H21.15V247.05H78.85V196.5H85.95C90.76 196.5 95 192.26 95 187.45V94.55C95 89.74 90.76 85.5 85.95 85.5Z" fill="currentColor"/>
                      </svg>
                      {calculatedBmi && (
                          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-white rounded-full p-1.5 shadow-lg border">
                              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex flex-col items-center justify-center">
                                  <span className="text-3xl font-bold leading-tight">{calculatedBmi}</span>
                                  <span className="text-xs font-semibold tracking-wider">BMI</span>
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="mt-6 space-y-4">
                      <Stat icon={<MdOpacity className="text-red-500" />} label="Blood Group" value={healthData?.blood_group} />
                      <Stat icon={<MdHeight className="text-blue-500" />} label="Height" value={healthData?.height_cm ? `${healthData.height_cm} cm` : null} />
                      <Stat icon={<MdMonitorWeight className="text-yellow-600" />} label="Weight" value={healthData?.weight_kg ? `${healthData.weight_kg} kg` : null} />
                  </div>
              </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">My Health Record</h1>
                        <p className="text-xs sm:text-sm text-slate-600">View your personal health and wellness information</p>
                    </div>

                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <input
                                id="module-search"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                            <button
                                onClick={() => navigate(getDefaultDashboardRoute())}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition"
                                type="button"
                                title="Home"
                            >
                                <HomeIcon />
                                <span className="hidden md:inline">Home</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button
                                onClick={() => navigate("/AcademicCalendar")}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition"
                                type="button"
                                title="Calendar"
                            >
                                <CalendarIcon />
                                <span className="hidden md:inline">Calendar</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button
                                onClick={() => navigate("/ProfileScreen")}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition"
                                type="button"
                                title="Profile"
                            >
                                <UserIcon />
                                <span className="hidden md:inline">Profile</span>
                            </button>
                        </div>

                        <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />

                        <div className="flex items-center gap-2 sm:gap-3">
                            <img
                                src={getProfileImageUrl() || "/placeholder.svg"}
                                alt="Profile"
                                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/assets/profile.png"
                                }}
                            />
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
                                className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
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
    </div>
  );
};

const Stat = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div className="text-left">
          <p className="text-sm text-slate-500 font-semibold">{label}</p>
          <p className="text-lg font-bold text-slate-800">{value || 'N/A'}</p>
      </div>
  </div>
);


const DetailItem = ({ icon, title, content }) => (
  <div className="border-t border-slate-200 pt-6">
      <div className="flex items-center gap-3">
          <div className="text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full">{icon}</div>
          <h3 className="text-xl font-bold text-slate-700">{title}</h3>
      </div>
      <p className="mt-3 pl-11 text-slate-600 leading-relaxed whitespace-pre-wrap">
        {content || 'None reported'}
      </p>
  </div>
);

export default StudentHealthScreen;