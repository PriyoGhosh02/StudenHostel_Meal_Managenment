"use client";

import React, { useState } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
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
  const { isManager } = useHostel();
  const { monthName } = useCurrentMonth();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const sampleExpenses = [
    { title: "Weekly Bazaar — Fish & Veggies", category: "bazaar", amount: 4850, date: "2026-08-08", addedBy: "Tanvir (Manager)" },
    { title: "Monthly Cook Salary", category: "cook_salary", amount: 6000, date: "2026-08-05", addedBy: "Alex (Owner)" },
    { title: "High-Speed Internet Bill", category: "utility", amount: 1500, date: "2026-08-03", addedBy: "Alex (Owner)" },
    { title: "Gas Cylinder Refill", category: "gas", amount: 1450, date: "2026-08-02", addedBy: "Tanvir (Manager)" },
    { title: "Daily Morning Bazaar", category: "bazaar", amount: 1250, date: "2026-08-01", addedBy: "Shafiul" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("expenses")}
        description={`Categorized hostel expenses and operational spending for ${monthName}`}
        action={
          isManager && (
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log Expense
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Monthly Expenses</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">৳ 23,377</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Bazaar (Meal Cost)</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">৳ 18,200</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Shared Utilities & Salary</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">৳ 5,177</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>Itemized spending log</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
              {sampleExpenses.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-xs md:text-sm text-slate-900">{e.title}</TableCell>
                  <TableCell>
                    <Badge variant={e.category === "bazaar" ? "primary" : "secondary"} size="sm">
                      {e.category.toUpperCase().replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-rose-600">৳ {e.amount}</TableCell>
                  <TableCell className="text-xs">{e.date}</TableCell>
                  <TableCell className="text-xs text-slate-500">{e.addedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Expense"
        description="Add a new expense item"
      >
        <div className="space-y-4">
          <Input label="Expense Title" placeholder="e.g. Electricity Bill" />
          <Input label="Amount (৳)" type="number" placeholder="e.g. 2400" />
          <Select
            label="Category"
            options={[
              { value: "bazaar", label: "Bazaar (Grocery / Food)" },
              { value: "utility", label: "Electricity / Water Utility" },
              { value: "cook_salary", label: "Cook / Staff Salary" },
              { value: "gas", label: "Gas Cylinder" },
              { value: "internet", label: "WiFi Internet" },
              { value: "other", label: "Other / Miscellaneous" },
            ]}
          />
          <Input label="Date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Expense logged successfully!");
                setModalOpen(false);
              }}
            >
              Save Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
