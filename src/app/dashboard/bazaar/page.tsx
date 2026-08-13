"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { BazaarService } from "@/lib/services/bazaar.service";
import { RequestService } from "@/lib/services/request.service";
import { BazaarSchedule } from "@/types/bazaar";
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
  const { currentHostel, currentMember, isManager } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { monthName, monthId, currency } = useCurrentMonth();
  const { t, currencySymbol } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<BazaarSchedule[]>([]);

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [memberNames, setMemberNames] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBazaarData = useCallback(async () => {
    if (!currentHostel || !monthId) return;

    if (currentMember?.status === "pending") {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const data = await BazaarService.getBazaarForMonth(currentHostel.id, monthId);
        // Sort by date descending
        const sorted = data.sort((a, b) => b.date.localeCompare(a.date));
        setSchedules(sorted);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error loading bazaar data:", error);
      toast.error("Failed to load bazaar schedule");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, monthId, isFirebaseConfigured, currentMember]);

  useEffect(() => {
    fetchBazaarData();
  }, [fetchBazaarData]);

  // Aggregate stats
  const totalSpent = schedules
    .filter((s) => s.status === "completed" && s.totalSpent)
    .reduce((sum, s) => sum + (s.totalSpent || 0), 0);

  const completedCount = schedules.filter((s) => s.status === "completed").length;
  const upcomingCount = schedules.filter((s) => s.status === "scheduled").length;

  const handleScheduleBazaar = async () => {
    const parsedBudget = parseFloat(budget);
    if (!memberNames.trim()) {
      toast.error("Please assign at least one member name");
      return;
    }
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    if (!currentHostel || !monthId || !user) return;

    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        const assignedList = memberNames.split(",").map((s) => s.trim());
        if (isManager) {
          await BazaarService.scheduleBazaar(currentHostel.id, {
            monthId,
            date,
            allocatedBudget: parsedBudget,
            assignedMemberNames: assignedList,
            assignedMemberIds: [],
            items: [],
            status: "scheduled",
          });
          toast.success("Bazaar duty scheduled successfully!");
          fetchBazaarData();
        } else {
          // Submit request for manager review
          await RequestService.submitRequest(currentHostel.id, {
            monthId,
            type: "bazaar_schedule",
            userId: user.uid,
            userName: profile?.name || "Member",
            details: {
              date,
              assignedMemberNames: assignedList,
              allocatedBudget: parsedBudget,
            },
          });
          toast.success("Bazaar duty request sent to manager!");
        }
      } else {
        toast.success("Demo: Bazaar duty scheduled");
      }
      setModalOpen(false);
      setMemberNames("");
      setBudget("");
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule bazaar duty");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bazaar")}
        description={`Duty schedules and budget allocations for ${monthName}`}
        action={
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isManager ? "Schedule Bazaar Duty" : "Request Bazaar Duty"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Bazaar Spent</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {currencySymbol} {totalSpent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Shopping Trips</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {completedCount} {completedCount === 1 ? "Trip" : "Trips"} Completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Upcoming Scheduled</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {upcomingCount} {upcomingCount === 1 ? "Duty" : "Duties"} Scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bazaar Schedule & Duty Roster</CardTitle>
          <CardDescription>Member rotation and expense accountability</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white">
              No bazaar schedules registered for this month. All values are initially 0.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Assigned Members</TableHead>
                  <TableHead>Allocated Budget</TableHead>
                  <TableHead>Actual Spent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold text-xs md:text-sm">{b.date}</TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {b.assignedMemberNames?.join(" & ") || "Unassigned"}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {currencySymbol} {b.allocatedBudget.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-blue-600">
                      {b.status === "completed" && b.totalSpent
                        ? `${currencySymbol} ${b.totalSpent.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} size="sm">
                        {b.status.toUpperCase()}
                      </Badge>
                    </TableCell>
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
        title="Schedule Bazaar Duty"
        description="Assign members for shopping"
      >
        <div className="space-y-4">
          <Input 
            label="Date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
          <Input 
            label="Assigned Member Names" 
            placeholder="e.g. Tanvir, Shafiul" 
            value={memberNames}
            onChange={(e) => setMemberNames(e.target.value)}
          />
          <Input 
            label={`Allocated Budget (${currencySymbol})`} 
            type="number" 
            placeholder="e.g. 3000" 
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleBazaar}
              isLoading={submitting}
            >
              Confirm Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
