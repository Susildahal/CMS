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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";
import type { TeamMember } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  role: z.string().min(2, "Role required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  imageUrl: z.string().url("Enter a valid URL").or(z.literal("")),
  linkedIn: z.string().url("Enter a valid LinkedIn URL").or(z.literal("")),
  order: z.coerce.number().min(1),
});
type FormData = z.infer<typeof schema>;

const INITIAL: TeamMember[] = [
  { id: "1", name: "James Carter", role: "CEO & Founder", bio: "Visionary leader with 20+ years in IT industry.", imageUrl: "", linkedIn: "", order: 1 },
  { id: "2", name: "Sarah Johnson", role: "Lead Designer", bio: "UX expert crafting intuitive digital experiences.", imageUrl: "", linkedIn: "", order: 2 },
  { id: "3", name: "Mike Chen", role: "Head of Engineering", bio: "Full-stack architect specializing in scalable systems.", imageUrl: "", linkedIn: "", order: 3 },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { order: members.length + 1 },
  });

  const openNew = () => { setEditing(null); reset({ order: members.length + 1 }); setOpen(true); };
  const openEdit = (m: TeamMember) => {
    setEditing(m);
    reset({ name: m.name, role: m.role, bio: m.bio, imageUrl: m.imageUrl || "", linkedIn: m.linkedIn || "", order: m.order });
    setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    if (editing) {
      setMembers((prev) => prev.map((m) => (m.id === editing.id ? { ...m, ...data } : m)));
      toast.success("Team member updated!");
    } else {
      const newMember: TeamMember = { id: Date.now().toString(), ...data };
      setMembers((prev) => [...prev, newMember]);
      toast.success("Team member added!");
    }
    setOpen(false);
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Member removed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" style={{ color: "#006caf" }} /> Our Team
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage team members displayed on the website.</p>
        </div>
        <Button
          id="add-team-member-btn"
          onClick={openNew}
          className="text-white"
          style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.sort((a, b) => a.order - b.order).map((m) => (
          <Card key={m.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">#{m.order}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(m)} id={`edit-member-${m.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMember(m.id)} id={`delete-member-${m.id}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">{m.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="team-member-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tm-name">Full Name *</Label>
                <Input id="tm-name" {...register("name")} placeholder="John Doe" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tm-role">Role / Title *</Label>
                <Input id="tm-role" {...register("role")} placeholder="Lead Developer" />
                {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tm-bio">Bio *</Label>
              <Textarea id="tm-bio" {...register("bio")} placeholder="Short biography..." rows={3} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tm-img">Photo URL</Label>
                <Input id="tm-img" {...register("imageUrl")} placeholder="https://..." />
                {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tm-li">LinkedIn URL</Label>
                <Input id="tm-li" {...register("linkedIn")} placeholder="https://linkedin.com/..." />
                {errors.linkedIn && <p className="text-xs text-destructive">{errors.linkedIn.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tm-order">Display Order</Label>
              <Input id="tm-order" type="number" {...register("order")} min={1} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-team-btn">Cancel</Button>
              <Button
                type="submit"
                id="save-team-member-btn"
                disabled={isSubmitting}
                className="flex-1 text-white"
                style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Add Member")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
