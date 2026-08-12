"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useHostel } from "@/hooks/use-hostel";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  UtensilsCrossed,
  Wallet,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Bell,
  Plus,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { currentHostel, role, isManager } = useHostel();
  const { monthName, currency } = useCurrentMonth();
  const { t } = useTranslation();

  // Quick Action Modal state
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);
  const [sampleVal, setSampleVal] = useState("");

  const handleQuickSubmit = (type: string) => {
    toast.success(`Action logged: ${type}`);
    setQuickActionModal(null);
    setSampleVal("");
  };

  const currencySymbol = currency === "BDT" ? "৳" : currency === "INR" ? "₹" : "$";

  // Dashboard Summary Metrics
  const stats = [
    {
      title: t("meal_rate"),
      value: `${currencySymbol} 48.50`,
      change: "Auto-calculated",
      isPositive: true,
      icon: <UtensilsCrossed className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200/80",
    },
    {
      title: t("total_meals"),
      value: "482",
      change: "+18 today",
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50 border-indigo-200/80",
    },
    {
      title: t("total_expenses"),
      value: `${currencySymbol} 23,377`,
      change: "Bazaar: 78% • Utilities: 22%",
      isPositive: false,
      icon: <Receipt className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50 border-rose-200/80",
    },
    {
      title: t("total_deposits"),
      value: `${currencySymbol} 42,500`,
      change: "Balance: +৳ 19,123",
      isPositive: true,
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200/80",
    },
  ];

  // Recent Member Accounts Preview
  const sampleMembers = [
    { name: "Alex Rahman (You)", role: role || "owner", room: "302", meals: 42, deposited: 5000, debit: 3420, net: "+1,580" },
    { name: "Tanvir Ahmed", role: "manager", room: "304", meals: 38, deposited: 4500, debit: 3180, net: "+1,320" },
    { name: "Shafiul Islam", role: "member", room: "201", meals: 45, deposited: 3000, debit: 3650, net: "-650" },
    { name: "Mahmudul Hasan", role: "member", room: "202", meals: 40, deposited: 4000, debit: 3290, net: "+710" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={currentHostel?.name || "Hostel Dashboard"}
        description={`Active Month: ${monthName || "Current Month"} • Multi-Tenant Mess Management`}
        badge={
          <Badge variant={role || "default"} size="md">
            {role ? role.toUpperCase() : "MEMBER"}
          </Badge>
        }
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickActionModal("meal")}
              leftIcon={<UtensilsCrossed className="w-3.5 h-3.5" />}
            >
              Add Daily Meal
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickActionModal("deposit")}
              leftIcon={<Wallet className="w-3.5 h-3.5" />}
            >
              Record Deposit
            </Button>
            {isManager && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setQuickActionModal("expense")}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Log Expense
              </Button>
            )}
          </div>
        }
      />

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-start gap-3 shadow-2xs">
        <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Hostel Notice: Meal Locking Schedule</h4>
            <Badge variant="primary" size="sm">Active</Badge>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Please submit your dinner meal changes before 4:00 PM daily. Tomorrow&apos;s bazaar duty is assigned to Room 304.
          </p>
        </div>
        <Link href="/dashboard/notice">
          <Button variant="ghost" size="sm" className="text-xs shrink-0">
            View All
          </Button>
        </Link>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl border ${stat.bg}`}>{stat.icon}</div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h3>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Member Balance Overview & Bazaar Duties */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Balances Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Member Balances ({monthName})</CardTitle>
                <CardDescription>Live debit & surplus calculations</CardDescription>
              </div>
              <Link href="/dashboard/members">
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  All Members
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="border-0 rounded-none shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Meals</TableHead>
                    <TableHead>Deposited</TableHead>
                    <TableHead>Net Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleMembers.map((m, idx) => {
                    const isSurplus = m.net.startsWith("+");
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="font-semibold text-slate-900 text-xs md:text-sm">{m.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{m.role}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{m.room}</TableCell>
                        <TableCell className="font-semibold text-xs">{m.meals}</TableCell>
                        <TableCell className="text-xs">{currencySymbol} {m.deposited}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isSurplus
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {currencySymbol} {m.net}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Bazaar Schedule & Quick Operations (1 col) */}
        <div className="space-y-4">
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
                Upcoming Bazaar Duties
              </CardTitle>
              <CardDescription>Scheduled shopping rotations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Tomorrow Morning</span>
                  <Badge variant="warning" size="sm">Scheduled</Badge>
                </div>
                <p className="text-xs text-slate-600">Assigned: Tanvir Ahmed & Shafiul</p>
                <p className="text-[11px] text-slate-400">Allocated Budget: ৳ 2,500</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Friday Bazaar</span>
                  <Badge variant="default" size="sm">Upcoming</Badge>
                </div>
                <p className="text-xs text-slate-600">Assigned: Alex Rahman & Mahmudul</p>
                <p className="text-[11px] text-slate-400">Allocated Budget: ৳ 4,000</p>
              </div>

              <Link href="/dashboard/bazaar" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Manage Bazaar Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Hostel Share Code Quick Box */}
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs">Hostel Code for Joining</h4>
              </div>
              <p className="text-xs text-slate-600">
                Share this code with fellow roommates to submit join requests:
              </p>
              <div className="p-2 rounded-lg bg-white border border-blue-200 text-center font-mono font-bold text-blue-700 text-sm">
                {currentHostel?.code || "HST-X7K92"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Modal */}
      <Modal
        isOpen={quickActionModal !== null}
        onClose={() => setQuickActionModal(null)}
        title={
          quickActionModal === "meal"
            ? "Record Daily Meal"
            : quickActionModal === "deposit"
            ? "Submit Deposit Record"
            : "Log New Expense"
        }
        description="Quick operation entry for active month"
      >
        <div className="space-y-4">
          <Input
            label="Amount / Count"
            placeholder={quickActionModal === "meal" ? "e.g. 2 meals" : "e.g. 2500"}
            value={sampleVal}
            onChange={(e) => setSampleVal(e.target.value)}
          />
          <Input
            label="Notes / Description"
            placeholder="e.g. Regular lunch & dinner"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setQuickActionModal(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={() => handleQuickSubmit(quickActionModal || "Entry")}>
              {t("save")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
