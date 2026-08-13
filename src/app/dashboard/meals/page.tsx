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
import { Plus, Settings, Check } from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

interface DailyTallySummary {
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
  status: string;
}

export default function MealsPage() {
  const { currentHostel, currentMember, isManager, refreshHostel } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { monthName, monthId } = useCurrentMonth();
  const { t } = useTranslation();

  const [activeMealsTab, setActiveMealsTab] = useState("individual");

  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  
  // Individual Form states
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [targetUserId, setTargetUserId] = useState("");
  const [breakfast, setBreakfast] = useState(1);
  const [lunch, setLunch] = useState(1);
  const [dinner, setDinner] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Default Configuration Form states
  const [defBreakfast, setDefBreakfast] = useState(1);
  const [defLunch, setDefLunch] = useState(1);
  const [defDinner, setDefDinner] = useState(1);

  // Bulk Form states
  const [bulkDate, setBulkDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [bulkMeals, setBulkMeals] = useState<Record<string, { breakfast: number; lunch: number; dinner: number }>>({});

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
  }, [currentHostel, monthId, isFirebaseConfigured, user, targetUserId, currentMember]);

  useEffect(() => {
    fetchMealsData();
  }, [fetchMealsData]);

  // Load configuration defaults on load/hostel update
  useEffect(() => {
    if (currentHostel) {
      const defaults = (currentHostel as any)?.defaultMealConfig || { breakfast: 1, lunch: 1, dinner: 1 };
      setBreakfast(defaults.breakfast);
      setLunch(defaults.lunch);
      setDinner(defaults.dinner);
      setDefBreakfast(defaults.breakfast);
      setDefLunch(defaults.lunch);
      setDefDinner(defaults.dinner);
    }
  }, [currentHostel]);

  // Initialize Bulk configuration using defaults
  useEffect(() => {
    if (members.length > 0) {
      const defaults = (currentHostel as any)?.defaultMealConfig || { breakfast: 1, lunch: 1, dinner: 1 };
      const initial: Record<string, { breakfast: number; lunch: number; dinner: number }> = {};
      members.forEach((m) => {
        initial[m.uid] = { 
          breakfast: defaults.breakfast, 
          lunch: defaults.lunch, 
          dinner: defaults.dinner 
        };
      });
      setBulkMeals(initial);
    }
  }, [members, currentHostel]);

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
          setTargetUserId(""); 
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

  const handleSaveBulkMeals = async () => {
    if (!currentHostel || !monthId || !user) return;
    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        const promises = Object.entries(bulkMeals).map(([uid, config]) => {
          const total = Number(config.breakfast) + Number(config.lunch) + Number(config.dinner);
          return MealService.recordMeal(currentHostel.id, {
            monthId,
            userId: uid,
            date: bulkDate,
            breakfast: Number(config.breakfast),
            lunch: Number(config.lunch),
            dinner: Number(config.dinner),
            totalMeals: total,
            recordedBy: user.uid,
          });
        });
        await Promise.all(promises);
        toast.success(`Successfully saved bulk meals for all members for date: ${bulkDate}`);
        fetchMealsData();
      } else {
        toast.success("Demo: Bulk meals recorded");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save bulk meals");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkConfigChange = (uid: string, field: "breakfast" | "lunch" | "dinner", val: number) => {
    setBulkMeals((prev) => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        [field]: val,
      },
    }));
  };

  // Save the hostel's general meal schedule defaults
  const handleSaveGeneralSchedule = async () => {
    if (!currentHostel || !user) return;
    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        const hostelRef = doc(db, "hostels", currentHostel.id);
        await updateDoc(hostelRef, {
          defaultMealConfig: {
            breakfast: Number(defBreakfast),
            lunch: Number(defLunch),
            dinner: Number(defDinner),
          }
        });
        toast.success("General meal schedule configuration saved!");
        await refreshHostel();
      } else {
        toast.success("Demo: General meal schedule updated");
      }
      setSettingsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to configure default meals");
    } finally {
      setSubmitting(false);
    }
  };

  const activeGeneralConfig = (currentHostel as any)?.defaultMealConfig || { breakfast: 1, lunch: 1, dinner: 1 };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("meals")}
        description={`Daily meal counts and member tallies for ${monthName}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {isManager && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSettingsOpen(true)}
                leftIcon={<Settings className="w-4 h-4" />}
              >
                General Meal Schedule
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {isManager ? "Record Individual Meal" : "Submit Meal Request"}
            </Button>
            {isManager && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setActiveMealsTab("bulk");
                  toast.info("Switched to Add Today Total Meal view");
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Today Total Meal
              </Button>
            )}
          </div>
        }
      />

      {/* General Schedule Banner display */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-slate-350">
          <span>Current General Meal Schedule: </span>
          <strong className="text-white">Breakfast: {activeGeneralConfig.breakfast}</strong>
          <span> • </span>
          <strong className="text-white">Lunch: {activeGeneralConfig.lunch}</strong>
          <span> • </span>
          <strong className="text-white">Dinner: {activeGeneralConfig.dinner}</strong>
        </div>
        <Badge variant="primary">Hostel default config</Badge>
      </div>

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

      {/* Tabs Switcher for Manager */}
      {isManager && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-4">
          <button
            onClick={() => setActiveMealsTab("individual")}
            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeMealsTab === "individual"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Individual Records
          </button>
          <button
            onClick={() => setActiveMealsTab("bulk")}
            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeMealsTab === "bulk"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Add Today Total Meal
          </button>
        </div>
      )}

      {activeMealsTab === "individual" ? (
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
      ) : (
        /* Bulk Meal logging view */
        <Card>
          <CardHeader>
            <CardTitle>Bulk Daily Meal Logging</CardTitle>
            <CardDescription>Configure and save meals for all active hostel members at once (Pre-filled with General Meal Schedule defaults)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div style={{ maxWidth: "16rem" }}>
              <Input
                label="Logging Date"
                type="date"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
              />
            </div>

            {members.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No active members in this hostel.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead style={{ width: "100px" }}>Breakfast</TableHead>
                      <TableHead style={{ width: "100px" }}>Lunch</TableHead>
                      <TableHead style={{ width: "100px" }}>Dinner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => {
                      const mConfig = bulkMeals[m.uid] || { 
                        breakfast: activeGeneralConfig.breakfast, 
                        lunch: activeGeneralConfig.lunch, 
                        dinner: activeGeneralConfig.dinner 
                      };
                      return (
                        <TableRow key={m.uid}>
                          <TableCell className="font-semibold">{m.name}</TableCell>
                          <TableCell className="font-mono text-xs">{m.roomNumber || "TBD"}</TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={mConfig.breakfast}
                              onChange={(e) => handleBulkConfigChange(m.uid, "breakfast", Number(e.target.value))}
                              style={{ width: "70px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.375rem", padding: "0.3rem 0.5rem" }}
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={mConfig.lunch}
                              onChange={(e) => handleBulkConfigChange(m.uid, "lunch", Number(e.target.value))}
                              style={{ width: "70px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.375rem", padding: "0.3rem 0.5rem" }}
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={mConfig.dinner}
                              onChange={(e) => handleBulkConfigChange(m.uid, "dinner", Number(e.target.value))}
                              style={{ width: "70px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.375rem", padding: "0.3rem 0.5rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSaveBulkMeals}
                isLoading={submitting}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Save All Member Meals
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Meal Settings Dialog */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Configure General Meal Schedule"
        description="Configure default daily meal schedule limits (e.g. Breakfast: 0, Lunch: 1, Dinner: 1) for this hostel mess."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Breakfast Default"
              type="number"
              min={0}
              max={10}
              value={defBreakfast}
              onChange={(e) => setDefBreakfast(Number(e.target.value))}
            />
            <Input
              label="Lunch Default"
              type="number"
              min={0}
              max={10}
              value={defLunch}
              onChange={(e) => setDefLunch(Number(e.target.value))}
            />
            <Input
              label="Dinner Default"
              type="number"
              min={0}
              max={10}
              value={defDinner}
              onChange={(e) => setDefDinner(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setSettingsOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveGeneralSchedule}
              isLoading={submitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Defaults
            </Button>
          </div>
        </div>
      </Modal>

      {/* Individual Log Dialog */}
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
              options={[
                { value: "", label: "Choose member..." },
                ...members.map((m) => ({ value: m.uid, label: `${m.name} (Room ${m.roomNumber || "TBD"})` }))
              ]}
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
