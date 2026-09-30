# Question 03: Database Schema & Relations

## ❓ Sawaal (Question):
**"Rooted ka database schema kaisa hai? Goal, Milestone, Task aur Habit aapas mein kaise relate karte hain?"**

---

## 💡 Aasan Jawaab (Answer):

Rooted ka database **Prisma ORM** ke zariye structured hai. Iska main structure user ke daily actions ko uske baray goals se jorta hai:

```
[Goal] (Bara Maqsad)
  ├── 1-to-Many ──> [Milestone] (Chotay Stages: Seed, Sprout, Milestone)
  │                     └── 1-to-Many ──> [Task] (Daily Kaam)
  ├── 1-to-Many ────────────────────────> [Habit] (Rozana Ki Aadat)
  │                                           └── 1-to-Many ──> [HabitLog] (Roz ka Tick/Cross)
  └── [SleepLog] & [Note] (Alag Health aur Thoughts ki Tables)
```

### 1. Main Models:
1. **`Goal`**: Bara vision (jaise: "Full Stack Developer Banna").
2. **`Milestone`**: Goal ke checkpoints (Seed → Sprout → Milestone).
3. **`Task`**: Roz ke karne walay kaam jinki due date aur priority (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) hoti hai.
4. **`Habit`**: Continuous aadatain (frequency, target days).
5. **`HabitLog`**: Date-by-date record (`completed: true/false`).
6. **`SleepLog`**: Bedtime, wake time, aur neend ke total minutes.

### 2. Relations aur Safety Rules (Foreign Keys):
- **Goal $\rightarrow$ Milestone (Cascade Delete)**:
  Agar Goal delete hoga, toh uske Milestones bhi automatically saaf ho jayenge.
- **Goal $\rightarrow$ Task / Habit (`onDelete: SetNull`)**:
  Agar Goal delete ho jaye, tab bhi user ke daily Tasks aur Habits mehfooz rehte hain, sirf unka goal link null ho jata hai (data loss nahi hota).
- **Habit $\rightarrow$ HabitLog (`@@unique([habitId, date])`)**:
  Ek habit ka ek din mein sirf ek hi log ho sakta hai, taake duplicate entries na ban sakein.

---

### 🎯 Interview One-Liner Summary:
*"Humara relational schema strict hierarchy follow karta hai: Goal ke andar Milestones hote hain, jinse daily Tasks aur Habits linked hote hain. Is tarah daily task seedha baray vision ke sath sync rehta hai."*
