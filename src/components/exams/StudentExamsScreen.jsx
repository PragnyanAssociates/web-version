import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
import apiClient from '../../api/client';
import {
    MdPlayArrow,
    MdHelpOutline,
    MdCheckCircleOutline,
    MdTimer,
    MdArrowBack,
    MdArrowForward,
    MdArrowUpward,
    MdDone,
    MdClose,
    MdAccessTime,
    MdSchool,
    MdChevronRight
} from 'react-icons/md';

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

// ✅ Custom Radio Button
const CustomRadioButton = ({ label, value, selectedValue, onSelect }) => {
    const isSelected = value === selectedValue;
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className="flex items-center w-full text-left p-4 rounded-lg transition-all duration-200"
            style={{
                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: isSelected ? '2px solid #3B82F6' : '2px solid #E5E7EB'
            }}
        >
            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200 flex-shrink-0 ${
                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
                {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
            </div>
            <span className={`text-gray-800 text-base ${isSelected ? 'font-semibold' : 'font-normal'}`}>{label}</span>
        </button>
    );
};

// ✅ Main Router
const StudentExamsScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // --- State for Exams ---
    const [view, setView] = useState('list');
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedAttemptId, setSelectedAttemptId] = useState(null);
    const [resultTitle, setResultTitle] = useState("Exam Result");

    const pageInfo = useMemo(() => {
        switch (view) {
            case 'taking':
                return { title: selectedExam?.title || 'Taking Exam', subtitle: 'Focus and answer to the best of your ability.' };
            case 'result':
                return { title: resultTitle, subtitle: 'Here is a detailed breakdown of your performance.' };
            default: // list
                return { title: 'My Examinations', subtitle: 'View upcoming exams, start tests, and check your results.' };
        }
    }, [view, selectedExam, resultTitle]);

    // --- Hooks for Header ---
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) { setUnreadCount?.(0); return; }
            try {
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

    const handleBackNavigation = () => {
        if (view === 'list') {
            navigate(getDefaultDashboardRoute());
        } else {
            backToList();
        }
    };

    const handleStartExam = (exam) => {
        setSelectedExam(exam);
        setView('taking');
    };
    const handleViewResult = (item) => {
        setSelectedAttemptId(item.attempt_id);
        setResultTitle(`Result: ${item.title}`);
        setView('result');
    };
    const backToList = () => {
        setSelectedExam(null);
        setSelectedAttemptId(null);
        setView('list');
    };

    const renderContent = () => {
        if (loadingProfile) {
            return (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        switch (view) {
            case 'taking':
                return <TakeExamView exam={selectedExam} onFinish={backToList} />;
            case 'result':
                return <ResultView attemptId={selectedAttemptId} onBack={backToList} />;
            default: // list
                return <ExamList onStartExam={handleStartExam} onViewResult={handleViewResult} />;
        }
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
                                    id="module-search"
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search exams..."
                                    className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        title="Back"
                    >
                        <MdArrowBack />
                        <span>{view === 'list' ? "Back to Dashboard" : "Back to Exam List"}</span>
                    </button>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

// ✅ Exam List (unchanged)
const ExamList = ({ onStartExam, onViewResult }) => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchExams = useCallback(async () => {
        if (!user?.id || !user.class_group) return;
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/exams/student/${user.id}/${user.class_group}`);
            setExams(response.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to fetch exams.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, user?.class_group]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const StatusPill = ({ status }) => {
        const styles = {
            graded: 'bg-green-100 text-green-800',
            submitted: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            default: 'bg-blue-100 text-blue-800',
        };
        const text = {
            graded: 'Result Available',
            submitted: 'Awaiting Results',
            in_progress: 'Awaiting Results',
            default: 'Ready to Start',
        };
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || styles.default}`}>
                {text[status] || text.default}
            </span>
        );
    };
    
    if (exams.length === 0) {
        return (
             <div className="text-center py-16">
                 <div className="bg-slate-50 rounded-3xl shadow-lg border border-slate-200/80 p-8 max-w-md mx-auto">
                     <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
                         <MdSchool size={40} className="text-slate-500" />
                     </div>
                     <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Found</h3>
                     <p className="text-gray-500">There are currently no exams scheduled for you. Please check back later.</p>
                 </div>
             </div>
        );
    }

    return (
        <div className="space-y-4">
            {exams.map((item, index) => (
                <div
                    key={item.exam_id}
                    className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80 p-5 transition-all duration-300 hover:shadow-xl hover:border-blue-300"
                    style={{ animation: `fadeInUp 0.5s ${index * 100}ms ease-out forwards`, opacity: 0 }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <StatusPill status={item.status} />
                                <span className="text-sm text-gray-500">{item.subject_name || 'General'}</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
                        </div>
                        <div className="w-full sm:w-auto flex items-center gap-4 text-sm text-gray-600 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
                            <div className="flex items-center gap-2" title="Questions">
                                <MdHelpOutline className="text-blue-500" size={20} />
                                <span className="font-medium">{item.question_count} Qs</span>
                            </div>
                            <div className="flex items-center gap-2" title="Total Marks">
                                <MdCheckCircleOutline className="text-green-500" size={20} />
                                <span className="font-medium">{item.total_marks} Marks</span>
                            </div>
                            <div className="flex items-center gap-2" title="Time Limit">
                                <MdTimer className="text-orange-500" size={20} />
                                <span className="font-medium">{item.time_limit_mins} Min</span>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto flex-shrink-0">
                            {item.status === 'graded' ? (
                                <button onClick={() => onViewResult(item)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
                                    View Result <MdArrowForward />
                                </button>
                            ) : item.status === 'submitted' || item.status === 'in_progress' ? (
                                <div className="w-full sm:w-auto text-center bg-yellow-500 text-white font-semibold py-2 px-6 rounded-lg">
                                    Submitted
                                </div>
                            ) : (
                                <button onClick={() => onStartExam(item)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
                                    Start Exam <MdPlayArrow />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// ✅ UPDATED Take Exam View with Timer
const TakeExamView = ({ exam, onFinish }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    // ★★★ NEW: Timer functionality ★★★
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const startAndFetch = async () => {
            try {
                const startRes = await apiClient.post(`/exams/${exam.exam_id}/start`, { student_id: user.id });
                const { attempt_id } = startRes.data;
                setAttemptId(attempt_id);

                // ★★★ NEW: Initialize timer based on exam details ★★★
                if (exam.time_limit_mins > 0) {
                    setTimeLeft(exam.time_limit_mins * 60);
                }

                const qRes = await apiClient.get(`/exams/take/${exam.exam_id}`);
                const parsed = qRes.data.map(q => ({ 
                    ...q, 
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options 
                }));
                setQuestions(parsed);
            } catch (error) {
                alert(error.response?.data?.message || 'Could not start exam.');
                onFinish();
            } finally {
                setIsLoading(false);
            }
        };
        startAndFetch();
    }, [exam, user.id, onFinish]);

    // ★★★ NEW: Timer countdown and auto-submission ★★★
    useEffect(() => {
        if (timeLeft === null || isSubmitting) return;

        if (timeLeft <= 0) {
            performSubmit(true); // Auto-submit when time is up
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => (prevTime ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, isSubmitting]);

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    // ★★★ NEW: Refactored submission logic for both manual and auto-submit ★★★
    const performSubmit = async (isAutoSubmit = false) => {
        if (isSubmitting || !user?.id) return;
        
        setIsSubmitting(true);
        try {
            await apiClient.post(`/attempts/${attemptId}/submit`, { answers, student_id: user.id });
            alert(
                isAutoSubmit
                    ? "Time's up! Your exam has been automatically submitted."
                    : 'Your exam has been submitted successfully!'
            );
            onFinish();
        } catch (error) {
            alert(error.response?.data?.message || error.message);
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        const unansweredCount = questions.length - Object.keys(answers).length;
        const confirmMessage = unansweredCount > 0
            ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
            : 'Are you sure you want to submit your exam?';
            
        if (!window.confirm(confirmMessage)) return;
        performSubmit(false);
    };

    // ★★★ NEW: Format time for display ★★★
    const formatTime = (seconds) => {
        if (seconds < 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-20">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="mt-6 text-gray-600 text-lg">Preparing your exam...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQIndex];

    return (
        <div className="space-y-6">
            {/* ★★★ NEW: Timer Display in Header ★★★ */}
           {timeLeft !== null && (
    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center justify-center gap-2">
            <MdTimer size={18} className="text-red-600" />
            <span className="text-sm font-bold text-red-800">
                {formatTime(timeLeft)}
            </span>
        </div>
        <div className="text-xs text-red-600 text-center mt-1">Time Remaining</div>
    </div>
)}


            <div className="flex flex-col lg:flex-row gap-8">
                {/* --- Question Palette (Left/Top) --- */}
                <div className="w-full lg:w-1/4 lg:sticky top-24 self-start bg-slate-50 p-4 rounded-2xl shadow-lg border border-slate-200/80">
                    <h3 className="font-bold text-lg mb-4">Questions</h3>
                    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-5 gap-2">
                        {questions.map((q, index) => (
                            <button
                                key={q.question_id}
                                onClick={() => setCurrentQIndex(index)}
                                className={`h-10 w-10 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center
                                    ${index === currentQIndex ? 'bg-blue-600 text-white scale-110 ring-2 ring-blue-300' : ''}
                                    ${answers[q.question_id] ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}
                                    ${index !== currentQIndex ? 'hover:bg-gray-300' : ''}
                                `}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                     <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                               <MdArrowUpward /> Submit Exam
                            </>
                        )}
                    </button>
                </div>

                {/* --- Main Question View (Right/Bottom) --- */}
                <div className="w-full lg:w-3/4">
                    <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200/80 p-8">
                        <div className="border-b border-gray-200 pb-4 mb-6">
                            <p className="text-sm text-gray-500">Question {currentQIndex + 1} of {questions.length}</p>
                            <div className="flex items-start justify-between">
                                 <h2 className="text-2xl font-bold text-gray-800 mt-1">{currentQuestion.question_text}</h2>
                                 <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                                     {currentQuestion.marks} Marks
                                 </div>
                            </div>
                        </div>

                        {/* Options / Answer Area */}
                        <div className="space-y-4">
                            {currentQuestion.question_type === 'multiple_choice' ? (
                                Object.entries(currentQuestion.options).map(([key, val]) => (
                                    <CustomRadioButton
                                        key={key}
                                        label={val}
                                        value={key}
                                        selectedValue={answers[currentQuestion.question_id]}
                                        onSelect={(newVal) => handleAnswerChange(currentQuestion.question_id, newVal)}
                                    />
                                ))
                            ) : (
                                <textarea
                                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none p-4 rounded-xl text-base bg-slate-50 transition-all duration-200 min-h-[150px]"
                                    placeholder="Write your detailed answer here..."
                                    value={answers[currentQuestion.question_id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQIndex === 0}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <MdArrowBack /> Previous
                        </button>
                        <button
                            onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQIndex === questions.length - 1}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next <MdArrowForward />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ✅ Results View (unchanged)
const ResultView = ({ attemptId, onBack }) => {
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [openQuestionId, setOpenQuestionId] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await apiClient.get(`/attempts/${attemptId}/result?student_id=${user.id}`);
                const data = response.data;
                if (data.details) {
                    data.details = data.details.map(item => ({ 
                        ...item, 
                        options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options 
                    }));
                }
                setResult(data);
            } catch (error) {
                alert(error.response?.data?.message || 'Could not fetch results.');
                onBack();
            } finally {
                setIsLoading(false);
            }
        };
        fetchResult();
    }, [attemptId, user.id, onBack]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-20">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="mt-6 text-gray-600 text-lg">Calculating your results...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="text-center py-16">
                 <div className="bg-slate-50 rounded-3xl shadow-lg border border-slate-200/80 p-8 max-w-md mx-auto">
                     <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <h3 className="text-xl font-semibold text-gray-900 mb-2">Result Not Found</h3>
                     <p className="text-gray-500">We couldn't load the results for this exam. Please try again later.</p>
                 </div>
            </div>
        );
    }

    const { attempt, exam, details } = result;
    const percentage = exam.total_marks > 0 ? (attempt.final_score / exam.total_marks) * 100 : 0;
    const circumference = 2 * Math.PI * 54; // 2 * pi * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="space-y-8">
            {/* --- Summary Section --- */}
            <div className="bg-slate-50 rounded-3xl shadow-xl border border-slate-200/80 p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-48 h-48 flex-shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 120 120">
                            <circle className="text-slate-200" strokeWidth="12" stroke="currentColor" fill="transparent" r="54" cx="60" cy="60" />
                            <circle
                                className="text-blue-500"
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="54"
                                cx="60"
                                cy="60"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-blue-600">{percentage.toFixed(1)}%</span>
                            <span className="text-sm text-gray-500">Score</span>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">Your Score: {attempt.final_score} / {exam.total_marks}</h2>
                        <p className="text-gray-600 mt-1">Congratulations on completing the exam!</p>
                        {attempt.teacher_feedback && (
                            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                <p className="font-semibold text-blue-800">Teacher's Feedback:</p>
                                <p className="text-blue-700 italic">"{attempt.teacher_feedback}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Detailed Breakdown --- */}
            <div className="bg-slate-50 rounded-3xl shadow-xl border border-slate-200/80 p-8">
                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Answer Review</h2>
                 <div className="space-y-3">
                    {details.map((item, idx) => (
                        <div key={item.question_id} className="border border-slate-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenQuestionId(openQuestionId === item.question_id ? null : item.question_id)}
                                className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 transition"
                            >
                                <span className="font-semibold text-left text-gray-700">{idx + 1}. {item.question_text}</span>
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${item.marks_awarded === item.marks ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.marks_awarded} / {item.marks}
                                    </span>
                                    <MdChevronRight className={`transition-transform ${openQuestionId === item.question_id ? 'rotate-90' : ''}`} size={24} />
                                </div>
                            </button>
                            {openQuestionId === item.question_id && (() => {
                                const isCorrect = item.marks_awarded > 0 && item.marks_awarded === item.marks;

                                return (
                                    <div className="p-4 bg-slate-50 space-y-4 border-t border-slate-200">
                                        {/* YOUR ANSWER */}
                                        <div className={`p-3 rounded-lg ${
                                            item.question_type !== 'multiple_choice' 
                                                ? 'bg-blue-50' 
                                                : isCorrect ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            <p className={`font-semibold mb-1 ${
                                                item.question_type !== 'multiple_choice' 
                                                    ? 'text-blue-800' 
                                                    : isCorrect ? 'text-green-800' : 'text-red-800'
                                            }`}>Your Answer:</p>
                                            
                                            <p className={`text-base ${!item.answer_text ? 'italic' : ''} ${
                                                item.question_type !== 'multiple_choice' 
                                                    ? 'text-blue-900' 
                                                    : isCorrect ? 'text-green-900' : 'text-red-900'
                                            }`}>
                                                {item.question_type === 'multiple_choice' && item.options ? 
                                                    (item.options[item.answer_text] || 'Not Answered') : 
                                                    (item.answer_text || 'Not Answered')
                                                }
                                            </p>
                                        </div>

                                        {/* CORRECT ANSWER (if MCQ and incorrect) */}
                                        {item.question_type === 'multiple_choice' && !isCorrect && item.options && (
                                            <div className="bg-green-100 p-3 rounded-lg">
                                                <p className="font-semibold text-green-800 mb-1">Correct Answer:</p>
                                                <p className="font-medium text-green-900">{item.options[item.correct_answer]}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default StudentExamsScreen;
