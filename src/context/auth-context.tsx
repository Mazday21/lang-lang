"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  telegram_id: number;
  first_name?: string;
  username?: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState<boolean>(false);
  const [isDevMock, setIsDevMock] = useState<boolean>(false);

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

      setUser(data.user);
      setToken(data.token);
      setIsDevMock(Boolean(data.isDev));

      // Prime the client-side Supabase instance with custom JWT
      if (data.token) {
        getSupabaseClient(data.token);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate";
      setError(msg);
      console.error("[Auth] Error:", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const tg = window.Telegram?.WebApp;

    if (tg && tg.initData && tg.initData.length > 0) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();

      // Configure Telegram styling
      try {
        tg.setHeaderColor("#FDFBF7");
        tg.setBackgroundColor("#FDFBF7");
      } catch (styleErr) {
        // Fallback for older Telegram clients
        console.warn("Could not set Telegram header color", styleErr);
      }

      authenticateWithBackend(tg.initData, false);
    } else {
      setIsTelegram(false);
      setIsLoading(false);
      // In dev mode, don't automatically mock if not requested, but leave it ready
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
