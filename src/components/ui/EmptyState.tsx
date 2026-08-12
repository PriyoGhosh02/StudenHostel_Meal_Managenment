import React from "react";
import { cn } from "@/lib/utils/cn";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <FolderOpen className="w-10 h-10 text-slate-400" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-500 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base md:text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs md:text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
