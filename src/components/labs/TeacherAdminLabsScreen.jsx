import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../../apiConfig";
import { useAuth } from "../../context/AuthContext.tsx";
import { MdPhotoLibrary, MdCloudUpload, MdEvent, MdTitle, MdClose, MdDelete, MdAdd, MdEdit } from "react-icons/md";

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

// Custom SVG Icon for Digital Labs
function DigitalLabIcon() {
    return (
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

export default function TeacherAdminLabsScreen() {
    const navigate = useNavigate();
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [headerQuery, setHeaderQuery] = useState("");

    // --- State for Labs Page ---
    const [labs, setLabs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
    const [editingLab, setEditingLab] = useState(null);

    const initialFormState = {
        title: "",
        subject: "",
        lab_type: "",
        description: "",
        access_url: ""
    };
    const [formData, setFormData] = useState(initialFormState);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // --- Hooks for Header ---
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
            setLabs(await response.json());
        } catch (e) {
            alert(e.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLabs();
    }, [fetchLabs]);

    const handleChoosePhoto = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };
    const handleChooseFile = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleShowForm = (lab = null) => {
        setEditingLab(lab);
        if (lab) {
            setFormData({
                title: lab.title,
                subject: lab.subject,
                lab_type: lab.lab_type,
                description: lab.description,
                access_url: lab.access_url || ""
            });
        } else {
            setFormData(initialFormState);
        }
        setSelectedImage(null);
        setSelectedFile(null);
        setViewMode('form');
    };

    const handleReturnToList = () => {
        setEditingLab(null);
        setFormData(initialFormState);
        setViewMode('list');
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) {
            return alert("Title and Description are required.");
        }
        if (!formData.access_url && !selectedFile && !editingLab?.file_path) {
            return alert("You must provide an Access URL or upload a file.");
        }
        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        if (user) data.append("created_by", user.id);

        if (selectedImage) data.append("coverImage", selectedImage);
        if (selectedFile) data.append("labFile", selectedFile);

        const url = editingLab
            ? `${API_BASE_URL}/api/labs/${editingLab.id}`
            : `${API_BASE_URL}/api/labs`;
        const method = editingLab ? "PUT" : "POST";

        try {
            const response = await fetch(url, { method, body: data });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message);
            alert(`Lab ${editingLab ? "updated" : "created"} successfully!`);
            handleReturnToList();
            fetchLabs();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lab?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/labs/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete lab.");
            alert("Lab deleted.");
            fetchLabs();
        } catch (e) {
            alert(e.message);
        }
    };

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
                            <p className="text-xs sm:text-sm text-slate-600">Manage learning resources and simulations</p>
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
                {viewMode === 'list' ? (
                    <>
                        <div className="mb-6">
                            <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                <span>Back to Dashboard</span>
                            </button>
                        </div>

                        <div className="mb-8 flex justify-end">
                            <button className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] text-sm" onClick={() => handleShowForm(null)}>
                                <MdAdd className="mr-2" size={20} />
                                <span>Add New Lab</span>
                            </button>
                        </div>

                        {labs.length === 0 ? (
                            <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <DigitalLabIcon />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-3">No Labs Created Yet</h3>
                                <p className="text-gray-600 mb-6 text-base">Start building your digital lab collection by adding your first lab.</p>
                            </div>
                        ) : (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {labs.map((lab, index) => (
                                    <li key={lab.id} className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 p-4 transition-shadow hover:shadow-md flex flex-col h-full" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                                        <img src={lab.cover_image_url ? `${API_BASE_URL}${lab.cover_image_url}` : "/assets/lab-placeholder.png"} alt={lab.title} className="w-full h-40 rounded-md object-cover flex-shrink-0 bg-slate-200 mb-4" onError={(e) => { e.currentTarget.src = "/assets/lab-placeholder.png"; }} />
                                        <div className="flex flex-col flex-grow">
                                            <div className="flex-grow">
                                                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">{lab.lab_type || "General"}</span>
                                                <h3 className="text-lg font-bold text-slate-800">{lab.title}</h3>
                                                {lab.subject && <p className="text-sm font-medium text-slate-500 mb-2">{lab.subject}</p>}
                                                <p className="text-sm text-slate-600 line-clamp-3">{lab.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2 self-end pt-4">
                                                <button onClick={() => handleShowForm(lab)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors border border-slate-200" title="Edit Lab">
                                                    <MdEdit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(lab.id)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors border border-slate-200" title="Delete Lab">
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    // --- NEW: Form is now part of the main page body ---
                    <div className="bg-slate-50 rounded-xl shadow-lg border border-slate-200 p-4 sm:p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="flex items-center justify-center mb-3">
                                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                        {editingLab ? "Edit Digital Lab" : "Add New Digital Lab"}
                                    </h2>
                                </div>
                                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Title *</label>
                                        <input className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 transition-all duration-300 bg-white text-sm" placeholder="Enter lab title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                        <input className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 transition-all duration-300 bg-white text-sm" placeholder="Enter subject name" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Type</label>
                                        <input className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 transition-all duration-300 bg-white text-sm" placeholder="e.g., Simulation, PDF, Video" value={formData.lab_type} onChange={(e) => setFormData({ ...formData, lab_type: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                        <textarea className="w-full border-2 border-gray-200 rounded-lg p-3 h-24 sm:h-28 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 transition-all duration-300 bg-white resize-none text-sm" placeholder="Describe what students will learn from this lab" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                        <label className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg p-4 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <MdPhotoLibrary className="text-white text-lg" />
                                            </div>
                                            <p className="text-blue-700 font-medium text-center text-sm">{editingLab?.cover_image_url || selectedImage ? "Change Cover Image" : "Select Cover Image"}</p>
                                            <p className="text-blue-500 text-xs mt-1">PNG, JPG up to 5MB</p>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleChoosePhoto} />
                                        </label>
                                        {selectedImage && (<div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200"><p className="text-blue-700 font-medium text-xs">✓ Selected: {selectedImage.name}</p></div>)}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex-1 border-t border-gray-300"></div>
                                        <span className="px-3 text-gray-500 font-medium text-xs">OR</span>
                                        <div className="flex-1 border-t border-gray-300"></div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Access URL</label>
                                        <input className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 transition-all duration-300 bg-white text-sm" placeholder="https://example.com/lab-link" value={formData.access_url} onChange={(e) => setFormData({ ...formData, access_url: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Lab File</label>
                                        <label className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg p-4 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <MdCloudUpload className="text-white text-lg" />
                                            </div>
                                            <p className="text-blue-700 font-medium text-center text-sm">{editingLab?.file_path || selectedFile ? "Change Lab File" : "Upload Lab File"}</p>
                                            <p className="text-blue-500 text-xs mt-1">Any file format</p>
                                            <input type="file" className="hidden" onChange={handleChooseFile} />
                                        </label>
                                        {selectedFile && (<div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200"><p className="text-blue-700 font-medium text-xs">✓ Selected: {selectedFile.name}</p></div>)}
                                        {editingLab?.file_path && !selectedFile && (<div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200"><p className="text-gray-700 font-medium text-xs">📁 Current: {editingLab.file_path.split("/").pop()}</p></div>)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 pt-6 border-t border-gray-200">
                                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-300 hover:shadow-md min-w-[100px] text-sm" onClick={handleReturnToList} type="button">Cancel</button>
                                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] min-w-[100px] text-sm" onClick={handleSave} type="button">Save Lab</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};