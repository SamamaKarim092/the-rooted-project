# Question 06: Sleep Tracking & Midnight Arithmetic

## ❓ Sawaal (Question):
**"Sleep Tracking feature mein midnight boundary (raat 11:30 PM se agle din subah 7:00 AM) ka duration calculation aapne kaise handle kiya?"**

---

## 💡 Aasan Jawaab (Answer):

Neend ka duration calculate karna aam subtraction (`Wake - Bed`) se nahi hota kyunki neend **aadhi raat (12:00 AM / Midnight)** cross karti hai.

### 1. Problem Kya Thi?
- Agar user raat **11:00 PM (23:00 = 1380 mins)** par soya aur subah **07:00 AM (420 mins)** par utha:
- Simple subtraction: `420 - 1380 = -960` (negative result aa jata hai jo ghalat hai).

### 2. Math Formula (Overnight Arithmetic):
Humne isay minute-level par convert karke 2 scenarios mein handle kiya:

```typescript
const bedMins = parseTimeToMinutes(bedtime);
const wakeMins = parseTimeToMinutes(wakeTime);

let durationMinutes = 0;
if (wakeMins >= bedMins) {
  // Scenario A: Same calendar day (e.g. 01:00 AM to 08:00 AM)
  durationMinutes = wakeMins - bedMins;
} else {
  // Scenario B: Crossing Midnight (e.g. 11:00 PM to 07:00 AM)
  // Ek din mein 1440 minutes hotay hain (24h * 60m)
  durationMinutes = (1440 - bedMins) + wakeMins;
}
```
*(Example: `(1440 - 1380) + 420 = 60 + 420 = 480 mins = 8 hours exact!`)*

### 3. Target Evaluation (Surplus vs Deficit):
User ke target (e.g., 8.0 ghantay) se compare kiya jata hai:
- **Optimal Rest ($\pm 15$ mins)**: Target poora hua (Green).
- **Sleep Debt / Deficit ($< -15$ mins)**: Neend ki kami (Terracotta warning, e.g., `-1h 30m Deficit`).
- **Overslept ($> +15$ mins)**: Ziada sona (Sand warning, e.g., `+45m Overslept`).

---

### 🎯 Interview One-Liner Summary:
*"Midnight boundary handle karne ke liye hum time ko 1440 daily minutes mein convert karte hain: aadhi raat tak ke bache hue minutes plus subah ke wake minutes ko add karke accurate overnight duration nikaalte hain."*
