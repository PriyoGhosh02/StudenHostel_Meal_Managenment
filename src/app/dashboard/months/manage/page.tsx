"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { HostelService } from "@/lib/services/hostel.service";
import { HostelMonth } from "@/types/hostel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Plus, Lock } from "lucide-react";
import { toast } from "sonner";

export default function ManageMonthsPage() {
  const { currentHostel, isManager } = useHostel();
  const { isFirebaseConfigured } = useAuth();

  const [months, setMonths] = useState<HostelMonth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonths = useCallback(async () => {
    if (!currentHostel) return;
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const mList = await HostelService.getMonths(currentHostel.id);
        mList.sort((a, b) => b.id.localeCompare(a.id));
        setMonths(mList);
      } else {
        setMonths([
          { id: "2026-08", name: "August 2026", year: 2026, month: 8, status: "active", startedAt: null as any }
        ]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hostel operating cycles");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, isFirebaseConfigured]);

  useEffect(() => {
    fetchMonths();
  }, [fetchMonths]);

  const formatDate = (m: HostelMonth) => {
    if (!m.startedAt) return "-";
    if (typeof m.startedAt === "object" && "toDate" in m.startedAt && typeof m.startedAt.toDate === "function") {
      return m.startedAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return "-";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Months Management"
        description="Active operating periods, month closing, and financial settlement cycles"
        action={
          isManager && (
            <Link href="/dashboard/months/new">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Start New Month
              </Button>
            </Link>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Operating Cycles</CardTitle>
          <CardDescription>View status or close current active month</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading cycles...</div>
          ) : months.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
              No operating months found.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Month Period</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  {isManager && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">{m.name}</TableCell>
                    <TableCell className="text-xs">{formatDate(m)}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "active" ? "success" : "default"} size="sm">
                        {m.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {isManager && (
                      <TableCell>
                        {m.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info("Month closing and calculation wizard initialized")}
                            leftIcon={<Lock className="w-3.5 h-3.5" />}
                          >
                            Close & Settle
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">Archived</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
