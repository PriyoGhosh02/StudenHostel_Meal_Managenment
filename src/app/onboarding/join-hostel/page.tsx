"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { HostelService } from "@/lib/services/hostel.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { ArrowLeft, Search, LogIn, Clock, CheckCircle2 } from "lucide-react";
import { Hostel } from "@/types/hostel";
import { Timestamp } from "firebase/firestore";

export default function JoinHostelPage() {
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { t } = useTranslation();

  const [code, setCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundHostel, setFoundHostel] = useState<Hostel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [roomNumber, setRoomNumber] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a hostel code");
      return;
    }

    setSearching(true);
    setFoundHostel(null);
    try {
      if (!isFirebaseConfigured) {
        // Demo mode fallback
        setFoundHostel({
          id: "demo-hostel-1",
          name: "Emerald Green Student Residence",
          address: "Road 12, Block D, Bashundhara R/A",
          city: "Dhaka",
          ownerId: "demo-owner",
          code: code.toUpperCase(),
          currency: "BDT",
          status: "active",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        toast.success("Hostel found!");
        return;
      }

      const hostel = await HostelService.findHostelByCode(code);
      if (!hostel) {
        toast.error("No active hostel found with this code. Please verify.");
      } else {
        setFoundHostel(hostel);
        toast.success("Hostel found!");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to find hostel");
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!foundHostel || !user) {
      toast.error("Please log in to submit a join request");
      return;
    }

    setSubmitting(true);
    try {
      if (!isFirebaseConfigured) {
        setSubmitted(true);
        toast.success("Demo: Join request submitted!");
        return;
      }

      await HostelService.submitJoinRequest({
        hostelId: foundHostel.id,
        userId: user.uid,
        userName: profile?.name || user.displayName || "Member",
        userEmail: user.email || "",
        userPhone: phone,
        hostelName: foundHostel.name,
        hostelCode: foundHostel.code,
      });

      setSubmitted(true);
      toast.success("Join request submitted! Awaiting manager approval.");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to submit join request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to choices
        </Link>

        {submitted ? (
          <Card className="text-center p-8 border-amber-200 bg-white shadow-lg animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Join Request Submitted</h2>
            <Badge variant="warning" className="my-3">
              Pending Manager Approval
            </Badge>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your request to join <strong>{foundHostel?.name}</strong> has been sent to the hostel managers. You will gain access once they approve your membership.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  setSubmitted(false);
                  setFoundHostel(null);
                  setCode("");
                }}
              >
                Join Another Hostel
              </Button>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full justify-center">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="shadow-sm border-slate-200/80 bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">{t("join_hostel")}</CardTitle>
                  <CardDescription>Enter the hostel share code provided by your manager</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Code Search */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {t("hostel_code")}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. HST-X7K92"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase tracking-wider text-base"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={searching}
                      leftIcon={<Search className="w-4 h-4" />}
                    >
                      Find
                    </Button>
                  </div>
                </div>
              </form>

              {/* Step 2: Found Hostel Card & Details */}
              {foundHostel && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{foundHostel.name}</h4>
                      <p className="text-xs text-slate-500">
                        {foundHostel.city ? `${foundHostel.city} • ` : ""}
                        Currency: {foundHostel.currency}
                      </p>
                    </div>
                    <Badge variant="success">Active Hostel</Badge>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-emerald-200/60">
                    <Input
                      label="Room Number"
                      placeholder="e.g. 204"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+880 1700-000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="success"
                    className="w-full justify-center mt-2"
                    isLoading={submitting}
                    onClick={handleJoin}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Submit Join Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
