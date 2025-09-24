import React, { useState, useEffect, useCallback, useMemo } from "react";
import { API_BASE_URL } from "../../apiConfig";
import { useAuth } from "../../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import {
    FaBookOpen,
    FaCheckCircle,
    FaTimesCircle,
    FaEdit,
    FaListAlt,
} from "react-icons/fa";
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

const TeacherSyllabusScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // --- State for Syllabus functionality ---
    const [selectedClassGroup, setSelectedClassGroup] = useState(null);
    const [selectedSubjectName, setSelectedSubjectName] = useState(null);

    // --- Hooks for Header Functionality ---
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) { setUnreadCount?.(0); return; }
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
                    setLocalUnreadCount(count);
                    setUnreadCount?.(count);
                } else { setUnreadCount?.(0); }
            } catch { setUnreadCount?.(0); }
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
                if (res.ok) { setProfile(await res.json()); }
                else { setProfile({ id: user.id, username: user.username || "Unknown", full_name: user.full_name || "User", role: user.role || "user" }); }
            } catch { setProfile(null); }
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
        if (user.role === 'student') return '/StudentDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        return '/';
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">My Syllabus Tracking</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Select a subject to view and update lesson progress</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                                    {unreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
                <div className="mb-6">
                    <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        <MdArrowBack />
                        <span>Back to Dashboard</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Master Panel (Left) */}
                    <div className="lg:w-1/3 w-full flex-shrink-0">
                        <TeacherSyllabusListScreen
                            onSelect={(classGroup, subjectName) => {
                                setSelectedClassGroup(classGroup);
                                setSelectedSubjectName(subjectName);
                            }}
                            selectedClassGroup={selectedClassGroup}
                            selectedSubjectName={selectedSubjectName}
                        />
                    </div>

                    {/* Detail Panel (Right) */}
                    <div className="flex-grow">
                        {selectedClassGroup && selectedSubjectName ? (
                            <TeacherLessonProgressScreen
                                key={`${selectedClassGroup}-${selectedSubjectName}`}
                                classGroup={selectedClassGroup}
                                subjectName={selectedSubjectName}
                            />
                        ) : (
                            <div className="h-full bg-slate-50 rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 border">
                                    <FaListAlt className="text-slate-500 text-4xl" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700">View Syllabus Progress</h3>
                                <p className="text-sm text-slate-500 mt-1">Select a subject from the list on the left to see its details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// ====================== 1. Teacher List Screen ======================
const TeacherSyllabusListScreen = ({ onSelect, selectedClassGroup, selectedSubjectName }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        setIsLoading(true);
        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/teacher-assignments/${user.id}`);
                if (!response.ok) throw new Error("Failed to load your assigned subjects.");
                setAssignments(await response.json());
            } catch (error) {
                alert(error.message);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [user?.id]);

    if (isLoading) {
        return (
            <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200 p-6 flex flex-col justify-center items-center h-full min-h-[200px]">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200">
            <h2 className="p-4 text-base font-semibold text-slate-800 border-b border-slate-200">Your Assigned Subjects</h2>
            {assignments.length === 0 ? (
                <div className="text-center p-6">
                    <p className="text-slate-500 text-sm">You have no classes assigned.</p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-200">
                    {assignments.map((item, index) => {
                        const isSelected = item.class_group === selectedClassGroup && item.subject_name === selectedSubjectName;
                        return (
                            <li key={`${item.class_group}-${item.subject_name}-${index}`}
                                className={`p-4 transition-colors duration-200 cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-white'}`}
                                onClick={() => onSelect(item.class_group, item.subject_name)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-10 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                        <div>
                                            <p className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{item.subject_name}</p>
                                            <p className="text-sm text-slate-500">Class: {item.class_group}</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

// ====================== 2. Teacher Lesson Progress Screen ======================
const TeacherLessonProgressScreen = ({ classGroup, subjectName }) => {
    const { user: teacher } = useAuth();
    const [syllabus, setSyllabus] = useState(null);
    const [overview, setOverview] = useState({ completed: 0, missed: 0, pending: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const syllabusResponse = await fetch(`${API_BASE_URL}/api/syllabus/teacher/${classGroup}/${subjectName}`);
            if (!syllabusResponse.ok) {
                if (syllabusResponse.status === 404) throw new Error("Syllabus has not been created for this subject yet.");
                throw new Error("Failed to load syllabus data.");
            }
            const syllabusData = await syllabusResponse.json();
            const progressResponse = await fetch(`${API_BASE_URL}/api/syllabus/class-progress/${syllabusData.id}`);
            if (!progressResponse.ok) throw new Error("Could not load lesson progress.");
            const progressData = await progressResponse.json();

            const newOverview = { completed: 0, missed: 0, pending: 0, total: progressData.length };
            progressData.forEach(lesson => {
                if (lesson.status === "Completed") newOverview.completed++;
                else if (lesson.status === "Missed") newOverview.missed++;
                else newOverview.pending++;
            });
            setOverview(newOverview);
            const lessonsWithStatus = progressData.map(p => ({ ...p, id: p.lesson_id }));
            setSyllabus({ ...syllabusData, lessons: lessonsWithStatus });
        } catch (error) {
            alert(error.message);
            setSyllabus(null);
        } finally {
            setIsLoading(false);
        }
    }, [classGroup, subjectName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = (lessonId, newStatus) => {
        const action = newStatus === "Pending" ? "revert" : "mark";
        const confirmMsg = `This will ${action} the lesson as '${newStatus}' for ALL students in ${classGroup}. Are you sure?`;
        if (!window.confirm(confirmMsg)) return;

        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/syllabus/lesson-status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ class_group: classGroup, lesson_id: lessonId, status: newStatus, teacher_id: teacher.id }),
                });
                const resData = await response.json();
                if (!response.ok) throw new Error(resData.message || "Failed to update status.");
                alert(resData.message);
                fetchData();
            } catch (error) {
                alert(error.message);
            }
        })();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            display: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            isOverdue: date < today,
        };
    };

    if (isLoading) {
        return (
            <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200 p-6 flex flex-col justify-center items-center h-full min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600 text-sm">Loading progress data...</p>
            </div>
        );
    }

    if (!syllabus) {
        return (
            <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200 p-6 flex flex-col justify-center items-center h-full min-h-[400px]">
                <p className="text-slate-600">No syllabus data found for this subject.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-2xl font-bold text-green-600">{overview.completed}</p>
                    <p className="text-xs text-slate-500 font-medium">Completed</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-2xl font-bold text-red-500">{overview.missed}</p>
                    <p className="text-xs text-slate-500 font-medium">Missed</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-2xl font-bold text-amber-500">{overview.pending}</p>
                    <p className="text-xs text-slate-500 font-medium">Pending</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-2xl font-bold text-blue-600">{overview.total}</p>
                    <p className="text-xs text-slate-500 font-medium">Total Lessons</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-500 bg-white rounded-t-lg border-b border-x border-t border-slate-200">
                        <div className="col-span-12 md:col-span-5">LESSON</div>
                        <div className="col-span-6 md:col-span-3">DUE DATE</div>
                        <div className="col-span-6 md:col-span-4">ACTIONS</div>
                    </div>
                    <div className="divide-y divide-slate-200 border-x border-b border-slate-200 rounded-b-lg">
                        {syllabus.lessons.map((lesson) => {
                            const { display, isOverdue } = formatDate(lesson.due_date);
                            const isMarked = lesson.status !== "Pending";
                            return (
                                <div key={lesson.id} className={`grid grid-cols-12 gap-4 p-4 items-center ${isOverdue && !isMarked ? "bg-red-50" : "bg-white"}`}>
                                    <div className="col-span-12 md:col-span-5 font-semibold text-slate-800">{lesson.lesson_name}</div>
                                    <div className="col-span-6 md:col-span-3 text-sm text-slate-600">{display}{isOverdue && !isMarked && <span className="text-red-600 font-bold ml-1">(Overdue)</span>}</div>
                                    <div className="col-span-6 md:col-span-4">
                                        {isMarked ? (
                                            <div className="flex justify-between items-center gap-2">
                                                <span className={`inline-flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-md ${lesson.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {lesson.status === "Completed" ? <FaCheckCircle /> : <FaTimesCircle />}
                                                    {lesson.status}
                                                </span>
                                                <button onClick={() => handleStatusUpdate(lesson.id, "Pending")} className="flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 p-1">
                                                    <FaEdit className="mr-1" /> Revert
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleStatusUpdate(lesson.id, "Completed")} className="flex-1 text-xs font-semibold flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-md transition-colors">
                                                    <FaCheckCircle className="mr-1.5" /> <span className="hidden sm:inline">Complete</span>
                                                </button>
                                                <button onClick={() => handleStatusUpdate(lesson.id, "Missed")} className="flex-1 text-xs font-semibold flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-2 rounded-md transition-colors">
                                                    <FaTimesCircle className="mr-1.5" /> <span className="hidden sm:inline">Missed</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherSyllabusScreen;