"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { RequestService } from "@/lib/services/request.service";
import { Badge } from "@/components/ui/Badge";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Wallet,
  Receipt,
  ShoppingCart,
  BookOpenText,
  Bell,
  FileBarChart2,
  CalendarRange,
  Users,
  UserCheck,
  Settings,
  Building2,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { currentHostel, currentMonth, role, isManager } = useHostel();
  const { isFirebaseConfigured } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!currentHostel || !isFirebaseConfigured) return;
    const unsub = RequestService.subscribePendingRequestsCount(currentHostel.id, (cnt) => {
      setPendingCount(cnt);
    });
    return () => unsub();
  }, [currentHostel, isFirebaseConfigured]);

  const copyCode = () => {
    if (currentHostel?.code) {
      navigator.clipboard.writeText(currentHostel.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/dashboard/meals", label: t("meals"), icon: UtensilsCrossed },
    { href: "/dashboard/deposits", label: t("deposits"), icon: Wallet },
    { href: "/dashboard/expenses", label: t("expenses"), icon: Receipt },
    { href: "/dashboard/bazaar", label: t("bazaar"), icon: ShoppingCart },
    { href: "/dashboard/ledger", label: t("ledger"), icon: BookOpenText },
    { href: "/dashboard/notice", label: t("notices"), icon: Bell },
    { href: "/dashboard/chat", label: "Live Chat", icon: MessageSquare },
    { href: "/dashboard/reports/current", label: t("reports"), icon: FileBarChart2 },
    { href: "/dashboard/months/manage", label: t("months"), icon: CalendarRange },
    { href: "/dashboard/members", label: t("members"), icon: Users },
    { href: "/dashboard/manager", label: t("manager"), icon: UserCheck },
    { href: "/dashboard/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md h-screen sticky top-0 z-30 select-none">
      {/* Hostel Brand & Switcher */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
              {currentHostel?.name || "HostelMaster"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {currentHostel?.code && (
                <button
                  type="button"
                  onClick={copyCode}
                  title="Click to copy hostel code"
                  className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded transition-colors border border-transparent dark:border-slate-700"
                >
                  <span>{currentHostel.code}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
              {role && (
                <Badge variant={role} size="sm">
                  {role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Active Month Chip */}
        {currentMonth && (
          <div className="mt-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
            <span className="font-medium text-slate-600 dark:text-slate-400">{t("active_month")}:</span>
            <span className="font-bold text-blue-700 dark:text-blue-400">{currentMonth.name}</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Management
        </div>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          const isManagerItem = item.href === "/dashboard/manager";
          const hasPending = isManagerItem && isManager && pendingCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-150 group ${
                hasPending
                  ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30 animate-pulse"
                  : isActive
                  ? "bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    hasPending || isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {hasPending && (
                <span className="bg-white text-rose-600 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full shadow-xs">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[10px] text-slate-400 dark:text-slate-500">Hostel Manager My SaaS Idea v1.0</p>
      </div>
    </aside>
  );
}
