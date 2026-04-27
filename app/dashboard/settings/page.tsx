"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Save, Loader2, Eye, EyeOff, Lock, Bell, Globe } from "lucide-react";

const pwSchema = z.object({
  currentPassword: z.string().min(6, "Current password required"),
  newPassword: z.string().min(8, "At least 8 characters").regex(/[A-Z]/, "Needs uppercase").regex(/[0-9]/, "Needs number"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type PwForm = z.infer<typeof pwSchema>;

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password changed successfully!");
    reset();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" style={{ color: "#006caf" }} /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      {/* Change Password */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" style={{ color: "#006caf" }} /> Change Password
          </CardTitle>
          <CardDescription>Update your account password. Use a strong password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="settings-password-form">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current Password</Label>
              <div className="relative">
                <Input id="current-pw" type={showCurrent ? "text" : "password"} {...register("currentPassword")} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" id="toggle-current-pw">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input id="new-pw" type={showNew ? "text" : "password"} {...register("newPassword")} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" id="toggle-new-pw">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input id="confirm-pw" type="password" {...register("confirmPassword")} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" id="save-password-btn" disabled={isSubmitting} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating...</> : <><Save className="h-4 w-4 mr-2" />Update Password</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" style={{ color: "#f9bb19" }} /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Email notifications for new messages", "Weekly content report", "Security alerts"].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-sm">{item}</span>
              <button
                id={`notif-toggle-${i}`}
                className="h-5 w-10 rounded-full transition-colors relative"
                style={{ background: i === 2 ? "#006caf" : "#e5e7eb" }}
                onClick={() => toast.info("Notification preference updated.")}
              >
                <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ left: i === 2 ? "22px" : "2px" }} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* General */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: "#006caf" }} /> General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" defaultValue="IT Company" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-url">Site URL</Label>
            <Input id="site-url" defaultValue="https://itcompany.com" />
          </div>
          <Button
            id="save-general-btn"
            onClick={() => toast.success("General settings saved!")}
            className="text-white"
            style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
          >
            <Save className="h-4 w-4 mr-2" /> Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
