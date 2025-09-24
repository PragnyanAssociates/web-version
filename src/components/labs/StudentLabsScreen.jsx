import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../../apiConfig";
import { useAuth } from "../../context/AuthContext.tsx";
import { MdOutlineLaunch, MdCloudDownload, MdArrowBack } from "react-icons/md"; // +++ ADDED MdArrowBack +++

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

function DigitalLabIcon() {
    return (
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

export default function StudentLabsScreen() {
    const navigate = useNavigate();
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();

    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [headerQuery, setHeaderQuery] = useState("");
    const [labs, setLabs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
                if (res.ok) setProfile(await res.json());
                else setProfile({ id: user.id, username: user.username || "Unknown", full_name: user.full_name || "User", role: user.role || "user" });
            } catch { setProfile(null); }
        }
        fetchProfile();
    }, [user]);

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

    const fetchLabs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/labs`);
            if (!response.ok) throw new Error("Failed to fetch labs");
            const allLabs = await response.json();
            setLabs(allLabs);
        } catch (e) {
            alert(e.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLabs();
    }, [fetchLabs]);
    
    const filteredLabs = labs.filter(lab =>
        lab.title.toLowerCase().includes(headerQuery.toLowerCase()) ||
        (lab.subject && lab.subject.toLowerCase().includes(headerQuery.toLowerCase())) ||
        lab.description.toLowerCase().includes(headerQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="bg-slate-100 min-h-screen relative flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                        <div className="h-10 w-10 border-3 border-blue-200 rounded-full border-t-blue-600 animate-spin shadow-lg"></div>
                        <div className="absolute inset-0 h-10 w-10 border-3 border-transparent rounded-full border-r-indigo-400 animate-pulse"></div>
                    </div>
                    <p className="text-gray-600 font-medium text-sm">Loading digital labs...</p>
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
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Digital Labs</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Explore learning resources and simulations</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={headerQuery} onChange={(e) => setHeaderQuery(e.target.value)} placeholder="Search labs..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                {/* +++ UPDATED THIS BUTTON +++ */}
                <div className="mb-6">
                    <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        <MdArrowBack />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                
                {filteredLabs.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
                            <DigitalLabIcon />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-3">No Labs Available</h3>
                        <p className="text-gray-600 mb-6 text-base">There are currently no labs matching your search. Please check back later.</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLabs.map((lab, index) => (
                            <li key={lab.id} className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 p-4 transition-shadow hover:shadow-md flex flex-col h-full" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                                <img src={lab.cover_image_url ? `${API_BASE_URL}${lab.cover_image_url}` : "/assets/lab-placeholder.png"} alt={lab.title} className="w-full h-40 rounded-md object-cover flex-shrink-0 bg-slate-200 mb-4" onError={(e) => { e.currentTarget.src = "/assets/lab-placeholder.png"; }} />
                                <div className="flex flex-col flex-grow">
                                    <div className="flex-grow">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">{lab.lab_type || "General"}</span>
                                        <h3 className="text-lg font-bold text-slate-800">{lab.title}</h3>
                                        {lab.subject && <p className="text-sm font-medium text-slate-500 mb-2">{lab.subject}</p>}
                                        <p className="text-sm text-slate-600 line-clamp-3">{lab.description}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-end pt-4 gap-2">
                                        {lab.access_url && (
                                            <a 
                                                href={lab.access_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                                            >
                                                <MdOutlineLaunch />
                                                <span>Open Link</span>
                                            </a>
                                        )}
                                        {lab.file_path && (
                                            <a 
                                                href={`${API_BASE_URL}${lab.file_path}`} 
                                                download
                                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                                            >
                                                <MdCloudDownload />
                                                <span>Download</span>
                                            </a>
                                        )}
                                        {!lab.access_url && !lab.file_path && (
                                            <button
                                                disabled
                                                className="inline-flex items-center gap-2 bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg cursor-not-allowed text-sm"
                                            >
                                                <span>Not Available</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
};