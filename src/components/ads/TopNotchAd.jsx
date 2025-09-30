// 📂 File: src/components/ads/TopNotchAd.jsx (JAVASCRIPT VERSION - NO TYPESCRIPT)

import React, { useState } from 'react';
import { SERVER_URL } from '../../apiConfig';

const PopupAd = ({ ad }) => {
  const [modalVisible, setModalVisible] = useState(true);

  // ★★★ FIXED: Use SERVER_URL like mobile version ★★★
  const imageUrl = `${SERVER_URL}${ad.ad_content_image_url}`;

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (modalVisible) {
      document.addEventListener('keydown', handleKeyPress);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [modalVisible]);

  // Don't render anything if modal is closed
  if (!modalVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60"
      style={{ 
        zIndex: 9999999, // ★★★ High z-index for visibility ★★★
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={handleOverlayClick}
    >
      <div 
        className="relative bg-white rounded-3xl p-6 mx-5 w-full max-w-md shadow-2xl"
        style={{ zIndex: 9999999 }}
      >
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-gray-700 transition-colors shadow-lg z-10"
        >
          ✕
        </button>

        {/* Ad Image with debug logging */}
        <img
          src={imageUrl}
          alt="Advertisement"
          className="w-full h-48 rounded-lg mb-4 object-contain"
          onLoad={() => console.log('Ad image loaded successfully:', imageUrl)}
          onError={(e) => {
            console.error('Ad image failed to load:', imageUrl);
            console.error('Error details:', e);
          }}
        />

        {/* Ad Text Content */}
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
