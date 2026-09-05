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
  Sparkles
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: typeof BookOpen;
}

const navItems: NavItem[] = [
  { name: "Journal", href: "/", icon: BookOpen },
  { name: "Tasks", href: "/tasks", icon: CheckCircle2 },
  { name: "Habits", href: "/habits", icon: Heart },
  { name: "Seasons", href: "/seasons", icon: Compass },
  { name: "Milestones", href: "/milestones", icon: Trophy },
  { name: "Growth", href: "/growth", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen shrink-0 border-r border-[#EAE5D8]/80 bg-[#F7F4EB] px-6 py-8 flex flex-col justify-between">
      <div>
        {/* Brand Logo */}
        <Link href="/" className="inline-block mb-12">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A241E] hover:opacity-90 transition-opacity">
            Rooted
          </h1>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-base font-medium transition-all duration-200 ${
                  isActive
                    ? "text-[#1A241E] font-semibold"
                    : "text-[#586B60] hover:text-[#1A241E] hover:bg-[#EFEBE1]/60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                    isActive
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-sm"
                      : "bg-[#2A3F34] text-[#FAF7F0] opacity-85 group-hover:opacity-100"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="tracking-normal">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Botanical Inspiration Badge */}
      <div className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#7C9A86] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#D98A6C]" />
          <span>Mindful Rhythm</span>
        </div>
        <p className="text-xs text-[#586B60] leading-relaxed">
          &ldquo;Small daily seeds yield towering groves over seasons.&rdquo;
        </p>
      </div>
    </aside>
  );
}
