import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../apiConfig';
import { MdPayment, MdSettings, MdClose, MdEdit, MdSave, MdArrowBack } from 'react-icons/md';

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

// --- FULL Reusable Application Header ---
const AppHeader = ({ title, subtitle }) => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // Fetch Unread Notifications Count
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
                    setLocalUnreadCount(count);
                    setUnreadCount?.(count); 
                }
            } catch (error) {
                console.error("Failed to fetch notifications count", error);
            }
        }
        fetchUnreadNotifications();
        const id = setInterval(fetchUnreadNotifications, 60000);
        return () => clearInterval(id);
    }, [token, setUnreadCount]);

    // Fetch User Profile
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
                if (res.ok) {
                    setProfile(await res.json());
                } else {
                    setProfile({ full_name: user.full_name || "User", role: user.role || "user" });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                setProfile({ full_name: user.full_name || "User", role: user.role || "user" });
            }
        }
        fetchProfile();
    }, [user]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate("/");
        }
    };
    
    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin': return '/AdminDashboard';
            case 'teacher': return '/TeacherDashboard';
            case 'student': return '/StudentDashboard';
            default: return '/';
        }
    };

    return (
        <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">{title}</h1>
                        <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>
                    </div>

                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search..."
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
                                <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">
                                    {profile?.full_name || "User"}
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
                            <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
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
    );
};


// --- Main Screen Component ---
export default function AdminPaymentScreen() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'manageDetails'

  if (view === 'manageDetails') {
    return (
      <div className="min-h-screen bg-slate-100">
        <AppHeader title="Manage Payment Details" subtitle="Update QR code and bank account information" />
        <ManageDetailsView onBack={() => setView('dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader title="Payment Management" subtitle="Review submitted payment proofs" />
      <PaymentDashboard onManageDetails={() => setView('manageDetails')} />
    </div>
  );
}

// --- Dashboard View ---
function PaymentDashboard({ onManageDetails }) {
  const [proofs, setProofs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  // +++ IMPORTS FROM HOOKS +++
  const navigate = useNavigate();
  const { user } = useAuth();

  // +++ HELPER FUNCTION FOR NAVIGATION +++
  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
        case 'admin': return '/AdminDashboard';
        case 'teacher': return '/TeacherDashboard';
        case 'student': return '/StudentDashboard';
        default: return '/';
    }
  };

  const fetchProofs = useCallback(() => {
    setRefreshing(true);
    fetch(`${API_BASE_URL}/api/admin/payment-proofs`)
      .then((res) => res.json())
      .then((data) => setProofs(Array.isArray(data) ? data : []))
      .catch(() => alert('Could not fetch payment proofs.'))
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => { fetchProofs() }, [fetchProofs]);

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalVisible(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* +++ ADDED BACK TO DASHBOARD BUTTON +++ */}
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

      <div>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Submitted Proofs ({proofs.length})</h2>
              <p className="text-sm text-slate-600">Review and manage submitted payment proofs.</p>
            </div>
            <button
              onClick={onManageDetails}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <MdSettings className="mr-2" size={20} />
              Manage Details
            </button>
          </div>
        </div>
        <div>
          {refreshing ? (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !proofs.length ? (
            <div className="text-center py-16 bg-white/50 rounded-2xl border border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <MdPayment size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No payment proofs found</h3>
                <p className="text-slate-500">Submitted proofs will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {proofs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => handleImagePress(`${API_BASE_URL}${item.screenshot_url}`)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img src={`${API_BASE_URL}${item.screenshot_url}`} alt="Proof" className="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-200" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{item.donor_username}</h3>
                      <p className="text-green-600 font-bold text-lg">₹{item.amount || '0.00'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-slate-600 text-sm"><span className="font-semibold text-slate-700">Submitted:</span> {new Date(item.submission_date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={() => setIsModalVisible(false)}>
          <div className="relative max-w-4xl w-full">
            <button onClick={() => setIsModalVisible(false)} className="absolute -top-4 -right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-2 transition-all duration-300 z-10">
              <MdClose size={24} />
            </button>
            {selectedImage && <img src={selectedImage} alt="Enlarged proof" className="max-w-full max-h-[85vh] mx-auto rounded-xl shadow-2xl" />}
          </div>
        </div>
      )}
    </main>
  );
}

// --- Manage Details View ---
function ManageDetailsView({ onBack }) {
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState(null);
    const [formData, setFormData] = useState({});
    const [qrImage, setQrImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/admin/payment-details`)
            .then((res) => res.json())
            .then((data) => {
                setDetails(data);
                setFormData(data || {});
            })
            .catch(() => alert('Could not load details.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData() }, [fetchData]);
    
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setQrImage(file);
            setFormData(prev => ({ ...prev, qr_code_url: URL.createObjectURL(file) }));
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        const data = new FormData();
        data.append('accountHolderName', formData.account_holder_name || '');
        data.append('accountNumber', formData.account_number || '');
        data.append('ifscCode', formData.ifsc_code || '');
        data.append('cifCode', formData.cif_code || '');
        if (qrImage) data.append('qrCodeImage', qrImage);

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/payment-details`, { method: 'POST', body: data });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            alert(result.message);
            fetchData();
            setIsEditing(false);
            setQrImage(null);
        } catch (error) {
            alert('Update Failed: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData(details || {});
        setIsEditing(false);
        setQrImage(null);
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                    <MdArrowBack className="mr-2" />
                    Back to Dashboard
                </button>
            </div>
            
            <div>
                <div className="mb-6 flex justify-end items-center">
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-semibold transition-all">
                            <MdEdit className="mr-2" /> Edit
                        </button>
                    )}
                </div>

                <div className="space-y-8">
                    {/* QR Code Section */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Payment QR Code</h3>
                        {formData.qr_code_url ? (
                            <img 
                                src={formData.qr_code_url.startsWith('blob:') ? formData.qr_code_url : `${API_BASE_URL}${formData.qr_code_url}`} 
                                alt="Payment QR Code" 
                                className="w-64 h-64 object-contain mx-auto rounded-2xl shadow-lg border bg-white p-2" 
                            />
                        ) : (
                            <div className="w-64 h-64 mx-auto flex items-center justify-center bg-white rounded-2xl shadow-inner border">
                                <span className="text-slate-500 font-medium">No QR Code</span>
                            </div>
                        )}
                        {isEditing && (
                            <div className="mt-4">
                                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full max-w-xs mx-auto text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                        )}
                    </div>

                    {/* Bank Details Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Bank Account Details</h3>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                            <InputRow label="Account Holder Name" value={formData.account_holder_name} onChange={val => setFormData(p => ({ ...p, account_holder_name: val }))} disabled={!isEditing} />
                            <InputRow label="Bank Account Number" value={formData.account_number} onChange={val => setFormData(p => ({ ...p, account_number: val }))} disabled={!isEditing} />
                            <InputRow label="IFSC Code" value={formData.ifsc_code} onChange={val => setFormData(p => ({ ...p, ifsc_code: val }))} disabled={!isEditing} />
                            <InputRow label="CIF Code" value={formData.cif_code} onChange={val => setFormData(p => ({ ...p, cif_code: val }))} disabled={!isEditing} />
                        </div>
                    </div>
                    
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-slate-200">
                            <button onClick={handleUpdate} disabled={updating} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 rounded-xl text-white font-semibold shadow-md transition-all bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {updating ? <><div className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin mr-2"></div>Saving...</> : <><MdSave className="mr-2" />Save Changes</>}
                            </button>
                            <button onClick={handleCancelEdit} className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-800 font-semibold transition-all">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

// --- Helper Input Component ---
function InputRow({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block font-semibold text-slate-700 mb-2 text-sm">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full border-2 border-slate-200 rounded-xl p-3 transition-all duration-300 text-base font-medium ${
          disabled 
            ? 'bg-white/70 text-slate-600 cursor-not-allowed' 
            : 'bg-white shadow-inner focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        }`}
      />
    </div>
  );
}