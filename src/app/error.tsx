"use client";

import { useEffect } from "react";
import { RefreshCw, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { RootedLogo, RootedWordmark } from "@/components/brand/RootedBrand";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostics
    console.error("Rooted Sanctuary Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-[#1A241E] select-none">
      <div className="w-full max-w-md bg-white border border-[#EAE5D8] rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Emblem */}
        <div className="flex items-center gap-2.5">
          <RootedLogo variant="dark" className="h-10 w-auto" />
          <RootedWordmark variant="dark" className="h-6 w-auto" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A241E]">
            A Momentary Pause
          </h2>
          <p className="text-sm text-[#586B60] font-sans leading-relaxed">
            The sanctuary encountered an unexpected tremor while grounding your space. Take a slow breath and try again.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <p className="text-xs text-[#C87452] bg-[#F9ECE6] p-2.5 rounded-xl font-mono text-left break-all mt-3">
              {error.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1E3127] text-[#FAF7F0] text-sm font-semibold hover:bg-[#2A3F34] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#EFEAE0] hover:bg-[#E5DFD3] text-[#1A241E] text-sm font-semibold transition-all border border-[#E4DDD0] shadow-2xs"
          >
            <Home className="w-4 h-4" />
            <span>Sanctuary</span>
          </Link>
        </div>

        {/* Bottom Mantra */}
        <p className="text-[11px] text-[#7C9A86] flex items-center gap-1.5 pt-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D98A6C]" />
          <span>Rest, recalibrate, and regrow.</span>
        </p>
      </div>
    </div>
  );
}
