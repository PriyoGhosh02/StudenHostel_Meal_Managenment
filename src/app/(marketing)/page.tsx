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
} from "lucide-react";

export default function MarketingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-blue-600" />,
      title: "Real-Time Meal Calculations",
      description: "Automatic daily meal tally, guest meal tracking, and instant meal rate calculation without manual spreadsheets.",
    },
    {
      icon: <Receipt className="w-6 h-6 text-emerald-600" />,
      title: "Automated Expense Splitting",
      description: "Separate shared bazaar costs from utilities, cook salaries, and individual member debits seamlessly.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      title: "Multi-Tenant Data Isolation",
      description: "Enterprise-grade Firestore security rules ensure complete privacy and isolation between different hostels.",
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-amber-600" />,
      title: "Bazaar Duty Schedules",
      description: "Assign and track bazaar duties with allocated budgets, receipt uploads, and real-time expense logging.",
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      title: "Role-Based Permissions",
      description: "Granular roles for Owners, Admins, Managers, and Members with custom permissions and join request approvals.",
    },
    {
      icon: <Globe2 className="w-6 h-6 text-rose-600" />,
      title: "Multi-Language Support",
      description: "Full native support for English, বাংলা (Bangla), and हिंदी (Hindi) with personalized language preferences.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                HostelMaster
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">SaaS Platform</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              {t("features")}
            </a>
            <a href="#preview" className="hover:text-blue-600 transition-colors">
              Preview
            </a>
            <a href="#security" className="hover:text-blue-600 transition-colors">
              Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Student Hostel & Mess Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Effortless Hostel Operations, Meal Accounting & Tenant Ledger
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate messy paper sheets and spreadsheet errors. Track daily meals, bazaar expenses, member deposits, and instant meal rates with full transparency.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full justify-center px-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t("get_started")} — Free
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full justify-center px-8">
                {t("login")} to Hostel
              </Button>
            </Link>
          </div>

          {/* Interactive UI Mock Preview */}
          <div id="preview" className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xl shadow-slate-200/50">
            <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-4 sm:p-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">Emerald Green Residence</h3>
                    <Badge variant="success">Active Month</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Code: <span className="font-mono font-bold text-blue-600">HST-X7K92</span> &bull; 18 Active Members</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Current Meal Rate</span>
                    <p className="text-lg font-bold text-blue-600">৳ 48.50</p>
                  </div>
                </div>
              </div>

              {/* Sample Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Total Meals</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">482</p>
                  <span className="text-[11px] text-emerald-600 font-medium">↑ +14 today</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Bazaar Expense</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">৳ 23,377</p>
                  <span className="text-[11px] text-slate-400 font-medium">Updated 2h ago</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Member Deposits</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">৳ 42,500</p>
                  <span className="text-[11px] text-emerald-600 font-medium">100% verified</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Mess Fund Balance</span>
                  <p className="text-xl font-bold text-emerald-600 mt-1">৳ 19,123</p>
                  <span className="text-[11px] text-emerald-600 font-medium">Surplus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Frictionless Mess Operations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Everything students, managers, and hostel owners need to keep calculations clean, disputes zero, and books balanced.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-500/50 hover:shadow-md transition-all duration-200 space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Multi-Tenancy Section */}
      <section id="security" className="py-16 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="primary">Security & Cloud Architecture</Badge>
          <h2 className="text-3xl font-bold text-slate-900">
            Multi-Tenant Isolation & Role Security
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Hostel data is completely isolated using strict Firestore security rules and scoped queries. Role-based access ensures only authorized managers can approve deposits or modify meals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Tenant Isolation</h4>
              <p className="text-xs text-slate-500 mt-1">Hostels cannot read or modify another hostel&apos;s data.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Verified Memberships</h4>
              <p className="text-xs text-slate-500 mt-1">Join requests require explicit manager approval before access is granted.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Immutable Ledger</h4>
              <p className="text-xs text-slate-500 mt-1">Full audit trail of approved deposits and logged expenses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              HM
            </div>
            <span className="font-bold text-slate-900 text-sm">HostelMaster SaaS</span>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} HostelMaster. Production-ready Student Hostel & Mess Management.
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/login" className="hover:text-blue-600">Login</Link>
            <Link href="/register" className="hover:text-blue-600">Register</Link>
            <Link href="/onboarding" className="hover:text-blue-600">Onboarding</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
