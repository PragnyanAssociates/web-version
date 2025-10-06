"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../apiConfig';
import apiClient from '../api/client';
import { MdArrowBack, MdEdit, MdClose, MdDownload } from 'react-icons/md';

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

// ProfileAvatar component ONLY for header
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

// --- Facebook-style Image Modal Component ---
function ImageModal({ isOpen, onClose, imageUrl, alt, userName }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent body scroll
        }
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Reset states when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setImageLoaded(false);
            setImageError(false);
        }
    }, [isOpen, imageUrl]);

    const handleDownload = () => {
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${userName || 'profile'}_picture.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Dark backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 transition-opacity duration-300"
                onClick={onClose}
                style={{ backdropFilter: 'blur(4px)' }}
            />
            
            {/* Modal content */}
            <div className="relative z-10 max-w-7xl max-h-[90vh] w-full mx-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <UserIcon />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{userName || 'Profile Picture'}</h3>
                            <p className="text-sm text-gray-300">Click outside to close</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {imageUrl && (
                            <button
                                onClick={handleDownload}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                title="Download image"
                            >
                                <MdDownload className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            title="Close (Esc)"
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Image container */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                        {/* Loading placeholder */}
                        {!imageLoaded && !imageError && imageUrl && (
                            <div className="w-96 h-96 bg-gray-800 rounded-lg flex items-center justify-center animate-pulse">
                                <svg className="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                        )}

                        {/* Error state */}
                        {imageError && (
                            <div className="w-96 h-96 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-white">
                                <svg className="w-20 h-20 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                </svg>
                                <p className="text-gray-300">Could not load image</p>
                            </div>
                        )}

                        {/* Main image */}
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt={alt}
                                className={`max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl transition-all duration-500 ${
                                    imageLoaded && !imageError ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                }`}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                                style={{
                                    filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))'
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function ProfileScreen({ onBackPress, staticProfileData, onStaticSave, onProfileUpdate }) {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // States
    const [headerProfile, setHeaderProfile] = useState(null);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    const [headerQuery, setHeaderQuery] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false); // New state for image modal

    // Header profile
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const response = await apiClient.get(`/profiles/${user.id}`);
                setHeaderProfile(response.data);
            } catch {
                setHeaderProfile({
                    id: user.id,
                    username: user.username || "Unknown",
                    full_name: user.full_name || "User",
                    role: user.role || "user"
                });
            }
        }
        fetchProfile();
    }, [user]);

    // Notifications (apiClient)
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) { setUnreadCount?.(0); return; }
            try {
                const response = await apiClient.get('/notifications');
                const count = Array.isArray(response.data) ? response.data.filter((n) => !n.is_read).length : 0;
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

    // Profile fetch (apiClient)
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            if (staticProfileData) {
                setProfileData(staticProfileData);
            } else if (user) {
                try {
                    const response = await apiClient.get(`/profiles/${user.id}`);
                    setProfileData(response.data);
                } catch (error) {
                    alert(error.response?.data?.message || 'Could not fetch profile.');
                    setProfileData(null);
                }
            }
            setIsLoading(false);
        };
        loadProfile();
    }, [user, staticProfileData]);

    // Updated File change handler with proper preview
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImageFile(file);
            
            // Create preview URL for immediate display
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
        }
    };

    // Reset preview when canceling edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setNewImageFile(null);
        setPreviewImage(null);
        
        // Clean up preview URL if it exists
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
    };

    // Save changes (apiClient)
    const handleSave = async (editedData) => {
        setIsSaving(true);
        try {
            if (onStaticSave) {
                await onStaticSave(editedData, newImageFile);
                setProfileData(editedData);
                if (previewImage && newImageFile) {
                    setProfileData(prev => ({
                        ...prev,
                        ...editedData,
                        profile_image_url: previewImage
                    }));
                }
            } else if (user) {
                const formData = new FormData();
                Object.entries(editedData).forEach(([key, value]) => {
                    if (value != null) formData.append(key, value);
                });
                if (newImageFile) {
                    formData.append('profileImage', newImageFile);
                }
                const response = await apiClient.put(`/profiles/${user.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const refreshedProfile = response.data;
                setProfileData({ ...editedData, ...refreshedProfile });
                if (onProfileUpdate) onProfileUpdate(refreshedProfile);
                alert('Profile updated successfully!');
            }
            
            setIsEditing(false);
            setNewImageFile(null);
            
            // Clean up preview URL
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
                setPreviewImage(null);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    // Function to get full image URL for modal
    const getFullImageUrl = () => {
        if (previewImage) return previewImage;
        if (!profileData?.profile_image_url) return null;
        
        const imageUrl = profileData.profile_image_url;
        return (imageUrl.startsWith('http') || imageUrl.startsWith('file') || imageUrl.startsWith('blob:')) 
            ? imageUrl 
            : `${SERVER_URL}${imageUrl}`;
    };

    // Logout logic
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate("/");
        }
    };

    // Dashboard route
    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'student') return '/StudentDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        if (user.role === 'donor') return '/DonorDashboard';
        return '/';
    };
    
    const handleBackClick = () => {
        if (onBackPress) onBackPress();
        else navigate(getDefaultDashboardRoute());
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
        <div className="min-h-screen bg-slate-50">
            {/* --- Header --- */}
            <header className="border-b border-slate-200 bg-slate-100">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">My Profile</h1>
                            <p className="text-xs sm:text-sm text-slate-600">View and manage your personal information</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input 
                                    id="module-search" 
                                    type="text" 
                                    value={headerQuery} 
                                    onChange={(e) => setHeaderQuery(e.target.value)} 
                                    placeholder="Search..." 
                                    className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="inline-flex items-stretch rounded-lg border border-slate-300 bg-white overflow-hidden">
                                <button 
                                    onClick={() => navigate(getDefaultDashboardRoute())} 
                                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" 
                                    type="button" 
                                    title="Home"
                                >
                                    <HomeIcon />
                                    <span className="hidden md:inline">Home</span>
                                </button>
                                <div className="w-px bg-slate-300" aria-hidden="true" />
                                <button 
                                    onClick={() => navigate("/AcademicCalendar")} 
                                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" 
                                    type="button" 
                                    title="Calendar"
                                >
                                    <CalendarIcon />
                                    <span className="hidden md:inline">Calendar</span>
                                </button>
                                <div className="w-px bg-slate-300" aria-hidden="true" />
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
                            <div className="h-4 sm:h-6 w-px bg-slate-300 mx-0.5 sm:mx-1" aria-hidden="true" />
                            <div className="flex items-center gap-2 sm:gap-3">
                                <ProfileAvatar className="w-7 h-7 sm:w-9 sm:h-9" />
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">
                                        {headerProfile?.full_name || headerProfile?.username || "User"}
                                    </span>
                                    <span className="text-xs text-slate-600 capitalize">{headerProfile?.role || ""}</span>
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
                                    className="relative inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
                                    aria-label="Notifications" 
                                    title="Notifications" 
                                    type="button"
                                >
                                    <BellIcon />
                                    {localUnreadCount > 0 && (
                                        <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">
                                            {localUnreadCount > 99 ? "99+" : localUnreadCount}
                                        </span>
                                    )}
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
                        onCancel={handleCancelEdit}
                        isSaving={isSaving}
                        onFileChange={handleFileChange}
                        previewImage={previewImage}
                        onImageClick={() => setIsImageModalOpen(true)}
                    />
                    : <DisplayProfileView
                        profileData={profileData}
                        onEdit={() => setIsEditing(true)}
                        onBackPress={handleBackClick}
                        onImageClick={() => setIsImageModalOpen(true)}
                    />
                }
            </main>

            {/* Image Modal */}
            <ImageModal 
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={getFullImageUrl()}
                alt={`${profileData?.full_name || 'Profile'} Picture`}
                userName={profileData?.full_name || profileData?.username}
            />
        </div>
    );
}

// --- Enhanced Profile Image Component with Click to Enlarge ---
function ProfileImage({ imageUri, previewImage, className = "w-28 h-28 sm:w-32 sm:h-32", alt = "Profile", onClick, clickable = false }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        // Reset states when imageUri or previewImage changes
        setImageLoaded(false);
        setImageError(false);
        
        // Priority: previewImage (for unsaved changes) > imageUri (saved image)
        if (previewImage) {
            setImageSrc(previewImage);
        } else if (imageUri) {
            const fullUri = (imageUri.startsWith('http') || imageUri.startsWith('file') || imageUri.startsWith('blob:')) 
                ? imageUri 
                : `${SERVER_URL}${imageUri}`;
            setImageSrc(fullUri);
        } else {
            setImageSrc(null);
        }
    }, [imageUri, previewImage]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    const handleClick = () => {
        if (clickable && onClick && imageSrc && !imageError) {
            onClick();
        }
    };

    return (
        <div 
            className={`relative ${className} rounded-full overflow-hidden ${
                clickable && imageSrc && !imageError ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''
            }`}
            onClick={handleClick}
            title={clickable && imageSrc && !imageError ? "Click to enlarge" : ""}
        >
            {/* Placeholder/Loading state - always present */}
            <div className={`absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center transition-opacity duration-300 ${imageLoaded && !imageError && imageSrc ? 'opacity-0' : 'opacity-100'}`}>
                <svg 
                    className="text-slate-400" 
                    style={{ width: '40%', height: '40%' }}
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
            </div>
            
            {/* Preview badge for unsaved changes */}
            {previewImage && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10 shadow-md">
                    Preview
                </div>
            )}
            
            {/* Enlarge icon overlay when clickable */}
            {clickable && imageSrc && imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white/90 rounded-full p-2 shadow-lg">
                        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
                </div>
            )}
            
            {/* Actual image - fades in smoothly */}
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                />
            )}
        </div>
    );
}

// --- Display Mode Component ---
function DisplayProfileView({ profileData, onEdit, onBackPress, onImageClick }) {
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
                            <ProfileImage 
                                imageUri={profileData.profile_image_url}
                                className="relative w-28 h-28 sm:w-32 sm:h-32 border-4 border-slate-50 shadow-md"
                                alt="Profile"
                                onClick={onImageClick}
                                clickable={true}
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{profileData.full_name}</h2>
                        <p className="text-sm text-slate-500 mb-4 capitalize">{`@${profileData.username}`}</p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                            {profileData.role}
                        </span>
                        <div className="mt-6 text-left space-y-4">
                            <div className="flex items-center text-slate-600">
                                <svg className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                <span className="text-sm break-all">{profileData.email}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <svg className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm">{profileData.phone || 'Not provided'}</span>
                            </div>
                        </div>
                        <button 
                            onClick={onEdit} 
                            className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm shadow hover:shadow-md"
                        >
                            <MdEdit />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>
                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <InfoSection title="Personal Information">
                        <InfoRow label="User ID" value={profileData.username} />
                        {showAcademic && (<>
                            <InfoRow label="Date of Birth" value={profileData.dob} />
                            <InfoRow label="Gender" value={profileData.gender} />
                        </>)}
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

// --- Edit Mode Component ---
function EditProfileView({ profileData, onSave, onCancel, isSaving, onFileChange, previewImage, onImageClick }) {
    const [formData, setFormData] = useState({ ...profileData });
    const showAcademic = profileData.role !== 'donor';

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
                            <ProfileImage 
                                imageUri={formData.profile_image_url}
                                previewImage={previewImage}
                                className="relative w-28 h-28 sm:w-32 sm:h-32 border-4 border-slate-50 shadow-md"
                                alt="Profile Preview"
                                onClick={onImageClick}
                                clickable={true}
                            />
                        </div>
                        <label className="mt-4 w-full cursor-pointer inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-semibold text-sm border border-slate-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Change Photo</span>
                            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                        </label>
                        <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF (max 5MB)</p>
                        {previewImage && (
                            <p className="text-xs text-orange-600 mt-1 font-medium">Click "Save Changes" to confirm</p>
                        )}
                    </div>
                </div>
                {/* Right Column: Form Fields */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-800">Personal Information</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <InputField 
                                label="Full Name" 
                                name="full_name" 
                                value={formData.full_name || ''} 
                                onChange={handleChange} 
                            />
                            {showAcademic && (<>
                                <InputField 
                                    label="Date of Birth" 
                                    name="dob" 
                                    type="date" 
                                    value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''} 
                                    onChange={handleChange} 
                                />
                                <InputField 
                                    label="Gender" 
                                    name="gender" 
                                    value={formData.gender || ''} 
                                    onChange={handleChange} 
                                    type="select"
                                    options={[
                                        { value: '', label: 'Select Gender' },
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' }
                                    ]}
                                />
                            </>)}
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-800">Contact Information</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <InputField 
                                label="Email" 
                                name="email" 
                                value={formData.email || ''} 
                                onChange={handleChange} 
                                type="email" 
                            />
                            <InputField 
                                label="Phone" 
                                name="phone" 
                                value={formData.phone || ''} 
                                onChange={handleChange} 
                                type="tel" 
                            />
                            <InputField 
                                label="Address" 
                                name="address" 
                                value={formData.address || ''} 
                                onChange={handleChange} 
                                multiline 
                            />
                        </div>
                    </div>
                    {showAcademic && (
                        <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80">
                            <div className="p-6 border-b border-slate-200">
                                <h3 className="text-xl font-semibold text-slate-800">Academic Details</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField 
                                    label="Class / Group" 
                                    name="class_group" 
                                    value={formData.class_group || ''} 
                                    onChange={handleChange} 
                                />
                                <InputField 
                                    label="Roll No." 
                                    name="roll_no" 
                                    value={formData.roll_no || ''} 
                                    onChange={handleChange} 
                                />
                                <InputField 
                                    label="Admission Date" 
                                    name="admission_date" 
                                    type="date" 
                                    value={formData.admission_date ? new Date(formData.admission_date).toISOString().split('T')[0] : ''} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            disabled={isSaving} 
                            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

// --- Helper Components ---
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

// InputField component with balanced sizing and gender select dropdown
function InputField({ label, name, value, onChange, type = 'text', multiline = false, placeholder = '', options = [] }) {
    const commonProps = {
        id: name,
        name: name,
        value: value,
        onChange: onChange,
        className: "block w-full text-sm rounded-lg border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors duration-200 px-3 py-2.5"
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
                {label}
            </label>
            {type === 'select' ? (
                <select {...commonProps}>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : multiline ? (
                <textarea {...commonProps} rows={3} placeholder={placeholder || label} />
            ) : (
                <input {...commonProps} type={type} placeholder={placeholder || label} />
            )}
        </div>
    );
}
