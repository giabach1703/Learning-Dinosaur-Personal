# 🦕 Learning Dinosaur v1.0.0

> **Version:** `v1.0.0`  
> **Release Date:** June 1, 2026  
> **Status:** 🟢 Stable  
> **Target Branch:** `main`

---

## 🚀 Summary
- **Modernized Stack:** Transitioned from a Vite + JSX prototype to a robust production-ready architecture with **UmiJS v3 + TypeScript** on the Frontend and a layered structure (**Express v5 + TypeScript + Prisma ORM v6 + MySQL**) on the Backend.
- **Mobile-First Study Experience:** Completely optimized flashcard study on mobile devices with fixed-bottom action keys, vertical progress bar, and internally-scrollable card container.
- **New CMS Tools:** Integrated a Rich Text Editor (TinyEditor) for term/definition formatting and free Base64 image upload/removal for flashcards.
- **Smarter Study & Gamification System:** Added Daily Streak tracking, 6 dinosaur levels based on XP, automated badges, and 10-second client-side caching to reduce server workload.

---

## 📊 Breakdown of Changes

| Component / Feature | Before (Vite Prototype) | After (v1.0.0 Release) |
|---|---|---|
| **Frontend Framework** | Vite + React (JSX) | **UmiJS v3 + TypeScript (TSX)** |
| **Backend Architecture** | Flat controller files directly calling DB | **Layered architecture (Controller → Service → Repository)** |
| **Database & ORM** | Mock JSON / Manual SQL files | **MySQL Database + Prisma ORM v6 (`npx prisma db push`)** |
| **Google Auth** | Standard Email/Password login only | **Google OAuth Login + JWT Sessions** |
| **Flashcard Creation** | Form with text input fields | **Quizlet-style bulk card creator** |
| **Text & Media Editing** | Standard text inputs | **Rich Text Editor (TinyEditor) + Base64 image upload/removal** |
| **Language Selection** | Hardcoded text label | **Popover Language Picker (Grouped, 50+ languages with search)** |
| **Mobile Study UI** | Standard card view, horizontal progress | **Vertical progress bar, scrollable card, fixed-bottom controls** |
| **API Caching** | Direct API calls on every render | **10s Client-side cache (auto-invalidates on add/edit/delete)** |
| **Anti-Spam Security** | Vulnerable to XP double-click spam | **`useRef` lock to prevent multiple concurrent XP claims** |
| **Dinosaur Levels** | Static levels, T-Rex level bug (`undefined`) | **Dynamic calculation, fixed T-Rex rank name (`T-Rex Mê Học`)** |
| **Sidebar Navigation** | Native standard links | **Umi Link router (supports Cmd/Ctrl+Click to open in new tab)** |
| **Logout & Streak UX** | Header dropdown menu | **Sidebar Footer section (shows Streak, XP, Rank, Logout)** |
| **Seeded Demo Data** | 3 basic study decks | **16 high-quality sample decks & 18 textbooks solved** |

---

## 📦 Dependencies

| Package | Frontend | Backend |
|---|---|---|
| **React** | `^17.0.2` | - |
| **UmiJS / Express** | `^3.5.41` | `^5.2.1` |
| **Ant Design** | `^4.24.15` | - |
| **Axios** | `^1.6.0` | - |
| **Prisma ORM** | - | `^6.19.3` |
| **Zod / Validator** | - | `^4.4.3` |
| **Google Auth Library**| - | `^10.6.2` |
| **TypeScript** | `^4.9.5` | `^5.4.5` |

---

## 💻 Quick Start

### 1. Database Setup
Create a MySQL database named `learning_dinosaur`:
```sql
CREATE DATABASE learning_dinosaur CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd learning-dinosaur-backend
npm install
# Configure your .env file
npx prisma db push
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd learning-dinosaur
npm install
npm start
```
*Frontend runs at `http://localhost:8000`, Backend runs at `http://localhost:5000`.*

### 🔑 Demo Account
- **Email:** `demo@learningdinosaur.com`
- **Password:** `123456`

---

## 📋 Steps to Create GitHub Release
1. Open [GitHub Repo](https://github.com/Trgiang10/WEB_Learning_Dinosaur) → **Releases** → **Create a new release**.
2. **Choose Tag:** `v1.0.0`
3. **Title:** `🦕 Learning Dinosaur v1.0.0`
4. **Description:** Copy & paste the markdown content of this file (`RELEASE.md`).
5. Check **"Set as the latest release"** and click **Publish release** 🚀
