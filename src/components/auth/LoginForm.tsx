"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "./GoogleButton";
import { toast } from "sonner";
import { Mail, Lock, LogIn } from "lucide-react";
import { UserService } from "@/lib/services/user.service";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isFirebaseConfigured, setDemoUser } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setDemoUser();
        toast.info("Logged in as Demo User");
        router.push("/dashboard");
        return;
      }

      // Login and get Firebase user
      const firebaseUser = await login(data.email, data.password);

      // Fetch Firestore profile to check if user already belongs to a hostel
      const userProfile = await UserService.getUserProfile(firebaseUser.uid);

      if (userProfile?.activeHostelId) {
        toast.success(`Welcome back, ${userProfile.name || "Member"}!`);
        router.push("/dashboard");
      } else {
        toast.success("Login successful! Let's set up your hostel.");
        router.push("/onboarding");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-dark-form space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t("email")}
          type="email"
          placeholder="alex@hostel.edu"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("password")}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              {t("forgot_password")}
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          {t("login")}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span style={{ background: "transparent", padding: "0 0.5rem", color: "#64748B", fontSize: "0.75rem", fontWeight: 500 }}>Or continue with</span>
        </div>
      </div>

      <GoogleButton />
    </div>
  );
}
