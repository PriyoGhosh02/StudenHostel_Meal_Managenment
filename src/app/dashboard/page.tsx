"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { MemberService } from "@/lib/services/member.service";
import { MealService } from "@/lib/services/meal.service";
import { DepositService } from "@/lib/services/deposit.service";
import { ExpenseService } from "@/lib/services/expense.service";
import { BazaarService } from "@/lib/services/bazaar.service";
import { RequestService } from "@/lib/services/request.service";
import { MemberWithProfile } from "@/types/member";
import { MealRecord } from "@/types/meal";
import { DepositRecord, PaymentMethod } from "@/types/deposit";
import { ExpenseItem, ExpenseCategory } from "@/types/expense";
import { BazaarSchedule } from "@/types/bazaar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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

interface MemberSummary {
  uid: string;
  name: string;
  role: string;
  room: string;
  meals: number;
  deposited: number;
  debit: number;
  net: string;
}

export default function DashboardPage() {
  const { currentHostel, currentMember, role, isManager, refreshHostel } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { monthName, monthId, currency } = useCurrentMonth();
  const { t, currencySymbol } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [bazaars, setBazaars] = useState<BazaarSchedule[]>([]);

  // Quick Action Modal state
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick Action Form states
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [quickTargetUserId, setQuickTargetUserId] = useState("");
  const [quickAmount, setQuickAmount] = useState("");

  // Meal Specifics
  const [quickBreakfast, setQuickBreakfast] = useState("1");
  const [quickLunch, setQuickLunch] = useState("1");
  const [quickDinner, setQuickDinner] = useState("1");

  // Deposit Specifics
  const [quickMethod, setQuickMethod] = useState<PaymentMethod>("cash");
  const [quickTxId, setQuickTxId] = useState("");

  // Expense Specifics
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState<ExpenseCategory>("bazaar");

  const fetchDashboardData = useCallback(async () => {
    if (!currentHostel || !monthId) return;

    if (currentMember?.status === "pending") {
      setMembers([]);
      setMeals([]);
      setDeposits([]);
      setExpenses([]);
      setBazaars([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const [mList, mlList, dList, eList, bList] = await Promise.all([
          MemberService.listMembersWithProfiles(currentHostel.id),
          MealService.getMealsForMonth(currentHostel.id, monthId),
          DepositService.getDepositsForMonth(currentHostel.id, monthId),
          ExpenseService.getExpensesForMonth(currentHostel.id, monthId),
          BazaarService.getBazaarForMonth(currentHostel.id, monthId)
        ]);
        setMembers(mList);
        setMeals(mlList);
        setDeposits(dList);
        setExpenses(eList);
        setBazaars(bList);
        if (user && !quickTargetUserId) {
          setQuickTargetUserId(user.uid);
        }
      } else {
        setMembers([]);
        setMeals([]);
        setDeposits([]);
        setExpenses([]);
        setBazaars([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentHostel, monthId, isFirebaseConfigured, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Aggregate Stats
  const totalMealsSum = isFirebaseConfigured
    ? meals.reduce((sum, r) => sum + r.totalMeals, 0)
    : 0;

  const totalExpensesSum = isFirebaseConfigured
    ? expenses.reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const totalBazaarExpenses = isFirebaseConfigured
    ? expenses.filter((e) => e.category === "bazaar").reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const totalDepositsSum = isFirebaseConfigured
    ? deposits.filter((d) => d.status === "approved").reduce((sum, d) => sum + d.amount, 0)
    : 0;

  const mealRate = isFirebaseConfigured
    ? totalMealsSum > 0
      ? totalBazaarExpenses / totalMealsSum
      : 0
    : 0;

  const sharedUtilities = isFirebaseConfigured
    ? expenses.filter((e) => e.category !== "bazaar").reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const perMemberSharedCost = isFirebaseConfigured
    ? members.length > 0
      ? sharedUtilities / members.length
      : 0
    : 0;

  // Process Member Summaries for the main balance overview
  const memberSummaries: MemberSummary[] = (() => {
    if (!isFirebaseConfigured) {
      return [];
    }

    return members.map((m) => {
      // Filter meals by this user
      const memberMeals = meals
        .filter((r) => r.userId === m.uid)
        .reduce((sum, r) => sum + r.totalMeals, 0);

      // Filter approved deposits by this user
      const memberDeposits = deposits
        .filter((d) => d.userId === m.uid && d.status === "approved")
        .reduce((sum, d) => sum + d.amount, 0);

      const debit = (memberMeals * mealRate) + perMemberSharedCost;
      const netVal = memberDeposits - debit;
      const netFormatted = netVal >= 0 ? `+${netVal.toFixed(0)}` : `${netVal.toFixed(0)}`;

      return {
        uid: m.uid,
        name: m.name + (m.uid === user?.uid ? " (You)" : ""),
        role: m.role,
        room: m.roomNumber || "TBD",
        meals: memberMeals,
        deposited: memberDeposits,
        debit: Math.round(debit),
        net: netFormatted,
      };
    });
  })();

  const handleQuickSubmit = async () => {
    if (!currentHostel || !monthId || !user) return;
    setSubmitting(true);
    try {
      const finalUserId = quickTargetUserId || user.uid;

      if (quickActionModal === "meal") {
        const breakfast = Number(quickBreakfast) || 0;
        const lunch = Number(quickLunch) || 0;
        const dinner = Number(quickDinner) || 0;
        const total = breakfast + lunch + dinner;

        if (isFirebaseConfigured) {
          if (isManager) {
            await MealService.recordMeal(currentHostel.id, {
              monthId,
              userId: finalUserId,
              date: quickDate,
              breakfast,
              lunch,
              dinner,
              totalMeals: total,
              recordedBy: user.uid,
            });
            toast.success("Meal count updated!");
          } else {
            await RequestService.submitRequest(currentHostel.id, {
              monthId,
              type: "meal",
              userId: user.uid,
              userName: profile?.name || "Member",
              details: {
                date: quickDate,
                targetUserId: finalUserId,
                breakfast,
                lunch,
                dinner,
                totalMeals: total,
              },
            });
            toast.success("Meal request submitted to manager!");
          }
        } else {
          toast.success("Demo: Meal count updated!");
        }
      } else if (quickActionModal === "deposit") {
        const amt = parseFloat(quickAmount);
        if (isNaN(amt) || amt <= 0) {
          toast.error("Please enter a valid amount");
          return;
        }

        if (isFirebaseConfigured) {
          if (isManager) {
            await DepositService.addDeposit(currentHostel.id, {
              monthId,
              userId: finalUserId,
              amount: amt,
              paymentMethod: quickMethod,
              transactionId: quickTxId || "-",
              status: "approved",
            });
            toast.success("Deposit recorded and approved!");
          } else {
            await RequestService.submitRequest(currentHostel.id, {
              monthId,
              type: "deposit",
              userId: user.uid,
              userName: profile?.name || "Member",
              details: {
                amount: amt,
                paymentMethod: quickMethod,
                transactionId: quickTxId || "-",
              },
            });
            toast.success("Deposit request submitted to manager!");
          }
        } else {
          toast.success("Demo: Deposit submitted!");
        }
      } else if (quickActionModal === "expense") {
        const amt = parseFloat(quickAmount);
        if (!quickTitle.trim()) {
          toast.error("Please enter an expense title");
          return;
        }
        if (isNaN(amt) || amt <= 0) {
          toast.error("Please enter a valid amount");
          return;
        }

        if (isFirebaseConfigured) {
          if (isManager) {
            await ExpenseService.addExpense(currentHostel.id, {
              monthId,
              title: quickTitle,
              amount: amt,
              category: quickCategory,
              date: quickDate,
              createdBy: user.uid,
            });
            toast.success("Expense logged!");
          } else {
            await RequestService.submitRequest(currentHostel.id, {
              monthId,
              type: "expense",
              userId: user.uid,
              userName: profile?.name || "Member",
              details: {
                title: quickTitle,
                category: quickCategory,
                amount: amt,
                date: quickDate,
              },
            });
            toast.success("Expense request submitted to manager!");
          }
        }
      }

      setQuickActionModal(null);
      setQuickAmount("");
      setQuickTitle("");
      setQuickTxId("");
      fetchDashboardData();
      refreshHostel();
    } catch (error: any) {
      toast.error(error.message || "Failed to log action");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    {
      title: t("meal_rate"),
      value: `${currencySymbol} ${mealRate.toFixed(2)}`,
      change: "Bazaar rate",
      isPositive: true,
      icon: <UtensilsCrossed className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200/80",
    },
    {
      title: t("total_meals"),
      value: totalMealsSum.toString(),
      change: `Current month`,
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50 border-indigo-200/80",
    },
    {
      title: t("total_expenses"),
      value: `${currencySymbol} ${totalExpensesSum.toLocaleString()}`,
      change: `Food: ${totalBazaarExpenses.toLocaleString()} • Utilities: ${sharedUtilities.toLocaleString()}`,
      isPositive: false,
      icon: <Receipt className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50 border-rose-200/80",
    },
    {
      title: t("total_deposits"),
      value: `${currencySymbol} ${totalDepositsSum.toLocaleString()}`,
      change: `Remaining: ${currencySymbol}${(totalDepositsSum - totalExpensesSum).toLocaleString()}`,
      isPositive: true,
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200/80",
    },
  ];

  // Upcoming bazaar duties (first 2 scheduled duties)
  const upcomingBazaars = bazaars
    .filter((b) => b.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={currentHostel?.name || t("hostel_dashboard")}
        description={`${t("active_month")}: ${monthName || t("current_month")} • ${t("mess_management")}`}
        badge={
          <Badge variant={((role as string) === "owner" || (role as string) === "admin" || (role as string) === "manager") ? "manager" : "member"} size="md">
            {role ? (((role as string) === "owner" || (role as string) === "admin" || (role as string) === "manager") ? t("role_manager") : t("role_member")) : t("role_member")}
          </Badge>
        }
        action={
          currentMember?.status !== "pending" ? (
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto justify-center text-xs"
                onClick={() => {
                  setQuickActionModal("meal");
                  setQuickDate(new Date().toISOString().split("T")[0]);
                }}
                leftIcon={<UtensilsCrossed className="w-3.5 h-3.5" />}
              >
                {t("add_daily_meal")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto justify-center text-xs"
                onClick={() => setQuickActionModal("deposit")}
                leftIcon={<Wallet className="w-3.5 h-3.5" />}
              >
                {isManager ? t("record_deposit") : t("request_deposit")}
              </Button>
              <Button
                size="sm"
                variant={isManager ? "primary" : "outline"}
                className="w-full sm:w-auto justify-center text-xs"
                onClick={() => {
                  setQuickActionModal("expense");
                  setQuickDate(new Date().toISOString().split("T")[0]);
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                {isManager ? t("log_expense") : t("request_expense")}
              </Button>
            </div>
          ) : undefined
        }
      />

      {currentMember?.status === "pending" && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-4 rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 animate-pulse">
            ⚠️
          </div>
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-300">{t("awaiting_manager_approval")}</h3>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {t("join_request_submitted")} (<strong>{currentHostel?.name}</strong>)
            </p>
          </div>
        </div>
      )}

      {/* Notice Banner */}
      {/* <div className="p-4 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 flex items-start gap-3 shadow-2xs">
        <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
          <Bell className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Hostel Notice: Meal Locking Schedule
            </h4>
            <Badge variant="primary" size="sm">
              Active
            </Badge>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Please submit your dinner meal changes before 4:00 PM daily. All meal
            rates are auto-calculated from logged grocery bills.
          </p>
        </div>

        <Link href="/dashboard/notice">
          <Button variant="ghost" size="sm" className="text-xs bg-blue-600 shrink-0">
            View All
          </Button>
        </Link>
      </div> */}

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
                <CardTitle className="text-base">{t("member_balances")} ({monthName})</CardTitle>
                <CardDescription>{t("live_calculations")}</CardDescription>
              </div>
              <Link href="/dashboard/members">
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  {t("all_members")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8 text-slate-500">{t("loading_balances")}</div>
              ) : memberSummaries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">{t("no_members_registered")}</div>
              ) : (
                <>
                  {/* Table View for larger screens */}
                  <div className="hidden md:block">
                    <Table className="border-0 rounded-none shadow-none">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("members")}</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>{t("meals")}</TableHead>
                          <TableHead>{t("deposited")}</TableHead>
                          <TableHead>{t("current_balance")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberSummaries.map((m) => {
                          const isSurplus = m.net.startsWith("+");
                          return (
                            <TableRow key={m.uid}>
                              <TableCell>
                                <div className="font-semibold text-slate-900 text-xs md:text-sm">{m.name}</div>
                                <div className="text-[10px] text-slate-400 capitalize">{m.role}</div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{m.room}</TableCell>
                              <TableCell className="font-semibold text-xs">{m.meals}</TableCell>
                              <TableCell className="text-xs">{currencySymbol} {m.deposited.toLocaleString()}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isSurplus
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
                  </div>

                  {/* Card List View for Mobile */}
                  <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                    {memberSummaries.map((m) => {
                      const isSurplus = m.net.startsWith("+");
                      return (
                        <div key={m.uid} className="p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{m.name}</div>
                              <div className="text-[10px] text-slate-400 capitalize">{m.role}</div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isSurplus
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                                }`}
                            >
                              Bal: {currencySymbol}{m.net}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                              <span className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Room</span>
                              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{m.room || "N/A"}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                              <span className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("meals")}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{m.meals}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                              <span className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("deposited")}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{currencySymbol}{m.deposited.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bazaar Schedule & Quick Operations (1 col) */}
        <div className="space-y-4">
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
                {t("upcoming_bazaar_duties")}
              </CardTitle>
              <CardDescription>{t("scheduled_rotations")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {loading ? (
                <div className="text-center py-4 text-slate-500 text-xs">{t("loading_duties")}</div>
              ) : upcomingBazaars.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  {t("no_upcoming_duties")}
                </div>
              ) : (
                upcomingBazaars.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{b.date}</span>
                      <Badge variant="warning" size="sm">{t("status").toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">Assigned: {b.assignedMemberNames?.join(" & ") || "Unassigned"}</p>
                    <p className="text-[11px] text-slate-400">Allocated Budget: {currencySymbol} {b.allocatedBudget.toLocaleString()}</p>
                  </div>
                ))
              )}

              <Link href="/dashboard/bazaar" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  {t("manage_bazaar_schedule")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Hostel Share Code Quick Box */}
          <Card className="border-blue-100 dark:border-slate-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-900/30 dark:to-slate-850/30">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-bold text-xs">{t("hostel_code_joining")}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t("share_code_roommates")}
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-center font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
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
            ? t("add_meal_record")
            : quickActionModal === "deposit"
              ? t("record_member_deposit")
              : t("log_hostel_expense")
        }
        description={t("live_calculations")}
      >
        <div className="space-y-4">
          <Input
            label={t("select_meal_date")}
            type="date"
            value={quickDate}
            onChange={(e) => setQuickDate(e.target.value)}
          />

          {quickActionModal === "meal" && (
            <>
              {isManager && members.length > 0 && (
                <Select
                  label={t("select_member")}
                  value={quickTargetUserId}
                  onChange={(e) => setQuickTargetUserId(e.target.value)}
                  options={members.map((m) => ({ value: m.uid, label: `${m.name} (Room ${m.roomNumber || "TBD"})` }))}
                />
              )}
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Breakfast"
                  type="number"
                  min={0}
                  value={quickBreakfast}
                  onChange={(e) => setQuickBreakfast(e.target.value)}
                />
                <Input
                  label="Lunch"
                  type="number"
                  min={0}
                  value={quickLunch}
                  onChange={(e) => setQuickLunch(e.target.value)}
                />
                <Input
                  label="Dinner"
                  type="number"
                  min={0}
                  value={quickDinner}
                  onChange={(e) => setQuickDinner(e.target.value)}
                />
              </div>
            </>
          )}

          {quickActionModal === "deposit" && (
            <>
              {isManager && members.length > 0 && (
                <Select
                  label={t("select_member")}
                  value={quickTargetUserId}
                  onChange={(e) => setQuickTargetUserId(e.target.value)}
                  options={members.map((m) => ({ value: m.uid, label: `${m.name} (Room ${m.roomNumber || "TBD"})` }))}
                />
              )}
              <Input
                label={`${t("deposit_amount")} (${currencySymbol})`}
                type="number"
                placeholder="e.g. 3000"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
              />
              <Select
                label={t("payment_method")}
                value={quickMethod}
                onChange={(e) => setQuickMethod(e.target.value as PaymentMethod)}
                options={[
                  { value: "cash", label: t("cash") },
                  { value: "bkash", label: t("bkash") },
                  { value: "nagad", label: t("nagad") },
                  { value: "rocket", label: "Rocket" },
                  { value: "bank", label: t("bank_transfer") },
                  { value: "upi", label: "UPI" },
                  { value: "other", label: t("other") },
                ]}
              />
              <Input
                label={t("reference_note")}
                placeholder="e.g. TRX109234"
                value={quickTxId}
                onChange={(e) => setQuickTxId(e.target.value)}
              />
            </>
          )}

          {quickActionModal === "expense" && (
            <>
              <Input
                label="Expense Title"
                placeholder="e.g. Rice & Spices bazaar"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
              />
              <Input
                label={`${t("deposit_amount")} (${currencySymbol})`}
                type="number"
                placeholder="e.g. 1500"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
              />
              <Select
                label={t("expense_category")}
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as ExpenseCategory)}
                options={[
                  { value: "bazaar", label: t("grocery_bazaar") },
                  { value: "utility", label: t("utilities") },
                  { value: "cook_salary", label: t("cook_maid_salary") },
                  { value: "gas", label: "Gas Bill" },
                  { value: "internet", label: "Internet Bill" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "other", label: t("other") },
                ]}
              />
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setQuickActionModal(null)} disabled={submitting}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleQuickSubmit}
              isLoading={submitting}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
