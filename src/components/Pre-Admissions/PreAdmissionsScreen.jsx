import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { SERVER_URL } from '../../apiConfig';
import apiClient from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCamera, faPlus, faPencilAlt, faTrash, faIdCard, faCalendar, faTimes,
    faBirthdayCake, faPhone, faUser, faMobileAlt, faUniversity, faGraduationCap, 
    faMapMarkerAlt, faInbox, faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { MdArrowBack } from 'react-icons/md';


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




// --- HELPER FUNCTIONS ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


const StatusPill = ({ status }) => {
  const statusStyle = {
    Pending: 'bg-orange-100 text-orange-600',
    Approved: 'bg-blue-100 text-blue-600',
    Rejected: 'bg-red-100 text-red-600',
  };
  
  return (
    <div className={`px-3 py-1 rounded-xl text-xs font-bold ${statusStyle[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </div>
  );
};


// --- MAIN SCREEN COMPONENT ---
const PreAdmissionsScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();


  // --- State ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);


  // --- Data Fetching and Side Effects ---
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


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/preadmissions');
      setData(response.data);
      if (selectedItem) {
          const updatedItem = response.data.find(item => item.id === selectedItem.id);
          setSelectedItem(updatedItem || null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // --- Event Handlers ---
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
  
  const handleOpenModal = (item = null) => {
    setSelectedImage(null);
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
      setFormData(item);
    } else {
      setIsEditing(false);
      setCurrentItem(null);
      setFormData({ status: 'Pending' });
    }
    setModalVisible(true);
  };


  const handleChoosePhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({ uri: e.target.result, type: file.type, name: file.name, file: file });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSave = async () => {
    if (!formData.admission_no || !formData.student_name || !formData.joining_grade) {
      return alert('Admission No, Student Name, and Joining Grade are required.');
    }
    const body = new FormData();
    Object.keys(formData).forEach(key => body.append(key, formData[key] ?? ''));
    if (selectedImage?.file) body.append('photo', selectedImage.file);


    try {
      const response = isEditing
        ? await apiClient.put(`/preadmissions/${currentItem.id}`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await apiClient.post('/preadmissions', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert(response.data.message);
      setModalVisible(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred during save.');
    }
  };


  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      apiClient.delete(`/preadmissions/${id}`)
        .then(response => {
          alert(response.data.message);
          setSelectedItem(null);
          fetchData();
        })
        .catch(error => {
          alert(error.response?.data?.message || 'Failed to delete record.');
        });
    }
  };


  const filteredData = data.filter(item =>
    item.student_name.toLowerCase().includes(query.toLowerCase()) ||
    item.admission_no.toLowerCase().includes(query.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-slate-50 ">
         <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Pre-Admissions</h1>
              <p className="text-xs sm:text-sm text-slate-600">Manage admission applications</p>
            </div>
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
              </div>
              <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />
              <div className="flex items-center gap-2 sm:gap-3">
                   <ProfileAvatar />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                  <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
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
        <div className="mb-6 flex justify-between items-center">
          <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors" title="Back to Dashboard">
            <MdArrowBack /><span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="md:grid md:grid-cols-12 md:gap-8">
          <div className={`md:col-span-5 lg:col-span-4 ${selectedItem ? 'hidden md:block' : 'block'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Applications ({filteredData.length})</h2>
              <button onClick={() => handleOpenModal()} className="md:hidden p-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"><FontAwesomeIcon icon={faPlus} /></button>
            </div>
            <div className="relative mb-4">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applications..." className="w-full rounded-md border-slate-300 pl-4 pr-10 py-2" />
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <div className="max-h-[65vh] overflow-y-auto">
                {(loading && !data.length) ? (<div className="p-10 text-center text-slate-500">Loading...</div>)
                : filteredData.length > 0 ? (filteredData.map(item => (<AdmissionListItem key={item.id} item={item} isSelected={selectedItem?.id === item.id} onSelect={() => setSelectedItem(item)} />)))
                : (<div className="p-10 text-center text-slate-500">No applications found.</div>)
                }
              </div>
            </div>
          </div>


          <div className={`md:col-span-7 lg:col-span-8 ${selectedItem ? 'block' : 'hidden md:block'}`}>
            <AdmissionDetailView item={selectedItem} onEdit={handleOpenModal} onDelete={handleDelete} onClearSelection={() => setSelectedItem(null)} onAddNew={() => handleOpenModal()} />
          </div>
        </div>
      </main>


      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Application' : 'New Application'}</h2>
                <button onClick={() => setModalVisible(false)} className="text-gray-500 hover:text-gray-700 text-2xl" title="Close"><FontAwesomeIcon icon={faTimes} /></button>
              </div>
              <div className="flex flex-col items-center mb-6">
                <img src={selectedImage?.uri || (formData.photo_url ? `${SERVER_URL}${formData.photo_url}` : '/default-avatar.png')} alt="Profile" className="w-32 h-32 rounded-full bg-gray-200 border-4 border-blue-500 mb-3 object-cover" />
                <label className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"><FontAwesomeIcon icon={faCamera} className="mr-2" />Choose Photo<input type="file" accept="image/*" onChange={handleChoosePhoto} className="hidden" /></label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-600 mb-2">Admission No*</label><input type="text" value={formData.admission_no || ''} onChange={(e) => setFormData(p => ({ ...p, admission_no: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter admission number" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-600 mb-2">Student Name*</label><input type="text" value={formData.student_name || ''} onChange={(e) => setFormData(p => ({ ...p, student_name: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter student name" /></div>
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Date of Birth</label><input type="date" value={formData.dob || ''} onChange={(e) => setFormData(p => ({ ...p, dob: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Phone No</label><input type="tel" value={formData.phone_no || ''} onChange={(e) => setFormData(p => ({ ...p, phone_no: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter phone number" /></div>
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Parent Name</label><input type="text" value={formData.parent_name || ''} onChange={(e) => setFormData(p => ({ ...p, parent_name: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter parent name" /></div>
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Parent Phone</label><input type="tel" value={formData.parent_phone || ''} onChange={(e) => setFormData(p => ({ ...p, parent_phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter parent phone" /></div>
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Joining Grade*</label><input type="text" value={formData.joining_grade || ''} onChange={(e) => setFormData(p => ({ ...p, joining_grade: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter joining grade" /></div>
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Previous Institute</label><input type="text" value={formData.previous_institute || ''} onChange={(e) => setFormData(p => ({ ...p, previous_institute: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter previous institute" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-600 mb-2">Address</label><textarea value={formData.address || ''} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Enter address" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-600 mb-2">Application Status</label>
                  <div className="grid grid-cols-3 gap-2">{['Pending', 'Approved', 'Rejected'].map(status => (<button key={status} onClick={() => setFormData(p => ({ ...p, status }))} className={`py-3 px-4 rounded-lg border font-semibold transition-colors ${formData.status === status ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}>{status}</button>))}</div>
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <button onClick={() => setModalVisible(false)} className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Sub-Components for Master-Detail View ---


const AdmissionListItem = ({ item, isSelected, onSelect }) => (
  <button onClick={onSelect} className={`w-full text-left flex items-center p-3 border-b border-slate-200 transition-colors ${isSelected ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
    <img src={item.photo_url ? `${SERVER_URL}${item.photo_url}` : '/default-avatar.png'} alt="Student" className="w-10 h-10 rounded-full bg-gray-200 mr-3 object-cover" />
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 truncate">{item.student_name}</h4>
      <p className="text-sm text-gray-600">Adm No: {item.admission_no}</p>
    </div>
    <StatusPill status={item.status} />
  </button>
);


const AdmissionDetailView = ({ item, onEdit, onDelete, onClearSelection, onAddNew }) => {
  if (!item) {
    return (
      <div className="bg-slate-50 h-full rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center p-8">
        <FontAwesomeIcon icon={faInbox} className="text-6xl text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600">Select an Application</h3>
        <p className="text-slate-500 mt-1">Choose an application from the list to see its details.</p>
        <button onClick={onAddNew} className="mt-6 inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
            <FontAwesomeIcon icon={faPlus} />Add New Application
        </button>
      </div>
    );
  }


  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 h-full">
      <div className="p-4 border-b border-slate-200 flex items-center">
        <button onClick={onClearSelection} className="md:hidden mr-4 text-slate-600"><FontAwesomeIcon icon={faChevronLeft} size="lg"/></button>
        <img src={item.photo_url ? `${SERVER_URL}${item.photo_url}` : '/default-avatar.png'} alt="Student" className="w-14 h-14 rounded-full bg-gray-200 mr-4 object-cover" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800">{item.student_name}</h3>
          <p className="text-sm text-gray-600">Joining Grade: {item.joining_grade}</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => onEdit(item)} className="w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors" title="Edit"><FontAwesomeIcon icon={faPencilAlt} /></button>
            <button onClick={() => onDelete(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors" title="Delete"><FontAwesomeIcon icon={faTrash} /></button>
        </div>
      </div>
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <InfoRow icon={faIdCard} label="Admission No" value={item.admission_no} />
            <InfoRow icon={faCalendar} label="Submitted" value={formatDate(item.submission_date)} />
            <InfoRow icon={faBirthdayCake} label="D.O.B" value={formatDate(item.dob)} />
            <InfoRow icon={faPhone} label="Student Phone" value={item.phone_no || 'N/A'} />
            <InfoRow icon={faUser} label="Parent" value={item.parent_name || 'N/A'} />
            <InfoRow icon={faMobileAlt} label="Parent Phone" value={item.parent_phone || 'N/A'} />
            <InfoRow icon={faUniversity} label="Prev. Institute" value={item.previous_institute || 'N/A'} />
            <InfoRow icon={faGraduationCap} label="Prev. Grade" value={item.previous_grade || 'N/A'} />
            <div className="sm:col-span-2">
                <InfoRow icon={faMapMarkerAlt} label="Address" value={item.address || 'N/A'} isMultiLine />
            </div>
        </div>
      </div>
    </div>
  );
};


const InfoRow = ({ icon, label, value, isMultiLine = false }) => (
    <div className={`flex ${isMultiLine ? 'items-start' : 'items-center'}`}>
      <FontAwesomeIcon icon={icon} className="text-slate-500 w-5 text-center mt-1 mr-4" />
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
        <p className={`text-slate-800 font-medium ${isMultiLine ? 'whitespace-pre-wrap' : 'truncate'}`}>{value}</p>
      </div>
    </div>
);


export default PreAdmissionsScreen;
