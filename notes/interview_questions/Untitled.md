
middleware.ts:

- Yeh hamre application ka aik tareeqai sai security guard hai. 
- Jab bhi user hamare website par aata hai aur kisi link par click karta hai tu (/tasks) (/habits) tou wou page uskai pass khulnai sai pehle sab se pehle middleware.ts kai pass jate hai. Aur guard 3 cheezain check karta hai.

 1. _"Kya user logged in hai ya nahi?"_
2. _"Kya user ko is page par jane ki ijazat hai?"_
3. _"Agar user logged in nahi hai, toh use sign-in page par redirect kar do."_

## Code Ka Line-by-Line Postmortem:

### 1. Public Routes Ki List (Lines 4–10)

const isPublicRoute = createRouteMatcher([
  "/",
  "/landing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
]);

- **Maqsad**: Yahan humne guard ko un darwazon ki list di hai jo **har aam insaan ke liye khulay** hain, jinke liye login hona zaroori nahi:
    - `/` (Landing page jahan naya visitor aata hai)
    - `/sign-in` aur `/sign-up` (Login aur register ke pages)
    - `/api/webhook` (Agar Clerk ya kisi service ko data bhejna ho)

### 2. The `/landing` Redirect Rule (Lines 13–16)

if (req.nextUrl.pathname === "/landing") {
  return NextResponse.redirect(new URL("/", req.url));
}

- **Kyun hai yeh?** Pehle landing page `/landing` par hota tha. Humne faisla kiya ke main landing page seedha root URL (`http://localhost:3000/`) par hi hona chahiye.
- Agar koi user ghalti se `/landing` type kare, middleware foran usko pakar kar root `/` par redirect kar deta hai.

### 3. Route Protection & Security (Lines 18–23)

if (!isPublicRoute(req)) {
  const signInUrl = new URL("/sign-in", req.url);
  await auth.protect({
    unauthenticatedUrl: signInUrl.toString(),
  });
}

- **Yeh sabse zaroori security block hai!**
- Agar koi unauthenticated user directly private pages access karne ki koshish kare (jaise `/tasks`, `/habits`, `/seasons`, `/notes`, `/settings`):
    - Middleware dekhta hai: `!isPublicRoute` (yeh public page nahi hai!).
    - `auth.protect()` trigger hota hai.
    - User ko **foran `/sign-in` page par phenk (redirect kar) diya jata hai**.
    - Login kiye baghair koi bhi user kisi ka personal dashboard ya data nahi dekh sakta.