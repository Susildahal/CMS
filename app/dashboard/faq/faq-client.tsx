"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle, Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Editor from "@/components/editor";
import type { Faq } from "@/lib/types";


const schema = z.object({
  question: z.string().trim().min(10, "Question must be at least 10 characters"),
  category: z.string().trim().min(2, "Category must be at least 2 characters"),
  order: z.number().min(1, "Order must be at least 1"),
});

type FormData = z.infer<typeof schema>;

interface FaqClientProps {
  initialItems: Faq[];
}

export default function FaqClient({ initialItems }: FaqClientProps) {
  const [items, setItems] = useState<Faq[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editorValue, setEditorValue] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const loadFaqs = async () => {
    try {
      const response = await fetch("/api/faq", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load FAQs");
      }

      setItems(payload.data ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load FAQs";
      toast.error(message);
    }
  };

  const openNew = () => {
    setEditing(null);
    setEditorValue("");
    reset({ question: "", category: "General", order: items.length + 1 });
    setOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditing(faq);
    setEditorValue(faq.answer);
    reset({ question: faq.question, category: faq.category, order: faq.order });
    setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form validation passed. Form data:", data);
    console.log("Editor value:", editorValue);

    if (!editorValue || !editorValue.trim()) {
      toast.error("Answer is required and must contain text");
      return;
    }

    // Check answer meets minimum length requirement
    const plainText = editorValue.replace(/<[^>]*>/g, "").trim();
    if (plainText.length < 20) {
      toast.error("Answer must be at least 20 characters");
      return;
    }

    try {
      const payload = {
        question: data.question,
        category: data.category,
        order: data.order,
        answer: editorValue,
      };

      console.log("Submitting FAQ with payload:", payload);

      const isEdit = Boolean(editing);
      const endpoint = isEdit ? `/api/faq/${editing?.id}` : "/api/faq";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json();
      console.log("API Response:", responsePayload);

      if (!response.ok) {
        throw new Error(responsePayload.error ?? "Failed to save FAQ");
      }

      toast.success(isEdit ? "FAQ updated!" : "FAQ added!");
      setOpen(false);
      await loadFaqs();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save FAQ";
      console.error("Submission error:", error);
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/faq/${id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete FAQ");
      }

      toast.success("FAQ deleted.");
      setItems((prev) => prev.filter((faq) => faq.id !== id));

      if (expanded === id) {
        setExpanded(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete FAQ";
      toast.error(message);
    }
  };

  const categories = [...new Set(items.map((faq) => faq.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6" style={{ color: "#006caf" }} /> FAQ
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage frequently asked questions. {items.length} total.</p>
        </div>
        <Button
          onClick={openNew}
          className="text-white"
          style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
          id="add-faq-btn"
        >
          <Plus className="h-4 w-4 mr-1" /> Add FAQ
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge key={category} variant="outline" style={{ borderColor: "#006caf", color: "#006caf" }}>
            {category} ({items.filter((faq) => faq.category === category).length})
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        {[...items].sort((a, b) => a.order - b.order).map((faq) => (
          <Card key={faq.id} className="border-border hover:shadow-sm transition-all group">
            <CardContent className="p-0">
              <div className="flex items-start gap-3 p-4">
                <button
                  className="flex-1 text-left flex items-start gap-3 min-w-0"
                  onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                  id={`faq-toggle-${faq.id}`}
                >
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#006caf18" }}
                  >
                    <span className="text-xs font-bold" style={{ color: "#006caf" }}>
                      Q
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{faq.question}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {faq.category}
                      </Badge>
                    </div>
                    {expanded === faq.id && (
                      <div className="mt-3 flex gap-2.5">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#f9bb1918" }}>
                          <span className="text-xs font-bold" style={{ color: "#e0a810" }}>
                            A
                          </span>
                        </div>
                        <div
                          className="text-sm text-muted-foreground leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_ol]:list-decimal [&_ol]:ml-4 [&_ul]:list-disc [&_ul]:ml-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(faq)} id={`edit-faq-${faq.id}`}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => void handleDelete(faq.id)}
                      id={`delete-faq-${faq.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {expanded === faq.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="faq-form">
            <div className="space-y-1.5">
              <Label htmlFor="faq-q">Question *</Label>
              <Input id="faq-q" {...register("question")} placeholder="What services do you offer?" />
              {errors.question && <p className="text-xs text-destructive">{errors.question.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Answer *</Label>
              <Editor value={editorValue} onChange={setEditorValue} placeholder="Write your answer..." />
              {!editorValue.trim() && <p className="text-xs text-destructive">Answer required</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="faq-cat">Category *</Label>
                <Input id="faq-cat" {...register("category")} placeholder="General" />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="faq-order">Order</Label>
                <Input id="faq-order" type="number" {...register("order", { valueAsNumber: true })} min={1} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-faq-btn">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-white"
                style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
                id="save-faq-btn"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Update" : "Add FAQ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
