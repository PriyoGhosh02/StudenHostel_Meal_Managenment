"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useHostel } from "@/hooks/use-hostel";
import { useTranslation } from "@/hooks/use-translation";
import { HostelService } from "@/lib/services/hostel.service";
import { MemberService } from "@/lib/services/member.service";
import { UserService } from "@/lib/services/user.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { ArrowLeft, Search, LogIn, Clock, CheckCircle2, Building2 } from "lucide-react";
import { Hostel } from "@/types/hostel";
import { HostelMember } from "@/types/member";
import { Timestamp, onSnapshot } from "firebase/firestore";
import { memberDoc } from "@/lib/firebase/firestore";

export default function JoinHostelPage() {
  const router = useRouter();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { currentHostel, currentMember, refreshHostel } = useHostel();
  const { t } = useTranslation();

  const [code, setCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundHostel, setFoundHostel] = useState<Hostel | null>(null);
  const [existingMembership, setExistingMembership] = useState<HostelMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Awaiting approval state
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const [roomNumber, setRoomNumber] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");

  // 1. Check if user is already pending/active in a hostel on mount
  useEffect(() => {
    if (currentHostel && currentMember) {
      setFoundHostel(currentHostel);
      if (currentMember.status === "pending") {
        setSubmitted(true);
      } else if (currentMember.status === "active") {
        setExistingMembership(currentMember);
      }
    }
  }, [currentHostel, currentMember]);

  // 2. Real-time listener for pending status
  useEffect(() => {
    if (!user || !isFirebaseConfigured || !foundHostel || !submitted || isApproved) return;

    const unsub = onSnapshot(memberDoc(foundHostel.id, user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const memberData = docSnap.data() as HostelMember;
        if (memberData.status === "active") {
          setIsApproved(true);
          toast.success("Hostel join request approved!");
        }
      } else {
        // Membership doc deleted (manager rejected the request)
        setIsRejected(true);
        toast.error("Hostel join request was rejected.");
      }
    });

    return () => unsub();
  }, [user, isFirebaseConfigured, foundHostel, submitted, isApproved]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a hostel code");
      return;
    }

    setSearching(true);
    setFoundHostel(null);
    setExistingMembership(null);
    try {
      if (!isFirebaseConfigured) {
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

      // Query the hostel by code
      const hostel = await HostelService.findHostelByCode(code);
      if (!hostel) {
        toast.error("No active hostel found with this code. Please verify.");
      } else {
        setFoundHostel(hostel);
        // Check if user is already a member of this hostel
        if (user) {
          const member = await MemberService.getMember(hostel.id, user.uid);
          if (member) {
            setExistingMembership(member);
            if (member.status === "pending") {
              setSubmitted(true);
            }
          }
        }
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

    // A single member cannot join multiple hostels
    if (currentHostel && currentHostel.id !== foundHostel.id) {
      toast.error(`You already have a pending or active membership in '${currentHostel.name}'. You cannot join a different hostel.`);
      return;
    }

    setSubmitting(true);
    try {
      if (!isFirebaseConfigured) {
        setIsApproved(true);
        setSubmitted(true);
        toast.success("Demo: Joined hostel successfully!");
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
        roomNumber: roomNumber,
      });

      setSubmitted(true);
      toast.success("Join request submitted! Awaiting manager approval...");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to submit join request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToDashboard = async () => {
    if (!foundHostel || !user) return;
    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        await UserService.setActiveHostel(user.uid, foundHostel.id);
      }
      await refreshHostel();
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to enter dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetRejected = async () => {
    if (user && isFirebaseConfigured) {
      try {
        await UserService.setActiveHostel(user.uid, "");
      } catch (err) {
        console.warn(err);
      }
    }
    setSubmitted(false);
    setFoundHostel(null);
    setExistingMembership(null);
    setIsApproved(false);
    setIsRejected(false);
    setCode("");
    await refreshHostel();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1a2744 60%, #0F172A 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "32rem" }}>
        <Link
          href="/onboarding"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#64748B",
            marginBottom: "1.5rem",
            textDecoration: "none",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to choices
        </Link>

        {/* Existing active membership check */}
        {existingMembership && existingMembership.status === "active" ? (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "1.25rem",
              padding: "2.5rem",
              textAlign: "center",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ width: "4rem", height: "4rem", background: "rgba(16,185,129,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.75rem" }}>Already Joined</h2>
            <p style={{ fontSize: "0.875rem", color: "#94A3B8", maxWidth: "20rem", margin: "1rem auto", lineHeight: 1.6 }}>
              You are already an active member of <strong style={{ color: "#F1F5F9" }}>{foundHostel?.name || currentHostel?.name}</strong>.
            </p>
            <Button onClick={handleGoToDashboard} isLoading={submitting} className="w-full justify-center mt-4">
              Go to Dashboard
            </Button>
          </div>
        ) : submitted ? (
          /* Waiting / Awaiting Approval Screen */
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: isRejected ? "1px solid rgba(239,68,68,0.3)" : isApproved ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(245,158,11,0.3)",
              borderRadius: "1.25rem",
              padding: "2.5rem",
              textAlign: "center",
              backdropFilter: "blur(12px)",
            }}
          >
            {isRejected ? (
              <>
                <div style={{ width: "4rem", height: "4rem", background: "rgba(239,68,68,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <span style={{ fontSize: "2rem" }}>❌</span>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.75rem" }}>Join Request Rejected</h2>
                <p style={{ fontSize: "0.875rem", color: "#E2E8F0", maxWidth: "20rem", margin: "1rem auto", lineHeight: 1.6 }}>
                  Your request to join <strong style={{ color: "#F1F5F9" }}>{foundHostel?.name}</strong> was rejected by the manager.
                </p>
                <button
                  onClick={handleResetRejected}
                  style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.625rem", color: "#F1F5F9", fontWeight: 600, padding: "0.65rem 1.5rem", cursor: "pointer", fontSize: "0.875rem", marginTop: "1rem" }}
                >
                  Join Another Hostel
                </button>
              </>
            ) : isApproved ? (
              <>
                <div style={{ width: "4rem", height: "4rem", background: "rgba(16,185,129,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.75rem" }}>Approval Received!</h2>
                <p style={{ fontSize: "0.875rem", color: "#94A3B8", maxWidth: "20rem", margin: "1rem auto", lineHeight: 1.6 }}>
                  Your request to join <strong style={{ color: "#F1F5F9" }}>{foundHostel?.name}</strong> has been approved. You can now enter the dashboard.
                </p>
                <Button onClick={handleGoToDashboard} isLoading={submitting} className="w-full justify-center mt-4">
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
                <div style={{ width: "4rem", height: "4rem", background: "rgba(245,158,11,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <Clock className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.75rem" }}>Awaiting Approval</h2>
                <span style={{ background: "rgba(245,158,11,0.15)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "9999px", padding: "0.3rem 0.875rem", fontSize: "0.75rem", fontWeight: 700 }}>
                  Awaiting Manager Action
                </span>
                <p style={{ fontSize: "0.875rem", color: "#94A3B8", maxWidth: "20rem", margin: "1.25rem auto", lineHeight: 1.6 }}>
                  Your join request is pending manager action. Keep this page open; once the manager approves, a button will appear below to let you enter the dashboard.
                </p>
                <button
                  onClick={handleResetRejected}
                  style={{ width: "100%", background: "transparent", border: "none", color: "#64748B", fontWeight: 500, cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline", marginTop: "1rem" }}
                >
                  Cancel request and join another hostel
                </button>
              </>
            )}
          </div>
        ) : (
          /* Main Join Code Input Form */
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1.25rem",
              padding: "2rem",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.75rem" }}>
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LogIn className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF" }}>{t("join_hostel")}</h2>
                <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Enter the hostel share code provided by your manager</p>
              </div>
            </div>

            {/* Step 1: Code Search */}
            <form onSubmit={handleSearch} className="auth-dark-form" style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "0.875rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
                  {t("hostel_code")}
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    placeholder="e.g. HST-X7K92"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={currentHostel !== null}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "0.5rem",
                      padding: "0.6rem 0.875rem",
                      color: "#F1F5F9",
                      fontFamily: "monospace",
                      fontSize: "0.975rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      outline: "none",
                      opacity: currentHostel ? 0.5 : 1,
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={currentHostel !== null}
                    isLoading={searching}
                    leftIcon={<Search className="w-4 h-4" />}
                  >
                    Find
                  </Button>
                </div>
              </div>
            </form>

            {/* Already belonging to a hostel warning */}
            {currentHostel && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.75rem", padding: "1rem", color: "#FCA5A5", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                ⚠️ You are already linked to <strong>{currentHostel.name}</strong>. A single member cannot join multiple hostels. Click &quot;Back to choices&quot; or enter the dashboard for your active hostel.
              </div>
            )}

            {/* Step 2: Found Hostel Card */}
            {foundHostel && !currentHostel && (
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "0.875rem",
                  border: "1px solid rgba(16,185,129,0.25)",
                  background: "rgba(16,185,129,0.07)",
                  marginTop: "0.5rem",
                }}
                className="auth-dark-form"
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <h4 style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "1rem" }}>{foundHostel.name}</h4>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.2rem" }}>
                      {foundHostel.city ? `${foundHostel.city} • ` : ""}Currency: {foundHostel.currency}
                    </p>
                  </div>
                  <span style={{ background: "rgba(16,185,129,0.15)", color: "#4ADE80", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.6rem", whiteSpace: "nowrap" }}>
                    Active Hostel
                  </span>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
                  className="w-full justify-center mt-4"
                  isLoading={submitting}
                  onClick={handleJoin}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Join Request
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
