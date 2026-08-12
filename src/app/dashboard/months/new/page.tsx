"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

export default function NewMonthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("New operational month started successfully!");
      router.push("/dashboard/months/manage");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title="Start New Month Cycle"
        description="Initialize an operational month period for meals and budget tracking"
        action={
          <Link href="/dashboard/months/manage">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Months
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Month Initialization</CardTitle>
          <CardDescription>Select year and month to activate</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Year"
                defaultValue="2026"
                options={[
                  { value: "2026", label: "2026" },
                  { value: "2027", label: "2027" },
                ]}
              />
              <Select
                label="Month"
                defaultValue="9"
                options={[
                  { value: "8", label: "August" },
                  { value: "9", label: "September" },
                  { value: "10", label: "October" },
                  { value: "11", label: "November" },
                  { value: "12", label: "December" },
                ]}
              />
            </div>

            <Input
              label="Starting Cash Balance (Optional)"
              type="number"
              placeholder="e.g. 15000 (carried over from previous balance)"
            />

            <Button
              type="submit"
              className="w-full justify-center mt-4"
              isLoading={isLoading}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Activate New Month
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
