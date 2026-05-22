"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { extractErrorMessage } from "@/lib/api";
import { blocksToHtml, blocksToPlainText, htmlToBlocks } from "../../../lib/strapi-blocks";
import Editor from "@/components/editor";

import { StrapiDataTable } from "@/components/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Plus, Loader2, Image as ImageIcon, Info, Type, Link as LinkIcon } from "lucide-react";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  subtitle: z.string().min(2, "Subtitle required"),
  description: z.string().min(10, "Description required"),
  imageUrl: z.string().url("Enter a valid Image URL"),
  serviceType: z.string().min(1, "Please select a service type"),
});

type FormData = z.infer<typeof schema>;

export default function ServicesPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "view">("view");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  const {
    register, handleSubmit, reset, setValue, control, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const currentServiceType = watch("serviceType");

  useEffect(() => {
    apiClient.get("content-manager/collection-types/api::service-type.service-type").then((res) => {
      setServiceTypes(res.data?.results || res.data?.data || []);
    });
  }, []);

  const formatDateTime = (value: any) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const columns = [
    { key: "documentId", label: "Doc ID", hidden: true, hideable: true },
    {
      key: "imageUrl",
      label: "Icon",
      hideable: false,
      render: (url: string) => (
        <Avatar className="h-9 w-9 rounded-lg border bg-muted/30">
          <AvatarImage src={url} className="object-contain p-1.5" />
          <AvatarFallback><ImageIcon className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
        </Avatar>
      ),
    },
    { key: "title", label: "Service Name", hideable: false },
    {
      key: "subtitle",
      label: "Subtitle",
      hideable: false,
      render: (val: any) => (
        <span className="block line-clamp-2 break-words text-muted-foreground">
          {val ? String(val) : "—"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      hideable: false,
      render: (val: any) => (
        <span className="block line-clamp-3 break-words">
          {blocksToPlainText(val) || "—"}
        </span>
      ),
    },
    {
      key: "service_type.title",
      label: "Category",
      hideable: false,
      render: (val: any) => (
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#006caf10] text-[#006caf]">
          {val || "Uncategorized"}
        </span>
      ),
    },
    { key: "createdAt", label: "Created", hidden: true, hideable: true, render: (v: any) => <span className="text-xs">{formatDateTime(v)}</span> },
    { key: "updatedAt", label: "Updated", hidden: true, hideable: true, render: (v: any) => <span className="text-xs">{formatDateTime(v)}</span> },
    { key: "publishedAt", label: "Published", hidden: true, hideable: true, render: (v: any) => <span className="text-xs">{formatDateTime(v)}</span> },
  ];

  const handleOpenForm = (data: any = null, formMode: "add" | "edit" | "view" = "add") => {
    setMode(formMode);
    setSelectedId(data?.documentId || null);
    reset({
      title: data?.title || "",
      subtitle: data?.subtitle || "",
      description: blocksToHtml(data?.description),
      imageUrl: data?.imageUrl || "",
      serviceType: data?.service_type?.documentId || "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: FormData) => {
    if (mode === "view") return;
    try {
      // Strapi v5 rejects unknown keys: don't send `serviceType` (form-only field)
      // Also Strapi `description` is a Blocks field, so convert the editor HTML into blocks.
      const { serviceType, description, ...rest } = values;
      const payload = {
        ...rest,
        description: htmlToBlocks(description),
        service_type: serviceType || null,
      };
      const endpoint = mode === "edit" ? `content-manager/collection-types/api::service.service/${selectedId}` : "content-manager/collection-types/api::service.service";
      mode === "edit"
        ? await apiClient.put(endpoint, payload)
        : await apiClient.post(endpoint, payload);
      toast.success("Service saved successfully!");
      setOpen(false);
      setRefreshKey((p) => p + 1);
    } catch (error: any) {
      toast.error(extractErrorMessage(error, "An error occurred while saving."));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[#006caf]" />
            Services
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure your company offerings and descriptions.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm(null, "add")}
          className="w-full sm:w-auto shrink-0 text-white bg-gradient-to-br from-[#006caf] to-[#005a94]"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Service
        </Button>
      </div>

      {/* ── Table ── */}
      <StrapiDataTable
        key={refreshKey}
        endpoint="content-manager/collection-types/api::service.service"
        populate="*"
        columns={columns}
        onView={(row) => handleOpenForm(row, "view")}
        onEdit={(row) => handleOpenForm(row, "edit")}
      />

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl flex max-h-[90vh] flex-col overflow-hidden p-4">
         
            <DialogTitle className="flex items-center gap-2 text-lg capitalize">
              {mode === "add" ? "Add Service" : mode === "edit" ? "Edit Service" : "View Service"}
            </DialogTitle>
      

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ── Left ── */}
              <div className="space-y-4">

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    <Type className="w-3.5 h-3.5 text-[#006caf]" /> Service Title *
                  </Label>
                  <Input
                    {...register("title")}
                    disabled={mode === "view"}
                    placeholder="Enter service title..."
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-[#006caf]" /> Category *
                  </Label>
                  <Select
                    disabled={mode === "view"}
                    onValueChange={(val) => setValue("serviceType", val ?? "")}
                    value={currentServiceType}
                  >
                    <SelectTrigger className="w-full rounded">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.documentId} value={type.documentId}>
                          {type.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceType && <p className="text-xs text-destructive">{errors.serviceType.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    <Info className="w-3.5 h-3.5 text-[#006caf]" /> Subtitle *
                  </Label>
                  <Input
                    {...register("subtitle")}
                    disabled={mode === "view"}
                    placeholder="Short summary line..."
                  />
                  {errors.subtitle && <p className="text-xs text-destructive">{errors.subtitle.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    <LinkIcon className="w-3.5 h-3.5 text-[#006caf]" /> Icon Image URL *
                  </Label>
                  <Input
                    {...register("imageUrl")}
                    disabled={mode === "view"}
                    placeholder="https://..."
                  />
                  {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
                </div>


              </div>

              {/* ── Right: Editor ── */}
              <div className="flex flex-col space-y-1.5 min-h-[420px]">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Type className="w-3.5 h-3.5 text-[#006caf]" /> Description *
                </Label>
                <div className="flex-1 rounded overflow-hidden  bg-white">
                  <Controller
                    name="description"
                    control={control}
                  
                    render={({ field }) => (
                      <Editor value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

            </div>
          </form>

          {/* ── Footer ── */}
          <DialogFooter className=" gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
                className="flex-1 sm:flex-none text-white bg-gradient-to-br from-[#006caf] to-[#005a94]"
              >
                {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {mode === "edit" ? "Update Service" : "Add Service"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}