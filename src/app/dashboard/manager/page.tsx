"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { MemberService } from "@/lib/services/member.service";
import { RequestService } from "@/lib/services/request.service";
import { MemberWithProfile } from "@/types/member";
import { ApprovalRequest } from "@/types/request";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { UserCheck, RefreshCw, Check, X, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function ManagerPage() {
  const router = useRouter();
  const { currentHostel, role, isManager, refreshHostel } = useHostel();
  const { user, isFirebaseConfigured, refreshProfile } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [nextManagerId, setNextManagerId] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [submittingHandover, setSubmittingHandover] = useState(false);

  const fetchManagerData = useCallback(async () => {
    if (!currentHostel) return;
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        if (isManager) {
          const [mList, rList] = await Promise.all([
            MemberService.listMembersWithProfiles(currentHostel.id),
            RequestService.listRequests(currentHostel.id, "pending"),
          ]);
          setMembers(mList);
          setRequests(rList);
        } else {
          const mList = await MemberService.listMembersWithProfiles(currentHostel.id);
          setMembers(mList);
          setRequests([]);
        }
      } else {
        setMembers([]);
        setRequests([]);
      }
    } catch (error) {
      console.error("Error loading manager dashboard:", error);
      toast.error("Failed to load manager operations data");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, isFirebaseConfigured, isManager]);

  useEffect(() => {
    fetchManagerData();
  }, [fetchManagerData]);

  // Find active manager info
  const activeManager = members.find((m) => m.role === "manager");

  // Candidates for handover (active members who are not manager)
  const handoverCandidates = members.filter((m) => m.role !== "manager" && m.status === "active");

  const handleHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextManagerId) {
      toast.error("Please select a member to transfer power to");
      return;
    }
    if (!currentHostel || !user) return;

    const confirmText = "Are you sure you want to transfer manager privileges? You will lose manager permissions instantly.";
    if (typeof window !== "undefined" && !window.confirm(confirmText)) {
      return;
    }

    setSubmittingHandover(true);
    try {
      if (isFirebaseConfigured) {
        await MemberService.transferManagerPower(currentHostel.id, user.uid, nextManagerId);
        toast.success("Manager designation transferred successfully! Demoted to member.");
        await refreshProfile();
        await refreshHostel();
        router.push("/dashboard");
      } else {
        toast.success("Demo: Manager designation transferred");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to handover manager duties");
    } finally {
      setSubmittingHandover(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!currentHostel || !user) return;
    setProcessingId(requestId);
    try {
      if (isFirebaseConfigured) {
        await RequestService.approveRequest(currentHostel.id, requestId, user.uid);
        toast.success("Request approved and updated in database!");
        fetchManagerData();
      } else {
        toast.success("Demo: Request approved");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!currentHostel) return;
    setProcessingId(requestId);
    try {
      if (isFirebaseConfigured) {
        await RequestService.rejectRequest(currentHostel.id, requestId);
        toast.success("Request rejected");
        fetchManagerData();
      } else {
        toast.success("Demo: Request rejected");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  const getRequestDescription = (req: ApprovalRequest) => {
    const details = req.details;
    switch (req.type) {
      case "meal":
        return `Meal Log on ${details.date}: B=${details.breakfast}, L=${details.lunch}, D=${details.dinner} (Total=${details.totalMeals})`;
      case "deposit":
        return `Deposit Record: ${details.paymentMethod?.toUpperCase()} - amount: ৳${details.amount} (Ref: ${details.transactionId})`;
      case "expense":
        return `Expense item: ${details.title} - category: ${details.category} - amount: ৳${details.amount} (${details.date})`;
      case "bazaar_schedule":
        return `Bazaar duty: ${details.date} - budget: ৳${details.allocatedBudget} (Members: ${details.assignedMemberNames?.join(", ")})`;
      default:
        return "Custom request";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Mess Manager Operations"
        description="Designate mess managers, manage responsibility rotations, and transfer financial duties"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manager Handover Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Current Designated Manager</CardTitle>
                  <CardDescription>Responsible for daily bazaar logs and deposit approvals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {activeManager ? activeManager.name : "Tanvir Ahmed"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Room {activeManager?.roomNumber || "TBD"}
                  </p>
                </div>
                <Badge variant="manager" size="md">
                  ACTIVE MANAGER
                </Badge>
              </div>

              {isManager && (
                <form onSubmit={handleHandover} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Transfer Manager Responsibility
                  </h4>

                  <Select
                    label="Select Next Manager"
                    value={nextManagerId}
                    onChange={(e) => setNextManagerId(e.target.value)}
                    options={[
                      { value: "", label: "Choose member..." },
                      ...handoverCandidates.map((m) => ({
                        value: m.uid,
                        label: `${m.name} (Room ${m.roomNumber || "TBD"})`,
                      })),
                    ]}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    isLoading={submittingHandover}
                  >
                    Confirm Manager Handover
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Requests List Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Pending Member Requests</CardTitle>
                  <CardDescription>Verify and approve member meal schedules, deposits, and bazaar budgets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading requests...</div>
              ) : !isManager ? (
                <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
                  Only the active manager has permissions to view and approve member requests.
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
                  No pending requests from members.
                </div>
              ) : (
                <Table className="border-0 rounded-none shadow-none">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs md:text-sm">
                            {r.userName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.type === "meal" ? "primary" : r.type === "deposit" ? "success" : r.type === "expense" ? "danger" : "warning"} size="sm">
                            {r.type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300 max-w-[280px] truncate">
                          {getRequestDescription(r)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="success"
                              className="p-1.5 aspect-square"
                              onClick={() => handleApproveRequest(r.id)}
                              disabled={processingId !== null}
                              isLoading={processingId === r.id}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="p-1.5 aspect-square"
                              onClick={() => handleRejectRequest(r.id)}
                              disabled={processingId !== null}
                              isLoading={processingId === r.id}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
