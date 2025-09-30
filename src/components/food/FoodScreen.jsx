"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { MdArrowBack } from 'react-icons/md';
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
// Add this ProfileAvatar component code after your existing icon components
function ProfileAvatar({ className = "w-7 h-7 sm:w-9 sm:h-9" }) {
  const { getProfileImageUrl } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const hasValidImage = getProfileImageUrl() && !imageError && imageLoaded
  
  return (
   <div className="relative w-7 h-7 sm:w-9 sm:h-9">
  {/* Always render the user placeholder with dark outer ring */}
  <div className={`absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center border-2 border-slate-400 transition-opacity duration-200 ${hasValidImage ? 'opacity-0' : 'opacity-100'}`}>
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
    </svg>
  </div>
  
  {/* Profile image overlay with dark outer ring */}
  {getProfileImageUrl() && (
    <img 
      src={getProfileImageUrl()} 
      alt="Profile" 
      className={`absolute inset-0 w-full h-full rounded-full border-2 border-slate-700 object-cover transition-opacity duration-200 ${hasValidImage ? 'opacity-100' : 'opacity-0'}`}
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


const ORDERED_DAYS = [
  { full: 'Monday', short: 'Mon' }, { full: 'Tuesday', short: 'Tue' }, { full: 'Wednesday', short: 'Wed' },
  { full: 'Thursday', short: 'Thu' }, { full: 'Friday', short: 'Fri' }, { full: 'Saturday', short: 'Sat' },
  { full: 'Sunday', short: 'Sun' },
];
const MEAL_TYPES = ['Tiffin', 'Lunch', 'Snacks', 'Dinner'];

const alertError = (title, message) => {
  alert(`${title}: ${message}`);
};

const FoodScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- State for Food Menu functionality ---
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalInfo, setModalInfo] = useState({ visible: false, mode: null, data: null });
  const [imageError, setImageError] = useState(false)

  // --- Hooks for Header Functionality ---
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

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        // ★★★ FIXED: Use apiClient correctly ★★★
        const res = await apiClient.get(`/profiles/${user.id}`);
        setProfile(res.data);
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

  // --- Hooks for Food Menu Functionality ---
  const fetchMenu = useCallback(() => {
    setLoading(true);
    // ★★★ FIXED: Use apiClient correctly like mobile version ★★★
    apiClient.get('/food-menu')
      .then(res => setMenuData(res.data))
      .catch(() => alertError("Error", "Could not fetch the food menu."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // --- Helper Functions ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/");
    }
  };

  const getDefaultDashboardRoute = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/AdminDashboard";
    if (user.role === "teacher") return "/TeacherDashboard";
    if (user.role === "student") return "/StudentDashboard";
    if (user.role === 'donor') return '/DonorDashboard';
    return "/";
  };

  const openModal = (mode, data) => setModalInfo({ visible: true, mode, data });
  const closeModal = () => setModalInfo({ visible: false, mode: null, data: null });

  const handleSave = values => {
    if (!user) return;
    const { mode, data } = modalInfo;

    let url = '';
    let body = {};

    if (mode === 'editFood') {
      url = `/food-menu/${data.id}`;
      body = { food_item: values.food_item, editorId: user.id };
    } else if (mode === 'editTime') {
      url = '/food-menu/time';
      body = { meal_type: data.meal_type, meal_time: values.meal_time, editorId: user.id };
    } else {
      return;
    }

    const originalData = JSON.parse(JSON.stringify(menuData));
    if (mode === 'editFood') {
      const updated = { ...menuData };
      updated[data.day_of_week] = updated[data.day_of_week].map(m =>
        m.id === data.id ? { ...m, food_item: values.food_item } : m
      );
      setMenuData(updated);
    }

    closeModal();

    // ★★★ FIXED: Use apiClient consistently like mobile version ★★★
    apiClient.put(url, body)
      .then(() => {
        if (mode === 'editTime') {
          fetchMenu();
        }
      })
      .catch(error => {
        alertError("Error", error.response?.data?.message || "An error occurred.");
        setMenuData(originalData); // Revert on error
      });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Weekly Food Menu</h1>
              <p className="text-xs sm:text-sm text-slate-600">View and manage meal schedules</p>
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
                 {/* <img 
  src={imageError ? "/assets/profile.png" : (getProfileImageUrl() || "/assets/profile.png")} 
  alt="Profile" 
  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" 
  onError={(e) => { 
    if (!imageError) {
      setImageError(true)
    }
  }}
  onLoad={() => setImageError(false)}
/> */}
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
          <button
            onClick={() => navigate(getDefaultDashboardRoute())}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            title="Back to Dashboard"
          >
            <MdArrowBack />
            <span>Back to Dashboard</span>
          </button>
        </div>
        {loading || loadingProfile ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <FoodMenuTable
            menuData={menuData}
            isAdmin={user?.role === 'admin'}
            onEditFood={meal => openModal('editFood', meal)}
            onEditTime={type => openModal('editTime', type)}
          />
        )}
      </main>

      {modalInfo.visible && (
        <EditMenuModal
          modalInfo={modalInfo}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// -------- TABLE COMPONENT (unchanged) -----------
const FoodMenuTable = ({ menuData, isAdmin, onEditFood, onEditTime }) => {
  const getMealForCell = (day, mealType) => menuData[day]?.find(m => m.meal_type === mealType);
  const getHeaderTime = (mealType) => menuData['Monday']?.find(m => m.meal_type === mealType)?.meal_time || '';

  return (
    <div className="p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Menu Schedule</h2>
        {isAdmin && (
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Admin Mode - Click to Edit
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[768px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-20 py-3 px-4 text-left font-semibold text-slate-700 text-sm">Day</th>
                {MEAL_TYPES.map((mealType) => (
                  <th key={mealType} className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        onEditTime({
                          meal_type: mealType,
                          meal_time: getHeaderTime(mealType),
                        })
                      }
                      disabled={!isAdmin}
                      className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${
                        isAdmin 
                          ? 'hover:bg-slate-100 rounded-lg p-1 cursor-pointer' 
                          : 'cursor-default'
                      }`}
                    >
                      <span className="font-semibold text-slate-700 text-sm">{mealType}</span>
                      <span className="text-xs font-medium text-slate-500 mt-1">
                        {getHeaderTime(mealType)}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERED_DAYS.map(({ full, short }, dayIndex) => (
                <tr 
                  key={full} 
                  className="border-t border-slate-200/80 hover:bg-blue-50/30 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-blue-700 font-bold text-sm bg-slate-50/50">
                    <span className="hidden sm:inline">{full}</span>
                    <span className="sm:hidden">{short}</span>
                  </td>
                  {MEAL_TYPES.map((mealType) => {
                    const meal = getMealForCell(full, mealType);
                    const disabled = !isAdmin || !meal;
                    return (
                      <td key={mealType} className="border-l border-slate-200/80 p-0">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => meal && onEditFood(meal)}
                          className={`
                            w-full h-full block min-h-[4rem]
                            text-center text-sm
                            px-2 py-3
                            transition-all duration-200
                            ${
                              disabled
                                ? 'text-gray-400 italic cursor-not-allowed'
                                : 'text-slate-800 font-semibold cursor-pointer hover:bg-blue-100/50 hover:text-blue-800'
                            }
                          `}
                          title={meal?.food_item || 'Not set'}
                        >
                          <span className="leading-tight">
                            {meal?.food_item || 'Not set'}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---------- MODAL COMPONENT (unchanged) ------------
const EditMenuModal = ({ modalInfo, onClose, onSave }) => {
  const { mode, data } = modalInfo;
  const [foodItem, setFoodItem] = useState('');
  const [mealTime, setMealTime] = useState('');

  useEffect(() => {
    if (mode === 'editFood') setFoodItem(data?.food_item || '');
    else if (mode === 'editTime') setMealTime(data?.meal_time || '');
  }, [mode, data]);

  const handleSavePress = () => {
    if (mode === 'editFood') onSave({ food_item: foodItem });
    else if (mode === 'editTime') onSave({ meal_time: mealTime });
  };

  const handleClearPress = () => {
    if (mode === 'editFood') onSave({ food_item: '' });
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/20 transform transition-all duration-300 scale-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 id="modalTitle" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {mode === 'editFood'
              ? `Edit ${data.day_of_week} ${data.meal_type}`
              : `Edit ${data.meal_type} Time`}
          </h2>
        </div>

        {mode === 'editFood' && (
          <div className="mb-4">
            <label htmlFor="foodItem" className="block text-slate-700 font-semibold mb-2 text-sm">Food Item</label>
            <input
              id="foodItem"
              type="text"
              className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl p-3 text-base bg-white/90 transition-all duration-200"
              value={foodItem}
              onChange={e => setFoodItem(e.target.value)}
              placeholder="e.g., Rice & Dal"
              autoFocus
            />
          </div>
        )}

        {mode === 'editTime' && (
          <div className="mb-4">
            <label htmlFor="mealTime" className="block text-slate-700 font-semibold mb-2 text-sm">Time</label>
            <input
              id="mealTime"
              type="text"
              className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl p-3 text-base bg-white/90 transition-all duration-200"
              value={mealTime}
              onChange={e => setMealTime(e.target.value)}
              placeholder="e.g., 1:00 PM - 2:00 PM"
              autoFocus
            />
          </div>
        )}

        <div className="space-y-3 mt-6">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={handleSavePress}
            type="button"
          >
            Save Changes
          </button>
          
          {mode === 'editFood' && (
            <button
              className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-red-600 py-3 rounded-xl font-semibold text-base transition-all duration-200"
              onClick={handleClearPress}
              type="button"
            >
              Clear Entry
            </button>
          )}
          
          <button
            className="w-full text-center text-slate-500 hover:text-slate-700 py-2 text-base font-semibold transition-colors duration-200"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodScreen;
