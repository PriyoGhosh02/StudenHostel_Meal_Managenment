"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { HostelService } from "@/lib/services/hostel.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";
import { Building2, ArrowLeft, PlusCircle, CheckCircle2 } from "lucide-react";
import { HostelCurrency } from "@/types/hostel";

const createHostelSchema = z.object({
  name: z.string().min(3, "Hostel name must be at least 3 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  currency: z.enum(["BDT", "INR", "USD"]),
  roomNumber: z.string().optional(),
  studentId: z.string().optional(),
  university: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

type CreateHostelFormData = z.infer<typeof createHostelSchema>;

export default function CreateHostelPage() {
  const router = useRouter();
  const { user, profile, isFirebaseConfigured, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ code: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHostelFormData>({
    resolver: zodResolver(createHostelSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      currency: "BDT",
      roomNumber: "",
      studentId: "",
      university: "",
      department: "",
      phone: profile?.phone || "",
    },
  });

  const onSubmit = async (data: CreateHostelFormData) => {
    if (!user && isFirebaseConfigured) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      if (!isFirebaseConfigured) {
        setCreatedResult({
          code: "HST-DEMO1",
          name: data.name,
        });
        toast.success("Demo: Hostel created successfully!");
        return;
      }

      const { hostel } = await HostelService.createHostel({
        name: data.name,
        ownerId: user!.uid,
        address: data.address,
        city: data.city,
        currency: data.currency as HostelCurrency,
        ownerDetails: {
          phone: data.phone,
          roomNumber: data.roomNumber,
          studentId: data.studentId,
          university: data.university,
          department: data.department,
        },
      });

      await refreshProfile();
      setCreatedResult({
        code: hostel.code,
        name: hostel.name,
      });
      toast.success("Hostel created successfully!");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create hostel. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to choices
        </Link>

        {createdResult ? (
          <Card className="text-center p-8 border-emerald-200 bg-white shadow-lg animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Hostel Created Successfully!</h2>
            <p className="text-sm text-slate-600 mt-2">
              <strong>{createdResult.name}</strong> is now live with its first active month initialized.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 max-w-xs mx-auto">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Hostel Share Code
              </p>
              <p className="text-2xl font-mono font-extrabold text-blue-600 tracking-wider">
                {createdResult.code}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Share this code with your hostel members to join.</p>
            </div>

            <Button
              className="w-full justify-center"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <Card className="shadow-sm border-slate-200/80 bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">{t("create_hostel")}</CardTitle>
                  <CardDescription>Configure your hostel profile and initial settings</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4 border-b border-slate-100 pb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Hostel Details
                  </h4>
                  <Input
                    label={t("hostel_name")}
                    placeholder="e.g. Green Valley Mess"
                    error={errors.name?.message}
                    {...register("name")}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City / Area"
                      placeholder="e.g. Dhaka, Dhanmondi"
                      {...register("city")}
                    />
                    <Select
                      label="Currency"
                      {...register("currency")}
                      options={[
                        { value: "BDT", label: "BDT (৳) - Bangladeshi Taka" },
                        { value: "INR", label: "INR (₹) - Indian Rupee" },
                        { value: "USD", label: "USD ($) - US Dollar" },
                      ]}
                    />
                  </div>

                  <Input
                    label="Full Address (Optional)"
                    placeholder="House 12, Road 4, Sector 7"
                    {...register("address")}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Your Owner Profile Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Room Number"
                      placeholder="e.g. 401"
                      {...register("roomNumber")}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="+880 1700-000000"
                      {...register("phone")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="University / Institution"
                      placeholder="e.g. University of Dhaka"
                      {...register("university")}
                    />
                    <Input
                      label="Department / Batch"
                      placeholder="e.g. CSE 21st Batch"
                      {...register("department")}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full justify-center mt-6"
                  isLoading={isLoading}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Hostel & Initialize First Month
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
