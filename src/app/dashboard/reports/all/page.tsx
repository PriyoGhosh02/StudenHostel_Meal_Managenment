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
import { ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AllReportsPage() {
  const { currentHostel } = useHostel();
  const { isFirebaseConfigured } = useAuth();
  
  const [months, setMonths] = useState<HostelMonth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonths = useCallback(async () => {
    if (!currentHostel) return;
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const mList = await HostelService.getMonths(currentHostel.id);
        // Sort months descending
        mList.sort((a, b) => b.id.localeCompare(a.id));
        setMonths(mList);
      } else {
        // Fallback for demo mode
        setMonths([
          { id: "2026-08", name: "August 2026", year: 2026, month: 8, status: "active", startedAt: null as any },
          { id: "2026-07", name: "July 2026", year: 2026, month: 7, status: "closed", startedAt: null as any },
          { id: "2026-06", name: "June 2026", year: 2026, month: 6, status: "closed", startedAt: null as any },
        ]);
      }
    } catch (error) {
      console.error("Error loading months:", error);
      toast.error("Failed to load report archives");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, isFirebaseConfigured]);

  useEffect(() => {
    fetchMonths();
  }, [fetchMonths]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Monthly Reports"
        description="Archive of all monthly mess accounting sheets and final settlement records"
        action={
          <Link href="/dashboard/reports/current">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Current Month
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Report Archives</CardTitle>
          <CardDescription>Browse previous month summaries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading archives...</div>
          ) : months.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
              No report archives found for this hostel.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">{r.name}</TableCell>
                    <TableCell className="text-xs">{r.year}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "active" ? "success" : "default"} size="sm">
                        {r.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/reports/current?monthId=${r.id}`}>
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          View Report
                        </Button>
                      </Link>
                    </TableCell>
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
