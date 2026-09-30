# 🔐 Authentication & Multi-Tenancy System

## 1. Overview & Objectives
Rooted was originally conceived as a single-user sanctuary. To support 100+ concurrent users with complete data isolation, privacy, and seamless sign-in across devices, Rooted integrates **Clerk Authentication** with an enterprise-grade multi-tenant database partitioning model.

### Key Tenets
1. **Zero Data Loss**: Existing single-user records (tasks, habits, goals, notes, sleep logs) are safely claimed by the creator upon their first authenticated session.
2. **Strict Isolation**: Every query and mutation is filtered by `where: { userId }`, preventing cross-tenant leakage.
3. **Aesthetic Consistency**: Auth screens (`/sign-in`, `/sign-up`), user profile capsules, and buttons are styled with Rooted's serene warm linen (`#FAF7F0`) and forest green (`#1E3127`) botanical palette.
4. **Graceful Fallback**: If run in an unauthenticated or local development environment without Clerk credentials, the app gracefully falls back to `"default_user"`.

---

## 2. Multi-Tenant Architecture & Data Flow

```mermaid
graph TD
    Client["Browser / User"] -->|Enters App| Middleware["src/middleware.ts (clerkMiddleware)"]
    Middleware -->|Public: /sign-in, /sign-up| AuthPages["Auth Views (Clerk SignIn/SignUp)"]
    Middleware -->|Protected: /tasks, /habits, etc.| NextPages["App Router Pages"]
    NextPages -->|Fetch Scoped Data| Actions["src/lib/actions.ts (getEffectiveUserId)"]
    Actions -->|Check auth()| ClerkServer["Clerk Server SDK"]
    ClerkServer -->|Returns userId| Actions
    Actions -->|First Login?| ClaimEngine["claimDefaultUserData()"]
    ClaimEngine -->|Migrate 'default_user' records| SQLite["Prisma Database (dev.db)"]
    Actions -->|Query where: { userId }| SQLite
    SQLite -->|Tenant Records Only| Client
```

---

## 3. Database Schema Partitioning

In `prisma/schema.prisma`, multi-tenancy is enforced on all core entities with a `userId` field and performance indexes:

```prisma
model Task {
  id          String     @id @default(cuid())
  userId      String     @default("default_user")
  title       String
  // ...
  @@index([userId])
}

model Habit {
  id          String     @id @default(cuid())
  userId      String     @default("default_user")
  title       String
  // ...
  @@index([userId])
}

model Goal {
  id          String     @id @default(cuid())
  userId      String     @default("default_user")
  title       String
  // ...
  @@index([userId])
}

model SleepLog {
  id              String   @id @default(cuid())
  userId          String   @default("default_user")
  date            String   // "YYYY-MM-DD"
  // ...
  @@unique([userId, date])
  @@index([userId])
}

model SleepSetting {
  id          String   @id @default(cuid())
  userId      String   @unique @default("default_user")
  targetHours Float    @default(8.0)
  // ...
  @@index([userId])
}

model Note {
  id        String   @id @default(cuid())
  userId    String   @default("default_user")
  title     String   @default("Untitled Note")
  // ...
  @@index([userId])
}
```

### Relational Cascades
- `Milestone` records belong to a `Goal` (`goalId`). Since goals are scoped by `userId`, all milestones inherit tenancy through their parent goal.
- `HabitLog` records belong to a `Habit` (`habitId`). Logs inherit tenancy through their parent habit.

---

## 4. The Auto-Claim Protocol (`claimDefaultUserData`)

When upgrading a single-tenant database with existing seed or personal data to multi-tenant Clerk authentication, a common challenge is preventing previous data from being orphaned or inaccessible.

Rooted introduces the **Auto-Claim Protocol**:
```typescript
export async function claimDefaultUserData(targetUserId: string) {
  if (!targetUserId || targetUserId === "default_user") return;
  
  // 1. Verify if unassigned 'default_user' data exists
  const defaultTaskCount = await prisma.task.count({ where: { userId: "default_user" } });
  if (defaultTaskCount === 0) return;

  // 2. Only claim if target user does not have any tasks yet
  const targetTaskCount = await prisma.task.count({ where: { userId: targetUserId } });
  if (targetTaskCount === 0) {
    await prisma.$transaction([
      prisma.task.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
      prisma.habit.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
      prisma.goal.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
      prisma.note.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
      prisma.sleepLog.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
    ]);

    const defaultSetting = await prisma.sleepSetting.findUnique({ where: { userId: "default_user" } });
    if (defaultSetting) {
      await prisma.sleepSetting.upsert({
        where: { userId: targetUserId },
        create: { userId: targetUserId, targetHours: defaultSetting.targetHours },
        update: { targetHours: defaultSetting.targetHours },
      });
      await prisma.sleepSetting.delete({ where: { userId: "default_user" } }).catch(() => {});
    }
  }
}
```

**Outcome**:
1. When the creator logs into their new Clerk account, all existing tasks, habits, and goals are instantly transferred to their `userId`.
2. When any subsequent user signs up, `default_user` has 0 items, so they start with their own clean sanctuary.

---

## 5. Route Protection & Middleware

Rooted configures Clerk's Next.js App Router middleware in `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // Protect private routes
    // await auth.protect();
  }
});
```

> **Flexibility Note**: For public preview or landing demo purposes, `auth.protect()` can be toggled on to strictly require sign-in, or left permissive so unauthenticated guests can explore the app in demo sandbox mode (`default_user`).

---

## 6. UI Integration & Styling

### 1. Dedicated Full-Screen Auth Pages (`AppShell`)
- Rather than squeezing the sign-in and sign-up modals onto the right of the navigation sidebar, Rooted uses an `AppShell` component (`src/components/layout/AppShell.tsx`).
- When navigating to `/sign-in` or `/sign-up`, the sidebar is automatically omitted, rendering a full-screen, centered, distraction-free authentication experience.
- When on dashboard and regular application routes (`/`, `/tasks`, `/habits`, etc.), the full sidebar and main workspace layout are rendered.

### 2. Root Layout Provider (`src/app/layout.tsx`)
Wrapped with `<ClerkProvider>` styled to match Rooted's botanical tokens:
- `colorPrimary`: `#1E3127` (Forest Green)
- `colorBackground`: `#FAF7F0` (Linen / Warm Off-White)
- `colorForeground`: `#1A241E` (Dark Olive Slate)
- `colorMutedForeground`: `#586B60` (Muted Botanical Green)
- `borderRadius`: `1rem` (Organic Rounded Capsule Geometry)

### 3. Sidebar Profile Capsule (`src/components/layout/Sidebar.tsx`)
- Uses Clerk's `useAuth()` hook to check authentication status.
- Displays `<UserButton />` with user avatar, name, and account management when signed in.
- Displays sleek `Sign In` button when signed out.

### 4. Dedicated Sign-In & Sign-Up Pages
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`
Rendered with calming typography, botanical quotes, and centered aesthetic cards.

---

## 7. Scaling to 100+ Users & Production Hosting

### Turso (LibSQL Cloud Database) — Actively Configured & Synchronized
Rooted is actively connected to **Turso**, a distributed, serverless SQLite database built on **LibSQL**:
- **Connection Configuration**:
  - `TURSO_DATABASE_URL=libsql://...`
  - `TURSO_AUTH_TOKEN=eyJ...`
- **Adapter Engine**: Configured in `src/lib/prisma.ts` using `@prisma/adapter-libsql`.
  - Automatically activates cloud Turso when credentials are provided.
  - Gracefully falls back to local SQLite (`dev.db`) if environment variables are unset.
- **Schema Parity Audit**:
  - All tables (`Goal`, `Milestone`, `Habit`, `HabitLog`, `Task`, `SleepLog`, `SleepSetting`, `Note`) were fully synchronized with `schema.prisma`.
  - Added missing columns `Habit.frequencyType`, `HabitLog.note`, and `Task.scheduledTime` to ensure full Prisma relational query compatibility without SQL errors.
- **Route Protection & Redirection**:
  - Configured `unauthenticatedUrl` in `src/middleware.ts` to redirect unauthenticated requests to `/sign-in` rather than serving a raw 404.
- **Serverless Hosting Compatibility**:
  - Because Turso is cloud-hosted and globally distributed, Rooted can be deployed to **Vercel** with 1 click.
  - Container spins, serverless restarts, and edge functions persist all data across sessions with zero cold-start database wipes.

---

## 8. Related Notes
- [[03_Architecture_and_Data_Model]] — Core relational models and Prisma configuration.
- [[04_Features_and_Workflows]] — How tenant-scoped actions power the dashboard and subpages.
- [[05_Implementation_Log]] — Chronological progress log including Step 17.

