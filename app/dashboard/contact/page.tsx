"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Phone, Mail, Clock, CheckCircle, Eye, Loader2,
  MessageSquare, Inbox, Circle, Trash2, AlertTriangle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface ContactMessage {
  id: string;
  documentId: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  phoneNumber: string;
  read: boolean;
  reply: boolean;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const fetchContacts = async (currentPage = page, currentPageSize = pageSize) => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `content-manager/collection-types/api::contact.contact?sort=createdAt:desc&page=${currentPage}&pageSize=${currentPageSize}`
      );
      setMessages(res.data?.results ?? res.data?.data ?? []);
      setPaginationMeta(res.data?.pagination ?? res.data?.meta?.pagination ?? null);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(page, pageSize);
  }, [page, pageSize]);

  const updateField = async (msg: ContactMessage, field: "read" | "reply", value: boolean) => {
    if (msg[field] === value) return;
    try {
      setUpdating(msg.documentId);
      await apiClient({
        method: "PUT",
        url: `content-manager/collection-types/api::contact.contact/${msg.documentId}`,
        data: {
          fullName: msg.fullName,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          phoneNumber: msg.phoneNumber,
          [field]: value,
        },
      });
      const updated = { ...msg, [field]: value };
      setMessages((prev) => prev.map((m) => m.documentId === msg.documentId ? updated : m));
      if (selected?.documentId === msg.documentId) setSelected(updated);
      toast.success(field === "read" ? "Marked as read." : "Marked as replied.");
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await apiClient.delete(`content-manager/collection-types/api::contact.contact/${deleteTarget.documentId}`);
      toast.success("Message deleted.");
      if (selected?.documentId === deleteTarget.documentId) setSelected(null);
      setDeleteTarget(null);
      // If last item on page, go back one page
      const isLastOnPage = messages.length === 1 && page > 1;
      if (isLastOnPage) {
        setPage((p) => p - 1);
      } else {
        fetchContacts(page, pageSize);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelect = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) updateField(msg, "read", true);
  };

  const unreadCount = messages.filter((m) => !m.read).length;
  const repliedCount = messages.filter((m) => m.reply).length;
  const totalPages = paginationMeta?.pageCount ?? 1;
  const totalRecords = paginationMeta?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Header + Stats ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6 text-[#006caf]" /> Inbox
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage incoming contact messages
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-center px-4 py-2 rounded-xl bg-[#006caf10] border border-[#006caf20]">
            <p className="text-xl font-bold text-[#006caf]">{unreadCount}</p>
            <p className="text-[10px] text-muted-foreground">Unread</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-xl font-bold text-green-500">{repliedCount}</p>
            <p className="text-[10px] text-muted-foreground">Replied</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-muted/60 border border-border">
            <p className="text-xl font-bold">{totalRecords}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#006caf]" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* ── Left: Message List ── */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}

              {messages.map((msg) => (
                <button
                  key={msg.documentId}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-sm group ${
                    selected?.documentId === msg.documentId
                      ? "border-[#006caf] bg-[#006caf08] shadow-sm"
                      : "border-border hover:border-muted-foreground/30 bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${
                      !msg.read
                        ? "bg-gradient-to-br from-[#006caf] to-[#005a94]"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {msg.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${!msg.read ? "font-semibold" : "font-medium"}`}>
                          {msg.fullName}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {!msg.read && <Circle className="h-2 w-2 fill-[#006caf] text-[#006caf]" />}
                          {msg.reply && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {/* ✅ Delete button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(msg); }}
                            className="ml-1 h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 opacity-70">{msg.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1.5 opacity-60">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalRecords > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Rows</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => { setPageSize(Number(val)); setPage(1); }}
                  >
                    <SelectTrigger className="h-7 w-14 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 25, 50].map((s) => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{page} / {totalPages}</span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Message Detail ── */}
          <div className="lg:col-span-3">
            {selected ? (
              <Card className="border-border">
                <CardContent className="p-0 flex flex-col">
                  {/* Detail Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#006caf] to-[#005a94] flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {selected.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <h2 className="font-semibold text-base">{selected.fullName}</h2>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />{selected.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />{selected.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Pills */}
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                          selected.read
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-[#006caf10] text-[#006caf] border-[#006caf20]"
                        }`}>
                          {selected.read ? "Read" : "Unread"}
                        </span>
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                          selected.reply
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}>
                          {selected.reply ? "Replied" : "Not Replied"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <h3 className="font-semibold text-base">{selected.subject}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-6">
                    <div className="p-5 rounded-2xl bg-muted/40 border border-border min-h-[120px]">
                      <p className="text-sm leading-relaxed">{selected.message}</p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-6 pb-6 flex gap-2 justify-between border-t border-border pt-4">
                    {/* Delete from detail */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                      onClick={() => setDeleteTarget(selected)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={selected.read || updating === selected.documentId}
                        onClick={() => updateField(selected, "read", true)}
                        className="gap-1.5"
                      >
                        {updating === selected.documentId
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Eye className="h-3.5 w-3.5" />
                        }
                        {selected.read ? "Already Read" : "Mark as Read"}
                      </Button>

                      <Button
                        size="sm"
                        disabled={selected.reply || updating === selected.documentId}
                        onClick={() => updateField(selected, "reply", true)}
                        className="gap-1.5 text-white"
                        style={{
                          background: selected.reply
                            ? "#9ca3af"
                            : "linear-gradient(135deg,#006caf,#005a94)",
                        }}
                      >
                        {updating === selected.documentId
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <CheckCircle className="h-3.5 w-3.5" />
                        }
                        {selected.reply ? "Already Replied" : "Mark as Replied"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="min-h-[400px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border gap-3">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="h-7 w-7 text-muted-foreground opacity-40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">No message selected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click a message to read it</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the message from{" "}
            <span className="font-semibold text-foreground">{deleteTarget?.fullName}</span>?
            This action <span className="font-semibold text-foreground">cannot be undone</span>.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <Trash2 className="h-4 w-4 mr-2" />
              }
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}