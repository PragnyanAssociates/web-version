import React from "react";
import { API_BASE_URL } from "../../api/client.js";

const MotionAd = ({ ad }) => {
  const imageUrl = `${API_BASE_URL}${ad.ad_content_image_url}`;

  return (
    <div className="fixed bottom-16 z-[1001]">
      {/* Animation Wrapper */}
      <div className="relative w-screen overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          {/* Ad Box */}
          <div className="inline-block bg-white rounded-lg shadow-lg px-3 py-2 mx-2">
            <img
              src={imageUrl}
              alt="Ad Banner"
              className="h-12 w-52 object-contain"
            />
          </div>

          {/* Duplicate for seamless loop */}
          <div className="inline-block bg-white rounded-lg shadow-lg px-3 py-2 mx-2">
            <img
              src={imageUrl}
              alt="Ad Banner Duplicate"
              className="h-12 w-52 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionAd;
