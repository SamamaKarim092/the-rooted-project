"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar overlay is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (isAuthPage) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Desktop Sidebar — sticky top-0 h-screen, visible on md+ across zoom levels */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className="relative w-72 max-w-[85vw] h-full animate-slide-in">
            <Sidebar />
            {/* Close button overlaid on top-right corner of sidebar */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1E3127] text-[#FAF7F0] flex items-center justify-center hover:bg-[#2A3F34] transition-colors cursor-pointer z-10"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full overflow-x-hidden overflow-y-auto">
        {/* Mobile Top Bar with hamburger — only visible on mobile (< md) */}
        <div className="sticky top-0 z-40 md:hidden flex items-center gap-3 px-4 py-3 bg-[#F7F4EB]/95 backdrop-blur-sm border-b border-[#EAE5D8]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl bg-[#1E3127] text-[#FAF7F0] flex items-center justify-center hover:bg-[#2A3F34] transition-colors cursor-pointer shadow-sm"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-xl font-bold tracking-tight text-[#1A241E]">
            Rooted
          </h1>
        </div>

        {/* Page Content — Fluid, Responsive, Centered */}
        <div className="w-full max-w-[1600px] mx-auto min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 xl:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
