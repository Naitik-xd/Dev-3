# SubMaster 🎓

Smart, conflict-free teacher substitution management system for K–12 schools (Classes 1–12, 8 periods/day). Built for **HacktoberFest 26** (Beta).

---

## Features

- **Automated Constraint Engine**: Instant conflict-free substitution with 0 double-booking, max 8-period workload enforcement, base-load shielding (teachers with ≥6 lessons are protected), and wing proximity matching (Primary 1–5, Middle 6–8, Senior 9–12).
- **High-Absence Contingency Solver**: Auto-activates when absent staff exceeds 35% to redistribute study halls, library supervision, and co-teaching with 0 abandoned classrooms.
- **Gemma Intelligence Briefings**: Morning assembly handover briefings and continuity guidance powered by Gemma.
- **Global Rate Limiting**: Enforces a strict global ceiling of 80 Gemma requests per 5-hour rolling window across all users, with automatic graceful fallback to deterministic solving.
- **Export & Share**: Direct vector `.pdf` download with timetable grids and formatted WhatsApp handover messages with one click.
- **Master Timetable Explorer**: Interactive weekly grid showing busy slots, free periods, and teacher schedules.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / API**: Node.js, Express, Vercel Serverless Functions
- **AI Engine**: Google GenAI SDK (`@google/genai`) strictly using Gemma models (`gemma-4-26b-a4b-it`, `gemma-4-31b-it`, `gemma-2-27b-it`, `gemma-2-9b-it`)
- **Document Engine**: jsPDF & jsPDF-AutoTable

---

## Local Setup

1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd submaster
   npm install
   ```

2. **Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Vercel Deployment

1. Push your repository to GitHub.
2. Import the project into **Vercel** (Framework preset: **Vite**).
3. In **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
4. Deploy! `vercel.json` and the `/api` serverless routes are pre-configured.

---

## Security & Indexing

- **Search Engine Blocking**: `noindex, nofollow` is enforced across `<meta>` tags, `/public/robots.txt`, and server HTTP headers (`X-Robots-Tag: noindex, nofollow`).
- **Secret Protection**: `GEMINI_API_KEY` is server-side only and never exposed to the browser or bundled in client code.
- **Status**: Made for HacktoberFest 26. Currently in beta, not for public use.
