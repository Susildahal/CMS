"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Save, Loader2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import Editor from "@/components/editor";
import axios from "axios";
const schema = z.object({
  content: z.string().min(100, "Terms & Conditions must be at least 100 characters"),
});
type FormData = z.infer<typeof schema>;

const DEFAULT = `TERMS AND CONDITIONS

Last updated: November 20, 2024

1. ACCEPTANCE OF TERMS
By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.

2. USE LICENSE
Permission is granted to temporarily download one copy of the materials on IT Company's website for personal, non-commercial transitory viewing only.

3. DISCLAIMER
The materials on IT Company's website are provided on an 'as is' basis. IT Company makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. LIMITATIONS
In no event shall IT Company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on IT Company's website.

5. REVISIONS AND ERRATA
The materials appearing on IT Company's website could include technical, typographical, or photographic errors. IT Company does not warrant that any of the materials on its website are accurate, complete or current.

6. LINKS
IT Company has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.

7. GOVERNING LAW
These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.

8. CONTACT US
If you have any questions about these Terms, please contact us at legal@itcompany.com.`;

export default function TermsPage() {
  const [content, setContent] = useState(DEFAULT);
  const [loadedContent, setLoadedContent] = useState(DEFAULT);
  const { handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { content: DEFAULT },
  });

  const isDirty = content !== loadedContent;

  const onSubmit = async () => {
    try {
      await axios.patch("/api/settings", { terms: content });
      setLoadedContent(content);
      toast.success("Terms & Conditions saved!");
    } catch (error) {
      console.error("Error saving terms:", error);
      toast.error("Failed to save terms");
    }
  };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get("/api/settings");
        const terms = response.data?.data?.terms;
        if (typeof terms === "string" && terms.length > 0) {
          setContent(terms);
          setLoadedContent(terms);
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
      }
    };

    fetchTerms();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" style={{ color: "#006caf" }} /> Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Last updated: November 20, 2024
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="terms-form">
        <Card className="border-border">
          <CardContent>
            <div className="space-y-2">
              <Editor
                value={content}
                onChange={setContent}
                placeholder=" enter terms and conditions..."
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            id="save-terms-btn"
            disabled={isSubmitting}
            className="text-white px-8"
            style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
          >
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Terms</>}
          </Button>
          {isDirty && <p className="text-xs text-muted-foreground self-center">· Unsaved changes</p>}
        </div>
      </form>
    </div>
  );
}
