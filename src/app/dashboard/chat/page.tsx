"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { MemberService } from "@/lib/services/member.service";
import { ChatService, ChatMessage } from "@/lib/services/chat.service";
import { MemberWithProfile } from "@/types/member";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageSquare, Send, Users, User, Hash } from "lucide-react";
import { toast } from "sonner";

export default function ChatPage() {
  const { currentHostel } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();
  const { t } = useTranslation();

  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [activeChannel, setActiveChannel] = useState<"group" | string>("group"); // "group" or recipient user ID
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load other members
  const fetchMembers = useCallback(async () => {
    if (!currentHostel || !user) return;
    setMembersLoading(true);
    try {
      if (isFirebaseConfigured) {
        const list = await MemberService.listMembersWithProfiles(currentHostel.id);
        // Exclude current user
        setMembers(list.filter((m) => m.uid !== user.uid && m.status === "active"));
      } else {
        setMembers([
          { uid: "demo-member-2", name: "Tanvir Ahmed", email: "tanvir@hostel.edu", role: "member", status: "active", joinedAt: null as any, updatedAt: null as any },
          { uid: "demo-member-3", name: "Shafiul Islam", email: "shafiul@hostel.edu", role: "member", status: "active", joinedAt: null as any, updatedAt: null as any },
        ]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hostel members list");
    } finally {
      setMembersLoading(false);
    }
  }, [currentHostel, user, isFirebaseConfigured]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Subscribe to messages in real-time
  useEffect(() => {
    if (!currentHostel || !user) return;
    if (!isFirebaseConfigured) {
      // Demo messages
      setMessages([
        { senderId: "system", senderName: "Hostel Bot", text: "Welcome to live chat! Try connecting to Firebase for real-time messaging.", createdAt: null },
      ]);
      return;
    }

    let unsubscribe: () => void;

    if (activeChannel === "group") {
      unsubscribe = ChatService.subscribeGroupMessages(currentHostel.id, (msgs) => {
        setMessages(msgs);
      });
    } else {
      unsubscribe = ChatService.subscribeDirectMessages(currentHostel.id, user.uid, activeChannel, (msgs) => {
        setMessages(msgs);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentHostel, user, activeChannel, isFirebaseConfigured]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentHostel || !user) return;

    setSending(true);
    try {
      const senderName = profile?.name || user.displayName || "Member";
      if (isFirebaseConfigured) {
        if (activeChannel === "group") {
          await ChatService.sendGroupMessage(currentHostel.id, user.uid, senderName, inputText);
        } else {
          await ChatService.sendDirectMessage(currentHostel.id, user.uid, activeChannel, senderName, inputText);
        }
      } else {
        // Demo local send
        const newMsg: ChatMessage = {
          senderId: user.uid,
          senderName: `${senderName} (You)`,
          text: inputText,
          createdAt: null,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
      setInputText("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getActiveChannelName = () => {
    if (activeChannel === "group") return "📢 Hostel Group Chat";
    const found = members.find((m) => m.uid === activeChannel);
    return found ? `💬 Chat with ${found.name}` : "Chat Workspace";
  };

  const formatTime = (msg: ChatMessage) => {
    if (!msg.createdAt) return "Just now";
    let d: Date;
    if (typeof msg.createdAt === "object" && "toDate" in msg.createdAt && typeof msg.createdAt.toDate === "function") {
      d = msg.createdAt.toDate();
    } else {
      d = new Date(msg.createdAt);
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Chat Desk"
        description="Instant communication workspace for hostel members and private messages"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Side Panel */}
        <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Channels</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {/* Group Channel Item */}
            <button
              onClick={() => setActiveChannel("group")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                activeChannel === "group"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>📢 Group Chat</span>
            </button>

            {/* Direct Messages Header */}
            <div className="pt-4 pb-1 px-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Messages</span>
            </div>

            {membersLoading ? (
              <div className="text-center py-4 text-xs text-slate-500">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">No members available.</div>
            ) : (
              members.map((m) => (
                <button
                  key={m.uid}
                  onClick={() => setActiveChannel(m.uid)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                    activeChannel === m.uid
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <div className="truncate flex-1">
                    <p className="font-semibold truncate">{m.name}</p>
                    <p className={`text-[10px] truncate ${activeChannel === m.uid ? "text-blue-200" : "text-slate-500"}`}>
                      Room {m.roomNumber || "TBD"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-3 border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              {getActiveChannelName()}
            </h4>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
                <Hash className="w-8 h-8 opacity-40 text-slate-500" />
                <p className="text-xs">No messages yet. Send a message to start the thread!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === user?.uid;
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col max-w-[70%] ${
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-slate-500 mb-0.5 px-1">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm shadow-xs ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-750"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{formatTime(msg)}</span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              placeholder={activeChannel === "group" ? "Broadcast to group..." : "Send private message..."}
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-150 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button
              type="submit"
              size="md"
              disabled={sending || !inputText.trim()}
              isLoading={sending}
              className="aspect-square p-2.5 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
