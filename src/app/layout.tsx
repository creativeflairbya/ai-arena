import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: "AI Studio - Professional AI Image & Video Generation",
  description: "Create stunning images and videos with AI. Powered by the latest models like Veo, Kling, and more.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
