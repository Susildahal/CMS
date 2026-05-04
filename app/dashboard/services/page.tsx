"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { Briefcase, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Service } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  description: z.string().min(20, "Description required"),
  icon: z.string().min(1, "Icon name required"),
  order: z.coerce.number().min(1),
});
type FormData = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

const INITIAL: Service[] = [
  { id: "1", title: "Custom Software Development", description: "Tailor-made software solutions built for your unique business needs.", icon: "💻", order: 1 },
  { id: "2", title: "Cloud Solutions", description: "Scalable, secure, and cost-effective cloud infrastructure management.", icon: "☁️", order: 2 },
  { id: "3", title: "Cybersecurity", description: "End-to-end security solutions to protect your digital assets.", icon: "🔒", order: 3 },
  { id: "4", title: "IT Consulting", description: "Strategic technology advice to accelerate your business transformation.", icon: "📊", order: 4 },
  { id: "5", title: "UI/UX Design", description: "Human-centered design solutions that delight users and drive engagement.", icon: "🎨", order: 5 },
  { id: "6", title: "Data Analytics", description: "Turn raw data into actionable business intelligence and insights.", icon: "📈", order: 6 },
];

export default function Page() {
  const [items, setItems] = useState<Service[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, undefined, FormData>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await new Promise((r) => setTimeout(r, 600));
    if (editing) {
      setItems((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...data } : s));
      toast.success("Service updated!");
    } else {
      setItems((prev) => [...prev, { id: Date.now().toString(), ...data }]);
      toast.success("Service added!");
    }
    setOpen(false);
  };

  const submit = handleSubmit(onSubmit);

  const openNew = () => { setEditing(null); reset({ title: "", description: "", icon: "⚙️", order: items.length + 1 }); setOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); reset({ title: s.title, description: s.description, icon: s.icon, order: s.order }); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" style={{ color: "#006caf" }} /> Services
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the services displayed on your website.</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-service-btn">
          <Plus className="h-4 w-4 mr-1" /> Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.sort((a, b) => a.order - b.order).map((item) => (
          <Card key={item.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)} id={`edit-service-${item.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setItems(prev => prev.filter(s => s.id !== item.id)); toast.success("Deleted."); }} id={`delete-service-${item.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="font-semibold text-sm mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              <Badge variant="outline" className="mt-3 text-[10px]">Order #{item.order}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4" id="service-form">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="svc-title">Service Title *</Label>
                <Input id="svc-title" {...register("title")} placeholder="Cloud Solutions" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-icon">Icon (emoji)</Label>
                <Input id="svc-icon" {...register("icon")} placeholder="☁️" className="text-xl text-center" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-desc">Description *</Label>
              <Textarea id="svc-desc" {...register("description")} rows={3} placeholder="Describe the service..." />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-order">Display Order</Label>
              <Input id="svc-order" type="number" {...register("order")} min={1} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-service-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-service-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
