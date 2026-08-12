"use client";

import React from "react";
import { useHostel } from "@/hooks/use-hostel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ManagerPage() {
  const { isOwner } = useHostel();

  const handleHandover = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Manager designation transferred successfully!");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Mess Manager Operations"
        description="Designate mess managers, manage responsibility rotations, and transfer financial duties"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Current Designated Manager</CardTitle>
              <CardDescription>Responsible for daily bazaar logs and deposit approvals</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-sm">Tanvir Ahmed</p>
              <p className="text-xs text-slate-500">Room 304 • Appointed on 2026-08-01</p>
            </div>
            <Badge variant="manager" size="md">
              ACTIVE MANAGER
            </Badge>
          </div>

          {isOwner && (
            <form onSubmit={handleHandover} className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Transfer Manager Responsibility
              </h4>

              <Select
                label="Select Next Manager"
                options={[
                  { value: "3", label: "Shafiul Islam (Room 201)" },
                  { value: "4", label: "Mahmudul Hasan (Room 202)" },
                  { value: "5", label: "Sabbir Hossain (Room 203)" },
                ]}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Confirm Manager Handover
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
