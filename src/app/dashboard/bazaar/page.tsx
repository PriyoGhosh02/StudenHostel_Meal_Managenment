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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function BazaarPage() {
  const { isManager } = useHostel();
  const { monthName } = useCurrentMonth();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const sampleSchedules = [
    { date: "2026-08-13 (Tomorrow)", assigned: "Tanvir Ahmed & Shafiul", budget: 2500, spent: "-", status: "scheduled" },
    { date: "2026-08-11", assigned: "Alex Rahman & Mahmudul", budget: 3000, spent: 2890, status: "completed" },
    { date: "2026-08-08", assigned: "Shafiul & Rafiq", budget: 5000, spent: 4850, status: "completed" },
    { date: "2026-08-04", assigned: "Tanvir Ahmed & Alex", budget: 3500, spent: 3420, status: "completed" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bazaar")}
        description={`Duty schedules and budget allocations for ${monthName}`}
        action={
          isManager && (
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Schedule Bazaar Duty
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Bazaar Spent</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">৳ 18,200</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Shopping Trips</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">9 Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Upcoming Scheduled</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">2 Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bazaar Schedule & Duty Roster</CardTitle>
          <CardDescription>Member rotation and expense accountability</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="border-0 rounded-none shadow-none">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Assigned Members</TableHead>
                <TableHead>Allocated Budget</TableHead>
                <TableHead>Actual Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleSchedules.map((b, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-xs md:text-sm">{b.date}</TableCell>
                  <TableCell className="text-xs text-slate-700">{b.assigned}</TableCell>
                  <TableCell className="text-xs font-semibold">৳ {b.budget}</TableCell>
                  <TableCell className="text-xs font-bold text-blue-600">
                    {b.spent === "-" ? "-" : `৳ ${b.spent}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "completed" ? "success" : "warning"} size="sm">
                      {b.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Details
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
        title="Schedule Bazaar Duty"
        description="Assign members for shopping"
      >
        <div className="space-y-4">
          <Input label="Date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
          <Input label="Assigned Member Names" placeholder="e.g. Tanvir, Shafiul" />
          <Input label="Allocated Budget (৳)" type="number" placeholder="e.g. 3000" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Bazaar duty scheduled successfully!");
                setModalOpen(false);
              }}
            >
              Confirm Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
