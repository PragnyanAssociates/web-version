import React, { useState } from "react";
import { API_BASE_URL } from "../../apiConfig";

/**
 * Props:
 * - title: string
 * - items: Array of { id, title, file_path, file_type }
 * Example of items array:
 * [
 *   { id: 1, title: 'Photo', file_path: 'gallery/photo1.jpg', file_type: 'photo' },
 *   { id: 2, title: 'Video', file_path: 'gallery/video1.mp4', file_type: 'video' }
 * ]
 */
export default function AlbumDetailScreen({ title, items }) {
  items = Array.isArray(items) ? items : [];

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);

  // Open image or video modal
  const handleItemClick = (item) => {
    if (item.file_type === "photo") {
      setSelectedImageUri(`${API_BASE_URL}/${item.file_path}`);
      setImageModalOpen(true);
    } else {
      setSelectedVideoUri(`${API_BASE_URL}/${item.file_path}`);
      setVideoModalOpen(true);
    }
  };

  // Close any modal
  const closeModal = () => {
    setImageModalOpen(false);
    setVideoModalOpen(false);
    setSelectedImageUri(null);
    setSelectedVideoUri(null);
  };

  return (
    <div className="min-h-screen bg-white pt-8 px-3">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-900">
          {title || "Album"}
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {items.map((item) => (
            <button
              key={item.id}
              className="relative group outline-none focus:ring-2 focus:ring-blue-500 rounded"
              onClick={() => handleItemClick(item)}
              tabIndex={0}
              aria-label={item.title || item.file_type}
              type="button"
            >
              {item.file_type === "photo" ? (
                <img
                  src={`${API_BASE_URL}/${item.file_path}`}
                  alt={item.title || ""}
                  className="w-full h-32 sm:h-40 object-cover rounded bg-gray-200 shadow transition group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-32 sm:h-40 bg-gray-800 flex items-center justify-center rounded shadow relative">
                  <svg className="w-12 h-12 text-white opacity-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="#333"
                      opacity="0.4"
                    />
                    <polygon points="10,8 16,12 10,16" fill="#fff" stroke="none" />
                  </svg>
                  <span className="sr-only">Play video</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Full-screen IMAGE Modal */}
        {imageModalOpen && (
          <Modal onClose={closeModal}>
            <img
              src={selectedImageUri}
              alt=""
              className="max-h-[80vh] max-w-[96vw] rounded shadow-lg object-contain mx-auto"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </Modal>
        )}

        {/* Full-screen VIDEO Modal */}
        {videoModalOpen && (
          <Modal onClose={closeModal}>
            <div className="w-[90vw] max-w-2xl flex items-center justify-center">
              <video
                src={selectedVideoUri}
                controls
                className="bg-black rounded shadow-lg w-full max-h-[75vh]"
                style={{ outline: "none" }}
                preload="auto"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

// Fullscreen overlay modal with close button in corner.
// Children must stopPropagation to avoid closing on click!
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-10 p-2 text-white text-3xl rounded hover:bg-black/30 transition"
        aria-label="Close"
        tabIndex={0}
        type="button"
      >
        &times;
      </button>
      <div
        className="outline-none"
        onClick={(e) => e.stopPropagation()} // Prevent click in modal closing
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
