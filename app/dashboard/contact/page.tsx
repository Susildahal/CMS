"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, CheckCircle, Eye } from "lucide-react";
import type { ContactMessage } from "@/lib/types";
import { toast } from "sonner";

const INITIAL: ContactMessage[] = [
  { id: "1", name: "Alice Wang", email: "alice@example.com", subject: "Project Inquiry", message: "We are looking for a team to build our enterprise ERP system. Could you share your portfolio and pricing?", receivedAt: "2024-11-20T10:30:00Z", status: "unread" },
  { id: "2", name: "Bob Martinez", email: "bob@startup.io", subject: "Partnership Opportunity", message: "We're a growing startup interested in a long-term partnership for product development.", receivedAt: "2024-11-19T15:00:00Z", status: "read" },
  { id: "3", name: "Clara Patel", email: "clara@corp.com", subject: "Support Request", message: "We need urgent support for our cloud infrastructure that went down.", receivedAt: "2024-11-18T08:00:00Z", status: "replied" },
];

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  unread: { bg: "#006caf18", color: "#006caf", label: "Unread" },
  read: { bg: "#f9bb1918", color: "#e0a810", label: "Read" },
  replied: { bg: "#22c55e18", color: "#22c55e", label: "Replied" },
};

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const markAs = (id: string, status: ContactMessage["status"]) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    toast.success(`Marked as ${status}.`);
  };

  const unreadCount = messages.filter(m => m.status === "unread").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6" style={{ color: "#006caf" }} /> Contact Messages
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? <span className="font-medium" style={{ color: "#006caf" }}>{unreadCount} unread messages</span> : "All messages read."} · {messages.length} total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message list */}
        <div className="lg:col-span-1 space-y-2">
          {messages.map((msg) => {
            const s = statusStyles[msg.status];
            return (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg); if (msg.status === "unread") markAs(msg.id, "read"); }}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${selected?.id === msg.id ? "border-[#006caf] shadow-md" : "border-border"}`}
                id={`msg-${msg.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{msg.name}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{msg.subject}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{msg.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{new Date(msg.receivedAt).toLocaleString()}</p>
              </button>
            );
          })}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selected.subject}</CardTitle>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selected.email}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(selected.receivedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => markAs(selected.id, "read")} id={`mark-read-${selected.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Mark Read
                    </Button>
                    <Button size="sm" onClick={() => markAs(selected.id, "replied")} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id={`mark-replied-${selected.id}`}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Replied
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="text-sm leading-relaxed">{selected.message}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-4">From: <strong>{selected.name}</strong> &lt;{selected.email}&gt;</p>
              </CardContent>
            </Card>
          ) : (
            <div className="h-64 flex items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
