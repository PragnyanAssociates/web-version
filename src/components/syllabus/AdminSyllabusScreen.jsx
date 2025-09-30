import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
// ★★★ FIX 1: Import apiClient instead of using fetch ★★★
import apiClient from '../../api/client';
import { 
    FaEdit, 
    FaPlus, 
    FaChartBar, 
    FaUser, 
    FaCalendar 
} from "react-icons/fa";
import { MdArrowBack, MdClose, MdBook, MdCheckCircle, MdCancel, MdHourglassEmpty } from 'react-icons/md';

// ★★★ DATE UTILITY FUNCTIONS - FIXES INVALID DATE ISSUES ★★★
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString();
};

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

const AdminSyllabusScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Syllabus functionality ---
  const [view, setView] = useState("history");
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);

  // --- Dynamic Page Info for Header ---
  const pageInfo = useMemo(() => {
    switch(view) {
        case "createOrEdit":
            return {
                title: selectedSyllabus ? "Edit Syllabus" : "Create New Syllabus",
                subtitle: selectedSyllabus ? "Update syllabus details" : "Set up a new syllabus for your class"
            };
        case "progressDetail":
            return {
                title: "Class Progress",
                subtitle: `Progress for ${selectedSyllabus?.class_group} - ${selectedSyllabus?.subject_name}`
            };
        default: // history
            return {
                title: "Syllabus Management",
                subtitle: "Create and manage syllabuses for different classes and subjects"
            };
    }
  }, [view, selectedSyllabus]);
  
  // --- Hooks for Header Functionality ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
        if (!token) { setUnreadCount?.(0); return; }
        try {
            // ★★★ FIX 2: Use apiClient for notifications ★★★
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
              // ★★★ FIX 3: Use apiClient for profile ★★★
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

  // --- Helper Functions ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) { logout(); navigate("/"); }
  };

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'student') return '/StudentDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    if (user.role === 'donor') return '/DonorDashboard';
    return '/';
  };

  const navigateTo = (targetView, data = null) => {
    setSelectedSyllabus(data);
    setView(targetView);
  };

  const handleBackNavigation = () => {
    if (view === 'history') {
      navigate(getDefaultDashboardRoute());
    } else {
      navigateTo('history');
    }
  };

  const renderContent = () => {
    if (loadingProfile) {
      return (
          <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
    }

    switch(view) {
      case "createOrEdit":
        return <CreateOrEditSyllabus initialSyllabus={selectedSyllabus} onFinish={() => navigateTo("history")} />;
      case "progressDetail":
        return <AdminProgressView syllabus={selectedSyllabus} onBack={() => navigateTo("history")} />;
      default: // history
        return <SyllabusHistoryList onEdit={(s) => navigateTo("createOrEdit", s)} onCreate={() => navigateTo("createOrEdit")} onViewProgress={(s) => navigateTo("progressDetail", s)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">{pageInfo.title}</h1>
                        <p className="text-xs sm:text-sm text-slate-600">{pageInfo.subtitle}</p>
                    </div>

                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <input
                                id="module-search"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search syllabus..."
                                className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                            <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home" >
                                <HomeIcon />
                                <span className="hidden md:inline">Home</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar" >
                                <CalendarIcon />
                                <span className="hidden md:inline">Calendar</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile" >
                                <UserIcon />
                                <span className="hidden md:inline">Profile</span>
                            </button>
                        </div>

                        <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />

                        <div className="flex items-center gap-2 sm:gap-3">
                            <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                            <div className="hidden sm:flex flex-col">
                                <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">
                                    {profile?.full_name || profile?.username || "User"}
                                </span>
                                <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                            </div>
                            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" >
                                <span className="hidden sm:inline">Logout</span>
                                <span className="sm:hidden">Exit</span>
                            </button>
                            <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button" >
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
                    onClick={handleBackNavigation}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title={view === 'history' ? "Back to Dashboard" : "Back to Syllabus List"}
                >
                    <MdArrowBack />
                    <span>{view === 'history' ? "Back to Dashboard" : "Back to Syllabus List"}</span>
                </button>
            </div>
            {renderContent()}
        </main>
    </div>
  );
};

const SyllabusHistoryList = ({ onEdit, onCreate, onViewProgress }) => {
  const [syllabuses, setSyllabuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSyllabusHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      // ★★★ FIX 4: Use apiClient and remove /api/ prefix ★★★
      const response = await apiClient.get('/syllabus/all');
      setSyllabuses(response.data);
    } catch (error) {
      console.error("Error fetching syllabus history:", error);
      alert(error.response?.data?.message || "Failed to load syllabus history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyllabusHistory();
  }, [fetchSyllabusHistory]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {syllabuses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
            <MdBook className="mx-auto w-16 h-16 text-slate-300" />
            <h3 className="mt-4 text-xl font-semibold text-slate-700">No Syllabuses Found</h3>
            <p className="mt-2 text-slate-500 mb-6">Click the button below to create the first syllabus.</p>
            <button onClick={onCreate} className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition" >
                <FaPlus /> Create New Syllabus
            </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Subject</div>
                  <div className="col-span-2">Class</div>
                  <div className="col-span-1 text-center">Lessons</div>
                  <div className="col-span-2">Creator</div>
                  <div className="col-span-2">Last Updated</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {/* Table Body */}
                <div>
                  {syllabuses.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 items-center px-4 py-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50/70 transition-colors">
                      <div className="col-span-3 font-bold text-slate-800 text-base">{item.subject_name}</div>
                      <div className="col-span-2"><span className="font-medium bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-sm">{item.class_group}</span></div>
                      <div className="col-span-1 text-center font-medium text-slate-600">{item.lesson_count}</div>
                      <div className="col-span-2 text-sm text-slate-600">{item.creator_name}</div>
                      <div className="col-span-2 text-sm text-slate-600">{formatDate(item.updated_at)}</div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                          <button onClick={() => onViewProgress(item)} className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition" title="View Progress">
                              <FaChartBar className="text-green-600" size={16} />
                          </button>
                          <button onClick={() => onEdit(item)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition" title="Edit">
                              <FaEdit className="text-blue-600" size={16} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
           <div className="text-center mt-8">
             <button onClick={onCreate} className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all hover:scale-105" >
               <FaPlus className="inline-block mr-2" /> Create Another Syllabus
             </button>
           </div>
        </>
      )}
    </div>
  );
};

const CreateOrEditSyllabus = ({ initialSyllabus, onFinish }) => {
  const isEditMode = !!initialSyllabus;
  const [selectedClass, setSelectedClass] = useState(isEditMode ? initialSyllabus.class_group : "");
  const [selectedSubject, setSelectedSubject] = useState(isEditMode ? initialSyllabus.subject_name : "");
  const [selectedTeacherId, setSelectedTeacherId] = useState(isEditMode ? initialSyllabus.creator_id?.toString() : "");
  const [lessons, setLessons] = useState([{ lessonName: "", dueDate: "" }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allClasses, setAllClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [isTeachersLoading, setIsTeachersLoading] = useState(false);

  useEffect(() => {
    const bootstrapForm = async () => {
      setIsLoading(true);
      try {
        // ★★★ FIX 5: Use apiClient for all fetch calls ★★★
        const classRes = await apiClient.get('/student-classes');
        setAllClasses(classRes.data);

        if (isEditMode) {
          await handleClassChange(initialSyllabus.class_group, true);
          await handleSubjectChange(initialSyllabus.subject_name, initialSyllabus.class_group, true);
          
          // ★★★ FIX 6: Fetch existing lesson data for edit mode ★★★
          const syllabusDetailsRes = await apiClient.get(`/syllabus/teacher/${initialSyllabus.class_group}/${initialSyllabus.subject_name}`);
          const syllabusData = syllabusDetailsRes.data;
          const formattedLessons = syllabusData.lessons.map(l => ({ 
            lessonName: l.lesson_name, 
            dueDate: l.due_date.split('T')[0] 
          }));
          setLessons(formattedLessons.length > 0 ? formattedLessons : [{ lessonName: "", dueDate: "" }]);
        }
      } catch (e) { 
        console.error("Error bootstrapping form:", e); 
        alert(e.response?.data?.message || "Could not load initial form data."); 
      } 
      finally { setIsLoading(false); }
    };
    bootstrapForm();
  }, []);

  const handleClassChange = async (classGroup, isInitialLoad = false) => {
    if (!isInitialLoad) {
      setSelectedSubject(''); setAvailableSubjects([]);
      setSelectedTeacherId(''); setAvailableTeachers([]);
    }
    setSelectedClass(classGroup);
    if (!classGroup) return;

    setIsSubjectsLoading(true);
    try {
      const subjectRes = await apiClient.get(`/subjects-for-class/${classGroup}`);
      setAvailableSubjects(subjectRes.data);
    } catch (error) { 
      console.error("Error fetching subjects:", error); 
    } 
    finally { setIsSubjectsLoading(false); }
  };

  const handleSubjectChange = async (subjectName, classGroup = selectedClass, isInitialLoad = false) => {
    if (!isInitialLoad) {
      setSelectedTeacherId(''); setAvailableTeachers([]);
    }
    setSelectedSubject(subjectName);
    if (!subjectName || !classGroup) return;
    
    setIsTeachersLoading(true);
    try {
      const teacherRes = await apiClient.get(`/syllabus/teachers/${classGroup}/${subjectName}`);
      const teachers = teacherRes.data;
      setAvailableTeachers(teachers);
      if (teachers.length === 1 && !isEditMode) setSelectedTeacherId(teachers[0].id.toString());
    } catch (error) { 
      console.error("Error fetching teachers:", error); 
    } 
    finally { setIsTeachersLoading(false); }
  };

  const handleLessonChange = (index, field, value) => {
    const newLessons = [...lessons];
    newLessons[index][field] = value;
    setLessons(newLessons);
  };

  const addLessonField = () => setLessons([...lessons, { lessonName: "", dueDate: "" }]);
  const removeLessonField = (index) => setLessons(lessons.filter((_, i) => i !== index));

  const handleSaveSyllabus = async () => {
    if (!selectedClass || !selectedSubject || !selectedTeacherId) return alert("Please select Class, Subject and Teacher.");
    if (lessons.some((l) => l.lessonName && !l.dueDate)) return alert("All lessons must have a due date.");
    const validLessons = lessons.filter((l) => l.lessonName.trim() && l.dueDate.trim());
    if (validLessons.length === 0) return alert("Please add at least one valid lesson.");
    
    setIsSaving(true);

    try {
      let response;
      if (isEditMode) {
        // ★★★ FIX 7: Use correct update endpoint matching mobile ★★★
        response = await apiClient.put(`/syllabus/${initialSyllabus.id}`, {
          lessons: validLessons,
          creator_id: selectedTeacherId,
        });
      } else {
        response = await apiClient.post('/syllabus/create', {
          class_group: selectedClass,
          subject_name: selectedSubject,
          lessons: validLessons,
          creator_id: selectedTeacherId,
        });
      }

      alert(response.data.message);
      onFinish();
    } catch (error) {
      console.error("Error saving syllabus:", error);
      alert(error.response?.data?.message || "Failed to save syllabus.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200/80 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Class</label>
                <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} disabled={isEditMode} className="w-full bg-white border border-slate-300 p-3 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-500">
                    <option value="">Select Class...</option>
                    {allClasses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <select value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)} disabled={isEditMode || !selectedClass || isSubjectsLoading} className="w-full bg-white border border-slate-300 p-3 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-500">
                    <option value="">{isSubjectsLoading ? "Loading..." : "Select Subject..."}</option>
                    {availableSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Teacher</label>
                <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)} disabled={!selectedSubject || isTeachersLoading} className="w-full bg-white border border-slate-300 p-3 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-500">
                    <option value="">{isTeachersLoading ? "Loading..." : "Select Teacher..."}</option>
                    {availableTeachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
            </div>
        </div>
        
        <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Lessons</h3>
            <div className="space-y-3">
                {lessons.map((lesson, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-500 pt-2 sm:pt-0">{index + 1}.</span>
                        <input className="w-full flex-grow bg-white border border-slate-300 p-2 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200" placeholder="Lesson Name" value={lesson.lessonName} onChange={(e) => handleLessonChange(index, "lessonName", e.target.value)} />
                        <input type="date" className="w-full sm:w-auto bg-white border border-slate-300 p-2 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200" value={lesson.dueDate} onChange={(e) => handleLessonChange(index, "dueDate", e.target.value)} />
                        {lessons.length > 1 && (
                            <button type="button" onClick={() => removeLessonField(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition self-end sm:self-center">
                                <MdClose size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button type="button" onClick={addLessonField} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                <FaPlus /> Add Lesson
            </button>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex justify-end">
            <button type="button" onClick={handleSaveSyllabus} disabled={isSaving} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50">
                {isSaving ? "Saving..." : isEditMode ? "Update Syllabus" : "Save Syllabus"}
            </button>
        </div>
    </div>
  );
};

const AdminProgressView = ({ syllabus }) => {
  const [auditLog, setAuditLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const StatusPill = ({ status }) => {
    const styles = useMemo(() => {
        switch (status) {
            case "Completed": return { icon: <MdCheckCircle className="text-green-500" />, text: "text-green-700", bg: "bg-green-100" };
            case "Missed": return { icon: <MdCancel className="text-red-500" />, text: "text-red-700", bg: "bg-red-100" };
            default: return { icon: <MdHourglassEmpty className="text-yellow-500" />, text: "text-yellow-700", bg: "bg-yellow-100" };
        }
    }, [status]);
    return (
        <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full ${styles.bg} ${styles.text}`}>
            {styles.icon} {status}
        </span>
    );
  };

  useEffect(() => {
    const fetchProgress = async () => {
      if (!syllabus?.id) return;
      setIsLoading(true);
      try {
        // ★★★ FIX 8: Use apiClient for progress ★★★
        const response = await apiClient.get(`/syllabus/class-progress/${syllabus.id}`);
        setAuditLog(response.data);
      } catch (error) {
        console.error("Error fetching progress:", error);
        alert(error.response?.data?.message || "Could not load class progress.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [syllabus]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200/80 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-slate-50">
            <FaChartBar className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">View Class Progress</h2>
        </div>
        {auditLog.length === 0 ? (
            <div className="text-center py-16">
                <FaChartBar className="mx-auto w-12 h-12 text-slate-300" />
                <h3 className="mt-4 text-xl font-semibold text-slate-700">No Progress Yet</h3>
                <p className="text-slate-500 mt-1">No lessons have been updated for this syllabus.</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-200">
                {auditLog.map((lesson) => (
                    <div key={lesson.lesson_id} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center hover:bg-slate-50/70 transition-colors">
                        <div className="md:col-span-2">
                            <h3 className="font-bold text-slate-800 text-lg">{lesson.lesson_name}</h3>
                            <p className="text-sm text-slate-500 mt-1">Due: {formatDate(lesson.due_date)}</p>
                        </div>
                        <div className="flex justify-start md:justify-center">
                            <StatusPill status={lesson.status} />
                        </div>
                        <div className="text-sm text-slate-500 md:text-right">
                            <p>Last updated by:</p>
                            <p className="font-semibold text-slate-700">{lesson.updater_name}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default AdminSyllabusScreen;
