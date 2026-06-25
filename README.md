# PulsefitX — AI Fitness Coach

> A production-ready, full-stack SaaS that turns fitness tracking into personalized coaching. Built with React 19, TanStack Start, TypeScript, Tailwind CSS v4, Firebase, and Google's Gemini AI.

[![Live Preview](https://img.shields.io/badge/Live%20Preview-PulsefitX-3B82F6?style=flat&logo=netlify)](https://id-preview--26f94e55-ca50-4809-bd9d-8eb8d76dfe28.lovable.app)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![TanStack Start](https://img.shields.io/badge/TanStack%20Start-v1-FF4154?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Coach-4285F4?logo=google)

---

## What is PulsefitX?

PulsefitX is an AI-powered fitness coach that goes beyond simple calorie counting. It combines:

- **Personalized nutrition & meal planning** — AI generates daily meal plans from the ingredients you actually have, including Japanese staples like rice, miso, natto, and sushi.
- **Activity & recovery tracking** — Log workouts, steps, water, sleep, and heart rate. A custom recovery score suggests how hard to push each day.
- **AI Coach chat** — Ask anything about nutrition, workouts, recovery, or habits. Gemini responds in English or Japanese based on the user's selected language.
- **Progress analytics** — Beautiful charts for calories, macros, steps, and weekly trends.
- **Multi-language support** — Full English and Japanese localization across the landing page, dashboard, and every authenticated route.

---

## Why Recruiters Should Care

This isn't a toy demo. It demonstrates the full lifecycle of a modern SaaS product:

| Area | What it proves |
|------|----------------|
| **Frontend architecture** | React 19, TanStack Start (file-based routing + SSR), TanStack Query, strict TypeScript, and Tailwind CSS v4 with OKLCH color tokens. |
| **State & data** | Firebase Auth + Firestore for real-time user data, avatar uploads, and secure account deletion. |
| **AI integration** | Server-side Gemini calls with multi-model fallback, JSON-structured output, and language-aware prompts. |
| **Production thinking** | SSR deployment on Netlify, environment-based config, responsive design, and WebView-specific auth bridge for native Android apps. |
| **UX & accessibility** | Loading states, error handling, form validation, dark mode, and mobile-first responsive layouts. |

---

## Tech Stack

- **Framework:** React 19 + TanStack Start v1 + Vite 8
- **Language:** TypeScript 5.8 (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui primitives
- **State:** TanStack Query + React Context
- **Backend:** Firebase Authentication + Firestore (browser SDK)
- **AI:** Google Gemini API via TanStack `createServerFn`
- **Charts:** Recharts
- **Animation:** Framer Motion
- **Deployment:** Netlify
- **Package manager:** Bun

---

## Key Features

### Landing Page
- Dark SaaS aesthetic with neon-green accents and glassmorphism
- Animated sections, testimonials, FAQ, and stats band
- Language switcher (English / Japanese) on every page
- Mobile-responsive navigation

### Authentication
- Email & password sign-up / sign-in
- Google sign-in with popup fallback
- Native Android WebView bridge for Google Sign-In via `AndroidBridge`
- Password reset and secure account deletion with re-authentication

### Onboarding
- Multi-step onboarding flow collects goals, body stats, lifestyle, diet, and budget
- Auto-calculates BMR/TDEE using the Mifflin-St Jeor equation
- Generates personalized calorie, protein, step, and water targets

### Dashboard
- Personalized greeting based on time of day
- Goal-driven daily plan (calories, protein, steps, water)
- AI coach insight generated from today's logged data
- Macro breakdown pie chart and 7-day progress line chart
- Quick logging for calories, protein, steps, and water

### Nutrition
- Food database with 21+ Japanese staple foods
- Meal logging by breakfast, lunch, dinner, snack
- Custom food entry with servings
- Macro tracking and 7-day calorie/protein history charts

### Activity & Recovery
- Workout logger with MET-based calorie estimation
- Recovery score algorithm based on sleep, resting heart rate, and energy
- Weekly activity chart and today's session list
- Quick logging for steps, distance, sleep, and resting HR

### AI Coach
- Conversational chat powered by Gemini
- Multi-model fallback chain (`gemini-3.5-flash`, `gemini-3.1-flash-lite`, `gemini-3-flash`) to stay on free-tier models
- Graceful handling of high-demand / rate-limit errors
- Responses follow the user's selected language

### Meal Planner
- Add available ingredients
- AI generates a full day's meal plan with macros and coach tips
- Strict JSON output parsing for reliable structured data

### Profile
- Avatar upload and removal
- Editable personal details, goals, activity level, diet, and budget
- Two-step account deletion with "DELETE" confirmation and password re-authentication

---

## Project Structure

```text
src/
  components/        # Reusable UI components (app + landing)
  lib/               # Utilities, contexts, AI functions, Firestore helpers
  routes/            # TanStack file-based routes
  styles.css         # Global theme, OKLCH tokens, Tailwind v4 imports
  assets/            # Images, avatars, team photos
public/              # Static assets
netlify.toml         # Netlify SSR routing configuration
vite.config.ts       # Vite + TanStack + Netlify nitro preset
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/pulsefitx.git
cd pulsefitx
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Firebase (client config) — safe to expose, used by Firebase Auth SDK
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini (server-side secret)
GEMINI_API_KEY=your_gemini_api_key
```

> The Firebase `apiKey` is intentionally public — it's how the Firebase web SDK works. The Gemini key stays server-side via TanStack server functions.

### 4. Enable Firebase services

In the Firebase console:
- Enable **Authentication** → Email/Password and Google provider
- Enable **Firestore Database** and set rules to allow authenticated users
- Add your domain to authorized domains if deploying custom domain

### 5. Run locally

```bash
bun dev
```

The app will be available at `http://localhost:8080` (or the port shown in the terminal).

### 6. Build for production

```bash
bun run build
```

---

## Deployment to Netlify

1. Push the code to a GitHub repository.
2. In Netlify, click **Add new site** → **Import an existing project** → select your GitHub repo.
3. Set the build command:
   ```
   bun run build
   ```
   Set publish directory to:
   ```
   dist
   ```
4. Add environment variables in Netlify under **Site settings → Environment variables**:
   - `GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `NODE_VERSION` → `20` (or higher)
   - `NITRO_PRESET` → `netlify` (optional, already set in `vite.config.ts`)
5. Trigger a deploy. Netlify will handle SSR via the Netlify preset.

---

## Mobile / WebView Notes

Google sign-in via `signInWithPopup` is blocked in many in-app browsers. The app detects Android WebViews and, if the native host exposes `window.AndroidBridge.googleSignIn()`, delegates sign-in to the Android Google Sign-In SDK. The native app then calls `window.handleGoogleIdToken(idToken)` to complete Firebase authentication.

For regular mobile browsers, users can sign in with email/password or open the site in Chrome/Safari for Google sign-in.

---

## License

This project is open for learning and portfolio purposes. If you reuse significant portions, please credit the original author.

---

## Connect

Built by **Ohio Code Hunter** — full-stack developer focused on clean, scalable, well-typed products.

- [LinkedIn](https://www.linkedin.com/in/ohiocodehunter/)
- [GitHub](https://github.com/ohiocodehunter)

If you try the app, feedback is welcome. PRs and issues are open.
