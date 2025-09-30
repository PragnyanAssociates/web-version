"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// ✅ FIXED: Updated imports
import apiClient from "../../api/client";
import { SERVER_URL } from "../../apiConfig";
import { useAuth } from "../../context/AuthContext.tsx";
import { MdFolder, MdEdit, MdDelete, MdDownload, MdLaunch, MdAdd, MdFileUpload, MdLink, MdArrowBack } from 'react-icons/md';

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

// ✅ FIXED: Move FormInput and FormSelect components OUTSIDE the modal component
const FormInput = ({ id, value, onChange, placeholder, required }) => (
  <input
    id={id}
    className="w-full border-2 border-slate-200/60 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-inner text-base font-medium"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
  />
);

const FormSelect = ({ id, value, onChange, children, required }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className="w-full border-2 border-slate-200/60 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-inner text-base font-medium"
    required={required}
  >
    {children}
  </select>
);

const TeacherAdminMaterialsScreen = () => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // State for Header
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // State for Materials
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

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

  // ✅ FIXED: Updated fetchProfile function
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const response = await apiClient.get(`/profiles/${user.id}`);
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

  // ✅ FIXED: Updated fetchMaterials function
  const fetchMaterials = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/study-materials/teacher/${user.id}`);
      setMaterials(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch your materials.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);
  
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

  const openModal = (material = null) => {
    setEditingMaterial(material);
    setIsModalVisible(true);
  };

  // ✅ FIXED: Updated handleDelete function
  const handleDelete = (material) => {
    if (!window.confirm("Are you sure you want to delete this study material?")) return;
    
    apiClient.delete(`/study-materials/${material.material_id}`)
      .then(() => {
        alert("Material deleted.");
        setMaterials((prev) => prev.filter((m) => m.material_id !== material.material_id));
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Failed to delete.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Study Materials</h1>
              <p className="text-xs sm:text-sm text-slate-600">Manage and share educational resources</p>
            </div>

            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="relative">
                <input
                  id="module-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search materials..."
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
        <div>
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">My Uploaded Materials</h2>
                <p className="text-sm text-slate-600">A list of all resources you have shared.</p>
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <MdAdd className="mr-2" size={20} />
                Add New Material
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading || loadingProfile ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-16 bg-white/60 rounded-xl border border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <MdFolder size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No materials uploaded yet</h3>
                <p className="text-slate-500">Click "Add New Material" to start sharing resources.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {materials.map((item) => (
                  <div key={item.material_id} className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col">
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-0">{item.title}</h3>
                        <div className="flex space-x-2 self-start sm:self-center">
                          <button
                            onClick={() => openModal(item)}
                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-blue-200/60"
                            title="Edit Material"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-red-200/60"
                            title="Delete Material"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-semibold border border-teal-200/60">{item.class_group}</span>
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200/60">{item.subject}</span>
                          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200/60">{item.material_type}</span>
                        </div>
                        
                        {item.description && (
                          <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                      {item.file_path && (
                        <button
                          onClick={() => window.open(`${SERVER_URL}${item.file_path}`, "_blank")}
                          className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          <MdDownload className="mr-2" />
                          Download
                        </button>
                      )}
                      {item.external_link && (
                        <button
                          onClick={() => window.open(item.external_link, "_blank")}
                          className="flex-1 flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          <MdLaunch className="mr-2" />
                          Open Link
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isModalVisible && (
          <MaterialFormModal
            material={editingMaterial}
            onClose={() => setIsModalVisible(false)}
            onSave={fetchMaterials}
          />
        )}
      </main>
    </div>
  );
};

const MaterialFormModal = ({ material, onClose, onSave }) => {
  const { user } = useAuth();
  const isEditMode = !!material;
  const [title, setTitle] = useState(isEditMode ? material.title : "");
  const [description, setDescription] = useState(isEditMode ? material.description : "");
  const [subject, setSubject] = useState(isEditMode ? material.subject : "");
  const [classGroup, setClassGroup] = useState(isEditMode ? material.class_group : "");
  const [materialType, setMaterialType] = useState(isEditMode ? material.material_type : "Notes");
  const [externalLink, setExternalLink] = useState(isEditMode ? material.external_link || "" : "");
  const [file, setFile] = useState(null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FIXED: Updated studentClasses fetch
  useEffect(() => {
    apiClient.get('/student-classes')
      .then(response => setStudentClasses(response.data))
      .catch(console.error);
  }, []);

  const handleFilePick = (e) => {
    const pickedFile = e.target.files[0];
    if (pickedFile) {
      setFile(pickedFile);
    }
  };

  // ✅ FIXED: Updated handleSave function
  const handleSave = async () => {
    if (!title || !classGroup) {
      alert("Title and Class are required.");
      return;
    }
    setIsSaving(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("class_group", classGroup);
    formData.append("subject", subject);
    formData.append("material_type", materialType);
    formData.append("external_link", externalLink);
    formData.append("uploaded_by", user.id.toString());
    
    if (file) {
      formData.append("materialFile", file);
    } else if (isEditMode && material.file_path) {
      formData.append("existing_file_path", material.file_path);
    }
    
    try {
      if (isEditMode) {
        await apiClient.put(`/study-materials/${material.material_id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiClient.post('/study-materials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      alert(`Material ${isEditMode ? "updated" : "uploaded"} successfully.`);
      onSave();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-500 ease-in-out">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
            {isEditMode ? "Edit Material" : "Add New Material"}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-slate-700 font-semibold mb-2" htmlFor="title">Title <span className="text-red-600">*</span></label>
              <FormInput id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Chapter 1: Algebra Basics" required />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-2" htmlFor="classGroup">Class <span className="text-red-600">*</span></label>
                <FormSelect id="classGroup" value={classGroup} onChange={(e) => setClassGroup(e.target.value)} required>
                  <option value="">-- Select Class --</option>
                  {studentClasses.map((c) => (<option key={c} value={c}>{c}</option>))}
                </FormSelect>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2" htmlFor="subject">Subject</label>
                <FormInput id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Mathematics" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2" htmlFor="desc">Description</label>
              <textarea
                id="desc"
                className="w-full border-2 border-slate-200/60 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-inner text-base font-medium resize-none"
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief summary of the material's content"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2" htmlFor="materialType">Type <span className="text-red-600">*</span></label>
              <FormSelect id="materialType" value={materialType} onChange={(e) => setMaterialType(e.target.value)} required>
                {["Notes", "Presentation", "Video Lecture", "Worksheet", "Link", "Other"].map((t) => (<option key={t} value={t}>{t}</option>))}
              </FormSelect>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2" htmlFor="externalLink"><MdLink className="inline mr-2" />External Link</label>
              <FormInput id="externalLink" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://example.com/resource" />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2" htmlFor="materialFile"><MdFileUpload className="inline mr-2" />File Upload</label>
              <input
                id="materialFile"
                type="file"
                onChange={handleFilePick}
                className="w-full border-2 border-slate-200/60 rounded-xl p-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-white shadow-inner file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200/60"><p className="text-sm text-green-700 font-medium">Selected: {file.name}</p></div>
              )}
              {!file && isEditMode && material?.file_path && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200/60"><p className="text-sm text-blue-700 font-medium">Current: {material.file_path.split("/").pop()}</p></div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-slate-200/60">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 ${isSaving ? "animate-pulse" : ""}`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Material" : "Add Material"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAdminMaterialsScreen;
