"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { BazaarService } from "@/lib/services/bazaar.service";
import { MemberService } from "@/lib/services/member.service";
import { RequestService } from "@/lib/services/request.service";
import { BazaarSchedule } from "@/types/bazaar";
import { MemberWithProfile } from "@/types/member";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Settings, Calendar, Bell, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

export default function BazaarPage() {
  const { currentHostel, currentMember, isManager } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { monthName, monthId, currency } = useCurrentMonth();
  const { t, currencySymbol } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<BazaarSchedule[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);

  // Individual Form states
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [memberNames, setMemberNames] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Configuration Sequence Form states
  const [seqType, setSeqType] = useState<"weekly" | "continuous">("weekly");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [dailyBudget, setDailyBudget] = useState("1500");

  // Weekly config states
  const [weeklyDay, setWeeklyDay] = useState("Friday");

  // Continuous config states
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // 3 days total by default
    return d.toISOString().split("T")[0];
  });

  const fetchBazaarData = useCallback(async () => {
    if (!currentHostel || !monthId) return;

    if (currentMember?.status === "pending") {
      setSchedules([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const [bazaarData, membersList] = await Promise.all([
          BazaarService.getBazaarForMonth(currentHostel.id, monthId),
          MemberService.listMembersWithProfiles(currentHostel.id)
        ]);
        
        // Sort by date descending
        const sorted = bazaarData.sort((a, b) => b.date.localeCompare(a.date));
        setSchedules(sorted);
        setMembers(membersList.filter((m) => m.status === "active"));
      } else {
        setSchedules([]);
        setMembers([]);
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

  // Check and trigger today's bazaar notification for the user
  useEffect(() => {
    if (schedules.length === 0 || !user || !profile) return;
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Find if today has a bazaar scheduled for this user
    const todayDuty = schedules.find((s) => {
      const isToday = s.date === todayStr;
      const isAssigned = s.assignedMemberNames?.some(
        (name) => name.toLowerCase().includes(profile.name.toLowerCase()) || 
                 name.toLowerCase().includes(user.displayName?.toLowerCase() || "")
      );
      return isToday && isAssigned && s.status === "scheduled";
    });

    if (todayDuty) {
      const storageKey = `bazaar_notif_sent_${todayStr}_${user.uid}`;
      const alreadySent = localStorage.getItem(storageKey);
      
      if (!alreadySent) {
        // Trigger browser notification
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Bazaar Duty Reminder", {
              body: `📢 Today is your bazaar shopping day! Allocated budget is ${currencySymbol} ${todayDuty.allocatedBudget}`,
            });
            localStorage.setItem(storageKey, "true");
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Bazaar Duty Reminder", {
                  body: `📢 Today is your bazaar shopping day! Allocated budget is ${currencySymbol} ${todayDuty.allocatedBudget}`,
                });
                localStorage.setItem(storageKey, "true");
              }
            });
          }
        }
        toast.info(`📢 Today is your bazaar shopping day! Budget: ${currencySymbol} ${todayDuty.allocatedBudget}`, {
          duration: 10000,
        });
      }
    }
  }, [schedules, user, profile, currencySymbol]);

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

  // Generate date calculations
  const getDatesForWeekday = (year: number, month: number, targetDayName: string): string[] => {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const targetDayIndex = daysOfWeek.indexOf(targetDayName.toLowerCase());
    if (targetDayIndex === -1) return [];

    const datesList: string[] = [];
    const dateObj = new Date(year, month - 1, 1);
    while (dateObj.getMonth() === month - 1) {
      if (dateObj.getDay() === targetDayIndex) {
        datesList.push(dateObj.toISOString().split("T")[0]);
      }
      dateObj.setDate(dateObj.getDate() + 1);
    }
    return datesList;
  };

  const getContinuousDates = (startDateStr: string, endDateStr: string): string[] => {
    const datesList: string[] = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const current = new Date(start);
    while (current <= end) {
      datesList.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return datesList;
  };

  // Configure and apply sequence settings
  const handleSaveSequenceConfig = async () => {
    if (!currentHostel || !user) return;
    const targetMember = members.find((m) => m.uid === selectedMemberId);
    if (!targetMember) {
      toast.error("Please select an assigned member");
      return;
    }
    const parsedDailyBudget = parseFloat(dailyBudget);
    if (isNaN(parsedDailyBudget) || parsedDailyBudget <= 0) {
      toast.error("Please enter a valid daily budget");
      return;
    }

    setSubmitting(true);
    try {
      let datesToSchedule: string[] = [];
      
      // We parse current month info or active month bounds
      // E.g. monthId is format "2026-08"
      const year = Number(monthId?.split("-")[0]) || new Date().getFullYear();
      const month = Number(monthId?.split("-")[1]) || (new Date().getMonth() + 1);

      if (seqType === "weekly") {
        datesToSchedule = getDatesForWeekday(year, month, weeklyDay);
      } else {
        datesToSchedule = getContinuousDates(fromDate, toDate);
      }

      if (datesToSchedule.length === 0) {
        toast.error("No valid dates found to schedule for the selected configuration");
        return;
      }

      if (isFirebaseConfigured) {
        // 1. Write the configuration sequence settings to the hostel document
        const hostelRef = doc(db, "hostels", currentHostel.id);
        const configData = {
          bazaarConfig: {
            type: seqType,
            assignedMemberId: targetMember.uid,
            assignedMemberName: targetMember.name,
            dailyBudget: parsedDailyBudget,
            weeklyDay: seqType === "weekly" ? weeklyDay : null,
            continuousFrom: seqType === "continuous" ? fromDate : null,
            continuousTo: seqType === "continuous" ? toDate : null,
            updatedAt: new Date().toISOString(),
          }
        };
        await updateDoc(hostelRef, configData);

        // 2. Loop and generate bazaar duty schedule items in the collection
        const promises = datesToSchedule.map((dStr) => {
          return BazaarService.scheduleBazaar(currentHostel.id, {
            monthId: monthId || `${year}-${month.toString().padStart(2, "0")}`,
            date: dStr,
            allocatedBudget: parsedDailyBudget,
            assignedMemberNames: [targetMember.name],
            assignedMemberIds: [targetMember.uid],
            items: [],
            status: "scheduled",
          });
        });
        await Promise.all(promises);

        toast.success(`Successfully saved configuration settings and generated ${datesToSchedule.length} bazaar schedule items!`);
        fetchBazaarData();
      } else {
        toast.success("Demo: Saved sequence configuration settings");
      }
      setConfigPanelOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save bazaar configuration settings");
    } finally {
      setSubmitting(false);
    }
  };

  const activeConfig = (currentHostel as any)?.bazaarConfig;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bazaar")}
        description={`Duty schedules and budget allocations for ${monthName}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {isManager && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfigPanelOpen(true)}
                leftIcon={<Settings className="w-4 h-4" />}
              >
                Bazaar Sequence Settings
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {isManager ? "Schedule Single Duty" : "Request Bazaar Duty"}
            </Button>
          </div>
        }
      />

      {/* Current Configuration settings display banner */}
      {activeConfig && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400">Current Bazaar Sequence Mode: </span>
              <strong className="text-white capitalize">{activeConfig.type}</strong>
              <span className="text-slate-400"> — Assigned to </span>
              <strong className="text-white">{activeConfig.assignedMemberName}</strong>
              {activeConfig.type === "weekly" ? (
                <>
                  <span className="text-slate-400"> on </span>
                  <strong className="text-white">{activeConfig.weeklyDay}s</strong>
                </>
              ) : (
                <>
                  <span className="text-slate-400"> from </span>
                  <strong className="text-white">{activeConfig.continuousFrom}</strong>
                  <span className="text-slate-400"> to </span>
                  <strong className="text-white">{activeConfig.continuousTo}</strong>
                </>
              )}
            </div>
          </div>
          <Badge variant="success">Active sequence</Badge>
        </div>
      )}

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
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
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
                    <TableCell className="text-xs text-slate-700 dark:text-slate-300">
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

      {/* Bazaar Sequence Configuration Modal */}
      <Modal
        isOpen={configPanelOpen}
        onClose={() => setConfigPanelOpen(false)}
        title="Bazaar Sequence Settings"
        description="Configure weekly Day or continuous date scheduling. Select only one category to automatically generate and continue bazaar rotations."
      >
        <div className="space-y-4">
          <Select
            label="Sequence Type Mode"
            value={seqType}
            onChange={(e) => setSeqType(e.target.value as any)}
            options={[
              { value: "weekly", label: "Specific Day Each Week" },
              { value: "continuous", label: "Continuous Date Range" }
            ]}
          />

          {seqType === "weekly" ? (
            <div className="space-y-3">
              <Select
                label="Bazaar Day of Week"
                value={weeklyDay}
                onChange={(e) => setWeeklyDay(e.target.value)}
                options={[
                  { value: "Friday", label: "Friday" },
                  { value: "Saturday", label: "Saturday" },
                  { value: "Sunday", label: "Sunday" },
                  { value: "Monday", label: "Monday" },
                  { value: "Tuesday", label: "Tuesday" },
                  { value: "Wednesday", label: "Wednesday" },
                  { value: "Thursday", label: "Thursday" }
                ]}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          )}

          {members.length > 0 && (
            <Select
              label="Assigned Member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              options={[
                { value: "", label: "Choose member..." },
                ...members.map((m) => ({ value: m.uid, label: `${m.name} (Room ${m.roomNumber || "TBD"})` }))
              ]}
            />
          )}

          <Input
            label={`Daily Budget Allocation (${currencySymbol})`}
            type="number"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setConfigPanelOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSequenceConfig}
              isLoading={submitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Generate & Apply Config
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Single Bazaar Duty Log Modal */}
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
