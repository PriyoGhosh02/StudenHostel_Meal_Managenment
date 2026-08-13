"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { MealService } from "@/lib/services/meal.service";
import { MemberService } from "@/lib/services/member.service";
import { RequestService } from "@/lib/services/request.service";
import { MealRecord } from "@/types/meal";
import { MemberWithProfile } from "@/types/member";
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

interface DailyTallySummary {
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
  status: string;
}

export default function MealsPage() {
  const { currentHostel, currentMember, isManager } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { monthName, monthId } = useCurrentMonth();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  
  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [targetUserId, setTargetUserId] = useState("");
  const [breakfast, setBreakfast] = useState(1);
  const [lunch, setLunch] = useState(1);
  const [dinner, setDinner] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchMealsData = useCallback(async () => {
    if (!currentHostel || !monthId) return;

    if (currentMember?.status === "pending") {
      setMeals([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const [mealsList, membersList] = await Promise.all([
          MealService.getMealsForMonth(currentHostel.id, monthId),
          MemberService.listMembersWithProfiles(currentHostel.id)
        ]);
        setMeals(mealsList);
        setMembers(membersList);
        if (user && !targetUserId) {
          setTargetUserId(user.uid);
        }
      } else {
        setMeals([]);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading meals data:", error);
      toast.error("Failed to load meals records");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, monthId, isFirebaseConfigured, user, targetUserId]);

  useEffect(() => {
    fetchMealsData();
  }, [fetchMealsData]);

  // Aggregate stats
  const totalMealsCount = meals.reduce((sum, r) => sum + r.totalMeals, 0);

  const uniqueDates = Array.from(new Set(meals.map((r) => r.date)));
  const averageDailyMeals = uniqueDates.length > 0
    ? (totalMealsCount / uniqueDates.length).toFixed(1)
    : "0.0";

  const activeEatersCount = Array.from(new Set(meals.filter(m => m.totalMeals > 0).map((r) => r.userId))).length;

  // Group meals by date for rendering in the table
  const dailyTallies: DailyTallySummary[] = (() => {
    const groups: Record<string, DailyTallySummary> = {};
    meals.forEach((r) => {
      if (!groups[r.date]) {
        groups[r.date] = {
          date: r.date,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          total: 0,
          status: "open",
        };
      }
      groups[r.date].breakfast += r.breakfast;
      groups[r.date].lunch += r.lunch;
      groups[r.date].dinner += r.dinner;
      groups[r.date].total += r.totalMeals;
    });

    // Sort by date descending
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  })();

  const handleSaveMeal = async () => {
    if (!currentHostel || !monthId || !user) return;
    const finalUserId = targetUserId || user.uid;
    if (!finalUserId) {
      toast.error("Please select a member");
      return;
    }

    setSubmitting(true);
    try {
      const total = Number(breakfast) + Number(lunch) + Number(dinner);
      if (isFirebaseConfigured) {
        if (isManager) {
          await MealService.recordMeal(currentHostel.id, {
            monthId,
            userId: finalUserId,
            date,
            breakfast: Number(breakfast),
            lunch: Number(lunch),
            dinner: Number(dinner),
            totalMeals: total,
            recordedBy: user.uid,
          });
          toast.success("Meal record saved successfully!");
          fetchMealsData();
        } else {
          // Submit request for manager approval
          await RequestService.submitRequest(currentHostel.id, {
            monthId,
            type: "meal",
            userId: user.uid,
            userName: profile?.name || "Member",
            details: {
              date,
              targetUserId: finalUserId,
              breakfast: Number(breakfast),
              lunch: Number(lunch),
              dinner: Number(dinner),
              totalMeals: total,
            },
          });
          toast.success("Meal record request submitted to manager!");
        }
      } else {
        toast.success("Demo: Saved meal record");
      }
      setModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save meal record");
    } finally {
      setSubmitting(false);
    }
  };

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
            {isManager ? "Record Meals" : "Submit Meal Request"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Month Meals</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{totalMealsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Average Daily Meals</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{averageDailyMeals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Active Eaters</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {activeEatersCount} {activeEatersCount === 1 ? "Member" : "Members"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Meal Records</CardTitle>
          <CardDescription>Breakdown by breakfast, lunch, and dinner</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading daily tallies...</div>
          ) : dailyTallies.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900">
              No meal records logged for this month. All values are initially 0.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
                  <TableHead>Total Meals</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyTallies.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-xs md:text-sm">{d.date}</TableCell>
                    <TableCell>{d.breakfast}</TableCell>
                    <TableCell>{d.lunch}</TableCell>
                    <TableCell>{d.dinner}</TableCell>
                    <TableCell className="font-bold text-blue-600 dark:text-blue-450">{d.total}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "open" ? "success" : "default"} size="sm">
                        {d.status.toUpperCase()}
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
        title={isManager ? "Record Daily Meals" : "Submit Meal Request"}
        description={isManager ? "Submit meal counts directly to database" : "Request daily meal logs addition for manager review"}
      >
        <div className="space-y-4">
          <Input 
            label="Date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
          
          {isManager && members.length > 0 && (
            <Select
              label="Select Member"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              options={members.map((m) => ({ value: m.uid, label: `${m.name} (Room ${m.roomNumber || "TBD"})` }))}
            />
          )}

          <div className="grid grid-cols-3 gap-2">
            <Input 
              label="Breakfast" 
              type="number" 
              min={0}
              max={10}
              value={breakfast} 
              onChange={(e) => setBreakfast(Number(e.target.value))} 
            />
            <Input 
              label="Lunch" 
              type="number" 
              min={0}
              max={10}
              value={lunch} 
              onChange={(e) => setLunch(Number(e.target.value))} 
            />
            <Input 
              label="Dinner" 
              type="number" 
              min={0}
              max={10}
              value={dinner} 
              onChange={(e) => setDinner(Number(e.target.value))} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveMeal}
              isLoading={submitting}
            >
              {isManager ? "Save Record" : "Submit Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
