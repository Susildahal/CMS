"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ImageIcon, Plus, Loader2, Upload, FileImage, X, CheckCircle2, ChevronLeft, ChevronRight, Image
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PhotoAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHOTO_TYPES = ["Hero", "Banner", "Gallery", "About", "Team"] as const;
const MAX_PHOTOS = 100;

const schema = z.object({
  imageType: z.enum(PHOTO_TYPES),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().min(1, "Please upload a photo"),
});

type FormData = z.infer<typeof schema>;

interface ImageMeta {
  width: number;
  height: number;
  size: number;
  name: string;
  type: string;
}

interface ExtendedPhotoAsset extends PhotoAsset {
  meta?: ImageMeta;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function simulateUpload(
  onProgress: (pct: number) => void,
  onComplete: () => void
) {
  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 14 + 5;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      onProgress(100);
      setTimeout(onComplete, 400);
    } else {
      onProgress(Math.round(pct));
    }
  }, 80);
  return () => clearInterval(interval);
}

export default function Page() {
  const [photos, setPhotos] = useState<ExtendedPhotoAsset[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExtendedPhotoAsset | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">("idle");
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const cancelUploadRef = useRef<(() => void) | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { imageType: "Hero", description: "", imageUrl: "" },
  });

  const currentType = watch("imageType");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Cancel any ongoing upload
      cancelUploadRef.current?.();

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result ?? "");
        const img = new window.Image();
        img.onload = () => {
          const meta: ImageMeta = {
            width: img.width,
            height: img.height,
            size: file.size,
            name: file.name,
            type: file.type,
          };

          setPreviewUrl(dataUrl);
          setImageMeta(meta);
          setValue("imageUrl", dataUrl, { shouldValidate: true });

          // Start simulated upload
          setUploadProgress(0);
          setUploadState("uploading");

          const cancel = simulateUpload(
            (pct) => setUploadProgress(pct),
            () => setUploadState("done")
          );
          cancelUploadRef.current = cancel;
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const openNew = () => {
    setEditing(null);
    setPreviewUrl("");
    setImageMeta(null);
    setUploadProgress(0);
    setUploadState("idle");
    reset({ imageType: "Hero", description: "", imageUrl: "" });
    setOpen(true);
  };

  const openEdit = (photo: ExtendedPhotoAsset) => {
    setEditing(photo);
    setPreviewUrl(photo.imageUrl);
    setImageMeta(photo.meta ?? null);
    setUploadProgress(0);
    setUploadState(photo.imageUrl ? "done" : "idle");
    reset({
      imageType: photo.imageType,
      description: photo.description,
      imageUrl: photo.imageUrl,
    });
    setOpen(true);
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Photo removed.");
  };

  const openPhotoCarousel = (photoId: string) => {
    const index = photos.findIndex((p) => p.id === photoId);
    if (index !== -1) {
      setCurrentPhotoIndex(index);
      setCarouselOpen(true);
    }
  };

  const goToPrevious = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const currentCarouselPhoto = photos[currentPhotoIndex] || null;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await new Promise((r) => setTimeout(r, 600));

    const nextPhoto: ExtendedPhotoAsset = {
      id: editing?.id ?? Date.now().toString(),
      imageType: data.imageType,
      description: data.description,
      imageUrl: data.imageUrl,
      uploadedAt: editing?.uploadedAt ?? new Date().toLocaleDateString(),
      meta: imageMeta ?? editing?.meta,
    };

    setPhotos((prev) =>
      editing
        ? prev.map((p) => (p.id === editing.id ? nextPhoto : p))
        : [...prev, nextPhoto]
    );
    toast.success(editing ? "Changes saved!" : "Photo published!");
    setOpen(false);
  };

  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <div className="mx-auto space-y-8 ">
      {/* Header */}
      <div className="flex items-end justify-between ">
        <div className=" flex items-center justify-center gap-2 ">
            <div>
                <Image className="h-6 w-6" style={{ color: "#006caf" }} />

            </div>
            <div className=" flex flex-col">

          <h1 className="text-xl font-bold tracking-tight">Media Assets</h1>
          <p className="text-[10px] text-muted-foreground">
            Manage your high-resolution brand imagery.{" "}
            <span className="text-[10px] font-medium">
              {photos.length}/{MAX_PHOTOS} photos
            </span>
          </p>
          </div>
        </div>
        {canAddMore && (
          <Button onClick={openNew} className="bg-primary hover:bg-primary/90 shadow-lg">
            <Plus className="h-4 w-4 mr-2" /> Upload Photo
          </Button>
        )}
      </div>

      {/* Empty State */}
      {photos.length === 0 && (
        <div
          onClick={openNew}
          className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-20 flex flex-col items-center justify-center bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer group"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium">No assets found</h2>
          <p className="text-muted-foreground mt-1">Click or drag an image here to get started.</p>
        </div>
      )}

      {/* Gallery Grid — 5 images in a row */}
      {photos.length > 0 && (
        <TooltipProvider>
          <div className="grid grid-cols-5 gap-3">
            {photos.map((photo) => (
              <Tooltip key={photo.id}>
                <TooltipTrigger>
                  <div
                    onClick={() => openPhotoCarousel(photo.id)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-muted-foreground/30 transition-all group"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.description}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Type badge */}
                    <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-md border-none text-[10px] px-2 py-0.5">
                      {photo.imageType}
                    </Badge>
                    {/* Image size overlay */}
                    {photo.meta && (
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] text-white bg-black/60 backdrop-blur-md rounded px-1.5 py-0.5 font-mono">
                          {photo.meta.width}×{photo.meta.height}
                        </span>
                      </div>
                    )}
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-sm">{photo.imageType}</p>
                    <p className="text-xs leading-relaxed">{photo.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Add more slot */}
            {canAddMore && (
              <div
                onClick={openNew}
                className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors gap-1 group"
              >
                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] text-muted-foreground">Add photo</span>
              </div>
            )}
          </div>
        </TooltipProvider>
      )}

      {/* Upload / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-muted/30 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileImage className="h-5 w-5 text-primary" />
              {editing ? "Edit Asset Details" : "Upload New Asset"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Drag & Drop + Progress */}
              <div className="space-y-3">
                <Label>Image Upload</Label>

                <div
                  {...getRootProps()}
                  className={cn(
                    "relative aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/20 hover:border-primary/50",
                    previewUrl && "border-none"
                  )}
                >
                  <input {...getInputProps()} />
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        className="h-full w-full object-cover"
                        alt="Preview"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-medium bg-primary px-3 py-1.5 rounded-full">
                          Change Image
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="h-10 w-10  mx-auto mb-2  text-[#006caf]" />
                      <p className="text-xs font-medium">Drop image here</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Progress Bar */}
                {uploadState === "uploading" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading...
                      </span>
                      <span className="text-xs font-mono font-medium text-primary">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}

                {uploadState === "done" && imageMeta && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Upload complete
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 font-mono text-muted-foreground">
                        {imageMeta.width} × {imageMeta.height}px
                      </span>
                      <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                        {formatBytes(imageMeta.size)}
                      </span>
                      <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground uppercase">
                        {imageMeta.type.replace("image/", "")}
                      </span>
                    </div>
                  </div>
                )}

                {errors.imageUrl && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.imageUrl.message}
                  </p>
                )}
              </div>

              {/* Right: Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageType">Placement Type</Label>
                  <Select
                    value={currentType}
                    onValueChange={(val) =>
                      setValue("imageType", val as (typeof PHOTO_TYPES)[number], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHOTO_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Caption / Description</Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Describe the context of this image..."
                    className="min-h-[233px] resize-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadState === "uploading"}
                className="flex-1 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  editing ? "Save Changes" : "Publish Asset"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Carousel Modal */}
      <Dialog open={carouselOpen} onOpenChange={setCarouselOpen}>
        <DialogContent className=" [&>button]:hidden max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-black">
          <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center bg-black group">
            {currentCarouselPhoto && (
              <>
                <img
                  src={currentCarouselPhoto.imageUrl}
                  alt={currentCarouselPhoto.description}
                  className="max-h-full max-w-full object-contain"
                />

                {/* Previous Button */}
                <button
                  onClick={goToPrevious}
                  className="absolute  cursor-pointer left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>

                {/* Next Button */}
                <button
                  onClick={goToNext}
                  className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>

                {/* Close button */}
                <button
                  onClick={() => setCarouselOpen(false)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full cursor-pointer bg-red-500/80 backdrop-blur-md hover:bg-red-600 flex items-center justify-center transition-all"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-semibold">{currentCarouselPhoto.imageType}</p>
                  <p className="text-white/80 text-sm mt-1">{currentCarouselPhoto.description}</p>
                  <p className="text-white/60 text-xs mt-2">{currentPhotoIndex + 1} / {photos.length}</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}