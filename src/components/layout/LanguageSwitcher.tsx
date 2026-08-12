"use client";

import React from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Languages } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { PreferredLanguage } from "@/types/user";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const languages: { code: PreferredLanguage; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "bn", label: "বাংলা", flag: "🇧🇩" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-2xs"
        >
          <Languages className="w-3.5 h-3.5 text-slate-500" />
          <span>{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
        </button>
      }
    >
      <div className="py-1">
        {languages.map((item) => (
          <DropdownItem
            key={item.code}
            onClick={() => setLanguage(item.code)}
            className={language === item.code ? "bg-blue-50 text-blue-700 font-semibold" : ""}
          >
            <span className="text-base mr-1">{item.flag}</span>
            <span>{item.label}</span>
          </DropdownItem>
        ))}
      </div>
    </Dropdown>
  );
}
