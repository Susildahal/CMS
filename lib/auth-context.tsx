"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "./types";
import {
  apiClient,
  extractErrorMessage,
  loginToStrapi,
  loginToUsersPermissions,
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

      // Attempt to also obtain a Users & Permissions JWT for Content API RBAC.
      // This will only succeed if the same credentials exist as a U&P user.
      try {
        await loginToUsersPermissions(email, password);
      } catch {
        // Ignore: admin login can still succeed even if U&P user doesn't exist.
        // Without cms_user_token, Content API RBAC can't be per-user.
      }

      setUser(userObj);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userObj, token } satisfies AuthSession));
      localStorage.setItem("cms_token", token);
      localStorage.setItem("dashboard_jwt", token);

      return { success: true };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error, "Invalid Strapi credentials") };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_refresh_token");
    localStorage.removeItem("dashboard_jwt");
    localStorage.removeItem("cms_user_token");

    // Also clear any in-memory default auth header on the shared axios instance.
    // (Requests will still be protected by the interceptor, but this avoids edge cases.)
    try {
      delete apiClient.defaults.headers.common.Authorization;
    } catch {
      // ignore
    }
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
