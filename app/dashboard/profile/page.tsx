"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Save, Loader2, Mail, Shield } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Profile updated!");
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "AD";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" style={{ color: "#006caf" }} /> My Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal account information.</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl font-bold text-white" style={{ background: "linear-gradient(135deg,#006caf,#004d8c)" }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-bold">{user?.name}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Shield className="h-3.5 w-3.5" style={{ color: "#006caf" }} />
                <span className="text-xs capitalize font-medium" style={{ color: "#006caf" }}>{user?.role}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-4"><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="profile-form">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="profile-email" className="pl-10" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Separator />
            <div className="pt-2">
              <Button
                type="submit"
                id="save-profile-btn"
                disabled={isSubmitting}
                className="text-white"
                style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}
              >
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Profile</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
