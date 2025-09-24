// 📂 File: src/components/ads/TopNotchAd.jsx (FINAL - CHANGED TO A POP-UP MODAL)

import React, { useState } from 'react';
import { API_BASE_URL } from '../../api/client.js';

// The component is now renamed internally to better reflect its function
const PopupAd = ({ ad }) => {
  const [modalVisible, setModalVisible] = useState(true); // Modal is visible by default

  const imageUrl = `${API_BASE_URL}${ad.ad_content_image_url}`;

  // This function is called when the user presses the close button or outside the modal
  const handleClose = () => {
    setModalVisible(false);
  };

  // Handle clicks outside the modal to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key press to close modal
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (modalVisible) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [modalVisible]);

  if (!modalVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white rounded-3xl p-6 mx-5 w-full max-w-md shadow-2xl">
        
        {/* Close button is now in the top-right corner */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-gray-700 transition-colors shadow-lg z-10"
        >
          ✕
        </button>

        {/* The Ad's Image */}
        <img
          src={imageUrl}
          alt="Advertisement"
          className="w-full h-50 rounded-lg mb-4 object-contain"
        />

        {/* The Ad's Text (if it exists) */}
        {ad.ad_content_text && (
          <p className="mb-4 text-center text-base leading-6">
            {ad.ad_content_text}
          </p>
        )}

      </div>
    </div>
  );
};

export default PopupAd;
