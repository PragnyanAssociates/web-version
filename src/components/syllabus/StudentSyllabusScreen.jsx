import React, { useState, useEffect, useCallback, useMemo } from "react";
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdBook, MdDonutLarge, MdChevronRight, MdExpandMore } from 'react-icons/md';

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

// Main screen with internal "navigation"
const StudentSyllabusScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Syllabus functionality ---
  const [view, setView] = useState("dashboard");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const pageInfo = useMemo(() => {
    if (view === 'lessons') {
        return {
            title: selectedSubject?.name || "Syllabus Details",
            subtitle: `Lessons and due dates for ${user?.class_group}`
        };
    }
    return {
        title: "My Syllabus",
        subtitle: `Track your learning progress for ${user?.class_group}`
    };
  }, [view, selectedSubject, user]);

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

  const handleBackNavigation = () => {
    if (view === 'lessons') {
        setView('dashboard');
        setSelectedSubject(null);
    } else {
        navigate(getDefaultDashboardRoute());
    }
  };

  const renderContent = () => {
    if (loadingProfile) {
        return (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (view === "lessons") {
        return <StudentLessonList subject={selectedSubject} onBack={() => { setView("dashboard"); setSelectedSubject(null); }} />;
    }

    return <StudentSyllabusDashboard onSelectSubject={(subject) => { setSelectedSubject(subject); setView("lessons"); }} />;
  };

  return (
    <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
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
                    <span>{view === 'dashboard' ? "Back to Dashboard" : "Back to Syllabus Overview"}</span>
                </button>
            </div>
            {renderContent()}
        </main>
    </div>
  );
};

const StudentSyllabusDashboard = ({ onSelectSubject }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ Done: 0, Missed: 0, Pending: 0, Total: 0 });
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // ★★★ 4. USE apiClient FOR SYLLABUS OVERVIEW - MATCHES MOBILE VERSION ★★★
      const response = await apiClient.get(`/syllabus/student/overview/${user.id}`);
      const { totalStats, subjectStats } = response.data;

      const totalSummary = { Done: 0, Missed: 0, Pending: 0, Total: 0 };
      totalStats.forEach((item) => {
        if (item.status === "Completed") totalSummary.Done = item.count;
        if (item.status === "Missed") totalSummary.Missed = item.count;
        else if (item.status === "Pending") totalSummary.Pending = item.count;
        totalSummary.Total += item.count;
      });
      setSummary(totalSummary);

      const subjectMap = new Map();
      subjectStats.forEach((stat) => {
        if (!subjectMap.has(stat.syllabus_id)) {
          subjectMap.set(stat.syllabus_id, {
            id: stat.syllabus_id,
            name: stat.subject_name,
            Done: 0,
            Missed: 0,
            Pending: 0,
            Total: 0,
          });
        }
        const subjectData = subjectMap.get(stat.syllabus_id);
        if (stat.status === "Completed") subjectData.Done = stat.count;
        if (stat.status === "Missed") subjectData.Missed = stat.count;
        else if (stat.status === "Pending") subjectData.Pending = stat.count;
        subjectData.Total += stat.count;
      });
      setSubjects(Array.from(subjectMap.values()));
    } catch (error) {
      // ★★★ 5. MATCH MOBILE ERROR HANDLING ★★★
      alert(error.response?.data?.message || "Failed to fetch progress.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const overallProgressPercentage = summary.Total > 0 ? (summary.Done / summary.Total) * 100 : 0;

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <span className="text-slate-600 text-lg">Loading Syllabus Overview...</span>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Overall Progress Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            className="text-white text-opacity-30"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="text-white"
                            strokeWidth="10"
                            strokeDasharray={`${overallProgressPercentage * 2.51}, 251`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{Math.round(overallProgressPercentage)}%</span>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Your Overall Progress</h2>
                    <p className="text-blue-200">{summary.Done} of {summary.Total} lessons completed</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                <SummaryItem icon={<FaCheckCircle />} label="Done" count={summary.Done} color="text-white" />
                <SummaryItem icon={<FaTimesCircle />} label="Missed" count={summary.Missed} color="text-white" />
                <SummaryItem icon={<FaHourglassHalf />} label="Pending" count={summary.Pending} color="text-white" />
            </div>
        </div>
        
        {/* Subject List */}
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Your Subjects</h3>
            {subjects.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl shadow-md border border-slate-200/60">
                <MdBook size={32} className="mx-auto text-slate-400 mb-4" />
                <span className="text-slate-600">No subjects found for your class group.</span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => {
                  const subjectProgress = subject.Total > 0 ? (subject.Done / subject.Total) * 100 : 0;
                  return (
                    <div key={subject.id} className="bg-slate-50 rounded-xl shadow-md border border-slate-200/60 p-5 flex flex-col justify-between">
                      <div>
                          <h4 className="font-bold text-lg text-slate-800 mb-2">{subject.name}</h4>
                          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${subjectProgress}%` }}></div>
                          </div>
                          <p className="text-sm text-slate-500 mb-4">
                              <span className="font-semibold text-blue-600">{Math.round(subjectProgress)}%</span> Completed ({subject.Done} / {subject.Total})
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                              <SummaryItem icon={<FaCheckCircle size={12} />} count={subject.Done} label="Done" color="text-green-500" small />
                              <SummaryItem icon={<FaTimesCircle size={12} />} count={subject.Missed} label="Missed" color="text-red-500" small />
                              <SummaryItem icon={<FaHourglassHalf size={12} />} count={subject.Pending} label="Pending" color="text-yellow-500" small />
                          </div>
                      </div>
                      <button
                          onClick={() => onSelectSubject(subject)}
                          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                      >
                          View Lessons <MdChevronRight />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
    </div>
  );
};

const StudentLessonList = ({ subject, onBack }) => {
  const { user } = useAuth();
  const [syllabusDetails, setSyllabusDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openLesson, setOpenLesson] = useState(null); // State to manage open/closed accordion items

  const getStatusProps = (status) => {
    switch (status) {
      case "Completed":
        return { icon: <FaCheckCircle className="text-green-500" />, color: "text-green-500", borderColor: "border-green-200" };
      case "Missed":
        return { icon: <FaTimesCircle className="text-red-500" />, color: "text-red-500", borderColor: "border-red-200" };
      default:
        return { icon: <FaHourglassHalf className="text-yellow-500" />, color: "text-yellow-500", borderColor: "border-yellow-200" };
    }
  };

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      try {
        // ★★★ 6. USE apiClient FOR LESSON DETAILS - MATCHES MOBILE VERSION ★★★
        const response = await apiClient.get(`/syllabus/student/subject-details/${subject.id}/${user.id}`);
        setSyllabusDetails(response.data);
      } catch (error) {
        // ★★★ 7. MATCH MOBILE ERROR HANDLING ★★★
        alert(error.response?.data?.message || "Failed to load lesson details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (subject?.id && user?.id) {
      fetchLessons();
    }
  }, [subject, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <span className="text-slate-600 text-lg">Loading Lessons...</span>
      </div>
    );
  }

  return (
    <div>
      {syllabusDetails?.lessons?.length ? (
        <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200/60 p-4">
            {syllabusDetails.lessons.map((item, index) => {
                const statusProps = getStatusProps(item.status);
                const isOpen = openLesson === item.id;

                return (
                    <div key={item.id} className="border-b border-slate-100 last:border-b-0">
                        <button
                            className="flex items-center justify-between w-full p-3 text-left focus:outline-none"
                            onClick={() => setOpenLesson(isOpen ? null : item.id)}
                        >
                            <div className="flex items-center gap-3">
                                {statusProps.icon}
                                <span className="font-medium text-slate-800 text-base">{item.lesson_name}</span>
                            </div>
                            {isOpen ? <MdExpandMore className="text-slate-500" /> : <MdChevronRight className="text-slate-500" />}
                        </button>
                        {isOpen && (
                            <div className="px-3 pb-3 pt-1 pl-11 text-sm text-slate-600">
                                <p className={`font-semibold ${statusProps.color} mb-1`}>{item.status}</p>
                                <p>
                                    Due Date:{" "}
                                    {new Date(item.due_date).toLocaleDateString("en-US", {
                                        month: "long", day: "numeric", year: "numeric",
                                    })}
                                </p>
                                {/* Add more lesson details here if available, e.g., description */}
                                {item.description && <p className="mt-2 text-slate-500">{item.description}</p>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-50 rounded-xl shadow-md border border-slate-200/60">
          <MdBook size={32} className="mx-auto text-slate-400 mb-4" />
          <span className="text-slate-600">No syllabus defined for this subject yet.</span>
        </div>
      )}
    </div>
  );
};

const SummaryItem = ({ icon, label, count, color }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={color}>{icon}</span>
      <span className={`font-semibold ${color.includes('white') ? 'text-white' : 'text-slate-700'}`}>
        {count} {label}
      </span>
    </div>
  );
};

export default StudentSyllabusScreen;
