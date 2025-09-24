import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_BASE_URL } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.tsx';
import { MdArrowBack, MdCheckCircle, MdCancel, MdPauseCircle, MdImage, MdReceipt, MdClose, MdHourglassEmpty } from 'react-icons/md';
import { FaEye, FaTrash } from 'react-icons/fa';

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

const AdminAdDashboardScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Ad Management ---
  const [activeTab, setActiveTab] = useState('review');
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentAd, setCurrentAd] = useState(null); // For master-detail view

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
          if (!user?.id) { setLoadingProfile(false); return; }
          setLoadingProfile(true);
          try {
              const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
              if (res.ok) { setProfile(await res.json()); }
              else {
                  setProfile({
                      id: user.id, username: user.username || "Unknown",
                      full_name: user.full_name || "User", role: user.role || "user",
                  });
              }
          } catch { setProfile(null); }
          finally { setLoadingProfile(false); }
      }
      fetchProfile();
  }, [user]);

  // --- Helper Functions ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) { logout(); navigate("/"); }
  };

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    if (user.role === 'student') return '/StudentDashboard';
    return '/';
  };

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/api/admin/ads');
      setAds(data);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Could not fetch ads.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const handleUpdateStatus = (adId, status) => {
    const actionVerb = status === 'stopped' ? 'stop' : status;
    if (window.confirm(`Are you sure you want to ${actionVerb} this ad?`)) {
      const updateStatus = async () => {
        try {
          await apiClient.put(`/api/admin/ads/${adId}/status`, { status });
          alert(`Success: Ad has been ${status}.`);
          fetchAds();
        } catch (error) {
          alert('Error: ' + (error.response?.data?.message || `Failed to ${actionVerb} ad.`));
        }
      };
      updateStatus();
    }
  };
  
  const handleDeleteAd = (adId) => {
    if (window.confirm(`Are you sure you want to permanently delete this ad? This action cannot be undone.`)) {
      const deleteAd = async () => {
        try {
          await apiClient.delete(`/api/admin/ads/${adId}`);
          alert('Success: Ad has been deleted.');
          fetchAds();
        } catch (error) {
          alert('Error: ' + (error.response?.data?.message || `Failed to delete ad.`));
        }
      };
      deleteAd();
    }
  };

  const filteredAds = useMemo(() => {
    const lowercasedQuery = query.toLowerCase();
    const baseFilter = (ad) => (
        ad.userName.toLowerCase().includes(lowercasedQuery) ||
        ad.ad_type.toLowerCase().includes(lowercasedQuery)
    );

    switch (activeTab) {
      case 'review':
        return ads.filter(ad => ad.status === 'pending' && baseFilter(ad));
      case 'current':
        return ads.filter(ad => ad.status === 'approved' && baseFilter(ad));
      case 'history':
        return ads.filter(ad => (ad.status === 'rejected' || ad.status === 'stopped') && baseFilter(ad));
      default:
        return [];
    }
  }, [ads, activeTab, query]);

  // Set the first ad as current when the filtered list changes
  useEffect(() => {
    setCurrentAd(filteredAds[0] || null);
  }, [filteredAds]);

  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { icon: MdHourglassEmpty, color: "text-yellow-600", bg: "bg-yellow-100" },
      approved: { icon: MdCheckCircle, color: "text-green-600", bg: "bg-green-100" },
      rejected: { icon: MdCancel, color: "text-red-600", bg: "bg-red-100" },
      stopped: { icon: MdPauseCircle, color: "text-slate-600", bg: "bg-slate-100" }
    };
    const config = configs[status] || configs.stopped;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
        <Icon/>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Ad Management</h1>
                        <p className="text-xs sm:text-sm text-slate-600">Review, manage and track advertisement submissions</p>
                    </div>
                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <input
                                id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name or type..."
                                className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                            <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home">
                                <HomeIcon />
                                <span className="hidden md:inline">Home</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar">
                                <CalendarIcon />
                                <span className="hidden md:inline">Calendar</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile">
                                <UserIcon />
                                <span className="hidden md:inline">Profile</span>
                            </button>
                        </div>
                        <div className="h-6 w-px bg-slate-200 mx-1" aria-hidden="true" />
                        <div className="flex items-center gap-3">
                            <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm font-medium text-slate-900">{profile?.full_name || profile?.username || "User"}</span>
                                <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                            </div>
                            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                Logout
                            </button>
                            <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 focus:outline-none" aria-label="Notifications" title="Notifications" type="button">
                                <BellIcon />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">{unreadCount > 9 ? "9+" : unreadCount}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
                <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                    <MdArrowBack /> Back to Dashboard
                </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl p-2 mb-6 max-w-lg mx-auto">
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('review')} className={`flex-1 py-2 px-4 text-center rounded-lg transition-all text-sm sm:text-base font-semibold ${activeTab === 'review' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>For Review</button>
                    <button onClick={() => setActiveTab('current')} className={`flex-1 py-2 px-4 text-center rounded-lg transition-all text-sm sm:text-base font-semibold ${activeTab === 'current' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>Current Ads</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 px-4 text-center rounded-lg transition-all text-sm sm:text-base font-semibold ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>History</button>
                </div>
            </div>

            {/* Content */}
            {isLoading || loadingProfile ? (
                <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : filteredAds.length === 0 ? (
                <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200/80 p-12 text-center">
                    <h3 className="text-lg font-semibold text-slate-700">No Ads Found</h3>
                    <p className="text-slate-500 mt-1">There are no ads in the "{activeTab}" section.</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column: Master List */}
                    <div className="md:w-1/3 lg:w-1/4">
                        <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200/80 overflow-hidden">
                            <div className="p-4 bg-white border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">{filteredAds.length} Ad(s)</h3>
                            </div>
                            <ul className="divide-y divide-slate-200 max-h-[60vh] overflow-y-auto">
                                {filteredAds.map(ad => (
                                    <li key={ad.id}>
                                        <button onClick={() => setCurrentAd(ad)} className={`w-full text-left p-4 transition-colors ${currentAd?.id === ad.id ? 'bg-indigo-100' : 'hover:bg-slate-100'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className={`font-semibold truncate ${currentAd?.id === ad.id ? 'text-indigo-700' : 'text-slate-800'}`}>{ad.userName}</p>
                                                <StatusBadge status={ad.status}/>
                                            </div>
                                            <p className="text-sm text-slate-500">{ad.ad_type}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Detail View */}
                    <div className="md:w-2/3 lg:w-3/4">
                        {currentAd ? (
                            <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200/80 p-6 space-y-6">
                                <div>
                                    <div className="flex justify-between items-center">
                                      <h2 className="text-2xl font-bold text-slate-800">{currentAd.userName}</h2>
                                      <StatusBadge status={currentAd.status}/>
                                    </div>
                                    <p className="text-slate-500">{currentAd.ad_type}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-700 mb-2">Ad Content</h4>
                                        <img src={`${API_BASE_URL}${currentAd.ad_content_image_url}`} alt="Ad content" onClick={() => setSelectedImage(`${API_BASE_URL}${currentAd.ad_content_image_url}`)} className="w-full h-48 object-cover rounded-lg bg-white border border-slate-200 cursor-pointer hover:shadow-lg transition"/>
                                    </div>
                                    {currentAd.payment_screenshot_url && (
                                        <div>
                                            <h4 className="font-semibold text-slate-700 mb-2">Payment Proof</h4>
                                            <img src={`${API_BASE_URL}${currentAd.payment_screenshot_url}`} alt="Payment proof" onClick={() => setSelectedImage(`${API_BASE_URL}${currentAd.payment_screenshot_url}`)} className="w-full h-48 object-cover rounded-lg bg-white border border-slate-200 cursor-pointer hover:shadow-lg transition"/>
                                        </div>
                                    )}
                                </div>

                                {currentAd.payment_text && (
                                    <div>
                                      <h4 className="font-semibold text-slate-700 mb-2">Payment Note</h4>
                                      <p className="text-slate-600 text-sm p-3 bg-white rounded-lg border border-slate-200">{currentAd.payment_text}</p>
                                    </div>
                                )}

                                <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
                                    {currentAd.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleUpdateStatus(currentAd.id, 'rejected')} className="px-4 py-2 font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition">Reject</button>
                                            <button onClick={() => handleUpdateStatus(currentAd.id, 'approved')} className="px-4 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition">Approve</button>
                                        </>
                                    )}
                                    {currentAd.status === 'approved' && (
                                        <button onClick={() => handleUpdateStatus(currentAd.id, 'stopped')} className="px-4 py-2 font-semibold text-yellow-800 bg-yellow-200 hover:bg-yellow-300 rounded-lg transition">Stop Ad</button>
                                    )}
                                    {(currentAd.status === 'rejected' || currentAd.status === 'stopped') && (
                                        <button onClick={() => handleDeleteAd(currentAd.id)} className="px-4 py-2 font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition flex items-center gap-2"><FaTrash /> Delete</button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200/80 p-12 text-center h-full flex flex-col justify-center">
                                <h3 className="text-lg font-semibold text-slate-700">Select an Ad</h3>
                                <p className="text-slate-500 mt-1">Choose an ad from the list to see its details.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>

        {/* Modal for viewing images */}
        {selectedImage && (
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in"
                onClick={() => setSelectedImage(null)}
            >
                <div 
                  className="max-w-4xl max-h-[90vh] w-auto h-auto flex flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                    <img 
                        src={selectedImage} 
                        alt="Full size view"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="mt-4 bg-white text-slate-800 font-bold py-2 px-6 rounded-lg transition hover:bg-slate-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}

        <style jsx>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default AdminAdDashboardScreen;