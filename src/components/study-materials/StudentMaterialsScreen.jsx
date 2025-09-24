import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../apiConfig';
import { 
  MdAdd, 
  MdArrowBack, 
  MdCheckBox, 
  MdCheckBoxOutlineBlank,
  MdEvent,
  MdInfoOutline,
  MdHourglassEmpty,
  MdCheckCircle,
  MdCancel,
  MdDescription,
  MdSlideshow,
  MdOndemandVideo,
  MdAssignment,
  MdLink,
  MdFolderOpen,
  MdDownload,
  MdLaunch,
  MdScience,
  MdCalculate,
  MdHistoryEdu,
  MdLanguage,
  MdSportsSoccer,
  MdBook,
  MdFilterNone
} from 'react-icons/md';

// --- Icon Components for Header (UNCHANGED) ---
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

// --- Icons for Materials & Subjects ---
const MATERIAL_ICONS = {
  Notes: MdDescription, Presentation: MdSlideshow, "Video Lecture": MdOndemandVideo, Worksheet: MdAssignment, Link: MdLink, Default: MdFolderOpen,
};
const getMaterialIcon = (type) => MATERIAL_ICONS[type] || MATERIAL_ICONS.Default;

const SUBJECT_ICONS = {
  Science: MdScience, Mathematics: MdCalculate, History: MdHistoryEdu, English: MdLanguage, "Physical Education": MdSportsSoccer, Default: MdBook,
};
const getSubjectIcon = (subject) => {
  const found = Object.keys(SUBJECT_ICONS).find(key => subject.toLowerCase().includes(key.toLowerCase()));
  return SUBJECT_ICONS[found] || SUBJECT_ICONS.Default;
}

const StudentMaterialsScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header & Data ---
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");
    
    // --- NEW State for Drill-Down UI ---
    const [selectedSubject, setSelectedSubject] = useState(null);

    // --- Hooks for Header and Data Fetching (UNCHANGED) ---
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
            if (!user?.id) { setLoadingProfile(false); return; }
            setLoadingProfile(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
                if (res.ok) { setProfile(await res.json()); }
                else { setProfile({ id: user.id, username: user.username || "Unknown", full_name: user.full_name || "User", role: user.role || "user" }); }
            } catch { setProfile(null); }
            finally { setLoadingProfile(false); }
        }
        fetchProfile();
    }, [user]);

    const fetchMaterials = useCallback(async () => {
         if (!user?.class_group) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/study-materials/student/${user.class_group}`);
            if (!res.ok) throw new Error("Failed to fetch study materials.");
            const data = await res.json();
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setMaterials(data);
        } catch (err) { alert(err.message); }
        finally { setIsLoading(false); }
    }, [user?.class_group]);

    useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

    // --- Helper Functions (UNCHANGED) ---
    const handleLogout = () => { if (window.confirm("Are you sure?")) { logout(); navigate("/"); }};
    const getDefaultDashboardRoute = () => { if (!user) return '/'; if (user.role === 'admin') return '/AdminDashboard'; if (user.role === 'teacher') return '/TeacherDashboard'; if (user.role === 'student') return '/StudentDashboard'; return '/'; };
    
    // --- Data Processing for Drill-Down UI ---
    const subjectData = useMemo(() => {
      const grouped = materials.reduce((acc, material) => {
        const subject = material.subject || 'Uncategorized';
        if (!acc[subject]) {
          acc[subject] = [];
        }
        acc[subject].push(material);
        return acc;
      }, {});

      return Object.keys(grouped).map(subject => ({
        name: subject,
        count: grouped[subject].length,
        materials: grouped[subject],
      }));
    }, [materials]);

    const filteredMaterials = useMemo(() => {
        if (!query) return materials;
        return materials.filter(m =>
            m.title.toLowerCase().includes(query.toLowerCase()) ||
            m.subject.toLowerCase().includes(query.toLowerCase()) ||
            m.description.toLowerCase().includes(query.toLowerCase())
        );
    }, [materials, query]);

    // --- NEW/REDESIGNED UI COMPONENTS ---

    // Card for each subject on the overview screen
    const SubjectCard = ({ subject, count, onClick }) => {
        const Icon = getSubjectIcon(subject);
        return (
            <button 
                onClick={onClick}
                className="group relative text-left bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-2xl hover:border-blue-400/80 transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
            >
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-200/50 mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon size={32} className="text-blue-600"/>
                </div>
                <h3 className="text-xl font-bold text-slate-800 flex-grow">{subject}</h3>
                <p className="text-sm text-slate-500 mt-1">{count} resource{count !== 1 ? 's' : ''}</p>
                <div className="absolute top-4 right-4 w-8 h-8 bg-slate-100 group-hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                    <MdArrowBack size={16} className="text-slate-500 group-hover:text-white transform rotate-180" />
                </div>
            </button>
        );
    };

    // Card for each material in the detail view
    const MaterialCard = ({ item }) => {
        const Icon = getMaterialIcon(item.material_type);
        return (
            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200/60 p-5 flex flex-col transition-shadow hover:shadow-lg">
                <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0 mr-4">
                        <Icon className="text-slate-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{item.material_type}</p>
                    </div>
                </div>
                {item.description && <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">{item.description}</p>}
                <div className="border-t border-slate-200/80 pt-4 mt-auto flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                    </p>
                    <div className="flex items-center space-x-3">
                        {item.file_path && <a href={`${API_BASE_URL}${item.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 transition-colors text-sm"><MdDownload size={16} /><span>Download</span></a>}
                        {item.external_link && <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors text-sm"><MdLaunch size={16} /><span>Open</span></a>}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading || loadingProfile) {
            return <div className="text-center py-20"><div className="h-16 w-16 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin mx-auto"></div><p className="mt-4 text-slate-600">Loading resources...</p></div>;
        }

        // Show search results if there's a query
        if (query) {
             return (
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Search Results ({filteredMaterials.length})</h2>
                    {filteredMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMaterials.map(m => <MaterialCard key={m.material_id} item={m} />)}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl shadow-sm border"><MdFilterNone size={48} className="mx-auto text-slate-400" /><h3 className="mt-4 text-xl font-semibold text-slate-700">No materials match "{query}"</h3><p className="text-slate-500">Try a different search term.</p></div>
                    )}
                </div>
             )
        }
        
        // Show material details if a subject is selected
        if (selectedSubject) {
            const Icon = getSubjectIcon(selectedSubject.name);
            return (
                <div>
                    <button onClick={() => setSelectedSubject(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors mb-6">
                        <MdArrowBack /><span>Back to all subjects</span>
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center shadow-md border border-slate-200/70"><Icon size={28} className="text-blue-600" /></div>
                        <div><h2 className="text-3xl font-bold text-slate-800">{selectedSubject.name}</h2><p className="text-slate-500">{selectedSubject.count} resource{selectedSubject.count !== 1 ? 's' : ''}</p></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {selectedSubject.materials.map(m => <MaterialCard key={m.material_id} item={m} />)}
                    </div>
                </div>
            );
        }

        // Default view: Show subject overview
        return (
            <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Explore Your Subjects</h2>
                <p className="text-slate-600 mb-8">Select a subject to view its study materials.</p>
                {subjectData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {subjectData.map(subject => <SubjectCard key={subject.name} subject={subject.name} count={subject.count} onClick={() => setSelectedSubject(subject)} />)}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-slate-50 rounded-2xl shadow-sm border"><MdFolderOpen size={48} className="mx-auto text-slate-400" /><h3 className="mt-4 text-xl font-semibold text-slate-700">No Study Materials Found</h3><p className="text-slate-500">Resources for your class will appear here when added.</p></div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* --- HEADER IS UNCHANGED --- */}
            <header className="border-b border-slate-200 bg-slate-100/80 backdrop-blur-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Study Materials & Resources</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Access notes, presentations, and other study materials</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search all materials..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="inline-flex items-stretch rounded-lg border border-slate-300 bg-white overflow-hidden">
                                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                                <div className="w-px bg-slate-300" />
                                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                                <div className="w-px bg-slate-300" />
                                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
                            </div>
                            <div className="h-6 w-px bg-slate-300 mx-1" />
                            <div className="flex items-center gap-3">
                                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                                <div className="hidden sm:flex flex-col"><span className="text-sm font-medium text-slate-900 truncate max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span><span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span></div>
                                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
                                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50" title="Notifications" type="button">
                                    <BellIcon />
                                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-full">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
                {/* +++ ADDED THIS BACK BUTTON +++ */}
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

export default StudentMaterialsScreen;