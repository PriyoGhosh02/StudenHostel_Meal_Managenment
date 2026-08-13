"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { HostelService } from "@/lib/services/hostel.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { ArrowLeft, Search, LogIn, Clock, CheckCircle2, Building2 } from "lucide-react";
import { Hostel } from "@/types/hostel";
import { Timestamp } from "firebase/firestore";

export default function JoinHostelPage() {
  const router = useRouter();
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
        toast.success("Demo: Joined hostel successfully!");
        router.push("/dashboard");
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

      toast.success("Join request submitted! Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to submit join request");
    } finally {
      setSubmitting(false);
    }
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

        {submitted ? (
          /* Success State */
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "1.25rem",
              padding: "2.5rem",
              textAlign: "center",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ width: "4rem", height: "4rem", background: "rgba(245,158,11,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.75rem" }}>Join Request Submitted</h2>
            <span style={{ background: "rgba(245,158,11,0.15)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "9999px", padding: "0.3rem 0.875rem", fontSize: "0.75rem", fontWeight: 700 }}>
              Pending Manager Approval
            </span>
            <p style={{ fontSize: "0.875rem", color: "#94A3B8", maxWidth: "20rem", margin: "1rem auto", lineHeight: 1.6 }}>
              Your request to join <strong style={{ color: "#F1F5F9" }}>{foundHostel?.name}</strong> has been sent to the hostel managers. You will gain access once they approve your membership.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "2rem" }}>
              <button
                onClick={() => { setSubmitted(false); setFoundHostel(null); setCode(""); }}
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.625rem", color: "#F1F5F9", fontWeight: 600, padding: "0.65rem 1.5rem", cursor: "pointer", fontSize: "0.875rem" }}
              >
                Join Another Hostel
              </button>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <Button className="w-full justify-center">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Main Join Form */
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
                    }}
                  />
                  <Button
                    type="submit"
                    isLoading={searching}
                    leftIcon={<Search className="w-4 h-4" />}
                  >
                    Find
                  </Button>
                </div>
              </div>
            </form>

            {/* Step 2: Found Hostel Card */}
            {foundHostel && (
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
