"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  ShoppingCart,
  Users,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/dashboard/meals", label: t("meals"), icon: UtensilsCrossed },
    { href: "/dashboard/bazaar", label: t("bazaar"), icon: ShoppingCart },
    { href: "/dashboard/expenses", label: t("expenses"), icon: Receipt },
    { href: "/dashboard/members", label: t("members"), icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5 truncate max-w-[56px] text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
