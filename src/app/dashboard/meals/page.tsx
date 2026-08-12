"use client";

import React, { useState } from "react";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function MealsPage() {
  const { monthName } = useCurrentMonth();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const sampleDailyTally = [
    { date: "2026-08-12 (Today)", breakfast: 14, lunch: 16, dinner: 18, total: 48, status: "open" },
    { date: "2026-08-11", breakfast: 15, lunch: 15, dinner: 17, total: 47, status: "locked" },
    { date: "2026-08-10", breakfast: 13, lunch: 16, dinner: 16, total: 45, status: "locked" },
    { date: "2026-08-09", breakfast: 14, lunch: 17, dinner: 18, total: 49, status: "locked" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("meals")}
        description={`Daily meal counts and member tallies for ${monthName}`}
        action={
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Today&apos;s Meals
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Month Meals</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">482</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Average Daily Meals</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">40.1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Active Eaters</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">18 Members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Meal Records</CardTitle>
          <CardDescription>Breakdown by breakfast, lunch, and dinner</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="border-0 rounded-none shadow-none">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Breakfast</TableHead>
                <TableHead>Lunch</TableHead>
                <TableHead>Dinner</TableHead>
                <TableHead>Total Meals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleDailyTally.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-xs md:text-sm">{d.date}</TableCell>
                  <TableCell>{d.breakfast}</TableCell>
                  <TableCell>{d.lunch}</TableCell>
                  <TableCell>{d.dinner}</TableCell>
                  <TableCell className="font-bold text-blue-600">{d.total}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === "open" ? "success" : "default"} size="sm">
                      {d.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Daily Meals"
        description="Submit meal counts for today"
      >
        <div className="space-y-4">
          <Input label="Date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
          <div className="grid grid-cols-3 gap-2">
            <Input label="Breakfast" type="number" defaultValue="1" />
            <Input label="Lunch" type="number" defaultValue="1" />
            <Input label="Dinner" type="number" defaultValue="1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Meal record updated successfully!");
                setModalOpen(false);
              }}
            >
              Save Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
