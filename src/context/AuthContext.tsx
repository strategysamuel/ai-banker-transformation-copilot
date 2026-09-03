import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { UserProfile } from '../types';
import { getUserProfile, syncUserProfile, updateUserProfile } from '../services/userService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await syncUserProfile(currentUser);
          setUserProfile(profile);
          setAuthError(null);
        } catch (err) {
          console.error('Error synchronizing user profile:', err);
          setAuthError('Failed to load user profile from secure database. Retrying...');
          try {
            const fallback = await getUserProfile(currentUser.uid);
            setUserProfile(fallback);
          } catch (fetchErr) {
            console.error('Fallback fetch also failed:', fetchErr);
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(result.user);
      setUser(result.user);
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before completing. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Previous authentication request was cancelled.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please verify your Google account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setAuthError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setAuthError('Failed to log out cleanly. Please reload the application.');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    try {
      await updateUserProfile(user.uid, data);
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authError,
        loginWithGoogle,
        logout,
        refreshProfile,
        updateProfileData,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
