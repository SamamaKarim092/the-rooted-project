# 🌿 The Rooted Project

> **"Manage what you need to do. Build what you want to become. Track the progress in between."**

**The Rooted Project** is a unified personal productivity and life-tracking web application that bridges daily execution with long-term aspirations. Designed with an organic, editorial aesthetic inspired by botanical growth, it brings together task management, habit consistency, retrospective calendar analysis, sleep rhythms, and long-term milestone planning into one cohesive sanctuary.

---

## ✨ Core Pillars

1. **Daily Sanctuary & Intentions (`/`)**
   - Header metric capsules: Rolling Harmony Score (0–100%), Days Rooted, Daily Intention progress, and Sleep Recovery hours.
   - Interactive focus dials, Morning Reset for overdue tasks, and habit checklists.

2. **Tasks & Intentions (`/tasks`)**
   - Horizon-based organization: *Today*, *Upcoming*, and *Anytime*.
   - Priority queues (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), category badges, milestone association, and drag-and-drop reordering.

3. **Habit Growth & Streaks (`/habits`)**
   - Daily and weekly target frequencies (e.g. 4x/week or 20 mins/day).
   - Rolling streak calculation, visual dot matrix consistency grid, completion notes, and Ritual Graduation.

4. **Seasons & Calendar History (`/seasons`)**
   - Day-by-day and month-by-month retrospective logs of completed tasks, habits, and rest records.
   - Deep historical drill-down without disappearing data.

5. **Botanical Milestones & Roadmaps (`/milestones`)**
   - Long-term life vision broken down into organic growth stages:
     $$\text{Seed} \longrightarrow \text{Sprout} \longrightarrow \text{Milestone}$$
   - Links daily tasks and habits directly to overarching goals.

6. **Growth & Behavioral Analytics (`/growth`)**
   - Rolling consistency analytics (7-day, 30-day, monthly).
   - Sleep rhythm insights (bedtime/wake patterns, sleep deficit/surplus, sleep quality ratings).

7. **Field Notes & Thought Garden (`/notes`)**
   - Distraction-free quick-capture note editor with category pills, pinned notes, and real-time search.

8. **AI Assistant Connectors & Remote MCP Server (`/api/mcp`)**
   - Open Model Context Protocol (MCP) server running over HTTPS/SSE and JSON-RPC.
   - Connects Rooted directly to **Google Gemini (Spark)**, **Claude**, **Grok**, and **ChatGPT**.
   - 8 scoped tools with cryptographically hashed Personal Access Tokens (PATs).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom botanical design tokens (Warm Linen `#FAF7F0`, Deep Forest Green `#1E3127`, Terracotta `#D98A6C`, Soft Sage `#7C9A86`)
- **Typography**: Google Fonts (*Fraunces*, *Instrument Serif*, *Plus Jakarta Sans*, *Inter*)
- **Database**: [Prisma ORM](https://www.prisma.io/) with dual-engine architecture:
  - Local Development: SQLite (`prisma/dev.db`)
  - Production: [Turso](https://turso.tech/) (LibSQL Serverless Cloud Database) via `@prisma/adapter-libsql`
- **Authentication**: [Clerk](https://clerk.com/) with multi-tenant data isolation and auto-claim protocol
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ installed
- npm or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/SamamaKarim092/Personal-Project.git
cd Personal-Project
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL and Clerk API keys:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 4. Database Setup
Generate the Prisma client and push the schema to your local database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment (Vercel)

The Rooted Project is optimized for 1-click deployment on **Vercel** with a **Turso** cloud database.

For complete instructions, refer to the [Production Deployment Guide](notes/11_Vercel_and_Production_Deployment.md).

```bash
# Build command configured in package.json:
npm run build # executes 'prisma generate && next build'
```

---

## 📚 Documentation Vault

Detailed system design, architecture diagrams, and implementation notes are available in the [`notes/`](notes/) directory:
- [00. Knowledge Hub Index](notes/00_Index.md)
- [01. Project Overview & Philosophy](notes/01_Project_Overview.md)
- [02. Botanical Design System](notes/02_Design_System.md)
- [03. Architecture & Data Model](notes/03_Architecture_and_Data_Model.md)
- [04. Features & Workflows](notes/04_Features_and_Workflows.md)
- [05. Chronological Implementation Log](notes/05_Implementation_Log.md)
- [09. Multi-Tenancy & Authentication](notes/09_Authentication_and_Multi_Tenancy.md)
- [10. AI Connectors & Remote MCP Server](notes/10_AI_Connectors_and_Remote_MCP.md)
- [11. Vercel & Production Deployment Guide](notes/11_Vercel_and_Production_Deployment.md)

---

## 📄 License
This project is private and proprietary.
