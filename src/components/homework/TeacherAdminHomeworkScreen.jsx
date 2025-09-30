import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
import { SERVER_URL } from '../../apiConfig';
import { FaEdit, FaTrash, FaPlus, FaPaperclip, FaArrowLeft, FaCloudDownloadAlt, FaStar, FaEye } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdSchool, MdAssignment, MdGrade } from 'react-icons/md';
import apiClient from '../../api/client';

// --- Icon Components for Header ---
function UserIcon() {
    return ( <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" strokeLinecap="round" /><path d="M5.5 21a6.5 6.5 0 0113 0" strokeLinecap="round" /></svg> );
}
function HomeIcon() {
    return ( <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 10v9a1 1 0 001 1h4m8-10v9a1 1 0 01-1 1h-4m-6 0h6" strokeLinecap="round" strokeLinejoin="round" /></svg> );
}
function CalendarIcon() {
    return ( <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" /><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" /><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" /></svg> );
}
function BellIcon() {
    return ( <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> );
}

// --- Reusable Application Header ---
const AppHeader = ({ title, subtitle }) => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) return;
            try {
                // ★★★ FIXED: Use apiClient like mobile version ★★★
                const res = await apiClient.get('/notifications');
                const count = Array.isArray(res.data) ? res.data.filter((n) => !n.is_read).length : 0;
                setLocalUnreadCount(count);
                if (setUnreadCount) setUnreadCount(count);
            } catch (error) { 
                console.error("Failed to fetch notifications count", error); 
            }
        }
        fetchUnreadNotifications();
        const id = setInterval(fetchUnreadNotifications, 60000);
        return () => clearInterval(id);
    }, [token, setUnreadCount]);

    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                // ★★★ FIXED: Use apiClient like mobile version ★★★
                const res = await apiClient.get(`/profiles/${user.id}`);
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                setProfile({ full_name: user.full_name || "User", role: user.role || "user" });
            }
        }
        fetchProfile();
    }, [user]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) { logout(); navigate("/"); }
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
                            <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                            <div className="w-px bg-slate-200" />
                            <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                            <div className="w-px bg-slate-200" />
                            <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
                        </div>
                        <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" />
                        <div className="flex items-center gap-2 sm:gap-3">
                            <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                            <div className="hidden sm:flex flex-col"><span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || "User"}</span><span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span></div>
                            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
                            <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" title="Notifications" type="button">
                                <BellIcon />
                                {unreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

// --- Main Screen Component ---
const TeacherAdminHomeworkScreen = () => {
    const [view, setView] = useState('assignments');
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const viewSubmissions = (assignment) => {
        setSelectedAssignment(assignment);
        setView('submissions');
    };
    const backToAssignments = () => {
        setSelectedAssignment(null);
        setView('assignments');
    };

    const headerProps = {
        assignments: { title: "Homework Management", subtitle: "Create, view, and manage assignments" },
        submissions: { title: "Submissions & Grading", subtitle: `Reviewing work for: ${selectedAssignment?.title || ''}` }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader {...headerProps[view]} />
            {view === 'assignments' && <AssignmentList onSelectAssignment={viewSubmissions} />}
            {view === 'submissions' && selectedAssignment && <SubmissionList assignment={selectedAssignment} onBack={backToAssignments} />}
        </div>
    );
};

// --- Assignment List Component ---
const AssignmentList = ({ onSelectAssignment }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [studentClasses, setStudentClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const initialAssignmentState = { title: '', description: '', due_date: '' };
    const [newAssignment, setNewAssignment] = useState(initialAssignmentState);
    const [attachment, setAttachment] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin': return '/AdminDashboard';
            case 'teacher': return '/TeacherDashboard';
            case 'student': return '/StudentDashboard';
            default: return '/';
        }
    };

    const fetchTeacherAssignments = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // ★★★ FIXED: Use apiClient like mobile version ★★★
            const response = await apiClient.get(`/homework/teacher/${user.id}`);
            setAssignments(response.data);
        } catch (e) { 
            alert(`Error: ${e.response?.data?.message || "Failed to fetch assignment history."}`); 
        } finally { 
            setIsLoading(false); 
        }
    }, [user]);

    const fetchStudentClasses = async () => { 
        try { 
            // ★★★ FIXED: Use apiClient like mobile version ★★★
            const response = await apiClient.get('/student-classes'); 
            setStudentClasses(response.data); 
        } catch (e) { 
            console.error("Error fetching student classes:", e); 
        } 
    };

    useEffect(() => { 
        fetchTeacherAssignments(); 
        fetchStudentClasses(); 
    }, [fetchTeacherAssignments]);

    const handleClassChange = async (classGroup) => {
        setSelectedClass(classGroup); 
        setSubjects([]); 
        setSelectedSubject('');
        if (classGroup) {
            try {
                // ★★★ FIXED: Use apiClient like mobile version ★★★
                const response = await apiClient.get(`/subjects-for-class/${classGroup}`);
                const data = response.data;
                setSubjects(data); 
                return data;
            } catch (e) { 
                console.error(e); 
                return []; 
            }
        } 
        return [];
    };

    const openCreateModal = () => { 
        setEditingAssignment(null); 
        setNewAssignment(initialAssignmentState); 
        setSelectedClass(''); 
        setSelectedSubject(''); 
        setSubjects([]); 
        setAttachment(null); 
        setIsModalVisible(true); 
    };

    const openEditModal = async (assignment) => {
        setEditingAssignment(assignment);
        const date = new Date(assignment.due_date);
        const formattedDate = date.toISOString().split('T')[0];
        setNewAssignment({ title: assignment.title, description: assignment.description, due_date: formattedDate });
        setAttachment(assignment.attachment_path ? { name: assignment.attachment_path.split('/').pop() } : null);
        const fetchedSubjects = await handleClassChange(assignment.class_group);
        if (fetchedSubjects.includes(assignment.subject)) { setSelectedSubject(assignment.subject); }
        setIsModalVisible(true);
    };

    const handleDelete = (assignment) => {
        if (window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
            // ★★★ FIXED: Use apiClient like mobile version ★★★
            apiClient.delete(`/homework/${assignment.id}`)
                .then(() => {
                    alert("Success: Assignment deleted.");
                    fetchTeacherAssignments();
                })
                .catch((e) => {
                    alert(`Error: ${e.response?.data?.message || 'Failed to delete assignment.'}`);
                });
        }
    };

    const handleSave = async () => {
        if (!user || !selectedClass || !selectedSubject || !newAssignment.title || !newAssignment.due_date) {
            return alert("Validation Error: Title, Class, Subject, and Due Date are required.");
        }
        setIsSaving(true);
        
        const formData = new FormData();
        formData.append('title', newAssignment.title);
        formData.append('description', newAssignment.description || '');
        formData.append('due_date', newAssignment.due_date);
        formData.append('class_group', selectedClass);
        formData.append('subject', selectedSubject);
        
        if (!editingAssignment) { 
            formData.append('teacher_id', user.id); 
        }
        
        // ★★★ FIXED: Handle attachment like mobile version ★★★
        if (attachment && attachment.file) { 
            formData.append('attachment', attachment.file); 
        } else if (editingAssignment && editingAssignment.attachment_path) { 
            formData.append('existing_attachment_path', editingAssignment.attachment_path); 
        }

        try {
            // ★★★ FIXED: Use apiClient like mobile version ★★★
            if (editingAssignment) {
                await apiClient.post(`/homework/${editingAssignment.id}`, formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' } 
                });
            } else {
                await apiClient.post('/homework', formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' } 
                });
            }
            alert(`Success: Assignment ${editingAssignment ? 'updated' : 'created'}!`);
            setIsModalVisible(false);
            fetchTeacherAssignments();
        } catch (e) {
            alert(`Error: ${e.response?.data?.message || "An error occurred."}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <main className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></main>;
    }

    return (
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
                <button 
                    onClick={() => navigate(getDefaultDashboardRoute())} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back to Dashboard"
                >
                    <FaArrowLeft />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">My Assignments</h2>
                    <p className="text-sm text-slate-600">A list of all homework you have created.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"><FaPlus className="mr-2" />Create Homework</button>
            </div>

            { !assignments.length ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <MdAssignment size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No assignments yet</h3>
                    <p className="text-slate-500">Click "Create Homework" to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-slate-600 text-left">Assignment</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 text-left">Class</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 text-left">Due Date</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 text-left">Submissions</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map(item => (
                                    <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-semibold text-slate-800 align-top">{item.title}</td>
                                        <td className="px-5 py-4 text-slate-600 align-top">{item.class_group} - {item.subject}</td>
                                        <td className="px-5 py-4 text-slate-600 align-top">{new Date(item.due_date).toLocaleDateString()}</td>
                                        <td className="px-5 py-4 font-medium text-blue-600 align-top">{item.submission_count}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end items-center gap-2">
                                                <button 
                                                    onClick={() => onSelectAssignment(item)} 
                                                    className="flex items-center justify-center gap-2 border border-blue-600/50 text-blue-600 hover:bg-blue-50 hover:border-blue-600 px-4 py-2 rounded-md font-semibold transition-all text-xs">
                                                    <FaEye />
                                                    <span>Submissions</span>
                                                </button>
                                                <button onClick={() => openEditModal(item)} className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-full transition-colors" title="Edit"><FaEdit /></button>
                                                <button onClick={() => handleDelete(item)} className="h-9 w-9 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Delete"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalVisible && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                            <div className="space-y-5">
                                <div><label className="block text-slate-700 font-semibold mb-2">Class *</label><select value={selectedClass} onChange={e => handleClassChange(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 shadow-inner"><option value="">-- Select a class --</option>{studentClasses.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label className="block text-slate-700 font-semibold mb-2">Subject *</label><select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!subjects.length} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 shadow-inner disabled:bg-slate-100"><option value="">{subjects.length > 0 ? "-- Select a subject --" : "Select a class first"}</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                <div><label className="block text-slate-700 font-semibold mb-2">Title *</label><input placeholder="e.g., Chapter 5 Exercise" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 shadow-inner" /></div>
                                <div><label className="block text-slate-700 font-semibold mb-2">Description (Optional)</label><textarea rows="3" placeholder="Instructions for students" value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 shadow-inner resize-none" /></div>
                                <div><label className="block text-slate-700 font-semibold mb-2">Due Date *</label><input type="date" value={newAssignment.due_date} onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 shadow-inner" /></div>
                                <div><button onClick={() => document.getElementById('file-input').click()} className="flex items-center bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold transition-all"><FaPaperclip className="mr-2" />Attach File</button><input id="file-input" type="file" className="hidden" onChange={e => e.target.files[0] && setAttachment({ name: e.target.files[0].name, file: e.target.files[0] })} />{attachment && <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-md">Selected: {attachment.name}</p>}</div>
                            </div>
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t"><button onClick={() => setIsModalVisible(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 font-semibold transition-all">Cancel</button><button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center gap-2">{isSaving ? <><AiOutlineLoading3Quarters className="animate-spin" />Saving...</> : (editingAssignment ? 'Save Changes' : 'Create')}</button></div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

// --- Submission List Component ---
const SubmissionList = ({ assignment, onBack }) => {
    const [studentRoster, setStudentRoster] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: '', remarks: '' });
    const [isGrading, setIsGrading] = useState(false);

    const fetchStudentRoster = useCallback(async () => {
        setIsLoading(true);
        try {
            // ★★★ FIXED: Use apiClient like mobile version ★★★
            const response = await apiClient.get(`/homework/submissions/${assignment.id}`);
            setStudentRoster(response.data);
        } catch (e) { 
            alert(`Error: ${e.response?.data?.message || "Failed to fetch student roster."}`); 
        } finally { 
            setIsLoading(false); 
        }
    }, [assignment.id]);

    useEffect(() => { fetchStudentRoster(); }, [fetchStudentRoster]);

    const openGradeModal = (rosterItem) => {
        setSelectedSubmission(rosterItem);
        setGradeData({ grade: rosterItem.grade || '', remarks: rosterItem.remarks || '' });
    };

    const handleGrade = async () => {
        if (!selectedSubmission || !selectedSubmission.submission_id) return;
        setIsGrading(true);
        try {
            // ★★★ FIXED: Use apiClient like mobile version ★★★
            await apiClient.put(`/homework/grade/${selectedSubmission.submission_id}`, gradeData);
            alert("Success: Submission graded!");
            setSelectedSubmission(null);
            fetchStudentRoster();
        } catch (e) { 
            alert(`Error: ${e.response?.data?.message || "An error occurred."}`); 
        } finally { 
            setIsGrading(false); 
        }
    };
    
    if (isLoading) {
        return <main className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></main>;
    }

    return (
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
                 <button 
                    onClick={onBack} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back to Assignments"
                >
                    <FaArrowLeft />
                    <span>Back to Assignments</span>
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Submissions for: "{assignment.title}"</h2>
                    <p className="text-sm text-slate-600">Review and grade student work</p>
                </div>
            </div>

            {!studentRoster.length ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <MdGrade size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No students found</h3>
                    <p className="text-slate-500">There are no students in this class group.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Student</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Grade</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentRoster.map(item => (
                                    <tr key={item?.student_id?.toString() || Math.random()} className="border-b border-slate-200/60 hover:bg-slate-50/70">
                                        <td className="px-5 py-3 font-medium text-slate-800">{item.student_name}</td>
                                        <td className="px-5 py-3 text-slate-600">
                                            {item.submission_id ? (
                                                <div>
                                                    <div>Submitted: {new Date(item.submitted_at).toLocaleString()}</div>
                                                    <div className="text-sm text-slate-500">Status: {item.status}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Not Submitted</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            {item.grade ? (
                                                <span className="font-semibold text-green-600">{item.grade}</span>
                                            ) : (
                                                <span className="text-slate-400">Not Graded</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-end items-center gap-3">
                                                {item.submission_id && (
                                                    <>
                                                        {/* ★★★ FIXED: Use SERVER_URL like mobile version ★★★ */}
                                                        <a href={`${SERVER_URL}${item.submission_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline font-semibold">
                                                            <FaCloudDownloadAlt />
                                                            <span>View Submission</span>
                                                        </a>
                                                        <button onClick={() => openGradeModal(item)} className="flex items-center gap-1.5 text-green-600 hover:underline font-semibold">
                                                            <FaStar />
                                                            <span>{item.grade ? 'Update Grade' : 'Grade'}</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-md">
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Grade Submission for {selectedSubmission?.student_name}</h2>
                            <div className="space-y-5">
                                <div><label className="block text-slate-700 font-semibold mb-2">Grade</label><input placeholder="e.g., A+, 95/100" value={gradeData.grade} onChange={e => setGradeData({ ...gradeData, grade: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 shadow-inner" /></div>
                                <div><label className="block text-slate-700 font-semibold mb-2">Remarks / Feedback</label><textarea rows="3" placeholder="Provide feedback for the student" value={gradeData.remarks} onChange={e => setGradeData({ ...gradeData, remarks: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 shadow-inner resize-none" /></div>
                            </div>
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                                <button onClick={() => setSelectedSubmission(null)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 font-semibold transition-all">Cancel</button>
                                <button onClick={handleGrade} disabled={isGrading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center gap-2">{isGrading ? <><AiOutlineLoading3Quarters className="animate-spin" />Submitting...</> : 'Submit Grade'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default TeacherAdminHomeworkScreen;
