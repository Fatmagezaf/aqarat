'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { UserProfile, UserRole } from '@/types/user';
import { getUserProfile, createOrUpdateUserProfile, getAllUsers } from '@/services/userService';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAgent: boolean;
  isViewer: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
              role: 'viewer', // Default role for new sign ups without profile
              isActive: true,
              createdAt: new Date(),
            });
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setUser(cred.user);
        const profile = await getUserProfile(cred.user.uid);
        setUserProfile(
          profile || {
            uid: cred.user.uid,
            email: cred.user.email || '',
            displayName: cred.user.displayName || email.split('@')[0],
            role: 'viewer',
            isActive: true,
            createdAt: new Date(),
          }
        );
      } else {
        throw new Error('يرجى التحقق من إعدادات Firebase');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name });
        
        // Check if this is the first user
        const allUsers = await getAllUsers();
        const isFirstUser = allUsers.length === 0;

        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: name,
          role: isFirstUser ? 'admin' : 'viewer',
          isActive: true,
          createdAt: new Date(),
        };

        await createOrUpdateUserProfile(newProfile);
        
        setUser(cred.user);
        setUserProfile(newProfile);
      } else {
        throw new Error('يرجى التحقق من إعدادات Firebase');
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
        register,
        logout,
        isAdmin,
        isAgent,
        isViewer,
        canEdit,
        canDelete,
        canManageUsers,
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
