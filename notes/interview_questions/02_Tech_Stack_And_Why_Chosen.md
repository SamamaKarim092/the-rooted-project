# Question 02: Tech Stack & Why Chosen

## ❓ Sawaal (Question):
**"Aapne is project ke liye kaunsa Tech Stack use kiya aur kyun chuna?"**

---

## 💡 Aasan Jawaab (Answer):

Maine is project mein modern, fast aur scalable stack choose kiya hai:

### 1. Next.js 16 (App Router) + React 19
- **Kyun chuna?**
  - **Server Actions**: Frontend se direct secure database mutations ho jati hain bina alag Express server banaye.
  - **Fast Performance**: Server Components data ko server par hi render kar dete hain, jisse page load time bohot fast hota hai.

### 2. TypeScript
- **Kyun chuna?**
  - **Zero Type Errors**: Code likhte waqt hi ghaltiyan pakri jati hain (compile-time safety), runtime par app crash nahi hoti.

### 3. Tailwind CSS v4
- **Kyun chuna?**
  - **Custom Design Tokens**: Humne custom earthy colors (`forest-green`, `cream`, `terracotta`) define kiye jo clean aur responsive UI dete hain bina kisi heavy external library ke.

### 4. Prisma ORM + SQLite / Turso (LibSQL)
- **Kyun chuna?**
  - **Type-safe Queries**: Database ke sath kaam karna asaan aur safe ho gaya.
  - **Dual Database Flexibility**: Local development mein zero-setup SQLite (`dev.db`), aur production deployment ke liye distributed cloud Turso (LibSQL).

### 5. Clerk Authentication
- **Kyun chuna?**
  - **Secure & Ready-to-use**: Sign-up, sign-in aur user session management bina khud se complex JWT/hash system likhe secure tareeqay se handle ho gaya.

---

### 🎯 Interview One-Liner Summary:
*"Maine Next.js 16 aur Server Actions is liye chune taake frontend aur backend ek hi unified codebase mein rahein, aur Prisma + SQLite/Turso se data safe, fast aur zero-config maintain ho sake."*
