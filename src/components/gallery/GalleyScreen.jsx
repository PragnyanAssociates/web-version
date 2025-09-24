import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext.tsx';
import { MdPhotoLibrary, MdCloudUpload, MdEvent, MdTitle, MdClose, MdDelete, MdAdd, MdArrowBack } from "react-icons/md";

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

export default function GalleryScreen() {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === "admin";

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [headerQuery, setHeaderQuery] = useState("");

    // --- State for Gallery Page ---
    const [tab, setTab] = useState("photos");
    const [loading, setLoading] = useState(true);
    const [photoAlbums, setPhotoAlbums] = useState([]);
    const [videoAlbums, setVideoAlbums] = useState([]);
    const [viewingAlbum, setViewingAlbum] = useState(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadDate, setUploadDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // --- Hooks for Header Data ---
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

    // --- Main Gallery Logic ---
    useEffect(() => {
        fetchGalleryData();
    }, []);

    async function fetchGalleryData() {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/gallery`);
            const data = await res.json();
            const allAlbums = groupDataByTitle(data || []);
            setPhotoAlbums(allAlbums.filter((album) => album.items.some((i) => i.file_type === "photo")));
            setVideoAlbums(allAlbums.filter((album) => album.items.some((i) => i.file_type === "video")));
        } catch (e) {
            alert("Failed to load gallery.");
            setPhotoAlbums([]);
            setVideoAlbums([]);
        } finally {
            setLoading(false);
        }
    }

    function groupDataByTitle(data) {
        const grouped = {};
        (data || []).forEach((item) => {
            if (!grouped[item.title])
                grouped[item.title] = { title: item.title, date: item.event_date, items: [] };
            grouped[item.title].items.push(item);
        });
        return Object.values(grouped).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );
    }

    function openAlbum(album) {
        setViewingAlbum(album);
        window.scrollTo(0, 0);
    }

    async function handleDeleteAlbum(albumTitle, e) {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to permanently delete the "${albumTitle}" album and all its contents? This cannot be undone.`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/gallery/album`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: albumTitle, role: user?.role }),
                });
                if (response.ok) {
                    alert(`Album "${albumTitle}" has been deleted.`);
                    fetchGalleryData();
                } else {
                    alert("Failed to delete album.");
                }
            } catch (error) {
                console.error("Failed to delete album:", error);
                alert("An error occurred while deleting the album.");
            }
        }
    }

    async function handleUpload(e) {
        e.preventDefault();
        if (!uploadTitle.trim() || !uploadDate || !uploadFile) {
            alert("Please fill all fields and pick a file.");
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append("title", uploadTitle.trim());
        formData.append("event_date", uploadDate);
        formData.append("role", user.role);
        formData.append("adminId", String(user.id));
        formData.append("media", uploadFile);
        try {
            const res = await fetch(`${API_BASE_URL}/api/gallery/upload`, {
                method: "POST",
                body: formData,
            });
            const ok = res.ok;
            setIsUploading(false);
            if (ok) {
                alert("Upload successful!");
                setUploadModalOpen(false);
                fetchGalleryData();
            } else {
                const err = await res.json();
                alert(err.message || "Upload error");
            }
        } catch {
            setIsUploading(false);
            alert("Failed to upload.");
        }
    }

    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        if (user.role === 'student') return '/StudentDashboard';
        return '/';
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">School Gallery</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Memories from school events and activities</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={headerQuery} onChange={(e) => setHeaderQuery(e.target.value)} placeholder="Search ..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                {/* --- UNIFIED BACK BUTTON --- */}
                <div className="mb-6">
                    {viewingAlbum ? (
                        <button onClick={() => setViewingAlbum(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                            <MdArrowBack className="w-5 h-5" />
                            <span>Back to Albums</span>
                        </button>
                    ) : (
                        <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                            <MdArrowBack className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </button>
                    )}
                </div>

                {/* --- CONDITIONAL CONTENT --- */}
                {viewingAlbum ? (
                    <AlbumDetailScreen
                        title={viewingAlbum.title}
                        items={viewingAlbum.items}
                    />
                ) : (
                    <>
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <button
                                className={`px-5 py-2 rounded-full font-semibold shadow ${tab === "photos"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                onClick={() => setTab("photos")}
                                type="button"
                            >
                                Photos
                            </button>
                            <button
                                className={`px-5 py-2 rounded-full font-semibold shadow ${tab === "videos"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                onClick={() => setTab("videos")}
                                type="button"
                            >
                                Videos
                            </button>
                        </div>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-60">
                                <GallerySpinner />
                            </div>
                        ) : (
                            <div>
                                {tab === "photos" && <AlbumList albums={photoAlbums} onClick={openAlbum} onDelete={handleDeleteAlbum} isAdmin={isAdmin} type="photo" />}
                                {tab === "videos" && <AlbumList albums={videoAlbums} onClick={openAlbum} onDelete={handleDeleteAlbum} isAdmin={isAdmin} type="video" />}
                            </div>
                        )}
                        {isAdmin && (
                            <button
                                className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-4xl text-white z-40 hover:bg-blue-700 transition transform hover:scale-110"
                                title="Upload Media"
                                onClick={() => setUploadModalOpen(true)}
                                aria-label="Upload Media"
                                type="button"
                            >
                                +
                            </button>
                        )}
                    </>
                )}
            </main>

            {isAdmin && uploadModalOpen && (
                <Modal onClose={() => setUploadModalOpen(false)}>
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-auto mx-auto p-6 sm:p-8 lg:p-10 space-y-8">
                        <div className="flex justify-between items-center border-b border-gray-200/60 pb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
                                    <MdCloudUpload size={24} className="text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wide">Upload New Media</h2>
                            </div>
                            <button
                                className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 border border-white/30"
                                onClick={() => setUploadModalOpen(false)}
                                aria-label="Close"
                                type="button"
                            >
                                <MdClose size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <form className="space-y-8" onSubmit={handleUpload}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <MdTitle size={20} className="text-blue-600" />
                                        <label className="block text-sm font-semibold text-gray-700 tracking-wide">Event Title</label>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full border-2 border-gray-200/60 rounded-2xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base font-medium"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                        placeholder="Enter event title..."
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <MdEvent size={20} className="text-blue-600" />
                                        <label className="block text-sm font-semibold text-gray-700 tracking-wide">Event Date</label>
                                    </div>
                                    <input
                                        type="date"
                                        className="w-full border-2 border-gray-200/60 rounded-2xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base font-medium"
                                        value={uploadDate}
                                        onChange={(e) => setUploadDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <MdCloudUpload size={20} className="text-blue-600" />
                                    <label className="block text-sm font-semibold text-gray-700 tracking-wide">Select Photo/Video</label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="block w-full border-2 border-dashed border-gray-300/60 rounded-2xl p-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm text-base font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                        required
                                    />
                                    {uploadFile && (
                                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/60">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                <p className="text-sm text-blue-700 font-medium truncate">{uploadFile.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/60">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-2xl text-gray-800 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/30 shadow-lg"
                                    onClick={() => setUploadModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg backdrop-blur-sm flex items-center space-x-2 ${isUploading ? "animate-pulse" : ""
                                        }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <MdCloudUpload size={18} />
                                            <span>Upload</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// --- AlbumDetailScreen Component ---
function AlbumDetailScreen({ title, items }) {
    items = Array.isArray(items) ? items : [];

    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [selectedVideoUri, setSelectedVideoUri] = useState(null);

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadDate, setUploadDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const handleItemClick = (item) => {
        if (item.file_type === "photo") {
            setSelectedImageUri(`${API_BASE_URL}/${item.file_path}`);
            setImageModalOpen(true);
        } else {
            setSelectedVideoUri(`${API_BASE_URL}/${item.file_path}`);
            setVideoModalOpen(true);
        }
    };

    const closeModal = () => {
        setImageModalOpen(false);
        setVideoModalOpen(false);
        setSelectedImageUri(null);
        setSelectedVideoUri(null);
    };

    const handleDeleteItem = async (itemId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this item? This cannot be undone.')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/gallery/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: user?.role }),
                });
                if (response.ok) {
                    alert('Item deleted successfully!');
                    window.location.reload();
                } else {
                    alert('Failed to delete item.');
                }
            } catch (error) {
                console.error('Failed to delete item:', error);
                alert('An error occurred while deleting the item.');
            }
        }
    };

    const handleUploadToAlbum = async (e) => {
        e.preventDefault();
        if (!uploadDate || !uploadFile) {
            alert("Please select a date and file.");
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("event_date", uploadDate);
        formData.append("role", user.role);
        formData.append("adminId", String(user.id));
        formData.append("media", uploadFile);
        try {
            const res = await fetch(`${API_BASE_URL}/api/gallery/upload`, {
                method: "POST",
                body: formData,
            });
            const ok = res.ok;
            setIsUploading(false);
            if (ok) {
                alert("Upload successful!");
                setUploadModalOpen(false);
                window.location.reload();
            } else {
                const err = await res.json();
                alert(err.message || "Upload error");
            }
        } catch {
            setIsUploading(false);
            alert("Failed to upload.");
        }
    };

    return (
        <div className="relative">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdPhotoLibrary size={32} className="text-gray-400" />
                        </div>
                        <p className="text-xl text-gray-600 font-medium">No media files found</p>
                        <p className="text-gray-500 mt-2">This album is empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                        {items.map((item, index) => (
                            <div key={item.id} className="relative group">
                                {isAdmin && (
                                    <button
                                        onClick={(e) => handleDeleteItem(item.id, e)}
                                        className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg opacity-0 group-hover:opacity-100"
                                        aria-label="Delete Item"
                                        title="Delete Item"
                                    >
                                        <MdDelete size={14} className="text-white" />
                                    </button>
                                )}
                                <button
                                    className="relative outline-none focus:ring-4 focus:ring-blue-500/50 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
                                    onClick={() => handleItemClick(item)}
                                    tabIndex={0}
                                    aria-label={item.title || item.file_type}
                                    type="button"
                                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}
                                >
                                    {item.file_type === "photo" ? (
                                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg border border-white/30">
                                            <img
                                                src={`${API_BASE_URL}/${item.file_path}`}
                                                alt={item.title || ""}
                                                className="w-full h-32 sm:h-40 object-cover transition-all duration-300 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center rounded-2xl shadow-lg relative border border-white/30 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/50 to-gray-900/50 group-hover:from-gray-600/50 group-hover:to-gray-800/50 transition-all duration-300" />
                                            <svg className="w-12 h-12 text-white opacity-90 z-10 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#333" opacity="0.4" />
                                                <polygon points="10,8 16,12 10,16" fill="#fff" stroke="none" />
                                            </svg>
                                            <span className="sr-only">Play video</span>
                                            <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white font-medium backdrop-blur-sm">VIDEO</div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isAdmin && (
                <button
                    className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white z-40 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
                    title="Add to Album"
                    onClick={() => setUploadModalOpen(true)}
                    aria-label="Add Media to Album"
                    type="button"
                >
                    <MdAdd size={28} />
                </button>
            )}
            {isAdmin && uploadModalOpen && (
                <Modal onClose={() => setUploadModalOpen(false)}>
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-auto mx-auto p-6 sm:p-8 space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-200/60 pb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
                                    <MdAdd size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-wide">Add to Album</h2>
                                    <p className="text-sm text-gray-600 mt-1">"{title}"</p>
                                </div>
                            </div>
                            <button
                                className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 border border-white/30"
                                onClick={() => setUploadModalOpen(false)}
                                aria-label="Close"
                                type="button"
                            >
                                <MdClose size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <form className="space-y-6" onSubmit={handleUploadToAlbum}>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <MdEvent size={20} className="text-blue-600" />
                                    <label className="block text-sm font-semibold text-gray-700 tracking-wide">Event Date</label>
                                </div>
                                <input type="date" className="w-full border-2 border-gray-200/60 rounded-2xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base font-medium" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} required />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <MdCloudUpload size={20} className="text-blue-600" />
                                    <label className="block text-sm font-semibold text-gray-700 tracking-wide">Select Photo/Video</label>
                                </div>
                                <div className="relative">
                                    <input type="file" accept="image/*,video/*" className="block w-full border-2 border-dashed border-gray-300/60 rounded-2xl p-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm text-base font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} required />
                                    {uploadFile && (
                                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/60">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                <p className="text-sm text-blue-700 font-medium truncate">{uploadFile.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/60">
                                <button type="button" className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-2xl text-gray-800 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/30 shadow-lg" onClick={() => setUploadModalOpen(false)} >Cancel</button>
                                <button type="submit" disabled={isUploading} className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg backdrop-blur-sm flex items-center space-x-2 ${isUploading ? "animate-pulse" : ""}`}>
                                    {isUploading ? (<><div className="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"></div><span>Adding...</span></>) : (<><MdAdd size={18} /><span>Add to Album</span></>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
            {imageModalOpen && (
                <Modal onClose={closeModal}>
                    <img src={selectedImageUri} alt="" className="max-h-[80vh] max-w-[96vw] rounded-2xl shadow-2xl object-contain mx-auto border border-white/20" style={{ background: "rgba(255,255,255,0.05)" }} />
                </Modal>
            )}
            {videoModalOpen && (
                <Modal onClose={closeModal}>
                    <div className="w-[90vw] max-w-4xl flex items-center justify-center">
                        <video src={selectedVideoUri} controls className="bg-black rounded-2xl shadow-2xl w-full max-h-[75vh] border border-white/20" style={{ outline: "none" }} preload="auto">Your browser does not support the video tag.</video>
                    </div>
                </Modal>
            )}
            <style jsx>{` @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}


function AlbumList({ albums, onClick, onDelete, isAdmin, type }) {
    if (!albums || !albums.length)
        return (
            <div className="py-28 text-center text-gray-500">No {type} albums found.</div>
        );
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
            {albums.map((section) => (
                <div
                    key={section.title}
                    className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition flex flex-col overflow-hidden text-left group cursor-pointer"
                    onClick={() => onClick(section)}
                >
                    {isAdmin && (
                        <button
                            onClick={(e) => onDelete(section.title, e)}
                            className="absolute top-3 right-3 z-10 w-9 h-9 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
                            aria-label="Delete Album"
                            title="Delete Album"
                        >
                            <MdDelete size={16} className="text-white" />
                        </button>
                    )}

                    <img
                        src={getAlbumCover(section)}
                        alt=""
                        className="w-full h-44 object-cover group-hover:scale-105 transition"
                    />
                    <div className="p-4">
                        <div className="font-semibold text-gray-900 text-base truncate">{section.title}</div>
                        <div className="text-xs text-gray-500">
                            {new Date(section.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{section.items.length} items</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function getAlbumCover(section) {
    const cover = section.items.find((i) => i.file_type === "photo") || section.items[0];
    return cover ? `${API_BASE_URL}/${cover.file_path}` : "";
}

function Modal({ children, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative bg-transparent mx-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

function GallerySpinner() {
    return (
        <svg
            className="animate-spin h-9 w-9 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}