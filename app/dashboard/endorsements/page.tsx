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
import { Award, Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";

interface Endorsement { id: string; name: string; organization: string; quote: string; logoUrl?: string; websiteUrl?: string; }

const schema = z.object({
  name: z.string().min(2, "Name required"),
  organization: z.string().min(2, "Organization required"),
  quote: z.string().min(20, "Quote required"),
  logoUrl: z.string().url("Must be valid URL").or(z.literal("")),
  websiteUrl: z.string().url("Must be valid URL").or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

const INITIAL: Endorsement[] = [
  { id: "1", name: "Dr. Alan Foster", organization: "Tech Alliance International", quote: "A groundbreaking company redefining IT standards globally. Their commitment to innovation is unparalleled.", websiteUrl: "https://techalliance.org" },
  { id: "2", name: "Minister Sarah Kim", organization: "National Digital Ministry", quote: "Their digital transformation projects have positively impacted thousands of citizens and businesses.", websiteUrl: "https://digital.gov" },
  { id: "3", name: "Prof. James Okafor", organization: "MIT Technology Review", quote: "Recognized among the Top 50 innovative IT companies of 2024. A truly exceptional organization.", websiteUrl: "https://technologyreview.com" },
];

export default function EndorsementsPage() {
  const [items, setItems] = useState<Endorsement[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Endorsement | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({ name: "", organization: "", quote: "", logoUrl: "", websiteUrl: "" }); setOpen(true); };
  const openEdit = (e: Endorsement) => { setEditing(e); reset({ name: e.name, organization: e.organization, quote: e.quote, logoUrl: e.logoUrl || "", websiteUrl: e.websiteUrl || "" }); setOpen(true); };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    if (editing) {
      setItems(prev => prev.map(e => e.id === editing.id ? { ...e, ...data } : e));
      toast.success("Endorsement updated!");
    } else {
      setItems(prev => [...prev, { id: Date.now().toString(), ...data }]);
      toast.success("Endorsement added!");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6" style={{ color: "#f9bb19" }} /> Endorsements
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Official endorsements from partners, institutions, and officials.</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-endorsement-btn">
          <Plus className="h-4 w-4 mr-1" /> Add Endorsement
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ background: "linear-gradient(135deg,#f9bb1918,#e0a81018)" }}>
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">{item.organization}</p>
                        {item.websiteUrl && (
                          <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-0.5 hover:underline" style={{ color: "#006caf" }}>
                            <ExternalLink className="h-2.5 w-2.5" /> Visit
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)} id={`edit-endorsement-${item.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setItems(prev => prev.filter(e => e.id !== item.id)); toast.success("Deleted."); }} id={`delete-endorsement-${item.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed">"{item.quote}"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Endorsement" : "Add Endorsement"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="endorsement-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="end-name">Name *</Label>
                <Input id="end-name" {...register("name")} placeholder="Dr. Alan Foster" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-org">Organization *</Label>
                <Input id="end-org" {...register("organization")} placeholder="Tech Alliance" />
                {errors.organization && <p className="text-xs text-destructive">{errors.organization.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-quote">Quote *</Label>
              <Textarea id="end-quote" {...register("quote")} rows={3} placeholder="A groundbreaking company..." />
              {errors.quote && <p className="text-xs text-destructive">{errors.quote.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="end-logo">Logo URL</Label>
                <Input id="end-logo" {...register("logoUrl")} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-web">Website URL</Label>
                <Input id="end-web" {...register("websiteUrl")} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-endorsement-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-endorsement-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
