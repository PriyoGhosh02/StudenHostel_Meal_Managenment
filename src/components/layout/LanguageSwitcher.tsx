"use client";

import React from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/lib/services/user.service";
import { Languages } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { PreferredLanguage } from "@/types/user";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const { user, isFirebaseConfigured } = useAuth();

  const languages: { code: PreferredLanguage; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "bn", label: "বাংলা", flag: "🇧🇩" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  const handleSelectLanguage = async (code: PreferredLanguage) => {
    setLanguage(code);
    if (isFirebaseConfigured && user) {
      try {
        await UserService.updateLanguage(user.uid, code);
      } catch (err) {
        console.error("Failed to update language on user profile:", err);
      }
    }
  };

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
        >
          <Languages className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
        </button>
      }
    >
      <div className="py-1">
        {languages.map((item) => (
          <DropdownItem
            key={item.code}
            onClick={() => handleSelectLanguage(item.code)}
            className={language === item.code ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold" : ""}
          >
            <span className="text-base mr-1">{item.flag}</span>
            <span>{item.label}</span>
          </DropdownItem>
        ))}
      </div>
    </Dropdown>
  );
}
