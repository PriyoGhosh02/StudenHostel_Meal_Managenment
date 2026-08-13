import React, { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Building2, Loader2 } from "lucide-react";

export const metadata = {
  title: "Login | HostelMaster",
  description: "Sign in to manage your student hostel or mess.",
};

export default function LoginPage() {
  return (
    <div
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1a2744 60%, #0F172A 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 1rem" }}
    >
      <div style={{ margin: "0 auto", width: "100%", maxWidth: "26rem", textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>HostelMaster</span>
        </Link>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>Sign in to your account</h2>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#94A3B8" }}>
          Or{" "}
          <Link href="/register" style={{ fontWeight: 600, color: "#60A5FA" }}>
            create a new hostel or member account
          </Link>
        </p>
      </div>

      <div style={{ marginTop: "2rem", margin: "2rem auto 0", width: "100%", maxWidth: "26rem", padding: "0 1rem" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1.25rem",
            padding: "2rem 1.75rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs">Loading form...</span>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
