import React, { useState } from "react";
import { SERVER_URL } from "../../apiConfig"; // ✅ Fixed import path
import apiClient from "../../api/client"; // ✅ Add apiClient for API calls
import { useAuth } from "../../context/AuthContext.tsx"; // ✅ Add auth context
import { MdDelete, MdAdd, MdCloudDownload, MdPhotoLibrary } from "react-icons/md"; // ✅ Add icons

/**
 * Props:
 * - title: string
 * - items: Array of { id, title, file_path, file_type, event_date }
 * - onRefresh: function to refresh parent data after changes
 * Example of items array:
 * [
 *   { id: 1, title: 'Photo', file_path: 'gallery/photo1.jpg', file_type: 'photo', event_date: '2025-01-01' },
 *   { id: 2, title: 'Video', file_path: 'gallery/video1.mp4', file_type: 'video', event_date: '2025-01-01' }
 * ]
 */
export default function AlbumDetailScreen({ title, items, onRefresh }) {
  items = Array.isArray(items) ? items : [];

  const { user } = useAuth(); // ✅ Add auth context
  const isAdmin = user?.role === "admin"; // ✅ Check admin status

  // Modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);

  // ✅ Add upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Handle item click to view image/video
  const handleItemClick = (item) => {
    if (item.file_type === "photo") {
      setSelectedImageUri(`${SERVER_URL}${item.file_path}`); // ✅ Fixed URL construction
      setImageModalOpen(true);
    } else {
      setSelectedVideoUri(`${SERVER_URL}${item.file_path}`); // ✅ Fixed URL construction
      setVideoModalOpen(true);
    }
  };

  // ✅ Close all modals
  const closeModal = () => {
    setImageModalOpen(false);
    setVideoModalOpen(false);
    setSelectedImageUri(null);
    setSelectedVideoUri(null);
  };

  // ✅ Handle download item (web-compatible)
  const handleDownloadItem = async (item) => {
    try {
      const url = `${SERVER_URL}${item.file_path}`;
      const fileName = item.file_path.split('/').pop() || `gallery-item-${Date.now()}`;
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  // ✅ Handle delete item (admin only)
  const handleDeleteItem = async (itemId, e) => {
    e.stopPropagation(); // Prevent triggering item click
    if (!window.confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/gallery/${itemId}`, {
        data: { role: user?.role }
      });
      alert('Item deleted successfully!');
      onRefresh?.(); // Refresh parent data
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert(error.response?.data?.message || 'An error occurred while deleting the item.');
    }
  };

  // ✅ Handle multiple file upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 5) {
      alert('Maximum 5 files can be selected at once');
      return;
    }
    setUploadFiles(files);
  };

  // ✅ Upload selected files
  const handleUploadFiles = async () => {
    if (uploadFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (!items[0]?.event_date) {
      alert('Cannot add to this album because event date is missing');
      return;
    }

    setIsUploading(true);

    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('event_date', items[0].event_date.split('T')[0]);
        formData.append('role', user.role);
        formData.append('adminId', String(user.id));
        formData.append('media', file);

        await apiClient.post('/gallery/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert(`Successfully uploaded ${uploadFiles.length} files!`);
      setUploadModalOpen(false);
      setUploadFiles([]);
      onRefresh?.(); // Refresh parent data
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'An error occurred while uploading files.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdPhotoLibrary size={32} className="text-gray-400" />
            </div>
            <p className="text-xl text-gray-600 font-medium">This album is empty</p>
            <p className="text-gray-500 mt-2">
              {isAdmin ? "Press the '+' button to add photos or videos." : "The administrator has not added any items here yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {items.map((item, index) => (
              <div key={item.id} className="relative group">
                {/* ✅ Admin delete button */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg opacity-0 group-hover:opacity-100"
                    aria-label="Delete Item"
                    title="Delete Item"
                  >
                    <MdDelete size={14} className="text-white" />
                  </button>
                )}

                {/* ✅ Download button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadItem(item);
                  }}
                  className="absolute bottom-2 right-2 z-10 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg opacity-0 group-hover:opacity-100"
                  aria-label="Download Item"
                  title="Download"
                >
                  <MdCloudDownload size={14} className="text-white" />
                </button>

                {/* ✅ Media item */}
                <button
                  className="relative outline-none focus:ring-4 focus:ring-blue-500/50 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
                  onClick={() => handleItemClick(item)}
                  tabIndex={0}
                  aria-label={item.title || item.file_type}
                  type="button"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`
                  }}
                >
                  {item.file_type === "photo" ? (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg border border-white/30">
                      <img
                        src={`${SERVER_URL}${item.file_path}`} // ✅ Fixed URL construction
                        alt={item.title || ""}
                        className="w-full h-32 sm:h-40 object-cover transition-all duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center rounded-2xl shadow-lg relative border border-white/30 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700/50 to-gray-900/50 group-hover:from-gray-600/50 group-hover:to-gray-800/50 transition-all duration-300" />
                      <svg className="w-12 h-12 text-white opacity-90 z-10 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#333" opacity="0.4" />
                        <polygon points="10,8 16,12 10,16" fill="#fff" stroke="none" />
                      </svg>
                      <span className="sr-only">Play video</span>
                      <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white font-medium backdrop-blur-sm">VIDEO</div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Admin floating action button */}
      {isAdmin && (
        <button
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white z-40 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
          title="Add to Album"
          onClick={() => setUploadModalOpen(true)}
          aria-label="Add Media to Album"
          type="button"
        >
          <MdAdd size={28} />
        </button>
      )}

      {/* ✅ Upload modal */}
      {isAdmin && uploadModalOpen && (
        <Modal onClose={() => setUploadModalOpen(false)}>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-auto mx-auto p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200/60 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
                  <MdAdd size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-wide">Add to Album</h2>
                  <p className="text-sm text-gray-600 mt-1">"{title}"</p>
                </div>
              </div>
              <button
                className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 border border-white/30"
                onClick={() => setUploadModalOpen(false)}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 tracking-wide">
                  Select Photos/Videos (Max 5)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  max="5"
                  className="block w-full border-2 border-dashed border-gray-300/60 rounded-2xl p-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm text-base font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileSelect}
                />
                {uploadFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/60">
                    <p className="text-sm text-blue-700 font-medium">
                      {uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''} selected
                    </p>
                    <div className="mt-2 space-y-1">
                      {uploadFiles.map((file, index) => (
                        <p key={index} className="text-xs text-blue-600 truncate">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/60">
                <button
                  type="button"
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-2xl text-gray-800 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/30 shadow-lg"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploading || uploadFiles.length === 0}
                  className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg backdrop-blur-sm flex items-center space-x-2 ${isUploading ? "animate-pulse" : ""}`}
                  onClick={handleUploadFiles}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <MdAdd size={18} />
                      <span>Add to Album</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ✅ Full-screen IMAGE Modal */}
      {imageModalOpen && (
        <Modal onClose={closeModal}>
          <img
            src={selectedImageUri}
            alt=""
            className="max-h-[80vh] max-w-[96vw] rounded-2xl shadow-2xl object-contain mx-auto border border-white/20"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        </Modal>
      )}

      {/* ✅ Full-screen VIDEO Modal */}
      {videoModalOpen && (
        <Modal onClose={closeModal}>
          <div className="w-[90vw] max-w-4xl flex items-center justify-center">
            <video
              src={selectedVideoUri}
              controls
              className="bg-black rounded-2xl shadow-2xl w-full max-h-[75vh] border border-white/20"
              style={{ outline: "none" }}
              preload="auto"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </Modal>
      )}

      {/* ✅ Add CSS animations */}
      <style>{`
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
      `}</style>
    </div>
  );
}

// ✅ Enhanced Modal component
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-transparent mx-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
