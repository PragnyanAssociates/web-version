// 📂 File: src/screens/exams/ExamsScreen.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import TeacherAdminExamsScreen from './TeacherAdminExamsScreen';
import StudentExamsScreen from './StudentExamsScreen';

// Common Layout Component
const ScreenLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Scroll-based visibility for back button
  const [showBackButton, setShowBackButton] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY) {
        setShowBackButton(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowBackButton(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'student') return '/StudentDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    if (user.role === 'donor') return '/DonorDashboard';
    return '/';
  };

  const handleBackClick = () => {
    navigate(getDefaultDashboardRoute());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 sm:w-72 sm:h-72 bg-teal-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 sm:w-96 sm:h-96 bg-cyan-100/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-gradient-to-r from-teal-50/10 to-cyan-50/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className={`fixed top-20 left-8 z-50 w-8 h-8 bg-teal-500 shadow-lg flex items-center justify-center rounded-full hover:bg-teal-600 active:scale-95 transition-all duration-300 ${
          showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        title="Back"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* Header */}
        {title && (
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

const ExamsScreen = ({ navigation }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-50/10 to-cyan-50/10 rounded-full blur-3xl"></div>
        </div>

        {/* AcademicCalendar Style Spinner */}
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            {/* Animated pulse background */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-lg opacity-30 animate-pulse w-20 h-20 -m-2"></div>
            {/* Main spinner */}
            <div className="relative w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent mb-2">
            Loading Exams
          </h2>
          <p className="text-gray-600">Please wait while we set up your exam portal...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'student') {
    return <StudentExamsScreen navigation={navigation} />;
  } else if (user.role === 'teacher' || user.role === 'admin') {
    return <TeacherAdminExamsScreen navigation={navigation} />;
  }

  // Fallback for unsupported roles
  return (
    <ScreenLayout title="Access Restricted" subtitle="Exam portal is not available for your role">
      <div className="text-center py-16">
        <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Access Not Available
          </h3>
          <p className="text-gray-500 mb-4">
            The exam portal is not available for users with your current role.
          </p>
          <div className="text-sm text-gray-400">
            Role: <span className="font-medium capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </ScreenLayout>
  );
};

export default ExamsScreen;
