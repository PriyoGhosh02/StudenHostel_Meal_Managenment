"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { HostelService } from "@/lib/services/hostel.service";
import { MemberService } from "@/lib/services/member.service";
import { MealService } from "@/lib/services/meal.service";
import { DepositService } from "@/lib/services/deposit.service";
import { ExpenseService } from "@/lib/services/expense.service";
import { BazaarService } from "@/lib/services/bazaar.service";
import { HostelMonth } from "@/types/hostel";
import { MemberWithProfile } from "@/types/member";
import { MealRecord } from "@/types/meal";
import { DepositRecord } from "@/types/deposit";
import { ExpenseItem } from "@/types/expense";
import { BazaarSchedule } from "@/types/bazaar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { Printer, History, Calendar } from "lucide-react";
import { toast } from "sonner";

interface SettlementRow {
  uid: string;
  member: string;
  room: string;
  meals: number;
  mealCost: number;
  shared: number;
  totalDebit: number;
  deposited: number;
  net: number;
}

interface DailySummaryRow {
  date: string;
  bazaarCost: number;
  utilityCost: number;
  buyers: string[];
  mealsLogged: number;
}

function CurrentReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthIdParam = searchParams.get("monthId");

  const { currentHostel, isManager } = useHostel();
  const { isFirebaseConfigured } = useAuth();
  const { monthName: activeMonthName, monthId: activeMonthId, currency } = useCurrentMonth();

  // Selected month ID defaults to search query or active month ID
  const selectedMonthId = monthIdParam || activeMonthId || "";

  const [loading, setLoading] = useState(true);
  const [monthsList, setMonthsList] = useState<HostelMonth[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [bazaars, setBazaars] = useState<BazaarSchedule[]>([]);

  const { currencySymbol } = useTranslation();

  const fetchReportData = useCallback(async () => {
    if (!currentHostel || !selectedMonthId) return;
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const [mList, mlList, dList, eList, bList, allMonths] = await Promise.all([
          MemberService.listMembersWithProfiles(currentHostel.id),
          MealService.getMealsForMonth(currentHostel.id, selectedMonthId),
          DepositService.getDepositsForMonth(currentHostel.id, selectedMonthId),
          ExpenseService.getExpensesForMonth(currentHostel.id, selectedMonthId),
          BazaarService.getBazaarForMonth(currentHostel.id, selectedMonthId),
          HostelService.getMonths(currentHostel.id),
        ]);
        setMembers(mList);
        setMeals(mlList);
        setDeposits(dList);
        setExpenses(eList);
        setBazaars(bList);
        setMonthsList(allMonths.sort((a: any, b: any) => b.id.localeCompare(a.id)));
      } else {
        setMembers([]);
        setMeals([]);
        setDeposits([]);
        setExpenses([]);
        setBazaars([]);
        setMonthsList([]);
      }
    } catch (error) {
      console.error("Error loading report data:", error);
      toast.error("Failed to load selected monthly report data");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, selectedMonthId, isFirebaseConfigured]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Aggregate stats
  const totalMealsSum = meals.reduce((sum, r) => sum + r.totalMeals, 0);
  const totalExpensesSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBazaarExpenses = expenses.filter((e) => e.category === "bazaar").reduce((sum, e) => sum + e.amount, 0);
  const totalDepositsSum = deposits.filter((d) => d.status === "approved").reduce((sum, d) => sum + d.amount, 0);

  const mealRate = totalMealsSum > 0 ? totalBazaarExpenses / totalMealsSum : 0;
  const sharedUtilities = expenses.filter((e) => e.category !== "bazaar").reduce((sum, e) => sum + e.amount, 0);
  const perMemberSharedCost = members.length > 0 ? sharedUtilities / members.length : 0;

  // Process member settlement rows
  const settlementRows: SettlementRow[] = members.map((m) => {
    const memberMeals = meals
      .filter((r) => r.userId === m.uid)
      .reduce((sum, r) => sum + r.totalMeals, 0);

    const memberDeposited = deposits
      .filter((d) => d.userId === m.uid && d.status === "approved")
      .reduce((sum, d) => sum + d.amount, 0);

    const mealCost = memberMeals * mealRate;
    const totalDebit = mealCost + perMemberSharedCost;
    const net = memberDeposited - totalDebit;

    return {
      uid: m.uid,
      member: m.name,
      room: m.roomNumber || "TBD",
      meals: memberMeals,
      mealCost: Math.round(mealCost),
      shared: Math.round(perMemberSharedCost),
      totalDebit: Math.round(totalDebit),
      deposited: memberDeposited,
      net: Math.round(net),
    };
  });

  // Process date-wise daily log
  const dailySummaryRows: DailySummaryRow[] = (() => {
    // Collect all unique dates
    const dateSet = new Set<string>();
    meals.forEach((m) => dateSet.add(m.date));
    expenses.forEach((e) => dateSet.add(e.date));
    bazaars.forEach((b) => dateSet.add(b.date));

    const rows: DailySummaryRow[] = Array.from(dateSet).map((d) => {
      // Bazaar costs (category = bazaar)
      const dayBazaarCost = expenses
        .filter((e) => e.date === d && e.category === "bazaar")
        .reduce((sum, e) => sum + e.amount, 0);

      // Utility/other costs on this date
      const dayUtilityCost = expenses
        .filter((e) => e.date === d && e.category !== "bazaar")
        .reduce((sum, e) => sum + e.amount, 0);

      // Buyers assigned on this date
      const dayBuyers: string[] = [];
      bazaars
        .filter((b) => b.date === d)
        .forEach((b) => {
          if (b.assignedMemberNames) {
            dayBuyers.push(...b.assignedMemberNames);
          }
        });

      // Total meals eaten on this date
      const dayMeals = meals
        .filter((m) => m.date === d)
        .reduce((sum, m) => sum + m.totalMeals, 0);

      return {
        date: d,
        bazaarCost: dayBazaarCost,
        utilityCost: dayUtilityCost,
        buyers: Array.from(new Set(dayBuyers)),
        mealsLogged: dayMeals,
      };
    });

    // Sort descending by date
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  })();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const getSelectedMonthName = () => {
    const found = monthsList.find((m) => m.id === selectedMonthId);
    return found ? found.name : activeMonthName || "Selected Month";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getSelectedMonthName()} Report`}
        description="Comprehensive financial summary, individual meal rates, and daily bazaar log sheet"
        action={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/reports/all">
              <Button variant="outline" size="sm" leftIcon={<History className="w-4 h-4" />}>
                All Reports
              </Button>
            </Link>
            {isManager && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print / Export
              </Button>
            )}
          </div>
        }
      />

      {/* Month Switcher Dropdown */}
      {monthsList.length > 1 && (
        <Card className="max-w-xs">
          <CardContent className="p-4">
            <Select
              label="Switch Month Report"
              value={selectedMonthId}
              onChange={(e) => router.push(`/dashboard/reports/current?monthId=${e.target.value}`)}
              options={monthsList.map((m) => ({
                value: m.id,
                label: m.name + (m.id === activeMonthId ? " (Active)" : ""),
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* High-Level Overview Cards (Overall Calculation) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Meal Rate</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {currencySymbol} {mealRate.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Hostel Add Money</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {currencySymbol} {totalDepositsSum.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Expense Money</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {currencySymbol} {totalExpensesSum.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Carry Money</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              {currencySymbol} {(totalDepositsSum - totalExpensesSum).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Member Financial Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Member Settlement Sheet</CardTitle>
          <CardDescription>Individual meal costs, shared utility split, and carry money balance</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading settlement sheet...</div>
          ) : settlementRows.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
              No active member logs found for this month.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Meals</TableHead>
                  <TableHead>Meal Cost</TableHead>
                  <TableHead>Shared Cost</TableHead>
                  <TableHead>Total Debit</TableHead>
                  <TableHead>Add Money (Deposited)</TableHead>
                  <TableHead>Carry Money</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlementRows.map((r) => {
                  const isRefund = r.net >= 0;
                  return (
                    <TableRow key={r.uid}>
                      <TableCell className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">{r.member}</TableCell>
                      <TableCell className="font-mono text-xs">{r.room}</TableCell>
                      <TableCell className="font-semibold text-xs">{r.meals}</TableCell>
                      <TableCell className="text-xs">{currencySymbol} {r.mealCost.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{currencySymbol} {r.shared.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-semibold">{currencySymbol} {r.totalDebit.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-emerald-600 font-semibold">
                        {currencySymbol} {r.deposited.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isRefund
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                          }`}
                        >
                          {isRefund ? "+" : ""}
                          {currencySymbol} {r.net.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Date-Wise daily log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <CardTitle>Daily Bazaar & Meals Log</CardTitle>
          </div>
          <CardDescription>Day-by-day bazaar expenditures and meals consumed</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading daily log...</div>
          ) : dailySummaryRows.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
              No daily logs found for this month.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Bazaar Cost</TableHead>
                  <TableHead>Shared Cost</TableHead>
                  <TableHead>Assigned Buyer</TableHead>
                  <TableHead>Total Meals Eaten</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailySummaryRows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">{r.date}</TableCell>
                    <TableCell className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {r.bazaarCost > 0 ? `${currencySymbol} ${r.bazaarCost.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {r.utilityCost > 0 ? `${currencySymbol} ${r.utilityCost.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                      {r.buyers.length > 0 ? r.buyers.join(", ") : "Not Scheduled"}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {r.mealsLogged}
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

export default function CurrentReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Report...</div>}>
      <CurrentReportContent />
    </Suspense>
  );
}
