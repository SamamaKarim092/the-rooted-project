# 🌿 Rooted — Obsidian Knowledge Hub (Index)

Welcome to the internal engineering notes for **Rooted** (Personal Productivity & Habit Tracker). 
These notes explain in simple, clear, and comprehensive English how this application is structured, designed, and coded.

> **Tip for Obsidian Users**: Use `Ctrl + Click` (or `Cmd + Click`) on any `[[Link]]` to navigate between documents.

---

## 🗺️ Map of Content (MOC)

1. **[[01_Project_Overview]]**
   - The mission, vision, core philosophy, and problems Rooted solves.
   - The five foundational pillars of the application.

2. **[[02_Design_System]]**
   - Detailed visual specifications matching `design/design_concept_6.jpg`.
   - Color tokens (cream, forest green, terracotta, sage), typography (Fraunces + Plus Jakarta Sans), and component styling.

3. **[[03_Architecture_and_Data_Model]]**
   - The Next.js 16 App Router setup, React 19, TypeScript, and SQLite database with Prisma ORM.
   - Relational schema (Goals, Milestones, Tasks, Habits, Daily Logs).

4. **[[04_Features_and_Workflows]]**
   - Detailed mechanics of how each screen works:
     - **Journal / Dashboard**: Daily intentions, habit matrix, long-term vision, weekly flow.
     - **Tasks**: Priority queues, categories, scheduling.
     - **Habits**: Frequencies, streaks calculation, completion toggling.
     - **Seasons**: Calendar history drill-down.
     - **Milestones**: Long-term goals & milestone ladders.
     - **Growth**: Consistency analytics and pattern discovery.

5. **[[05_Implementation_Log]]**
   - A step-by-step chronological record of everything built, decisions made, current status, and upcoming tasks.

6. **[[06_Monthly_Tracking_and_Reviews]]**
   - How month-by-month tracking, task archiving, and consistency reviews work in Seasons and Growth.

7. **[[07_Sleep_Tracking_and_Rest_Rhythm]]**
   - Morning sleep check-in dialog, bedtime/wake arithmetic, daily target bar, overslept/deficit tracking, and weekly/monthly sleep rhythms.

8. **[[08_Field_Notes_System]]**
   - Master-detail note-taking canvas, heading & description editor, category badges, pin management, and real-time search.

9. **[[09_Authentication_and_Multi_Tenancy]]**
   - Clerk authentication integration, multi-tenant database partitioning (`userId`), zero-data-loss auto-claim protocol, and production hosting guidance.

10. **[[10_AI_Connectors_and_Remote_MCP]]**
    - Technical blueprint and architecture for connecting Rooted to Claude, Gemini Spark, Grok, and ChatGPT using the open Remote Model Context Protocol (MCP) standard over HTTPS/SSE.

11. **[[11_Vercel_and_Production_Deployment]]**
    - Step-by-step production deployment guide covering Vercel, Turso LibSQL cloud database, Clerk authentication, and environment configuration.

12. **Interview Questions Vault (Roman Urdu)**
    - Comprehensive interview prep in simple Roman Urdu (from basics to advanced system design):
      - [[notes/interview_questions/01_Project_Overview_And_Problem_Statement|01. Project Overview & Problem Statement]]
      - [[notes/interview_questions/02_Tech_Stack_And_Why_Chosen|02. Tech Stack & Why Chosen]]
      - [[notes/interview_questions/03_Database_Schema_And_Relations|03. Database Schema & Relations]]
      - [[notes/interview_questions/04_Nextjs_Architecture_And_Server_Actions|04. Next.js Architecture & Server Actions]]
      - [[notes/interview_questions/05_Habit_Streak_Calculation_Logic|05. Habit Streak Calculation Logic]]
      - [[notes/interview_questions/06_Sleep_Tracking_And_Midnight_Arithmetic|06. Sleep Tracking & Midnight Arithmetic]]
      - [[notes/interview_questions/07_Authentication_Multi_Tenancy_And_Auto_Claim|07. Authentication, Multi-Tenancy & Auto-Claim]]
      - [[notes/interview_questions/08_Production_Scaling_And_Dual_Database|08. Production Scaling & Dual Database]]
      - [[notes/interview_questions/09_Biggest_Technical_Challenge_And_Solution|09. Biggest Technical Challenge & Solution]]
      - [[notes/interview_questions/10_Future_Improvements_And_Scalability|10. Future Improvements & Scalability]]

---

## 📌 Guiding Rule for AI Agents & Developers
Whenever you make a modification, add a new API route, alter the database, or build a new UI component, **you must update these notes** so that any future AI or human engineer has complete, immediate clarity on how the application works.
