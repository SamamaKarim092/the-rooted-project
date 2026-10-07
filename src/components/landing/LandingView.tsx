"use client";

import Link from "next/link";
import type { User } from "@clerk/nextjs/server";
import { ArrowUpRight, ArrowRight, Quote, Check, Sparkles } from "lucide-react";
import { useLandingAnimations } from "./useLandingAnimations";
import { RootedLogo, RootedWordmark } from "@/components/brand/RootedBrand";

interface LandingViewProps {
  user?: User | null;
}

export function LandingView({ user }: LandingViewProps) {
  const { containerRef } = useLandingAnimations();
  const destination = user ? "/" : "/sign-up";
  const ctaLabel = user ? "Enter Sanctuary" : "Begin Journey";

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#FAF7F0] text-[#1A241E] selection:bg-[#7C9A86]/30 selection:text-[#1E3127]"
    >
      {/* ============================================================= */}
      {/* 1. CINEMATIC VIDEO HERO (Preserved & Enhanced)                */}
      {/* ============================================================= */}
      <header id="top" className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0A1118] text-white">
        {/* Fullscreen Looping Background Video */}
        <div className="absolute inset-0 z-0 pointer-events-none" data-parallax="0.12">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 opacity-85"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          />
        </div>

        {/* Floating Translucent Ambient Forms */}
        <div className="absolute inset-0 pointer-events-none z-[1]" data-parallax="0.25">
          <div className="drift-a absolute top-[12%] left-[8%] w-44 h-44 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/15 shadow-[inset_0_0_50px_rgba(255,255,255,0.15)]" />
          <div className="drift-b absolute top-[28%] right-[10%] w-32 h-32 sm:w-48 sm:h-48 rounded-[40%] bg-gradient-to-tl from-[#7C9A86]/25 to-white/10 backdrop-blur-md border border-white/15 shadow-[inset_0_0_40px_rgba(124,154,134,0.25)]" />
          <div className="drift-c absolute top-[56%] left-[36%] w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-white/15 to-transparent backdrop-blur-[2px] border border-white/20" />
        </div>

        {/* Readability Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1118] via-black/30 to-black/50 z-[2]" />

        {/* Glassmorphic Navigation Bar */}
        <div className="relative z-10 w-full">
          <nav className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full">
            {/* Logo: Rooted Plant Vector directly before Rooted Wordmark in pure white */}
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group select-none"
            >
              <RootedLogo
                variant="white"
                className="h-10 sm:h-11 w-auto shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
              <RootedWordmark
                variant="white"
                className="h-5 sm:h-6 w-auto shrink-0"
              />
            </Link>

            {/* In-page Anchor Links */}
            <div className="hidden md:flex items-center gap-7 text-sm">
              <a href="#practice" className="text-neutral-300 hover:text-white transition-colors">
                Practice
              </a>
              <a href="#method" className="text-neutral-300 hover:text-white transition-colors">
                Method
              </a>
              <a href="#capabilities" className="text-neutral-300 hover:text-white transition-colors">
                Capabilities
              </a>
              <a href="#reflection" className="text-neutral-300 hover:text-white transition-colors">
                Philosophy
              </a>
            </div>

            {/* Navigation CTA Button */}
            <div className="flex items-center gap-3">
              {!user && (
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex text-xs font-medium text-neutral-300 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
              )}
              <Link
                href={destination}
                className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-all duration-300 font-medium cursor-pointer shadow-sm"
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>
        </div>

        {/* Hero Headline Section */}
        <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 sm:pt-24 pb-28 sm:pb-32 max-w-7xl mx-auto my-auto w-full">
          <p className="text-xs uppercase tracking-[0.25em] text-[#A3BEAD] font-medium mb-6">
            Mindful Productivity & Habit Architecture
          </p>
          <h1
            className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.92] tracking-[-2.5px] max-w-5xl font-normal text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where <em className="not-italic text-neutral-400 font-normal">dreams</em> rise{" "}
            <em className="not-italic text-neutral-400 font-normal">through the silence.</em>
          </h1>

          <p className="animate-fade-rise-delay text-neutral-300/90 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed font-sans">
            We build digital spaces for deep thinkers, bold creators, and quiet rebels.
            Weave your daily intentions into lasting life milestones without overwhelm.
          </p>

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link
              href={destination}
              className="animate-fade-rise-delay-2 liquid-glass rounded-full px-10 sm:px-12 py-4 text-base sm:text-lg text-white hover:scale-[1.03] transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2 font-medium shadow-lg"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#practice"
              className="text-xs tracking-wider uppercase text-white/60 hover:text-white transition-colors border-b border-white/20 pb-0.5"
            >
              Explore the Sanctuary ↓
            </a>
          </div>
        </section>

        {/* Giant Cropped Wordmark */}
        <div className="relative w-full z-[5] pointer-events-none overflow-hidden pb-4 flex justify-center" data-parallax="0.2">
          <RootedWordmark variant="white" className="w-[85vw] max-w-6xl h-auto opacity-5 select-none" />
        </div>
      </header>

      {/* ============================================================= */}
      {/* 2. SELECTED PRACTICE REEL (4 Asymmetric Panels)              */}
      {/* ============================================================= */}
      <section id="practice" className="relative pt-28 sm:pt-36 pb-0 bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14" data-reveal="">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#7C9A86] font-semibold mb-3">
                Selected Practice
              </p>
              <h2
                className="text-4xl sm:text-6xl font-normal tracking-tight text-[#1A241E]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
                data-reveal-words="true"
              >
                Pillars of <em className="italic font-normal text-[#586B60]">quiet execution.</em>
              </h2>
            </div>
            <p className="text-sm text-[#586B60] mt-3 sm:mt-0 font-sans">
              Daily Intentions · Habits · Milestones · Rest
            </p>
          </div>
        </div>

        {/* Panel 01: Panoramic Video Card (Daily Sanctuary & Focus Dials) */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-8 sm:mb-12">
          <div className="relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] shadow-2xl shadow-[#1A241E]/10 border border-[#EAE5D8]">
            <video
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/generated-videos/9109ecbb-cdc4-4815-981e-2ea83be13765/1782999930583-dfa026f6-bc70-4ea9-b421-6fd67b3eff53.mp4"
              poster="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/variants/0686272e-5c53-4301-bce5-b1a86a762fa4/1600w.jpg"
              data-video-in-view="true"
              muted
              playsInline
              loop
              data-panel-img=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-12 flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-6 text-white">
              <div data-reveal="">
                <p className="text-xs text-[#7C9A86] font-semibold tracking-wider mb-2">01 / SANCTUARY</p>
                <h3
                  className="text-3xl sm:text-4xl font-normal tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Daily Intentions & Focus Dials
                </h3>
                <p className="text-sm sm:text-base text-white/80 mt-2 max-w-xl font-sans leading-relaxed">
                  Capture immediate responsibilities without cognitive overload. A 24-hour circular dial, 
                  1-click morning resets for overdue tasks, and an undated Anytime backlog.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/90" data-reveal="" style={{ transitionDelay: "150ms" }}>
                <span className="border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-xs">Focus Dial</span>
                <span className="border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-xs">Morning Reset</span>
                <span className="border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-xs">Zero Overwhelm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panels 02 + 03: Asymmetric Staggered 2-Column Grid */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Panel 02: Habit Matrix & Ritual Graduation */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-[#1A241E]/10 border border-[#EAE5D8]">
            <img
              data-panel-img=""
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5f870fa0-1fa4-4845-bf04-6732d79259fa_1600w.webp"
              alt="Habit Matrix & Mastery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white" data-reveal="" style={{ transitionDelay: "120ms" }}>
              <p className="text-xs text-[#D98A6C] font-semibold tracking-wider mb-2">02 / HABIT CONSISTENCY</p>
              <h3
                className="text-2xl sm:text-3xl font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Habit Matrix & Mastered Rituals
              </h3>
              <p className="text-sm sm:text-base text-white/80 mt-2 max-w-md font-sans leading-relaxed">
                Consistency measured with grace. Track streaks through an organic matrix, and graduate finished learning 
                sprints into your permanent hall of mastery.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-white/90 mt-4">
                <span className="border border-white/25 rounded-full px-3 py-1 backdrop-blur-xs">Habit Graduation</span>
                <span className="border border-white/25 rounded-full px-3 py-1 backdrop-blur-xs">7-Day Consistency</span>
              </div>
            </div>
          </div>

          {/* Panel 03: Botanical Milestones */}
          <div className="lg:col-span-5 lg:mt-24 relative rounded-3xl overflow-hidden aspect-[4/5] lg:aspect-auto shadow-2xl shadow-[#1A241E]/10 border border-[#EAE5D8]">
            <img
              data-panel-img=""
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg"
              alt="Botanical Milestones"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white" data-reveal="" style={{ transitionDelay: "240ms" }}>
              <p className="text-xs text-[#7C9A86] font-semibold tracking-wider mb-2">03 / LONG-TERM ROADMAP</p>
              <h3
                className="text-2xl sm:text-3xl font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Botanical Milestones
              </h3>
              <p className="text-sm sm:text-base text-white/80 mt-2 max-w-sm font-sans leading-relaxed">
                From Seed to Sprout to Milestone. Connect today&apos;s 15-minute practice directly to your overarching life vision.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-white/90 mt-4">
                <span className="border border-white/25 rounded-full px-3 py-1 backdrop-blur-xs">Seed → Sprout</span>
                <span className="border border-white/25 rounded-full px-3 py-1 backdrop-blur-xs">Relational Goals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 04: Full Bleed Banner (Seasons & Mindful Rest) */}
        <div className="relative w-full overflow-hidden aspect-[16/12] sm:aspect-[21/9]">
          <img
            data-panel-img=""
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg"
            alt="Seasons & Mindful Rest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-8 sm:pb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 text-white">
              <div data-reveal="">
                <p className="text-xs text-[#D98A6C] font-semibold tracking-wider mb-2">04 / SEASONS & REST</p>
                <h3
                  className="text-3xl sm:text-4xl font-normal tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Seasonal History & Sleep Recovery
                </h3>
                <p className="text-sm sm:text-base text-white/80 mt-2 max-w-xl font-sans leading-relaxed">
                  Life moves in natural seasons of creation and rest. Look back across months with pride rather than shame,
                  track sleep rhythms, and monitor your 0–100% Harmony Score.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/90" data-reveal="" style={{ transitionDelay: "150ms" }}>
                <span className="border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-xs">Harmony Gauge</span>
                <span className="border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-xs">Rest Hours</span>
                <span className="border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-xs">Retrospective</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 3. THE ROOTED METHOD (3-Column Philosophy Cards)              */}
      {/* ============================================================= */}
      <section id="method" className="bg-[#EBF1E8] text-[#1A241E] py-28 sm:py-36 border-y border-[#7C9A86]/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mb-16 sm:mb-20" data-reveal="">
            <p className="text-xs uppercase tracking-[0.25em] text-[#1E3127] font-semibold mb-4">
              The Method
            </p>
            <h2
              className="text-4xl sm:text-6xl font-normal leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              data-reveal-words="true"
            >
              We give daily intentions{" "}
              <em className="italic font-normal text-[#586B60]">lasting roots.</em>
            </h2>
            <p className="text-base sm:text-lg text-[#586B60] mt-6 max-w-2xl font-sans leading-relaxed">
              Standard tools treat your life as an infinite, crushing backlog. Rooted cultivates deliberate depth
              across three grounded cycles: Plan, Tend, and Harvest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Card A */}
            <div data-reveal="" className="group">
              <div className="rounded-2xl overflow-hidden aspect-[3/2] mb-6 shadow-lg shadow-[#1A241E]/5 border border-[#1E3127]/10 bg-white">
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg"
                  alt="Plan & Plant"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <p className="text-xs text-[#7C9A86] font-bold mb-1 font-sans">CYCLE A</p>
              <h3
                className="text-2xl font-normal mb-2 text-[#1A241E]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Plan & Plant
              </h3>
              <p className="text-sm sm:text-base text-[#586B60] leading-relaxed font-sans">
                Set 3–5 high-impact daily intentions. Group chores into the Anytime backlog and assign milestones without cluttering today&apos;s horizon.
              </p>
            </div>

            {/* Card B */}
            <div data-reveal="" style={{ transitionDelay: "120ms" }} className="group">
              <div className="rounded-2xl overflow-hidden aspect-[3/2] mb-6 shadow-lg shadow-[#1A241E]/5 border border-[#1E3127]/10 bg-white">
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp"
                  alt="Tend & Flow"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <p className="text-xs text-[#D98A6C] font-bold mb-1 font-sans">CYCLE B</p>
              <h3
                className="text-2xl font-normal mb-2 text-[#1A241E]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Tend & Flow
              </h3>
              <p className="text-sm sm:text-base text-[#586B60] leading-relaxed font-sans">
                Execute without friction. Drag to reorder your day&apos;s rhythm, log habits with one tap, and rely on gentle morning resets when life shifts.
              </p>
            </div>

            {/* Card C */}
            <div data-reveal="" style={{ transitionDelay: "240ms" }} className="group">
              <div className="rounded-2xl overflow-hidden aspect-[3/2] mb-6 shadow-lg shadow-[#1A241E]/5 border border-[#1E3127]/10 bg-white">
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/30104e3c-5eea-4b93-93e9-5313698a7156_1600w.webp"
                  alt="Harvest & Master"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <p className="text-xs text-[#7C9A86] font-bold mb-1 font-sans">CYCLE C</p>
              <h3
                className="text-2xl font-normal mb-2 text-[#1A241E]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Harvest & Master
              </h3>
              <p className="text-sm sm:text-base text-[#586B60] leading-relaxed font-sans">
                Graduate habits upon completion, log seasonal retrospective notes, and witness how daily consistency turns into towering groves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 4. CAPABILITIES WITH FLOATING CURSOR PREVIEW                  */}
      {/* ============================================================= */}
      <section id="capabilities" className="bg-[#1E3127] text-white py-28 sm:py-36 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#7C9A86] font-semibold mb-12" data-reveal="">
            Sanctuary Capabilities
          </p>

          <div data-reveal="">
            {/* Row 01 */}
            <Link
              href={destination}
              className="group flex items-baseline justify-between border-t border-white/15 py-7 sm:py-9 hover:border-[#7C9A86]/60 transition-colors duration-500 cursor-pointer"
              data-preview="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600&auto=format&fit=crop"
              data-reveal=""
              style={{ transitionDelay: "0ms" }}
            >
              <span
                className="text-2xl sm:text-4xl text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Daily Focus Dials & Horizonal Intentions
              </span>
              <span className="text-xs text-white/40 group-hover:text-[#7C9A86] transition-colors duration-500 font-sans">
                01
              </span>
            </Link>

            {/* Row 02 */}
            <Link
              href={destination}
              className="group flex items-baseline justify-between border-t border-white/15 py-7 sm:py-9 hover:border-[#7C9A86]/60 transition-colors duration-500 cursor-pointer"
              data-preview="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop"
              data-reveal=""
              style={{ transitionDelay: "80ms" }}
            >
              <span
                className="text-2xl sm:text-4xl text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Organic Habit Matrix & Rolling Streaks
              </span>
              <span className="text-xs text-white/40 group-hover:text-[#7C9A86] transition-colors duration-500 font-sans">
                02
              </span>
            </Link>

            {/* Row 03 */}
            <Link
              href={destination}
              className="group flex items-baseline justify-between border-t border-white/15 py-7 sm:py-9 hover:border-[#7C9A86]/60 transition-colors duration-500 cursor-pointer"
              data-preview="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
              data-reveal=""
              style={{ transitionDelay: "160ms" }}
            >
              <span
                className="text-2xl sm:text-4xl text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Ritual Graduation & Mastered Learning Sprints
              </span>
              <span className="text-xs text-white/40 group-hover:text-[#7C9A86] transition-colors duration-500 font-sans">
                03
              </span>
            </Link>

            {/* Row 04 */}
            <Link
              href={destination}
              className="group flex items-baseline justify-between border-t border-white/15 py-7 sm:py-9 hover:border-[#7C9A86]/60 transition-colors duration-500 cursor-pointer"
              data-preview="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"
              data-reveal=""
              style={{ transitionDelay: "240ms" }}
            >
              <span
                className="text-2xl sm:text-4xl text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Botanical Milestones & Vision Roadmaps
              </span>
              <span className="text-xs text-white/40 group-hover:text-[#7C9A86] transition-colors duration-500 font-sans">
                04
              </span>
            </Link>

            {/* Row 05 */}
            <Link
              href={destination}
              className="group flex items-baseline justify-between border-t border-white/15 py-7 sm:py-9 hover:border-[#7C9A86]/60 transition-colors duration-500 cursor-pointer"
              data-preview="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop"
              data-reveal=""
              style={{ transitionDelay: "320ms" }}
            >
              <span
                className="text-2xl sm:text-4xl text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Seasonal Retrospective & Sleep Rhythm Tracking
              </span>
              <span className="text-xs text-white/40 group-hover:text-[#7C9A86] transition-colors duration-500 font-sans">
                05
              </span>
            </Link>

            {/* Row 06 */}
            <Link
              href={destination}
              className="group flex items-baseline justify-between border-t border-b border-white/15 py-7 sm:py-9 hover:border-[#7C9A86]/60 transition-colors duration-500 cursor-pointer"
              data-preview="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600&auto=format&fit=crop"
              data-reveal=""
              style={{ transitionDelay: "400ms" }}
            >
              <span
                className="text-2xl sm:text-4xl text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 font-normal tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Thought Garden & Calendar-Accurate Notes
              </span>
              <span className="text-xs text-white/40 group-hover:text-[#7C9A86] transition-colors duration-500 font-sans">
                06
              </span>
            </Link>
          </div>
        </div>

        {/* Floating Cursor Image Preview Element */}
        <div
          id="cursor-preview"
          className="hidden lg:block fixed z-40 pointer-events-none w-60 aspect-[4/3] rounded-2xl overflow-hidden opacity-0 scale-90 transition-all duration-300 ease-out shadow-2xl shadow-black/60 border border-white/20"
        >
          <img
            id="cursor-preview-img"
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg"
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ============================================================= */}
      {/* 5. MINDFUL PROOF & REFLECTION                                 */}
      {/* ============================================================= */}
      <section id="reflection" className="bg-[#FAF7F0] pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1" data-reveal="">
            <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl shadow-[#1A241E]/10 border border-[#EAE5D8]">
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg"
                alt="Mindful Reflection"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2" data-reveal="">
            <Quote className="w-10 h-10 text-[#1E3127] mb-8 opacity-80" />
            <blockquote
              className="text-2xl sm:text-4xl sm:leading-[1.25] text-[#1A241E] font-normal tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              data-reveal-words="true"
            >
              &ldquo;Traditional to-do apps were a graveyard of unfinished guilt. 
              Rooted gave my days an organic cadence. I finally understand the link between 
              today&apos;s quiet 20-minute intention and the person I am growing into.&rdquo;
            </blockquote>
            <div className="mt-8 pt-6 border-t border-[#EAE5D8]" data-reveal="" style={{ transitionDelay: "300ms" }}>
              <p className="text-base font-semibold text-[#1A241E]">Evelyn Vance</p>
              <p className="text-sm text-[#586B60]">Author & Systems Designer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 5.5. ANIMATED ROOTED PARALLAX INTERLUDE                       */}
      {/* ============================================================= */}
      <section className="relative overflow-hidden py-24 sm:py-36 bg-[#FAF7F0] border-t border-[#EAE5D8]">
        {/* Floating Ambient Translucent Forms (Matching Hero Animation) */}
        <div className="absolute inset-0 pointer-events-none z-[1]" data-parallax="0.2">
          <div className="drift-a absolute top-[14%] left-[6%] w-36 h-36 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#7C9A86]/20 to-transparent backdrop-blur-xs border border-[#7C9A86]/20 shadow-[inset_0_0_40px_rgba(124,154,134,0.15)]" />
          <div className="drift-b absolute bottom-[14%] right-[8%] w-40 h-40 sm:w-60 sm:h-60 rounded-[45%] bg-gradient-to-tl from-[#D98A6C]/20 to-transparent backdrop-blur-xs border border-[#D98A6C]/20 shadow-[inset_0_0_40px_rgba(217,138,108,0.12)]" />
          <div className="drift-c absolute top-[42%] right-[32%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#1E3127]/5 border border-[#1E3127]/10" />
        </div>

        {/* Giant Cropped Animated Parallax Wordmark ("ROOTED") */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          data-parallax="0.32"
        >
          <p
            className="text-[24vw] sm:text-[21vw] leading-none text-center font-normal tracking-tight text-[#1E3127]/[0.08] whitespace-nowrap"
            style={{
              fontFamily: "'Instrument Serif', serif",
              WebkitTextStroke: "1.5px rgba(30, 49, 39, 0.2)",
            }}
          >
            ROOTED
          </p>
        </div>

        {/* Foreground Editorial Statement */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center" data-reveal="">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E3127]/5 border border-[#1E3127]/10 text-xs font-semibold uppercase tracking-[0.22em] text-[#1E3127] mb-6 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A86] animate-pulse" />
            <span>The Rhythm of Life Architecture</span>
          </div>

          <h3
            className="text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.05] tracking-tight text-[#1A241E] max-w-3xl mx-auto"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            data-reveal-words="true"
          >
            Small daily seeds yield{" "}
            <em className="italic font-normal text-[#7C9A86]">towering groves</em>{" "}
            over seasons.
          </h3>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-[#586B60] max-w-xl mx-auto font-sans leading-relaxed">
            Every 20-minute intention planted today becomes the milestone you celebrate tomorrow. 
            No frantic hustle. Just grounded, enduring progress.
          </p>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 6. FINAL CTA SECTION                                          */}
      {/* ============================================================= */}
      <section id="contact" className="relative overflow-hidden py-20 sm:py-28 bg-[#FAF7F0] border-t border-[#EAE5D8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          <div className="lg:col-span-6" data-reveal="">
            <p className="text-xs uppercase tracking-[0.25em] text-[#7C9A86] font-semibold mb-4">
              Begin Your Practice
            </p>
            <h2
              className="text-4xl sm:text-6xl font-normal leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              data-reveal-words="true"
            >
              Plant your first seed{" "}
              <em className="italic font-normal text-[#586B60]">today.</em>
            </h2>
            <p className="text-base sm:text-lg text-[#586B60] max-w-md mb-10 font-sans leading-relaxed">
              Step into a calm, private sanctuary where daily consistency yields towering groves. No ads, no streak shame, no noise.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href={destination}
                className="liquid-glass bg-[#1E3127] text-white hover:bg-[#2A3F34] active:scale-95 text-base font-medium px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-[#1E3127]/20 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!user && (
                <Link
                  href="/sign-in"
                  className="text-sm text-[#586B60] hover:text-[#1A241E] transition-colors border-b border-[#EAE5D8] pb-0.5"
                >
                  Already practicing? Sign In →
                </Link>
              )}
            </div>
          </div>

          <div className="lg:col-span-6" data-reveal="" style={{ transitionDelay: "150ms" }}>
            <div className="p-8 sm:p-10 rounded-3xl bg-[#1E3127] text-white shadow-2xl shadow-[#1A241E]/15 border border-[#354D40] space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#7C9A86]/20 border border-[#7C9A86]/40 flex items-center justify-center text-[#A3BEAD]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h4
                  className="text-xl font-normal text-white"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Sanctuary Guarantees
                </h4>
              </div>

              <ul className="space-y-4 text-sm text-neutral-300 font-sans">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#7C9A86] shrink-0 mt-0.5" />
                  <span><strong>Zero Streak Shame</strong>: 1-click morning resets seamlessly reschedule overdue intentions without penalty.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#7C9A86] shrink-0 mt-0.5" />
                  <span><strong>Holistic Life Harmony</strong>: Track rest, habits, and tasks across Mind, Body, Craft, and Spirit.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#7C9A86] shrink-0 mt-0.5" />
                  <span><strong>Private & Permanent</strong>: Stored securely in your dedicated SQLite database space.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 7. EDITORIAL FOOTER (Pinned to Bottom)                        */}
      {/* ============================================================= */}
      <footer className="w-full bg-[#FAF7F0] border-t border-[#EAE5D8] mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 select-none">
              <RootedLogo variant="dark" className="h-9 w-auto shrink-0" />
              <RootedWordmark variant="dark" className="h-5 w-auto shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-[#586B60]">
              <a href="#top" className="hover:text-[#1A241E] transition-colors">Top</a>
              <a href="#practice" className="hover:text-[#1A241E] transition-colors">Practice</a>
              <a href="#method" className="hover:text-[#1A241E] transition-colors">Method</a>
              <a href="#capabilities" className="hover:text-[#1A241E] transition-colors">Capabilities</a>
              <a href="#reflection" className="hover:text-[#1A241E] transition-colors">Philosophy</a>
              <Link href="/sign-in" className="hover:text-[#1A241E] transition-colors">Sign In</Link>
              <Link href="/sign-up" className="hover:text-[#1A241E] transition-colors">Get Started</Link>
            </div>

            <p className="text-xs text-[#586B60]/70 font-sans">
              © {new Date().getFullYear()} Rooted. Mindful life architecture.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
