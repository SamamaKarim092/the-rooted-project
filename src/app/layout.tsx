import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rooted — Mindful Productivity & Habit Growth",
  description: "A unified system linking daily intentions, habit streaks, calendar history, and long-term milestones.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#F7F4EB] text-[#1A241E] flex antialiased selection:bg-[#7C9A86]/20 selection:text-[#1E3127]">
        <Sidebar />
        <main className="flex-1 min-w-0 px-6 py-8 md:px-12 md:py-10 max-w-7xl overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
