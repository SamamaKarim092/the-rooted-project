# Question 08: Production Scaling & Dual Database

## ❓ Sawaal (Question):
**"Local environment mein toh SQLite file use ho rahi hai. Production (jaise Vercel) par deploy karne ke liye database ko kaise handle kiya?"**

---

## 💡 Aasan Jawaab (Answer):

Serverless platforms (jaise Vercel) par local SQLite file (`dev.db`) store nahi ki ja sakti kyunki serverless lambdas ephemeral (temporary) hotay hain aur har restart par file wipe ho sakti hai.

Iska solution humne **Dual Database Engine** se nikala:

### 1. Cloud Turso (LibSQL):
Humne **Turso** use kiya, jo ke SQLite ka hi distributed, cloud-hosted version hai (LibSQL engine par bana hai).

### 2. Prisma Driver Adapter (`@prisma/adapter-libsql`):
`src/lib/prisma.ts` mein humne smart adapter logic likhi:

```typescript
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoAuthToken) {
    // Production: Turso Cloud LibSQL
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoAuthToken });
    return new PrismaClient({ adapter });
  }

  // Local Development: Local SQLite file
  return new PrismaClient();
}
```

### 3. Is Architecture Ka Sabse Bara Fayda:
- **Zero Code Rewrites**: Code mein ek bhi query badalne ki zaroorat nahi pari.
- **Fast Development**: Offline / Local laptop par bina internet ke fast SQLite chalti hai.
- **Production Persistence**: Cloud par deploy hote hi Turso automatically connect ho jata hai, jisse multi-region fast speed aur permanent storage milti hai.

---

### 🎯 Interview One-Liner Summary:
*"Prisma LibSQL adapter use karke humne dual-database system banaya: local development mein simple SQLite file chalti hai aur production Vercel deployment par cloud Turso serverless database seamlessly connect ho jata hai bina kisi query change ke."*
