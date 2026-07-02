import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, logoutUser } from "../services/authApi";
import type { User } from "../types/index";

// Context shape
interface AuthContextValue {
  user:            User | null;
  loading:         boolean;
  isAuthenticated: boolean;
  saveAuth:        (data: { user: User }) => void;
  logout:          () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const { user: u } = await getMe();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  function saveAuth({ user: u }: { user: User }) {
    setUser(u);
  }

  async function logout(): Promise<void> {
    try {
      await logoutUser();
    } catch {
    } finally {
      setUser(null);
    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    saveAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
