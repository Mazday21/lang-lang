"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  telegram_id: number;
  first_name?: string;
  username?: string;
  language_code?: string;
  native_language?: string | null;
  target_language?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isTelegram: boolean;
  isDevMock: boolean;
  loginWithDevMock: () => Promise<void>;
  retryAuth: () => Promise<void>;
  setLanguages: (nativeLang: string, targetLang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState<boolean>(false);
  const [isDevMock, setIsDevMock] = useState<boolean>(false);

  const fetchUserLanguages = useCallback(async (authToken: string | null, currentUser: UserProfile) => {
    try {
      const headers: HeadersInit = {};
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch("/api/user/languages", { headers });
      const data = await res.json();

      let nativeLang = data.native_language;
      let targetLang = data.target_language;

      // Fallback to localStorage if not yet set in database
      if (!nativeLang && typeof window !== "undefined") {
        nativeLang = localStorage.getItem("app_native_language") || null;
      }
      if (!targetLang && typeof window !== "undefined") {
        targetLang = localStorage.getItem("app_target_language") || null;
      }

      setUser({
        ...currentUser,
        native_language: nativeLang,
        target_language: targetLang,
      });
    } catch {
      // Keep existing user object
    }
  }, []);

  const authenticateWithBackend = useCallback(async (initData: string, isMock = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, isDevMock: isMock }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      const returnedUser: UserProfile = data.user;
      setUser(returnedUser);
      setToken(data.token);
      setIsDevMock(Boolean(data.isDev));

      // Prime client Supabase instance
      if (data.token) {
        getSupabaseClient(data.token);
      }

      // Load user language preferences
      await fetchUserLanguages(data.token, returnedUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate";
      setError(msg);
      console.error("[Auth] Error:", msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserLanguages]);

  const initAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const tg = window.Telegram?.WebApp;

    if (tg && tg.initData && tg.initData.length > 0) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();

      try {
        tg.setHeaderColor("#FDFBF7");
        tg.setBackgroundColor("#FDFBF7");
      } catch (styleErr) {
        console.warn("Could not set Telegram header color", styleErr);
      }

      authenticateWithBackend(tg.initData, false);
    } else {
      setIsTelegram(false);
      setIsLoading(false);
    }
  }, [authenticateWithBackend]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const loginWithDevMock = async () => {
    await authenticateWithBackend("dev_mock", true);
  };

  const retryAuth = async () => {
    initAuth();
  };

  const setLanguages = async (nativeLang: string, targetLang: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_native_language", nativeLang);
      localStorage.setItem("app_target_language", targetLang);
    }

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("/api/user/languages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          native_language: nativeLang,
          target_language: targetLang,
        }),
      });
    } catch (err) {
      console.warn("Could not save languages to backend:", err);
    }

    setUser((prev) => (prev ? { ...prev, native_language: nativeLang, target_language: targetLang } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isTelegram,
        isDevMock,
        loginWithDevMock,
        retryAuth,
        setLanguages,
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
