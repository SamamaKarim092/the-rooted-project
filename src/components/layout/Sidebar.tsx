"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Heart,
  Compass,
  Trophy,
  TrendingUp,
  NotebookPen,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { RootedLogo, RootedWordmark } from "@/components/brand/RootedBrand";

interface NavItem {
  name: string;
  href: string;
  icon: typeof BookOpen;
}

const navItems: NavItem[] = [
  { name: "Journal", href: "/", icon: BookOpen },
  { name: "Tasks", href: "/tasks", icon: CheckCircle2 },
  { name: "Habits", href: "/habits", icon: Heart },
  { name: "Notes", href: "/notes", icon: NotebookPen },
  { name: "Seasons", href: "/seasons", icon: Compass },
  { name: "Milestones", href: "/milestones", icon: Trophy },
  { name: "Growth", href: "/growth", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded, signOut } = useAuth();

  return (
    <aside className="w-68 sm:w-[17.5rem] h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-[#EAE5D8]/80 bg-[#F7F4EB] px-5 py-6 sm:px-6 sm:py-7 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div>
        {/* Brand Logo & Wordmark Vectors */}
        <Link href="/" className="flex items-center gap-2.5 mb-6 sm:mb-8 group select-none">
          <RootedLogo
            variant="dark"
            className="h-10 w-auto shrink-0 group-hover:scale-105 transition-transform duration-200"
          />
          <RootedWordmark
            variant="dark"
            className="h-6 w-auto shrink-0 group-hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[16px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-[#1A241E] font-semibold"
                    : "text-[#586B60] hover:text-[#1A241E] hover:bg-[#EFEBE1]/60"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0 ${
                    isActive
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-sm"
                      : "bg-[#2A3F34] text-[#FAF7F0] opacity-85 group-hover:opacity-100"
                  }`}
                >
                  <Icon className="w-5.5 h-5.5 stroke-[2]" />
                </div>
                <span className="tracking-normal">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 mt-auto space-y-2.5 border-t border-[#EAE5D8]/80">
        {/* Settings Link — Above "My Sanctuary" */}
        <Link
          href="/settings"
          className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[16px] font-medium transition-all duration-200 ${
            pathname === "/settings"
              ? "text-[#1A241E] font-semibold"
              : "text-[#586B60] hover:text-[#1A241E] hover:bg-[#EFEBE1]/60"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0 ${
              pathname === "/settings"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-sm"
                : "bg-[#2A3F34] text-[#FAF7F0] opacity-85 group-hover:opacity-100"
            }`}
          >
            <Settings className="w-5.5 h-5.5 stroke-[2]" />
          </div>
          <span className="tracking-normal">Settings</span>
        </Link>

        {/* User Profile & Auth Section — "My Sanctuary" */}
        {isLoaded && isSignedIn && (
          <div className="p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 rounded-xl border border-[#7C9A86]/40",
                  },
                }}
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#1A241E] block truncate">
                  My Sanctuary
                </span>
                <span className="text-[10px] text-[#7C9A86] font-medium block">
                  Connected
                </span>
              </div>
            </div>
          </div>
        )}

        {isLoaded && !isSignedIn && (
          <Link
            href="/sign-in"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-all shadow-2xs"
          >
            <span>Sign In</span>
          </Link>
        )}

        {/* Bottom Botanical Inspiration Badge */}
        <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7C9A86] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D98A6C]" />
            <span>Mindful Rhythm</span>
          </div>
          <p className="text-[11px] text-[#586B60] leading-relaxed">
            &ldquo;Small daily seeds yield towering groves over seasons.&rdquo;
          </p>
        </div>

        {/* Logout Button — Below "Mindful Rhythm" quote */}
        {isLoaded && isSignedIn && (
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F9ECE6] hover:bg-[#F2DCD0] border border-[#D98A6C]/25 text-[#C87452] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
