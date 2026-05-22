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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

// Icons
import { Briefcase, Plus, Loader2 } from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description is required"),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "view">("view");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" }
  });

  // ─── Table Columns ─────────────────────────────────────────────────────────
  const columns = [
    { 
      key: "title", 
      label: "Service Title" 
    },
    { 
      key: "description", 
      label: "Description",
      // Shorten description in table for better UI
      render: (val: string) => <span className="line-clamp-1 text-muted-foreground">{val}</span>
    },
    { 
      key: "updatedAt", 
      label: "Last Modified",
      render: (val: string) => new Date(val).toLocaleDateString()
    }
  ];

  // ─── Form Logic ────────────────────────────────────────────────────────────
  const handleOpenForm = (data: any = null, formMode: "add" | "edit" | "view" = "add") => {
    setMode(formMode);
    setSelectedId(data?.documentId || null);
    reset({
      title: data?.title || "",
      description: data?.description || "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: FormData) => {
    if (mode === "view") return;
    
    try {
      const payload = values;
      const endpoint = mode === "edit" 
        ? `content-manager/collection-types/api::service-type.service-type/${selectedId}` 
        : "content-manager/collection-types/api::service-type.service-type";
      
      if (mode === "edit") {
        await apiClient.put(endpoint, payload);
      } else {
        await apiClient.post(endpoint, payload);
      }

      toast.success(`Service Type ${mode === "edit" ? "updated" : "created"}!`);
      setOpen(false);
      setRefreshKey(prev => prev + 1); // Refresh table data
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#006caf]">
            <Briefcase className="h-6 w-6" /> Service Types
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define the categories of services your company provides.
          </p>
        </div>
        <Button 
          onClick={() => handleOpenForm(null, "add")} 
          className="bg-[#006caf] hover:bg-[#005a94] text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> New Service Type
        </Button>
      </div>

      {/* The Global DataTable */}
      <StrapiDataTable
        key={refreshKey}
        endpoint="content-manager/collection-types/api::service-type.service-type"
        populate="*"
        columns={columns}
        onView={(row) => handleOpenForm(row, "view")}
        onEdit={(row) => handleOpenForm(row, "edit")}
      />

      {/* Shared Modal for Add, Edit, and View */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize flex items-center gap-2">
              {mode} Service Type
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="st-title">Title</Label>
              <Input 
                id="st-title" 
                {...register("title")} 
                placeholder="e.g. Web Development" 
                disabled={mode === "view"}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="st-desc">Description</Label>
              <Textarea 
                id="st-desc" 
                {...register("description")} 
                placeholder="Briefly describe this service type..." 
                rows={4}
                disabled={mode === "view"}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                {mode === "view" ? "Close" : "Cancel"}
              </Button>
              
              {/* Only show "Save" button if not in View Mode */}
              {mode !== "view" && (
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 bg-[#006caf] text-white hover:bg-[#005a94]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    mode === "edit" ? "Update Service" : "Create Service"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}