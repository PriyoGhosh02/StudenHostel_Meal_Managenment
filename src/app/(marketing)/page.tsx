"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  UtensilsCrossed,
  ShieldCheck,
  Receipt,
  Users,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Globe2,
  MessageSquare,
  Bell,
} from "lucide-react";

export default function MarketingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-blue-400" />,
      title: "Real-Time Meal Calculations",
      description:
        "Automatic daily meal tally, guest meal tracking, and instant meal rate calculation without manual spreadsheets.",
    },
    {
      icon: <Receipt className="w-6 h-6 text-emerald-400" />,
      title: "Automated Expense Splitting",
      description:
        "Separate shared bazaar costs from utilities, cook salaries, and individual member debits seamlessly.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      title: "Multi-Tenant Data Isolation",
      description:
        "Enterprise-grade Firestore security rules ensure complete privacy and isolation between different hostels.",
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-amber-400" />,
      title: "Bazaar Duty Schedules",
      description:
        "Assign and track bazaar duties with allocated budgets, receipt uploads, and real-time expense logging.",
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      title: "Role-Based Permissions",
      description:
        "Manager and Member roles with custom permissions, join request approvals, and manager power handover.",
    },
    {
      icon: <Globe2 className="w-6 h-6 text-rose-400" />,
      title: "Multi-Language Support",
      description:
        "Full native support for English, বাংলা (Bangla), and हिंदी (Hindi) with personalized language preferences.",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-cyan-400" />,
      title: "Live Group & Direct Chat",
      description:
        "Built-in hostel group chat and direct member messaging with real-time updates, floating widget on all pages.",
    },
    {
      icon: <Bell className="w-6 h-6 text-orange-400" />,
      title: "Smart Notifications",
      description:
        "Browser push notifications for new notices, member requests, and manager approvals in real-time.",
    },
  ];

  return (
    <div
      style={{ backgroundColor: "#0F172A", color: "#F8FAFC" }}
      className="min-h-screen flex flex-col"
    >
      {/* Header / Navbar */}
      <header
        style={{ backgroundColor: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        className="sticky top-0 z-30 w-full backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white leading-none">
                HostelMaster
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">SaaS Platform</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              {t("features")}
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Preview
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500">
                {t("login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {t("get_started")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Dark background guarantees text visibility */}
      <section
        id="preview"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1a2744 50%, #0F172A 100%)" }}
        className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-32"
      >
        {/* Glow accents */}
        <div
          style={{ background: "radial-gradient(ellipse at top, rgba(59,130,246,0.15) 0%, transparent 60%)" }}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Student Hostel &amp; Mess Management</span>
          </div>

          <h1
            style={{ color: "#FFFFFF", fontWeight: 900, lineHeight: 1.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-4xl mx-auto"
          >
            Effortless Hostel Operations,{" "}
            <span style={{ background: "linear-gradient(90deg, #60A5FA, #818CF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Meal Accounting
            </span>{" "}
            &amp; Tenant Ledger
          </h1>

          <p
            style={{ color: "#CBD5E1" }}
            className="mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Eliminate messy paper sheets and spreadsheet errors. Track daily meals, bazaar expenses,
            member deposits, and instant meal rates with full transparency and role-based access control.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full justify-center px-10 py-3 text-base font-bold shadow-lg shadow-blue-500/30"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t("get_started")} — Free
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#F1F5F9",
                  borderRadius: "0.625rem",
                  padding: "0.7rem 2.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                {t("login")} to Hostel
              </button>
            </Link>
          </div>

          {/* Interactive UI Mock Preview */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1.25rem",
            }}
            className="mt-16 max-w-5xl mx-auto p-3 sm:p-4 shadow-2xl"
          >
            <div
              style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem" }}
              className="p-4 sm:p-6 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 style={{ color: "#FFFFFF", fontWeight: 700 }} className="text-lg">
                      Emerald Green Residence
                    </h3>
                    <span style={{ background: "#14532D", color: "#4ADE80", border: "1px solid #166534", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.6rem" }}>
                      Active Month
                    </span>
                  </div>
                  <p style={{ color: "#94A3B8" }} className="text-xs mt-0.5">
                    Code: <span style={{ fontFamily: "monospace", color: "#60A5FA", fontWeight: 700 }}>HST-X7K92</span> &bull; 18 Active Members
                  </p>
                </div>
                <div className="text-right">
                  <span style={{ color: "#64748B", fontSize: "0.65rem", fontWeight: 700 }} className="uppercase tracking-wider">
                    Current Meal Rate
                  </span>
                  <p style={{ color: "#60A5FA", fontWeight: 700, fontSize: "1.25rem" }}>৳ 48.50</p>
                </div>
              </div>

              {/* Sample Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-4">
                {[
                  { label: "Total Meals", value: "482", sub: "↑ +14 today", subColor: "#4ADE80" },
                  { label: "Bazaar Expense", value: "৳ 23,377", sub: "Updated 2h ago", subColor: "#94A3B8" },
                  { label: "Member Deposits", value: "৳ 42,500", sub: "100% verified", subColor: "#4ADE80" },
                  { label: "Mess Fund Balance", value: "৳ 19,123", sub: "Surplus", subColor: "#4ADE80" },
                ].map((m, i) => (
                  <div
                    key={i}
                    style={{ background: "#1F2937", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.75rem", padding: "0.875rem" }}
                  >
                    <span style={{ color: "#94A3B8", fontSize: "0.72rem", fontWeight: 600 }}>{m.label}</span>
                    <p style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.2rem", marginTop: "0.25rem" }}>{m.value}</p>
                    <span style={{ color: m.subColor, fontSize: "0.65rem", fontWeight: 600 }}>{m.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.875rem" }}>
              Engineered for Frictionless Mess Operations
            </h2>
            <p style={{ color: "#94A3B8" }} className="mt-3 text-sm sm:text-base">
              Everything students, managers, and hostel owners need to keep calculations clean,
              disputes zero, and books balanced.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#1F2937",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                className="space-y-3 hover:scale-[1.02]"
              >
                <div
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", width: "3rem", height: "3rem" }}
                  className="flex items-center justify-center"
                >
                  {item.icon}
                </div>
                <h3 style={{ color: "#F1F5F9", fontWeight: 700 }} className="text-sm">
                  {item.title}
                </h3>
                <p style={{ color: "#94A3B8" }} className="text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" style={{ background: "#0F172A" }} className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "9999px", padding: "0.35rem 1rem", fontSize: "0.75rem", fontWeight: 700 }}>
            Security &amp; Cloud Architecture
          </span>
          <h2 style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.875rem" }} className="mt-4">
            Multi-Tenant Isolation &amp; Role Security
          </h2>
          <p style={{ color: "#94A3B8" }} className="text-sm sm:text-base max-w-2xl mx-auto">
            Hostel data is completely isolated using strict Firestore security rules and scoped queries.
            Role-based access ensures only authorized managers can approve deposits or modify meals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            {[
              { title: "Tenant Isolation", desc: "Hostels cannot read or modify another hostel's data." },
              { title: "Verified Memberships", desc: "Join requests require explicit manager approval before access is granted." },
              { title: "Immutable Ledger", desc: "Full audit trail of approved deposits and logged expenses." },
            ].map((item, i) => (
              <div
                key={i}
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.875rem", padding: "1rem" }}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 style={{ color: "#F1F5F9", fontWeight: 700 }} className="text-sm">{item.title}</h4>
                <p style={{ color: "#94A3B8" }} className="text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              HM
            </div>
            <span style={{ color: "#FFFFFF", fontWeight: 700 }} className="text-sm">
              HostelMaster SaaS
            </span>
          </div>

          <p style={{ color: "#64748B" }} className="text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} HostelMaster. Production-ready Student Hostel &amp; Mess Management.
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: "#94A3B8" }}>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/onboarding" className="hover:text-white transition-colors">Onboarding</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
