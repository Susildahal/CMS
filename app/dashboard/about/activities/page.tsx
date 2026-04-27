"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Plus, Pencil, Trash2, Loader2, Calendar } from "lucide-react";
import type { Activity as ActivityType } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  description: z.string().min(10, "Description required"),
  date: z.string().min(1, "Date required"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

const INITIAL: ActivityType[] = [
  { id: "1", title: "Annual Tech Summit 2024", description: "Hosted 500+ IT professionals for a two-day summit on emerging technologies.", date: "2024-11-15", imageUrl: "" },
  { id: "2", title: "Community Coding Bootcamp", description: "Free 4-week coding bootcamp for underprivileged youth.", date: "2024-09-01", imageUrl: "" },
  { id: "3", title: "Partnership with GreenTech", description: "Signed strategic MoU with GreenTech for sustainable IT solutions.", date: "2024-07-20", imageUrl: "" },
];

export default function ActivitiesPage() {
  const [items, setItems] = useState<ActivityType[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityType | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({ title: "", description: "", date: "", imageUrl: "" }); setOpen(true); };
  const openEdit = (a: ActivityType) => { setEditing(a); reset({ title: a.title, description: a.description, date: a.date, imageUrl: a.imageUrl || "" }); setOpen(true); };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    if (editing) {
      setItems((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...data } : a)));
      toast.success("Activity updated!");
    } else {
      setItems((prev) => [...prev, { id: Date.now().toString(), ...data }]);
      toast.success("Activity added!");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" style={{ color: "#006caf" }} /> Our Activities
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage company activities and events.</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-activity-btn">
          <Plus className="h-4 w-4 mr-1" /> Add Activity
        </Button>
      </div>

      <div className="grid gap-4">
        {items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
          <Card key={item.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#006caf18" }}>
                <Calendar className="h-5 w-5" style={{ color: "#006caf" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)} id={`edit-activity-${item.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setItems(prev => prev.filter(a => a.id !== item.id)); toast.success("Deleted."); }} id={`delete-activity-${item.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Activity" : "Add Activity"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="activity-form">
            <div className="space-y-1.5">
              <Label htmlFor="act-title">Title *</Label>
              <Input id="act-title" {...register("title")} placeholder="Activity title" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="act-desc">Description *</Label>
              <Textarea id="act-desc" {...register("description")} rows={3} placeholder="Activity description..." />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="act-date">Date *</Label>
                <Input id="act-date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-img">Image URL</Label>
                <Input id="act-img" {...register("imageUrl")} placeholder="https://..." />
                {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-activity-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-activity-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
