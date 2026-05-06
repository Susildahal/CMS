"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "./types";
import {
  extractErrorMessage,
  loginToStrapi,
  mapStrapiUserToCmsUser,
} from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "cms_auth";

type AuthSession = {
  user: User;
  token: string;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession) as Partial<AuthSession>;
        if (parsed.user && parsed.token) {
          setUser(parsed.user);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user: strapiUser } = await loginToStrapi(email, password);
      const userObj = mapStrapiUserToCmsUser(strapiUser, email);

      setUser(userObj);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userObj, token } satisfies AuthSession));
      localStorage.setItem("cms_token", token);

      return { success: true };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error, "Invalid Strapi credentials") };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("cms_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
