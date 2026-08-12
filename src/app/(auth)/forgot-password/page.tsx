import React from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Forgot Password | HostelMaster",
  description: "Reset your HostelMaster password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">HostelMaster</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reset your password</h2>
        <p className="mt-2 text-xs md:text-sm text-slate-600">
          Enter your email address and we will send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
