"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { DepositService } from "@/lib/services/deposit.service";
import { MemberService } from "@/lib/services/member.service";
import { RequestService } from "@/lib/services/request.service";
import { DepositRecord, PaymentMethod } from "@/types/deposit";
import { MemberWithProfile } from "@/types/member";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function DepositsPage() {
  const { currentHostel, currentMember, isManager } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { monthName, monthId, currency } = useCurrentMonth();
  const { t, currencySymbol } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [transactionId, setTransactionId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDepositsData = useCallback(async () => {
    if (!currentHostel || !monthId) return;

    if (currentMember?.status === "pending") {
      setDeposits([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const [depList, memList] = await Promise.all([
          DepositService.getDepositsForMonth(currentHostel.id, monthId),
          MemberService.listMembersWithProfiles(currentHostel.id)
        ]);
        setDeposits(depList);
        setMembers(memList);
        if (user) {
          setTargetUserId(user.uid);
        }
      } else {
        setDeposits([]);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading deposits data:", error);
      toast.error("Failed to load deposits");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, monthId, isFirebaseConfigured, user]);

  useEffect(() => {
    fetchDepositsData();
  }, [fetchDepositsData]);

  const totalDepositsSum = deposits.filter((d) => d.status === "approved").reduce((sum, d) => sum + d.amount, 0);
  const pendingApprovalsCount = deposits.filter((d) => d.status === "pending").length;
  const contributingCount = Array.from(new Set(deposits.filter((d) => d.status === "approved").map((d) => d.userId))).length;

  const handleSubmitDeposit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    if (!currentHostel || !monthId || !user) return;
    const finalUserId = targetUserId || user.uid;

    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        if (isManager) {
          await DepositService.addDeposit(currentHostel.id, {
            monthId,
            userId: finalUserId,
            amount: parsedAmount,
            paymentMethod,
            transactionId: transactionId || "-",
            status: "approved",
            notes,
          });
          toast.success("Deposit recorded and approved!");
          fetchDepositsData();
        } else {
          // Submit request for manager review
          await RequestService.submitRequest(currentHostel.id, {
            monthId,
            type: "deposit",
            userId: user.uid,
            userName: profile?.name || "Member",
            details: {
              amount: parsedAmount,
              paymentMethod,
              transactionId: transactionId || "-",
            },
          });
          toast.success("Deposit approval request sent to manager!");
        }
      } else {
        toast.success("Demo: Deposit submitted");
      }
      setModalOpen(false);
      setAmount("");
      setTransactionId("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (depositId: string, status: "approved" | "rejected") => {
    if (!currentHostel || !user) return;
    setActionLoading(`${depositId}-${status}`);
    try {
      if (isFirebaseConfigured) {
        await DepositService.updateStatus(currentHostel.id, depositId, status, user.uid);
        toast.success(`Deposit request ${status}!`);
        fetchDepositsData();
      } else {
        toast.success(`Demo: Deposit updated to ${status}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update deposit status");
    } finally {
      setActionLoading(null);
    }
  };

  const getMemberDetails = (userId: string) => {
    const member = members.find((m) => m.uid === userId);
    return {
      name: member?.name || "Unknown Member",
      room: member?.roomNumber || "TBD",
    };
  };

  const formatDepositDate = (dep: DepositRecord) => {
    if (!dep.createdAt) return "";
    let d: Date;
    if ('toDate' in dep.createdAt && typeof dep.createdAt.toDate === 'function') {
      d = dep.createdAt.toDate();
    } else {
      d = new Date();
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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
            {isManager ? "Record Deposit" : "Submit Deposit Request"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Deposits</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {currencySymbol} {totalDepositsSum.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Pending Approvals</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {pendingApprovalsCount} {pendingApprovalsCount === 1 ? "Entry" : "Entries"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Contributing Members</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {contributingCount} {contributingCount === 1 ? "Member" : "Members"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Records & Logs</CardTitle>
          <CardDescription>Verified contributions and pending review receipts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading deposits...</div>
          ) : deposits.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
              No deposit records found. All values are initially 0.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {isManager && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((d) => {
                  const mInfo = getMemberDetails(d.userId);
                  return (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs md:text-sm">{mInfo.name}</div>
                        <div className="text-[10px] text-slate-400">Room {mInfo.room}</div>
                      </TableCell>
                      <TableCell className="font-bold text-xs md:text-sm text-emerald-600 dark:text-emerald-400">
                        {currencySymbol} {d.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs uppercase">{d.paymentMethod}</TableCell>
                      <TableCell className="font-mono text-xs">{d.transactionId}</TableCell>
                      <TableCell className="text-xs">{formatDepositDate(d)}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === "approved" ? "success" : d.status === "rejected" ? "danger" : "warning"} size="sm">
                          {d.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      {isManager && (
                        <TableCell>
                          {d.status === "pending" && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="success"
                                className="p-1"
                                onClick={() => handleUpdateStatus(d.id, "approved")}
                                disabled={actionLoading !== null}
                                isLoading={actionLoading === `${d.id}-approved`}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                className="p-1"
                                onClick={() => handleUpdateStatus(d.id, "rejected")}
                                disabled={actionLoading !== null}
                                isLoading={actionLoading === `${d.id}-rejected`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isManager ? "Record Deposit" : "Submit Deposit Request"}
        description={isManager ? "Log verified cash or digital payment directly" : "Submit deposit reference for manager review"}
      >
        <div className="space-y-4">
          {isManager && members.length > 0 && (
            <Select
              label="Select Member"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              options={members.map((m) => ({ value: m.uid, label: `${m.name} (Room ${m.roomNumber || "TBD"})` }))}
            />
          )}

          <Input
            label={`Amount (${currencySymbol})`}
            type="number"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={[
              { value: "cash", label: "Cash" },
              { value: "bkash", label: "bKash" },
              { value: "nagad", label: "Nagad" },
              { value: "rocket", label: "Rocket" },
              { value: "bank", label: "Bank Transfer" },
              { value: "upi", label: "UPI" },
              { value: "other", label: "Other" },
            ]}
          />

          <Input
            label="Transaction ID / Reference"
            placeholder="e.g. BKX1098234"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />

          <Input
            label="Additional Notes"
            placeholder="e.g. Paid for August meals"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDeposit}
              isLoading={submitting}
            >
              {isManager ? "Record & Approve" : "Submit Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
