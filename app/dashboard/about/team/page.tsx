"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

// Components
import { StrapiDataTable } from "@/components/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Icons
import { Users, Plus, Loader2, User, Link as LinkIcon } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  role: z.string().min(2, "Role required"),
  bio: z.string().min(10, "Bio required"),
  imageUrl: z.string().url("Valid URL required").or(z.literal("")),
  linkedIn: z.string().url("Valid URL required").or(z.literal("")),
  order: z.coerce.number().min(1),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

export default function TeamPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "view">("view");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
  });

  // ─── Table Columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "imageUrl",
      label: "Photo",
      render: (url: string) => (
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={url} className="object-cover" />
          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      ),
    },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "order", label: "Order" },
  ];

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const openForm = (data: any = null, formMode: "add" | "edit" | "view" = "add") => {
    setMode(formMode);
    setEditingId(data?.documentId || null);
    reset({
      name: data?.name || "",
      role: data?.role || "",
      bio: data?.bio || "",
      imageUrl: data?.imageUrl || "",
      linkedIn: data?.linkedIn || "",
      order: data?.order || 1,
    });
    setOpen(true);
  };

  const onSubmit = async (values: FormData) => {
    if (mode === "view") return;
    try {
      const payload = { data: values };
      const endpoint = mode === "edit" ? `api/teams/${editingId}` : "api/teams";
      
      mode === "edit" 
        ? await apiClient.put(endpoint, payload) 
        : await apiClient.post(endpoint, payload);

      toast.success(`Member ${mode === "edit" ? "updated" : "added"}!`);
      setOpen(false);
      setRefreshKey(p => p + 1);
    } catch (error: any) {
      toast.error("Failed to save data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#006caf]">
            <Users className="h-6 w-6" /> Team Directory
          </h1>
        </div>
        <Button onClick={() => openForm(null, "add")} className="bg-[#006caf] hover:bg-[#005a94]">
          <Plus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </div>

      <StrapiDataTable
        key={refreshKey}
        endpoint="api/teams"
        columns={columns}
        onView={(row) => openForm(row, "view")}
        onEdit={(row) => openForm(row, "edit")}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {mode} Team Member
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input {...register("name")} disabled={mode === "view"} />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Input {...register("role")} disabled={mode === "view"} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Biography</Label>
              <Textarea {...register("bio")} disabled={mode === "view"} rows={3} />
            </div>

            <div className="space-y-1">
              <Label>Image URL (String)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input {...register("imageUrl")} className="pl-9" placeholder="https://..." disabled={mode === "view"} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Order</Label>
                <Input type="number" {...register("order")} disabled={mode === "view"} />
              </div>
              <div className="space-y-1">
                <Label>LinkedIn</Label>
                <Input {...register("linkedIn")} disabled={mode === "view"} />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                {mode === "view" ? "Close" : "Cancel"}
              </Button>
              
              {/* ✅ Submit button only shows if NOT in view mode */}
              {mode !== "view" && (
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#006caf]">
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}