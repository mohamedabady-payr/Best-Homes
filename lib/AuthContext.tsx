"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from "./auth";

interface AuthContextValue {
  user: { email: string; firstName: string; lastName: string } | null;
  isLoading: boolean;
  login: (params: { email: string; password: string }) => { ok: boolean; error?: string };
  register: (params: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string; firstName: string; lastName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = useCallback((params: { email: string; password: string }) => {
    const result = authLogin(params);
    if (result.ok) {
      setUser(getCurrentUser());
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }, []);

  const register = useCallback(
    (params: { email: string; firstName: string; lastName: string; password: string }) => {
      const result = authRegister(params);
      if (result.ok) {
        setUser(getCurrentUser());
        return { ok: true };
      }
      return { ok: false, error: result.error };
    },
    []
  );

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
