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
import { Star, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Testimonial } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  title: z.string().min(2, "Title required"),
  company: z.string().min(2, "Company required"),
  content: z.string().min(20, "Testimonial content required"),
  rating: z.coerce.number().min(1).max(5),
  imageUrl: z.string().url("Must be valid URL").or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

const INITIAL: Testimonial[] = [
  { id: "1", name: "Jennifer Lee", title: "CTO", company: "TechNova Inc.", content: "Outstanding service! They delivered our platform 2 weeks ahead of schedule with zero defects. Highly recommend!", rating: 5, imageUrl: "" },
  { id: "2", name: "Marcus Williams", title: "CEO", company: "StartupXYZ", content: "The team's expertise in cloud architecture saved us 40% on infrastructure costs. Incredible results.", rating: 5, imageUrl: "" },
  { id: "3", name: "Priya Sharma", title: "Product Manager", company: "GlobalCorp", content: "Professional, responsive, and technically brilliant. They turned our vague ideas into a world-class product.", rating: 4, imageUrl: "" },
];

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className="h-4 w-4"
            fill={s <= rating ? "#f9bb19" : "transparent"}
            stroke={s <= rating ? "#f9bb19" : "#ccc"}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [rating, setRating] = useState(5);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); setRating(5); reset({ name: "", title: "", company: "", content: "", rating: 5, imageUrl: "" }); setOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setRating(t.rating); reset({ ...t }); setOpen(true); };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    if (editing) {
      setItems(prev => prev.map(t => t.id === editing.id ? { ...t, ...data } : t));
      toast.success("Testimonial updated!");
    } else {
      setItems(prev => [...prev, { id: Date.now().toString(), ...data }]);
      toast.success("Testimonial added!");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6" style={{ color: "#f9bb19" }} /> Testimonials
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Client testimonials displayed on the website.</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-testimonial-btn">
          <Plus className="h-4 w-4 mr-1" /> Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <StarRating rating={item.rating} />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)} id={`edit-testimonial-${item.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setItems(prev => prev.filter(t => t.id !== item.id)); toast.success("Deleted."); }} id={`delete-testimonial-${item.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{item.content}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.title}, {item.company}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="testimonial-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="test-name">Name *</Label>
                <Input id="test-name" {...register("name")} placeholder="Jennifer Lee" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="test-title">Title *</Label>
                <Input id="test-title" {...register("title")} placeholder="CTO" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-company">Company *</Label>
              <Input id="test-company" {...register("company")} placeholder="TechCorp Inc." />
              {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-content">Testimonial *</Label>
              <Textarea id="test-content" {...register("content")} rows={3} placeholder="Outstanding service..." />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Rating *</Label>
              <StarRating rating={rating} onChange={(r) => { setRating(r); setValue("rating", r); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-img">Photo URL</Label>
              <Input id="test-img" {...register("imageUrl")} placeholder="https://..." />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-testimonial-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-testimonial-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
