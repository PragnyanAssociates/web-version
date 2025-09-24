"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE_URL } from "../../apiConfig";
import { FiX } from "react-icons/fi";
import { MdSupervisorAccount, MdVerified, MdPending, MdVisibility, MdArrowBack } from "react-icons/md";

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

export default function AdminSponsorScreen() {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Sponsorship functionality ---
  const [selectedApp, setSelectedApp] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Hooks for Header Functionality ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
      if (!token) {
        setUnreadCount?.(0);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
          setLocalUnreadCount(count);
          setUnreadCount?.(count);
        } else {
          setUnreadCount?.(0);
        }
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
        const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
        if (res.ok) {
          setProfile(await res.json());
        } else {
          setProfile({
            id: user.id,
            username: user.username || "Unknown",
            full_name: user.full_name || "User",
            role: user.role || "user",
          });
        }
      } catch {
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [user]);
  
  // --- Hooks for Sponsorship Functionality ---
  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sponsorships`);
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load sponsorships.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

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
    if (user.role === 'donor') return '/DonorDashboard';
    return '/';
  };
  
  const onVerifySuccess = () => {
    setSelectedApp(null);
    fetchApps();
  };

  if (!user) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border">
            <MdSupervisorAccount size={32} className="text-slate-400" />
          </div>
          <p className="text-xl text-slate-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Sponsorships Management</h1>
              <p className="text-xs sm:text-sm text-slate-600">Review and verify sponsorship applications</p>
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
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {!selectedApp && (
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
        )}

        {loading || loadingProfile ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !selectedApp ? (
          <AdminSponsorshipTable
            apps={apps}
            loading={loading}
            error={error}
            onSelect={setSelectedApp}
          />
        ) : (
          <AdminSponsorshipDetails
            application={selectedApp}
            onBack={() => setSelectedApp(null)}
            onVerifySuccess={onVerifySuccess}
          />
        )}
      </main>
    </div>
  );
}

// --- List/Table View ---
function AdminSponsorshipTable({ apps, loading, error, onSelect }) {
  const getStatusStyle = (status) => {
    if (status === "Verified") return "bg-green-100 text-green-700 border-green-200";
    if (status === "Pending") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div>
      <div>
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">All Applications</h2>
              <p className="text-sm text-slate-600">Review and verify sponsorship applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <div className="text-lg font-bold text-blue-700 text-center">{apps.length}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 font-medium text-center">{error}</p>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative mx-auto mb-4">
                            <div className="h-12 w-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                          </div>
                          <p className="text-blue-700 font-medium">Loading sponsorships...</p>
                        </div>
                      </td>
                    </tr>
                  ) : apps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center bg-slate-50">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                          <MdSupervisorAccount size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No applications found</h3>
                        <p className="text-slate-500">No sponsorship applications have been submitted yet</p>
                      </td>
                    </tr>
                  ) : (
                    apps.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200 last:border-b-0 hover:bg-blue-50 transition-colors duration-200`}
                      >
                        <td className="px-6 py-3 font-medium text-slate-800 text-sm">
                          {item.full_name}
                        </td>
                        <td className="px-6 py-3 text-slate-600 text-sm">
                          {item.donor_username}
                        </td>
                        <td className="px-6 py-3 text-slate-600 text-sm">
                          {new Date(item.application_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 font-semibold text-xs rounded-full border ${getStatusStyle(item.payment_status)}`}
                          >
                            {item.payment_status === "Verified" && <MdVerified className="mr-1" size={14} />}
                            {item.payment_status === "Pending" && <MdPending className="mr-1" size={14} />}
                            {item.payment_status || "Proof Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => onSelect(item)}
                            className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm"
                            type="button"
                          >
                            <MdVisibility className="mr-1.5" size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- Details View (Updated styling) ---
function AdminSponsorshipDetails({ application, onBack, onVerifySuccess }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sponsorship/${application.id}`);
      if (!res.ok) throw new Error("Failed to load details.");
      const data = await res.json();
      setDetails(data);
    } catch {
      alert("Failed to load details.");
    } finally {
      setLoading(false);
    }
  }, [application.id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleVerify = () => {
    if (!details?.paymentDetails?.id) {
      alert("No payment record found to verify.");
      return;
    }
    if (!window.confirm("Are you sure you have received this payment?")) return;
    (async () => {
      setVerifying(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/sponsorship/verify-payment/${details.paymentDetails.id}`,
          { method: "PUT" }
        );
        const result = await res.json();
        if (res.ok) {
          alert(result.message);
          onVerifySuccess();
        } else {
          throw new Error(result.message);
        }
      } catch (e) {
        alert(e.message || "Verification failed.");
      } finally {
        setVerifying(false);
      }
    })();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-blue-700 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <MdSupervisorAccount size={32} className="text-slate-400" />
          </div>
          <p className="text-xl text-slate-600">Error loading details</p>
      </div>
    );
  }

  const { appDetails, paymentDetails } = details;

  return (
    <div className="p-4 sm:p-6">
      <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          title="Back to Sponsorships"
      >
          <MdArrowBack />
          <span>Back to Applications List</span>
      </button>

      {/* Title Restored */}
     

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Applicant Information">
              <DetailRow label="Name" value={appDetails.full_name} />
              <DetailRow label="Email" value={appDetails.email} />
              <DetailRow label="Phone" value={appDetails.phone} />
              <DetailRow label="Organization" value={appDetails.organization} />
          </DetailSection>

          <DetailSection title="Preferences & Message">
              <DetailRow label="Wants Updates?" value={appDetails.wants_updates ? "Yes" : "No"} />
              <DetailRow label="Wants to Visit?" value={appDetails.wants_to_visit ? "Yes" : "No"} />
              {appDetails.message && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Message:</p>
                  <p className="text-slate-700 italic break-words">{appDetails.message}</p>
              </div>
              )}
          </DetailSection>
          </div>

          <div className="lg:col-span-1">
          <DetailSection title="Payment Proof">
              {paymentDetails ? (
              <>
                  <DetailRow label="Amount Paid" value={`₹${paymentDetails.amount}`} />
                  <DetailRow label="Status" value={paymentDetails.status} />
                  <div className="mt-4 mb-6 flex justify-center">
                  <img
                      src={`${API_BASE_URL}${paymentDetails.screenshot_url}`}
                      alt="Payment Proof"
                      className="rounded-xl max-h-64 w-full object-contain shadow-md border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                      onClick={() => setModalVisible(true)}
                  />
                  </div>
                  {paymentDetails.status === "Pending" && (
                  <button
                      onClick={handleVerify}
                      disabled={verifying}
                      className={`w-full py-3 font-semibold rounded-xl text-white shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 border ${
                      verifying 
                          ? "bg-slate-400 cursor-not-allowed border-slate-300" 
                          : "bg-green-600 hover:bg-green-700 border-green-500/30"
                      }`}
                  >
                      {verifying ? (
                      <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                          <span>Verifying...</span>
                      </div>
                      ) : (
                      <>
                          <MdVerified className="inline mr-2" size={20} />
                          Verify Payment
                      </>
                      )}
                  </button>
                  )}
              </>
              ) : (
              <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <MdPending size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500">No payment proof uploaded</p>
              </div>
              )}
          </DetailSection>
          </div>
      </div>

      {isModalVisible && (
          <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setModalVisible(false)}
          role="dialog"
          aria-modal="true"
          >
          <div className="relative max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl">
              <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-3 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
              onClick={() => setModalVisible(false)}
              aria-label="Close image modal"
              >
              <FiX size={24} />
              </button>
              <img
              src={`${API_BASE_URL}${paymentDetails?.screenshot_url}`}
              alt="Enlarged Payment Proof"
              className="max-h-[85vh] max-w-full mx-auto rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
              />
          </div>
          </div>
      )}
    </div>
  );
}

// --- Reusable UI Components (Updated styling) ---
function DetailSection({ title, children }) {
  return (
    <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-100 last:border-b-0">
      <span className="font-semibold text-slate-600 mb-1 sm:mb-0">{label}:</span>
      <span className="text-slate-800 break-words text-left sm:text-right">{value || "N/A"}</span>
    </div>
  );
}