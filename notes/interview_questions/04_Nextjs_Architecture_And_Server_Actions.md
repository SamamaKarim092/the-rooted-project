# Question 04: Next.js Architecture & Server Actions

## ❓ Sawaal (Question):
**"Next.js App Router mein Server Components vs Client Components kya hain, aur aapne Server Actions ko kaise use kiya?"**

---

## 💡 Aasan Jawaab (Answer):

Rooted mein maine Next.js 16 ka modern hybrid architecture use kiya hai:

### 1. Server Components vs Client Components
- **Server Components (`page.tsx`)**:
  - By default saare page components server par render hotay hain.
  - Yeh direct database (Prisma) se data fetch karte hain.
  - **Fayda**: User ke browser ko heavy JavaScript download nahi karni parti, page super fast load hota hai.
- **Client Components (`"use client"` jaise `TasksClient.tsx`, `HabitsClient.tsx`)**:
  - Jahan user interaction chahiye hoti hai (jaise buttons click karna, filters, modal open karna, drag-and-drop).
  - State management (`useState`, `useEffect`) yahan hoti hai.

### 2. Server Actions Kya Hain aur Kaise Kaam Karti Hain? (`src/lib/actions.ts`)
Pehle zamane mein frontend se backend ko data bhejne ke liye alag API routes (`/api/tasks`) likh kar `fetch()` ya `axios` use karna parta tha. 

Rooted mein humne **Server Actions (`"use server"`)** use ki hain:
- Yeh server-side functions hotay hain jo client component se seedha call ho jatay hain (jaise normal function call).
- Example: `toggleTaskStatus(taskId)` ya `createHabit(formData)`.
- **`revalidatePath("/")`**: Jaise hi database mein task complete hota hai, Next.js page ka cache revalidate kar deta hai aur user ko foran updated UI nazar aati hai.

### 3. Optimistic UI Updates:
Jab user checkbox par click karta hai, toh hum wait nahi karte ke server se response aaye. Hum screen par foran tick laga dete hain (optimistic state) aur background mein Server Action chalti hai. Isse app lag-free aur snappy lagti hai.

---

### 🎯 Interview One-Liner Summary:
*"Main data fetching ke liye Server Components use karta hoon taake fast initial load ho, user interactivity ke liye Client Components use karta hoon, aur database mutations ke liye Server Actions use karta hoon bina separate API routes banaye."*
