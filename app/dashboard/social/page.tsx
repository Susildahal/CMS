"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { StrapiDataTable } from "@/components/datatable";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

// --- Icons ---
import {
  Share2, Plus, Loader2,
  Globe, Link2, ImageIcon, Type
} from "lucide-react";

// --- Types & Validation Schema ---
interface SocialMedia {
  id: number;
  documentId?: string;
  name: string;
  imageurl: string;
  url: string;
  createdAt: string;
}

const schema = z.object({
  name: z.string().min(2, "Platform name is required (e.g., Facebook)"),
  imageurl: z.string().url("Please enter a valid image URL asset path"),
  url: z.string().url("Please enter a valid social platform link URL"),
});

type FormData = z.infer<typeof schema>;

export default function SocialMediaPage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialMedia | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", imageurl: "", url: "" }
  });

  // Base API Path pointing to your explicit collection-type structure
  const API_PATH = "content-manager/collection-types/api::socialmedia.socialmedia";

  // ==========================================
  // DIALOG CONTROLLERS
  // ==========================================
  const openNew = () => {
    setEditingItem(null);
    reset({ name: "", imageurl: "", url: "" });
    setOpenDialog(true);
  };

  const openEdit = (item: SocialMedia) => {
    setEditingItem(item);
    reset({
      name: item.name,
      imageurl: item.imageurl,
      url: item.url,
    });
    setOpenDialog(true);
  };

  // ==========================================
  // CREATE & UPDATE HANDLER
  // ==========================================
  const onSubmit = async (data: FormData) => {
    try {
      if (editingItem) {
        // Update request targeting entity target ID
        const targetId = editingItem.documentId ?? editingItem.id;
        await apiClient.put(`${API_PATH}/${targetId}`, data);
        toast.success("Platform entry updated cleanly!");
      } else {
        // Create request payload 
        await apiClient.post(API_PATH, data);
        toast.success("New platform added beautifully!");
      }
      setOpenDialog(false);
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Error processing data form configurations");
    }
  };

  const columns = [
    {
      key: "imageurl",
      label: "Icon",
      render: (url: string, row: SocialMedia) => (
        <div className="h-8 w-8 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={row?.name ?? "icon"}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Globe className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    { key: "name", label: "Platform Name" },
    {
      key: "url",
      label: "Target Redirect URL",
      render: (value: string) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#006caf] hover:underline inline-flex items-center gap-1 max-w-sm truncate"
          >
            <Link2 className="h-3 w-3 shrink-0" /> {value}
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    { key: "documentId", label: "Document ID", hidden: true, hideable: true },
    { key: "createdAt", label: "Created", hidden: true, hideable: true },
    { key: "updatedAt", label: "Updated", hidden: true, hideable: true },
  ];

  return (
    <div className="space-y-6 ">
      
      {/* Header section matching style patterns */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6 text-[#006caf]" />
            Social Media 
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure integration connection links, handles, platforms and interface links.
          </p>
        </div>
        <Button onClick={openNew} className="text-white bg-gradient-to-br from-[#006caf] to-[#005a94]">
          <Plus className="h-4 w-4 mr-1" /> Add Platform
        </Button>
      </div>

      {/* Professional Shadcn / Core Data Table UI structure */}
      <StrapiDataTable
        key={refreshKey}
        endpoint={API_PATH}
        deleteEndpoint={API_PATH}
        columns={columns}
        sortField="createdAt:desc"
        onEdit={(row: any) => openEdit(row as SocialMedia)}
      />

      {/* Creation & Editing Overlay Dialog Sheet Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#006caf]" />
              {editingItem ? "Edit Integration" : "Add Integration Platform"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            {/* Field: Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-muted-foreground" /> Platform Name *
              </Label>
              <Input id="name" {...register("name")} placeholder="e.g., LinkedIn, Twitter" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Field: Image URL asset */}
            <div className="space-y-1.5">
              <Label htmlFor="imageurl" className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" /> Icon Asset Link URL *
              </Label>
              <Input id="imageurl" {...register("imageurl")} placeholder="https://example.com/assets/logo.png" />
              {errors.imageurl && <p className="text-xs text-destructive">{errors.imageurl.message}</p>}
            </div>

            {/* Field: Endpoint URL */}
            <div className="space-y-1.5">
              <Label htmlFor="url" className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" /> Destination Link URL *
              </Label>
              <Input id="url" {...register("url")} placeholder="https://instagram.com/yourbrand" />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="text-white bg-[#006caf] hover:bg-[#005a94]">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingItem ? "Update Entry" : "Save Platform"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}