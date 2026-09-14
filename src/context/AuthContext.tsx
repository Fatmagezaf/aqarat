'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { UserProfile, UserRole } from '@/types/user';
import { getUserProfile, DEFAULT_DEMO_USERS } from '@/services/userService';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  isAdmin: boolean;
  isAgent: boolean;
  isViewer: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if session was saved in demo mode
    const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('demo_user_role') : null;
    if (savedDemo) {
      const match = DEFAULT_DEMO_USERS.find((u) => u.role === savedDemo) || DEFAULT_DEMO_USERS[0];
      setUserProfile(match);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured && auth && typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Default profile for authenticated user
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: 'agent',
              isActive: true,
              createdAt: new Date(),
            });
          }
          setIsDemoMode(false);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Default initial state when Firebase is not configured: load Admin demo user for frictionless evaluation
      setUserProfile(DEFAULT_DEMO_USERS[0]);
      setIsDemoMode(true);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Check demo credentials first
      const demoMatch = DEFAULT_DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (demoMatch && (!isFirebaseConfigured || pass === '123456' || pass === 'password')) {
        setUserProfile(demoMatch);
        setIsDemoMode(true);
        localStorage.setItem('demo_user_role', demoMatch.role);
        setLoading(false);
        return;
      }

      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setUser(cred.user);
        const profile = await getUserProfile(cred.user.uid);
        setUserProfile(
          profile || {
            uid: cred.user.uid,
            email: cred.user.email || '',
            displayName: cred.user.displayName || email.split('@')[0],
            role: 'agent',
            isActive: true,
            createdAt: new Date(),
          }
        );
        setIsDemoMode(false);
        localStorage.removeItem('demo_user_role');
      } else {
        throw new Error('يرجى التحقق من بيانات الدخول أو إعدادات Firebase');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth && typeof auth.signOut === 'function') {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('Firebase logout warning:', err);
      }
    }
    setUser(null);
    setUserProfile(null);
    setIsDemoMode(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user_role');
    }
  };

  const switchDemoRole = (role: UserRole) => {
    const match = DEFAULT_DEMO_USERS.find((u) => u.role === role) || DEFAULT_DEMO_USERS[0];
    setUserProfile(match);
    setIsDemoMode(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user_role', role);
    }
  };

  const role = userProfile?.role || 'viewer';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isViewer = role === 'viewer';
  const canEdit = isAdmin || isAgent;
  const canDelete = isAdmin;
  const canManageUsers = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        logout,
        switchDemoRole,
        isAdmin,
        isAgent,
        isViewer,
        canEdit,
        canDelete,
        canManageUsers,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
