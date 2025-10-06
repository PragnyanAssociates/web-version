"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.tsx';
import { MdAccountCircle, MdCancel, MdCheckCircle, MdArrowBack } from 'react-icons/md';
import apiClient from '../api/client.js';

// --- Icon Components for Header --- (unchanged)
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


// --- Configuration --- (unchanged)
const eventTypesConfig = {
    Meeting: { color: '#0077b6', displayName: 'Meeting' },
    Event: { color: '#ff9f1c', displayName: 'Event' },
    Festival: { color: '#f94144', displayName: 'Festival' },
    'Holiday (General)': { color: '#05680fff', displayName: 'Holiday (General)' },
    'Holiday (Optional)': { color: '#11b8a5ff', displayName: 'Holiday (Optional)' },
    Exam: { color: '#8023f1ff', displayName: 'Exam' },
    Other: { color: '#db0b7dff', displayName: 'Other' },
};
const DEFAULT_EVENT_TYPE = 'Meeting';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function AcademicCalendar() {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [headerQuery, setHeaderQuery] = useState("");

    // --- Hooks for Header ---
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                // ★★★ FIXED: Use apiClient correctly ★★★
                const res = await apiClient.get(`/profiles/${user.id}`);
                setProfile(res.data);
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
                // ★★★ FIXED: Use apiClient correctly ★★★
                const res = await apiClient.get('/notifications');
                const count = Array.isArray(res.data) ? res.data.filter((n) => !n.is_read).length : 0;
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

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate("/");
        }
    };

    // --- Component State and Logic ---
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState({});
    const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventDetails, setEventDetails] = useState({
        name: '', time: '', description: '', type: DEFAULT_EVENT_TYPE,
    });

    const today = useMemo(() => new Date(), []);
    const month = currentDisplayDate.getMonth();
    const year = currentDisplayDate.getFullYear();

    const fetchEvents = async () => {
        try {
            if (!isLoading) setIsLoading(true);
            // ★★★ FIXED: Use apiClient correctly ★★★
            const response = await apiClient.get('/calendar');
            setEvents(response.data);
        } catch (error) {
            window.alert(error.response?.data?.message || 'Failed to fetch calendar data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);
    
    const calendarGrid = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return [
            ...Array(firstDay).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];
    }, [month, year]);

    const changeMonth = (offset) => {
        setCurrentDisplayDate((d) => {
            const newDate = new Date(d);
            newDate.setDate(1);
            newDate.setMonth(d.getMonth() + offset);
            return newDate;
        });
    };

    const openModalForNew = (dateKey) => {
        setEditingEvent(null);
        setSelectedDate(dateKey);
        setEventDetails({ name: '', time: '', description: '', type: DEFAULT_EVENT_TYPE });
        setIsModalVisible(true);
    };

    const openModalForEdit = (event) => {
        setEditingEvent(event);
        setSelectedDate(event.event_date);
        setEventDetails({
            name: event.name,
            time: event.time || '',
            description: event.description || '',
            type: event.type,
        });
        setIsModalVisible(true);
    };

    const handleSaveEvent = async () => {
        if (!eventDetails.name.trim() || !selectedDate) {
            window.alert('Title is required.');
            return;
        }

        const isEditing = !!editingEvent;
        const url = isEditing ? `/calendar/${editingEvent.id}` : '/calendar';
        const method = isEditing ? 'put' : 'post';
        const body = { 
            ...eventDetails, 
            event_date: selectedDate, 
            adminId: user?.id 
        };

        try {
            // ★★★ FIXED: Use apiClient consistently like mobile version ★★★
            const response = await apiClient[method](url, body);
            window.alert(response.data.message || `Event ${isEditing ? 'updated' : 'created'} successfully!`);
            setIsModalVisible(false);
            await fetchEvents();
        } catch (error) {
            window.alert(error.response?.data?.message || 'Failed to save event.');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        const ok = window.confirm('Are you sure you want to delete this event?');
        if (!ok) return;
        
        try {
            // ★★★ FIXED: Use apiClient consistently like mobile version ★★★
            await apiClient.delete(`/calendar/${eventId}`);
            await fetchEvents();
        } catch (error) {
            window.alert(error.response?.data?.message || 'Failed to delete event.');
        }
    };

    const currentMonthItems = useMemo(() => {
        const items = [];
        Object.entries(events).forEach(([dateKey, dateItemsArray]) => {
            const [itemYear, itemMonthNum, itemDay] = dateKey.split('-').map(Number);
            if (itemYear === year && itemMonthNum - 1 === month) {
                dateItemsArray.forEach((item) => {
                    items.push({ ...item, day: itemDay });
                });
            }
        });
        return items.sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            return a.time ? -1 : 1;
        });
    }, [month, year, events]);

    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'student') return '/StudentDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        if (user.role === 'donor') return '/DonorDashboard';
        return '/';
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* --- HEADER (unchanged) --- */}
               <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Academic Calendar</h1>
                            <p className="text-xs sm:text-sm text-slate-600">View and manage important dates</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input 
                                    id="module-search" 
                                    type="text" 
                                    value={headerQuery} 
                                    onChange={(e) => setHeaderQuery(e.target.value)} 
                                    placeholder="Search events..." 
                                    className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-200 transition" type="button" title="Home">
                                    <HomeIcon />
                                    <span className="hidden md:inline">Home</span>
                                </button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-200 transition" type="button" title="Calendar">
                                    <CalendarIcon />
                                    <span className="hidden md:inline">Calendar</span>
                                </button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-200 transition" type="button" title="Profile">
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
                                    className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5 sm:p-2 text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
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

            {/* --- CALENDAR CONTENT (rest remains unchanged) --- */}
            <main className="w-full max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
                    
                    {/* Left Column: Event List & Legend */}
                    <div className="lg:col-span-1 xl:col-span-1 space-y-8">
                        <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80">
                            <div className="p-4 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-800">Events for {monthNames[month]}</h2>
                            </div>
                            <div className="max-h-[36rem] overflow-y-auto">
                                {currentMonthItems.length > 0 ? (
                                    <ul>
                                        {currentMonthItems.map(item => (
                                            <li key={item.id} className="flex items-start gap-4 p-4 border-b border-slate-100 last:border-b-0">
                                                <div className="flex-shrink-0 w-12 text-center">
                                                    <p className="text-xs font-semibold text-slate-500">{dayNames[new Date(item.event_date).getDay()]}</p>
                                                    <p className="text-2xl font-bold text-slate-800">{item.day}</p>
                                                </div>
                                                <div className="flex-1 border-l-4 rounded pl-4" style={{ borderColor: eventTypesConfig[item.type]?.color }}>
                                                    <p className="font-semibold text-slate-800">{item.name}</p>
                                                    <p className="text-sm text-slate-500">{item.time || item.type}</p>
                                                    {item.description && <p className="text-sm text-slate-600 mt-1">{item.description}</p>}
                                                    {isAdmin && (
                                                        <div className="flex gap-3 mt-1">
                                                            <button onClick={() => openModalForEdit(item)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                                            <button onClick={() => handleDeleteEvent(item.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center p-12">
                                        <p className="text-slate-500">No events scheduled for {monthNames[month]}.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80 p-4">
                            <h3 className="text-md font-bold text-slate-700 mb-3">Legend</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {Object.entries(eventTypesConfig).map(([key, { color, displayName }]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                                        <span className="text-sm text-slate-600">{displayName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calendar Grid */}
                    <div className="lg:col-span-2 xl:col-span-3 bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4 select-none">
                            <button onClick={() => changeMonth(-1)} type="button" aria-label="Previous month" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-xl sm:text-2xl font-bold text-slate-800">{monthNames[month]} {year}</span>
                            <button onClick={() => changeMonth(1)} type="button" aria-label="Next month" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 border-t border-l border-slate-200">
                            {dayNames.map((day) => (
                                <div key={day} className="text-center py-3 text-xs font-bold text-slate-500 select-none border-r border-b border-slate-200 bg-slate-100">{day}</div>
                            ))}
                            {calendarGrid.map((day, i) => {
                                if (day === null) return <div key={`empty-${i}`} className="h-24 sm:h-28 border-r border-b border-slate-200 bg-slate-100/50" />;
                                
                                const dateKey = formatDateKey(new Date(year, month, day));
                                const dayItems = events[dateKey] || [];
                                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                
                                return (
                                    <button
                                        key={dateKey} 
                                        type="button"
                                        className={`relative group flex flex-col p-2 h-24 sm:h-28 text-left border-r border-b border-slate-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-0 ${isAdmin ? 'hover:bg-blue-100/50 cursor-pointer' : ''}`}
                                        onClick={isAdmin ? () => openModalForNew(dateKey) : undefined} 
                                        disabled={!isAdmin} 
                                    >
                                        <span className={`relative flex items-center justify-center text-sm font-semibold h-7 w-7 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                                            {day}
                                        </span>
                                        <div className="flex-grow overflow-hidden mt-1">
                                            <div className="flex flex-col items-start gap-1">
                                                {dayItems.slice(0, 2).map(item => (
                                                    <div key={item.id} className="flex items-center gap-1.5 w-full">
                                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: eventTypesConfig[item.type]?.color || '#777' }} />
                                                        <p className="text-xs text-slate-600 truncate">{item.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {dayItems.length > 2 && (
                                            <div className="text-xs text-slate-400 font-semibold mt-auto">+{dayItems.length - 2} more</div>
                                        )}
                                        {isAdmin && (
                                            <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold">+</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {isModalVisible && (
                    <>
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsModalVisible(false)} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
                                    <div className="mb-6 px-3 py-1.5 bg-slate-200 border border-slate-300 rounded-full inline-block">
                                        <span className="font-semibold text-slate-700">{selectedDate}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-600 mb-1 block">Type</label>
                                            <select 
                                                value={eventDetails.type} 
                                                onChange={e => setEventDetails(p => ({ ...p, type: e.target.value }))} 
                                                className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                {Object.entries(eventTypesConfig).map(([key, { displayName }]) => (
                                                    <option key={key} value={key}>{displayName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-600 mb-1 block">Title</label>
                                            <input 
                                                type="text" 
                                                value={eventDetails.name} 
                                                onChange={e => setEventDetails({ ...eventDetails, name: e.target.value })} 
                                                className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                                                placeholder="Event Title" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-600 mb-1 block">Time (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={eventDetails.time} 
                                                onChange={e => setEventDetails({ ...eventDetails, time: e.target.value })} 
                                                className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                                                placeholder="e.g., 10:00 AM" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-600 mb-1 block">Description (Optional)</label>
                                            <textarea 
                                                value={eventDetails.description} 
                                                onChange={e => setEventDetails({ ...eventDetails, description: e.target.value })} 
                                                className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg resize-y" 
                                                rows={3} 
                                                placeholder="Details..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 justify-end mt-6 pt-4 border-t border-slate-200">
                                        <button 
                                            onClick={() => setIsModalVisible(false)} 
                                            type="button" 
                                            className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveEvent} 
                                            type="button" 
                                            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {editingEvent ? 'Save Changes' : 'Add Event'}
                                        </button>
                                    </div>
                                    {editingEvent && (
                                        <div className="mt-4 border-t border-slate-200 pt-4">
                                            <button 
                                                onClick={() => { 
                                                    if (window.confirm('Are you sure?')) { 
                                                        handleDeleteEvent(editingEvent.id); 
                                                        setIsModalVisible(false); 
                                                    }
                                                }} 
                                                type="button" 
                                                className="w-full px-5 py-2.5 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                Delete Event
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
