"use client";

import React, { useState } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Plus, Pin } from "lucide-react";
import { toast } from "sonner";

export default function NoticePage() {
  const { isManager } = useHostel();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const sampleNotices = [
    {
      title: "Hostel Meal Locking Time Policy",
      content: "All hostel residents must submit or cancel their lunch meals by 10:00 AM and dinner meals by 4:00 PM. No meal toggles will be allowed after these deadlines due to grocery purchasing constraints.",
      priority: "high",
      pinned: true,
      author: "Alex Rahman (Owner)",
      date: "2026-08-01",
    },
    {
      title: "Monthly Mess Meeting on 15th August",
      content: "Our monthly review meeting will take place in the dining hall at 9:00 PM. Topics include cook feedback, Wi-Fi router upgrade, and new month budget planning.",
      priority: "medium",
      pinned: false,
      author: "Tanvir Ahmed (Manager)",
      date: "2026-08-10",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("notices")}
        description="Official notices, meeting announcements, and hostel policy guidelines"
        action={
          isManager && (
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Post New Notice
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {sampleNotices.map((n, i) => (
          <Card key={i} className={n.pinned ? "border-blue-200 bg-blue-50/20 shadow-xs" : "border-slate-200"}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {n.pinned && <Pin className="w-4 h-4 text-blue-600 fill-blue-600" />}
                  <CardTitle className="text-base">{n.title}</CardTitle>
                </div>
                <Badge variant={n.priority === "high" ? "danger" : "warning"} size="sm">
                  {n.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Posted by {n.author} &bull; {n.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed">{n.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Notice"
        description="Broadcast an announcement to all members"
      >
        <div className="space-y-4">
          <Input label="Notice Title" placeholder="e.g. Water Supply Maintenance" />
          <Select
            label="Priority Level"
            options={[
              { value: "low", label: "Low Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "high", label: "High / Urgent Priority" },
            ]}
          />
          <Textarea label="Notice Body" rows={4} placeholder="Write the announcement details..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Notice published successfully!");
                setModalOpen(false);
              }}
            >
              Publish Notice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
