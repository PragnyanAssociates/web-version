import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client'; // ← Use apiClient like mobile version
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  MdAdd, 
  MdArrowBack, 
  MdCheckBox, 
  MdCheckBoxOutlineBlank,
  MdEvent,
  MdInfoOutline,
  MdHourglassEmpty,
  MdCheckCircle,
  MdCancel,
  MdPeople,
  MdPlace,
  MdSchool,
  MdSportsSoccer,
  MdPalette,
  MdCelebration
} from 'react-icons/md';

// --- Icon Components for Header (Unchanged) ---
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



// --- Main Component ---
const AdminEventsScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // --- State for Events functionality ---
    const [view, setView] = useState('list');
    const [selectedEvent, setSelectedEvent] = useState(null);

    // --- Dynamic Page Info for Header ---
    const pageInfo = useMemo(() => {
        switch (view) {
            case 'details':
                return { title: 'Event Details', subtitle: `Viewing RSVPs for "${selectedEvent?.title}"` };
            case 'create':
                return { title: 'Create New Event', subtitle: 'Fill in the details to publish a new event' };
            default:
                return { title: 'Manage Events', subtitle: 'Create, manage, and track event RSVPs' };
        }
    }, [view, selectedEvent]);

    // --- Header Notifications Fetch (FIXED) ---
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) {
                setUnreadCount?.(0);
                return;
            }
            try {
                const response = await apiClient.get('/notifications'); // ✅ Fixed: Use apiClient, remove /api prefix
                const count = Array.isArray(response.data) ? response.data.filter((n) => !n.is_read).length : 0;
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

    // --- Header Profile Fetch (FIXED) ---
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) {
                setLoadingProfile(false);
                return;
            }
            setLoadingProfile(true);
            try {
                const response = await apiClient.get(`/profiles/${user.id}`); // ✅ Fixed: Use apiClient, remove /api prefix
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

    const handleBack = () => { 
        setView('list'); 
        setSelectedEvent(null); 
    };
    
    const handleSelectEvent = (event) => { 
        setSelectedEvent(event); 
        setView('details'); 
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
            case 'list':
                return <EventListView onSelect={handleSelectEvent} onCreate={() => setView('create')} />;
            case 'details':
                return <EventDetailsView event={selectedEvent} onBack={handleBack} />;
            case 'create':
                return <CreateEventForm onBack={handleBack} editorId={user?.id} />;
            default:
                return <EventListView onSelect={handleSelectEvent} onCreate={() => setView('create')} />;
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
                                    placeholder="Search events..."
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
                {view === 'list' && (
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
                {renderContent()}
            </main>
            <style>{styles}</style>
        </div>
    );
};

// --- Helper component for event icons (Unchanged) ---
const EventCategoryIcon = ({ category }) => {
    const lowerCategory = category?.toLowerCase() || '';
    let icon;

    if (lowerCategory.includes('sport')) {
        icon = <MdSportsSoccer className="w-6 h-6 text-orange-600" />;
    } else if (lowerCategory.includes('academic') || lowerCategory.includes('study')) {
        icon = <MdSchool className="w-6 h-6 text-blue-600" />;
    } else if (lowerCategory.includes('cultural') || lowerCategory.includes('art')) {
        icon = <MdPalette className="w-6 h-6 text-purple-600" />;
    } else {
        icon = <MdCelebration className="w-6 h-6 text-pink-600" />;
    }

    return (
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
    );
};

// --- Event List Component (FIXED) ---
const EventListView = ({ onSelect, onCreate }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        setLoading(true);
        // ✅ Fixed: Use apiClient like mobile version
        apiClient.get('/events/all-for-admin')
            .then(response => setEvents(response.data))
            .catch(err => alert(err.response?.data?.message || "Could not load events.")) // ✅ Fixed: Consistent error handling
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-8">
            <div className="flex justify-start">
                <button
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    onClick={onCreate}
                >
                    <MdAdd size={22} />
                    Create New Event
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
                    <p className="text-slate-600 font-medium mt-4">Loading events...</p>
                </div>
            ) : (
                <div>
                    {events.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MdEvent className="text-slate-500 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Events Found</h3>
                            <p className="text-slate-600">Click the button above to create your first event.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all duration-300"
                                    onClick={() => onSelect(item)}
                                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                                >
                                    <EventCategoryIcon category={item.category} />
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate group-hover:text-blue-700">{item.title}</h3>
                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                                            <div className="inline-flex items-center gap-1.5">
                                                <MdEvent className="text-slate-400" />
                                                <span>
                                                    {new Date(item.event_datetime).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {item.location && (
                                                <div className="inline-flex items-center gap-1.5">
                                                    <MdPlace className="text-slate-400" />
                                                    <span>{item.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end ml-4">
                                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white text-blue-800 border border-slate-200">
                                            <MdPeople />
                                            {item.rsvp_count} Pending
                                        </div>
                                        <span className="mt-2 text-xs text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            View &rarr;
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Event Details Component (FIXED) ---
const EventDetailsView = ({ event, onBack }) => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRsvps = useCallback(() => {
    setLoading(true);
    // ✅ Fixed: Use apiClient like mobile version
    apiClient.get(`/events/rsvps/${event.id}`)
      .then(response => setRsvps(response.data))
      .finally(() => setLoading(false));
  }, [event.id]);

  useEffect(() => {
    fetchRsvps();
  }, [fetchRsvps]);

  const handleStatusUpdate = (rsvpId, status) => {
    // ✅ Fixed: Use apiClient like mobile version
    apiClient.put('/events/rsvp/status', { rsvpId, status, adminId: user.id })
      .then(res => { 
        if(res.status === 200) fetchRsvps(); // ✅ Fixed: Check response status properly
      });
  };

  return (
    <>
      <div className="mb-6">
          <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              title="Back to All Events"
          >
              <MdArrowBack />
              <span>Back to All Events</span>
          </button>
      </div>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 truncate mb-2">
            {event.title} - RSVPs
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
            <p className="text-slate-600 font-medium mt-4">Loading RSVPs...</p>
          </div>
        ) : (
          <div>
            {rsvps.length === 0 ? (
              <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                   <MdEvent className="text-slate-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No RSVPs Yet</h3>
                <p className="text-slate-600">No one has responded to this event yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                  {rsvps.map((item, index) => (
                      <RsvpCard 
                          key={item.rsvp_id} 
                          rsvp={item} 
                          onUpdate={handleStatusUpdate}
                          index={index}
                      />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// --- RSVP Card Component (Unchanged) ---
const RsvpCard = ({ rsvp, onUpdate, index }) => (
  <div 
    className="bg-slate-50 rounded-lg border border-slate-200 p-4"
    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">{rsvp.full_name}</h3>
            <p className="text-sm text-slate-500 mt-1">
                RSVP'd on: {new Date(rsvp.rsvp_date).toLocaleString()}
            </p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <StatusBadge status={rsvp.status} />
            {rsvp.status === 'Applied' && (
                <div className="flex gap-2 w-full">
                    <button 
                        className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md transition-all duration-300 shadow-sm text-sm"
                        onClick={() => onUpdate(rsvp.rsvp_id, 'Rejected')}
                    >
                        <MdCancel/> <span className="hidden sm:inline">Reject</span>
                    </button>
                    <button 
                        className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md transition-all duration-300 shadow-sm text-sm"
                        onClick={() => onUpdate(rsvp.rsvp_id, 'Approved')}
                    >
                        <MdCheckCircle/> <span className="hidden sm:inline">Approve</span>
                    </button>
                </div>
            )}
        </div>
    </div>
  </div>
);

// --- Create Event Form (FIXED) ---
const CreateEventForm = ({ onBack, editorId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [rsvpRequired, setRsvpRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !datetime.trim()) {
      return alert("Error: Title and Date/Time are required.");
    }
    
    setSubmitting(true);
    const payload = { 
      title, 
      category, 
      event_datetime: datetime, 
      location, 
      description, 
      rsvp_required: rsvpRequired, 
      created_by: editorId 
    };
    
    // ✅ Fixed: Use apiClient like mobile version
    apiClient.post('/events', payload)
      .then(() => { 
        alert("Success: Event created!"); 
        onBack(); 
      })
      .catch(err => alert(err.response?.data?.message || "Could not create event.")) // ✅ Fixed: Consistent error handling
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <>
        <div className="mb-6">
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                title="Back to All Events"
            >
                <MdArrowBack />
                <span>Back to All Events</span>
            </button>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Create New Event</h2>
          
          <div className="bg-slate-50 rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title *</label>
              <input
                placeholder="Enter event title..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <input
                placeholder="e.g., Academic, Cultural, Sports"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date & Time *</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <input
                placeholder="e.g., School Auditorium"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                placeholder="Describe your event..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white resize-none"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div 
              className="flex items-center cursor-pointer p-4 rounded-lg border border-slate-300 hover:border-blue-500 transition-all duration-300 bg-white"
              onClick={() => setRsvpRequired(!rsvpRequired)}
            >
              {rsvpRequired ? (
                <MdCheckBox className="w-6 h-6 text-blue-600" />
              ) : (
                <MdCheckBoxOutlineBlank className="w-6 h-6 text-slate-500" />
              )}
              <span className="ml-3 text-sm font-medium text-slate-700">RSVP Required for this event</span>
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
              <button 
                onClick={onBack}
                className="py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  'Publish Event'
                )}
              </button>
            </div>
          </div>
        </div>
    </>
  );
};

// --- Status Badge Component (Unchanged) ---
const StatusBadge = ({ status }) => {
  const statusConfig = {
    "Applied": {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: <MdHourglassEmpty />,
    },
    "Approved": {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <MdCheckCircle />,
    },
    "Rejected": {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <MdCancel />,
    }
  };

  const config = statusConfig[status] || statusConfig["Applied"];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
};

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

export default AdminEventsScreen;
