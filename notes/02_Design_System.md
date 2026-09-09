# 02. Design System & Aesthetics

Parent: [[00_Index]] | Previous: [[01_Project_Overview]] | Next: [[03_Architecture_and_Data_Model]]

---

## 🎨 Visual Identity ("Rooted")

The design is strictly based on **`design/design_concept_6.jpg`**. The aesthetic is tranquil, organic, grounded, and editorial—departing from harsh modern tech dashboards in favor of earthy warmth and calm focus.

---

## 🖌️ Color Palette Tokens

| Token Name | Hex Code | Visual Role / Usage |
| :--- | :--- | :--- |
| **`cream-bg`** | `#F7F4EB` | Main app background canvas, soft warm linen texture |
| **`cream-card`** | `#FFFFFF` / `#FDFCFA` | Light card surfaces (Habit Growth matrix, Weekly Flow card) |
| **`cream-border`** | `#EBE6DA` | Subtle separators and card outlines |
| **`forest-dark`** | `#1E3127` | Primary dark surface (Daily Intentions card, Long-Term Vision card) |
| **`forest-card`** | `#24372D` | Elevated dark card elements and active sidebar highlights |
| **`forest-light`** | `#2E463A` | Subtle dark borders and hover states on dark surfaces |
| **`terracotta`** | `#D98A6C` | Warm accent (fire streak icons, missed habit dots, Craft pill) |
| **`sage`** | `#7C9A86` | Organic success green (completed habit dots, progress tracks) |
| **`clay`** | `#C87452` | Deeper terracotta tone for active buttons and badges |
| **`sand`** | `#D4A373` | Golden caramel tone for streak numeric pill badges |
| **`text-dark`** | `#1A241E` | Primary typography on cream surfaces |
| **`text-muted`** | `#6B7C72` | Secondary labels, descriptions, and subtitle text |
| **`text-light`** | `#F4F1EA` | Typography on dark forest green surfaces |

---

## 🖋️ Typography

1. **Serif Font (Editorial Headings & Brand)**:
   - Primary: **Fraunces** or **Playfair Display** (Google Fonts).
   - Used for: "Rooted" logo, "Good morning, Alex" greeting, card titles ("Daily Intentions", "Habit Growth", "Long-Term Vision", "Weekly Flow"), and major score metrics.

2. **Sans-Serif Font (UI, Controls & Badges)**:
   - Primary: **Plus Jakarta Sans** or **Inter**.
   - Used for: Navigation labels, task titles, timestamps, button text, and small indicators.

---

## 🧱 Key UI Components & Anatomy

### 1. The Header Capsule Bar
Top-right of the dashboard features three floating organic capsules:
- **Harmony Score**: `91% Harmony` (Overall consistency score across tasks and habits).
- **Streak Counter**: `24 Days Rooted` (Accompanied by an earthy flame/leaf icon).
- **Daily Progress**: `5 of 7 Daily Intentions` (Completed tasks & habits ratio).

### 2. Category Pill Badges
Rounded pill tags (`rounded-full px-3 py-1 text-xs font-medium`):
- `Mind`: Soft sage / forest green tint (`#EAF0EC` / `#5F7E6A`) — Mental clarity, reading, reflection.
- `Body`: Warm clay / terracotta tint (`#F9ECE6` / `#C87452`) — Physical fitness, workouts, health, rest.
- `Craft`: Earthy bronze / sand tint (`#F5E8DC` / `#93593B`) — Creative skills, coding, side projects, design.
- `Spirit`: Gentle dusky lavender tint (`#F0EDF5` / `#6E6482`) — Stillness, mindfulness, meditation, recharge.
- `Study`: Calm scholar navy / slate blue tint (`#EBF1F5` / `#3D637E`) — Academic education, coursework, certifications, exams.
- `Career`: Polished deep olive / gold tint (`#F4F5EB` / `#636E39`) — Professional responsibilities, client work, workplace deliverables.

### 3. Habit Growth Matrix Grid
- Matrix displaying days of the week (`Mo`, `Tu`, `We`, `Th`, `Fr`, `Sa`, `Su`) against habits.
- Indicator dots:
  - **Sage Dot (`#7C9A86`)**: Completed habit.
  - **Terracotta Dot (`#D98A6C`)**: Missed or pending today.
  - **Muted Dot (`#E0DAD0`)**: Inactive day / rest day.
- **Streak Pill**: Rounded badge showing the consecutive streak number (e.g. `7`, `6`, `4`, `3`).

### 4. Botanical Milestone Progress Bar
A dark forest green track with an organic sage green fill:
- Node pins placed along the bar:
  - `Seed` (Starting checkpoint)
  - `Sprout` (Midway progress)
  - `Milestone` (Achieved marker)

### 5. Weekly Flow & Harmony Gauge
- A warm watercolor-style wave chart representing energy/completion flow Monday through Saturday.
- A circular dual-tone arc meter ("Harmony gauge") indicating weekly harmony percentage.
