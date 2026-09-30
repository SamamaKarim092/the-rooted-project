import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F0] text-[#1A241E]">
      <div className="text-center mb-8 space-y-2">
        <Link href="/" className="inline-block">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1A241E] hover:opacity-90 transition-opacity">
            Rooted
          </h1>
        </Link>
        <p className="text-sm text-[#586B60] flex items-center justify-center gap-1.5 font-sans">
          <Sparkles className="w-3.5 h-3.5 text-[#D98A6C]" />
          <span>Begin your journey into conscious daily rhythms.</span>
        </p>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <SignUp
          appearance={{
            elements: {
              card: "bg-[#FFFFFF] border border-[#EAE5D8] shadow-md rounded-3xl p-6 md:p-8",
              headerTitle: "font-serif text-2xl font-bold text-[#1A241E]",
              headerSubtitle: "text-xs text-[#586B60]",
              formButtonPrimary:
                "bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] text-sm font-semibold rounded-xl py-2.5 transition-all shadow-xs",
              formFieldInput:
                "rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-sm text-[#1A241E] focus:ring-2 focus:ring-[#7C9A86]",
              footerActionLink: "text-[#7C9A86] hover:text-[#1E3127] font-semibold",
            },
          }}
        />
      </div>
    </div>
  );
}
