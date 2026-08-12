import React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, badge, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800 mb-6",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2.5 flex-wrap">{action}</div>}
    </div>
  );
}
