# Question 05: Habit Streak Calculation Logic

## ❓ Sawaal (Question):
**"Aapne Habit Streak calculate karne ka logic kaise likha? Agar user ne kal habit ki thi lekin aaj abhi tak nahi ki, toh kya streak toot jati hai?"**

---

## 💡 Aasan Jawaab (Answer):

Rooted ka streak engine **Calendar Continuity** par chalta hai, sirf raw numbers count nahi karta.

### 1. Streak Kaise Calculate Hoti Hai?
Har habit ke sath uske `HabitLog` records (dates) check hotay hain:
1. **Pehla Check (Aaj)**: Agar user ne **aaj** habit complete kar li hai, toh aaj se pichle lagataar (consecutive) din count hotay hain.
2. **Doosra Check (Kal / Grace Period)**: Agar aaj abhi complete nahi ki (kyunki abhi din khatam nahi hua), toh hum **kal (yesterday)** check karte hain. Agar kal complete thi, toh streak tooti nahi hai balki active hai! Streak kal se pichle dinon tak count hogi.
3. **Broken Streak**: Agar na kal complete thi aur na aaj, iska matlab gap aa chuka hai — **streak 0 ho jayegi**.

### 2. Minimum 2-Day Fire Badge Rule (`🔥`):
Aksar apps mein 1 din complete karne par hi aag (flame icon) dikha dete hain jo realistic nahi lagta.
- Rooted mein humne strict rule banaya hai: **Flame icon (`🔥`) sirf tab dikhta hai jab streak $\ge 2$ din ho**.
- 0 ya 1 din par neutral dash (`—`) ya simple number dikhta hai.

### 3. Best Streak (All-time Record):
Current streak ke ilawa hum history ke saare logs scan karke check karte hain ke user ka all-time longest continuous streak record kya raha hai, taake user ko pata chale uska personal best kya hai.

---

### 🎯 Interview One-Liner Summary:
*"Humara streak algorithm backward chronological continuity check karta hai: agar aaj task nahi hua lekin kal hua tha toh streak tootti nahi hai, aur continuous 2 ya usse zyada din hone par hi flame badge trigger hota hai."*
