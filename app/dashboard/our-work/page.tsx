"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Project } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  client: z.string().min(2, "Client required"),
  description: z.string().min(20, "Description required"),
  imageUrl: z.string().url("Must be valid URL").or(z.literal("")),
  category: z.string().min(1, "Category required"),
  year: z.coerce.number().min(2000).max(2099),
});
type FormData = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

const CATEGORIES = ["Web App", "Mobile App", "E-Commerce", "Enterprise", "Cloud", "AI/ML", "Design"];

const INITIAL: Project[] = [
  { id: "1", title: "FinTech Dashboard Platform", client: "BankCorp Ltd", description: "Real-time financial analytics platform with AI-driven insights.", imageUrl: "", category: "Web App", year: 2024 },
  { id: "2", title: "E-Commerce Mobile App", client: "ShopNation", description: "Cross-platform mobile app with 100k+ daily active users.", imageUrl: "", category: "Mobile App", year: 2024 },
  { id: "3", title: "Healthcare Management System", client: "MediGroup", description: "Complete hospital management system serving 500+ doctors.", imageUrl: "", category: "Enterprise", year: 2023 },
];

export default function OurWorkPage() {
  const [items, setItems] = useState<Project[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [catValue, setCatValue] = useState<string>("");

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({ title: "", client: "", description: "", imageUrl: "", category: "", year: 2024 }); setCatValue(""); setOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); reset({ ...p }); setCatValue(p.category); setOpen(true); };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await new Promise((r) => setTimeout(r, 600));
    if (editing) {
      setItems(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } : p));
      toast.success("Project updated!");
    } else {
      setItems(prev => [...prev, { id: Date.now().toString(), ...data }]);
      toast.success("Project added!");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6" style={{ color: "#006caf" }} /> Our Work
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Showcase your portfolio projects.</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-project-btn">
          <Plus className="h-4 w-4 mr-1" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-0">
              <div className="h-40 rounded-t-xl flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg,#006caf18,#005a9440)" }}>
                🖥️
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.client} · {item.year}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)} id={`edit-project-${item.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setItems(prev => prev.filter(p => p.id !== item.id)); toast.success("Deleted."); }} id={`delete-project-${item.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">{item.description}</p>
                <Badge className="mt-3 text-[10px] text-white" style={{ background: "#006caf" }}>{item.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="project-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="proj-title">Title *</Label>
                <Input id="proj-title" {...register("title")} placeholder="Project name" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-client">Client *</Label>
                <Input id="proj-client" {...register("client")} placeholder="Client name" />
                {errors.client && <p className="text-xs text-destructive">{errors.client.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">Description *</Label>
              <Textarea id="proj-desc" {...register("description")} rows={3} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={catValue} onValueChange={(v: string | null) => { const val = v ?? ""; setCatValue(val); setValue("category", val); }}>
                  <SelectTrigger id="proj-category"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-year">Year *</Label>
                <Input id="proj-year" type="number" {...register("year")} placeholder="2024" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-img">Image URL</Label>
              <Input id="proj-img" {...register("imageUrl")} placeholder="https://..." />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-project-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-project-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
