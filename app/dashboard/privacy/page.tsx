"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { ShieldCheck, Save, Loader2, Clock } from "lucide-react";
import Editor from "@/components/editor";
import { useState } from "react";

const schema = z.object({
  content: z.string().min(100, "Privacy Policy must be at least 100 characters"),
});
type FormData = z.infer<typeof schema>;

const DEFAULT = `PRIVACY POLICY

Last updated: November 20, 2024

1. INFORMATION WE COLLECT
We collect information you directly provide to us, such as when you fill out a contact form, request a demo, or communicate with us via email. This may include your name, email address, phone number, and company details.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Respond to your inquiries and provide customer support
- Send you technical notices, updates, and administrative messages
- Improve our services and website functionality
- Comply with legal obligations

3. INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except as described in this policy. We may share information with trusted third parties who assist us in operating our website, conducting our business, or serving you.

4. DATA SECURITY
We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights.

5. COOKIES
We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction.

6. THIRD-PARTY LINKS
Occasionally, at our discretion, we may include or offer third-party products or services on our website. These third-party sites have separate and independent privacy policies.

7. YOUR RIGHTS
You have the right to access, correct, or delete any personal data we hold about you. To exercise these rights, contact us at privacy@itcompany.com.

8. CHANGES TO THIS POLICY
We reserve the right to update this privacy policy at any time. Changes will be posted on this page with an updated revision date.

9. CONTACT US
If you have questions about this Privacy Policy, contact us at: privacy@itcompany.com`;

export default function PrivacyPage() {
  const [content, setContent] = useState(DEFAULT);
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { content: DEFAULT },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Privacy Policy saved!");
  };

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
