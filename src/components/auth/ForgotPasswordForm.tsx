"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Mail, ArrowLeft, Send } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const { resetPassword, isFirebaseConfigured } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        toast.success("Demo: Reset email sent successfully!");
        setIsSubmitted(true);
        return;
      }
      await resetPassword(data.email);
      toast.success("Password reset instructions sent to your email!");
      setIsSubmitted(true);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Check your email</h3>
        <p className="text-xs md:text-sm text-slate-600">
          We have sent password reset instructions to your email address.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline" className="w-full justify-center" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t("email")}
        type="email"
        placeholder="alex@hostel.edu"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register("email")}
      />

      <Button
        type="submit"
        className="w-full justify-center"
        isLoading={isLoading}
        leftIcon={<Send className="w-4 h-4" />}
      >
        {t("reset_password")}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </div>
    </form>
  );
}
