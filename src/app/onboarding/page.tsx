"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1a2744 60%, #0F172A 100%)",
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "2rem 1rem",
      }}
    >
      {/* Top Navbar */}
      <div style={{ maxWidth: "64rem", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#FFFFFF" }}>HostelMaster</span>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Main Choice Section */}
      <div style={{ maxWidth: "48rem", margin: "0 auto", width: "100%", padding: "3rem 0", textAlign: "center" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Welcome to HostelMaster,{" "}
            <span style={{ background: "linear-gradient(90deg, #60A5FA, #818CF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {profile?.name || user?.displayName || "Member"}
            </span>
            !
          </h1>
          <p style={{ marginTop: "0.75rem", fontSize: "1rem", color: "#94A3B8", maxWidth: "32rem", margin: "0.75rem auto 0" }}>
            Choose how you would like to get started with your mess and hostel management.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", textAlign: "left", marginTop: "2.5rem" }}>
          {/* Option 1: Create a new hostel */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1.25rem",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.2s",
              backdropFilter: "blur(8px)",
            }}
          >
            <div>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <PlusCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                {t("create_hostel")}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#94A3B8", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Start a new mess or hostel residence as the Manager. Get a unique hostel code and initialize your first month.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#94A3B8" }}>
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  Full manager control & automated meal calculation
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#94A3B8" }}>
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                  Invite members using your custom hostel code
                </li>
              </ul>
            </div>
            <Link href="/onboarding/create-hostel" style={{ textDecoration: "none" }}>
              <Button className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t("create_hostel")}
              </Button>
            </Link>
          </div>

          {/* Option 2: Join an existing hostel */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1.25rem",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.2s",
              backdropFilter: "blur(8px)",
            }}
          >
            <div>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <LogIn className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                {t("join_hostel")}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#94A3B8", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Already have a hostel code from your manager? Enter the code to submit a join request for quick approval.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#94A3B8" }}>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Track daily meals, bazaar schedules & expenses
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#94A3B8" }}>
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  Instant balance and payment transparency
                </li>
              </ul>
            </div>
            <Link href="/onboarding/join-hostel" style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "0.625rem",
                  color: "#F1F5F9",
                  fontWeight: 600,
                  padding: "0.65rem 1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                {t("join_hostel")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#475569" }}>
        HostelMaster &bull; Secure Multi-Tenant Cloud Architecture
      </div>
    </div>
  );
}
