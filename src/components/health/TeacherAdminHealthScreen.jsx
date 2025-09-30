import React, { useState, useEffect, useMemo } from 'react';
import { MdPerson, MdChevronRight, MdArrowBack, MdHealthAndSafety } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
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

const TeacherHealthAdminScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // --- State for View Management ---
    const [view, setView] = useState('list');
    const [selectedStudent, setSelectedStudent] = useState(null);

    // --- LIFTED STATE: State from StudentListView is now managed here to persist it ---
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [error, setError] = useState('');

    // --- Hooks for Header ---
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const response = await apiClient.get(`/profiles/${user.id}`);
                setProfile(response.data);
            } catch (error) {
                setProfile({ 
                    id: user.id, 
                    username: user.username || "Unknown", 
                    full_name: user.full_name || "User", 
                    role: user.role || "user" 
                });
            }
        }
        fetchProfile();
    }, [user]);

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

    // --- LIFTED LOGIC: Data fetching for StudentListView now lives here ---
    useEffect(() => {
        const fetchClasses = async () => {
            setIsLoadingClasses(true);
            setError('');
            try {
                const response = await apiClient.get('/health/classes');
                const data = response.data;
                setClasses(data);
                if (data.length === 0) {
                    setError('No classes with assigned students were found.');
                }
            } catch (e) {
                console.error("Error fetching classes:", e);
                setError(e.response?.data?.message || 'Could not connect to the server.');
            } finally {
                setIsLoadingClasses(false);
            }
        };
        fetchClasses();
    }, []);

    const fetchStudents = async (classGroup) => {
        if (!classGroup) { 
            setStudents([]); 
            setSelectedClass(''); 
            setError('');
            return; 
        }
        setSelectedClass(classGroup);
        setIsLoadingStudents(true);
        setStudents([]);
        setError('');
        try {
            const response = await apiClient.get(`/health/students/${classGroup}`);
            setStudents(response.data);
            if (response.data.length === 0) {
                setError('No students found in this class.');
            }
        } catch (e) {
            console.error(e);
            setError(e.response?.data?.message || 'An error occurred while fetching students.');
        } finally {
            setIsLoadingStudents(false);
        }
    };

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
        return '/';
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setView('form');
    };

    const handleBackToList = () => {
        setSelectedStudent(null);
        setView('list');
    };

    const renderContent = () => {
        switch (view) {
            case 'list':
                return <StudentListView
                    onSelectStudent={handleSelectStudent}
                    classes={classes}
                    selectedClass={selectedClass}
                    students={students}
                    isLoadingClasses={isLoadingClasses}
                    isLoadingStudents={isLoadingStudents}
                    error={error}
                    onClassChange={fetchStudents}
                />;
            case 'form':
                return <HealthForm student={selectedStudent} onBack={handleBackToList} />;
            default:
                return <StudentListView onSelectStudent={handleSelectStudent} />;
        }
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Health Administration</h1>
                            <p className="text-xs sm:text-sm text-slate-600">View and manage student health records</p>
                        </div>

                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <span className="hidden sm:inline">Logout</span>
                                    <span className="sm:hidden">Exit</span>
                                </button>
                                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
                                    <BellIcon />
                                    {unreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 space-y-8">
                {renderContent()}
            </main>
        </div>
    );
};

const StudentListView = ({
    onSelectStudent,
    classes,
    selectedClass,
    students,
    isLoadingClasses,
    isLoadingStudents,
    error,
    onClassChange
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        return '/';
    };

    return (
        <>
            <div>
                <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                    <MdArrowBack /> Back to Dashboard
                </button>
            </div>
            
            {/* Centered dropdown section */}
            <div className="flex ">
                <div className="w-full sm:max-w-xs">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Select Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => onClassChange(e.target.value)}
                        disabled={isLoadingClasses || classes.length === 0}
                        className="border border-slate-300 rounded-lg p-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white text-base font-medium"
                    >
                        <option value="">{isLoadingClasses ? 'Loading classes...' : 'Select a Class...'}</option>
                        {classes.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                </div>
            </div>

            {isLoadingClasses ? (
                <div className="flex justify-center p-8"><div className="h-10 w-10 border-4 border-slate-200 rounded-full border-t-blue-500 animate-spin"></div></div>
            ) : isLoadingStudents ? (
                <div className="flex justify-center p-8"><div className="h-10 w-10 border-4 border-slate-200 rounded-full border-t-blue-500 animate-spin"></div></div>
            ) : error && !selectedClass ? (
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center"><p className="text-md text-slate-600 font-medium">{error}</p></div>
            ) : students.length === 0 && selectedClass ? (
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center"><p className="text-md text-slate-600 font-medium">No students found in {selectedClass}.</p></div>
            ) : students.length > 0 ? (
                <div className="space-y-3">
                    {students.map((item, index) => (
                        <button key={item.id} onClick={() => onSelectStudent(item)} className="w-full flex items-center p-4 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group" style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><MdPerson size={22} className="text-blue-600" /></div>
                            <span className="flex-1 ml-4 text-left font-semibold text-slate-700 text-base group-hover:text-slate-800 transition-colors duration-300">{item.full_name}</span>
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300"><MdChevronRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors duration-300" /></div>
                        </button>
                    ))}
                </div>
            ) : classes.length > 0 && !selectedClass ? (
                <div className="bg-slate-10 border border-slate-200 rounded-xl p-8 text-center"><p className="text-md text-slate-600 font-medium">Select a class to see students.</p></div>
            ) : null}
             <style jsx>{` @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </>
    );
};

const HealthForm = ({ student, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const { user: editor } = useAuth();

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await apiClient.get(`/health/record/${student.id}`);
                const data = response.data;
                if (data.last_checkup_date) {
                    data.last_checkup_date = data.last_checkup_date.split('T')[0];
                }
                setFormData(data);
            } catch (error) {
                // If no record exists, the server might send a 404. We'll start with an empty form.
                setFormData({});
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [student]);

    const handleInputChange = (field, value) => 
        setFormData((prev) => ({ ...prev, [field]: value }));

    const calculatedBmi = useMemo(() => {
        if (formData?.height_cm && formData?.weight_kg) {
            const h = Number(formData.height_cm) / 100;
            const bmi = Number(formData.weight_kg) / (h * h);
            return isNaN(bmi) ? 'N/A' : bmi.toFixed(2);
        }
        return 'N/A';
    }, [formData.height_cm, formData.weight_kg]);

    const handleSaveChanges = async () => {
        if (!editor) {
            alert('Could not identify the editor.');
            return;
        }
        setSaving(true);
        try {
            await apiClient.post(`/health/record/${student.id}`, {
                ...formData, 
                editorId: editor.id 
            });
            alert('Health record saved.');
            onBack();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to save record.');
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-96"><div className="h-12 w-12 border-4 border-slate-200 rounded-full border-t-blue-500 animate-spin"></div></div>
        );

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                <MdArrowBack /> Back to Student List
            </button>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4"><MdPerson size={28} className="text-blue-600" /></div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{student.full_name}</h2>
                    <p className="text-md text-slate-500">Health Record</p>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormInput label="Blood Group" value={formData.blood_group || ''} onChange={(e) => handleInputChange('blood_group', e.target.value)} />
                    <FormInput label="Height (cm)" value={formData.height_cm || ''} onChange={(e) => handleInputChange('height_cm', e.target.value)} type="number"/>
                    <FormInput label="Weight (kg)" value={formData.weight_kg || ''} onChange={(e) => handleInputChange('weight_kg', e.target.value)} type="number"/>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-600 mb-2">BMI (Calculated)</label>
                        <input type="text" className="border border-slate-300 rounded-lg p-3 w-full bg-slate-200 text-slate-700 font-medium cursor-not-allowed" value={calculatedBmi} readOnly />
                    </div>
                </div>
            </div>

             <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Medical History</h3>
                <div className="grid grid-cols-1 gap-x-6">
                    <FormInput label="Last Checkup Date" value={formData.last_checkup_date || ''} onChange={(e) => handleInputChange('last_checkup_date', e.target.value)} type="date" placeholder="YYYY-MM-DD" />
                    <FormInput label="Allergies" value={formData.allergies || ''} onChange={(e) => handleInputChange('allergies', e.target.value)} textarea />
                    <FormInput label="Medical Conditions" value={formData.medical_conditions || ''} onChange={(e) => handleInputChange('medical_conditions', e.target.value)} textarea />
                    <FormInput label="Medications" value={formData.medications || ''} onChange={(e) => handleInputChange('medications', e.target.value)} textarea />
                </div>
            </div>

               <div className="flex justify-end">
                <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

const FormInput = ({ label, value, onChange, placeholder, textarea, type = "text" }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-600 mb-2">{label}</label>
        {textarea ? (
            <textarea className="border border-slate-300 rounded-lg p-3 w-full min-h-[100px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white resize-vertical" value={value} onChange={onChange} placeholder={placeholder} />
        ) : (
            <input type={type} className="border border-slate-300 rounded-lg p-3 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white" value={value} onChange={onChange} placeholder={placeholder} />
        )}
    </div>
);

export default TeacherHealthAdminScreen;
