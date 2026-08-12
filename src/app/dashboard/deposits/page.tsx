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

export default function DepositsPage() {
  const { isManager } = useHostel();
  const { monthName } = useCurrentMonth();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const sampleDeposits = [
    { member: "Alex Rahman", room: "302", amount: 5000, method: "bKash", txId: "TRX902341", date: "2026-08-02", status: "approved" },
    { member: "Tanvir Ahmed", room: "304", amount: 4500, method: "Cash", txId: "-", date: "2026-08-03", status: "approved" },
    { member: "Shafiul Islam", room: "201", amount: 3000, method: "Nagad", txId: "NG882194", date: "2026-08-04", status: "approved" },
    { member: "Mahmudul Hasan", room: "202", amount: 4000, method: "Bank", txId: "BK77123", date: "2026-08-05", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("deposits")}
        description={`Member deposit logs and balance contributions for ${monthName}`}
        action={
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Submit Deposit
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Deposits</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">৳ 42,500</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Pending Approvals</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">1 Entry</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Contributing Members</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">18 / 18</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Transactions</CardTitle>
          <CardDescription>Verified member deposit history</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="border-0 rounded-none shadow-none">
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Tx / Ref</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                {isManager && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleDeposits.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-semibold text-xs md:text-sm">{d.member}</div>
                    <div className="text-[10px] text-slate-400">Room {d.room}</div>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600">৳ {d.amount}</TableCell>
                  <TableCell className="capitalize text-xs">{d.method}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{d.txId}</TableCell>
                  <TableCell className="text-xs">{d.date}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === "approved" ? "success" : "warning"} size="sm">
                      {d.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  {isManager && (
                    <TableCell>
                      {d.status === "pending" ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => toast.success("Deposit approved!")}
                          >
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Verified</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Deposit"
        description="Record a new member payment"
      >
        <div className="space-y-4">
          <Input label="Amount (৳)" type="number" placeholder="e.g. 3000" />
          <Select
            label="Payment Method"
            options={[
              { value: "bkash", label: "bKash" },
              { value: "nagad", label: "Nagad" },
              { value: "cash", label: "Cash to Manager" },
              { value: "bank", label: "Bank Transfer" },
            ]}
          />
          <Input label="Transaction ID (Optional)" placeholder="e.g. TRX12345" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Deposit submitted for approval!");
                setModalOpen(false);
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
