# Question 07: Authentication, Multi-Tenancy & Auto-Claim Protocol

## ❓ Sawaal (Question):
**"Aapne multi-tenancy aur user privacy kaise enforce ki? Aur aapka Auto-Claim protocol kya problem solve karta hai?"**

---

## 💡 Aasan Jawaab (Answer):

Rooted pehle single-user system ke taur par chalta tha, lekin humne isay **multi-tenant** banaya taake har user ka data 100% private aur isolated rahe.

### 1. Multi-Tenant Partitioning (`userId` Scoping):
Database ke har main table (`Task`, `Habit`, `Goal`, `SleepLog`, `Note`) mein humne **`userId`** ka column add kiya:
```prisma
model Task {
  id      String @id @default(cuid())
  userId  String @default("default_user")
  // ...
  @@index([userId])
}
```
- **Strict Isolation**: Har query aur mutation mein `where: { userId }` lagta hai. Koi bhi user doosre user ka data na dekh sakta hai aur na edit kar sakta hai.

### 2. Auto-Claim Protocol Kya Hai? (`claimDefaultUserData`)
Jab humne Clerk authentication lagayi, toh purana sample ya seed data `"default_user"` ke naam par tha. Naye real user ke login hone par purana data gayab ho jata ya orphan ban jata.

Is maslay ko solve karne ke liye humne **Auto-Claim Protocol** likha:
1. Jab pehla real user Clerk se sign-in karta hai:
2. System check karta hai ke kya target user ke paas koi tasks hain? (Nahi).
3. System check karta hai ke kya unassigned `"default_user"` ka data pada hai? (Haan).
4. Prisma **`$transaction`** chala kar saare unassigned tasks, habits, goals aur sleep logs foran us real user ke account mein transfer (claim) kar deta hai.
5. Iske baad aane walay har naye user ko uska apna fresh, clean account milta hai.

---

### 🎯 Interview One-Liner Summary:
*"Humne har table ko `userId` aur indexes ke zariye partition kiya hai taake strict tenant isolation rahe, aur Auto-Claim Protocol ke zariye purana local data pehle authenticated user ko automatically transfer ho jata hai bina kisi data loss ke."*
