import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { HostelProvider } from "@/context/hostel-context";
import { LanguageProvider } from "@/context/language-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HostelMaster — Modern Mess & Hostel Management SaaS",
  description:
    "Production-ready student hostel and mess management system with meal calculations, deposit tracking, bazaar schedules, and multi-tenant security.",
  keywords: "hostel management, mess manager, meal calculation, student residence, student hostel bdt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <HostelProvider>
              {children}
              <Toaster position="top-right" richColors />
            </HostelProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
