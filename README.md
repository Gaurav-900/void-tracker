# 🌌 VOID Tracker

[![VOID Logo](public/logo.png)](http://localhost:5173/)

**VOID** is a premium, minimalist, and high-discipline habit tracking web application. Designed for those who value focus and performance over gamification, VOID features a "True Black" aesthetic optimized for OLED screens and mobile-first, offline-first usage.

## ✨ Key Features

### 📅 Daily Routine Checklist
- **Step-by-Step Routines:** Morning, Daytime, Evening, and Night routines organized into expandable sections.
- **Granular Tracking:** Every small step (e.g., "Drink 500ml water", "Sunscreen", "Mewing") contributes to your overall daily completion score.
- **Visual Feedback:** Success pulse animations and real-time progress bars for each section.

### 🍱 Specialized Habit Modules
- **Water Tracker:** Interactive count tracker with goal-based progress.
- **Skincare:** AM/PM routine checklists.
- **Sleep:** Bedtime and Wake-up time tracking with automatic duration calculation.
- **Check Habits:** Standard flick-to-complete habits for anything from reading to posture.

### 📈 Performance & Stats
- **Weekly Heatmap:** A visual 7-day grid showing your consistency across all habits.
- **Honest History:** Past days left "pending" are automatically flagged as "Missed" (Deep Red) for total transparency.
- **Streak Calculation:** Automatic fire badges 🔥 for consecutive days of success.
- **Trend Metrics:** Week-over-week performance comparisons.

### 🔒 Data & Portability
- **Offline First:** All data is stored locally in your browser (LocalStorage). No account required, no tracking.
- **Backup System:** Export your entire tracking history to a JSON file and import it anytime.

## 🛠️ Tech Stack
- **Framework:** React + Vite
- **Styling:** Vanilla CSS (Custom Design System: "Void")
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Math:** [date-fns](https://date-fns.org/)
- **PWA:** Managed via `vite-plugin-pwa` for offline installation.

## 🚀 Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/void-tracker.git
   cd void-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
To generate the static production files (including PWA service worker):
```bash
npm run build
```
The output will be in the `dist/` directory, ready to be deployed to Netlify, Vercel, or any static hosting.

## 📱 Mobile Installation
Since VOID is a **Progressive Web App (PWA)**, you can install it on your phone:
1. Open the deployed URL in Chrome (Android) or Safari (iOS).
2. Tap "Add to Home Screen".
3. VOID will appear in your app drawer and run as a standalone app without the browser UI.

---
*Built for discipline. Powered by the Void.*
