import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { SERVER_URL } from '../../apiConfig.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCamera, faPhone, faCalendarPlus, faCalendarTimes, faBirthdayCake, faIdCard, faAddressCard, faUser, faMobileAlt, faFileAlt, faCalendarCheck, faMapMarkerAlt, faPencilAlt, faTrash, faUniversity, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { MdArrowBack } from 'react-icons/md';
import apiClient from '../../api/client';

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

// --- HELPER FUNCTIONS ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

// --- MAIN SCREEN COMPONENT ---
const AlumniScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  
  // --- State for Alumni ---
  const [query, setQuery] = useState("");
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const initialFormState = {};
  const [formData, setFormData] = useState(initialFormState);
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  
  // --- Hooks for Header ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
        if (!token) { setUnreadCount?.(0); return; }
        try {
            const res = await apiClient.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
            const data = res.data;
            const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
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

  useEffect(() => {
      async function fetchProfile() {
          if (!user?.id) { setLoadingProfile(false); return; }
          setLoadingProfile(true);
          try {
              const res = await apiClient.get(`/api/profiles/${user.id}`);
              setProfile(res.data);
          } catch {
                setProfile({
                    id: user.id,
                    username: user.username || "Unknown",
                    full_name: user.full_name || "User",
                    role: user.role || "user",
                });
          } finally {
              setLoadingProfile(false);
          }
      }
      fetchProfile();
  }, [user]);

  // --- Logic Functions ---
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/alumni');
      setAlumniData(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch alumni data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleCardPress = (id) => {
    setExpandedCardId(prevId => (prevId === id ? null : id));
  };

  const handleOpenModal = (item = null) => {
    setSelectedImage(null);
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
      setFormData(item);
    } else {
      setIsEditing(false);
      setCurrentItem(null);
      setFormData(initialFormState);
    }
    setModalVisible(true);
  };

  const handleChoosePhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          uri: e.target.result,
          type: file.type,
          name: file.name,
          file: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.admission_no || !formData.alumni_name) {
      return alert('Validation Error: Admission Number and Name are required.');
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    if (selectedImage?.file) {
      data.append('profile_pic', selectedImage.file);
    }
    
    try {
      let response;
      if (isEditing && currentItem) {
        response = await apiClient.put(`/alumni/${currentItem.id}`, data, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
      } else {
        response = await apiClient.post('/alumni', data, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
      }
      
      alert('Success: ' + (response.data.message || 'Record saved successfully.'));
      setModalVisible(false);
      fetchData();
    } catch (error) {
      alert('Save Error: ' + (error.response?.data?.message || 'An error occurred during save.'));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      apiClient.delete(`/alumni/${id}`)
        .then(response => {
          alert("Success: " + (response.data.message || 'Record deleted.'));
          fetchData();
        })
        .catch(error => {
          alert('Delete Error: ' + (error.response?.data?.message || 'Failed to delete record.'));
        });
    }
  };

  const handleDateChange = (target, value) => {
    setFormData(prev => ({ ...prev, [target]: value }));
  };
  
  // --- Memoized Grouping and Filtering Logic ---
  const groupedAndFilteredAlumni = useMemo(() => {
    const filtered = alumniData.filter(item =>
      item.alumni_name.toLowerCase().includes(query.toLowerCase()) ||
      item.admission_no.toLowerCase().includes(query.toLowerCase()) ||
      (item.present_status && item.present_status.toLowerCase().includes(query.toLowerCase()))
    );

    const grouped = filtered.reduce((acc, alumni) => {
      const year = alumni.school_outgoing_date ? new Date(alumni.school_outgoing_date).getFullYear() : 'Uncategorized';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(alumni);
      return acc;
    }, {});

    // Sort years in descending order
    return Object.keys(grouped)
      .sort((a, b) => (b === 'Uncategorized' ? -1 : a === 'Uncategorized' ? 1 : b - a))
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }, [alumniData, query]);

  const renderContent = () => {
    if (loading || loadingProfile) {
        return (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const years = Object.keys(groupedAndFilteredAlumni);

    return (
        <div className="space-y-6 pb-24">
          {years.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200">
              <FontAwesomeIcon icon={faUniversity} className="text-6xl text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Alumni Found</h3>
              <p className="text-slate-500">
                {alumniData.length > 0 ? "No records match your search." : "Tap the '+' button to add a record."}
              </p>
            </div>
          ) : (
            years.map((year) => (
              <AlumniYearGroup
                key={year}
                year={year}
                alumniList={groupedAndFilteredAlumni[year]}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                expandedCardId={expandedCardId}
                onCardPress={handleCardPress}
              />
            ))
          )}
        </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Alumni Network</h1>
                        <p className="text-xs sm:text-sm text-slate-600">A growing directory of our graduates</p>
                    </div>

                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
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

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
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
            
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name, admission no, status..."
                        className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select className="w-full sm:w-auto rounded-md border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Filter by Status</option>
                    </select>
                     <select className="w-full sm:w-auto rounded-md border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Sort by Name</option>
                    </select>
                </div>
            </div>

            {renderContent()}
      </main>

      <button
        onClick={() => handleOpenModal()}
        className="fixed right-6 bottom-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 z-40"
      >
        <FontAwesomeIcon icon={faPlus} className="text-white text-xl" />
      </button>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
                {isEditing ? 'Edit Alumni Record' : 'Add New Alumni'}
              </h2>
              <div className="flex flex-col items-center mb-6">
                <img src={selectedImage?.uri || (formData.profile_pic_url ? `${SERVER_URL}${formData.profile_pic_url}` : '/default-avatar.png')} alt="Profile" className="w-32 h-32 rounded-full bg-slate-200 mb-3 border-4 border-blue-500 object-cover"/>
                <label className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg cursor-pointer transition-colors duration-200">
                  <FontAwesomeIcon icon={faCamera} className="mr-2" />
                  Choose Photo
                  <input type="file" accept="image/*" onChange={handleChoosePhoto} className="hidden" />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Admission No*</label><input type="text" value={formData.admission_no || ''} onChange={(e) => setFormData(p => ({...p, admission_no: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Alumni Name*</label><input type="text" value={formData.alumni_name || ''} onChange={(e) => setFormData(p => ({...p, alumni_name: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Date of Birth</label><input type="date" value={formData.dob || ''} onChange={(e) => handleDateChange('dob', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Pen No</label><input type="text" value={formData.pen_no || ''} onChange={(e) => setFormData(p => ({...p, pen_no: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Phone No</label><input type="tel" value={formData.phone_no || ''} onChange={(e) => setFormData(p => ({...p, phone_no: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Aadhar No</label><input type="text" value={formData.aadhar_no || ''} onChange={(e) => setFormData(p => ({...p, aadhar_no: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Parent Name</label><input type="text" value={formData.parent_name || ''} onChange={(e) => setFormData(p => ({...p, parent_name: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">Parent No</label><input type="tel" value={formData.parent_phone || ''} onChange={(e) => setFormData(p => ({...p, parent_phone: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-slate-600 mb-2">Address</label><textarea value={formData.address || ''} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} rows="3" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">School Joined Date</label><input type="date" value={formData.school_joined_date || ''} onChange={(e) => handleDateChange('school_joined_date', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">School Joined Grade</label><input type="text" value={formData.school_joined_grade || ''} onChange={(e) => setFormData(p => ({...p, school_joined_grade: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">School Outgoing Date</label><input type="date" value={formData.school_outgoing_date || ''} onChange={(e) => handleDateChange('school_outgoing_date', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">School Outgoing Grade</label><input type="text" value={formData.school_outgoing_grade || ''} onChange={(e) => setFormData(p => ({...p, school_outgoing_grade: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">TC Issued Date</label><input type="date" value={formData.tc_issued_date || ''} onChange={(e) => handleDateChange('tc_issued_date', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-slate-600 mb-2">TC Number</label><input type="text" value={formData.tc_number || ''} onChange={(e) => setFormData(p => ({...p, tc_number: e.target.value}))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-slate-600 mb-2">Present Status</label><input type="text" value={formData.present_status || ''} onChange={(e) => setFormData(p => ({...p, present_status: e.target.value}))} placeholder="e.g., Software engineer, Doctor" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="flex justify-between mt-8 gap-4">
                <button onClick={() => setModalVisible(false)} className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors duration-200">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Collapsible Year Group Component ---
const AlumniYearGroup = ({ year, alumniList, onEdit, onDelete, expandedCardId, onCardPress }) => {
    const [isGroupExpanded, setIsGroupExpanded] = useState(true);

    return (
        <div className="bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden">
            <button
                onClick={() => setIsGroupExpanded(!isGroupExpanded)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <h2 className="text-xl font-bold text-slate-700">
                    {year === 'Uncategorized' ? 'Uncategorized' : `Class of ${year}`}
                    <span className="ml-3 text-base font-medium text-slate-500">({alumniList.length} members)</span>
                </h2>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-slate-500 transition-transform duration-300 ${isGroupExpanded ? 'rotate-180' : ''}`}
                />
            </button>
            {isGroupExpanded && (
                <div className="p-4 border-t border-slate-200 space-y-3">
                    {alumniList.map(item => (
                        <AlumniCardItem
                            key={item.id}
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isExpanded={expandedCardId === item.id}
                            onPress={() => onCardPress(item.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// --- CARD & INFO ROW COMPONENTS ---
const AlumniCardItem = ({ item, onEdit, onDelete, isExpanded, onPress }) => (
  <div className="bg-white rounded-lg border border-slate-200/80 transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
    <div className="flex items-start p-3">
        <img
            src={item.profile_pic_url ? `${SERVER_URL}${item.profile_pic_url}` : '/default-avatar.png'}
            alt="Profile"
            className="w-12 h-12 rounded-full bg-slate-200 mr-4 object-cover"
        />
        <div className="flex-1">
            <h3 className="font-bold text-slate-800">{item.alumni_name}</h3>
            <p className="text-xs text-slate-500">Adm No: {item.admission_no}</p>
            {item.present_status && (
                <div className="mt-1 inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {item.present_status}
                </div>
            )}
        </div>
        <div className="flex items-center space-x-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="w-8 h-8 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded-full transition-colors">
                <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full transition-colors">
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    </div>
    
    {isExpanded && (
      <div className="px-3 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-3">
            <InfoRow icon={faPhone} label="Phone" value={item.phone_no || 'N/A'} />
            <InfoRow icon={faCalendarPlus} label="Joined" value={`${formatDate(item.school_joined_date)} (${item.school_joined_grade || 'N/A'})`} />
            <InfoRow icon={faCalendarTimes} label="Left" value={`${formatDate(item.school_outgoing_date)} (${item.school_outgoing_grade || 'N/A'})`} />
            <InfoRow icon={faBirthdayCake} label="D.O.B" value={formatDate(item.dob)} />
            <InfoRow icon={faUser} label="Parent" value={item.parent_name || 'N/A'} />
            <InfoRow icon={faMobileAlt} label="Parent No" value={item.parent_phone || 'N/A'} />
            <InfoRow icon={faMapMarkerAlt} label="Address" value={item.address || 'N/A'} isMultiLine={true} className="sm:col-span-2" />
        </div>
      </div>
    )}

    <div
        onClick={onPress}
        className="bg-slate-50 hover:bg-slate-100 cursor-pointer text-center py-1.5 border-t border-slate-200 rounded-b-lg"
    >
        <span className="text-xs font-semibold text-slate-600 flex items-center justify-center">
            {isExpanded ? 'Show Less' : 'Show More'}
            <FontAwesomeIcon icon={faChevronDown} className={`ml-2 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </span>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value, isMultiLine = false, className = '' }) => (
  <div className={`flex ${isMultiLine ? 'items-start' : 'items-center'} ${className}`}>
    <FontAwesomeIcon icon={icon} className={`text-slate-400 w-4 text-center mr-2.5 ${isMultiLine ? 'mt-1' : ''}`} />
    <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-medium text-slate-700 ${isMultiLine ? 'whitespace-pre-wrap' : 'truncate'}`}>
            {value}
        </p>
    </div>
  </div>
);

export default AlumniScreen;