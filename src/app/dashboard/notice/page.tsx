"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { NoticeService } from "@/lib/services/notice.service";
import { Notice, NoticeExpression } from "@/types/notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Plus, Pin, Trash2, ThumbsUp, ThumbsDown, Check, X, Info } from "lucide-react";
import { toast } from "sonner";

export default function NoticePage() {
  const { currentHostel, isManager } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedNoticeForDetails, setSelectedNoticeForDetails] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sampleNotices: Notice[] = [
    {
      id: "1",
      hostelId: "demo-hostel-1",
      title: "Hostel Meal Locking Time Policy",
      content: "All hostel residents must submit or cancel their lunch meals by 10:00 AM and dinner meals by 4:00 PM. No meal toggles will be allowed after these deadlines due to grocery purchasing constraints.",
      priority: "high",
      pinned: true,
      authorId: "demo-user-1",
      authorName: "Alex Rahman (Owner)",
      votes: {
        "demo-user-2": { name: "Tanvir Ahmed", expression: "yes" },
        "demo-user-3": { name: "Shafiul Islam", expression: "like" },
      },
      createdAt: { toDate: () => new Date("2026-08-01") } as any,
      updatedAt: { toDate: () => new Date("2026-08-01") } as any,
    },
  ];

  const fetchNotices = useCallback(async () => {
    if (!currentHostel) return;
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const data = await NoticeService.getNotices(currentHostel.id);
        const sorted = data.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          const aTime = a.createdAt && 'toDate' in a.createdAt ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt && 'toDate' in b.createdAt ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
        setNotices(sorted);
      } else {
        setNotices(sampleNotices);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, isFirebaseConfigured]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!currentHostel) return;

    setSubmitting(true);
    try {
      const authorName = profile?.name || user?.displayName || "Member";
      if (isFirebaseConfigured) {
        await NoticeService.createNotice(currentHostel.id, {
          title,
          content,
          priority: priority as any,
          pinned: false,
          authorId: user?.uid || "unknown",
          authorName: authorName,
        });

        // Trigger native browser notification if allowed
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification(`New Hostel Notice: ${title}`, { body: content });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification(`New Hostel Notice: ${title}`, { body: content });
              }
            });
          }
        }

        toast.success("Notice published! Push notification sent to all devices.");
        fetchNotices();
      } else {
        const newNotice: Notice = {
          id: String(Date.now()),
          hostelId: currentHostel.id,
          title,
          content,
          priority: priority as any,
          pinned: false,
          authorId: user?.uid || "demo",
          authorName: `${authorName} (Demo)`,
          votes: {},
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
        };
        setNotices((prev) => [newNotice, ...prev]);
        toast.success("Demo: Notice published!");
      }
      setModalOpen(false);
      setTitle("");
      setContent("");
      setPriority("medium");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noticeId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this notice?");
    if (!confirmDelete) return;

    try {
      if (isFirebaseConfigured && currentHostel) {
        await NoticeService.deleteNotice(currentHostel.id, noticeId);
        toast.success("Notice deleted successfully!");
        fetchNotices();
      } else {
        setNotices((prev) => prev.filter((item) => item.id !== noticeId));
        toast.success("Demo: Notice deleted!");
      }
    } catch (error: any) {
      toast.error("Failed to delete notice");
    }
  };

  const handleVote = async (noticeId: string, expression: NoticeExpression) => {
    if (!user || !currentHostel) return;
    try {
      if (isFirebaseConfigured) {
        const name = profile?.name || user.displayName || "Member";
        await NoticeService.castVote(currentHostel.id, noticeId, user.uid, name, expression);
        toast.success(`You reacted with ${expression.toUpperCase()}`);
        fetchNotices();
      } else {
        setNotices((prev) =>
          prev.map((n) => {
            if (n.id === noticeId) {
              return {
                ...n,
                votes: {
                  ...(n.votes || {}),
                  [user.uid]: { name: profile?.name || "Demo User", expression },
                },
              };
            }
            return n;
          })
        );
        toast.success(`Demo: Reacted with ${expression}`);
      }
    } catch (error: any) {
      toast.error("Failed to cast your reaction");
    }
  };

  const getVoteCounts = (notice: Notice) => {
    const votes = Object.values(notice.votes || {});
    return {
      yes: votes.filter((v) => v.expression === "yes").length,
      no: votes.filter((v) => v.expression === "no").length,
      like: votes.filter((v) => v.expression === "like").length,
      dislike: votes.filter((v) => v.expression === "dislike").length,
    };
  };

  const formatDate = (notice: Notice) => {
    if (!notice.createdAt) return "";
    let d: Date;
    if ("toDate" in notice.createdAt && typeof notice.createdAt.toDate === "function") {
      d = notice.createdAt.toDate();
    } else {
      d = new Date();
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("notices")}
        description="Official notices, meeting announcements, and hostel policy guidelines"
        action={
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Post Notice
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            No notices posted yet.
          </div>
        ) : (
          notices.map((n) => {
            const counts = getVoteCounts(n);
            const userVote = n.votes?.[user?.uid || ""]?.expression;

            return (
              <Card key={n.id} className={n.pinned ? "border-blue-200 bg-blue-50/20 shadow-xs" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {n.pinned && <Pin className="w-4 h-4 text-blue-600 fill-blue-600 animate-pulse" />}
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">{n.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={n.priority === "high" ? "danger" : n.priority === "medium" ? "warning" : "default"} size="sm">
                        {n.priority.toUpperCase()} PRIORITY
                      </Badge>
                      {(n.authorId === user?.uid || isManager) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-slate-400 hover:text-rose-600"
                          onClick={() => handleDelete(n.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-450">
                    Posted by {n.authorName} &bull; {formatDate(n)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{n.content}</p>

                  {/* Reaction voting panel */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={userVote === "yes" ? "success" : "outline"}
                        className="gap-1 px-2.5 py-1 text-xs"
                        onClick={() => handleVote(n.id, "yes")}
                      >
                        <Check className="w-3.5 h-3.5" /> Yes ({counts.yes})
                      </Button>
                      <Button
                        size="sm"
                        variant={userVote === "no" ? "danger" : "outline"}
                        className="gap-1 px-2.5 py-1 text-xs"
                        onClick={() => handleVote(n.id, "no")}
                      >
                        <X className="w-3.5 h-3.5" /> No ({counts.no})
                      </Button>
                      <Button
                        size="sm"
                        variant={userVote === "like" ? "primary" : "outline"}
                        className="gap-1 px-2.5 py-1 text-xs"
                        onClick={() => handleVote(n.id, "like")}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Like ({counts.like})
                      </Button>
                      <Button
                        size="sm"
                        variant={userVote === "dislike" ? "secondary" : "outline"}
                        className="gap-1 px-2.5 py-1 text-xs"
                        onClick={() => handleVote(n.id, "dislike")}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> Dislike ({counts.dislike})
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-slate-500 hover:text-blue-600"
                      leftIcon={<Info className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedNoticeForDetails(n);
                        setDetailsModalOpen(true);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Notice"
        description="Broadcast an announcement to all members"
      >
        <div className="space-y-4">
          <Input 
            label="Notice Title" 
            placeholder="e.g. Water Supply Maintenance" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "low", label: "Low Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "high", label: "High / Urgent Priority" },
            ]}
          />
          <Textarea 
            label="Notice Body" 
            rows={4} 
            placeholder="Write the announcement details..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              isLoading={submitting}
            >
              Publish Notice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Expressions Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedNoticeForDetails(null);
        }}
        title="Notice Expressions & Reactions"
        description="Check user vote responses and feedback details"
      >
        <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {!selectedNoticeForDetails || !selectedNoticeForDetails.votes || Object.keys(selectedNoticeForDetails.votes).length === 0 ? (
            <div className="text-center py-6 text-slate-500">No expressions logged yet.</div>
          ) : (
            Object.entries(selectedNoticeForDetails.votes).map(([uid, vote]) => (
              <div key={uid} className="flex justify-between items-center py-2.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{vote.name}</span>
                <Badge variant={vote.expression === "yes" || vote.expression === "like" ? "success" : "danger"} size="sm">
                  {vote.expression.toUpperCase()}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
