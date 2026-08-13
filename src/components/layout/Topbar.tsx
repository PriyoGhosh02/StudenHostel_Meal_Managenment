"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  LayoutDashboard,
  FileBarChart2,
  CalendarRange,
  UserCheck,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, logout, isFirebaseConfigured, setDemoUser } = useAuth();
  const { currentHostel, currentMember, currentMonth, role, isManager } = useHostel();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoError, setPhotoError] = useState(false);
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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const copyCode = () => {
    if (currentHostel?.code) {
      navigator.clipboard.writeText(currentHostel.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
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
    <>
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Notifications Link */}
          <Link
            href={isManager ? "/dashboard/manager" : "/dashboard/notice"}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title={t("notices", "Notices & Notifications")}
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
                {profile?.photoURL && !photoError ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.name || "User Avatar"}
                    onError={() => setPhotoError(true)}
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
                  {t("create_switch_hostel", "Create / Switch Hostel")}
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

      </header>

      {/* Backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Side Drawer Menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
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
                      title={t("click_copy_code", "Click to copy hostel code")}
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
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2 shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Month Chip */}
          {currentMonth && (
            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
              <span className="font-medium text-slate-600 dark:text-slate-400">{t("active_month")}:</span>
              <span className="font-bold text-blue-700 dark:text-blue-400">{currentMonth.name}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t("management", "Management")}
          </div>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            const isManagerItem = item.href === "/dashboard/manager";
            const hasPending = isManagerItem && isManager && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
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
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Preferences (Theme Selector) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Preferences</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Footer Branding */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Hostel Manager My SaaS Idea v1.0</p>
        </div>
      </aside>
    </>
  );
}
