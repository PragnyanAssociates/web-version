// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import WelcomePage from './screens/WelcomePage';
import DonorDashboard from './screens/DonorDashboard.jsx';
import TeacherDashboard from './screens/TeacherDashboard.jsx';
import StudentDashboard from './screens/StudentDashboard.jsx';
import AboutUs from './screens/AboutUs.jsx';
import AdminDashboard from './screens/AdminDashboard.jsx';
import AcademicCalendar from './screens/AcademicCalendar.jsx';
import AdminSuggestionsScreen from './components/suggestions/AdminSuggestionsScreen.jsx';
import DonorSuggestionsScreen from './components/suggestions/DonorSuggestionsScreen.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import DashboardHeader from './screens/DashboardHeader.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import DonorPaymentScreen from './components/payments/DonorPaymentScreen.jsx';
import AdminPaymentScreen from './components/payments/AdminPaymentScreen.jsx';
import Footer from './screens/Footer.jsx';
import './App.css';

import AlbumDetailScreen from './components/gallery/AlbumDetailScreen.jsx';
import GalleryScreen from './components/gallery/GalleyScreen.jsx';
import AdminSponsorScreen from './components/sponsorship/AdminSponsorScreen.jsx';
import DonorSponsorScreen from './components/sponsorship/DonorSponsorScreen.jsx';
import AdminEventsScreen from './components/events/AdminEventsScreen.jsx';
import StudentEventsScreen from './components/events/StudentEventsScreen.jsx';
import TimetableScreen from './screens/TimetableScreen.jsx';
import AttendanceScreen from './screens/AttendanceScreen.jsx';
import AdminSportsScreen from './components/sports/AdminSportsScreen.jsx';
import StudentSportsScreen from './components/sports/StudentSportsScreen.jsx';
import KitchenScreen from './components/kitchen/KitchenScreen.jsx';
import FoodScreen from './components/food/FoodScreen.jsx';
import LabCard from './components/labs/LabCard.jsx';
import StudentLabsScreen from './components/labs/StudentLabsScreen.jsx';
import TeacherAdminLabsScreen from './components/labs/TeacherAdminLabsScreen.jsx';
import MeetingCard from './components/ptm/MeetingCard.jsx';
import StudentPTMScreen from './components/ptm/StudentPTMScreen.jsx';
import TeacherAdminPTMScreen from './components/ptm/TeacherAdminPTMScreen.jsx';
import StudentMaterialsScreen from './components/study-materials/StudentMaterialsScreen.jsx';
import StudyMaterialsScreen from './components/study-materials/StudyMaterialsScreen.jsx';
import TeacherAdminMaterialsScreen from './components/study-materials/TeacherAdminMaterialsScreen.jsx';
import ChatAIScreen from './components/chatai/ChatAIScreen.jsx';

import AdminSyllabusScreen from './components/syllabus/AdminSyllabusScreen.jsx';
import StudentSyllabusScreen from './components/syllabus/StudentSyllabusScreen.jsx';
import SyllabusScreen from './components/syllabus/SyllabusScreen.jsx';
import TeacherSyllabusScreen from './components/syllabus/TeacherSyllabusScreen.jsx';
import TransportScreen from './components/transport/TransportScreen.jsx';
import StudentHealthScreen from './components/health/StudentHealthScreen.jsx';
import TeacherAdminHealthScreen from './components/health/TeacherAdminHealthScreen.jsx';
import ExamsScreen from './components/exams/ExamsScreen.jsx';
import StudentExamsScreen from './components/exams/StudentExamsScreen.jsx';
import TeacherAdminExamsScreen from './components/exams/TeacherAdminExamsScreen.jsx';
import StudentExamScreen from './components/exams_Schedule/StudentExamScreen.jsx';
import TeacherAdminExamScreen from './components/exams_Schedule/TeacherAdminExamScreen.jsx';
import ReportDetailScreen from './components/results/ReportDetailScreen.jsx';
import ResultsScreen from './components/results/ResultsScreen.jsx';
import StudentResultsScreen from './components/results/StudentResultsScreen.jsx';
import TeacherAdminResultsScreen from './components/results/TeacherAdminResultsScreen.jsx';
import StudentHomeworkScreen from './components/homework/StudentHomeworkScreen.jsx';
import TeacherAdminHomeworkScreen from './components/homework/TeacherAdminHomeworkScreen.jsx';
import GroupChatScreen from './components/chat/GroupChatScreen.jsx';
import DonorRegistrationScreen from './components/DonorRegistrationScreen.jsx';
import ForgotPasswordScreen from './components/ForgotPasswordScreen.jsx';
import ResetPasswordScreen from './components/ResetPasswordScreen.jsx';
import CreateAdScreen from './components/ads/CreateAdScreen.jsx';
import AdDisplay from './components/ads/AdDisplay.jsx';
import AdminAdDashboardScreen from './components/ads/AdminAdDasboardScreen.jsx';
import NotificationsScreen from './components/NotificationsScreen.jsx';
import AdminLM from './screens/AdminLM.jsx';
import AdminHelpDeskScreen from './components/helpdesk/AdminHelpDeskScreen.jsx';
import DonorHelpDeskScreen from './components/helpdesk/DonorHelpDeskScreen.jsx';
import UserHelpDeskScreen from './components/helpdesk/UserHelpDeskScreen.jsx';

// --- Dashboard Layout Wrapper ---
function DashboardLayout() {
  return (
    <>
      <DashboardHeader />
      {/* All nested routes rendered here */}
      <Outlet />
      <Footer />
    </>
  );
}

// --- App Content Component (with access to Auth Context) ---
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  // Allowed dashboard routes for ads
  const adRoutes = [
    "/AdminDashboard",
    "/TeacherDashboard",
    "/StudentDashboard",
    "/DonorDashboard",
  ];

  const shouldShowAd = user && adRoutes.includes(location.pathname);

  return (
    <div className="App min-h-screen bg-gray-50 relative">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/HomeScreen" element={<HomeScreen />} />
        <Route path="/LoginScreen" element={<LoginScreen />} />
        <Route path="/DonorRegistrationScreen" element={<DonorRegistrationScreen />} />
        <Route path="/ForgotPasswordScreen" element={<ForgotPasswordScreen />} />
        <Route path="/ResetPasswordScreen" element={<ResetPasswordScreen />} />

        {/* Dashboard/protected routes with DashboardHeader AND Footer */}
        <Route element={<DashboardLayout />}>
          <Route path="/DonorDashboard" element={<DonorDashboard />} />
          <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
          <Route path="/StudentDashboard" element={<StudentDashboard />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/AcademicCalendar" element={<AcademicCalendar />} />
          <Route path="/AdminSuggestionsScreen" element={<AdminSuggestionsScreen />} />
          <Route path="/DonorSuggestionsScreen" element={<DonorSuggestionsScreen />} />
          <Route path="/ProfileScreen" element={<ProfileScreen />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/DonorPaymentScreen" element={<DonorPaymentScreen />} />
          <Route path="/AdminPaymentScreen" element={<AdminPaymentScreen />} />
          <Route path="/AlbumDetailScreen" element={<AlbumDetailScreen />} />
          <Route path="/GalleryScreen" element={<GalleryScreen />} />
          <Route path="/AdminSponsorScreen" element={<AdminSponsorScreen />} />
          <Route path="/DonorSponsorScreen" element={<DonorSponsorScreen />} />
          <Route path="/AdminEventsScreen" element={<AdminEventsScreen />} />
          <Route path="/StudentEventsScreen" element={<StudentEventsScreen />} />
          <Route path="/TimetableScreen" element={<TimetableScreen />} />
          <Route path="/AttendanceScreen" element={<AttendanceScreen />} />
          <Route path="/AdminSportsScreen" element={<AdminSportsScreen />} />
          <Route path="/StudentSportsScreen" element={<StudentSportsScreen />} />
          <Route path="/KitchenScreen" element={<KitchenScreen />} />
          <Route path="/FoodScreen" element={<FoodScreen />} />
          <Route path="/LabCard" element={<LabCard />} />
          <Route path="/StudentLabsScreen" element={<StudentLabsScreen />} />
          <Route path="/TeacherAdminLabsScreen" element={<TeacherAdminLabsScreen />} />
          <Route path="/MeetingCard" element={<MeetingCard />} />
          <Route path="/StudentPTMScreen" element={<StudentPTMScreen />} />
          <Route path="/TeacherAdminPTMScreen" element={<TeacherAdminPTMScreen />} />
          <Route path="/StudentMaterialsScreen" element={<StudentMaterialsScreen />} />
          <Route path="/StudyMaterialsScreen" element={<StudyMaterialsScreen />} />
          <Route path="/TeacherAdminMaterialsScreen" element={<TeacherAdminMaterialsScreen />} />
          <Route path="/ChatAIScreen" element={<ChatAIScreen />} />
          <Route path="/AdminSyllabusScreen" element={<AdminSyllabusScreen />} />
          <Route path="/StudentSyllabusScreen" element={<StudentSyllabusScreen />} />
          <Route path="/SyllabusScreen" element={<SyllabusScreen />} />
          <Route path="/TeacherSyllabusScreen" element={<TeacherSyllabusScreen />} />
          <Route path="/TransportScreen" element={<TransportScreen />} />
          <Route path="/StudentHealthScreen" element={<StudentHealthScreen />} />
          <Route path="/TeacherAdminHealthScreen" element={<TeacherAdminHealthScreen />} />
          <Route path="/ExamsScreen" element={<ExamsScreen />} />
          <Route path="/StudentExamsScreen" element={<StudentExamsScreen />} />
          <Route path="/TeacherAdminExamsScreen" element={<TeacherAdminExamsScreen />} />
          <Route path="/TeacherAdminExamScreen" element={<TeacherAdminExamScreen />} />
          <Route path="/StudentExamScreen" element={<StudentExamScreen />} />
          <Route path="/results/:reportId" element={<ReportDetailScreen />} />
          <Route path="/ResultsScreen" element={<ResultsScreen />} />
          <Route path="/StudentResultsScreen" element={<StudentResultsScreen />} />
          <Route path="/TeacherAdminResultsScreen" element={<TeacherAdminResultsScreen />} />
          <Route path="/StudentHomeworkScreen" element={<StudentHomeworkScreen />} />
          <Route path="/TeacherAdminHomeworkScreen" element={<TeacherAdminHomeworkScreen />} />
          <Route path="/GroupChatScreen" element={<GroupChatScreen />} />
          <Route path="/CreateAdScreen" element={<CreateAdScreen />} />
          <Route path="/AdminAdDashboardScreen" element={<AdminAdDashboardScreen />} />
          <Route path="/NotificationsScreen" element={<NotificationsScreen />} />
          <Route path="/AdminLM" element={<AdminLM />} />
          <Route path="/AdminHelpDeskScreen" element={<AdminHelpDeskScreen />} />
          <Route path="/DonorHelpDeskScreen" element={<DonorHelpDeskScreen />} />
          <Route path="/UserHelpDeskScreen" element={<UserHelpDeskScreen />} />
        </Route>
      </Routes>

      {/* Ads only on selected dashboard screens */}
      {shouldShowAd && <AdDisplay />}
    </div>
  );
}

// --- Main App Component ---
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
