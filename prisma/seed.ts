import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("Seeding Rooted database with August & September multi-month data...");

  // Clean existing data
  await prisma.habitLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.habit.deleteMany({});
  await prisma.goal.deleteMany({});

  // 1. Create Core Long-Term Goal
  const goal = await prisma.goal.create({
    data: {
      title: "Master Creative Engineering",
      description: "Blend human-centric design, robust distributed systems, and mindful execution.",
      category: "Craft",
      progressPercentage: 76,
      status: "ACTIVE",
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      milestones: {
        create: [
          {
            title: "Foundational Architecture",
            stage: "Milestone",
            isCompleted: true,
            order: 1,
            completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Interactive Sensory UI",
            stage: "Seed",
            isCompleted: true,
            order: 2,
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Full Production Scaling",
            stage: "Milestone",
            isCompleted: false,
            order: 3,
          },
        ],
      },
    },
    include: {
      milestones: true,
    },
  });

  const milestone1 = goal.milestones[0];
  const milestone2 = goal.milestones[1];

  // 2. Create Core Habits
  const habitsData = [
    {
      title: "Morning Deep Work",
      description: "Uninterrupted focus session on primary craft.",
      category: "Craft",
      frequencyType: "DAILY",
      targetDaysPerWeek: 7,
      targetValue: 60,
      unit: "mins",
      color: "#7C9A86",
      goalId: goal.id,
    },
    {
      title: "Movement & Stretching",
      description: "Daily calisthenics, yoga, or endurance run.",
      category: "Body",
      frequencyType: "DAILY",
      targetDaysPerWeek: 7,
      targetValue: 30,
      unit: "mins",
      color: "#D98A6C",
      goalId: goal.id,
    },
    {
      title: "Editorial & Technical Reading",
      description: "Absorb deep books or technical research papers.",
      category: "Mind",
      frequencyType: "DAILY",
      targetDaysPerWeek: 7,
      targetValue: 20,
      unit: "mins",
      color: "#7C9A86",
      goalId: goal.id,
    },
    {
      title: "Stillness & Mindfulness",
      description: "Silent breath meditation or tea ritual.",
      category: "Spirit",
      frequencyType: "DAILY",
      targetDaysPerWeek: 7,
      targetValue: 15,
      unit: "mins",
      color: "#D4A373",
      goalId: goal.id,
    },
    {
      title: "Architecture & Systems Design",
      description: "Sketching software diagrams and data flows.",
      category: "Craft",
      frequencyType: "DAILY",
      targetDaysPerWeek: 7,
      targetValue: 45,
      unit: "mins",
      color: "#7C9A86",
      goalId: goal.id,
    },
    {
      title: "Evening Reflection & Journal",
      description: "Review today's intentions and lessons learned.",
      category: "Mind",
      frequencyType: "DAILY",
      targetDaysPerWeek: 7,
      targetValue: 10,
      unit: "mins",
      color: "#D98A6C",
      goalId: goal.id,
    },
  ];

  const createdHabits = [];
  for (const h of habitsData) {
    const created = await prisma.habit.create({ data: h });
    createdHabits.push(created);
  }

  // 3. Create Habit Logs for August 2026 (Aug 1 - Aug 31) and September 2026 (Sep 1 - Sep 5)
  // High consistency in August (~82% overall), showing deep work strong (96%) and movement (68%)
  for (let day = 1; day <= 31; day++) {
    const dateStr = `2026-08-${String(day).padStart(2, "0")}`;
    const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay(); // 0 is Sun, 6 is Sat

    for (let hIdx = 0; hIdx < createdHabits.length; hIdx++) {
      const habit = createdHabits[hIdx];
      let isDone = true;

      // Habit-specific consistency simulation for August
      if (hIdx === 0) {
        // Morning Deep Work: 96% (missed only 1 day)
        isDone = day !== 16;
      } else if (hIdx === 1) {
        // Movement: 68% (frequently missed on weekends or Wed)
        isDone = dayOfWeek !== 0 && dayOfWeek !== 6 && day % 5 !== 0;
      } else if (hIdx === 2) {
        // Reading: 84%
        isDone = day % 6 !== 0;
      } else if (hIdx === 3) {
        // Stillness: 80%
        isDone = day % 5 !== 0;
      } else if (hIdx === 4) {
        // Architecture: 85%
        isDone = day % 7 !== 0;
      } else {
        // Evening Reflection: 77%
        isDone = day % 4 !== 0;
      }

      await prisma.habitLog.create({
        data: {
          habitId: habit.id,
          date: dateStr,
          completed: isDone,
          value: isDone ? habit.targetValue : 0,
        },
      });
    }
  }

  // September 2026 (Sep 1 to Sep 5)
  const sepMatrix: boolean[][] = [
    [true, true, true, true, true],
    [true, true, true, true, false],
    [true, true, true, false, true],
    [true, true, false, true, true],
    [true, true, true, true, true],
    [true, false, true, true, true],
  ];

  for (let day = 1; day <= 5; day++) {
    const dateStr = `2026-09-${String(day).padStart(2, "0")}`;
    for (let hIdx = 0; hIdx < createdHabits.length; hIdx++) {
      const habit = createdHabits[hIdx];
      const isDone = sepMatrix[hIdx][day - 1] ?? true;
      await prisma.habitLog.create({
        data: {
          habitId: habit.id,
          date: dateStr,
          completed: isDone,
          value: isDone ? habit.targetValue : 0,
        },
      });
    }
  }

  // 4. Create August Tasks & Daily Intentions
  const augustTasks = [
    {
      title: "August Architecture & Life Sprint Review",
      description: "Map Q3 trajectory and establish primary habit anchors.",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: "2026-08-02",
      dueTime: "11:00 AM",
      category: "Mind",
      goalId: goal.id,
      milestoneId: milestone1?.id,
      completedAt: new Date("2026-08-02T11:30:00"),
    },
    {
      title: "Set up Prisma & SQLite Schema",
      description: "Establish local relational models for habits, goals, and daily tasks.",
      priority: "URGENT",
      status: "COMPLETED",
      dueDate: "2026-08-06",
      dueTime: "4:00 PM",
      category: "Craft",
      goalId: goal.id,
      milestoneId: milestone1?.id,
      completedAt: new Date("2026-08-06T16:00:00"),
    },
    {
      title: "Design System Tokens & Palette Harmonization",
      description: "Refine warm cream linen and deep forest green color variables.",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: "2026-08-11",
      dueTime: "2:30 PM",
      category: "Craft",
      goalId: goal.id,
      milestoneId: milestone2?.id,
      completedAt: new Date("2026-08-11T14:30:00"),
    },
    {
      title: "Mid-August Physical Benchmark & 5K Run",
      description: "Track endurance pace, heart rate variability, and post-run stretch.",
      priority: "MEDIUM",
      status: "COMPLETED",
      dueDate: "2026-08-15",
      dueTime: "7:00 AM",
      category: "Body",
      goalId: goal.id,
      completedAt: new Date("2026-08-15T08:00:00"),
    },
    {
      title: "Read 2 Books on Systems Design & Ergonomics",
      description: "Finish chapters on resilient distributed state and mindful computing.",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: "2026-08-20",
      dueTime: "9:00 PM",
      category: "Mind",
      goalId: goal.id,
      completedAt: new Date("2026-08-20T21:30:00"),
    },
    {
      title: "Interactive Sensory UI Prototyping",
      description: "Build micro-interactions for streak indicators and milestone nodes.",
      priority: "URGENT",
      status: "COMPLETED",
      dueDate: "2026-08-24",
      dueTime: "5:00 PM",
      category: "Craft",
      goalId: goal.id,
      milestoneId: milestone2?.id,
      completedAt: new Date("2026-08-24T17:00:00"),
    },
    {
      title: "Weekend Hiking & Mobility Reset",
      description: "Trail walk to reset focus and disconnect from monitors.",
      priority: "MEDIUM",
      status: "COMPLETED",
      dueDate: "2026-08-29",
      dueTime: "8:00 AM",
      category: "Body",
      goalId: goal.id,
      completedAt: new Date("2026-08-29T10:00:00"),
    },
    {
      title: "August Monthly Retrospective & Habit Audit",
      description: "Calculate consistency score, review missed habits, and recalibrate for September.",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: "2026-08-31",
      dueTime: "8:00 PM",
      category: "Mind",
      goalId: goal.id,
      completedAt: new Date("2026-08-31T20:30:00"),
    },
    {
      title: "Draft Mobile Responsive Layouts",
      description: "Fine-tune collapsible sidebar and card layouts on phone viewports.",
      priority: "LOW",
      status: "PENDING",
      dueDate: "2026-08-28",
      dueTime: "3:00 PM",
      category: "Craft",
      goalId: goal.id,
    },
    {
      title: "Calisthenics Rings Workout Session",
      description: "Inverted rows, dips, and core tension work.",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: "2026-08-26",
      dueTime: "6:30 PM",
      category: "Body",
      goalId: goal.id,
    },
  ];

  for (const t of augustTasks) {
    await prisma.task.create({ data: t });
  }

  // 5. September Current Tasks
  const sepTasks = [
    {
      title: "Create a progress",
      description: "Compile sprint milestones and outline weekly progress sync.",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: "2026-09-04",
      dueTime: "6:00 PM",
      category: "Mind",
      goalId: goal.id,
      milestoneId: milestone1?.id,
      completedAt: new Date("2026-09-04T18:00:00"),
    },
    {
      title: "Mind Body Craft Alignment",
      description: "Review daily balance across mind, physical health, and engineering craft.",
      priority: "MEDIUM",
      status: "COMPLETED",
      dueDate: "2026-09-04",
      dueTime: "8:00 PM",
      category: "Body",
      goalId: goal.id,
      milestoneId: milestone2?.id,
      completedAt: new Date("2026-09-04T20:00:00"),
    },
    {
      title: "Create Productivity System",
      description: "Refactor core event loop and data sync for Rooted tracker.",
      priority: "URGENT",
      status: "COMPLETED",
      dueDate: "2026-09-04",
      dueTime: "10:00 PM",
      category: "Craft",
      goalId: goal.id,
      milestoneId: milestone2?.id,
      completedAt: new Date("2026-09-04T22:00:00"),
    },
    {
      title: "Chaim Project Review",
      description: "Review creative deliverables and prepare final release notes.",
      priority: "HIGH",
      status: "PENDING",
      dueDate: "2026-09-05",
      dueTime: "12:00 PM",
      category: "Craft",
      goalId: goal.id,
    },
    {
      title: "Calisthenics & Strength Circuit",
      description: "Warmup, pullups, core hollow body holds, and cooldown mobility.",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: "2026-09-05",
      dueTime: "7:00 AM",
      category: "Body",
      goalId: goal.id,
    },
    {
      title: "Design System Tokens Polish",
      description: "Harmonize palette variables and verify contrast accessibility.",
      priority: "LOW",
      status: "PENDING",
      dueDate: "2026-09-06",
      dueTime: "2:00 PM",
      category: "Craft",
      goalId: goal.id,
    },
    {
      title: "DBMS & Query Optimization Assignment",
      description: "Complete database indexing problem set and performance benchmarking.",
      priority: "HIGH",
      status: "PENDING",
      dueDate: "2026-09-05",
      dueTime: "4:00 PM",
      category: "Study",
      goalId: goal.id,
    },
    {
      title: "Q3 Client Roadmap & Career Sync",
      description: "Prepare technical architecture slides and executive sprint demo.",
      priority: "URGENT",
      status: "PENDING",
      dueDate: "2026-09-06",
      dueTime: "11:30 AM",
      category: "Career",
      goalId: goal.id,
    },
  ];

  for (const t of sepTasks) {
    await prisma.task.create({ data: t });
  }

  console.log("Database seeded successfully with multi-month August & September data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
