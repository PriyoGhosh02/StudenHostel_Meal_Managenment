"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { MemberService } from "@/lib/services/member.service";
import { HostelService } from "@/lib/services/hostel.service";
import { MemberWithProfile, MemberRole } from "@/types/member";
import { JoinRequest } from "@/types/hostel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Users, UserCheck, Copy, Check, CheckCircle2, XCircle, Plus, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function MembersPage() {
  const { currentHostel, currentMember, isManager, refreshHostel } = useHostel();
  const { user, isFirebaseConfigured } = useAuth();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("members");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add Member Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberCode, setNewMemberCode] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberRoom, setNewMemberRoom] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<MemberRole>("member");
  const [submitting, setSubmitting] = useState(false);

  const sampleMembers: MemberWithProfile[] = [
    { uid: "1", memberCode: "MEM-1001", name: "Alex Rahman", email: "alex@hostel.edu", phone: "+8801700000000", roomNumber: "302", role: "manager", status: "active", joinedAt: {} as any, updatedAt: {} as any },
    { uid: "2", memberCode: "MEM-1002", name: "Tanvir Ahmed", email: "tanvir@hostel.edu", phone: "+8801711111111", roomNumber: "304", role: "member", status: "active", joinedAt: {} as any, updatedAt: {} as any },
    { uid: "3", memberCode: "MEM-1003", name: "Shafiul Islam", email: "shafiul@hostel.edu", phone: "+8801722222222", roomNumber: "201", role: "member", status: "active", joinedAt: {} as any, updatedAt: {} as any },
    { uid: "4", memberCode: "MEM-1004", name: "Mahmudul Hasan", email: "mahmud@hostel.edu", phone: "+8801733333333", roomNumber: "202", role: "member", status: "active", joinedAt: {} as any, updatedAt: {} as any },
  ];

  const sampleRequests: JoinRequest[] = [
    { id: "req-1", userId: "demo-user-123", userName: "Zubair Al Mamun", userEmail: "zubair@hostel.edu", userPhone: "+8801812345678", hostelId: "demo-hostel-1", hostelName: "Demo Hostel", hostelCode: "HST-DEMO1", status: "pending", createdAt: { toDate: () => new Date() } as any },
  ];

  const copyCode = () => {
    if (currentHostel?.code) {
      navigator.clipboard.writeText(currentHostel.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Hostel code copied to clipboard!");
    }
  };

  const fetchData = useCallback(async () => {
    if (!currentHostel) return;

    if (currentMember?.status === "pending") {
      setMembers([]);
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const activeMembers = await MemberService.listMembersWithProfiles(currentHostel.id);
        setMembers(activeMembers);

        if (isManager) {
          const joinReqs = await HostelService.getPendingJoinRequests(currentHostel.id);
          setRequests(joinReqs);
        }
      } else {
        setMembers(sampleMembers);
        setRequests(sampleRequests);
      }
    } catch (error) {
      console.error("Error loading members data:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, isFirebaseConfigured, isManager]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    const randomCode = `MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    setNewMemberCode(randomCode);
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberRoom("");
    setNewMemberEmail("");
    setNewMemberRole("member");
    setAddModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberCode.trim() || !currentHostel) {
      toast.error("Please provide member name and unique member code");
      return;
    }

    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        await MemberService.addMemberWithCode(currentHostel.id, {
          name: newMemberName.trim(),
          memberCode: newMemberCode.trim(),
          phone: newMemberPhone.trim(),
          roomNumber: newMemberRoom.trim(),
          email: newMemberEmail.trim(),
          role: newMemberRole,
        });
        toast.success(`Successfully added member ${newMemberName} with code ${newMemberCode.trim()}!`);
        fetchData();
      } else {
        const mockNew: MemberWithProfile = {
          uid: String(Date.now()),
          memberCode: newMemberCode.trim(),
          name: newMemberName.trim(),
          email: newMemberEmail.trim() || `${newMemberCode.toLowerCase()}@demo.hostel`,
          phone: newMemberPhone.trim() || "+8801700000000",
          roomNumber: newMemberRoom.trim() || "101",
          role: newMemberRole,
          status: "active",
          joinedAt: {} as any,
          updatedAt: {} as any,
        };
        setMembers((prev) => [...prev, mockNew]);
        toast.success(`Demo: Added member ${newMemberName} with code ${newMemberCode.trim()}`);
      }
      setAddModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberUid: string, name: string) => {
    if (!currentHostel) return;
    const confirmDelete = window.confirm(`Are you sure you want to remove member ${name} from this hostel?`);
    if (!confirmDelete) return;

    setActionLoading(`delete-${memberUid}`);
    try {
      if (isFirebaseConfigured) {
        await MemberService.removeMember(currentHostel.id, memberUid);
        toast.success(`Successfully removed member ${name} from hostel`);
        fetchData();
      } else {
        setMembers((prev) => prev.filter((m) => m.uid !== memberUid));
        toast.success(`Demo: Removed ${name}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewRequest = async (requestId: string, action: "approved" | "rejected", applicantName: string) => {
    if (!currentHostel || !user) return;
    setActionLoading(`review-${requestId}`);
    try {
      if (isFirebaseConfigured) {
        await HostelService.reviewJoinRequest(
          currentHostel.id,
          requestId,
          action,
          user.uid
        );
        toast.success(`Successfully ${action} join request from ${applicantName}`);
        fetchData();
        refreshHostel();
      } else {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (action === "approved") {
          const newMember: MemberWithProfile = {
            uid: String(Date.now()),
            memberCode: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
            name: applicantName,
            email: "applicant@hostel.edu",
            phone: "+8801700000000",
            roomNumber: "TBD",
            role: "member",
            status: "active",
            joinedAt: {} as any,
            updatedAt: {} as any,
          };
          setMembers((prev) => [...prev, newMember]);
        }
        toast.success(`Demo: Request ${action}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to review request");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter members based on search input
  const filteredMembers = members.filter((m) => {
    const term = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      (m.memberCode || "").toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.phone || "").toLowerCase().includes(term) ||
      (m.roomNumber || "").toLowerCase().includes(term)
    );
  });

  const formatDate = (req: JoinRequest) => {
    if (!req.createdAt) return "";
    let d: Date;
    if ('toDate' in req.createdAt && typeof req.createdAt.toDate === 'function') {
      d = req.createdAt.toDate();
    } else {
      d = new Date();
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const tabsList = [
    { id: "members", label: "Active Members", badge: loading ? 0 : filteredMembers.length, icon: <Users className="w-4 h-4" /> }
  ];
  if (isManager) {
    tabsList.push({ id: "requests", label: "Pending Join Requests", badge: loading ? 0 : requests.length, icon: <UserCheck className="w-4 h-4" /> });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("members")}
        description="Hostel residents, unique member codes, room allocations, and direct member management"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            >
              Hostel Code: {currentHostel?.code || "HST-X7K92"}
            </Button>
            {isManager && (
              <Button
                variant="primary"
                size="sm"
                onClick={openAddModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Member
              </Button>
            )}
          </div>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={tabsList}
      />

      {activeTab === "members" ? (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle>Member Directory</CardTitle>
              <CardDescription>Verified hostel residents with unique member codes</CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search name, code, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading directory...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No members found.</div>
            ) : (
              <Table className="border-0 rounded-none shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Code</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    {isManager && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((m) => (
                    <TableRow key={m.uid}>
                      <TableCell>
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30">
                          {m.memberCode || m.studentId || `MEM-${m.uid.slice(0, 6).toUpperCase()}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs md:text-sm">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{m.roomNumber || "-"}</TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">{m.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={((m.role as string) === "owner" || (m.role as string) === "admin" || (m.role as string) === "manager") ? "manager" : "member"} size="sm">
                          {((m.role as string) === "owner" || (m.role as string) === "admin" || (m.role as string) === "manager") ? "MANAGER" : "MEMBER"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" size="sm">
                          {m.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      {isManager && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              title="Delete / Remove Member"
                              disabled={actionLoading === `delete-${m.uid}` || m.uid === user?.uid}
                              isLoading={actionLoading === `delete-${m.uid}`}
                              onClick={() => handleDeleteMember(m.uid, m.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Join Requests</CardTitle>
            <CardDescription>Residents who entered the hostel code and are awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No pending join requests.</div>
            ) : (
              <Table className="border-0 rounded-none shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs md:text-sm">{req.userName || "Applicant"}</div>
                        <div className="text-[11px] text-slate-500">{req.userEmail}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">{req.userPhone || "-"}</TableCell>
                      <TableCell className="text-xs text-slate-500">{formatDate(req)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleReviewRequest(req.id, "approved", req.userName || "Applicant")}
                            disabled={actionLoading !== null}
                            isLoading={actionLoading === `review-${req.id}`}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReviewRequest(req.id, "rejected", req.userName || "Applicant")}
                            disabled={actionLoading !== null}
                            leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          >
                            Reject
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
      )}

      {/* Add New Member Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Member with Unique Code"
        description="Manager action: Direct register a resident to this hostel"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Member Full Name"
            placeholder="e.g. Arif Hossain"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unique Member Code"
              placeholder="e.g. MEM-8492"
              value={newMemberCode}
              onChange={(e) => setNewMemberCode(e.target.value)}
            />
            <Input
              label="Room Number"
              placeholder="e.g. 304"
              value={newMemberRoom}
              onChange={(e) => setNewMemberRoom(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="e.g. +8801700000000"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
            />
            <Select
              label="Assign Role"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as MemberRole)}
              options={[
                { value: "member", label: "MEMBER (Resident)" },
                { value: "manager", label: "MANAGER (Hostel Manager)" },
              ]}
            />
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="e.g. arif@hostel.edu"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Register Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
