import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
// ✅ FIXED: Updated imports
import apiClient from '../api/client';
import { SERVER_URL } from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { MdSchedule, MdArrowBack } from 'react-icons/md';


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



// Constants
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CLASS_GROUPS = ['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const PERIOD_DEFINITIONS = [
    { period: 1, time: '09:00-09:45' }, { period: 2, time: '09:45-10:30' },
    { period: 3, time: '10:30-10:45', isBreak: true }, { period: 4, time: '10:45-11:30' },
    { period: 5, time: '11:30-12:15' }, { period: 6, time: '12:15-01:00', isBreak: true },
    { period: 7, time: '01:00-01:45' }, { period: 8, time: '01:45-02:30' },
];


const dayHeaders = [
    { name: 'MON', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { name: 'TUE', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
    { name: 'WED', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    { name: 'THU', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    { name: 'FRI', bgColor: 'bg-sky-100', textColor: 'text-sky-800' },
    { name: 'SAT', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
];


const TimetableScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();


    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);


    // --- Component State ---
    const [isTimetableLoading, setIsTimetableLoading] = useState(true);
    const [apiTimetableData, setApiTimetableData] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');


    // ✅ FIXED: Updated fetchProfile function
    useEffect(() => {
        if (user?.id) {
            apiClient.get(`/profiles/${user.id}`)
                .then(response => setProfile(response.data))
                .catch(() => setProfile({ 
                    id: user.id, 
                    username: user.username, 
                    full_name: user.full_name, 
                    role: user.role 
                }));
        }
    }, [user]);


    // ✅ FIXED: Updated fetchUnreadNotifications function
    useEffect(() => {
        const fetchNotifications = () => {
            if (token) {
                apiClient.get('/notifications')
                    .then(response => {
                        const data = response.data;
                        const count = Array.isArray(data) ? data.filter(n => !n.is_read).length : 0;
                        setLocalUnreadCount(count);
                        setUnreadCount?.(count);
                    })
                    .catch(() => setUnreadCount?.(0));
            }
        };
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 60000);
        return () => clearInterval(intervalId);
    }, [token, setUnreadCount]);



    // --- Component Logic ---
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') setSelectedClass(CLASS_GROUPS[0]);
            else if (user.class_group) setSelectedClass(user.class_group);
        }
    }, [user]);


    useEffect(() => {
        if (isAuthLoading || !user) return;
        if (user.role === 'admin') fetchTeachers();
    }, [user, isAuthLoading]);


    useEffect(() => {
        if (isAuthLoading || !selectedClass) return;
        fetchTimetable(selectedClass);
    }, [selectedClass, isAuthLoading]);


    // ✅ FIXED: Updated fetchTimetable function
    const fetchTimetable = async (classGroup) => {
        setIsTimetableLoading(true);
        try {
            const response = await apiClient.get(`/timetable/${classGroup}`);
            setApiTimetableData(response.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to fetch timetable data.');
            setApiTimetableData([]);
        } finally {
            setIsTimetableLoading(false);
        }
    };


    // ✅ FIXED: Updated fetchTeachers function
    const fetchTeachers = async () => {
        try {
            const response = await apiClient.get('/teachers');
            setTeachers(response.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to fetch teachers list.');
        }
    };


    const scheduleData = useMemo(() => {
        const timetableMap = new Map(apiTimetableData.map(slot => [`${slot.day_of_week}-${slot.period_number}`, slot]));
        return PERIOD_DEFINITIONS.map(pDef => ({
            time: pDef.time,
            periods: DAYS.map(day => {
                if (pDef.isBreak) return { subject: pDef.period === 3 ? 'Break' : 'Lunch', isBreak: true };
                const slotData = timetableMap.get(`${day}-${pDef.period}`);
                return { subject: slotData?.subject_name, teacher: slotData?.teacher_name, teacher_id: slotData?.teacher_id };
            })
        }));
    }, [apiTimetableData]);
    
    // --- Handlers ---
    const handleSlotPress = (day, period) => {
        if (user?.role !== 'admin') return;
        setSelectedSlot({ day, period });
        setIsModalVisible(true);
    };


    const handleTeacherSlotPress = (subject, periodNumber, dayOfColumn) => {
        const today = new Date();
        const currentDayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
        if (dayOfColumn !== currentDayOfWeek) {
            alert(`You can only mark attendance for today (${currentDayOfWeek}).`);
            return;
        }
        if (!user?.id) return;
        navigate('/AttendanceScreen', { state: { class_group: selectedClass, subject_name: subject, period_number: periodNumber, date: today.toISOString().split('T')[0] } });
    };


    // ✅ FIXED: Updated handleSaveChanges function
    const handleSaveChanges = async (slotToSave) => {
        if (!selectedSlot || !selectedClass) return;
        const payload = { 
            class_group: selectedClass, 
            day_of_week: selectedSlot.day, 
            period_number: selectedSlot.period, 
            subject_name: slotToSave.subject_name || null, 
            teacher_id: slotToSave.teacher_id || null 
        };
        try {
            await apiClient.post('/timetable', payload);
            alert('Timetable updated!');
            setIsModalVisible(false);
            fetchTimetable(selectedClass);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update timetable.');
        }
    };


    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        const roleMap = { admin: '/AdminDashboard', student: '/StudentDashboard', teacher: '/TeacherDashboard', donor: '/DonorDashboard' };
        return roleMap[user.role] || '/';
    };


    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate("/");
        }
    };


    if (isAuthLoading || !user) {
        return <div className="min-h-screen bg-slate-100 flex justify-center items-center"><div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
    }


    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Class Timetable</h1>
                            <p className="text-xs sm:text-sm text-slate-600">View and manage class schedules</p>
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
                                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
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
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors self-start">
                            <MdArrowBack /> Back to Dashboard
                        </button>
                        {user.role !== 'student' && (
                             <div className="w-full sm:w-auto sm:max-w-xs">
                                <select className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-800 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white w-full" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                                    {CLASS_GROUPS.map(option => (<option key={option} value={option}>{option}</option>))}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <header className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MdSchedule size={28} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Class Schedule - {selectedClass}</h1>
                            <p className="text-sm text-slate-500">Logged in as: {user.full_name}</p>
                        </div>
                    </header>


                    {isTimetableLoading ? (
                        <div className="flex justify-center items-center py-20"><div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                    ) : (
                        <div className="rounded-xl overflow-hidden bg-white shadow-md border border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[800px]">
                                    <thead>
                                        <tr>
                                            <th className="p-3 text-sm font-semibold text-slate-600 bg-slate-100 border-b border-r border-slate-200 text-center uppercase w-[120px]">TIME</th>
                                            {dayHeaders.map(h => (
                                                <th key={h.name} className="p-3 text-sm font-semibold text-slate-600 bg-slate-50 border-b border-r border-slate-200 text-center uppercase">
                                                    <span className={`px-2 py-1 text-xs rounded-md ${h.bgColor} ${h.textColor}`}>{h.name}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleData.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td className="p-3 text-sm font-bold text-center text-slate-700 bg-slate-100 border-b border-r border-slate-200 whitespace-nowrap">{row.time}</td>
                                                {row.periods.map((period, periodIndex) => {
                                                    const day = DAYS[periodIndex];
                                                    const periodNumber = PERIOD_DEFINITIONS[rowIndex].period;
                                                    const isMyPeriod = user.id && period.teacher_id === user.id;
                                                    const isBreak = period.isBreak;
                                                    const canClick = user.role === 'admin' || (user.role === 'teacher' && isMyPeriod);


                                                    let cellClasses = 'p-3 text-center border-b border-r border-slate-200 transition-all duration-200 h-[70px]';
                                                    if (isBreak) {
                                                        cellClasses += ' bg-slate-200 text-slate-500 font-medium italic';
                                                    } else {
                                                        if (canClick) cellClasses += ' cursor-pointer hover:bg-blue-50';
                                                        if (isMyPeriod) cellClasses += ' bg-indigo-50 border-l-4 border-indigo-500';
                                                    }


                                                    return (
                                                        <td key={periodIndex} className={cellClasses} onClick={() => !isBreak && (user.role === 'admin' ? handleSlotPress(day, periodNumber) : (isMyPeriod && handleTeacherSlotPress(period.subject, periodNumber, day)))}>
                                                            {isBreak ? (
                                                                <span>{period.subject}</span>
                                                            ) : (
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">{period.subject || '-'}</p>
                                                                    <p className="text-xs text-slate-500 mt-1">{period.teacher || ''}</p>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {isModalVisible && selectedSlot && (
                        <EditSlotModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} onSave={handleSaveChanges} slotInfo={selectedSlot} teachers={teachers} currentData={apiTimetableData.find(d => d.day_of_week === selectedSlot.day && d.period_number === selectedSlot.period)} />
                    )}
                </div>
            </main>
        </div>
    );
};


const EditSlotModal = ({ isVisible, onClose, onSave, slotInfo, teachers, currentData }) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState(currentData?.teacher_id);
    const [selectedSubject, setSelectedSubject] = useState(currentData?.subject_name);


    useEffect(() => {
        setSelectedTeacherId(currentData?.teacher_id);
        setSelectedSubject(currentData?.subject_name);
    }, [currentData]);


    const availableSubjects = useMemo(() => {
        if (!selectedTeacherId) return [];
        const teacher = teachers.find(t => t.id === selectedTeacherId);
        return teacher?.subjects_taught || [];
    }, [selectedTeacherId, teachers]);


    if (!isVisible) return null;


    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 animate-fadeIn">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Edit Slot</h2>
                    <p className="text-sm text-slate-500 mb-6">{slotInfo.day} - Period {slotInfo.period}</p>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="block text-sm font-semibold text-slate-600 mb-2">Teacher</span>
                            <select className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" value={selectedTeacherId?.toString() || 'none'} onChange={e => {
                                const teacherId = e.target.value === 'none' ? undefined : parseInt(e.target.value);
                                setSelectedTeacherId(teacherId);
                                setSelectedSubject(undefined);
                            }}>
                                <option value="none">-- Select Teacher --</option>
                                {teachers.map(t => (<option key={t.id} value={t.id.toString()}>{t.full_name}</option>))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="block text-sm font-semibold text-slate-600 mb-2">Subject</span>
                            <select className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50" value={selectedSubject || 'none'} onChange={e => setSelectedSubject(e.target.value === 'none' ? undefined : e.target.value)} disabled={!selectedTeacherId || availableSubjects.length === 0}>
                                <option value="none">-- Select Subject --</option>
                                {availableSubjects.map(s => (<option key={s} value={s}>{s}</option>))}
                            </select>
                        </label>
                    </div>
                    <div className="flex justify-between items-center space-x-3 mt-8">
                         <button onClick={() => onSave({})} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors" type="button">Clear Slot</button>
                        <div className="flex space-x-3">
                             <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" type="button">Cancel</button>
                            <button onClick={() => onSave({ teacher_id: selectedTeacherId, subject_name: selectedSubject })} className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors" type="button">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TimetableScreen;
