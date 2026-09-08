<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# 🌿 Rooted — AI Agent Directive & Knowledge Base

## 1. Project Identity & Goal
**Rooted** is a unified personal productivity and life-tracking web application that bridges daily execution with long-term aspirations. It brings together five tightly integrated pillars:
1. **To-Do Lists (Daily Intentions)**: Immediate responsibilities with priorities, times, and categories.
2. **Habit Tracking & Streaks (Habit Growth)**: Consistency tracking with daily/weekly targets and streak calculations.
3. **Calendar History (Seasons)**: Date-by-date retrospective logs of completed/missed habits and tasks.
4. **Analytics & Patterns (Growth)**: Rolling consistency rates (7-day, 30-day, monthly) and behavioral pattern insights.
5. **Long-Term Goals & Roadmaps (Milestones)**: Vision breakdown connecting daily tasks and habits to long-term goals.

**Core Philosophy**:
`Plan → Act → Track → Review → Improve`
`Daily Activity → Habit / Task → Milestone → Long-Term Goal`

---

## 2. Visual & Aesthetic Guidelines (Non-Negotiable)
Any UI component or page you build **MUST** align faithfully with **`design/design_concept_6.jpg`**:
- **Aesthetic Tone**: Warm, organic, editorial, grounded, and tranquil ("Rooted").
- **Palette**:
  - Background: Warm linen / cream (`#F7F4EB` / `#FAF7F0`)
  - Primary Surfaces: Deep forest green (`#1E3127` / `#24372D`)
  - Secondary Surfaces: Warm off-white / light cream (`#FFFFFF` / `#FDFCFA` with soft borders `#EFEBE1`)
  - Accents: Terracotta / clay (`#D98A6C` / `#C87452`), soft sage green (`#7C9A86` / `#5E7E6B`), warm sand/gold (`#D4A373`)
- **Typography**:
  - Headings / Logo / Key Metrics: Editorial Serif (`Fraunces` or `Playfair Display`)
  - Body / UI Controls / Badges: Clean, warm sans-serif (`Plus Jakarta Sans` or `Inter`)
- **UI Elements**:
  - Rounded geometry (`rounded-2xl`, `rounded-3xl`)
  - Organic metric capsules in header ("91% Harmony", "24 Days Rooted", "5 of 7 Daily Intentions")
  - Pill badges for categories (`Mind`, `Body`, `Craft`, `Spirit`, etc.)
  - Botanical milestone progress tracks (Seed $\rightarrow$ Sprout $\rightarrow$ Milestone)
  - Habit matrix dot grid (sage green for completed, terracotta for today/missed)
  - Wave chart & circular Harmony gauge for weekly progress

---

## 3. Tech Stack Constraints
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling**: Tailwind CSS v4 configured with the custom `rooted` color tokens and serif/sans font families.
- **Database**: Local **SQLite** via **Prisma ORM** (`prisma/schema.prisma`).
- **Icons**: `lucide-react`.

---

## 4. Anti-Hallucination & Execution Guardrails
1. **Never build generic, cookie-cutter UIs**: Do not use standard harsh grays (`bg-gray-900`, `text-blue-500`). Always adhere to the warm cream and deep forest green color system.
2. **Preserve data relational integrity**: Always maintain the link between Goals, Milestones, Habits, Tasks, and their respective completion logs.
3. **Check before writing code**: Always inspect the existing components, Prisma schema, and utility functions before creating duplicates.
4. **No placeholder links or dummy dead-ends**: All navigation tabs (`Journal`, `Tasks`, `Habits`, `Seasons`, `Milestones`, `Growth`) must render functional, interactive views.

---

## 5. Mandatory Obsidian Notes Protocol (`notes/` Folder)
As an agent working on this codebase, **you must maintain and update the `notes/` directory** whenever you build or modify features:
- All notes must be written in **clear, simple, and understandable English** in Markdown format (`.md`) compatible with **Obsidian** (using internal wikilinks `[[Note Name]]`, clear headers, and mermaid diagrams).
- The purpose of the `notes/` folder is to provide a complete, transparent, and permanent record of:
  - How the frontend and backend were constructed.
  - How APIs, Prisma models, and server actions work.
  - Component hierarchy and state management patterns.
  - A running progress log of what has been implemented and what remains.
- If a future AI chat or human engineer opens this repository, reading the `notes/` folder should give them immediate, 100% clarity on the entire system without guessing.

