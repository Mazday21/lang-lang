"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/auth-context";
import { UiLang, translate } from "@/lib/i18n";

interface I18nValue {
  lang: UiLang;
  setLang: (lang: UiLang) => void;
  t: (text: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: "ru",
  setLang: () => {},
  t: (text) => text,
});

const STORAGE_KEY = "app_ui_lang";

/**
 * Provides the UI language (Russian / Uzbek):
 *  - a manual choice in the menu is persisted (localStorage);
 *  - when the user changes their NATIVE language, the UI follows it.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState<UiLang>("ru");
  const lastNativeRef = useRef<string | null>(null);

  // Restore manual choice
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ru" || saved === "uz") setLangState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setLang = useCallback((next: UiLang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  // The interface follows the user's native language
  useEffect(() => {
    const native = user?.native_language ? user.native_language.toLowerCase() : null;
    if (!native) return;
    const wanted: UiLang = native.startsWith("uz") ? "uz" : "ru";

    if (lastNativeRef.current === null) {
      lastNativeRef.current = wanted;
      // First sight of the profile: follow native unless the user chose manually
      let manual = null;
      try {
        manual = localStorage.getItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      if (manual !== "ru" && manual !== "uz") setLangState(wanted);
      return;
    }

    if (lastNativeRef.current !== wanted) {
      lastNativeRef.current = wanted;
      setLang(wanted);
    }
  }, [user?.native_language, setLang]);

  const t = useCallback(
    (text: string, params?: Record<string, string | number>) =>
      translate(lang, text, params),
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
