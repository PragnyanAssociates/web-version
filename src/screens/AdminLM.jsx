import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ FIXED: Updated imports
import apiClient from '../api/client';
import { SERVER_URL } from '../apiConfig';
import { FaUser, FaKey, FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.tsx';
import { MdArrowBack } from 'react-icons/md'; // Added for consistent back button


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




// ✅ FIXED: Updated constants to include 'Admins' and 'admin' role
const CLASS_CATEGORIES = [
    'Admins', 'Teachers', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
];
const USER_ROLES = ['admin', 'teacher', 'student'];


export default function AdminLM() {
    const navigate = useNavigate();
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    // --- Component State ---
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingUser, setEditingUser] = useState(null);
    // --- State for Master-Detail View ---
    const [selectedClass, setSelectedClass] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    // --- State for Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);


    // ✅ FIXED: Updated fetchProfile function
    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const response = await apiClient.get(`/profiles/${user.id}`);
                setProfile(response.data);
            } catch {
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


    // ✅ FIXED: Updated fetchUnreadNotifications function
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) { 
                setUnreadCount?.(0); 
                return; 
            }
            try {
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


    // --- Helper Functions ---
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate("/");
        }
    };


    // ✅ FIXED: Updated fetchUsers function
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/users');
            setUsers(response.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to fetch users.');
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);


    // ✅ FIXED: Updated groupedUsers to handle Admins
    const groupedUsers = useMemo(() => {
        const groups = {};
        CLASS_CATEGORIES.forEach(category => {
            if (category === 'Admins') {
                groups[category] = users.filter(user => user.role === 'admin');
            } else {
                groups[category] = users.filter(user => user.class_group === category);
            }
        });
        return groups;
    }, [users]);


    const handleSelectClass = (className) => {
        setSelectedClass(className);
        setCurrentPage(1);
        setSearchQuery("");
    };


    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', full_name: '', role: 'student', class_group: 'LKG', subjects_taught: [] });
        setIsModalVisible(true);
    };


    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({ ...user, password: '', subjects_taught: user.subjects_taught || [] });
        setIsModalVisible(true);
    };


    // ✅ FIXED: Updated handleSave function
    const handleSave = async () => {
        if (!formData.username || !formData.full_name) {
            return alert('Username and Full Name are required.');
        }
        if (!editingUser && !formData.password) {
            return alert('Password is required for new users.');
        }
        
        const payload = { ...formData };
        if (editingUser && !payload.password) {
            delete payload.password; // Don't send empty password for updates
        }
        if (payload.role === 'student' || payload.role === 'admin') {
            delete payload.subjects_taught; // Students and admins don't have subjects
        }
        if (payload.role === 'admin') {
            payload.class_group = 'Admins'; // Auto-assign Admins group
        }
        
        const isEditing = !!editingUser;
        
        try {
            if (isEditing) {
                await apiClient.put(`/users/${editingUser.id}`, payload);
            } else {
                await apiClient.post('/users', payload);
            }
            
            alert(`User ${isEditing ? 'updated' : 'created'} successfully!`);
            setIsModalVisible(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'An error occurred while saving.');
        }
    };


    // ✅ FIXED: Updated handleDelete function
    const handleDelete = (user) => {
        if (window.confirm(`Are you sure you want to delete "${user.full_name}"?`)) {
            apiClient.delete(`/users/${user.id}`)
                .then(() => {
                    alert(`"${user.full_name}" was removed successfully.`);
                    fetchUsers();
                })
                .catch(error => {
                    alert(error.response?.data?.message || 'Failed to delete the user.');
                });
        }
    };


    // ✅ FIXED: Updated handleResetPassword function
    const handleResetPassword = (user) => {
        const newPassword = prompt(`Enter a new temporary password for "${user.full_name}":`);
        if (!newPassword || newPassword.trim() === '') {
            return alert('Password cannot be empty.');
        }
        
        apiClient.patch(`/users/${user.id}/reset-password`, { newPassword })
            .then(response => {
                alert(response.data.message);
            })
            .catch(error => {
                alert(error.response?.data?.message || 'An unknown error occurred.');
            });
    };


    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        return '/';
    };


    // --- Data processing for the current view ---
    const usersInSelectedClass = useMemo(() => {
        if (!selectedClass) return [];
        return (groupedUsers[selectedClass] || []).filter(user =>
            user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [selectedClass, groupedUsers, searchQuery]);


    const currentUsersOnPage = usersInSelectedClass.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
    const totalPages = Math.ceil(usersInSelectedClass.length / usersPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }


    const isEditing = !!editingUser;


    return (
        <div className="min-h-screen bg-slate-50">
               <header className="border-b border-slate-200 bg-slate-100">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">User Management</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Administer all user accounts</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
                            </div>
                            <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />
                            <div className="flex items-center gap-2 sm:gap-3">
                                  <ProfileAvatar />
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                                    <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                                </div>
                                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
                                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50" title="Notifications" type="button">
                                    <BellIcon />
                                    {unreadCount > 0 && (<span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="min-h-screen relative overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
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


                    <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center mb-6">
                        <button onClick={openAddModal} className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-medium">
                            <FaPlus className="mr-2" size={16} /> Add User
                        </button>
                    </div>
                    <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
                        {!selectedClass ? (
                            // --- MASTER VIEW (Table of Classes) ---
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500 rounded-lg overflow-hidden">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-200">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Class / Group</th>
                                            <th scope="col" className="px-6 py-3">User Count</th>
                                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-slate-50/50 divide-y divide-slate-200">
                                        {CLASS_CATEGORIES.map((className) => (
                                            <tr key={className} className="hover:bg-slate-100/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                                    {className}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                                                        {groupedUsers[className]?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleSelectClass(className)}
                                                        className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        View Users
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // --- DETAIL VIEW (Table of Users) ---
                            <div className="p-5 sm:p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
                                    <button onClick={() => setSelectedClass(null)} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"><FaArrowLeft />Back to All Classes</button>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 order-first sm:order-none">Users in <span className="text-blue-600">{selectedClass}</span></h2>
                                    <input type="text" placeholder="Search in this class..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-auto rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>


                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-slate-500 rounded-lg overflow-hidden">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-200">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">Full Name</th>
                                                <th scope="col" className="px-6 py-3">Username</th>
                                                <th scope="col" className="px-6 py-3">Role</th>
                                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-slate-50/50 divide-y divide-slate-200">
                                            {currentUsersOnPage.length > 0 ? currentUsersOnPage.map(user => (
                                                <tr key={user.id} className="hover:bg-slate-100/50">
                                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{user.full_name}</td>
                                                    <td className="px-6 py-4">{user.username}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end items-center space-x-2">
                                                            <button onClick={() => handleResetPassword(user)} className="p-2 rounded-full hover:bg-yellow-100" title="Reset Password"><FaKey className="text-yellow-500" size={16} /></button>
                                                            <button onClick={() => openEditModal(user)} className="p-2 rounded-full hover:bg-blue-100" title="Edit User"><FaEdit className="text-blue-500" size={16} /></button>
                                                            <button onClick={() => handleDelete(user)} className="p-2 rounded-full hover:bg-red-100" title="Delete User"><FaTrash className="text-red-500" size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-16 text-slate-500 italic">No users found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center mt-6 space-x-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                            <button key={number} onClick={() => paginate(number)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === number ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}>{number}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {isModalVisible && (
                         <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border max-h-[90vh] overflow-y-auto">
                                 <div className="p-6 sm:p-8">
                                     <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-6 text-center">{isEditing ? 'Edit User' : 'Add New User'}</h2>
                                     <div className="space-y-4">
                                         <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-2">Username (Student ID / Teacher Email):</label>
                                             <input type="text" className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" placeholder="e.g., STU101 or teacher@school.com" value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                         </div>
                                         <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-2">{isEditing ? 'New Password (Optional)' : 'Password'}</label>
                                             <input type="password" className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" placeholder={isEditing ? 'Leave blank to keep current' : 'Enter temporary password'} value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                         </div>
                                         <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name:</label>
                                             <input type="text" className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                                         </div>
                                         <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-2">Role:</label>
                                             <select className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" value={formData.role || 'student'} onChange={(e) => {
                                                 const newRole = e.target.value;
                                                 const newClassGroup = newRole === 'teacher' ? 'Teachers' : 
                                                                      (newRole === 'admin' ? 'Admins' : formData.class_group || 'LKG');
                                                 setFormData({ ...formData, role: newRole, class_group: newClassGroup });
                                             }}>
                                                 {USER_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
                                             </select>
                                         </div>
                                         {formData.role === 'teacher' ? (
                                             <div>
                                                 <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects Taught (comma-separated):</label>
                                                 <input type="text" className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" placeholder="e.g., Mathematics, Science" value={formData.subjects_taught?.join(', ') || ''} onChange={(e) => setFormData({ ...formData, subjects_taught: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                                             </div>
                                         ) : formData.role === 'student' ? (
                                             <div>
                                                 <label className="block text-sm font-semibold text-gray-700 mb-2">Class / Group:</label>
                                                 <select className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" value={formData.class_group || 'LKG'} onChange={(e) => setFormData({ ...formData, class_group: e.target.value })}>
                                                     {CLASS_CATEGORIES.filter(c => c !== 'Teachers' && c !== 'Admins').map(level => <option key={level} value={level}>{level}</option>)}
                                                 </select>
                                             </div>
                                         ) : null}
                                     </div>
                                     <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
                                         <button className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 px-6 py-3 rounded-xl text-white font-semibold hover:from-gray-500 hover:to-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105" onClick={() => setIsModalVisible(false)}>Cancel</button>
                                         <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105" onClick={handleSave}>{isEditing ? 'Save Changes' : 'Add User'}</button>
                                     </div>
                                </div>
                             </div>
                         </div>
                    )}
                </div>
            </main>
        </div>
    );
}
