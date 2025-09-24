import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import TopNotchAd from './TopNotchAd';

const AdDisplay = () => {
  const [currentAd, setCurrentAd] = useState(null);

  useEffect(() => {
    const fetchAndCycleAd = async () => {
      try {
        const { data: approvedAds } = await apiClient.get('/api/ads/display');
        
        if (approvedAds.length === 0) return;

        const lastAdIndexStr = localStorage.getItem('lastAdIndex');
        const lastAdIndex = lastAdIndexStr ? parseInt(lastAdIndexStr, 10) : -1;
        const nextAdIndex = (lastAdIndex + 1) % approvedAds.length;
        
        localStorage.setItem('lastAdIndex', nextAdIndex.toString());
        setCurrentAd(approvedAds[nextAdIndex]);
      } catch (error) {
        console.error("AdDisplay Component: Could not fetch ad", error);
      }
    };
    fetchAndCycleAd();
  }, []);

  if (!currentAd) return null;
  
  // Since the API now only returns 'top_notch' ads, this check is for safety.
  // All other ad types will be ignored.
  if (currentAd.ad_type === 'top_notch') {
    return <TopNotchAd ad={currentAd} />;
  }
  
  return null;
};

export default AdDisplay;
