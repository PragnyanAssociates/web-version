// 📂 File: src/screens/homework/StudentHomeworkScreen.jsx (UPDATED WEB VERSION WITH DELETE FUNCTIONALITY)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
// ★★★ 1. IMPORT apiClient AND SERVER_URL, REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { SERVER_URL } from '../../apiConfig';
import { FaBook, FaCalendarAlt, FaCalendarCheck, FaPaperclip, FaUpload, FaCheck, FaCheckCircle, FaHourglassHalf, FaGraduationCap, FaChevronDown, FaTimesCircle, FaTrash } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdAssignment, MdArrowBack, MdInfoOutline, MdDelete } from 'react-icons/md';


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



const StudentHomeworkScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();


  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  
  // --- State for Homework ---
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // ★ This state will now handle loading for both submitting and deleting
  const [isSubmitting, setIsSubmitting] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Completed'


  // --- Hooks for Header Functionality ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
        if (!token) {
            setUnreadCount?.(0);
            return;
        }
        try {
            // ★★★ 2. USE apiClient FOR NOTIFICATIONS ★★★
            const response = await apiClient.get('/notifications');
            const data = response.data;
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
          if (!user?.id) {
              setLoadingProfile(false);
              return;
          }
          setLoadingProfile(true);
          try {
              // ★★★ 3. USE apiClient FOR PROFILE ★★★
              const response = await apiClient.get(`/profiles/${user.id}`);
              setProfile(response.data);
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


  // --- Helper Functions ---
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


  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // ★★★ 4. USE apiClient FOR ASSIGNMENTS - MATCHES MOBILE VERSION ★★★
      const response = await apiClient.get(`/homework/student/${user.id}/${user.class_group}`);
      let data = response.data;
      
      // ★★★ 5. MATCH MOBILE SORTING LOGIC ★★★
      data.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      });
      setAssignments(data);
      // Automatically select the first assignment in the list
      if (data.length > 0) {
        setSelectedAssignmentId(data[0].id);
      } else {
        setSelectedAssignmentId(null);
      }
    } catch (error) {
      // ★★★ 6. MATCH MOBILE ERROR HANDLING ★★★
      alert(error.response?.data?.message || "Failed to fetch assignments.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);


  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);


  const handleSubmission = async (assignmentId) => {
    if (!user) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        console.log('User closed picker without selecting a file.');
        return;
      }
      setIsSubmitting(assignmentId);
      const formData = new FormData();
      formData.append('student_id', user.id);
      formData.append('submission', file);
      try {
        // ★★★ 7. USE apiClient FOR FILE UPLOAD - MATCHES MOBILE VERSION ★★★
        await apiClient.post(`/homework/submit/${assignmentId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Homework submitted!");
        fetchAssignments();
      } catch (error) {
        console.error("Submission Error:", error);
        alert(error.response?.data?.message || "Could not submit file.");
      } finally {
        setIsSubmitting(null);
      }
    };
    input.click();
  };

  // ★ ADD a function to handle deleting a submission - MATCHES MOBILE VERSION
  const handleDeleteSubmission = async (submissionId, assignmentId) => {
    if (!user) return;
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your submission? This action cannot be undone."
    );
    
    if (confirmDelete) {
      setIsSubmitting(assignmentId); // Reuse loading state for visual feedback
      try {
        // The body for a DELETE request in axios is passed in a 'data' object
        await apiClient.delete(`/homework/submission/${submissionId}`, {
          data: { student_id: user.id }
        });
        alert("Your submission has been deleted.");
        fetchAssignments(); // Refresh the list to show the "Submit" button again
      } catch (error) {
        alert(error.response?.data?.message || "Could not delete submission.");
      } finally {
        setIsSubmitting(null);
      }
    }
  };


  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(item => {
        const isCompleted = !!item.submission_id;
        if (filter === 'Pending') return !isCompleted;
        if (filter === 'Completed') return isCompleted;
        return true;
      })
      .filter(item => {
        const lowerQuery = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          item.subject.toLowerCase().includes(lowerQuery)
        );
      });
  }, [assignments, filter, query]);
  
  const selectedAssignment = useMemo(() => {
    return assignments.find(a => a.id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);


  useEffect(() => {
    if (filteredAssignments.length > 0 && !filteredAssignments.find(a => a.id === selectedAssignmentId)) {
        setSelectedAssignmentId(filteredAssignments[0].id);
    } else if (filteredAssignments.length === 0) {
        setSelectedAssignmentId(null);
    }
  }, [filteredAssignments, selectedAssignmentId]);
  
  return (
    <div className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">My Assignments & Homework</h1>
                <p className="text-xs sm:text-sm text-slate-600">View and submit your homework</p>
            </div>
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="relative">
                <input
                  id="module-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search assignments..."
                  className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition" type="button" title="Home">
                  <HomeIcon />
                  <span className="hidden md:inline">Home</span>
                </button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition" type="button" title="Calendar">
                  <CalendarIcon />
                  <span className="hidden md:inline">Calendar</span>
                </button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition" type="button" title="Profile">
                  <UserIcon />
                  <span className="hidden md:inline">Profile</span>
                </button>
              </div>
              <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />
              <div className="flex items-center gap-2 sm:gap-3">
              
<ProfileAvatar />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                  <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Exit</span>
                </button>
                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
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
          <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors" title="Back to Dashboard">
            <MdArrowBack />
            <span>Back to Dashboard</span>
          </button>
        </div>


        {/* --- Main Content Area --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Left Panel: Assignment List */}
            <div className="lg:col-span-1 xl:col-span-1 bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 h-full">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-slate-800">All Assignments</h2>
                    <div className="mt-3 flex items-center gap-2">
                        {['All', 'Pending', 'Completed'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === f ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-200 hover:bg-slate-300/70 text-slate-600'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-6 text-center text-slate-500">Loading...</div>
                    ) : filteredAssignments.length > 0 ? (
                        <ul>
                            {filteredAssignments.map(item => (
                                <AssignmentListItem key={item.id} item={item} isSelected={selectedAssignmentId === item.id} onSelect={() => setSelectedAssignmentId(item.id)} />
                            ))}
                        </ul>
                    ) : (
                        <div className="p-6 text-center text-slate-500">No assignments found.</div>
                    )}
                </div>
            </div>


            {/* Right Panel: Assignment Details */}
            <div className="lg:col-span-2 xl:col-span-3">
                {isLoading ? (
                    <div className="flex items-center justify-center bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 p-20">
                        <AiOutlineLoading3Quarters className="h-10 w-10 text-blue-500 animate-spin" />
                    </div>
                ) : selectedAssignment ? (
                    <AssignmentDetail 
                      assignment={selectedAssignment} 
                      onSubmit={handleSubmission} 
                      onDelete={handleDeleteSubmission}
                      isSubmitting={isSubmitting === selectedAssignment.id} 
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 p-10 h-full">
                        <MdAssignment size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700">No Assignments</h3>
                        <p className="text-slate-500 mt-1">Your homework will appear here when assigned.</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};


const AssignmentListItem = ({ item, isSelected, onSelect }) => {
    const dueDate = new Date(item.due_date);
    const isOverdue = !item.submission_id && dueDate < new Date();
    const isCompleted = !!item.submission_id;


    const statusDotColor = isCompleted ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-orange-500';


    return (
        <li className="border-b border-slate-200/80 last:border-b-0">
            <button onClick={onSelect} className={`w-full text-left p-4 transition-colors duration-200 ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-100'}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <p className={`font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{item.title}</p>
                        <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                            Due: {dueDate.toLocaleDateString('en-GB')}
                        </p>
                    </div>
                    <div className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full ${statusDotColor}`} title={isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}></div>
                </div>
            </button>
        </li>
    );
};


// ★ UPDATE AssignmentDetail to accept 'onDelete' and render the correct button
const AssignmentDetail = ({ assignment, onSubmit, onDelete, isSubmitting }) => {
    if (!assignment) return null;


    const dueDate = new Date(assignment.due_date);
    const isOverdue = !assignment.submission_id && dueDate < new Date();


    const getStatusInfo = () => {
        const statusText = assignment.submission_id ? (assignment.status || 'Submitted') : 'Pending';
        if (isOverdue) return { text: 'Overdue', textColor: 'text-red-700', bgColor: 'bg-red-100', icon: <FaTimesCircle /> };
        switch (statusText) {
            case 'Graded': return { text: 'Graded', textColor: 'text-blue-700', bgColor: 'bg-blue-100', icon: <FaCheckCircle /> };
            case 'Submitted': return { text: 'Submitted', textColor: 'text-green-700', bgColor: 'bg-green-100', icon: <FaCheck /> };
            default: return { text: 'Pending', textColor: 'text-orange-700', bgColor: 'bg-orange-100', icon: <FaHourglassHalf /> };
        }
    };
    
    const status = getStatusInfo();
    const handleViewAttachment = () => {
        // ★★★ 8. USE SERVER_URL FOR ATTACHMENTS - MATCHES MOBILE VERSION ★★★
        if (assignment.attachment_path) window.open(`${SERVER_URL}${assignment.attachment_path}`, '_blank');
    };


    return (
        <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200/80">
            {/* Header */}
            <div className="p-5 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-2xl font-bold text-slate-800">{assignment.title}</h2>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${status.bgColor} ${status.textColor}`}>
                        {status.icon}
                        <span>{status.text}</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 mt-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><FaBook className="text-slate-400" /> <span>{assignment.subject}</span></div>
                    <div className={`flex items-center gap-2 font-semibold ${isOverdue ? 'text-red-600' : ''}`}><FaCalendarAlt className="text-slate-400" /> <span>Due: {dueDate.toLocaleDateString('en-GB')}</span></div>
                </div>
            </div>


            {/* Body */}
            <div className="p-5 space-y-6">
                {assignment.description && (
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Description</h4>
                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-100 p-4 rounded-md border border-slate-200 whitespace-pre-wrap">{assignment.description}</p>
                    </div>
                )}


                {status.text === 'Graded' && assignment.grade && (
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Grade & Feedback</h4>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                             <DetailRow icon={<FaGraduationCap className="text-blue-500" />} label="Grade" value={assignment.grade} />
                             {assignment.remarks && (
                                <div className="mt-3 pt-3 border-t border-blue-200/50">
                                    <p className="text-sm font-semibold text-blue-800 mb-1">Teacher's Feedback:</p>
                                    <p className="text-slate-700 text-sm italic">"{assignment.remarks}"</p>
                                </div>
                             )}
                        </div>
                    </div>
                )}
                
                {assignment.submitted_at && (
                    <div>
                         <h4 className="font-semibold text-slate-700 mb-2">Submission Details</h4>
                         <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <DetailRow icon={<FaCalendarCheck className="text-green-500" />} label="Submitted On" value={new Date(assignment.submitted_at).toLocaleString('en-GB')} />
                        </div>
                    </div>
                )}
            </div>


            {/* Footer / Actions */}
            <div className="p-5 bg-slate-100/70 border-t border-slate-200 rounded-b-lg flex flex-col sm:flex-row justify-end items-center gap-3">
                 {assignment.attachment_path && (
                    <button onClick={handleViewAttachment} className="w-full sm:w-auto flex items-center justify-center text-blue-600 bg-blue-100 hover:bg-blue-200 px-4 py-2.5 rounded-md font-semibold transition-all duration-200 text-sm">
                        <FaPaperclip className="mr-2" />
                        View Attachment
                    </button>
                )}

                {/* ★ MODIFY BUTTON LOGIC to show submit, delete, or nothing - MATCHES MOBILE VERSION */}
                {assignment.submission_id && status.text !== 'Graded' ? (
                    // If submitted but NOT graded, show the delete button
                    <button 
                      onClick={() => onDelete(assignment.submission_id, assignment.id)} 
                      disabled={isSubmitting} 
                      className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 rounded-md font-semibold transition-all duration-200 text-sm ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    >
                        {isSubmitting ? (
                          <>
                            <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <MdDelete className="mr-2" />
                            Delete Submission
                          </>
                        )}
                    </button>
                ) : !assignment.submission_id && (
                    // If not submitted, show the submit button
                    <button 
                      onClick={() => onSubmit(assignment.id)} 
                      disabled={isSubmitting} 
                      className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 rounded-md font-semibold transition-all duration-200 text-sm ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                        {isSubmitting ? (
                          <>
                            <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload className="mr-2" />
                            Submit Homework
                          </>
                        )}
                    </button>
                )}
                {/* If the assignment is graded, no action button will appear, which is correct. */}
            </div>
        </div>
    );
};


const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xl">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm text-slate-800 font-medium">{value}</p>
        </div>
    </div>
);


export default StudentHomeworkScreen;
