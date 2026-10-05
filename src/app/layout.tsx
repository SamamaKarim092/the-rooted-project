import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "The Rooted Project — Mindful Productivity & Habit Growth",
  description: "A unified system linking daily intentions, habit streaks, calendar history, and long-term milestones.",
};

import { auth } from "@clerk/nextjs/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1E3127",
          colorBackground: "#FAF7F0",
          colorForeground: "#1A241E",
          colorMutedForeground: "#586B60",
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable}`}>
        <body className="min-h-screen bg-[#F7F4EB] text-[#1A241E] antialiased selection:bg-[#7C9A86]/20 selection:text-[#1E3127]">
          <AppShell initialSignedIn={isSignedIn}>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}

