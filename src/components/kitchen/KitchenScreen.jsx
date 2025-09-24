"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE_URL } from '../../apiConfig';
import {
  MdCalendarToday,
  MdAdd,
  MdImageNotSupported,
  MdCameraAlt,
  MdRemove,
  MdAddCircleOutline,
  MdEdit,
  MdDelete,
  MdKitchen,
  MdAssessment,
  MdArrowBack, // +++ ADDED THIS IMPORT +++
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


const KitchenScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // State for the Header
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // State for Kitchen functionality
  const [activeTab, setActiveTab] = useState('Daily');
  const [provisions, setProvisions] = useState([]);
  const [usage, setUsage] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [permanentInventory, setPermanentInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({ mode: '', item: null });
  
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

  // Fetch data for Kitchen
  const fetchData = useCallback(() => {
    setLoading(true);
    const dateString = selectedDate.toISOString().split('T')[0];

    Promise.all([
      fetch(`${API_BASE_URL}/api/kitchen/inventory`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/kitchen/usage?date=${dateString}`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/permanent-inventory`).then((res) => res.json()),
    ])
      .then(([provisionsData, usageData, permanentData]) => {
        setProvisions(provisionsData || []);
        setUsage(usageData || []);
        setPermanentInventory(permanentData || []);
      })
      .catch(() => window.alert('Error: Could not fetch kitchen data.'))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    return "/";
  };

  const openModal = (mode, item = null) => {
    setModalInfo({ mode, item });
    setIsModalVisible(true);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchData();
  };

  const handleDeletePermanentItem = (item) => {
    if (window.confirm(`Delete "${item.item_name}"?\nAre you sure you want to permanently delete this item?`)) {
      fetch(`${API_BASE_URL}/api/permanent-inventory/${item.id}`, { method: 'DELETE' })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to delete');
          window.alert('Success: Item deleted.');
          fetchData();
        })
        .catch(() => window.alert('Error: Could not delete the item.'));
    }
  };

  const formatDateInputValue = (date) => date.toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Kitchen Management</h1>
              <p className="text-xs sm:text-sm text-slate-600">Manage daily provisions and inventory</p>
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
        {/* +++ ADDED THIS BACK BUTTON +++ */}
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

        {(loadingProfile && !profile) ? (
            <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <button
                  disabled={activeTab !== 'Daily'}
                  onClick={() => setShowDatePicker(true)}
                  className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      activeTab === 'Daily'
                      ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
                      : 'text-gray-300 cursor-not-allowed bg-gray-50'
                  } shadow-sm border border-slate-200`}
                  aria-label="Select date"
                  title={activeTab === 'Daily' ? 'Select date' : 'Calendar disabled'}
                >
                  <MdCalendarToday size={20} />
                </button>
                <div className="hidden sm:flex items-center space-x-6 text-center">
                  {activeTab === 'Daily' && (
                    <>
                    <div>
                      <div className="text-xl font-bold text-slate-800">{provisions.length}</div>
                      <div className="text-xs text-slate-500 font-medium">Provisions</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-slate-800">{usage.length}</div>
                      <div className="text-xs text-slate-500 font-medium">Used Today</div>
                    </div>
                    </>
                  )}
                  {activeTab === 'Inventory' && (
                    <div>
                    <div className="text-xl font-bold text-slate-800">{permanentInventory.length}</div>
                    <div className="text-xs text-slate-500 font-medium">Assets</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openModal(activeTab === 'Daily' ? 'addProvision' : 'addPermanentItem')}
                  className="p-2.5 rounded-xl text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm border border-slate-200"
                  aria-label="Add new item"
                >
                  <MdAdd size={20} />
                </button>
              </div>
              <div className="mt-4 flex justify-center">
                <div className="w-full max-w-xs flex bg-slate-200 p-1 rounded-xl space-x-1 shadow-inner border border-slate-300/60">
                  {['Daily', 'Inventory'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          activeTab === tab
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showDatePicker && activeTab === 'Daily' && (
              <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
              <input
                type="date"
                value={formatDateInputValue(selectedDate)}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                onBlur={() => setShowDatePicker(false)}
                max={formatDateInputValue(new Date())}
                className="w-full max-w-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-sm text-sm font-medium"
                autoFocus
              />
              </div>
            )}
            
            <div className="p-4 sm:p-6 space-y-8">
              {loading ? (
                <LoadingSpinner />
              ) : activeTab === 'Daily' ? (
                <>
                  <Section title="Daily Usage" date={selectedDate.toLocaleDateString()}>
                  {usage.length > 0 ? (
                    <DataTable type="usage" data={usage} />
                  ) : (
                    <EmptyMessage message="No items used on this date." />
                  )}
                  </Section>
                  <Section title="Remaining Provisions">
                  {provisions.length > 0 ? (
                    <DataTable type="provisions" data={provisions} onLogUsage={(item) => openModal('logUsage', item)} />
                  ) : (
                    <EmptyMessage message="No provisions remaining." />
                  )}
                  </Section>
                </>
              ) : (
                <Section title="Permanent Assets">
                  {permanentInventory.length > 0 ? (
                  <DataTable type="permanent" data={permanentInventory} onEdit={(item) => openModal('editPermanentItem', item)} onDelete={handleDeletePermanentItem} />
                  ) : (
                  <EmptyMessage message="No permanent items found. Click '+' to add one." />
                  )}
                </Section>
              )}
            </div>
          </div>
        )}
      </main>

      {isModalVisible && (
        <ActionModal
          info={modalInfo}
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};


// --- Sub-components (LoadingSpinner, Section, etc.) ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-16">
      <div className="relative">
        <div className="h-10 w-10 border-4 border-slate-200 rounded-full border-t-blue-500 animate-spin shadow-lg"></div>
        <div className="absolute inset-0 h-10 w-10 border-4 border-transparent rounded-full border-r-blue-400 animate-pulse"></div>
      </div>
    </div>
  );
  
  const Section = ({ title, date, children }) => (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-wide flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <span>{title}</span>
        </h2>
        {date && (
          <div className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200/60">
            <p className="text-sm text-blue-700 font-medium">{date}</p>
          </div>
        )}
      </div>
      {children}
    </section>
  );
  
  const EmptyMessage = ({ message }) => (
    <div className="text-center py-12 bg-white/60 rounded-xl border border-slate-200">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
        <MdKitchen size={28} className="text-slate-400" />
      </div>
      <p className="text-lg text-slate-600 font-medium">{message}</p>
    </div>
  );
  
  const DataTable = ({ type, data, onLogUsage, onEdit, onDelete }) => {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 sm:p-4 w-8 sm:w-12 text-left font-semibold text-slate-700 text-sm">#</th>
                <th className="p-3 sm:p-4 text-left font-semibold text-slate-700 text-sm">Item Name</th>
                <th className="p-3 sm:p-4 w-20 sm:w-28 text-center font-semibold text-slate-700 text-sm">
                  {type === 'usage' ? 'Used' : 'Total'}
                </th>
                {type === 'permanent' && (
                  <th className="p-3 sm:p-4 w-20 sm:w-28 text-right font-semibold text-slate-700 text-sm">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={`${type}-${item.id}`}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-blue-50/50 transition-colors duration-200"
                >
                  <td className="p-3 sm:p-4 text-slate-700 font-medium text-sm">{index + 1}</td>
                  <td
                    className={`p-3 sm:p-4 cursor-${
                      type === 'provisions' ? 'pointer' : 'default'
                    }`}
                    onClick={() => type === 'provisions' && onLogUsage?.(item)}
                  >
                    <div className="flex items-center space-x-3">
                      {item.image_url ? (
                        <img
                          src={`${API_BASE_URL}${item.image_url}`}
                          alt={item.item_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <MdImageNotSupported size={14} />
                        </div>
                      )}
                      <span className="font-medium text-slate-800 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                        {item.item_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-center text-slate-700 whitespace-nowrap font-medium text-sm">
                    <div className="bg-blue-50 px-2 py-1 rounded-full inline-block border border-blue-200/60">
                      {type === 'usage'
                        ? `${item.quantity_used} ${item.unit}`
                        : type === 'provisions'
                        ? `${item.quantity_remaining} ${item.unit}`
                        : `${item.total_quantity}`}
                    </div>
                  </td>
                  {type === 'permanent' && (
                    <td className="p-3 sm:p-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => onEdit?.(item)}
                          title="Edit"
                          aria-label="Edit item"
                          className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transform hover:scale-105 transition-all duration-200 border border-blue-200/60"
                        >
                          <MdEdit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete?.(item)}
                          title="Delete"
                          aria-label="Delete item"
                          className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transform hover:scale-105 transition-all duration-200 border border-red-200/60"
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const ActionModal = ({ info, visible, onClose, onSuccess }) => {
    const { mode, item } = info;
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [unit, setUnit] = useState('g');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const UNITS = ['g', 'kg', 'l', 'ml', 'pcs'];
  
    useEffect(() => {
      if (visible) {
        setItemName(item?.item_name || '');
        setUnit(item?.unit || 'g');
        setNotes(item?.notes || '');
        setQuantity(item?.total_quantity || item?.quantity_remaining || 1);
        setImage(null);
        setLoading(false);
      }
    }, [visible, mode, item]);
  
    const handleFileChange = (e) => {
      const files = e.target.files;
      if (files && files[0]) setImage(files[0]);
    };
  
    const handleAction = async () => {
      if (!itemName.trim() && mode !== 'logUsage') {
        window.alert('Validation Error: Item Name is required.');
        return;
      }
      setLoading(true);
  
      let url = '';
      let method = 'POST';
      let headers = {};
      let body;
  
      if (mode === 'logUsage') {
        url = `${API_BASE_URL}/api/kitchen/usage`;
        headers = { 'Content-Type': 'application/json' };
        body = JSON.stringify({
          inventoryId: item.id,
          quantityUsed: quantity,
          usageDate: new Date().toISOString().split('T')[0],
        });
      } else {
        const formData = new FormData();
        formData.append('itemName', itemName);
        if (image) {
          formData.append('itemImage', image, image.name);
        }
        if (mode === 'addProvision') {
          url = `${API_BASE_URL}/api/kitchen/inventory`;
          formData.append('quantity', String(quantity));
          formData.append('unit', unit);
          body = formData;
          headers = {};
        } else if (mode === 'addPermanentItem') {
          url = `${API_BASE_URL}/api/permanent-inventory`;
          formData.append('totalQuantity', String(quantity));
          formData.append('notes', notes);
          body = formData;
          headers = {};
        } else if (mode === 'editPermanentItem') {
          url = `${API_BASE_URL}/api/permanent-inventory/${item.id}`;
          method = 'PUT';
          formData.append('totalQuantity', String(quantity));
          formData.append('notes', notes);
          body = formData;
          headers = {};
        } else {
          setLoading(false);
          return;
        }
      }
  
      try {
        const res = await fetch(url, { method, headers, body });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'An unknown server error.');
        }
        onSuccess();
      } catch (e) {
        window.alert(`Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    const getTitle = () => {
      switch (mode) {
        case 'addProvision': return 'Add New Provision';
        case 'logUsage': return `Log Usage for ${item?.item_name || ''}`;
        case 'addPermanentItem': return 'Add Permanent Item';
        case 'editPermanentItem': return 'Edit Permanent Item';
        default: return 'Action';
      }
    };
  
    const getButtonText = () => {
      switch (mode) {
        case 'addProvision': return 'Add Provision';
        case 'logUsage': return 'Log Usage';
        case 'addPermanentItem': return 'Add Item';
        case 'editPermanentItem': return 'Save Changes';
        default: return 'Save';
      }
    };
  
    if (!visible) return null;
  
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
        style={{ paddingTop: '2vh', paddingBottom: '2vh' }}
      >
        <div
          className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 w-full max-w-md sm:max-w-lg relative transform transition-all duration-500 ease-in-out scale-100 hover:shadow-3xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              {getTitle()}
            </h3>
  
            {(mode === 'addProvision' || mode === 'addPermanentItem' || mode === 'editPermanentItem') && (
              <>
                <input
                  type="text"
                  placeholder="Item Name (e.g., Tomatoes)"
                  className="w-full mb-4 px-3 py-2.5 border-2 border-slate-200/60 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-inner text-sm font-medium"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  autoFocus
                />
              </>
            )}
  
            {(mode === 'addProvision' || mode === 'addPermanentItem' || mode === 'editPermanentItem') && (
              <>
                <label className="block text-slate-600 font-semibold mb-2 text-sm">
                  {mode === 'addProvision' ? 'Unit' : 'Change Image (Optional)'}
                </label>
  
                {mode === 'addProvision' && (
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {UNITS.map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        type="button"
                        className={`py-1.5 px-2 rounded-lg border-2 transition-all duration-300 text-sm ${
                            unit === u
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'border-slate-200/60 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
                        } font-semibold`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
  
                {(mode === 'addPermanentItem' || mode === 'editPermanentItem') && (
                  <FileInput
                    image={image}
                    existingImageUrl={item?.image_url ? `${API_BASE_URL}${item.image_url}` : undefined}
                    onChange={handleFileChange}
                  />
                )}
  
                {mode === 'addProvision' && (
                  <FileInput image={image} onChange={handleFileChange} />
                )}
  
                {(mode === 'addPermanentItem' || mode === 'editPermanentItem') && (
                  <>
                    <label className="block text-center text-slate-600 font-semibold mb-3 text-sm">
                      Total Quantity
                    </label>
                    <QuantityControl quantity={quantity} setQuantity={setQuantity} min={1} />
                    <textarea
                      placeholder="Notes (e.g., 'In top cabinet')"
                      className="w-full h-20 mb-4 px-3 py-2.5 border-2 border-slate-200/60 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-inner text-sm font-medium"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </>
                )}
  
                {mode === 'addProvision' && (
                  <>
                    <label className="block text-center text-slate-600 font-semibold mb-3 text-sm">
                      Initial Quantity
                    </label>
                    <QuantityControl quantity={quantity} setQuantity={setQuantity} min={1} />
                  </>
                )}
              </>
            )}
  
            {mode === 'logUsage' && (
              <>
                <label className="block text-center text-slate-600 font-semibold mb-3 text-sm">{`Quantity Used (${item?.unit || ''})`}</label>
                <QuantityControl quantity={quantity} setQuantity={setQuantity} min={1} />
              </>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
                <button
                    onClick={onClose}
                    className="w-full sm:w-auto flex-1 sm:flex-none sm:px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors duration-200"
                    type="button"
                >
                    Cancel
                </button>
                <button
                    disabled={loading}
                    onClick={handleAction}
                    className={`w-full sm:w-auto flex-1 sm:flex-none sm:px-6 py-2.5 rounded-xl text-white font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    loading 
                        ? 'bg-blue-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                >
                    {loading ? <SpinnerSmall /> : getButtonText()}
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const FileInput = ({ image, existingImageUrl, onChange }) => (
    <label className="relative cursor-pointer rounded-xl border-2 border-dashed border-slate-200/60 flex flex-col items-center justify-center h-28 mb-4 bg-slate-50/50 overflow-hidden hover:border-blue-600 transition-all duration-300">
      {image ? (
        <img src={URL.createObjectURL(image)} alt="Selected" className="h-full w-full object-cover rounded-xl" />
      ) : existingImageUrl ? (
        <img src={existingImageUrl} alt="Existing" className="h-full w-full object-cover rounded-xl" />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400">
          <MdCameraAlt size={20} />
          <p className="mt-1 text-sm font-medium">Click to select image</p>
        </div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  );
  
  const QuantityControl = ({ quantity, setQuantity, min = 1 }) => {
    const onChangeQuantity = (val) => {
      let n = parseInt(val, 10);
      if (isNaN(n)) n = min;
      if (n < min) n = min;
      setQuantity(n);
    };
  
    return (
      <div className="flex justify-center items-center space-x-2 mb-4">
        <button
          onClick={() => setQuantity((q) => Math.max(min, q - 1))}
          className="bg-slate-100 border border-slate-200/60 rounded-lg p-1.5 hover:bg-slate-200 transition-colors duration-300 transform hover:scale-105 active:scale-95"
          title="Decrease quantity"
          type="button"
        >
          <MdRemove size={16} className="text-blue-600" />
        </button>
        <input
          type="number"
          className="w-16 text-center font-bold text-lg border-2 border-slate-200/60 rounded-lg py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-inner"
          value={quantity}
          onChange={(e) => onChangeQuantity(e.target.value)}
          min={min}
        />
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="bg-slate-100 border border-slate-200/60 rounded-lg p-1.5 hover:bg-slate-200 transition-colors duration-300 transform hover:scale-105 active:scale-95"
          title="Increase quantity"
          type="button"
        >
          <MdAddCircleOutline size={16} className="text-blue-600" />
        </button>
      </div>
    );
  };
  
  const SpinnerSmall = () => (
    <div className="flex justify-center">
      <div className="relative">
        <div className="h-5 w-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
      </div>
    </div>
  );

export default KitchenScreen;