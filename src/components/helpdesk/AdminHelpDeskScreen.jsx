"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { MdArrowBack, MdVisibility, MdEdit, MdDelete, MdAdd, MdClose, MdOutlineConfirmationNumber, MdOutlineCalendarToday, MdOutlinePerson } from "react-icons/md";
import { FaArrowLeft, FaPaperPlane, FaCogs, FaCheckDouble, FaLock, FaUserShield } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
// ★★★ FIX 1: Import apiClient instead of using fetch ★★★
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


// Custom SVG Icon for Help Desk
function HelpDeskIcon() {
  return (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// --- Main Admin Component ---
const AdminHelpDeskScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Help Desk functionality ---
  const [view, setView] = useState("list");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const pageInfo = useMemo(() => {
    if (view === 'details' && selectedTicket) {
        return { title: 'Ticket Details', subtitle: `Viewing ticket #${selectedTicket.id}` };
    }
    return { title: 'Help Desk Management', subtitle: 'Manage support tickets and help requests' };
  }, [view, selectedTicket]);
  
  // --- Hooks for Header Functionality ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
        if (!token) {
            setUnreadCount?.(0);
            return;
        }
        try {
            // ★★★ FIX 2: Use apiClient for notifications ★★★
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

  useEffect(() => {
    async function fetchProfile() {
        if (!user?.id) {
            setLoadingProfile(false);
            return;
        }
        setLoadingProfile(true);
        try {
            // ★★★ FIX 3: Use apiClient for profile ★★★
            const response = await apiClient.get(`/profiles/${user.id}`);
            setProfile(response.data);
        } catch (error) {
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

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setView("details");
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setView("list");
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
                                placeholder="Search tickets..."
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
                                <ProfileAvatar />
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
            <div className="mb-6">
                {view === "list" && (
                    <button
                        onClick={() => navigate(getDefaultDashboardRoute())}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        title="Back to Dashboard"
                    >
                        <MdArrowBack />
                        <span>Back to Dashboard</span>
                    </button>
                )}
            </div>
            {loadingProfile ? (
                 <div className="flex justify-center items-center py-20">
                     <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
            ) : (
                view === "list" ? <TicketListView onSelect={handleViewDetails} /> : <TicketDetailsView ticketId={selectedTicket.id} onBack={handleBackToList} isAdmin={true} />
            )}
        </main>
    </div>
  );
};

// --- Format user info ---
const formatUserInfo = (name, role, classGroup) => {
  const capitalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
  if (role === "student" && classGroup && classGroup.trim() !== "" && classGroup.trim() !== "N/A") {
    return `${name} (${capitalizedRole} - ${classGroup})`;
  }
  return `${name} (${capitalizedRole})`;
};

// --- REDESIGNED Ticket List View ---
const TicketListView = ({ onSelect }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Open");

  const fetchData = useCallback(() => {
    setLoading(true);
    // ★★★ FIX 4: Use apiClient and remove /api/ prefix ★★★
    apiClient.get(`/helpdesk/all-tickets?status=${filter}`)
      .then(res => setTickets(res.data))
      .catch(err => {
        console.error("Error fetching tickets:", err);
        alert(err.response?.data?.message || "Could not load tickets.");
      })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(fetchData, [fetchData]);

  return (
    <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-800">Support Tickets</h2>
            <div className="flex items-center bg-slate-200 p-1 rounded-lg">
                {["Open", "In Progress", "Solved"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-300 w-full sm:w-auto ${
                            filter === f ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-300"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Fetching tickets...</p>
            </div>
        ) : tickets.length > 0 ? (
            <div className="space-y-3">
                {tickets.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="group w-full bg-white rounded-lg border border-slate-200/80 p-4 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                    >
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-12 sm:col-span-6 md:col-span-5">
                                <p className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                    {item.subject}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Ticket #{item.id}
                                </p>
                            </div>
                            <div className="col-span-12 sm:col-span-6 md:col-span-4">
                                <p className="text-sm text-slate-600 font-medium truncate">{formatUserInfo(item.user_name, item.role, item.class_group)}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <FiClock/>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="col-span-12 md:col-span-3 flex justify-start md:justify-end">
                                <StatusBadge status={item.status} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 px-6 bg-white rounded-lg">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                    <HelpDeskIcon />
                </div>
                <h3 className="text-lg font-bold text-slate-700">All Clear!</h3>
                <p className="text-slate-500 mt-1">No tickets found with the status "{filter}".</p>
            </div>
        )}
    </div>
  );
};

// --- REDESIGNED Ticket Details View ---
export const TicketDetailsView = ({ ticketId, onBack, isAdmin }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState("");
    const { user } = useAuth();
  
    const fetchDetails = useCallback(() => {
      setLoading(true);
      // ★★★ FIX 5: Use apiClient and remove /api/ prefix ★★★
      apiClient.get(`/helpdesk/ticket/${ticketId}`)
        .then(res => setDetails(res.data))
        .catch(err => {
          console.error("Error fetching ticket details:", err);
          alert(err.response?.data?.message || "Could not load ticket details.");
        })
        .finally(() => setLoading(false));
    }, [ticketId]);
  
    useEffect(fetchDetails, [fetchDetails]);
  
    const handlePostReply = async () => {
      if (!replyText.trim()) return;
      try {
        // ★★★ FIX 6: Use apiClient for reply ★★★
        await apiClient.post('/helpdesk/reply', { 
          ticketId, 
          userId: user.id, 
          replyText 
        });
        setReplyText("");
        fetchDetails();
      } catch (e) {
        console.error("Error posting reply:", e);
        alert(e.response?.data?.message || "Could not post reply.");
      }
    };
  
    const handleStatusChange = async (newStatus) => {
      try {
        // ★★★ FIX 7: Use apiClient for status change ★★★
        await apiClient.put('/helpdesk/ticket/status', { 
          ticketId, 
          status: newStatus, 
          adminId: user.id, 
          adminName: user.full_name 
        });
        fetchDetails();
      } catch (e) {
        console.error("Error updating status:", e);
        alert(e.response?.data?.message || "Could not update status.");
      }
    };

    const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);
  
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading ticket details...</p>
        </div>
      );
    }
  
    if (!details) {
      return (
        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg shadow-md">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
                <HelpDeskIcon />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Ticket Not Found</h3>
            <p className="text-slate-500 mt-1">Could not load the details for this ticket.</p>
        </div>
      );
    }
  
    const { ticket, replies } = details;
  
    return (
      <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back to Ticket List"
                >
                    <MdArrowBack />
                    <span>Back to Ticket List</span>
                </button>
                <h2 className="text-xl font-bold text-slate-800 truncate hidden sm:block">{ticket.subject}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Conversation & Reply */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Original Description */}
                    <div className="bg-slate-50 p-5 rounded-xl shadow-md border border-slate-200/60">
                         <p className="font-bold text-slate-800 mb-3">Initial Query</p>
                         <div className="bg-white p-4 rounded-lg border border-slate-200/50">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                         </div>
                    </div>

                    {/* Conversation Thread */}
                    <div className="bg-slate-50 p-5 rounded-xl shadow-md border border-slate-200/60">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Conversation</h3>
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                            {replies.map((reply) => {
                                const isOriginalPoster = reply.user_id === ticket.user_id;
                                return (
                                <div key={reply.id} className={`flex items-start gap-3 ${isOriginalPoster ? '' : 'flex-row-reverse'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isOriginalPoster ? 'bg-blue-500' : 'bg-slate-500'}`}>
                                        {reply.full_name.charAt(0)}
                                    </div>
                                    <div className={`w-full p-3 rounded-lg shadow-sm ${isOriginalPoster ? 'bg-blue-100 border border-blue-200' : 'bg-white border border-slate-200'}`}>
                                        <div className={`flex items-center justify-between mb-1 ${isOriginalPoster ? '' : 'flex-row-reverse'}`}>
                                            <p className="font-semibold text-sm text-slate-700">{reply.full_name} ({capitalize(reply.role)})</p>
                                            <p className="text-xs text-slate-400">{new Date(reply.created_at).toLocaleString()}</p>
                                        </div>
                                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{reply.reply_text}</p>
                                    </div>
                                </div>
                                )
                            })}
                             {replies.length === 0 && (
                                <p className="text-center text-slate-500 py-4">No replies yet.</p>
                             )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Details & Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-xl shadow-md border border-slate-200/60">
                        <h4 className="text-md font-bold text-slate-800 mb-4">Ticket Information</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <MdOutlineConfirmationNumber className="text-slate-400" size={20}/>
                                <span className="font-semibold text-slate-600">Ticket ID:</span>
                                <span className="text-slate-800">#{ticket.id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MdOutlinePerson className="text-slate-400" size={20}/>
                                <span className="font-semibold text-slate-600">User:</span>
                                <span className="text-slate-800 truncate">{ticket.user_name}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <MdOutlineCalendarToday className="text-slate-400" size={20}/>
                                <span className="font-semibold text-slate-600">Created:</span>
                                <span className="text-slate-800">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <div className={`w-2.5 h-2.5 rounded-full ${ticket.status === 'Open' ? 'bg-yellow-500' : ticket.status === 'In Progress' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                </div>
                                <span className="font-semibold text-slate-600">Status:</span>
                                <StatusBadge status={ticket.status}/>
                            </div>
                        </div>
                    </div>
                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="bg-slate-50 p-5 rounded-xl shadow-md border border-slate-200/60">
                            <h4 className="text-md font-bold text-slate-800 mb-4">Admin Actions</h4>
                            <div className="flex flex-col gap-2">
                                {ticket.status === "Open" && (
                                    <button onClick={() => handleStatusChange("In Progress")} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md">
                                        <FaCogs size={14} /> Mark In Progress
                                    </button>
                                )}
                                {ticket.status === "In Progress" && (
                                    <button onClick={() => handleStatusChange("Solved")} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md">
                                        <FaCheckDouble size={14} /> Mark as Solved
                                    </button>
                                )}
                                {ticket.status === "Solved" && (
                                    <div className="flex items-center justify-center gap-2 bg-slate-200 text-slate-500 px-4 py-2 rounded-lg font-semibold cursor-not-allowed">
                                        <FaLock size={14} /> Ticket Solved
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Section */}
            {ticket.status !== 'Solved' && (
                <div className="bg-slate-50 p-5 rounded-xl shadow-md border border-slate-200/60">
                    <h4 className="text-lg font-bold text-slate-800 mb-3">Add a Reply</h4>
                    <textarea
                        placeholder="Type your response here..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white resize-none"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={5}
                    />
                    <button
                        onClick={handlePostReply}
                        className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md transform hover:scale-[1.02]"
                    >
                        <FaPaperPlane size={14} />
                        Post Reply
                    </button>
                </div>
            )}
      </div>
    );
};

// --- REDESIGNED Ticket History View (for non-admin users) ---
export const HistoryView = ({ onViewDetails, onBack }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
  
    const fetchTickets = useCallback(() => {
      if (!user) return;
      setLoading(true);
      // ★★★ FIX 8: Use apiClient for history ★★★
      apiClient.get(`/helpdesk/my-tickets/${user.id}`)
        .then(res => setTickets(res.data))
        .catch(err => {
          console.error("Error fetching ticket history:", err);
          alert(err.response?.data?.message || "Could not load ticket history.");
        })
        .finally(() => setLoading(false));
    }, [user]);
  
    useEffect(fetchTickets, [fetchTickets]);
  
    return (
      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200/60">
        <div className="flex items-center gap-4 mb-6">
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                title="Back"
            >
                <MdArrowBack />
                <span>Back</span>
            </button>
            <h2 className="text-xl font-bold text-slate-800">My Query History</h2>
        </div>
  
        {loading ? (
             <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Loading your tickets...</p>
            </div>
        ) : tickets.length > 0 ? (
            <div className="space-y-3">
                 {tickets.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => onViewDetails(item.id)}
                        className="group w-full bg-white rounded-lg border border-slate-200/80 p-4 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                    {item.subject}
                                </p>
                                 <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <FiClock/>
                                    Last updated: {new Date(item.last_updated_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <StatusBadge status={item.status} />
                            </div>
                        </div>
                    </div>
                 ))}
            </div>
        ) : (
             <div className="text-center py-16 px-6 bg-white rounded-lg">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                    <HelpDeskIcon />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No History Found</h3>
                <p className="text-slate-500 mt-1">You haven't submitted any support queries yet.</p>
            </div>
        )}
      </div>
    );
};
  
// --- Status badge ---
const StatusBadge = ({ status }) => {
    const getStatusConfig = () => {
      switch (status?.toLowerCase().replace(" ", "")) {
        case 'open':
          return { bg: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
        case 'inprogress':
          return { bg: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
        case 'solved':
          return { bg: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' };
        default:
          return { bg: 'bg-slate-100 text-slate-800', dot: 'bg-slate-500' };
      }
    };
  
    const config = getStatusConfig();
  
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
        {status}
      </span>
    );
};

export default AdminHelpDeskScreen;

// Add CSS animations to a global stylesheet or a style tag in your app's root
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
