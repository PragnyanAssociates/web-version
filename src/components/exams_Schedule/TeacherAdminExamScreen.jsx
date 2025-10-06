import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdAdd,
  MdClose,
  MdCalendarToday,
  MdInfoOutline,
  MdAccessTime,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext.tsx";
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



const defaultRow = { date: "", subject: "", time: "", block: "" };
const defaultSpecialRow = {
  type: "special",
  mainText: "Teacher Work Day",
  subText: "(No school for students)",
};

// --- REDESIGNED Schedule Detail View ---
const ScheduleDetailView = ({ schedule }) => {
  const groupedSchedule = useMemo(() => {
    if (!schedule || !schedule.schedule_data) return [];
    
    const result = [];
    let currentDayGroup = null;

    schedule.schedule_data.forEach(row => {
      if (row.type === 'special') {
        if (currentDayGroup) {
          result.push(currentDayGroup);
          currentDayGroup = null;
        }
        result.push({ type: 'special', ...row });
      } else {
        if (!currentDayGroup || currentDayGroup.date !== row.date) {
          if (currentDayGroup) {
            result.push(currentDayGroup);
          }
          currentDayGroup = { type: 'day', date: row.date, items: [] };
        }
        currentDayGroup.items.push(row);
      }
    });

    if (currentDayGroup) {
      result.push(currentDayGroup);
    }

    return result;
  }, [schedule.schedule_data]);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MdCalendarToday className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{schedule.title}</h2>
        {schedule.subtitle && (
          <p className="text-lg text-slate-500 mt-2">{schedule.subtitle}</p>
        )}
        <div className="w-20 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Grouped Schedule Body */}
      <div className="space-y-6">
        {groupedSchedule.map((group, index) => {
          if (group.type === 'day') {
            return (
              <div key={group.date || index} className="bg-slate-50 rounded-xl shadow-md border border-slate-200 overflow-hidden">
                {/* Date Header */}
                <div className="px-5 py-3 bg-slate-100 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-indigo-700">{group.date}</h3>
                </div>
                {/* Exam Items List */}
                <div className="divide-y divide-slate-200">
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-5 hover:bg-slate-100/50 transition-colors">
                      <span className="font-medium text-slate-800 text-base">{item.subject}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center text-sm font-semibold text-blue-800 bg-blue-100 px-4 py-1.5 rounded-full">
                          <MdAccessTime className="w-5 h-5 mr-2 text-blue-500" />
                          {item.time}
                        </span>
                        {item.block && (
                          <span className="text-sm font-medium text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                            Block {item.block}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          if (group.type === 'special') {
            return (
              <div key={`special-${index}`} className="bg-yellow-100 border-l-4 border-yellow-400 rounded-r-lg p-5 flex items-start gap-4 shadow-sm">
                <div className="flex-shrink-0 mt-0.5">
                  <MdInfoOutline className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-900 text-lg">{group.mainText}</h3>
                  {group.subText && <p className="italic text-yellow-800 mt-1">{group.subText}</p>}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

const TeacherAdminExamScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Exam Screen functionality ---
  const [view, setView] = useState("list");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [rows, setRows] = useState([defaultRow]);
  const [isSaving, setIsSaving] = useState(false);
  const [studentClasses, setStudentClasses] = useState([]);

  const pageInfo = useMemo(() => {
    if (view === 'detail' && selectedSchedule) {
        return { title: 'Schedule Details', subtitle: `Viewing schedule for "${selectedSchedule.title}"` };
    }
    return { title: 'Exam Schedules', subtitle: 'Manage and view all exam schedules' };
  }, [view, selectedSchedule]);

  // --- Hooks for Header Functionality ---
  useEffect(() => {
      async function fetchUnreadNotifications() {
          if (!token) { setUnreadCount?.(0); return; }
          try {
              const response = await apiClient.get('/notifications');
              const data = response.data;
              const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
              setLocalUnreadCount(count);
              setUnreadCount?.(count);
          } catch (error) { setUnreadCount?.(0); }
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
              const response = await apiClient.get(`/profiles/${user.id}`);
              setProfile(response.data);
          } catch (error) {
              setProfile({
                  id: user.id, username: user.username || "Unknown",
                  full_name: user.full_name || "User", role: user.role || "user",
              });
          } finally { setLoadingProfile(false); }
      }
      fetchProfile();
  }, [user]);

  // --- Main Helper Functions ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) { logout(); navigate("/"); }
  };

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    return '/';
  };

  const backToList = () => { setSelectedSchedule(null); setView("list"); };

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/exam-schedules');
      setSchedules(response.data);
    } catch (e) { 
      console.error("Error fetching schedules:", e);
      alert(e.response?.data?.message || "Failed to fetch schedules."); 
    }
    finally { setIsLoading(false); }
  }, []);

  const fetchStudentClasses = async () => {
    try {
      const response = await apiClient.get('/student-classes');
      setStudentClasses(response.data);
    } catch (e) { 
      console.error("Error fetching student classes:", e); 
    }
  };

  useEffect(() => {
    if (view === "list") fetchSchedules();
    fetchStudentClasses();
  }, [view, fetchSchedules]);

  const viewDetails = async (scheduleItem) => {
    try {
      const response = await apiClient.get(`/exam-schedules/${scheduleItem.id}`);
      setSelectedSchedule(response.data);
      setView("detail");
    } catch (e) { 
      console.error("Error fetching schedule details:", e);
      alert(e.response?.data?.message || "Could not fetch schedule details"); 
    }
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = (type = "normal") => setRows((prev) => [...prev, type === "special" ? defaultSpecialRow : { ...defaultRow }]);
  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setEditingSchedule(null); setTitle(""); setSubtitle(""); setSelectedClass(""); setRows([defaultRow]);
  };

  const openCreateModal = () => { resetForm(); setIsModalVisible(true); };

  const openEditModal = async (schedule) => {
    try {
      const response = await apiClient.get(`/exam-schedules/${schedule.id}`);
      const data = response.data;
      setEditingSchedule(data); setTitle(data.title); setSubtitle(data.subtitle);
      setSelectedClass(data.class_group); setRows(data.schedule_data || [defaultRow]); setIsModalVisible(true);
    } catch (e) { 
      console.error("Error loading schedule for editing:", e);
      alert(e.response?.data?.message || "Could not load schedule for editing."); 
    }
  };

  const handleDelete = (schedule) => {
    if (window.confirm(`Delete "${schedule.title}" for ${schedule.class_group}?`)) {
      apiClient.delete(`/exam-schedules/${schedule.id}`)
        .then(() => { 
          alert("Schedule deleted."); 
          fetchSchedules(); 
        })
        .catch((e) => {
          console.error("Error deleting schedule:", e);
          alert(e.response?.data?.message || "Failed to delete schedule.");
        });
    }
  };

  const handleSave = async () => {
    if (!title || !selectedClass || rows.length === 0) {
      return alert("Title, Class, and at least one row are required.");
    }
    setIsSaving(true);
    const payload = { title, subtitle, class_group: selectedClass, schedule_data: rows, created_by_id: user?.id };
    
    try {
      let response;
      if (editingSchedule) {
        response = await apiClient.put(`/exam-schedules/${editingSchedule.id}`, payload);
      } else {
        response = await apiClient.post('/exam-schedules', payload);
      }
      
      alert(response.data.message || `Schedule ${editingSchedule ? "updated" : "created"}!`);
      setIsModalVisible(false); 
      fetchSchedules();
    } catch (e) { 
      console.error("Error saving schedule:", e);
      alert(e.response?.data?.message || "Failed to save schedule."); 
    }
    finally { setIsSaving(false); }
  };
  
  const renderContent = () => {
    if (loadingProfile || isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (view === 'detail' && selectedSchedule) {
      return <ScheduleDetailView schedule={selectedSchedule} />;
    }

    // --- ★★★ START: REDESIGNED TABLE UI ★★★ ---
    return (
      <>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="w-5/12 px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Schedule Title
                  </th>
                  <th scope="col" className="w-2/12 px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="w-3/12 px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Created By
                  </th>
                  <th scope="col" className="w-2/12 px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {!isLoading && schedules.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <div className="text-center p-12 text-slate-500">
                        <MdCalendarToday className="mx-auto w-16 h-16 text-slate-300" />
                        <h3 className="mt-4 text-xl font-semibold text-slate-700">No Schedules Found</h3>
                        <p className="mt-1 text-sm">Get started by creating a new exam schedule.</p>
                        <button
                          onClick={openCreateModal}
                          className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                          type="button"
                        >
                          <MdAdd size={20} />
                          Create Schedule
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schedules.map((item) => (
                    <tr key={item.id} className="even:bg-slate-50/70 hover:bg-blue-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="font-semibold text-slate-800">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.subtitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span className="inline-block text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full">
                          {item.class_group}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 align-middle">
                        {item.created_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-middle">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => viewDetails(item)}
                            className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"
                            aria-label="View Details"
                            title="View Details"
                          >
                            <MdVisibility size={20} />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            aria-label="Edit Schedule"
                            title="Edit Schedule"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                            aria-label="Delete Schedule"
                            title="Delete Schedule"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label="Add New Schedule"
          type="button"
        >
          <MdAdd size={28} />
        </button>
      </>
    );
     // --- ★★★ END: REDESIGNED TABLE UI ★★★ ---
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
         <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">{pageInfo.title}</h1>
              <p className="text-xs sm:text-sm text-slate-600">{pageInfo.subtitle}</p>
            </div>
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="relative">
                <input
                  id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search schedules..."
                  className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() => navigate(getDefaultDashboardRoute())}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                  type="button" title="Home"
                >
                  <HomeIcon />
                  <span className="hidden md:inline">Home</span>
                </button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button
                  onClick={() => navigate("/AcademicCalendar")}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                  type="button" title="Calendar"
                >
                  <CalendarIcon />
                  <span className="hidden md:inline">Calendar</span>
                </button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button
                  onClick={() => navigate("/ProfileScreen")}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                  type="button" title="Profile"
                >
                  <UserIcon />
                  <span className="hidden md:inline">Profile</span>
                </button>
              </div>
              <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />
              <div className="flex items-center gap-2 sm:gap-3">
                   <ProfileAvatar />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">
                    {profile?.full_name || profile?.username || "User"}
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
                <button
                  onClick={() => navigate("/NotificationsScreen")}
                  className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Notifications" title="Notifications" type="button"
                >
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
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => view === 'list' ? navigate(getDefaultDashboardRoute()) : backToList()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            title={view === 'list' ? "Back to Dashboard" : "Back to List"}
          >
            <MdArrowBack />
            <span>{view === 'list' ? "Back to Dashboard" : "Back to List"}</span>
          </button>
        </div>
        {renderContent()}

        {/* Modal for Create/Edit */}
        {isModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-start overflow-auto z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl my-8 sm:my-12 overflow-y-auto max-h-[90vh] border">
              <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
                {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
              </h2>
              <label className="block font-medium text-slate-700 mb-1">Title</label>
              <input
                className="border border-slate-300 p-3 rounded-lg w-full mb-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Final Term Exam"
              />
              <label className="block font-medium text-slate-700 mb-1">Subtitle</label>
              <input
                className="border border-slate-300 p-3 rounded-lg w-full mb-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., March 2025"
              />
              <label className="block font-medium text-slate-700 mb-1">Class</label>
              <select
                className="border border-slate-300 p-3 rounded-lg w-full mb-6 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">-- Select a class --</option>
                {studentClasses.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <label className="block font-medium text-slate-700 mb-2">Schedule Rows</label>
              {rows.map((row, index) => (
                <div key={index} className="relative border p-4 rounded-lg mb-4 bg-slate-50 border-slate-200">
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(index)} className="absolute top-2 right-2 bg-slate-200 text-slate-600 p-1 rounded-full hover:bg-red-500 hover:text-white transition-all" aria-label="Remove Row">
                      <MdClose size={16} />
                    </button>
                  )}
                  {row.type === "special" ? (
                    <>
                      <input
                        className="border border-slate-300 p-3 w-full rounded-lg mb-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                        value={row.mainText} onChange={(e) => handleRowChange(index, "mainText", e.target.value)}
                        placeholder="Special Text (e.g., Holiday)"
                      />
                      <input
                        className="border border-slate-300 p-3 w-full rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                        value={row.subText} onChange={(e) => handleRowChange(index, "subText", e.target.value)}
                        placeholder="Sub-text (Optional)"
                      />
                    </>
                  ) : (
                    <div className="grid sm:grid-cols-4 gap-3">
                      <input
                        className="border border-slate-300 p-3 rounded-lg w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                        value={row.date} onChange={(e) => handleRowChange(index, "date", e.target.value)}
                        placeholder="Date"
                      />
                      <input
                        className="border border-slate-300 p-3 rounded-lg w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                        value={row.subject} onChange={(e) => handleRowChange(index, "subject", e.target.value)}
                        placeholder="Subject"
                      />
                      <input
                        className="border border-slate-300 p-3 rounded-lg w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                        value={row.time} onChange={(e) => handleRowChange(index, "time", e.target.value)}
                        placeholder="Time"
                      />
                      <input
                        className="border border-slate-300 p-3 rounded-lg w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition duration-200"
                        value={row.block} onChange={(e) => handleRowChange(index, "block", e.target.value)}
                        placeholder="Block"
                      />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => addRow("normal")}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-200"
                  type="button"
                >
                  Add Exam Row
                </button>
                <button
                  onClick={() => addRow("special")}
                  className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition duration-200"
                  type="button"
                >
                  Add Special Row
                </button>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalVisible(false)}
                  className="bg-slate-500 text-white font-semibold px-5 py-2.5 rounded-lg shadow hover:bg-slate-600 transition duration-200"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave} disabled={isSaving}
                  className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow hover:bg-green-700 transition duration-200 disabled:bg-green-400"
                  type="button"
                >
                  {isSaving ? "Saving..." : editingSchedule ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherAdminExamScreen;