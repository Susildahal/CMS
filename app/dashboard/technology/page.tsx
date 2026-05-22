"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StrapiDataTable } from "@/components/datatable";

// Icons
import { Code2, Plus, Pencil, Trash2, Loader2, Type, Image as ImageIcon, Cpu } from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description is required"),
  techStack: z.array(z.object({
    name: z.string().min(1, "Name required"),
    url: z.string().url("Valid URL required").or(z.literal("")),
  })),
});

type FormData = z.infer<typeof schema>;

export default function TechnologyListPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger table refresh

  // 1. Form Setup
  const { register, handleSubmit, reset, control, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", techStack: [{ name: "", url: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "techStack" });

  // 2. Table Columns Definition
  const columns = [
    { key: "title", label: "Section Title" },
    {
      key: "technology",
      label: "Stack",
      render: (value: any) => {
        if (!Array.isArray(value)) return <span className="text-xs text-muted-foreground">Empty</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {value.slice(0, 3).map((tech, i) => (
              <Badge key={i} variant="secondary" className="flex items-center gap-1 px-1 py-0 h-6">
                <Avatar className="h-3.5 w-3.5">
                  <AvatarImage src={tech.url} />
                  <AvatarFallback><Code2 className="w-2 h-2" /></AvatarFallback>
                </Avatar>
                <span className="text-[9px]">{tech.name}</span>
              </Badge>
            ))}
            {value.length > 3 && <span className="text-[10px] text-muted-foreground">+{value.length - 3} more</span>}
          </div>
        );
      },
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
  ];

  // 3. Handlers
  const handleEdit = (row: any) => {
    setEditing(row);
    reset({
      title: row.title,
      description: row.description,
      techStack: Array.isArray(row.technology) ? row.technology : [{ name: "", url: "" }],
    });
    setOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    reset({ title: "", description: "", techStack: [{ name: "", url: "" }] });
    setOpen(true);
  };

  const onSubmit = async (values: FormData) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        technology: values.techStack,
      };

      const endpoint = editing ? `content-manager/collection-types/api::technology.technology/${editing.documentId}` : "content-manager/collection-types/api::technology.technology";
      editing ? await apiClient.put(endpoint, payload) : await apiClient.post(endpoint, payload);

      toast.success(editing ? "Updated successfully" : "Created successfully");
      setOpen(false);
      setRefreshKey(prev => prev + 1); // Refresh table
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to save");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[#006caf]" /> Technology Manager
        </h1>
        <Button onClick={handleAdd} className="bg-[#006caf] hover:bg-[#005a94]">
          <Plus className="w-4 h-4 mr-2" /> Add Section
        </Button>
      </div>

      {/* The Global DataTable */}
      <StrapiDataTable
        key={refreshKey}
        endpoint="content-manager/collection-types/api::technology.technology"
        populate="*"
        columns={columns}
        onEdit={handleEdit}
        pageSize={10}
      />

      {/* Add/Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Technology Section" : "Add New Technology Section"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...register("title")} placeholder="e.g. Backend Stack" />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea {...register("description")} placeholder="Describe the usage..." />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[#006caf] font-bold text-xs uppercase">Tech Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", url: "" })}>
                    <Plus className="w-3 h-3 mr-1" /> Add Tech
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Name</Label>
                          <Input {...register(`techStack.${index}.name`)} placeholder="React" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Icon URL</Label>
                          <Input {...register(`techStack.${index}.url`)} placeholder="https://..." />
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-5 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#006caf] text-white">
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}