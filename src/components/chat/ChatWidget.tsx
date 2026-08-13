"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { MemberService } from "@/lib/services/member.service";
import { ChatService, ChatMessage } from "@/lib/services/chat.service";
import { MemberWithProfile } from "@/types/member";
import { Button } from "@/components/ui/Button";
import { MessageSquare, X, Send, Users, User } from "lucide-react";

export function ChatWidget() {
  const { currentHostel, currentMember } = useHostel();
  const { user, profile, isFirebaseConfigured } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<"group" | string>("group");
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  if (!currentHostel || currentMember?.status !== "active") return null;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMembers = useCallback(async () => {
    if (!currentHostel || !user) return;
    try {
      if (isFirebaseConfigured) {
        const list = await MemberService.listMembersWithProfiles(currentHostel.id);
        setMembers(list.filter((m) => m.uid !== user.uid && m.status === "active"));
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentHostel, user, isFirebaseConfigured]);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, fetchMembers]);

  useEffect(() => {
    if (!currentHostel || !user || !isOpen) return;

    if (!isFirebaseConfigured) {
      setMessages([
        { senderId: "system", senderName: "Hostel Bot", text: "Demo Live Chat Widget!", createdAt: null },
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
  }, [currentHostel, user, activeChannel, isOpen, isFirebaseConfigured]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
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
        setMessages((prev) => [
          ...prev,
          { senderId: user.uid, senderName: `${senderName} (You)`, text: inputText, createdAt: null },
        ]);
      }
      setInputText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 select-none">
      {/* Popover Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[90vw] max-w-[380px] h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-bold text-xs">Hostel Live Chat Widget</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-blue-700 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Channels Bar */}
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-1.5 gap-1 text-xs">
            <button
              onClick={() => setActiveChannel("group")}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors ${
                activeChannel === "group"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Group
            </button>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
            <select
              value={activeChannel === "group" ? "" : activeChannel}
              onChange={(e) => {
                if (e.target.value) setActiveChannel(e.target.value);
              }}
              className="flex-1 py-1 px-2 rounded-lg bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-none truncate text-xs"
            >
              <option value="" disabled>
                Direct Message...
              </option>
              {members.map((m) => (
                <option key={m.uid} value={m.uid} className="dark:bg-slate-900">
                  {m.name} (Room {m.roomNumber || "TBD"})
                </option>
              ))}
            </select>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/40">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user.uid;
              return (
                <div
                  key={msg.id || i}
                  className={`flex flex-col max-w-[80%] ${
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  {!isMe && (
                    <span className="text-[9px] font-bold text-slate-500 mb-0.5 px-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-1.5 text-xs ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-bl-none shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Type message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <Button
              type="submit"
              size="sm"
              disabled={sending || !inputText.trim()}
              isLoading={sending}
              className="p-2 aspect-square shrink-0 rounded-xl"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 flex items-center justify-center transition-all duration-200 active:scale-95 group relative"
        title="Hostel Live Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
      </button>
    </div>
  );
}
