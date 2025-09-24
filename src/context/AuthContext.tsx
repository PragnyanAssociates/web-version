// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import { API_BASE_URL } from '../apiConfig'; // ✅ Use same config as DashboardHeader

// Types for user and context state
interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student' | 'donor';
  profile_image_url?: string; // ✅ optional (in case backend doesn't return)
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  getProfileImageUrl: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // ✅ NEW: Add state for profile image URL
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadUserAndToken = async () => {
      try {
        const userString = await storage.get('userSession');
        const tokenString = await storage.get('userToken');

        if (userString && tokenString) {
          const userObj: User = JSON.parse(userString);
          setUser(userObj);
          setToken(tokenString);
        }
      } catch (e) {
        console.error('AuthContext: Failed to load session', e);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndToken();
  }, []);

  // ✅ NEW: Fetch profile data after user is loaded
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !token) {
        setProfileImageUrl(null);
        return;
      }
      
      try {
        console.log(`Fetching profile for user ID: ${user.id}`);
        const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          console.log('Profile data fetched:', profileData);
          setProfileImageUrl(profileData.profile_image_url || null);
        } else {
          console.error('Failed to fetch profile:', response.status, response.statusText);
          setProfileImageUrl(null);
        }
      } catch (error) {
        console.error('AuthContext: Failed to fetch profile image', error);
        setProfileImageUrl(null);
      }
    };

    if (user && token) {
      fetchProfile();
    }
  }, [user, token]);

  const login = async (user: User, token: string) => {
    try {
      setUser(user);
      setToken(token);
      await storage.set('userSession', JSON.stringify(user));
      await storage.set('userToken', token);
    } catch (e) {
      console.error('AuthContext: Failed to save session', e);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setUnreadCount(0);
      setProfileImageUrl(null); // ✅ Clear profile image on logout
      await storage.multiRemove(['userSession', 'userToken']);
    } catch (e) {
      console.error('AuthContext: Failed to clear session', e);
    }
  };

  // ✅ UPDATED: Use fetched profile image URL
  const getProfileImageUrl = () => {
    // First check the fetched profile image URL
    if (profileImageUrl) {
      const url = profileImageUrl.startsWith('/')
        ? `${API_BASE_URL}${profileImageUrl}`
        : profileImageUrl;
      console.log('Using fetched profile image URL:', url);
      return url;
    }
    
    // Fallback to user object (in case profile fetch failed but login had it)
    if (user?.profile_image_url) {
      const url = user.profile_image_url.startsWith('/')
        ? `${API_BASE_URL}${user.profile_image_url}`
        : user.profile_image_url;
      console.log('Using user profile image URL:', url);
      return url;
    }
    
    // Final fallback
    console.log('Using default profile image');
    return '/assets/profile.png';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        unreadCount,
        setUnreadCount,
        getProfileImageUrl, // ✅ This now uses fetched profile data
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
