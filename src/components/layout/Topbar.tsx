"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useHostel } from "@/hooks/use-hostel";
import { useTranslation } from "@/hooks/use-translation";
import { RequestService } from "@/lib/services/request.service";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import {
  Bell,
  LogOut,
  Settings,
  PlusCircle,
  AlertTriangle,
  Menu,
  X,
  Building2,
  UtensilsCrossed,
  Wallet,
  Receipt,
  ShoppingCart,
  BookOpenText,
  Users,
} from "lucide-react";

export function Topbar() {
  const router = useRouter();
  const { user, profile, logout, isFirebaseConfigured, setDemoUser } = useAuth();
  const { currentHostel, currentMember, role, isManager } = useHostel();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentHostel || !isFirebaseConfigured || !isManager || currentMember?.status !== "active") {
      setUnreadCount(0);
      return;
    }
    const unsub = RequestService.subscribePendingRequestsCount(currentHostel.id, (cnt) => {
      setUnreadCount(cnt);
    });
    return () => unsub();
  }, [currentHostel, isFirebaseConfigured, isManager, currentMember]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: t("dashboard"), icon: Building2 },
    { href: "/dashboard/meals", label: t("meals"), icon: UtensilsCrossed },
    { href: "/dashboard/deposits", label: t("deposits"), icon: Wallet },
    { href: "/dashboard/expenses", label: t("expenses"), icon: Receipt },
    { href: "/dashboard/bazaar", label: t("bazaar"), icon: ShoppingCart },
    { href: "/dashboard/ledger", label: t("ledger"), icon: BookOpenText },
    { href: "/dashboard/members", label: t("members"), icon: Users },
  ];

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      {/* Dev Mode Banner if Firebase is unconfigured */}
      {!isFirebaseConfigured && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
            <span>
              <strong>Demo Mode:</strong> Configure Firebase keys in <code className="bg-amber-600/30 px-1 py-0.5 rounded font-mono">.env.local</code> for live cloud sync.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDemoUser()}
            className="underline font-semibold hover:text-white transition-colors"
          >
            Switch to Demo Admin
          </button>
        </div>
      )}

      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Mobile Menu Button & Hostel Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              HM
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[140px] sm:max-w-xs">
              {currentHostel?.name || "HostelMaster"}
            </span>
          </div>
        </div>

        {/* Right Side: Language Switcher, Notifications & User Dropdown */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* Notifications Link */}
          <Link
            href={isManager ? "/dashboard/manager" : "/dashboard/notice"}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notices & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </Link>

          {/* User Profile Dropdown */}
          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.name || "User Avatar"}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-800">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {profile?.name || user?.displayName || "User"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                    {user?.email || "No Email"}
                  </p>
                </div>
              </button>
            }
          >
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {profile?.name || user?.displayName || "User"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              {role && (
                <div className="mt-1.5">
                  <Badge variant={((role as string) === "owner" || (role as string) === "admin" || (role as string) === "manager") ? "manager" : "member"} size="sm">
                    {((role as string) === "owner" || (role as string) === "admin" || (role as string) === "manager") ? "MANAGER" : "MEMBER"}
                  </Badge>
                </div>
              )}
            </div>

            <div className="py-1">
              <Link href="/dashboard/settings">
                <DropdownItem icon={<Settings className="w-4 h-4" />}>
                  {t("settings")}
                </DropdownItem>
              </Link>
              <Link href="/onboarding">
                <DropdownItem icon={<PlusCircle className="w-4 h-4" />}>
                  Create / Switch Hostel
                </DropdownItem>
              </Link>
            </div>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <DropdownItem
                icon={<LogOut className="w-4 h-4" />}
                danger
                onClick={handleLogout}
              >
                {t("logout")}
              </DropdownItem>
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Mobile Drawer Menu when open */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
