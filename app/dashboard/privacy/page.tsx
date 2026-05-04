"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { ShieldCheck, Save, Loader2, Clock } from "lucide-react";
import Editor from "@/components/editor";
import { useEffect, useState } from "react";
import axios from "axios";

const schema = z.object({
  content: z.string().min(100, "Privacy Policy must be at least 100 characters"),
});
type FormData = z.infer<typeof schema>;


export default function Page() {
  const [content, setContent] = useState<string>("");
  const [loadedContent, setLoadedContent] = useState<string>("");
  const { handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { content: "" },
  });

  const isDirty = content !== loadedContent;

  const onSubmit = async () => {
    try {
      await axios.patch("/api/settings", { privacy: content });
      setLoadedContent(content);
      toast.success("Privacy Policy saved!");
    } catch (error) {
      console.error("Error saving privacy policy:", error);
      toast.error("Failed to save privacy policy");
    }
  };

  const privacydata = async()=>{
    try {
      const response = await axios.get("/api/settings");
      const privacy = response.data?.data?.privacy ?? "";
      setContent(privacy);
      setLoadedContent(privacy);
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
    }

  }

  useEffect(() => {
    privacydata();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" style={{ color: "#006caf" }} /> Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Last updated: November 20, 2024
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="privacy-form">
        <Card className="border-border">
          <CardContent>
            <div className="space-y-2">
              <Editor
               value={content}
              onChange={setContent}
              placeholder=" enter a privacy policy..."
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button
            type="submit"
            id="save-privacy-btn"
            disabled={isSubmitting}
            className="text-white px-8"
            style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
          >
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Policy</>}
          </Button>
          {isDirty && <p className="text-xs text-muted-foreground self-center">· Unsaved changes</p>}
        </div>
      </form>
    </div>
  );
}
