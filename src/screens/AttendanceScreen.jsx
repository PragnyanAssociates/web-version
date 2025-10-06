"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext.tsx';
import { MdAccountCircle, MdCancel, MdCheckCircle, MdArrowBack, MdBarChart, MdPerson, MdEventAvailable, MdEventBusy, MdCheck } from 'react-icons/md';
import apiClient from '../api/client';

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


// --- Helper UI Components ---
const SummaryCard = ({ label, value, icon, colorClass }) => (
    <div className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-200 min-w-[120px]">
        <div className={`mr-4 p-3 rounded-full bg-opacity-10 ${colorClass.bg} ${colorClass.text}`}>
            {icon}
        </div>
        <div>
            <div className={`text-2xl font-bold ${colorClass.text}`}>{value}</div>
            <div className="text-sm text-slate-500 font-medium">{label}</div>
        </div>
    </div>
);

const Spinner = ({ sizeClass = 'h-8 w-8', colorClass = 'border-blue-600', borderClass = 'border-4' }) => (
    <div className="flex items-center justify-center p-4">
        <div className={`${sizeClass} ${borderClass} border-t-transparent rounded-full animate-spin ${colorClass}`} />
    </div>
);

const StyledSelect = ({ value, onChange, disabled, children }) => (
    <div className="relative w-full">
        <select
            className="w-full bg-slate-50 border border-slate-300 rounded-lg h-12 px-4 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            value={value}
            onChange={onChange}
            disabled={disabled}
        >
            {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>
);

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// --- Main Component with Fixed Navigation ---
const AttendanceScreen = ({ route }) => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth() || {};
    const navigate = useNavigate();
    const location = useLocation();

    // ★★★ FIXED: Unify parameter source for web compatibility ★★★
    const params = route?.params || location?.state || null;

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);

    // --- Hooks for Header ---
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) { setUnreadCount?.(0); return; }
            try {
                const res = await apiClient.get('/notifications');
                const count = Array.isArray(res.data) ? res.data.filter((n) => !n.is_read).length : 0;
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
            if (!user?.id) { setLoadingProfile(false); return; }
            setLoadingProfile(true);
            try {
                const res = await apiClient.get(`/profiles/${user.id}`);
                setProfile(res.data);
            } catch (error) {
                setProfile({ 
                    id: user.id, 
                    username: user.username || "Unknown", 
                    full_name: user.full_name || "User", 
                    role: user.role || "user" 
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
        return "/";
    };

    const getHeaderContent = () => {
        if (!user) return { title: "Attendance", subtitle: "Please log in" };
        switch (user.role) {
            case 'student': return { title: "My Attendance Report", subtitle: "View your daily, monthly, and overall attendance" };
            case 'teacher':
                return params
                    ? { title: "Mark Live Attendance", subtitle: `${params.class_group} - ${params.subject_name}` }
                    : { title: "Teacher Attendance Summary", subtitle: "Review attendance records for your classes" };
            case 'admin': return { title: "Admin Attendance Dashboard", subtitle: "Monitor attendance across all classes" };
            default: return { title: "Attendance", subtitle: "" };
        }
    };

    const renderContent = () => {
        if (!user) {
            return <div className="p-6 text-center text-slate-600">User not found. Please log in again.</div>;
        }
        switch (user.role) {
            case 'teacher':
                // ★★★ FIXED: Pass params in route object format ★★★
                return params ? <TeacherLiveAttendanceView route={{ params }} teacher={user} /> : <TeacherSummaryView teacher={user} />;
            case 'student':
                return <StudentAttendanceView student={user} />;
            case 'admin':
                return <AdminAttendanceView />;
            default:
                return <div className="p-6 text-center text-slate-600">No attendance view available for your role.</div>;
        }
    };

    const { title, subtitle } = getHeaderContent();

    return (
        <div className="min-h-screen bg-slate-50">
             <header className="border-b border-slate-200 bg-slate-100">
 <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800 truncate">{title}</h1>
                            <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
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

// --- Student Attendance View ---
const StudentAttendanceView = ({ student }) => {
    const [viewMode, setViewMode] = useState('daily');
    const [data, setData] = useState({ summary: {}, history: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!student?.id) return;
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/attendance/my-history/${student.id}?viewMode=${viewMode}`);
                const historyWithPeriod = response.data.history.map(item => ({
                    ...item,
                    period_time: `Period ${item.period_number}` // Simplified for web
                }));
                setData({ ...response.data, history: historyWithPeriod });
            } catch (error) {
                window.alert(`Error: ${error.response?.data?.message || 'Could not load your attendance history.'}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [student?.id, viewMode]);

    const percentage = useMemo(() => {
        if (!data?.summary?.total_days) return '0.0';
        return ((data.summary.present_days / data.summary.total_days) * 100).toFixed(1);
    }, [data.summary]);

    if (isLoading) {
        return <div className="flex justify-center items-center py-20"><Spinner /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex justify-center space-x-2">
                {['daily', 'monthly', 'overall'].map(mode => (
                    <button
                        key={mode}
                        className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${viewMode === mode ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                        onClick={() => setViewMode(mode)}
                    >
                        {capitalize(mode)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard label="Overall" value={`${percentage}%`} icon={<MdBarChart size={24} />} colorClass={{ text: 'text-blue-600', bg: 'bg-blue-100' }} />
                <SummaryCard label="Present" value={data?.summary?.present_days || 0} icon={<MdEventAvailable size={24} />} colorClass={{ text: 'text-green-600', bg: 'bg-green-100' }} />
                <SummaryCard label="Absent" value={data?.summary?.absent_days || 0} icon={<MdEventBusy size={24} />} colorClass={{ text: 'text-red-600', bg: 'bg-red-100' }} />
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4 text-slate-800">Detailed History ({capitalize(viewMode)})</h2>
                {data.history.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">No records found for this period.</div>
                ) : (
                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                        <div className="divide-y divide-slate-200">
                            {data.history.map((item, index) => {
                                const isPresent = item.status === 'Present';
                                return (
                                    <div key={`${item.attendance_date}-${item.period_number}-${index}`} className="flex items-center p-4">
                                        <div className="mr-4">{isPresent ? <MdCheckCircle size={24} className="text-green-500" /> : <MdCancel size={24} className="text-red-500" />}</div>
                                        <div className="flex-1">
                                            <p className="text-base font-semibold text-slate-800">{item.subject_name}</p>
                                            <p className="text-xs mt-1 text-slate-500">{new Date(item.attendance_date).toDateString()} (Period {item.period_number})</p>
                                        </div>
                                        <div className={`text-sm font-bold ${isPresent ? 'text-green-600' : 'text-red-600'}`}>{item.status}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Shared Attendance Report Component ---
const AttendanceReportCard = ({ details }) => (
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-200">
            {details.map((item) => {
                const studentPercentage = item.total_marked_days > 0 ? (item.present_count / item.total_marked_days) * 100 : 0;
                const percentageColor = studentPercentage >= 75 ? 'bg-green-500' : studentPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                    <div key={item.student_id} className="p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-base font-semibold text-slate-800">{item.full_name}</p>
                                <p className="text-xs mt-1 text-slate-500">Present: {item.present_count} / {item.total_marked_days}</p>
                            </div>
                            <div className="text-lg font-bold text-slate-700">{studentPercentage.toFixed(0)}%</div>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className={`${percentageColor} h-full rounded-full`} style={{ width: `${studentPercentage}%` }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

// --- Teacher Summary View ---
const TeacherSummaryView = ({ teacher }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSummary = async (classGroup, subjectName) => {
        if (!teacher?.id || !classGroup || !subjectName) { 
            setSummaryData(null); 
            setIsLoading(false); 
            return; 
        }
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/attendance/teacher-summary?teacherId=${teacher.id}&classGroup=${classGroup}&subjectName=${subjectName}`);
            setSummaryData(response.data);
        } catch (error) {
            console.error('Fetch Summary Error:', error);
            window.alert(`Error: ${error.response?.data?.message || 'Could not retrieve attendance data.'}`);
            setSummaryData(null);
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!teacher?.id) { setIsLoading(false); return; }
            try {
                const response = await apiClient.get(`/teacher-assignments/${teacher.id}`);
                const data = response.data;
                setAssignments(data);
                if (data && data.length > 0) {
                    const firstClass = data[0].class_group;
                    const firstSubject = data[0].subject_name;
                    setSelectedClass(firstClass);
                    setSelectedSubject(firstSubject);
                    await fetchSummary(firstClass, firstSubject);
                } else { 
                    setIsLoading(false); 
                }
            } catch (error) {
                console.error('Fetch Assignments Error:', error);
                window.alert(`Error: ${error.response?.data?.message || 'Could not fetch your class assignments.'}`);
                setIsLoading(false);
            }
        };
        fetchAssignments();
    }, [teacher?.id]);

    const uniqueClasses = useMemo(() => [...new Set(assignments.map((a) => a.class_group))], [assignments]);
    const subjectsForSelectedClass = useMemo(() => assignments.filter((a) => a.class_group === selectedClass).map((a) => a.subject_name), [assignments, selectedClass]);

    const overallPercentage = useMemo(() => {
        if (!summaryData?.overallSummary?.total_classes) return 0;
        return (summaryData.overallSummary.total_present / summaryData.overallSummary.total_classes) * 100;
    }, [summaryData]);

    const handleClassChange = (newClass) => {
        setSelectedClass(newClass);
        const newSubjects = assignments.filter((a) => a.class_group === newClass).map((a) => a.subject_name);
        const newSubject = newSubjects.length > 0 ? newSubjects[0] : '';
        setSelectedSubject(newSubject);
        fetchSummary(newClass, newSubject);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-64">
                    <StyledSelect value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} disabled={uniqueClasses.length === 0}>
                        {uniqueClasses.length > 0 ? (uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)) : (<option value="">No classes assigned</option>)}
                    </StyledSelect>
                </div>
                <div className="w-full sm:w-64">
                    <StyledSelect value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); fetchSummary(selectedClass, e.target.value); }} disabled={subjectsForSelectedClass.length === 0}>
                        {subjectsForSelectedClass.length > 0 ? (subjectsForSelectedClass.map((s) => <option key={s} value={s}>{s}</option>)) : (<option value="">No subjects found</option>)}
                    </StyledSelect>
                </div>
            </div>

            {isLoading ? (<div className="flex justify-center items-center py-20"><Spinner /></div>) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SummaryCard label="Overall" value={`${overallPercentage.toFixed(1)}%`} icon={<MdBarChart size={24} />} colorClass={{ text: 'text-blue-600', bg: 'bg-blue-100' }} />
                        <SummaryCard label="Total Present" value={summaryData?.overallSummary?.total_present || 0} icon={<MdEventAvailable size={24} />} colorClass={{ text: 'text-green-600', bg: 'bg-green-100' }} />
                        <SummaryCard label="Total Classes" value={summaryData?.overallSummary?.total_classes || 0} icon={<MdPerson size={24} />} colorClass={{ text: 'text-slate-600', bg: 'bg-slate-200' }} />
                    </div>
                    {summaryData?.studentDetails?.length ? (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Overview</h3>
                            <AttendanceReportCard details={summaryData.studentDetails} />
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                            {assignments.length === 0 ? 'You have no assigned classes.' : 'No attendance data found for this selection.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Admin Attendance View ---
const AdminAttendanceView = () => {
    const [selectedClass, setSelectedClass] = useState('Class 10');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const CLASS_GROUPS = useMemo(() => ['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'], []);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedClass) return;
            setIsLoading(true); 
            setSubjects([]); 
            setSelectedSubject(''); 
            setSummaryData(null);
            try {
                const response = await apiClient.get(`/subjects/${selectedClass}`);
                const data = response.data;
                setSubjects(data);
                if (data.length > 0) { 
                    setSelectedSubject(data[0]); 
                } else { 
                    setIsLoading(false); 
                }
            } catch (error) {
                window.alert(`Error: ${error.response?.data?.message || 'Failed to fetch subjects for this class.'}`);
                setIsLoading(false);
            }
        };
        fetchSubjects();
    }, [selectedClass]);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!selectedClass || !selectedSubject) { 
                setSummaryData(null); 
                setIsLoading(false); 
                return; 
            }
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/attendance/admin-summary?classGroup=${selectedClass}&subjectName=${selectedSubject}`);
                setSummaryData(response.data);
            } catch (error) {
                window.alert(`Error: ${error.response?.data?.message || 'Could not fetch attendance summary.'}`);
                setSummaryData(null);
            } finally { 
                setIsLoading(false); 
            }
        };
        if (selectedSubject) { 
            fetchSummary(); 
        }
    }, [selectedSubject, selectedClass]);
    
    const overallPercentage = useMemo(() => {
        if (!summaryData?.overallSummary?.total_classes) return 0;
        return (summaryData.overallSummary.total_present / summaryData.overallSummary.total_classes) * 100;
    }, [summaryData]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-64">
                    <StyledSelect value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        {CLASS_GROUPS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </StyledSelect>
                </div>
                <div className="w-full sm:w-64">
                    <StyledSelect value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={subjects.length === 0}>
                        {subjects.length > 0 ? (subjects.map((s) => <option key={s} value={s}>{s}</option>)) : (<option value="">No subjects found</option>)}
                    </StyledSelect>
                </div>
            </div>

            {isLoading ? (<div className="flex justify-center items-center py-20"><Spinner /></div>) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SummaryCard label="Overall" value={`${overallPercentage.toFixed(1)}%`} icon={<MdBarChart size={24} />} colorClass={{ text: 'text-blue-600', bg: 'bg-blue-100' }} />
                        <SummaryCard label="Total Present" value={summaryData?.overallSummary?.total_present || 0} icon={<MdEventAvailable size={24} />} colorClass={{ text: 'text-green-600', bg: 'bg-green-100' }} />
                        <SummaryCard label="Total Classes" value={summaryData?.overallSummary?.total_classes || 0} icon={<MdPerson size={24} />} colorClass={{ text: 'text-slate-600', bg: 'bg-slate-200' }} />
                    </div>
                    {summaryData?.studentDetails?.length ? (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Overview</h3>
                            <AttendanceReportCard details={summaryData.studentDetails} />
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                           {subjects.length === 0 ? `No subjects scheduled for ${selectedClass}.` : 'No attendance data for this subject.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Teacher Live Attendance View ---
// ★★★ UPDATED COMPONENT ★★★
const TeacherLiveAttendanceView = ({ route, teacher }) => {
    const { class_group, subject_name, period_number, date } = route?.params || {};
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const PERIOD_DEFINITIONS = useMemo(() => [
        { period: 1, time: '09:00-09:45' }, { period: 2, time: '09:45-10:30' },
        { period: 3, time: '10:30-10:45', isBreak: true }, { period: 4, time: '10:45-11:30' },
        { period: 5, time: '11:30-12:15' }, { period: 6, time: '12:15-01:00', isBreak: true },
        { period: 7, time: '01:00-01:45' }, { period: 8, time: '01:45-02:30' },
    ], []);

    useEffect(() => {
        const fetchAttendanceSheet = async () => {
            if (!class_group || !date || !period_number) {
                window.alert('Missing required parameters to mark attendance.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await apiClient.get(`/attendance/sheet?class_group=${class_group}&date=${date}&period_number=${period_number}`);
                const data = response.data;
                const studentsWithStatus = data.map((s) => ({ ...s, status: s.status || 'Present' }));
                setStudents(studentsWithStatus);
            } catch (error) {
                window.alert(`Error: ${error.response?.data?.message || 'Failed to load students.'}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendanceSheet();
    }, [class_group, date, period_number]);

    const handleMarkAttendance = (studentId, newStatus) => {
        setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s)));
    };

    const handleSaveAttendance = async () => {
        const attendanceData = students.map((s) => ({ student_id: s.id, status: s.status || 'Present' }));
        if (attendanceData.length === 0) return;
        setIsSaving(true);
        try {
            await apiClient.post('/attendance', {
                class_group,
                subject_name,
                period_number,
                date,
                teacher_id: teacher.id,
                attendanceData,
            });
            window.alert('Success: Attendance saved successfully!');
            navigate('/TeacherDashboard');
        } catch (error) {
            window.alert(`Error: ${error.response?.data?.message || 'Failed to save attendance.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center py-20"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                <div className="text-lg font-semibold text-slate-700">
                    {`Period ${period_number} (${PERIOD_DEFINITIONS.find(p => p.period === parseInt(period_number))?.time || ''})`}
                </div>
                <div className="text-sm text-slate-500">
                    {new Date(date).toDateString()}
                </div>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-200">
                    {students.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                            <div className="flex items-center w-full sm:w-auto">
                                <MdAccountCircle size={32} className="text-slate-400 mr-4 flex-shrink-0" />
                                <div className="flex-1 text-base font-semibold min-w-0 truncate text-slate-800">{item.full_name}</div>
                            </div>
                            <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden shadow-sm flex-shrink-0 w-full sm:w-auto">
                                <button
                                    onClick={() => handleMarkAttendance(item.id, 'Present')}
                                    className={`flex-1 sm:flex-none justify-center font-semibold text-sm transition-colors duration-200 ease-in-out flex items-center gap-2 px-4 py-2 ${item.status === 'Present' ? 'bg-green-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                                >
                                    <MdCheckCircle />
                                    <span>Present</span>
                                </button>
                                <button
                                    onClick={() => handleMarkAttendance(item.id, 'Absent')}
                                    className={`flex-1 sm:flex-none justify-center font-semibold text-sm transition-colors duration-200 ease-in-out flex items-center gap-2 px-4 py-2 border-l border-slate-300 ${item.status === 'Absent' ? 'bg-red-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                                >
                                    <MdCancel />
                                    <span>Absent</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3.5 rounded-lg mt-4 disabled:opacity-70 shadow-lg hover:shadow-xl transition-all" onClick={handleSaveAttendance} disabled={isSaving || students.length === 0}>
                {isSaving ? (<span className="inline-flex items-center"><span className="mr-2"><Spinner sizeClass="h-5 w-5" colorClass="border-white" borderClass="border-2" /></span>Saving...</span>) : ('SUBMIT ATTENDANCE')}
            </button>
        </div>
    );
};

export default AttendanceScreen;