"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import apiClient from '../../api/client.js'; // ★★★ Only import needed

// --- Icon Components for Header (Keep existing) ---
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

// --- Icon Components (Keep existing) ---
const IconAddCircle = ({ className = '', size = 20 }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
const IconCheckCircle = ({ className = '', size = 20 }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const IconCloseCircle = ({ className = '', size = 20 }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

// --- Main Component (Fixed) ---
export default function AdminSportsScreen() {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [headerQuery, setHeaderQuery] = useState("");
    const [view, setView] = useState('list');
    const [selectedActivity, setSelectedActivity] = useState(null);

    // ★★★ FIXED: Use apiClient like mobile version ★★★
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const res = await apiClient.get(`/profiles/${user.id}`);
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setProfile({ 
                    id: user.id, 
                    username: user.username || "Unknown", 
                    full_name: user.full_name || "User", 
                    role: user.role || "user" 
                });
            }
        }
        fetchProfile();
    }, [user]);

    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) { 
                setUnreadCount?.(0); 
                return; 
            }
            try {
                const res = await apiClient.get('/notifications', { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                const count = Array.isArray(res.data) ? res.data.filter((n) => !n.is_read).length : 0;
                setLocalUnreadCount(count);
                setUnreadCount?.(count);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setUnreadCount?.(0);
            }
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
        if (user.role === 'student') return '/StudentDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        if (user.role === 'donor') return '/DonorDashboard';
        return '/';
    };
    
    const handleBack = () => {
        setView('list');
        setSelectedActivity(null);
    };
    
    const handleSelectActivity = (activity) => {
        setSelectedActivity(activity);
        setView('details');
    };
    
    const renderContent = () => {
        switch (view) {
            case 'list':
                return <ActivityListView onSelect={handleSelectActivity} onCreate={() => setView('create')} />;
            case 'details':
                return <ActivityDetails activity={selectedActivity} onBack={handleBack} />;
            case 'create':
                return <CreateActivityForm onBack={handleBack} editorId={user?.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-slate-50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Sports Management</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Manage activities and student applications</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input 
                                    id="module-search" 
                                    type="text" 
                                    value={headerQuery} 
                                    onChange={(e) => setHeaderQuery(e.target.value)} 
                                    placeholder="Search activities..." 
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
                                <img 
                                    src={getProfileImageUrl() || "/placeholder.svg"} 
                                    alt="Profile" 
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" 
                                    onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} 
                                />
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
                {renderContent()}
            </main>
        </div>
    );
}

// ★★★ FIXED: Activity List View - Use apiClient like mobile ★★★
const ActivityListView = ({ onSelect, onCreate }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        if (user.role === 'student') return '/StudentDashboard';
        return '/';
    };

    // ★★★ FIXED: Match mobile version exactly ★★★
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/sports/all');
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
            alert("Error: Could not load activities.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                    <MdArrowBack size={18} />
                    <span>Back to Dashboard</span>
                </button>
            </div>
            
            <div className="flex justify-end mb-6">
                <button onClick={onCreate} className="inline-flex items-center bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm shadow-sm" type="button">
                    <IconAddCircle className="mr-2" size={18} />
                    Create New Activity
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                    {activities.length === 0 ? (
                        <div className="text-center p-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg font-medium">No activities created yet</p>
                            <p className="text-gray-500 text-sm mt-1">Create your first sports activity to get started</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {activities.map((item) => (
                                <li
                                    key={item.id}
                                    className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                    onClick={() => onSelect(item)}
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(item); }}
                                    role="button"
                                    aria-label={`View details of ${item.name}`}
                                >
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex items-center space-x-4 min-w-0">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h2>
                                                <p className="text-slate-600 text-sm">Coach: {item.coach_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.application_count > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>
                                                {item.application_count} Pending
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

// ★★★ FIXED: Activity Details - Use apiClient like mobile ★★★
const ActivityDetails = ({ activity, onBack }) => {
    const [allApplications, setAllApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    // ★★★ FIXED: Match mobile version exactly ★★★
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/sports/applications/${activity.id}`);
            setAllApplications(response.data);
        } catch (error) {
            console.error("Error fetching applications:", error);
            alert("Error: Could not load application history.");
        } finally {
            setLoading(false);
        }
    }, [activity.id]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const filteredApplications = useMemo(() => {
        if (activeFilter === 'All') return allApplications;
        return allApplications.filter((app) => app.status === activeFilter);
    }, [activeFilter, allApplications]);

    const handleRefresh = () => fetchApplications();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                    <MdArrowBack size={18} />
                    <span>Back to Activities</span>
                </button>
            </div>
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1">{activity.name}</h1>
                <p className="text-gray-500 text-base">Application History & Management</p>
            </div>

            <div className="flex justify-center mb-8">
                <div className="flex bg-gray-100/80 rounded-lg p-1 space-x-1">
                    {['All', 'Applied', 'Approved', 'Rejected'].map((filter) => (
                        <button 
                            key={filter} 
                            onClick={() => setActiveFilter(filter)} 
                            type="button" 
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${activeFilter === filter ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : filteredApplications.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No applications match this filter</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map((item) => (
                        <ApplicationCard key={item.registration_id} application={item} onUpdate={handleRefresh} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ★★★ FIXED: Application Card - Use apiClient like mobile ★★★
const ApplicationCard = ({ application, onUpdate }) => {
    const { user } = useAuth();

    // ★★★ FIXED: Match mobile version exactly ★★★
    const handleStatusUpdate = (regId, status) => {
        if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) {
            (async () => {
                try {
                    const response = await apiClient.put('/sports/application/status', {
                        registrationId: regId, 
                        status,
                        adminId: user?.id 
                    });
                    onUpdate();
                    alert(`Application ${status.toLowerCase()} successfully!`);
                } catch (error) {
                    console.error('Error updating status:', error);
                    alert('Error: Failed to update status.');
                }
            })();
        }
    };

    const handleSaveRemarks = async (regId, text) => {
        try {
            await apiClient.put('/sports/application/remarks', { 
                registrationId: regId, 
                remarks: text 
            });
        } catch (error) { 
            console.error("Could not save remarks:", error); 
        }
    };

    const handleSaveAchievements = async (regId, text) => {
        try {
            await apiClient.put('/sports/application/achievements', { 
                registrationId: regId, 
                achievements: text 
            });
        } catch (error) { 
            console.error("Could not save achievements:", error); 
        }
    };

    return (
        <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200/80 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{application.full_name}</h3>
                        <p className="text-sm text-gray-500">Applied: {new Date(application.registration_date).toLocaleDateString()}</p>
                    </div>
                </div>
                <StatusBadge status={application.status} />
            </div>

            {application.status === 'Applied' && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6 pt-2">
                    <button
                        onClick={() => handleStatusUpdate(application.registration_id, 'Approved')}
                        className="w-fit inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors text-sm"
                        type="button"
                    >
                        <IconCheckCircle className="mr-2" size={18} /> Approve
                    </button>
                    <button
                        onClick={() => handleStatusUpdate(application.registration_id, 'Rejected')}
                        className="w-fit inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors text-sm"
                        type="button"
                    >
                        <IconCloseCircle className="mr-2" size={18} /> Reject
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks / Notes</label>
                    <textarea 
                        placeholder="Add internal notes about this application..." 
                        defaultValue={application.remarks} 
                        onBlur={(e) => handleSaveRemarks(application.registration_id, e.target.value)} 
                        className="w-full min-h-[80px] p-3 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-150 bg-gray-50/50" 
                    />
                </div>
                {application.status === 'Approved' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Achievements</label>
                        <textarea 
                            placeholder="List achievements, one per line..." 
                            defaultValue={application.achievements} 
                            onBlur={(e) => handleSaveAchievements(application.registration_id, e.target.value)} 
                            className="w-full min-h-[80px] p-3 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-150 bg-gray-50/50" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Status Badge (Keep existing) ---
const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'Applied': return 'bg-sky-100 text-sky-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider select-none ${getStatusStyle()}`}>
            {status}
        </span>
    );
};

// ★★★ FIXED: Create Activity Form - Use apiClient like mobile ★★★
const CreateActivityForm = ({ onBack, editorId }) => {
    const [name, setName] = useState('');
    const [team, setTeam] = useState('');
    const [coach, setCoach] = useState('');
    const [schedule, setSchedule] = useState('');

    // ★★★ FIXED: Match mobile version exactly ★★★
    const handleSubmit = async () => {
        if (!name.trim() || !coach.trim()) {
            return alert('Validation Error: Activity Name and Coach Name are required.');
        }
        const payload = { 
            name, 
            team_name: team, 
            coach_name: coach, 
            schedule_details: schedule, 
            created_by: editorId 
        };
        try {
            const response = await apiClient.post('/sports', payload);
            alert('Success: Activity created!');
            onBack();
        } catch (error) {
            console.error("Error creating activity:", error);
            alert('Error: Could not create activity.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
             <div className="mb-6">
                <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                    <MdArrowBack size={18}/>
                    <span>Cancel Creation</span>
                </button>
            </div>
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1">Create New Activity</h1>
                <p className="text-gray-500">Add a new sports activity for students</p>
            </div>
            <div className="bg-slate-50 rounded-xl shadow-lg border border-slate-200/60 p-6 sm:p-8">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Activity Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            placeholder="e.g., Basketball, Football, Cricket" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition duration-150" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Team Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Junior Team, Senior Squad" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition duration-150" 
                            value={team} 
                            onChange={(e) => setTeam(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Coach Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            placeholder="e.g., Mr. Jordan, Coach Smith" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition duration-150" 
                            value={coach} 
                            onChange={(e) => setCoach(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Schedule Details</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Mon, Wed, Fri: 4-5 PM" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition duration-150" 
                            value={schedule} 
                            onChange={(e) => setSchedule(e.target.value)} 
                        />
                    </div>
                    <button onClick={handleSubmit} className="w-fit bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors duration-200 shadow-sm text-base" type="button">
                        Save Activity
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Loader (Keep existing) ---
const Loader = () => (
    <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-600 rounded-full animate-spin"></div>
    </div>
);
