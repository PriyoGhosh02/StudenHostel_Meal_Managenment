import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "outline"
    | "owner"
    | "admin"
    | "manager"
    | "member";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full transition-colors select-none";

  const variants = {
    default: "bg-slate-100 text-slate-800 border border-slate-200",
    primary: "bg-blue-50 text-blue-700 border border-blue-200",
    secondary: "bg-purple-50 text-purple-700 border border-purple-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    outline: "border border-slate-300 text-slate-700 bg-transparent",
    owner: "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold",
    admin: "bg-blue-50 text-blue-700 border border-blue-200 font-semibold",
    manager: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold",
    member: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
