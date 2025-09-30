import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import apiClient from '../api/client'; // ★ 1. IMPORT the central API client
import { API_BASE_URL } from '../apiConfig';
import { SERVER_URL } from '../apiConfig';

// Types for user and context state
interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student' | 'donor';
  profile_image_url?: string;
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

  // Effect to load session from storage on app start
  useEffect(() => {
    const loadSession = async () => {
      try {
        const userString = await storage.get('userSession');
        const tokenString = await storage.get('userToken');

        if (userString && tokenString) {
          const userObj: User = JSON.parse(userString);
          
          // ★ CONFIGURE apiClient when the app loads with a stored token
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;

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

    loadSession();
  }, []);

  // Effect to fetch and update profile data once authenticated
  useEffect(() => {
    const fetchProfileAndUpdate = async () => {
      // We need user.id to make the call, so we wait for it.
      if (!user?.id) {
        return;
      }
      
      try {
        console.log(`Fetching profile for user ID: ${user.id}`);
        const response = await apiClient.get(`/profiles/${user.id}`); // ✅ Remove /api prefix

        
        if (response.data) {
          console.log('Profile data fetched:', response.data);
          // ✅ Merge fetched data and update the user state object
          const updatedUser = { ...user, ...response.data };
          setUser(updatedUser);
          
          // ✅ Persist the updated user object to storage for the next session
          await storage.set('userSession', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('AuthContext: Failed to fetch profile data', error);
      }
    };

    // Run this fetch logic whenever the token is set (on login or app load)
    if (token) {
      fetchProfileAndUpdate();
    }
  }, [token]); // This effect now correctly depends only on the token

  const login = async (user: User, token: string) => {
    try {
      // ★ CONFIGURE apiClient on successful login
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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
      // ★ REMOVE token from apiClient on logout
      delete apiClient.defaults.headers.common['Authorization'];

      setUser(null);
      setToken(null);
      setUnreadCount(0);
      await storage.multiRemove(['userSession', 'userToken']);
    } catch (e) {
      console.error('AuthContext: Failed to clear session', e);
    }
  };
  

  // ✅ SIMPLIFIED: Now reads directly from the always-updated user object
   const getProfileImageUrl = () => {
    if (user?.profile_image_url) {
      const url = (user.profile_image_url.startsWith('http') || user.profile_image_url.startsWith('file'))
        ? user.profile_image_url
        : `${SERVER_URL}${user.profile_image_url}`;
      return url;
    }
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
        getProfileImageUrl,
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

