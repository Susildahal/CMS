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
import { Share2, Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import type { SocialLink } from "@/lib/types";
import axios from "axios";

const schema = z.object({
  platform: z.string().min(2, "Platform required"),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().min(1, "Icon required"),
  order: z.coerce.number().min(1),
});
type FormData = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

const INITIAL: SocialLink[] = [];


export default function SocialPage() {
  const [items, setItems] = useState<SocialLink[]>(INITIAL);
  const [loadedItems, setLoadedItems] = useState<SocialLink[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, undefined, FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({ platform: "", url: "", icon: "🔗", order: items.length + 1 }); setOpen(true); };
  const openEdit = (s: SocialLink) => { setEditing(s); reset({ platform: s.platform, url: s.url, icon: s.icon, order: s.order }); setOpen(true); };

  const onSubmit = async (data: FormData) => {
    const next = editing
      ? items.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
      : [...items, { id: Date.now().toString(), ...data }];

    setItems(next);

    try {
      await persistSocialMedia(next);
      toast.success(editing ? "Social link updated!" : "Social link added!");
      setOpen(false);
    } catch (error) {
      console.error("Error saving social links:", error);
      toast.error("Failed to save social links");
      setItems(loadedItems);
    }
  };

  const persistSocialMedia = async (updatedItems: SocialLink[]) => {
    const payload = updatedItems
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ name: item.platform, url: item.url, icon: item.icon }));

    await axios.patch("/api/settings", { socialmedia: payload });
    setLoadedItems(updatedItems);
  };

  useEffect(() => {
    const fetchSocial = async () => {
      try {
        const response = await axios.get("/api/settings");
        const socialmedia = response.data?.data?.socialmedia;

        if (Array.isArray(socialmedia) && socialmedia.length > 0) {
          const mapped: SocialLink[] = socialmedia.map(
            (item: { name: string; url: string; icon: string }, index: number) => ({
              id: `${index + 1}`,
              platform: item.name,
              url: item.url,
              icon: item.icon,
              order: index + 1,
            })
          );

          setItems(mapped);
          setLoadedItems(mapped);
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    };

    fetchSocial();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6" style={{ color: "#006caf" }} /> Social Media & Links
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage social media profiles and external links.</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-social-btn">
          <Plus className="h-4 w-4 mr-1" /> Add Link
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...items].sort((a, b) => a.order - b.order).map((item) => (
          <Card key={item.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="text-3xl shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.platform}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground truncate hover:underline flex items-center gap-1 mt-0.5" style={{ color: "#006caf" }}>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.url.replace("https://", "")}</span>
                </a>
                <Badge variant="outline" className="text-[10px] mt-1.5">#{item.order}</Badge>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)} id={`edit-social-${item.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={async () => {
                    const next = items.filter((s) => s.id !== item.id).map((s, idx) => ({ ...s, order: idx + 1 }));
                    setItems(next);
                    try {
                      await persistSocialMedia(next);
                      toast.success("Deleted.");
                    } catch (error) {
                      console.error("Error saving social links:", error);
                      toast.error("Failed to save social links");
                      setItems(loadedItems);
                    }
                  }}
                  id={`delete-social-${item.id}`}
                ><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Social Link" : "Add Social Link"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="social-form">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="soc-platform">Platform *</Label>
                <Input id="soc-platform" {...register("platform")} placeholder="LinkedIn" />
                {errors.platform && <p className="text-xs text-destructive">{errors.platform.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="soc-icon">Icon</Label>
                <Input id="soc-icon" {...register("icon")} placeholder="💼" className="text-center text-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soc-url">URL *</Label>
              <Input id="soc-url" {...register("url")} placeholder="https://linkedin.com/company/..." />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soc-order">Display Order</Label>
              <Input id="soc-order" type="number" {...register("order")} min={1} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-social-btn">Cancel</Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-white"
                style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
                id="save-social-btn"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
