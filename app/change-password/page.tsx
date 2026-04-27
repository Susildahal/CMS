"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const pwValue = watch("password", "");

  const strength = [
    { label: "8+ chars", ok: pwValue.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(pwValue) },
    { label: "Number", ok: /[0-9]/.test(pwValue) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(pwValue) },
  ];

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setDone(true);
    toast.success("Password changed successfully!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold" style={{ color: "#006caf" }}>IT Company CMS</span>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">
              {done ? "Password Updated" : "Set New Password"}
            </CardTitle>
            <CardDescription>
              {done ? "Your password has been changed." : "Choose a strong password for your account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-6">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4"
                  style={{ background: "#006caf22" }}
                >
                  <CheckCircle2 className="h-8 w-8" style={{ color: "#006caf" }} />
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  You can now log in with your new password.
                </p>
                <Link href="/login">
                  <Button
                    className="w-full font-semibold text-white h-11"
                    style={{ background: "linear-gradient(135deg, #006caf, #005a94)" }}
                    id="go-to-login-btn"
                  >
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="change-password-form">
                {/* New password */}
                <div className="space-y-2">
                  <Label htmlFor="cp-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cp-password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle new password"
                      id="toggle-new-password-btn"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                  {/* Strength indicators */}
                  <div className="flex gap-2 flex-wrap mt-1">
                    {strength.map((s) => (
                      <span
                        key={s.label}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-all"
                        style={{
                          background: s.ok ? "#006caf22" : "#88888822",
                          color: s.ok ? "#006caf" : "#888",
                        }}
                      >
                        {s.ok ? "✓" : "○"} {s.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label htmlFor="cp-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cp-confirm"
                      type={showCPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCPw(!showCPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle confirm password"
                      id="toggle-confirm-password-btn"
                    >
                      {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  id="change-password-submit-btn"
                  disabled={isSubmitting}
                  className="w-full font-semibold text-white h-11"
                  style={{ background: "linear-gradient(135deg, #006caf, #005a94)" }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                  ) : "Update Password"}
                </Button>
              </form>
            )}

            {!done && (
              <div className="mt-6 flex justify-center">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  id="back-to-login-cp-link"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
