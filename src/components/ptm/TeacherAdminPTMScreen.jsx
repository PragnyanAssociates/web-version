import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
// ✅ FIXED: Updated imports
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext.tsx";
import { 
    MdArrowBack, 
    MdEdit, 
    MdDelete, 
    MdAdd, 
    MdPersonOutline,
    MdOutlineSchool,
    MdOutlineBook,
    MdLink
} from 'react-icons/md';


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




function PTMIcon() {
  return (
    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}



const TeacherAdminPTMScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();
  
  // States are unchanged
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const initialFormState = { meeting_datetime: '', teacher_id: '', class_group: '', subject_focus: '', status: 'Scheduled', notes: '', meeting_link: '' };
  const [formData, setFormData] = useState(initialFormState);
  
  // ✅ FIXED: Updated fetchUnreadNotifications function
  useEffect(() => {
    async function fetchUnreadNotifications() {
        if (!token) { setUnreadCount?.(0); return; }
        try {
            const response = await apiClient.get('/notifications');
            const data = response.data;
            const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
            setLocalUnreadCount(count);
            setUnreadCount?.(count);
        } catch { setUnreadCount?.(0); }
    }
    fetchUnreadNotifications();
    const id = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(id);
  }, [token, setUnreadCount]);


  // ✅ FIXED: Updated fetchProfile function
  useEffect(() => {
      async function fetchProfile() {
          if (!user?.id) { setLoadingProfile(false); return; }
          setLoadingProfile(true);
          try {
              const response = await apiClient.get(`/profiles/${user.id}`);
              setProfile(response.data);
          } catch {
              setProfile({ 
                  id: user.id, 
                  username: user.username || "Unknown", 
                  full_name: user.full_name || "User", 
                  role: user.role || "user" 
              });
          } finally { setLoadingProfile(false); }
      }
      fetchProfile();
  }, [user]);
  
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) { logout(); navigate("/"); }
  };
  
  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    return '/';
  };


  // ✅ FIXED: Updated fetchAllData function
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [meetingsRes, teachersRes, classesRes] = await Promise.all([
            apiClient.get('/ptm'),
            apiClient.get('/ptm/teachers'),
            apiClient.get('/ptm/classes')
        ]);
        
        const meetingsData = meetingsRes.data;
        meetingsData.sort((a, b) => new Date(b.meeting_datetime) - new Date(a.meeting_datetime));

        setMeetings(meetingsData);
        setTeachers(teachersRes.data);
        setClasses(classesRes.data);
    } catch (error) {
        alert('Error: ' + (error.response?.data?.message || 'Failed to load data.'));
    } finally { setIsLoading(false); }
  }, []);


  useEffect(() => { fetchAllData(); }, [fetchAllData]);
  
  const handleDateTimeChange = (e) => {
    const selectedDateTime = e.target.value;
    if (selectedDateTime) {
      const dateObj = new Date(selectedDateTime);
      const formattedDate = `${dateObj.getFullYear()}-${('0' + (dateObj.getMonth() + 1)).slice(-2)}-${('0' + dateObj.getDate()).slice(-2)} ${('0' + dateObj.getHours()).slice(-2)}:${('0' + dateObj.getMinutes()).slice(-2)}`;
      setFormData({ ...formData, meeting_datetime: formattedDate });
    }
  };
  
  const handleOpenModal = (meeting = null) => {
    setEditingMeeting(meeting);
    if (meeting) {
      setFormData({
        meeting_datetime: new Date(meeting.meeting_datetime).toISOString().substring(0, 16).replace('T', ' '),
        teacher_id: meeting.teacher_id.toString(),
        class_group: meeting.class_group,
        subject_focus: meeting.subject_focus,
        status: meeting.status,
        notes: meeting.notes || '',
        meeting_link: meeting.meeting_link || '',
      });
    } else { setFormData(initialFormState); }
    setIsModalOpen(true);
  };
  
  // ✅ FIXED: Updated handleSave function
  const handleSave = async () => {
    if (!user) return alert("Error: Authentication session not found.");
    const body = editingMeeting 
        ? { status: formData.status, notes: formData.notes, meeting_link: formData.meeting_link } 
        : { ...formData, created_by: user.id };
    
    try {
        if (editingMeeting) {
            await apiClient.put(`/ptm/${editingMeeting.id}`, body);
        } else {
            await apiClient.post('/ptm', body);
        }
        await fetchAllData();
        setIsModalOpen(false);
    } catch (error) {
        alert('Save Error: ' + (error.response?.data?.message || 'Failed to save meeting.'));
    }
  };


  // ✅ FIXED: Updated handleDelete function
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
        const deleteOperation = async () => {
            try {
                await apiClient.delete(`/ptm/${id}`);
                await fetchAllData();
            } catch (error) {
                alert('Error: ' + (error.response?.data?.message || 'Failed to delete.'));
            }
        };
        deleteOperation();
    }
  };
  
  const filteredMeetings = useMemo(() => {
    const teacherMap = new Map(teachers.map(t => [t.id, t.full_name]));
    if (!query) return meetings;
    return meetings.filter(m => {
        const teacherName = teacherMap.get(m.teacher_id) || '';
        return (
            teacherName.toLowerCase().includes(query.toLowerCase()) ||
            m.class_group.toLowerCase().includes(query.toLowerCase()) ||
            (m.subject_focus && m.subject_focus.toLowerCase().includes(query.toLowerCase()))
        );
    });
  }, [query, meetings, teachers]);


  const renderContent = () => {
    if (isLoading || loadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium mt-4">Loading meetings...</p>
            </div>
        );
    }


    return (
        <>
            <div className="flex justify-end mb-6">
                <button 
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-300 shadow hover:shadow-lg transform hover:-translate-y-px"
                >
                    <MdAdd className="w-5 h-5" />
                    <span>Schedule Meeting</span>
                </button>
            </div>


            {filteredMeetings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-20 px-6">
                    <PTMIcon />
                    <h3 className="text-xl font-bold text-slate-700 mt-4">No Meetings Found</h3>
                    <p className="text-slate-500 mt-1">
                        {query ? "Try adjusting your search query." : "There are no scheduled meetings yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredMeetings.map(item => {
                        const teacher = teachers.find(t => t.id === item.teacher_id);
                        const meetingDate = new Date(item.meeting_datetime);
                        return (
                            <div key={item.id} className="bg-slate-50 rounded-xl shadow-sm border border-slate-200/80 transition-all duration-300 hover:shadow-md hover:border-blue-300">
                                <div className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5">
                                    {/* Date Section */}
                                    <div className="flex-shrink-0 text-center w-full sm:w-24 bg-white border border-slate-200 rounded-lg p-3">
                                        <p className="text-blue-600 font-bold text-lg">{meetingDate.toLocaleString('en-US', { month: 'short' })}</p>
                                        <p className="text-slate-800 font-extrabold text-3xl my-0.5">{meetingDate.getDate()}</p>
                                        <p className="text-slate-500 text-sm">{meetingDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                    </div>


                                    {/* Details Section */}
                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex items-center gap-3 text-base">
                                            <MdPersonOutline className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            <span className="font-semibold text-slate-800 truncate">{teacher ? teacher.full_name : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <MdOutlineSchool className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            <span className="text-slate-600">Class: <span className="font-medium text-slate-700">{item.class_group}</span></span>
                                        </div>
                                         <div className="flex items-center gap-3 text-sm">
                                            <MdOutlineBook className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            <span className="text-slate-600">Focus: <span className="font-medium text-slate-700">{item.subject_focus || 'General'}</span></span>
                                        </div>
                                        {item.meeting_link && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <MdLink className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                                <a href={item.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate">
                                                    Meeting Link
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Actions & Status Section */}
                                    <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-none border-slate-200/80">
                                         <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                            item.status === 'Completed' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleOpenModal(item)} className="text-slate-500 hover:text-blue-600" title="Edit Meeting">
                                                <MdEdit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600" title="Delete Meeting">
                                                <MdDelete className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50">
        {/* Header is unchanged and remains as a block structure */}
          <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Manage PTMs</h1>
                        <p className="text-xs sm:text-sm text-slate-600">Schedule, update, and review all parent-teacher meetings</p>
                    </div>
                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <input
                                id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by teacher, class, subject..."
                                className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
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


        {/* Modal is unchanged */}
        {isModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 p-4" onClick={() => setIsModalOpen(false)}>
                <div onClick={(e) => e.stopPropagation()} className="bg-white/95 rounded-3xl shadow-2xl border border-white/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">{editingMeeting ? "Edit Meeting" : "New Meeting"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="space-y-6">
                            {/* Modal Form Content... */}
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Teacher *</label><select value={formData.teacher_id} onChange={(e) => setFormData({...formData, teacher_id: e.target.value})} disabled={!!editingMeeting} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm disabled:opacity-50 disabled:bg-gray-50"><option value="">-- Select a Teacher --</option>{teachers.map(t => (<option key={t.id} value={t.id.toString()}>{t.full_name}</option>))}</select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label><select value={formData.class_group} onChange={(e) => setFormData({...formData, class_group: e.target.value})} disabled={!!editingMeeting} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm disabled:opacity-50 disabled:bg-gray-50"><option value="">-- Select a Class --</option>{classes.map(c => (<option key={c} value={c}>{c}</option>))}</select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Subject Focus</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm disabled:opacity-50 disabled:bg-gray-50" value={formData.subject_focus} onChange={(e) => setFormData({...formData, subject_focus: e.target.value})} placeholder="e.g., Math Performance" disabled={!!editingMeeting}/></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Date & Time *</label><input type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm disabled:opacity-50 disabled:bg-gray-50" value={formData.meeting_datetime ? formData.meeting_datetime.replace(' ', 'T') : ''} onChange={handleDateTimeChange} disabled={!!editingMeeting}/></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Link (Optional)</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm" value={formData.meeting_link} onChange={(e) => setFormData({...formData, meeting_link: e.target.value})} placeholder="e.g., https://meet.google.com/xyz"/></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label><textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm resize-none" rows={4} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Discussion points..."/></div>
                            {editingMeeting && (<div><label className="block text-sm font-semibold text-gray-700 mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm"><option value="Scheduled">Scheduled</option><option value="Completed">Completed</option></select></div>)}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200/60 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-300">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">Save Meeting</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};


export default TeacherAdminPTMScreen;
