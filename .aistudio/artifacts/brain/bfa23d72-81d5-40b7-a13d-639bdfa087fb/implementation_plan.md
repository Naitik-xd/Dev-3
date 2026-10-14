# SubMaster – Intelligent Teacher Substitution Management System

SubMaster is a streamlined, light-mode daily teacher substitution and timetable coordination platform for Classes 1–12 (one section per class, 8 periods per school day). It automates the generation of conflict-free, equitable substitution plans using Gemma 4 intelligence combined with deterministic constraint scheduling, featuring an absence basket, workload compliance monitors, live interactive slot overrides, and instant PDF/WhatsApp dispatch.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been established based on your clarifications:

- **Confirmed Decision 1 (Substitution Priority)**: Prioritization applies **grade-level proximity first** (matching teachers within the same academic wing: Primary Classes 1–5, Middle Classes 6–8, Senior Secondary Classes 9–12), followed by subject specialty affinity and equitable workload balancing.
- **Confirmed Decision 2 (Interactive Plan Editing)**: Coordinators will have **full interactive editing** over the generated plan. Every vacant period card allows 1-click teacher reassignment via an interactive modal with real-time conflict checking (period clashes, $\ge 6$ workload blocks, and wing tags).
- **Confirmed Decision 3 (Top Tabbed Navigation)**: The app uses a responsive, persistent top tabbed architecture: **Absence Basket & Roster**, **Live Substitution Plan**, and **Master Timetable & Workloads**, paired with mobile-optimized bottom utility sheets.
- **Confirmed Strict Constraints**: 
  - Exclusively clean light-mode theme (no dark mode, zero low-contrast clutter).
  - No decorative imagery (`generate_image` skipped in favor of clean Lucide iconography and typographic clarity).
  - Search engine exclusion tag `<meta name="robots" content="noindex, nofollow" />` in `index.html`.
  - Server-side API key containment through Express/Vite proxy routes with Gemma 4 model integration.
  - Strict absence threshold: If $> 50\%$ of teaching staff is marked absent, plan generation is locked with an administrative contingency warning.

---

### 1. Overview & Core Concept

- **What It Does**: SubMaster replaces chaotic morning whiteboard coordination with a fast, fail-safe digital pipeline. The school coordinator selects teachers calling in sick or on leave (assigning full-day, Periods 1–4, or Periods 5–8 absence scopes), checks real-time staff availability against the 50% safety threshold, and automatically produces a coordinated master substitution schedule.
- **Target Audience / Persona**: School Academic Coordinators, Vice Principals, and Timetable In-Charges managing K–12 schools (Classes 1 through 12, Periods 1 through 8).
- **Key Value**: 
  - Prevents teacher burnout and unfair allocations by enforcing a hard 8-period absolute daily ceiling and barring teachers already holding 6 regular periods from taking substitutions.
  - Guarantees zero schedule collisions (no double-booking in the same period, no self-substitution).
  - Maximizes instructional continuity through grade-level wing proximity (e.g., assigning a 4th-grade specialist rather than a 12th-grade physics lecturer to a primary classroom).
  - Produces instant, ready-to-dispatch outputs: one-click formatted WhatsApp messages for faculty groups and print/PDF-optimized substitution chits.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Morning Absence Logging & Staff Basket**:
   - The coordinator views the teacher directory (filterable by name, department, or wing) with live regular workload badges (e.g., "4/8 Periods Scheduled").
   - With one tap, a teacher is added to the Absence Basket.
   - For each absent teacher, the coordinator toggles their absence window: **Full Day (P1–P8)**, **Morning Half (P1–P4)**, or **Afternoon Half (P5–P8)**.
   - A persistent live health meter tracks the absence percentage. If absences exceed 50%, the generation button transitions to an emergency protocol state with clear guidance.

2. **Automated Plan Generation & Gemma 4 Briefing**:
   - The coordinator clicks **"Generate Substitution Plan"**.
   - The server processes all vacant periods across the school's 12 classes simultaneously using the constraint solver and Gemma 4 model, generating:
     - Specific substitute assignments for each vacant period.
     - Grade-level proximity matching rationale.
     - Workload delta indicators (e.g., "Workload updated: 4 → 5 periods").
     - An executive coordinator summary summarizing affected classes and coverage health.

3. **Interactive Plan Review & Manual Swapping**:
   - The coordinator reviews substitutions grouped either **By Class (Classes 1–12)** or **By Period (Periods 1–8)**.
   - Clicking any substitute assignment opens the **Reassign Teacher Modal**, which lists all available teachers during that period, ranked by suitability:
     - *Recommended (Wing Match + Low Load)*
     - *Eligible (Free period, load $\le 5$)*
     - *Ineligible (Greyed out with reason: e.g., "Teaching Class 10 in Period 3" or "Max load of 6 reached")*
   - Swapping updates both the plan and the live workload counters instantaneously.

4. **Export & Distribution**:
   - **WhatsApp Share**: One tap opens WhatsApp (or copies to clipboard) with cleanly structured markdown formatted with class numbers, periods, absent teachers, and assigned substitutes.
   - **Printable PDF View**: Generates a clean, monochrome printable substitution sheet with school header, date, teacher slips, and signatures block, compatible with browser PDF printing.

#### Visual Identity & Theme
- **Aesthetic Direction**: Crisp, utilitarian, high-legibility educational dashboard designed for rapid morning operations. Clean light mode with pure white (`#FFFFFF`) canvas, subtle slate surfaces (`#F8FAFC`, `#F1F5F9`), and refined neutral borders (`#E2E8F0`).
- **Color Palette & Discipline**:
  - *Dominant Canvas (60%)*: Crisp White (`#FFFFFF`) and Slate 50 (`#F8FAFC`).
  - *Structural Surfaces (30%)*: Card and row surfaces in `#FFFFFF` with hairline borders (`#E2E8F0`), slate text tokens (`#0F172A` headlines, `#475569` body).
  - *Accent Budget (10%)*: Deep Academic Blue (`#1E40AF` / `#2563EB`) for primary CTAs, with quiet semantic indicators (Emerald `#15803D` for safe loads, Amber `#B45309` for moderate loads, Crimson `#B91C1C` for conflicts and thresholds).
- **Typography & Hierarchy**:
  - *Display / Headings*: Plus Jakarta Sans (`font-semibold`, tracking tight).
  - *Body / Labels*: Public Sans (`text-sm`, `leading-relaxed`).
  - *Timetable Figures & Workload Counts*: Monospace tabular numerals (`font-mono tabular-nums`).
- **Mobile Ergonomics**:
  - Touch targets strictly $\ge 44\text{px}$ on all buttons, tabs, and basket chips.
  - Sticky bottom mobile action drawer when absences are selected.
  - Horizontally swipeable period schedules on smaller screens with locked left class headers.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Grade-Level Proximity Prioritization**:
  - *Chosen Approach*: Group classes into 3 pedagogical wings: Primary (Classes 1–5), Middle (Classes 6–8), and Senior (Classes 9–12). When a vacancy occurs, available teachers belonging to the same wing receive top matching priority before dipping into adjacent wings.
  - *Why*: Primary students need foundational supervision and developmental pedagogy; Senior secondary periods require teachers comfortable with higher academic curricula.
  - *Trade-off*: Slightly more complex constraint resolution, mitigated by our multi-pass scoring solver.

- **Decision 2: Strict Workload Guardrails**:
  - *Chosen Approach*: Hard constraint barring teachers with 6 or more regular daily periods from receiving any substitution. Only teachers with $\le 5$ scheduled periods (typically 3 or 4) are eligible, with an absolute daily limit of 8 total periods.
  - *Why*: Protects teacher welfare, avoids union/policy violations, and prevents coordinator oversight during hectic mornings.

- **Decision 3: Server-Side Gemma 4 Architecture with Deterministic Fallback**:
  - *Chosen Approach*: API requests route through a server-side endpoint (`/api/substitution/generate`) utilizing `@google/genai` with Gemma 4 model parameters. The server pairs an exact constraint solver with Gemma 4 reasoning for explanations, edge cases, and summaries.
  - *Why*: Fulfills the strict requirement for server-side key protection, enables Gemma 4 intelligence, and guarantees 100% operational reliability even if external network timeouts occur.

- **Decision 4: Preloaded Demo Dataset**:
  - *Chosen Approach*: High-fidelity preloaded roster of 18 realistic teachers across Science, Mathematics, Languages, Humanities, Physical Education, and Arts, with an authentic 12-class $\times$ 8-period master timetable.
  - *Why*: Allows immediate, out-of-the-box exploration without tedious manual timetable input, while retaining the ability to reset to baseline.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React 19 + Tailwind CSS)        │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐   │
│  │     Top Tab Bar       │  │  Absence Meter & Safety Guard (<50%) │   │
│  └───────────────────────┘  └──────────────────────────────────────┘   │
│                                                                        │
│  ┌───────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ View 1: Absence Basket        │  │ View 2: Live Substitution    │   │
│  │ • Teacher Search & Filters    │  │ • Class/Period Grid View     │   │
│  │ • Scope: Full/P1-4/P5-8       │  │ • Interactive Slot Swapper   │   │
│  │ • Live Workload Chips         │  │ • WhatsApp & PDF Actions     │   │
│  └───────────────────────────────┘  └──────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ View 3: Master Timetable & Teacher Workload Inspector           │   │
│  │ • 12 Classes × 8 Periods Matrix  • Teacher Workload Summary     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST /api/substitution/generate
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  SERVER PROXY & SOLVER (server.ts / Vite API)          │
│                                                                        │
│  ┌───────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ Constraint Engine             │  │ Gemma 4 Model Integration    │   │
│  │ • Conflict detection          │  │ • Handover briefing         │   │
│  │ • Max 8 daily / no sub if ≥6  │  │ • Reasoning verification     │   │
│  │ • Wing proximity ranking      │  │ • Teacher note generator     │   │
│  └───────────────────────────────┘  └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Entities & Schema

1. **Teacher**:
   - `id`: string
   - `name`: string
   - `department`: string (e.g., Mathematics, Science, Humanities, Languages, Arts, PE)
   - `wing`: `'primary'` (1–5) | `'middle'` (6–8) | `'senior'` (9–12)
   - `baseWorkload`: number (scheduled periods today, 3 to 6)

2. **Master Timetable Slot**:
   - `period`: number (1 to 8)
   - `classId`: number (1 to 12)
   - `teacherId`: string
   - `subject`: string

3. **Absence Record**:
   - `teacherId`: string
   - `scope`: `'full'` (P1–8) | `'morning'` (P1–4) | `'afternoon'` (P5–8)
   - `timestamp`: number

4. **Substitution Assignment**:
   - `id`: string
   - `classId`: number
   - `period`: number
   - `originalTeacherId`: string
   - `substituteTeacherId`: string
   - `subject`: string
   - `reason`: string (e.g., "Same-wing primary match, 4 base periods")
   - `isManualOverride`: boolean

---

### Implementation Milestones & Verification Steps

1. **Environment & App Configuration**:
   - Update `index.html` with title "SubMaster – Smart Teacher Substitution", meta description, and `<meta name="robots" content="noindex, nofollow" />`.
   - Update `metadata.json` with app title and description.
2. **Preloaded Timetable & Teacher Repository**:
   - Create realistic 18-teacher staff directory with wings, subjects, and base workloads.
   - Build complete 12 Classes $\times$ 8 Periods timetable without initial conflicts.
3. **Core Engine & Constraint Solver**:
   - Implement rule verification: max 8 periods total, no assignments if base $\ge 6$, no double-booking in same period, no self-substitution, wing proximity score.
   - 50% absence threshold gate (block generation and show warning banner when absent teachers $> 9$).
4. **Server Proxy & Gemma 4 Endpoint**:
   - Create server route `/api/substitution/generate` utilizing `@google/genai` with Gemma 4 model configuration to generate intelligent summaries and explanations.
5. **UI Implementation**:
   - Top tab navigation: Absence Basket, Today's Plan, Master Timetable.
   - Searchable teacher directory with quick add/remove and scope switches (Full / P1–4 / P5–8).
   - Interactive Plan View with Class/Period switcher, substitution cards, and Slot Swapper Modal with real-time validation.
   - Master Timetable grid & Teacher Workload summary table with tabular numerals.
   - PDF printable view with custom print styling (`@media print`) and WhatsApp instant share generator.
6. **Verification & Testing**:
   - Run `npm run lint` and `compile_applet`.
   - Test edge cases: 1 teacher absent, 8 teachers absent (near 50%), 10 teachers absent (exceeding 50% threshold block), manual teacher swap conflict validation, WhatsApp text generation, and mobile responsive layout.
