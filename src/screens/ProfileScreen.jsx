"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import { MdArrowBack, MdSave, MdCancel, MdEdit } from 'react-icons/md';

// --- Icon Components for Header (Unchanged) ---
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


export default function ProfileScreen({ onBackPress, staticProfileData, onStaticSave, onProfileUpdate }) {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header ---
    const [headerProfile, setHeaderProfile] = useState(null);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    const [headerQuery, setHeaderQuery] = useState("");

    // --- State for Profile Page ---
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);

    // --- Hooks for Header Data (Unchanged) ---
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
                if (res.ok) setHeaderProfile(await res.json());
                else setHeaderProfile({ id: user.id, username: user.username || "Unknown", full_name: user.full_name || "User", role: user.role || "user" });
            } catch { setHeaderProfile(null); }
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

    // --- Main Profile Logic (Unchanged) ---
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            if (staticProfileData) {
                setProfileData(staticProfileData);
            } else if (user) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
                    if (!response.ok) throw new Error('Could not fetch profile.');
                    const data = await response.json();
                    setProfileData(data);
                } catch (error) {
                    alert(error.message);
                    setProfileData(null);
                }
            }
            setIsLoading(false);
        };
        loadProfile();
    }, [user, staticProfileData]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImageFile(file);
            setProfileData(prev => ({ ...prev, profile_image_url: URL.createObjectURL(file) }));
        }
    };

    const handleSave = async (editedData) => {
        setIsSaving(true);
        try {
            if (onStaticSave) {
                await onStaticSave(editedData, newImageFile);
                setProfileData(editedData);
                setIsEditing(false);
            } else if (user) {
                const formData = new FormData();
                Object.entries(editedData).forEach(([key, value]) => {
                    if (value != null) formData.append(key, value);
                });
                if (newImageFile) {
                    formData.append('profileImage', newImageFile);
                }
                const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`, {
                    method: 'PUT',
                    body: formData,
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to save profile.');
                }
                const refreshedProfile = await response.json();
                setProfileData({ ...editedData, ...refreshedProfile });
                if (onProfileUpdate) onProfileUpdate(refreshedProfile);
                alert('Profile updated successfully!');
                setIsEditing(false);
                setNewImageFile(null);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

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

    const handleBackClick = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigate(getDefaultDashboardRoute());
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-600 text-lg">Loading profile...</p>
        </div>
    );

    if (!profileData) return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">
            <div className="text-center">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-slate-600 text-lg">Profile not available.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100">
            {/* --- Header (Color Reverted) --- */}
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">My Profile</h1>
                            <p className="text-xs sm:text-sm text-slate-600">View and manage your personal information</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={headerQuery} onChange={(e) => setHeaderQuery(e.target.value)} placeholder="Search..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="inline-flex items-stretch rounded-lg border border-slate-300 bg-white overflow-hidden">
                                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home">
                                    <HomeIcon />
                                    <span className="hidden md:inline">Home</span>
                                </button>
                                <div className="w-px bg-slate-300" aria-hidden="true" />
                                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar">
                                    <CalendarIcon />
                                    <span className="hidden md:inline">Calendar</span>
                                </button>
                                <div className="w-px bg-slate-300" aria-hidden="true" />
                                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile">
                                    <UserIcon />
                                    <span className="hidden md:inline">Profile</span>
                                </button>
                            </div>
                            <div className="h-4 sm:h-6 w-px bg-slate-300 mx-0.5 sm:mx-1" aria-hidden="true" />
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-300 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{headerProfile?.full_name || headerProfile?.username || "User"}</span>
                                    <span className="text-xs text-slate-600 capitalize">{headerProfile?.role || ""}</span>
                                </div>
                                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <span className="hidden sm:inline">Logout</span>
                                    <span className="sm:hidden">Exit</span>
                                </button>
                                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
                                    <BellIcon />
                                    {localUnreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{localUnreadCount > 99 ? "99+" : localUnreadCount}</span>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main>
                {isEditing
                    ? <EditProfileView
                        profileData={profileData}
                        onSave={handleSave}
                        onCancel={() => setIsEditing(false)}
                        isSaving={isSaving}
                        onFileChange={handleFileChange}
                    />
                    : <DisplayProfileView
                        profileData={profileData}
                        onEdit={() => setIsEditing(true)}
                        onBackPress={handleBackClick}
                    />
                }
            </main>
        </div>
    );
}

// --- REVISED Display Mode Component ---
function DisplayProfileView({ profileData, onEdit, onBackPress }) {
    const imageSrc = profileData.profile_image_url
        ? (profileData.profile_image_url.startsWith('http') || profileData.profile_image_url.startsWith('blob:'))
            ? profileData.profile_image_url
            : `${API_BASE_URL}${profileData.profile_image_url}`
        : '/assets/profile.png';

    const showAcademic = profileData.role !== 'donor';

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <button
                    onClick={onBackPress}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back to Dashboard"
                >
                    <MdArrowBack className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-50 rounded-2xl shadow-sm p-6 text-center sticky top-24 border border-slate-200/80">
                        <div className="relative inline-block mb-4">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-25"></div>
                            <img
                                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-50 object-cover shadow-md"
                                src={imageSrc}
                                alt="Profile"
                                onError={(e) => { e.currentTarget.src = '/assets/profile.png' }}
                            />
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-slate-50 rounded-full"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{profileData.full_name}</h2>
                        <p className="text-sm text-slate-500 mb-4 capitalize">{`@${profileData.username}`}</p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full capitalize">{profileData.role}</span>
                        
                        <div className="mt-6 text-left space-y-4">
                            <div className="flex items-center text-slate-600">
                                <svg className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                <span className="text-sm break-all">{profileData.email}</span>
                            </div>
                             <div className="flex items-center text-slate-600">
                                <svg className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-sm">{profileData.phone || 'Not provided'}</span>
                            </div>
                        </div>
                        
                        <button onClick={onEdit} className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm shadow hover:shadow-md">
                            <MdEdit />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>
                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <InfoSection title="Personal Information">
                        <InfoRow label="User ID" value={profileData.username} />
                        {showAcademic && (
                            <>
                                <InfoRow label="Date of Birth" value={profileData.dob} />
                                <InfoRow label="Gender" value={profileData.gender} />
                            </>
                        )}
                    </InfoSection>
                    <InfoSection title="Contact Information">
                        <InfoRow label="Email" value={profileData.email} />
                        <InfoRow label="Phone" value={profileData.phone} />
                        <InfoRow label="Address" value={profileData.address} />
                    </InfoSection>
                    {showAcademic && (
                        <InfoSection title="Academic Details">
                            <InfoRow label="Class / Group" value={profileData.class_group} />
                            <InfoRow label="Roll No." value={profileData.roll_no} />
                            <InfoRow label="Admission Date" value={profileData.admission_date} />
                        </InfoSection>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- REVISED Edit Mode Component ---
function EditProfileView({ profileData, onSave, onCancel, isSaving, onFileChange }) {
    const [formData, setFormData] = useState({ ...profileData });
    const showAcademic = profileData.role !== 'donor';
    const imageSrc = formData.profile_image_url && formData.profile_image_url.startsWith('blob:')
        ? formData.profile_image_url
        : (profileData.profile_image_url ? `${API_BASE_URL}${profileData.profile_image_url}` : '/assets/profile.png');
    
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image Upload */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-50 rounded-2xl shadow-sm p-6 text-center sticky top-24 border border-slate-200/80">
                        <div className="relative inline-block mb-4">
                             <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-25"></div>
                            <img
                                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-50 object-cover shadow-md"
                                src={imageSrc}
                                alt="Profile Preview"
                                onError={(e) => { e.currentTarget.src = '/assets/profile.png' }}
                            />
                        </div>
                        <label className="mt-4 w-full cursor-pointer inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-semibold text-sm border border-slate-300">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>Change Photo</span>
                            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                        </label>
                        <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF (max 5MB)</p>
                    </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80">
                        <div className="p-6 border-b border-slate-200"><h3 className="text-xl font-semibold text-slate-800">Personal Information</h3></div>
                        <div className="p-6 space-y-4">
                            <InputField label="Full Name" name="full_name" value={formData.full_name || ''} onChange={handleChange} />
                            {showAcademic && (<>
                                <InputField label="Date of Birth" name="dob" type="date" value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''} onChange={handleChange} />
                                <InputField label="Gender" name="gender" value={formData.gender || ''} onChange={handleChange} />
                            </>)}
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80">
                        <div className="p-6 border-b border-slate-200"><h3 className="text-xl font-semibold text-slate-800">Contact Information</h3></div>
                        <div className="p-6 space-y-4">
                            <InputField label="Email" name="email" value={formData.email || ''} onChange={handleChange} type="email" />
                            <InputField label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} type="tel" />
                            <InputField label="Address" name="address" value={formData.address || ''} onChange={handleChange} multiline />
                        </div>
                    </div>
                    {showAcademic && (
                        <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80">
                             <div className="p-6 border-b border-slate-200"><h3 className="text-xl font-semibold text-slate-800">Academic Details</h3></div>
                             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Class / Group" name="class_group" value={formData.class_group || ''} onChange={handleChange} />
                                <InputField label="Roll No." name="roll_no" value={formData.roll_no || ''} onChange={handleChange} />
                                <InputField label="Admission Date" name="admission_date" type="date" value={formData.admission_date ? new Date(formData.admission_date).toISOString().split('T')[0] : ''} onChange={handleChange} />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onCancel} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md">
                           {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

// --- REVISED Helper Components ---

function InfoSection({ title, children }) {
    return (
        <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="p-5 sm:p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            </div>
            <div className="p-5 sm:p-6">
                <dl className="divide-y divide-slate-200">{children}</dl>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
            <dt className="text-sm font-medium text-slate-600">{label}</dt>
            <dd className="sm:col-span-2 text-sm text-slate-900 font-medium break-words">{value || 'N/A'}</dd>
        </div>
    );
}

function InputField({ label, name, value, onChange, type = 'text', multiline = false, placeholder = '' }) {
    const commonProps = {
        id: name,
        name: name,
        value: value,
        onChange: onChange,
        placeholder: placeholder || label,
        className: "block w-full text-sm rounded-lg border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors duration-200"
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            {multiline ? (
                <textarea {...commonProps} rows={3} />
            ) : (
                <input {...commonProps} type={type} />
            )}
        </div>
    );
}