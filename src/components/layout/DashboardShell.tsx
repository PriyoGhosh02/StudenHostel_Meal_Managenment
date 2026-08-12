"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useHostel } from "@/hooks/use-hostel";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Loader2 } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading: authLoading, isFirebaseConfigured } = useAuth();
  const { currentHostel, loading: hostelLoading } = useHostel();

  useEffect(() => {
    if (authLoading || hostelLoading) return;

    if (!user && isFirebaseConfigured) {
      router.push("/login");
      return;
    }

    if (user && isFirebaseConfigured && !profile?.activeHostelId && !currentHostel) {
      router.push("/onboarding");
      return;
    }
  }, [user, profile, currentHostel, authLoading, hostelLoading, isFirebaseConfigured, router]);

  if (authLoading || hostelLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading HostelMaster...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
