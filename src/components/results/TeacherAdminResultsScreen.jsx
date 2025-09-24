"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.tsx"
import { API_BASE_URL } from "../../apiConfig"
import { MdVisibility, MdEdit, MdDelete, MdAdd, MdAssessment, MdArrowBack } from "react-icons/md" // +++ ADDED MdArrowBack +++

// --- Icon Components from AdminDashboard ---
function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" strokeLinecap="round" />
      <path d="M5.5 21a6.5 6.5 0 0113 0" strokeLinecap="round" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4m8-10v9a1 1 0 01-1 1h-4m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
    </svg>
  )
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
  )
}

/**
 * Main Component
 */
export default function TeacherAdminResultsScreen() {
  const navigate = useNavigate()
  const { user, token, logout, getProfileImageUrl, unreadCount, setUnreadCount } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [query, setQuery] = useState("") // Kept for header search bar, functionality can be added if needed

  // State specific to this screen
  const [activeTab, setActiveTab] = useState("History")
  const [formContext, setFormContext] = useState({ student: null, reportToEdit: null })

  // --- Hooks from AdminDashboard (for header functionality) ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
      if (!token) {
        setUnreadCount?.(0)
        return
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0
          setUnreadCount?.(count)
        } else {
          setUnreadCount?.(0)
        }
      } catch {
        setUnreadCount?.(0)
      }
    }
    fetchUnreadNotifications()
    const id = setInterval(fetchUnreadNotifications, 60000)
    return () => clearInterval(id)
  }, [token, setUnreadCount])

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoadingProfile(false)
        return
      }
      setLoadingProfile(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`)
        if (res.ok) {
          setProfile(await res.json())
        } else {
          setProfile({
            id: user.id,
            username: user.username || "Unknown",
            full_name: user.full_name || "User",
            role: user.role || "user",
          })
        }
      } catch {
        setProfile(null)
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [user])

  // --- Helper Functions ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout()
      navigate("/")
    }
  }

  const getDefaultDashboardRoute = () => {
    if (!user) return "/"
    if (user.role === "admin") return "/AdminDashboard"
    if (user.role === "teacher") return "/TeacherDashboard"
    if (user.role === "student") return "/StudentDashboard"
    return "/"
  }

  const navigateToForm = (student, report = null) => {
    setFormContext({ student, reportToEdit: report })
    setActiveTab("Create")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          {/* Enhanced responsive container for header content */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Manage Progress Reports</h1>
              <p className="text-xs sm:text-sm text-slate-600">View, create, and edit student reports</p>
            </div>

            {/* Enhanced responsive container for header controls */}
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <label htmlFor="module-search" className="sr-only">
                Search
              </label>
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
                  onClick={() => navigate("/AcademicCalendar")} // Corrected Navigation
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                  type="button"
                  title="Calendar"
                >
                  <CalendarIcon />
                  <span className="hidden md:inline">Calendar</span>
                </button>
                <div className="w-px bg-slate-200" aria-hidden="true" />
                <button
                  onClick={() => navigate("/ProfileScreen")} // Corrected Navigation
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
                <img
                  src={getProfileImageUrl() || "/placeholder.svg"}
                  alt="Profile"
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/profile.png"
                  }}
                />
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

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {/* +++ ADDED THIS BACK BUTTON +++ */}
        <div className="mb-4">
            <button
                onClick={() => navigate(getDefaultDashboardRoute())}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                title="Back to Dashboard"
            >
                <MdArrowBack />
                <span>Back to Dashboard</span>
            </button>
        </div>
        {loadingProfile && !profile ? (
          <div className="flex flex-col justify-center items-center py-16 sm:py-24">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
              aria-label="Loading"
            />
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600">Loading Report Manager…</p>
          </div>
        ) : (
          <div>
            {/* Enhanced Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 mb-6 max-w-sm mx-auto">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("History")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === "History"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab("Create")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === "Create"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Create / Edit
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {activeTab === "History" && <HistoryView onNavigateToCreate={navigateToForm} onNavigateToEdit={navigateToForm} />}
              {activeTab === "Create" && (
                <ReportForm
                  studentForForm={formContext.student}
                  reportToEdit={formContext.reportToEdit}
                  onFinish={() => setActiveTab("History")}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


// --- Subcomponents (HistoryView and ReportForm) ---
// These are kept mostly the same, with minor style tweaks to fit the new design.

/**
 * History View Subcomponent
 */
function HistoryView({ onNavigateToCreate, onNavigateToEdit }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/student-classes`)
      .then((res) => res.json())
      .then(setClasses)
      .catch(console.error);
  }, []);

  const handleClassChange = (classGroup) => {
    setSelectedClass(classGroup);
    setSelectedStudent(null);
    setReports([]);
    setStudents([]);
    if (classGroup) {
      fetch(`${API_BASE_URL}/api/reports/class/${classGroup}/students`)
        .then((res) => res.json())
        .then(setStudents)
        .catch(console.error);
    }
  };

  const handleStudentChange = (studentIdValue) => {
    if (!studentIdValue) {
      setSelectedStudent(null);
      setReports([]);
      return;
    }
    const studentId = parseInt(studentIdValue, 10);
    const studentObj = students.find((s) => s.id === studentId);
    setSelectedStudent(studentObj);
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/reports/student/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reports");
        return res.json();
      })
      .then(setReports)
      .catch((e) => alert(e.message))
      .finally(() => setIsLoading(false));
  };

  const handleDelete = (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    fetch(`${API_BASE_URL}/api/reports/${reportId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Could not delete.");
        setReports((prev) => prev.filter((r) => r.report_id !== reportId));
        alert("Report deleted.");
      })
      .catch((e) => alert(e.message));
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Select Class</label>
          <select
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white"
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            <option value="">Choose a class...</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Select Student</label>
          <select
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white disabled:opacity-60"
            value={selectedStudent?.id?.toString() || ""}
            onChange={(e) => handleStudentChange(e.target.value)}
            disabled={!students.length}
          >
            <option value="">Choose a student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report List */}
      {selectedStudent ? (
        <div>
          <div className="flex items-center mb-5 pb-3 border-b border-slate-200">
             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
               <MdAssessment className="w-5 h-5 text-blue-600" />
             </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Report History for {selectedStudent.full_name}
            </h2>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
               <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"/>
            </div>
          )}

          {!isLoading && reports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdAssessment size={28} className="text-slate-400" />
              </div>
              <p className="text-slate-600">No reports found for this student.</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {reports.map((item) => (
              <div
                key={item.report_id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="text-md font-semibold text-slate-800 mb-1">{item.report_title}</h3>
                    <p className="text-sm text-slate-500">
                      Issued: {new Date(item.issue_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/results/${item.report_id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <MdVisibility size={16} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onNavigateToEdit(selectedStudent, item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <MdEdit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.report_id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <MdDelete size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
<div className="flex justify-end mt-6">
  <button
    onClick={() => onNavigateToCreate(selectedStudent)}
    className="inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm font-semibold"
  >
    <MdAdd size={20} />
    Create New Report
  </button>
</div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <MdAssessment size={40} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Get Started</h3>
          <p className="text-slate-500 text-sm">
            Please select a class and a student to view their report history.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Report Form Subcomponent
 */
function ReportForm({ studentForForm, reportToEdit, onFinish }) {
  // This component's logic is complex and well-defined, so it remains unchanged.
  // Minor styling tweaks can be applied if necessary, but it's already quite clean.
  const { user } = useAuth();
  const isEditMode = !!reportToEdit;
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [reportDetails, setReportDetails] = useState({
    report_title: "",
    issue_date: "",
    overall_grade: "",
    teacher_comments: "",
    sgpa: "",
    cgpa: "",
    total_backlog: "0",
    result_status: "Completed the program successfully.",
  });
  const [subjectsData, setSubjectsData] = useState([
    { id: Date.now(), subject_name: "", grade: "", credit: "", grade_point: "", credit_point: "" },
  ]);

  // Fetch class list and initial data
  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/student-classes`)
      .then((res) => res.json())
      .then((classData) => {
        setClasses(classData);

        let initClass = "";
        if (isEditMode) initClass = reportToEdit.class_group;
        else if (studentForForm) initClass = studentForForm.class_group;

        if (initClass) {
          setSelectedClass(initClass);
          fetch(`${API_BASE_URL}/api/reports/class/${initClass}/students`)
            .then((res) => res.json())
            .then((studentsList) => {
              setStudents(studentsList);

              if (isEditMode) {
                setSelectedStudentId(reportToEdit.student_id.toString());
                fetch(`${API_BASE_URL}/api/reports/${reportToEdit.report_id}/details`)
                  .then((res) => res.json())
                  .then(({ reportDetails, subjects }) => {
                    setReportDetails({
                      report_title: reportDetails.report_title,
                      issue_date: reportDetails.issue_date.split("T")[0],
                      overall_grade: reportDetails.overall_grade || "",
                      teacher_comments: reportDetails.teacher_comments || "",
                      sgpa: reportDetails.sgpa || "",
                      cgpa: reportDetails.cgpa || "",
                      total_backlog: reportDetails.total_backlog || "0",
                      result_status: reportDetails.result_status || "",
                    });
                    setSubjectsData(
                      subjects.length
                        ? subjects.map((s) => ({
                            id: s.subject_entry_id,
                            subject_name: s.subject_name,
                            grade: s.grade,
                            credit: s.credit,
                            grade_point: s.grade_point,
                            credit_point: s.credit_point,
                          }))
                        : subjectsData
                    );
                  });
              } else if (studentForForm) {
                setSelectedStudentId(studentForForm.id.toString());
              }
            });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch students list when selectedClass changes (for create mode)
  useEffect(() => {
    if (!isEditMode && selectedClass) {
      fetch(`${API_BASE_URL}/api/reports/class/${selectedClass}/students`)
        .then((res) => res.json())
        .then((data) => {
          setStudents(data);
          setSelectedStudentId(""); // reset when class changes
        });
    }
  }, [selectedClass, isEditMode]);

  const handleSave = () => {
    if (!selectedStudentId) return alert("Please select a student.");
    setIsSaving(true);
    const payload = {
      reportDetails: {
        ...reportDetails,
        student_id: parseInt(selectedStudentId, 10),
        class_group: selectedClass,
      },
      subjectsData,
      uploaded_by: user.id,
    };
    const url = isEditMode
      ? `${API_BASE_URL}/api/reports/${reportToEdit.report_id}`
      : `${API_BASE_URL}/api/reports`;
    const method = isEditMode ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save report.");
        alert(`Report ${isEditMode ? "updated" : "created"}!`);
        onFinish();
      })
      .catch((e) => alert(e.message))
      .finally(() => setIsSaving(false));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"/>
      </div>
    );
  }

  // The form JSX remains the same as it was already well-structured.
  return (
    <div className="p-4 sm:p-6 space-y-6">
        {/* Student Selection */}
        <div className="border border-slate-200 rounded-xl p-4">
            <h3 className="text-md font-semibold text-slate-800 mb-3">Student Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Class</label>
                    <select value={selectedClass} disabled={isEditMode} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60">
                        <option value="">Select Class...</option>
                        {classes.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Student</label>
                    <select value={selectedStudentId} disabled={!students.length || isEditMode} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60">
                        <option value="">Select Student...</option>
                        {students.map((s) => (<option key={s.id} value={s.id.toString()}>{s.full_name}</option>))}
                    </select>
                </div>
            </div>
        </div>

        {/* Report Information */}
        <div className="border border-slate-200 rounded-xl p-4">
            <h3 className="text-md font-semibold text-slate-800 mb-3">Report Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Report Title</label>
                    <input type="text" placeholder="e.g., Semester 1 Finals" value={reportDetails.report_title} onChange={(e) => setReportDetails({ ...reportDetails, report_title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Issue Date</label>
                    <input type="date" value={reportDetails.issue_date} onChange={(e) => setReportDetails({ ...reportDetails, issue_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
            </div>
        </div>
        
        {/* Subject Details */}
        <div className="border border-slate-200 rounded-xl p-4">
             <div className="flex items-center justify-between mb-3">
                 <h3 className="text-md font-semibold text-slate-800">Subject Details</h3>
                 <button onClick={() => setSubjectsData([...subjectsData, { id: Date.now(), subject_name: "", grade: "", credit: "", grade_point: "", credit_point: "" }])} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                     <MdAdd size={16} /> Add Subject
                 </button>
             </div>
             <div className="space-y-3">
                 {subjectsData.map((s, index) => (
                     <div key={s.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                         <input type="text" placeholder="Subject Name" value={s.subject_name} onChange={(e) => setSubjectsData(subjectsData.map(sub => sub.id === s.id ? { ...sub, subject_name: e.target.value } : sub))} className="w-full px-3 py-2 rounded-lg border border-slate-300 mb-2" />
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             <input type="text" placeholder="Grade" value={s.grade} onChange={(e) => setSubjectsData(subjectsData.map(sub => sub.id === s.id ? { ...sub, grade: e.target.value } : sub))} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                             <input type="number" placeholder="Credit" value={s.credit} onChange={(e) => setSubjectsData(subjectsData.map(sub => sub.id === s.id ? { ...sub, credit: e.target.value } : sub))} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                             <input type="number" step="0.1" placeholder="Grade Point" value={s.grade_point} onChange={(e) => setSubjectsData(subjectsData.map(sub => sub.id === s.id ? { ...sub, grade_point: e.target.value } : sub))} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                             <input type="number" step="0.1" placeholder="Credit Point" value={s.credit_point} onChange={(e) => setSubjectsData(subjectsData.map(sub => sub.id === s.id ? { ...sub, credit_point: e.target.value } : sub))} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                         </div>
                     </div>
                 ))}
             </div>
        </div>

        {/* Overall Assessment */}
        <div className="border border-slate-200 rounded-xl p-4">
             <h3 className="text-md font-semibold text-slate-800 mb-3">Overall Assessment</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                 <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">Overall Grade</label>
                     <input type="text" placeholder="A+" value={reportDetails.overall_grade} onChange={(e) => setReportDetails({ ...reportDetails, overall_grade: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">SGPA</label>
                     <input type="number" step="0.01" placeholder="8.5" value={reportDetails.sgpa} onChange={(e) => setReportDetails({ ...reportDetails, sgpa: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">CGPA</label>
                     <input type="number" step="0.01" placeholder="8.2" value={reportDetails.cgpa} onChange={(e) => setReportDetails({ ...reportDetails, cgpa: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Teacher's Comments</label>
                 <textarea rows={3} placeholder="Enter comments..." value={reportDetails.teacher_comments} onChange={(e) => setReportDetails({ ...reportDetails, teacher_comments: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 resize-none"></textarea>
             </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-all shadow-sm font-semibold">
                {isSaving ? (
                    <> <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving... </>
                ) : (
                    <> {isEditMode ? "Update Report" : "Save Report"} </>
                )}
            </button>
        </div>
    </div>
  );
}