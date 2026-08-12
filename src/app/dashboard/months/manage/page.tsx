"use client";

import React from "react";
import Link from "next/link";
import { useHostel } from "@/hooks/use-hostel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Plus, Lock } from "lucide-react";
import { toast } from "sonner";

export default function ManageMonthsPage() {
  const { isManager } = useHostel();

  const sampleMonths = [
    { id: "2026-08", name: "August 2026", status: "active", started: "2026-08-01", closed: "-" },
    { id: "2026-07", name: "July 2026", status: "closed", started: "2026-07-01", closed: "2026-07-31" },
    { id: "2026-06", name: "June 2026", status: "closed", started: "2026-06-01", closed: "2026-06-30" },
  ];

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
          <Table className="border-0 rounded-none shadow-none">
            <TableHeader>
              <TableRow>
                <TableHead>Month Period</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Status</TableHead>
                {isManager && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleMonths.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-xs md:text-sm text-slate-900">{m.name}</TableCell>
                  <TableCell className="text-xs">{m.started}</TableCell>
                  <TableCell className="text-xs">{m.closed}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
