"use client";

import React, { useState } from "react";
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
import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isFirebaseConfigured, setDemoUser } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setDemoUser();
        toast.info("Account created in Demo Mode");
        router.push("/onboarding");
        return;
      }
      await registerUser(data.email, data.password, data.name);
      toast.success("Account created successfully!");
      router.push("/onboarding");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label={t("name")}
          type="text"
          placeholder="Alex Rahman"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label={t("email")}
          type="email"
          placeholder="alex@hostel.edu"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label={t("phone")}
          type="tel"
          placeholder="+880 1700-000000"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label={t("password")}
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          className="w-full justify-center mt-2"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          {t("register")}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      <GoogleButton />
    </div>
  );
}
