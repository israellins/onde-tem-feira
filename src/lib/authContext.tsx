"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loginWithGoogle: (customEmail?: string, customName?: string) => void;
  loginWithEmail: (email: string, name: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginWithGoogle: () => {},
  loginWithEmail: () => {},
  logout: () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

const STORAGE_KEY = "onde_tem_feira_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const saveUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const loginWithGoogle = (customEmail?: string, customName?: string) => {
    const email = customEmail || "feirante.usuario@gmail.com";
    const name = customName || "Feirante do Gmail";
    const newUser: User = {
      id: "usr_google_" + Date.now(),
      name,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: "google",
    };
    saveUser(newUser);
    setIsAuthModalOpen(false);
  };

  const loginWithEmail = (email: string, name: string) => {
    const newUser: User = {
      id: "usr_email_" + Date.now(),
      name: name || email.split("@")[0],
      email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: "email",
    };
    saveUser(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    saveUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        loginWithEmail,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
