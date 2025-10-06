import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { MdArrowBack, MdInfoOutline, MdCheckCircle, MdCancel, MdHourglassEmpty, MdAssignmentTurnedIn } from 'react-icons/md';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaInfoCircle, FaCheckCircle, FaChevronRight } from 'react-icons/fa';

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


function OriginalCalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

// --- Main component to manage views ---
const StudentEventsScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();
  
  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  
  // --- State for Events ---
  const [view, setView] = useState('list');
  const [selectedEventId, setSelectedEventId] = useState(null);

  const pageInfo = useMemo(() => {
    if (view === 'details') {
        return { title: 'Event Details', subtitle: 'View details and RSVP for the event' };
    }
    return { title: 'School Events', subtitle: 'Upcoming and recent school activities' };
  }, [view]);

  // --- Hooks for Header Functionality ---
  useEffect(() => {
    async function fetchUnreadNotifications() {
        if (!token) {
            setUnreadCount?.(0);
            return;
        }
        try {
            // ★★★ 2. USE apiClient FOR NOTIFICATIONS ★★★
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
          if (!user?.id) return;
          try {
              // ★★★ 3. USE apiClient FOR PROFILE ★★★
              const response = await apiClient.get(`/profiles/${user.id}`);
              setProfile(response.data);
          } catch {
              setProfile({
                  id: user.id,
                  username: user.username || "Unknown",
                  full_name: user.full_name || "User",
                  role: user.role || "user",
              });
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
    if (view === 'details') {
      setSelectedEventId(null);
      setView('list');
    } else {
      navigate(getDefaultDashboardRoute());
    }
  };

  const handleViewDetails = (eventId) => {
    setSelectedEventId(eventId);
    setView('details');
  };

  const renderContent = () => {
    if (view === 'details') {
        return <EventDetailsView eventId={selectedEventId} onBack={() => setView('list')} />;
    }
    return <EventListView onViewDetails={handleViewDetails} query={query} />;
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
                                placeholder="Search events..."
                                className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                            <button
                                onClick={() => navigate(getDefaultDashboardRoute())}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition"
                                type="button"
                                title="Home"
                            >
                                <HomeIcon />
                                <span className="hidden md:inline">Home</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button
                                onClick={() => navigate("/AcademicCalendar")}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition"
                                type="button"
                                title="Calendar"
                            >
                                <OriginalCalendarIcon />
                                <span className="hidden md:inline">Calendar</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button
                                onClick={() => navigate("/ProfileScreen")}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition"
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
                                className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
                <button
                    onClick={handleBackNavigation}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back"
                >
                    <MdArrowBack />
                    <span>{view === 'list' ? "Back to Dashboard" : "Back to Events List"}</span>
                </button>
            </div>
            {renderContent()}
        </main>
    </div>
  );
};

const EventListView = ({ onViewDetails, query }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // ★★★ 4. USE apiClient FOR EVENTS - MATCHES MOBILE VERSION ★★★
      const response = await apiClient.get(`/events/all-for-student/${user.id}`);
      const data = response.data;
      data.sort((a, b) => new Date(a.event_datetime) - new Date(b.event_datetime));
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      // ★★★ 5. MATCH MOBILE ERROR HANDLING ★★★
      alert("Error: Could not load school events.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    if (!query) return events;
    return events.filter(event =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [events, query]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600 font-medium">Loading Upcoming Events...</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
        <div className="absolute top-0 left-8 h-full w-0.5 bg-slate-200" aria-hidden="true"></div>
        
        {filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-lg shadow-sm border border-slate-200/60">
                <FaCalendarAlt size={32} className="text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">No Events Found</h3>
                <p className="text-slate-500 mt-1">
                    {query ? "Try adjusting your search query." : "There are no upcoming events at this time."}
                </p>
            </div>
        ) : (
            <div className="space-y-10">
                {filteredEvents.map(event => (
                    <EventFeedItem key={event.id} event={event} onViewDetails={onViewDetails} />
                ))}
            </div>
        )}
    </div>
  );
};

const EventFeedItem = ({ event, onViewDetails }) => {
    const eventDate = new Date(event.event_datetime);
    const month = eventDate.toLocaleString('en-US', { month: 'short' });
    const day = eventDate.toLocaleString('en-US', { day: '2-digit' });

    return (
        <div className="relative">
            <div className="absolute -left-1.5 top-1 w-20 flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-lg shadow-md border border-slate-200/80 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-red-600 uppercase">{month}</span>
                    <span className="text-2xl font-bold text-slate-800">{day}</span>
                </div>
            </div>

            <div className="ml-24 bg-slate-50 rounded-lg shadow-sm border border-slate-200/80 hover:shadow-lg transition-shadow duration-300">
                <div className="p-5">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-800 flex-1">{event.title}</h3>
                        {event.category && (
                            <span className="ml-4 flex-shrink-0 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                {event.category}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-sm text-slate-500 mt-2 gap-4">
                        <div className="flex items-center gap-1.5"><FaMapMarkerAlt /> {event.location || 'TBA'}</div>
                        {event.rsvp_required && <div className="flex items-center gap-1.5 font-semibold text-red-600"><FaTicketAlt /> RSVP Required</div>}
                    </div>
                </div>
                <button
                    onClick={() => onViewDetails(event.id)}
                    className="w-full bg-slate-100/70 hover:bg-slate-200/70 text-blue-600 font-semibold py-3 px-5 border-t border-slate-200 rounded-b-lg flex items-center justify-center gap-2 transition-colors duration-200"
                >
                    View Details <FaChevronRight className="text-xs" />
                </button>
            </div>
        </div>
    );
};

const EventDetailsView = ({ eventId, onBack }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDetails = useCallback(async () => {
    if (!user || !eventId) return;
    setLoading(true);
    try {
      // ★★★ 6. USE apiClient FOR EVENT DETAILS - MATCHES MOBILE VERSION ★★★
      const response = await apiClient.get(`/events/details/${eventId}/${user.id}`);
      setDetails(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
      // ★★★ 7. MATCH MOBILE ERROR HANDLING ★★★
      alert("Error: Could not load event details.");
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);
  
  const handleRsvp = async () => {
    try {
      // ★★★ 8. USE apiClient FOR RSVP - MATCHES MOBILE VERSION ★★★
      const response = await apiClient.post('/events/rsvp', { 
        userId: user.id, 
        eventId: eventId 
      });
      alert(`Success: ${response.data.message}`);
      fetchDetails(); 
    } catch (error) {
      // ★★★ 9. MATCH MOBILE ERROR HANDLING PATTERN ★★★
      alert(`Error: ${error.response?.data?.message || "An RSVP error occurred."}`);
    }
  };
  
  const formatDate = (datetime) => 
    new Date(datetime).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  if (loading) {
     return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600 font-medium">Loading Event Details...</p>
      </div>
    );
  }

  if (!details || !details.event) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-lg shadow-sm border border-slate-200/60">
        <FaInfoCircle size={32} className="text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">Event Not Found</h3>
        <p className="text-slate-500 mt-1 mb-6">Could not load the requested event details.</p>
        <button onClick={onBack} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">
            Go Back
        </button>
      </div>
    );
  }
  
  const { event, rsvp } = details;

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <MdAssignmentTurnedIn /> };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <MdCheckCircle /> };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <MdCancel /> };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-800', icon: <MdHourglassEmpty /> };
    }
  };

  const statusConfig = getStatusConfig(rsvp?.status);

  return (
    <div className="bg-slate-50 rounded-lg shadow-lg border border-slate-200/60">
        <div className="bg-slate-100 p-6 rounded-t-lg border-b border-slate-200">
            <h2 className="text-3xl font-bold text-slate-800">{event.title}</h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-slate-600">
                <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-slate-400" />
                    <span className="font-medium">{formatDate(event.event_datetime)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-slate-400" />
                    <span className="font-medium">{event.location}</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Event Description</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
            
            {event.rsvp_required && (
                <div className="md:col-span-1">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">RSVP Status</h3>
                    {!rsvp ? (
                      <button 
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={handleRsvp}
                      >
                        <FaCheckCircle />
                        RSVP Now
                      </button>
                    ) : (
                      <div className={`p-4 rounded-lg flex items-center gap-3 ${statusConfig.bg} ${statusConfig.text}`}>
                        <div className="text-2xl">{statusConfig.icon}</div>
                        <div>
                            <p className="font-bold text-lg">Status: {rsvp.status}</p>
                            <p className="text-sm">Submitted on {new Date(rsvp.rsvp_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default StudentEventsScreen;
