"use client";

import React, { createContext, useContext, useState } from "react";
import { PreferredLanguage } from "@/types/user";
import en from "@/locales/en.json";
import bn from "@/locales/bn.json";
import hi from "@/locales/hi.json";

const dictionaries: Record<PreferredLanguage, Record<string, string>> = {
  en,
  bn,
  hi,
};

interface LanguageContextType {
  language: PreferredLanguage;
  setLanguage: (lang: PreferredLanguage) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<PreferredLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredLanguage") as PreferredLanguage;
      if (saved && ["en", "bn", "hi"].includes(saved)) {
        return saved;
      }
    }
    return "en";
  });

  const setLanguage = (lang: PreferredLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    return dict[key] || dictionaries.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
