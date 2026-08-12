"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { ExpenseService } from "@/lib/services/expense.service";
import { MemberService } from "@/lib/services/member.service";
import { RequestService } from "@/lib/services/request.service";
import { ExpenseItem, ExpenseCategory } from "@/types/expense";
import { MemberWithProfile } from "@/types/member";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function ExpensesPage() {
  const { currentHostel, isManager } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { monthName, monthId, currency } = useCurrentMonth();
  const { t, currencySymbol } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("bazaar");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExpensesData = useCallback(async () => {
    if (!currentHostel || !monthId) return;
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const [expList, memList] = await Promise.all([
          ExpenseService.getExpensesForMonth(currentHostel.id, monthId),
          MemberService.listMembersWithProfiles(currentHostel.id)
        ]);
        setExpenses(expList);
        setMembers(memList);
      } else {
        setExpenses([]);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading expenses data:", error);
      toast.error("Failed to load expenses records");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, monthId, isFirebaseConfigured]);

  useEffect(() => {
    fetchExpensesData();
  }, [fetchExpensesData]);

  // Aggregate stats
  const totalExpensesSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBazaarSum = expenses.filter((e) => e.category === "bazaar").reduce((sum, e) => sum + e.amount, 0);
  const totalUtilitiesSum = expenses.filter((e) => e.category !== "bazaar").reduce((sum, e) => sum + e.amount, 0);

  const handleSaveExpense = async () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      toast.error("Please enter an expense title");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    if (!currentHostel || !monthId || !user) return;

    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        if (isManager) {
          await ExpenseService.addExpense(currentHostel.id, {
            monthId,
            title,
            amount: parsedAmount,
            category,
            date,
            description,
            createdBy: user.uid,
          });
          toast.success("Expense logged successfully!");
          fetchExpensesData();
        } else {
          // Submit request for manager approval
          await RequestService.submitRequest(currentHostel.id, {
            monthId,
            type: "expense",
            userId: user.uid,
            userName: profile?.name || "Member",
            details: {
              title,
              category,
              amount: parsedAmount,
              date,
            },
          });
          toast.success("Expense request submitted to manager!");
        }
      } else {
        toast.success("Demo: Expense saved");
      }
      setModalOpen(false);
      setTitle("");
      setAmount("");
      setCategory("bazaar");
      setDescription("");
    } catch (error: any) {
      toast.error(error.message || "Failed to log expense");
    } finally {
      setSubmitting(false);
    }
  };

  const getCreatorName = (uid: string) => {
    const member = members.find((m) => m.uid === uid);
    return member ? member.name.split(" ")[0] : "Member";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("expenses")}
        description={`Categorized hostel expenses and operational spending for ${monthName}`}
        action={
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isManager ? "Log Expense" : "Request Expense Log"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Monthly Expenses</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {currencySymbol} {totalExpensesSum.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Bazaar (Meal Cost)</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {currencySymbol} {totalBazaarSum.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Shared Utilities & Salary</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {currencySymbol} {totalUtilitiesSum.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>Itemized spending log</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
              No expense records found for this month. All values are initially 0.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Expense Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">{e.title}</TableCell>
                    <TableCell>
                      <Badge variant={e.category === "bazaar" ? "primary" : "secondary"} size="sm">
                        {e.category.toUpperCase().replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-rose-600 dark:text-rose-400">
                      {currencySymbol} {e.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{e.date}</TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">{getCreatorName(e.createdBy)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isManager ? "Log Expense" : "Request Expense Log"}
        description={isManager ? "Submit new mess expenditure record" : "Send bazaar or utility expense request to manager for approval"}
      >
        <div className="space-y-4">
          <Input
            label="Expense Title"
            placeholder="e.g. Rice & Spices bazaar"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label={`Amount (${currencySymbol})`}
            type="number"
            placeholder="e.g. 1500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            options={[
              { value: "bazaar", label: "Bazaar (Meal Cost)" },
              { value: "utility", label: "Shared Utilities" },
              { value: "cook_salary", label: "Cook Salary" },
              { value: "gas", label: "Gas Bill" },
              { value: "internet", label: "Internet Bill" },
              { value: "maintenance", label: "Maintenance" },
              { value: "other", label: "Other" },
            ]}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveExpense}
              isLoading={submitting}
            >
              {isManager ? "Save Record" : "Submit Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
