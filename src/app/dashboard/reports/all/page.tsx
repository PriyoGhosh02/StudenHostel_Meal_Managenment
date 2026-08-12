"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Eye } from "lucide-react";

export default function AllReportsPage() {
  const samplePastReports = [
    { month: "August 2026", monthId: "2026-08", meals: 482, mealRate: "৳ 48.50", expense: "৳ 23,377", deposits: "৳ 42,500", status: "active" },
    { month: "July 2026", monthId: "2026-07", meals: 520, mealRate: "৳ 46.20", expense: "৳ 24,024", deposits: "৳ 45,000", status: "closed" },
    { month: "June 2026", monthId: "2026-06", meals: 510, mealRate: "৳ 45.80", expense: "৳ 23,358", deposits: "৳ 43,000", status: "closed" },
  ];

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
          <Table className="border-0 rounded-none shadow-none">
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Total Meals</TableHead>
                <TableHead>Meal Rate</TableHead>
                <TableHead>Total Expenses</TableHead>
                <TableHead>Total Deposits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samplePastReports.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-xs md:text-sm text-slate-900">{r.month}</TableCell>
                  <TableCell className="text-xs">{r.meals}</TableCell>
                  <TableCell className="font-bold text-blue-600 text-xs">{r.mealRate}</TableCell>
                  <TableCell className="text-xs">{r.expense}</TableCell>
                  <TableCell className="text-xs text-emerald-600 font-semibold">{r.deposits}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "active" ? "success" : "default"} size="sm">
                      {r.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/reports/current">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
