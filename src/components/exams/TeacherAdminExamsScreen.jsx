"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdAdd,
  MdClose,
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

const TeacherAdminExamsScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Exam functionality ---
  const [view, setView] = useState("list");
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // --- Hooks for Header Functionality ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
      if (!token) {
        setUnreadCount?.(0);
        return;
      }
      try {
        const response = await apiClient.get('/notifications');
        const data = response.data;
        const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
        setLocalUnreadCount(count);
        setUnreadCount?.(count);
      } catch (error) {
        setUnreadCount?.(0);
      }
    }
    fetchUnreadNotifications();
    const id = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(id);
  }, [token, setUnreadCount]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const response = await apiClient.get(`/profiles/${user.id}`);
        setProfile(response.data);
      } catch (error) {
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

  // --- Helper Functions ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/");
    }
  };

  const getDefaultDashboardRoute = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/AdminDashboard";
    if (user.role === "teacher") return "/TeacherDashboard";
    if (user.role === "student") return "/StudentDashboard";
    if (user.role === 'donor') return '/DonorDashboard';
    return "/";
  };
  
  // --- View Handlers ---
  const backToList = () => {
    setSelectedExam(null);
    setSelectedSubmission(null);
    setView("list");
  };
  
  const backToSubmissions = () => {
    setSelectedSubmission(null);
    setView("submissions");
  };

  const handleCreateNew = () => {
    setSelectedExam(null);
    setView("create");
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setView("create");
  };

  const handleViewSubmissions = (exam) => {
    setSelectedExam(exam);
    setView("submissions");
  };

  const handleGrade = (submission) => {
    setSelectedSubmission(submission);
    setView("grading");
  };

  const getHeaderContent = () => {
    switch (view) {
      case 'list':
        return { title: 'My Created Exams', subtitle: 'Manage and grade your examinations' };
      case 'create':
        return {
          title: selectedExam ? 'Edit Exam' : 'Create New Exam',
          subtitle: selectedExam ? 'Update exam details and questions' : 'Set up a new examination'
        };
      case 'submissions':
        return {
          title: `Submissions for "${selectedExam?.title}"`,
          subtitle: 'Review and grade student submissions'
        };
      case 'grading':
        return {
          title: `Grading: ${selectedSubmission?.student_name}`,
          subtitle: `Reviewing submission for exam: "${selectedExam?.title}"`
        };
      default:
        return { title: 'Manage Exams', subtitle: 'View, create, and edit exams' };
    }
  };

  const { title, subtitle } = getHeaderContent();

  const renderContent = () => {
    switch (view) {
      case 'list':
        return <ExamList onCreateNew={handleCreateNew} onEdit={handleEdit} onViewSubmissions={handleViewSubmissions} />;
      case 'create':
        return <CreateOrEditExamView examToEdit={selectedExam} onFinish={backToList} />;
      case 'submissions':
        return <SubmissionsView exam={selectedExam} onGrade={handleGrade} />;
      case 'grading':
        return <GradingView submission={selectedSubmission} exam={selectedExam} onFinish={backToSubmissions} />;
      default:
        return null;
    }
  };
  
  const getBackButton = () => {
    if (view === 'list') return null;
    
    let backAction = backToList;
    let buttonText = "Back to Exam List";
    
    if (view === 'grading') {
      backAction = backToSubmissions;
      buttonText = "Back to Submissions";
    }

    return (
      <div className="mb-6">
        <button
          onClick={backAction}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          title={buttonText}
        >
          <MdArrowBack />
          <span>{buttonText}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">{title}</h1>
              <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
               <div className="relative">
                 <input
                   id="module-search"
                   type="text"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="Search..."
                   className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
               <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                 <button
                   onClick={() => navigate(getDefaultDashboardRoute())}
                   className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                   type="button"
                   title="Home"
                 >
                   <HomeIcon />
                   <span className="hidden md:inline">Home</span>
                 </button>
                 <div className="w-px bg-slate-200" aria-hidden="true" />
                 <button
                   onClick={() => navigate("/AcademicCalendar")}
                   className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                   type="button"
                   title="Calendar"
                 >
                   <CalendarIcon />
                   <span className="hidden md:inline">Calendar</span>
                 </button>
                 <div className="w-px bg-slate-200" aria-hidden="true" />
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
                   aria-label="Notifications"
                   title="Notifications"
                   type="button"
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
        {getBackButton()}
        {loadingProfile ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

const ExamList = ({ onCreateNew, onEdit, onViewSubmissions }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getDefaultDashboardRoute = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/AdminDashboard";
    if (user.role === "teacher") return "/TeacherDashboard";
    return "/";
  };

  const fetchExams = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/exams/teacher/${user.id}`);
      setExams(response.data);
    } catch (e) {
      console.error("Error fetching exams:", e);
      alert(e.response?.data?.message || "Failed to fetch exams.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDelete = (exam) => {
    if (window.confirm(`Are you sure you want to delete "${exam.title}"?`)) {
      setIsLoading(true);
      apiClient.delete(`/exams/${exam.exam_id}`)
        .then(() => {
          setExams((prev) => prev.filter((e) => e.exam_id !== exam.exam_id));
          alert("Exam deleted.");
        })
        .catch((e) => {
          console.error("Error deleting exam:", e);
          alert(e.response?.data?.message || "Failed to delete exam.");
        })
        .finally(() => setIsLoading(false));
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
    <>
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-b border-slate-200 gap-4">
          <h2 className="text-lg font-bold text-slate-800">All Created Exams</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all inline-flex items-center shadow-sm w-full sm:w-auto justify-center"
            onClick={onCreateNew}
          >
            <MdAdd size={20} className="mr-2" />
            Create New Exam
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Submissions</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">No exams created yet</h3>
                    <p className="text-slate-500">Click "Create New Exam" to get started.</p>
                  </td>
                </tr>
              ) : (
                exams.map((item) => (
                  <tr key={item.exam_id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{item.class_group}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.submission_count > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-slate-100 text-slate-700"
                      }`}
                      >
                        {item.submission_count} Submission(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewSubmissions(item)}
                          className="flex items-center gap-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-2 text-xs font-semibold transition"
                        >
                          <MdVisibility size={16} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          aria-label={`Edit ${item.title}`}
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          aria-label={`Delete ${item.title}`}
                        >
                          <MdDelete size={18} />
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
    </>
  );
};

const CreateOrEditExamView = ({ examToEdit, onFinish }) => {
  const { user } = useAuth();
  const isEditMode = !!examToEdit;
  const [examDetails, setExamDetails] = useState({
    title: "", description: "", class_group: "", time_limit_mins: "0",
  });
  const [questions, setQuestions] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const bootstrapData = async () => {
      try {
        const classesRes = await apiClient.get('/student-classes');
        setStudentClasses(classesRes.data);

        if (isEditMode) {
          const examRes = await apiClient.get(`/exams/${examToEdit.exam_id}`);
          const data = examRes.data;
          setExamDetails({
            title: data.title, 
            description: data.description || "", 
            class_group: data.class_group, 
            time_limit_mins: String(data.time_limit_mins || "0"),
          });
          setQuestions(data.questions.map((q) => ({ ...q, id: q.question_id })));
        }
      } catch (e) {
        console.error("Error loading exam data:", e);
        alert(e.response?.data?.message || "Failed to load data.");
        if(isEditMode) onFinish();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapData();
  }, [examToEdit, isEditMode, onFinish]);
  
  const addQuestion = () => setQuestions([...questions, {
    id: Date.now(), question_text: "", question_type: "multiple_choice", options: { A: "", B: "", C: "", D: "" }, correct_answer: "", marks: "1",
  }]);
  const handleQuestionChange = (id, field, value) => setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  const handleOptionChange = (id, optionKey, value) => setQuestions(questions.map((q) => q.id === id ? { ...q, options: { ...q.options, [optionKey]: value } } : q));
  const handleRemoveQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));
  
  const handleSave = async () => {
    if (!user?.id) return alert("Session Error: Could not identify user.");
    if (!examDetails.title || !examDetails.class_group || questions.length === 0) {
      return alert("Title, Class Group, and at least one question are required.");
    }
    setIsSaving(true);
    const payload = { ...examDetails, questions, teacher_id: user.id };
    try {
      if (isEditMode) {
        await apiClient.put(`/exams/${examToEdit.exam_id}`, payload);
      } else {
        await apiClient.post('/exams', payload);
      }
      alert(`Exam ${isEditMode ? "updated" : "created"}!`);
      onFinish();
    } catch (e) {
      console.error("Error saving exam:", e);
      alert(e.response?.data?.message || "Failed to save exam.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="ml-4 text-slate-600">Loading exam data...</p></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Exam Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700" htmlFor="examTitle">Exam Title *</label>
            <input id="examTitle" className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm transition-all" value={examDetails.title} onChange={(e) => setExamDetails({ ...examDetails, title: e.target.value })} placeholder="e.g., Mid-Term Physics Test" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700" htmlFor="classGroup">Class *</label>
            <select id="classGroup" className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm transition-all bg-white" value={examDetails.class_group} onChange={(e) => setExamDetails({ ...examDetails, class_group: e.target.value })}>
              <option value="">-- Select a Class --</option>
              {studentClasses.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700" htmlFor="timeLimit">Time Limit (minutes)</label>
            <input id="timeLimit" type="number" className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm transition-all" value={examDetails.time_limit_mins} onChange={(e) => setExamDetails({ ...examDetails, time_limit_mins: e.target.value })} placeholder="0 for unlimited time" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-slate-200 gap-4">
          <h2 className="text-lg font-bold text-slate-800">Questions</h2>
          <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all inline-flex items-center shadow-sm w-full sm:w-auto justify-center" onClick={addQuestion}>
            <MdAdd size={18} className="mr-1.5" />Add Question
          </button>
        </div>
        <div className="p-6 space-y-6">
          {questions.length === 0 ? (
             <div className="text-center py-10">
               <p className="text-slate-500">No questions added yet. Click "Add Question" to begin.</p>
             </div>
          ) : questions.map((q, idx) => (
            <div key={q.id} className="bg-slate-100 rounded-xl p-5 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-md text-slate-700">Question {idx + 1}</h3>
                <button onClick={() => handleRemoveQuestion(q.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={`Remove Question ${idx + 1}`}>
                  <MdClose size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <textarea className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm transition-all min-h-[100px]" value={q.question_text} onChange={(e) => handleQuestionChange(q.id, "question_text", e.target.value)} placeholder="Enter question text" />
                {Object.keys(q.options).map((opt) => (<input key={opt} className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm transition-all" placeholder={`Option ${opt}`} value={q.options[opt]} onChange={(e) => handleOptionChange(q.id, opt, e.target.value)} />))}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700" htmlFor={`correctAnswer-${q.id}`}>Correct Answer</label>
                    <select id={`correctAnswer-${q.id}`} className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm bg-white" value={q.correct_answer} onChange={(e) => handleQuestionChange(q.id, "correct_answer", e.target.value)}>
                      <option value="">-- Select --</option>
                      {Object.keys(q.options).map((key) => q.options[key] && (<option key={key} value={key}>Option {key}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700" htmlFor={`marks-${q.id}`}>Marks</label>
                    <input id={`marks-${q.id}`} type="number" className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm" value={String(q.marks)} onChange={(e) => handleQuestionChange(q.id, "marks", e.target.value)} placeholder="Marks" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Saving...</div>) : ( isEditMode ? "Save Changes" : "Save & Publish" )}
        </button>
      </div>
    </div>
  );
};

const SubmissionsView = ({ exam, onGrade }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/exams/${exam.exam_id}/submissions`);
      setSubmissions(response.data);
    } catch (e) {
      console.error("Error fetching submissions:", e);
      alert(e.response?.data?.message || "Failed to fetch submissions.");
    } finally {
      setIsLoading(false);
    }
  }, [exam.exam_id]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  
  if (isLoading) return <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="ml-4 text-slate-600">Loading submissions...</p></div>;

  return <div className="bg-white rounded-xl shadow-sm border border-slate-200"><div className="p-4 sm:p-6 border-b border-slate-200"><h2 className="text-lg font-bold text-slate-800">Student Submissions</h2></div><div className="overflow-x-auto"><table className="w-full table-auto"><thead><tr className="bg-slate-100 border-b border-slate-200"><th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Student Name</th><th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Score</th><th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-slate-200">{submissions.length === 0 ? (<tr><td colSpan="4" className="p-16 text-center"><div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4"><svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div><h3 className="text-lg font-semibold text-slate-700 mb-1">No submissions yet</h3><p className="text-slate-500">When students submit this exam, their entries will appear here.</p></td></tr>) : (submissions.map((item) => (<tr key={item.attempt_id} className="hover:bg-slate-100 transition-colors"><td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-slate-800">{item.student_name}</div></td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "graded" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{item.status}</span></td><td className="px-6 py-4 whitespace-nowrap"><span className="font-medium text-slate-700">{item.status === 'graded' ? `${item.final_score} / ${exam.total_marks}`: 'N/A'}</span></td><td className="px-6 py-4 whitespace-nowrap"><button onClick={() => onGrade(item)} className="flex items-center gap-1.5 text-white bg-yellow-500 hover:bg-yellow-600 rounded-md px-3 py-2 text-xs font-semibold transition"><MdEdit size={16} />{item.status === "graded" ? "Update Grade" : "Grade Now"}</button></td></tr>)))}</tbody></table></div></div>;
};

// ★★★ UPDATED: Added options parsing and correct answer display ★★★
const GradingView = ({ submission, exam, onFinish }) => {
  const { user } = useAuth();
  const [submissionDetails, setSubmissionDetails] = useState([]);
  const [gradedAnswers, setGradedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/submissions/${submission.attempt_id}`);
        let details = response.data;

        // ★★★ MODIFICATION: Parse options if they are strings, just like in the RN version ★★★
        if (details) {
          details = details.map(item => ({
            ...item,
            options: (item.options && typeof item.options === 'string') ? JSON.parse(item.options) : item.options,
          }));
        }

        setSubmissionDetails(details);
        const initialGrades = details.reduce((acc, item) => ({ ...acc, [item.question_id]: item.marks_awarded || "" }), {});
        setGradedAnswers(initialGrades);
      } catch (e) {
        console.error("Error fetching submission details:", e);
        alert(e.response?.data?.message || "Could not fetch submission details.");
        onFinish();
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [submission.attempt_id, onFinish]);

  const handleGradeChange = (questionId, marks) => {
    if (/^\d*\.?\d*$/.test(marks)) { setGradedAnswers((prev) => ({ ...prev, [questionId]: marks })); }
  };

  const submitGrade = async () => {
    if (!user?.id) return alert("Session Error: Could not identify the grading teacher.");
    setIsSubmittingGrade(true);
    const answersPayload = Object.entries(gradedAnswers).map(([qid, marks]) => ({
      question_id: qid, marks_awarded: marks ? Number(marks) : 0,
    }));
    try {
      await apiClient.post(`/submissions/${submission.attempt_id}/grade`, {
        gradedAnswers: answersPayload, 
        teacher_feedback: "", 
        teacher_id: user.id
      });
      alert("Grades submitted successfully!");
      onFinish();
    } catch (e) {
      console.error("Error submitting grade:", e);
      alert(e.response?.data?.message || "Failed to submit grade.");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="ml-4 text-slate-600">Loading Submission...</p></div>;
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Review & Grade</h2>
      </div>
      {submissionDetails.map((item, index) => {
        // ★★★ MODIFICATION: Logic to determine and format the correct answer for display ★★★
        let correctAnswerDisplay = 'N/A';
        if (item.correct_answer) {
          if (item.question_type === 'multiple_choice' && item.options && item.options[item.correct_answer]) {
            correctAnswerDisplay = `${item.correct_answer}. ${item.options[item.correct_answer]}`;
          } else {
            correctAnswerDisplay = item.correct_answer;
          }
        }

        return (
          <div key={item.question_id} className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <p className="font-semibold text-slate-500">Question {index + 1} <span className="font-normal text-slate-400">(Max {item.marks} Marks)</span></p>
              <p className="text-lg text-slate-800 mt-1">{item.question_text}</p>
            </div>
            <div className="p-6 bg-slate-100">
              <div className="mb-4">
                <p className="font-semibold text-slate-700 mb-2">Student's Answer:</p>
                <p className="text-slate-800 bg-blue-50 p-3 rounded-lg border border-blue-100">{item.answer_text || "Not answered"}</p>
              </div>

              {/* ★★★ NEW ELEMENT: Display the correct answer ★★★ */}
              <div className="mb-4">
                <p className="font-semibold text-green-700 mb-2">Correct Answer:</p>
                <p className="text-green-800 bg-green-50 p-3 rounded-lg border border-green-100">{correctAnswerDisplay}</p>
              </div>

              <div>
                <label htmlFor={`gradeInput-${item.question_id}`} className="block mb-2 font-semibold text-slate-700">Award Marks</label>
                <input 
                  id={`gradeInput-${item.question_id}`} type="number" min="0" max={item.marks} step="0.5"
                  placeholder={`Enter marks out of ${item.marks}`} 
                  className="w-full sm:w-1/2 md:w-1/3 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2.5 rounded-lg text-sm" 
                  value={gradedAnswers[item.question_id] ?? ""} 
                  onChange={(e) => handleGradeChange(item.question_id, e.target.value)} 
                />
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex justify-end flex-col-reverse sm:flex-row sm:space-x-4 gap-3 sm:gap-0 pt-4">
        <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md disabled:opacity-50" onClick={submitGrade} disabled={isSubmittingGrade}>
          {isSubmittingGrade ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Submitting...</div>) : ("Submit Grades")}
        </button>
        <button className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-lg font-bold transition-all" onClick={onFinish}>Cancel</button>
      </div>
    </div>
  );
};

export default TeacherAdminExamsScreen;
