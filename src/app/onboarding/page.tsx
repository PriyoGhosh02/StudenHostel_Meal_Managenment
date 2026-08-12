"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PlusCircle, LogIn, Building2, ArrowRight, ShieldCheck, Users } from "lucide-react";

export default function OnboardingChoicePage() {
  const router = useRouter();
  const { user, profile, loading, isFirebaseConfigured } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user && isFirebaseConfigured) {
      router.push("/login");
    }
  }, [user, loading, isFirebaseConfigured, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">HostelMaster</span>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Main Choice Section */}
      <div className="max-w-3xl mx-auto w-full py-12 text-center space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome to HostelMaster, {profile?.name || user?.displayName || "Member"}!
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Choose how you would like to get started with your mess and hostel management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Option 1: Create a new hostel */}
          <Card className="hover:border-blue-500/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg text-slate-900">{t("create_hostel")}</CardTitle>
              <CardDescription>
                Start a new mess or hostel residence as the Owner/Manager. Get a unique hostel code and initialize your first month.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-slate-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Full admin control & automated meal calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Invite members using your custom hostel code</span>
                </li>
              </ul>
              <Link href="/onboarding/create-hostel" className="w-full">
                <Button className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t("create_hostel")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Option 2: Join an existing hostel */}
          <Card className="hover:border-blue-500/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <LogIn className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg text-slate-900">{t("join_hostel")}</CardTitle>
              <CardDescription>
                Already have a hostel code from your manager? Enter the code to submit a join request for quick approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-slate-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Track daily meals, bazaar schedules & expenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant balance and payment transparency</span>
                </li>
              </ul>
              <Link href="/onboarding/join-hostel" className="w-full">
                <Button variant="outline" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t("join_hostel")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        HostelMaster &bull; Secure Multi-Tenant Cloud Architecture
      </div>
    </div>
  );
}
