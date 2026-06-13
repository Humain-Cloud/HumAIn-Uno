import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { DynamicLayout } from "@/components/layout/dynamic-layout";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Humain-Uno - AI Agent Marketplace",
  description: "Discover, build, and share AI agents. Explore 800+ curated agents across LangGraph, CrewAI, AutoGen, Agno, and LlamaIndex.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <Providers>
          <DynamicLayout>{children}</DynamicLayout>
        </Providers>
      </body>
    </html>
  );
}
