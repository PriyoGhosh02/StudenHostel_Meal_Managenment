"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useHostel } from "@/hooks/use-hostel";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { User, Building2, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PreferredLanguage } from "@/types/user";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { currentHostel, isAdmin } = useHostel();
  const { language, setLanguage, t } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");

  const [name, setName] = useState(profile?.name || user?.displayName || "Alex Rahman");
  const [phone, setPhone] = useState(profile?.phone || "+8801700000000");
  const [hostelName, setHostelName] = useState(currentHostel?.name || "Emerald Green Residence");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile preferences updated!");
  };

  const handleHostelSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Hostel configuration saved!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={t("settings")}
        description="Manage your account profile, preferred language, and hostel configuration"
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "profile", label: "User Profile", icon: <User className="w-4 h-4" /> },
          ...(isAdmin ? [{ id: "hostel", label: "Hostel Configuration", icon: <Building2 className="w-4 h-4" /> }] : []),
        ]}
      />

      {activeTab === "profile" ? (
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your contact and display preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={user?.email || "alex@hostel.edu"}
                  disabled
                  helperText="Managed by authentication provider"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Select
                  label="Preferred Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as PreferredLanguage)}
                  options={[
                    { value: "en", label: "English (US)" },
                    { value: "bn", label: "বাংলা (Bengali)" },
                    { value: "hi", label: "हिंदी (Hindi)" },
                  ]}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Information</CardTitle>
              <CardDescription>Configure hostel display details and joining credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleHostelSave} className="space-y-4">
                <Input
                  label="Hostel Name"
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Hostel Share Code"
                    value={currentHostel?.code || "HST-X7K92"}
                    disabled
                    helperText="Permanent identifier for member join requests"
                  />
                  <Select
                    label="Operating Currency"
                    defaultValue="BDT"
                    options={[
                      { value: "BDT", label: "BDT (৳) - Bangladeshi Taka" },
                      { value: "INR", label: "INR (₹) - Indian Rupee" },
                      { value: "USD", label: "USD ($) - US Dollar" },
                    ]}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                    Save Hostel Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-rose-200 bg-rose-50/20">
            <CardHeader>
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle className="text-rose-900 text-base">Danger Zone</CardTitle>
              </div>
              <CardDescription>Irreversible actions on hostel data</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-xs md:text-sm text-slate-900">Archive Hostel</p>
                <p className="text-xs text-slate-500">Deactivate this hostel and lock all future entries.</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => toast.error("Action restricted")}
              >
                Archive Hostel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
