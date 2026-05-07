"use client";

import { useEffect, useState } from "react";
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
import { apiClient, extractErrorMessage } from "@/lib/api";
import { StrapiDataTable } from "@/components/datatable";

type ColumnDef = {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  hidden?: boolean;
};

 
const schema = z.object({
  question: z.string().trim().min(10, "Question must be at least 10 characters"),
  category: z.string().trim().min(2, "Category must be at least 2 characters"),
  order: z.number().min(1, "Order must be at least 1"),
});

type FormData = z.infer<typeof schema>;
interface FaqClientProps {
  initialItems: Faq[];
}
  const columns: ColumnDef[] = [
  { key: "question", label: "Question" },
  { key: "answer", label: "Answer" },
  { key: "order", label: "Order" },
];
export default function FaqClient({ initialItems }: FaqClientProps) {
  const [items, setItems] = useState<Faq[]>(initialItems ?? []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [editorValue, setEditorValue] = useState("");


  const [editRow, setEditRow] = useState<any | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });


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
        order: data.order,
        answer: editorValue,
      };

      console.log("Submitting FAQ with payload:", payload);

      const isEdit = Boolean(editing);
      const response = isEdit
        ? await apiClient.put(`/api/faqs/${editing?.documentId}`, { data: payload })
        : await apiClient.post("/api/faqs", { data: payload });

      console.log("API Response:", response.data);

      if (!response.data?.data) {
        throw new Error("Failed to save FAQ");
      }

      toast.success(isEdit ? "FAQ updated!" : "FAQ added!");
      setOpen(false);
      // await loadFaqs();
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to save FAQ");
      console.error("Submission error:", error);
      toast.error(message);
    }
  };


  const categories = [...new Set(items.map((faq) => faq.category))];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6" style={{ color: "#006caf" }} /> FAQ
          </h1>
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
            <StrapiDataTable
        title="FAQs"
        addLabel="Add FAQ"
        endpoint="api/faqs"
        deleteEndpoint="api/faqs"
        columns={columns}
        pageSize={10}
        sortField="order:asc"
        onAdd={() => setAddOpen(true)}
        onEdit={(row: any) => setEditRow(row)}  // ✅ row has documentId for your update form
      />

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
