import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faCalendarTimes,
  faPencilAlt,
  faTrash,
  faVideo,
  faSearch,
  faChalkboardTeacher,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext.tsx';
import apiClient from '../../api/client';
import { MdArrowBack } from 'react-icons/md';

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

// --- Helper Functions ---
const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const formatDateHeader = (dateString) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const classDate = new Date(dateString);

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    if (today.toDateString() === classDate.toDateString()) {
        return `Today, ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
    if (tomorrow.toDateString() === classDate.toDateString()) {
        return `Tomorrow, ${tomorrow.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
    return classDate.toLocaleDateString('en-US', options);
};


// --- Main Component ---
const OnlineClassScreen = () => {
  // --- State and Hooks (Unchanged) ---
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  const [allClasses, setAllClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);

  const initialFormState = {
    title: '',
    class_group: '',
    subject: '',
    teacher_id: '',
    meet_link: '',
    description: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [date, setDate] = useState(new Date());

  const isPrivilegedUser = user?.role === 'admin' || user?.role === 'teacher';

  // --- API Calls and Data Fetching (Unchanged) ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
      if (!token) { setUnreadCount?.(0); return; }
      try {
        const res = await apiClient.get('/notifications', { headers: { Authorization: `Bearer ${token}` } });
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
        const res = await apiClient.get(`/profiles/${user.id}`);
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

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [classesRes, classGroupsRes] = await Promise.all([
        apiClient.get('/online-classes'),
        apiClient.get('/student-classes'),
      ]);
      setAllClasses(classesRes.data);
      setClassGroups(classGroupsRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const fetchClassSpecificData = async () => {
      if (formData.class_group && !isEditing) {
        try {
          const [subjectsRes, teachersRes] = await Promise.all([
            apiClient.get(`/subjects-for-class/${formData.class_group}`),
            apiClient.get(`/teachers-for-class/${formData.class_group}`)
          ]);
          let fetchedSubjects = subjectsRes.data;
          if (fetchedSubjects.length === 0) {
            const allSubjectsRes = await apiClient.get('/subjects/all-unique');
            fetchedSubjects = allSubjectsRes.data;
          }
          setSubjects(fetchedSubjects);
          setTeachers(teachersRes.data);
        } catch (error) {
          alert(error.response?.data?.message || 'Could not load class details.');
          setSubjects([]);
          setTeachers([]);
        }
      } else if (!formData.class_group) {
        setSubjects([]);
        setTeachers([]);
      }
    };
    if (modalVisible) fetchClassSpecificData();
  }, [formData.class_group, modalVisible, isEditing]);

  // --- Handlers and Logic (Unchanged) ---
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

  const handleClassChange = (classValue) => {
    setFormData({ ...formData, class_group: classValue, subject: '', teacher_id: '' });
  };

  const filteredClasses = useMemo(() => {
    if (!user) return [];
    
    let classesToFilter = [];
    if (user.role === 'admin') {
      classesToFilter = allClasses;
    } else if (user.role === 'teacher') {
      classesToFilter = allClasses.filter(c => String(c.teacher_id) === String(user.id) || String(c.created_by) === String(user.id));
    } else if (user.role === 'student') {
      classesToFilter = allClasses.filter(c => c.class_group === user.class_group);
    }

    if (!query) {
        return classesToFilter;
    }

    return classesToFilter.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subject.toLowerCase().includes(query.toLowerCase()) ||
        c.teacher_name.toLowerCase().includes(query.toLowerCase())
    );

  }, [user, allClasses, query]);
  
  const groupedClasses = useMemo(() => {
      return filteredClasses
        .sort((a, b) => new Date(a.class_datetime) - new Date(b.class_datetime))
        .reduce((acc, classItem) => {
            const date = classItem.class_datetime.split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(classItem);
            return acc;
        }, {});
  }, [filteredClasses]);

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const newDate = new Date(date);
    newDate.setFullYear(selectedDate.getFullYear());
    newDate.setMonth(selectedDate.getMonth());
    newDate.setDate(selectedDate.getDate());
    setDate(newDate);
  };

  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    setDate(newDate);
  };

  const handleOpenModal = (classItem = null) => {
    if (classItem) {
      setIsEditing(true);
      setCurrentClass(classItem);
      setFormData({
        title: classItem.title,
        class_group: classItem.class_group,
        subject: classItem.subject,
        teacher_id: classItem.teacher_id,
        meet_link: classItem.meet_link,
        description: classItem.description || '',
      });
      setDate(new Date(classItem.class_datetime));
    } else {
      setIsEditing(false);
      setCurrentClass(null);
      setFormData(initialFormState);
      setDate(new Date());
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!user) return alert("User not found.");
    const bodyPayload = isEditing
      ? { title: formData.title, meet_link: formData.meet_link, description: formData.description }
      : { ...formData, teacher_id: Number(formData.teacher_id), class_datetime: date.toISOString(), created_by: user.id };
    if (!isEditing && (!bodyPayload.title || !bodyPayload.class_group || !bodyPayload.subject || !bodyPayload.teacher_id)) {
      alert("Please fill in Title, Class, Subject, and Teacher.");
      return;
    }
    try {
      if (isEditing) {
        await apiClient.put(`/online-classes/${currentClass?.id}`, bodyPayload);
      } else {
        await apiClient.post('/online-classes', bodyPayload);
      }
      alert(`Class ${isEditing ? 'updated' : 'scheduled'} successfully.`);
      fetchInitialData();
      setModalVisible(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save class.');
    }
  };

  const handleDelete = (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      const deleteClass = async () => {
        try {
          await apiClient.delete(`/online-classes/${classId}`);
          alert("Class deleted successfully.");
          fetchInitialData();
        } catch (error) {
          alert(error.response?.data?.message || 'Failed to delete.');
        }
      };
      deleteClass();
    }
  };

  const handleJoinClass = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // --- NEW TIMELINE-STYLE RENDER CONTENT ---
  const renderContent = () => {
    if (loading || loadingProfile) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    const classDates = Object.keys(groupedClasses);

    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Your Schedule</h2>
          {isPrivilegedUser && (
            <button
              onClick={() => handleOpenModal()}
              className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Schedule Class
            </button>
          )}
        </div>

        {classDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl shadow-sm">
            <FontAwesomeIcon icon={faCalendarTimes} className="text-7xl text-slate-300 mb-5" />
            <p className="text-slate-600 text-xl font-semibold">No Online Classes Found</p>
            <p className="text-slate-400 mt-2 max-w-sm">
                {query ? "Try adjusting your search query to find what you're looking for." : "It looks like there are no classes scheduled yet. You can schedule a new one to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {classDates.map(date => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-indigo-700 pb-2 mb-4 border-b-2 border-indigo-100">
                  {formatDateHeader(date)}
                </h3>
                <div className="space-y-4">
                  {groupedClasses[date].map(classItem => (
                    <div key={classItem.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex flex-col items-center justify-center w-20 text-center">
                            <span className="font-bold text-lg text-indigo-600">{formatTime(classItem.class_datetime).split(' ')[0]}</span>
                            <span className="text-xs text-slate-500">{formatTime(classItem.class_datetime).split(' ')[1]}</span>
                        </div>
                        <div className="w-px self-stretch bg-slate-200 mx-2"></div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-slate-800 text-lg">{classItem.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mt-1">
                                <span className="inline-flex items-center gap-2"><FontAwesomeIcon icon={faBookOpen} className="text-slate-400" /> {classItem.subject}</span>
                                <span className="inline-flex items-center gap-2"><FontAwesomeIcon icon={faChalkboardTeacher} className="text-slate-400" /> {classItem.teacher_name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user?.role === 'student' && (
                                <button
                                onClick={() => handleJoinClass(classItem.meet_link)}
                                className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                                >
                                <FontAwesomeIcon icon={faVideo} className="mr-0 sm:mr-2" />
                                <span className="hidden sm:inline">Join</span>
                                </button>
                            )}
                            {(user?.role === 'admin' || user?.role === 'teacher') && (
                                <>
                                <button onClick={() => handleOpenModal(classItem)} className="h-10 w-10 flex items-center justify-center text-yellow-600 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors" title="Edit">
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                </button>
                                <button onClick={() => handleDelete(classItem.id)} className="h-10 w-10 flex items-center justify-center text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors" title="Delete">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                                </>
                            )}
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-100">
      {/* --- Header (Unchanged) --- */}
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Online Classes</h1>
              <p className="text-xs sm:text-sm text-slate-600">View and manage all online sessions</p>
            </div>

            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
                </div>
                <input
                  id="module-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search classes..."
                  className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white pl-9 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                  <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-indigo-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Exit</span>
                </button>
                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Notifications" title="Notifications" type="button">
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
      
      {/* --- Main Content Area --- */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(getDefaultDashboardRoute())}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            title="Back to Dashboard"
          >
            <MdArrowBack />
            <span>Back to Dashboard</span>
          </button>
        </div>
        {renderContent()}
      </main>

      {/* --- Modal (Styling Unchanged) --- */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
                {isEditing ? 'Edit Online Class' : 'Schedule New Class'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Title:</label>
                  <input
                    type="text"
                    placeholder="e.g., Algebra Review"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 font-medium mb-1.5">Class:</label>
                        <select disabled={isEditing} value={formData.class_group} onChange={(e) => handleClassChange(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="">-- Select Class --</option>
                            {classGroups.map((c, i) => (<option key={i} value={c}>{c}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-700 font-medium mb-1.5">Subject:</label>
                        <select disabled={isEditing || !formData.class_group} value={formData.subject} onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="">-- Select Subject --</option>
                            {subjects.map((s, i) => (<option key={i} value={s}>{s}</option>))}
                        </select>
                    </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Teacher:</label>
                  <select disabled={isEditing || !formData.class_group} value={String(formData.teacher_id)} onChange={(e) => setFormData(prev => ({ ...prev, teacher_id: Number(e.target.value) }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">-- Select Teacher --</option>
                    {teachers.map((t) => (<option key={t.id} value={String(t.id)}>{t.full_name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Date & Time:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" disabled={isEditing} value={date.toISOString().split('T')[0]} onChange={handleDateChange} className="border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                    <input type="time" disabled={isEditing} value={date.toTimeString().slice(0, 5)} onChange={handleTimeChange} className="border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Meeting Link:</label>
                  <input type="url" placeholder="https://meet.google.com/xyz" value={formData.meet_link} onChange={(e) => setFormData(prev => ({ ...prev, meet_link: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Description (Optional):</label>
                  <textarea placeholder="Topics to be covered..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setModalVisible(false)} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg">
                    {isEditing ? 'Update' : 'Schedule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineClassScreen;