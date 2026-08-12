"use client";

import React from "react";
import Link from "next/link";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Printer, History } from "lucide-react";
import { toast } from "sonner";

export default function CurrentReportPage() {
  const { monthName } = useCurrentMonth();

  const sampleReportRows = [
    { member: "Alex Rahman", room: "302", meals: 42, mealCost: 2037, shared: 288, totalDebit: 2325, deposited: 5000, net: 2675 },
    { member: "Tanvir Ahmed", room: "304", meals: 38, mealCost: 1843, shared: 288, totalDebit: 2131, deposited: 4500, net: 2369 },
    { member: "Shafiul Islam", room: "201", meals: 45, mealCost: 2182, shared: 288, totalDebit: 2470, deposited: 3000, net: 530 },
    { member: "Mahmudul Hasan", room: "202", meals: 40, mealCost: 1940, shared: 288, totalDebit: 2228, deposited: 4000, net: 1772 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${monthName} Monthly Report`}
        description="Comprehensive financial summary, meal rates, and member ledger sheet"
        action={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/reports/all">
              <Button variant="outline" size="sm" leftIcon={<History className="w-4 h-4" />}>
                All Reports
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast.info("Report printing / export ready")}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print / Export
            </Button>
          </div>
        }
      />

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Meal Rate</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">৳ 48.50</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Bazaar</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">৳ 18,200</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Deposits</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">৳ 42,500</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Mess Reserve</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">৳ 19,123</p>
          </CardContent>
        </Card>
      </div>

      {/* Member Financial Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Member Settlement Sheet</CardTitle>
          <CardDescription>Individual meal costs, shared utility split, and refundable balance</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="border-0 rounded-none shadow-none">
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Meals</TableHead>
                <TableHead>Meal Cost</TableHead>
                <TableHead>Shared Cost</TableHead>
                <TableHead>Total Debit</TableHead>
                <TableHead>Deposited</TableHead>
                <TableHead>Net Refund / Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleReportRows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-xs md:text-sm text-slate-900">{r.member}</TableCell>
                  <TableCell className="font-mono text-xs">{r.room}</TableCell>
                  <TableCell className="text-xs font-semibold">{r.meals}</TableCell>
                  <TableCell className="text-xs">৳ {r.mealCost}</TableCell>
                  <TableCell className="text-xs">৳ {r.shared}</TableCell>
                  <TableCell className="text-xs font-semibold text-rose-600">৳ {r.totalDebit}</TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-600">৳ {r.deposited}</TableCell>
                  <TableCell>
                    <Badge variant={r.net >= 0 ? "success" : "danger"} size="sm">
                      {r.net >= 0 ? `+৳ ${r.net} (Refund)` : `-৳ ${Math.abs(r.net)} (Due)`}
                    </Badge>
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
