
Prisma Folder: Is folder mai sab kuch hota jo database ko control karne kai lyai istamal mai aata hai 

schema.prisma: 

- Yeh hamare database ka blueprint hota hai. 
- File ke start mein hum Next.js ko batate hain ke humara database **SQLite** hai (`provider = "sqlite"`).
- Aur Prisma Client generate karne ki hidayat milti hai (`previewFeatures = ["driverAdapters"]` taake cloud Turso LibSQL se bhi connect ho sake).

- **Database Models (Tables)**: Isme humne application ke 8 main tables define kiye hain:
    
    1. `Goal`: Baray long-term targets (e.g., title, category, progress, status).
    2. `Milestone`: Goals ke chotay stages (`Seed`, `Sprout`, `Milestone`).
    3. `Task`: Daily to-dos (due date, priority `URGENT/HIGH/MEDIUM/LOW`, status `PENDING/COMPLETED`).
    4. `Habit`: Aadatain (frequency, target days per week, unit).
    5. `HabitLog`: Roz ka record (`date`, `completed: true/false`).
    6. `SleepLog`: Neend ka record (`bedtime`, `wakeTime`, `durationMinutes`, `quality`).
    7. `SleepSetting`: User ka sleep target (`targetHours`, e.g., 8.0h).
    8. `Note`: Field notes (`title`, `content`, `isPinned`, `category`).

- **Relations & Multi-Tenancy**:
    
    - Table ke darmiyan relationships (jaise Goal ke andar Milestones aur Tasks) yahan foreign keys (`@relation`) ke zariye define hain.
    - Har table mein `userId` column hai jo Clerk ke users ko alag alag partition karta hai.


dev.db: 

- Yeh hamare actual database hai.

- SQLite ek aisi database hoti hai jisko chalane ke liye MySQL ya Postgres ki tarah kisi alag heavy software ya background service ki zaroorat **nahi hoti**.
- SQLite sara data aapke computer par ek single file mein store karti hai.
- **`dev.db` hi woh actual binary file hai** jisme aapke saare tasks, habits, neend ke logs aur notes physically hard drive par save hotay hain.
- Jab aap app mein koi naya task banate hain, toh Prisma seedha is `dev.db` file ke andar jaakar likh deta hai.

dev.db.bak:

- `.bak` ka matlab hai **Backup**.
-  Jab humne database mein naye columns add kiye the (jaise multi-tenancy `userId` ya sleep tracking ke naye fields), humne safe side ke liye purane database ki ek copy bana li thi.
- Iska maqsad yeh hai ke agar migration ya schema push ke dauran koi ghalti ho jaye, toh purana data zaya na ho aur hum foran backup se restore kar sakein.


seed.ts:

- Jab koi naya developer ya examiner is project ko apne laptop par pehli baar clone karta hai, toh shuru mein database bilkul khali (empty) hota hai.
- Agar database khali hoga, toh dashboard, calendar, graphs aur habit streaks sab sooney aur khali nazar aayenge.
- seed.ts ka kaam - Yeh ek automated script hai .Yeh database mein automatically realistic dummy data bhar deti hai aik command chalane par.