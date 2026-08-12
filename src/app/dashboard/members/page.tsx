"use client";

import React, { useState } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Users, UserCheck, Copy, Check, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function MembersPage() {
  const { currentHostel, isAdmin } = useHostel();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("members");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (currentHostel?.code) {
      navigator.clipboard.writeText(currentHostel.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Hostel code copied to clipboard!");
    }
  };

  const sampleMembers = [
    { uid: "1", name: "Alex Rahman", email: "alex@hostel.edu", phone: "+8801700000000", room: "302", role: "owner", status: "active" },
    { uid: "2", name: "Tanvir Ahmed", email: "tanvir@hostel.edu", phone: "+8801711111111", room: "304", role: "manager", status: "active" },
    { uid: "3", name: "Shafiul Islam", email: "shafiul@hostel.edu", phone: "+8801722222222", room: "201", role: "member", status: "active" },
    { uid: "4", name: "Mahmudul Hasan", email: "mahmud@hostel.edu", phone: "+8801733333333", room: "202", role: "member", status: "active" },
    { uid: "5", name: "Sabbir Hossain", email: "sabbir@hostel.edu", phone: "+8801744444444", room: "203", role: "member", status: "active" },
  ];

  const sampleRequests = [
    { id: "req-1", name: "Zubair Al Mamun", email: "zubair@hostel.edu", phone: "+8801812345678", room: "105", date: "2026-08-11" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("members")}
        description="Hostel residents, room allocations, roles, and join request approvals"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={copyCode}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            Copy Code: {currentHostel?.code || "HST-X7K92"}
          </Button>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "members", label: "Active Members", badge: sampleMembers.length, icon: <Users className="w-4 h-4" /> },
          { id: "requests", label: "Pending Join Requests", badge: sampleRequests.length, icon: <UserCheck className="w-4 h-4" /> },
        ]}
      />

      {activeTab === "members" ? (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle>Member Directory</CardTitle>
              <CardDescription>Verified hostel residents and active roles</CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Management</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleMembers.map((m) => (
                  <TableRow key={m.uid}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs md:text-sm">{m.name}</div>
                      <div className="text-[11px] text-slate-500">{m.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{m.room}</TableCell>
                    <TableCell className="text-xs text-slate-600">{m.phone}</TableCell>
                    <TableCell>
                      <Badge variant={m.role as "owner" | "admin" | "manager" | "member"} size="sm">
                        {m.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm">
                        {m.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {m.role !== "owner" && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.success(`Promoted ${m.name} to Manager`)}
                            >
                              Promote
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Join Requests</CardTitle>
            <CardDescription>Residents who entered the hostel code and are awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Requested Room</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs md:text-sm">{req.name}</div>
                      <div className="text-[11px] text-slate-500">{req.email}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{req.phone}</TableCell>
                    <TableCell className="font-mono text-xs">{req.room}</TableCell>
                    <TableCell className="text-xs text-slate-500">{req.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => toast.success(`Approved ${req.name}'s membership!`)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Rejected request from ${req.name}`)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
