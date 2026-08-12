"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGooglePopup,
  sendPasswordReset,
  signOutUser,
  onAuthStateChanged,
  FirebaseUser,
} from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { UserService } from "@/lib/services/user.service";
import { UserProfile } from "@/types/user";
import { Timestamp } from "firebase/firestore";

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (!isFirebaseConfigured && typeof window !== "undefined") {
      const savedDemo = localStorage.getItem("demo_user_profile");
      if (savedDemo) {
        try {
          return JSON.parse(savedDemo) as UserProfile;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [user, setUser] = useState<FirebaseUser | null>(() => {
    if (!isFirebaseConfigured && typeof window !== "undefined") {
      const savedDemo = localStorage.getItem("demo_user_profile");
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          return {
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.name,
          } as unknown as FirebaseUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => (isFirebaseConfigured ? true : false));

  // Sync profile when auth state changes
  const fetchProfile = async (firebaseUser: FirebaseUser) => {
    try {
      let p = await UserService.getUserProfile(firebaseUser.uid);
      if (!p) {
        p = await UserService.createOrUpdateUser(firebaseUser.uid, {
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
        });
      }
      setProfile(p);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmail(email, pass);
      await fetchProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await signUpWithEmail(email, pass, name);
      await UserService.createOrUpdateUser(res.user.uid, {
        name,
        email,
      });
      await fetchProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithGooglePopup();
      await fetchProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOutUser();
    }
    localStorage.removeItem("demo_user_profile");
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // Demo user helper for testing without live Firebase config
  const setDemoUser = () => {
    const demoProfile: UserProfile = {
      uid: "demo-user-123",
      name: "Demo Admin (Alex)",
      email: "demo@hostelmaster.io",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "+8801700000000",
      preferredLanguage: "en",
      activeHostelId: "demo-hostel-1",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    localStorage.setItem("demo_user_profile", JSON.stringify(demoProfile));
    setProfile(demoProfile);
    setUser({
      uid: demoProfile.uid,
      email: demoProfile.email,
      displayName: demoProfile.name,
    } as unknown as FirebaseUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        isFirebaseConfigured,
        login,
        register,
        loginWithGoogle,
        resetPassword,
        logout,
        refreshProfile,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
