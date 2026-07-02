import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { ensureMasterAccount } from "@/lib/bootstrap";

export const metadata: Metadata = {
  title: "Arena.ai — Unlimited AI Video, Image & Creative Studio",
  description:
    "Generate cinematic videos, 4K images and animations with Veo, Seedance, Kling and our in-house models. No API keys needed. Free tier available.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Bootstrap the master account on first render. This is idempotent.
  try {
    await ensureMasterAccount();
  } catch (e) {
    // Avoid breaking the page if DB isn't ready during build
    console.error("Bootstrap error:", e);
  }
  const user = await getCurrentUser();

  const safeUser = user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
        isUnlimited: user.isUnlimited,
        avatarColor: user.avatarColor,
      }
    : null;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header user={safeUser} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
