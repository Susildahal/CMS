"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Eye, Loader2, Save } from "lucide-react";
import Editor from "@/components/editor";

const schema = z.object({
  mission: z.string().min(20, "Mission must be at least 20 characters"),
  vision: z.string().min(20, "Vision must be at least 20 characters"),
  values: z.string().min(10, "Values required"),
  aboutUs: z.string().min(30, "About Us must be at least 30 characters"),
});
type FormData = z.infer<typeof schema>;

export default function MissionPage() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mission: "To empower businesses through innovative IT solutions that drive growth, efficiency, and digital transformation in a rapidly evolving technological landscape.",
      vision: "To be the most trusted IT partner for enterprises globally, recognized for our commitment to excellence, innovation, and sustainable technology practices.",
      values: "Integrity · Innovation · Excellence · Collaboration · Customer-first",
      aboutUs: "Founded in 2010, we are a leading IT services company specializing in custom software development, cloud solutions, and digital transformation. With a team of 150+ experts, we serve clients across 20+ countries.",
    },
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Mission & Vision saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6" style={{ color: "#006caf" }} /> Mission & Vision
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Edit your company's core purpose and strategic goals.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="mission-vision-form">
        <Tabs defaultValue="mission">
          <TabsList className="mb-4">
            <TabsTrigger value="mission" id="mission-tab">Mission</TabsTrigger>
            <TabsTrigger value="vision" id="vision-tab">Vision</TabsTrigger>
            <TabsTrigger value="values" id="values-tab">Values</TabsTrigger>
            <TabsTrigger value="about" id="about-tab">About Us</TabsTrigger>
          </TabsList>

          <TabsContent value="mission">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" style={{color:"#006caf"}} /> Our Mission</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Label>Mission Statement</Label>
                <Controller
                  name="mission"
                  control={control}
                  render={({ field }) => (
                    <Editor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Our mission is to..."
                    />
                  )}
                />
                {errors.mission && <p className="text-xs text-destructive">{errors.mission.message}</p>}
                <p className="text-xs text-muted-foreground">This appears on the About page hero section.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vision">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" style={{color:"#f9bb19"}} /> Our Vision</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Label>Vision Statement</Label>
                <Controller
                  name="vision"
                  control={control}
                  render={({ field }) => (
                    <Editor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Our vision is to..."
                    />
                  )}
                />
                {errors.vision && <p className="text-xs text-destructive">{errors.vision.message}</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values">
            <Card>
              <CardHeader><CardTitle className="text-base">Core Values</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Label>Values (separate with · or new lines)</Label>
                <Controller
                  name="values"
                  control={control}
                  render={({ field }) => (
                    <Editor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Integrity · Innovation..."
                    />
                  )}
                />
                {errors.values && <p className="text-xs text-destructive">{errors.values.message}</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader><CardTitle className="text-base">About Us</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Label>Company Description</Label>
                <Controller
                  name="aboutUs"
                  control={control}
                  render={({ field }) => (
                    <Editor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Founded in..."
                    />
                  )}
                />
                {errors.aboutUs && <p className="text-xs text-destructive">{errors.aboutUs.message}</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          type="submit"
          id="save-mission-btn"
          disabled={isSubmitting}
          className="text-white px-8"
          style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
        >
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
        </Button>
      </form>
    </div>
  );
}
