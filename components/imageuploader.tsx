"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, CloudUpload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
  onUpload?: (files: File[]) => void;
  showPreview?: boolean;
  className?: string;
  maxFiles?: number;
  uploadToServer?: boolean;
}

export default function ImageUploader({
  onUpload,
  showPreview = true,
  className,
  maxFiles = 1,
  uploadToServer,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Create preview URLs
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      // For a single uploader, we replace the previous file
      setFiles(newFiles);
      onUpload?.(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles,
    multiple: maxFiles > 1,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the dropzone click
    setFiles([]);
    onUpload?.([]);
  };

  void uploadToServer;

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all overflow-hidden cursor-pointer",
          isDragActive
            ? "border-[#006caf] bg-[#006caf]/5"
            : "border-muted-foreground/25 hover:border-[#f9bb19]/50 bg-muted/5"
        )}
      >
        <input {...getInputProps()} />

        {showPreview && files.length > 0 ? (
          /* Internal Preview Logic */
          <div className="relative w-full h-full group">
            <Image
              src={files[0].preview}
              alt="Preview"
              fill
              className="object-cover"
              onLoad={() => URL.revokeObjectURL(files[0].preview)}
            />
            
            {/* Overlay on hover to show "Change Image" */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex flex-col items-center text-white">
                <ImageIcon className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Click to replace</p>
              </div>
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
              onClick={removeFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          /* Empty State / Upload Prompt */
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <CloudUpload className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm text-foreground font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG or WebP (max. {maxFiles} file)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}