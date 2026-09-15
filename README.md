# Startup2Gov — Startup Module

A **startup copilot for government challenges**: match scores, eligibility checks,
deadline urgency, an autosaving apply wizard, and an application tracker — with mock
auth + localStorage persistence so the full flow runs without a backend.

Brutalist UI (dotted grid, hard offset shadows, yellow secondary) with **dark and
light themes**. All data is SAMPLE and deadlines are relative to today, so the demo
never expires.

## Run

```bash
npm install
npm run dev    # http://localhost:5173
npm run build
npm run lint
```

Node 22+ recommended (Vite 8). If `vite: not found` or rolldown binding errors
appear, reinstall `node_modules` with the right Node version.

## Routes

| URL | Access | Page |
| --- | ------ | ---- |
| `/` | Public | Landing page |
| `/login`, `/signup` | Public | Mock auth |
| `/dashboard` | Protected | Copilot dashboard |
| `/profile` | Protected | Startup profile |
| `/challenges` | Protected | Browse + compare |
| `/challenges/:id` | Protected | Challenge details |
| `/apply/:id` | Protected | 3-step apply wizard |
| `/applications` | Protected | Application tracker |
| `*` | Public | 404 |

Unauthenticated visits to protected routes redirect to `/login` (then back). Login
defaults to `/dashboard`.

## Features

### Landing page (`/`)
- Sticky nav with theme toggle, sign-in / get-started actions
- Hero with live counts, stats band (challenges, departments, pilot range, scoring)
- Department ticker, 3-step "How it works", featured-challenge cards
- Match-engine weight breakdown, CTA band, footer — all themed dark/light

### Mock auth
- Signup / login with validation (6-char demo password rule), session persisted in
  `localStorage`, protected-route guard with return-to redirect
- Brutalist auth card matching the reference: dotted bg, offset shadow, yellow logo
  block, mono uppercase labels

### Copilot dashboard (`/dashboard`)
- **Next-best-action hero**: profile completion → resume draft → most urgent unapplied
  deadline → top match → track applications
- Derived stats (available / submitted / in review / approved), profile-completion %
- **Recommended for you**: top-3 unapplied matches with score bars + reasons
- **Closing soon** urgency list + **pipeline funnel** (Submitted → In review → Approved)
- **Draft resume** cards with relative timestamps, **activity feed**, recent-applications
  table, quick actions

### Smart browse (`/challenges`)
- 12 sample challenges across 8 categories (IDs 1–6 stable) with budget, duration,
  tags, eligibility rules, relative deadlines
- **0–100 match badge** + top reason on every card, urgency-colored deadlines
- Sort (Best match / Closing soon / Newest), search across title/department/tags/
  location, **Eligible-for-me** and **Saved** filter chips, skeleton shimmer loading
- **Bookmarks** (per-user persist) and **compare tray** (up to 3 → side-by-side modal)

### Rich details (`/challenges/:id`)
- Match pill, tag chips, key-facts grid (department, location, budget, duration,
  category, posted date), deadline countdown, save button
- **"Why X% for you"** panel (reasons + profile-boost nudges), **eligibility
  checklist** (ok / soft-warn / fail), requirements + pilot note
- Draft-resume banner, related challenges, apply CTA that becomes "Track Application"
  after applying, sticky bottom apply bar

### Apply wizard (`/apply/:id`)
- 3 steps (Startup → Solution → Docs & Review) with progress pills and per-step
  validation; startup fields prefilled from profile
- **Autosave drafts** (debounced, per user + challenge) with "saved x ago" indicator;
  file validation (PDF/DOC/DOCX, 5MB) with name-only draft persistence
- Review screen with edit jump-links; **success screen** with app ID, status timeline,
  **Add deadline to calendar** (.ics download), duplicate-apply protection

### Application tracker (`/applications`)
- Derived summary (total / in progress / approved), status filter + text search
- Per-application **Details drawer**: timeline, full details grid, complete answers,
  document info, **Export summary** (Markdown download), withdraw with confirm
- Handles sparse seed rows gracefully; empty state with CTA

### Pro profile (`/profile`)
- Core info (name, founder, contact, website, location, industry, description) plus
  matching fields: **stage, team size, founded year, DPIIT number** (mock format
  check), core technology, tech tags, deck link — all validated
- **Profile-strength meter** (13 fields) with missing-field nudges and a **"How
  departments see you"** preview card; every field feeds match scores immediately

### Demo kit (sidebar → Demo data)
- **Judge demo**: rich CleanTech profile, 3 own applications across the pipeline,
  half-finished draft, bookmarks, activity history — one click + reload
- **Reset**: wipes everything the account created and restores canonical samples

### Theming
- `ThemeContext` (`s2g_theme` in localStorage, `html[data-theme]`, dark default)
- Toggle in sidebar + auth screens + landing nav; yellow secondary throughout
  (logo, active nav, CTAs, badges, avatars, focus rings, selection)

## Services (`src/services/`, all async → Supabase-swappable)

- `challengeService` — list / by-id / closing-soon / featured / by-deadline
- `startupService` — profile get/save, core completion %, extended strength, DPIIT check
- `applicationService` — submit (clears draft, logs activity), list, recent, stats,
  has-applied guard, withdraw
- `matching` — explainable 0–100 score (industry 30 / keywords 30 / profile 20 /
  stage 10 / team 10) with reasons + missing nudges; eligibility checklist where
  missing info is a soft warn, never a hard block
- `deadlines` — days-left, urgency bands (urgent ≤7d / soon ≤21d), badge labels,
  sorting, .ics generation (all date math via `date-fns`)
- `bookmarks`, `drafts`, `activity` (+ per-application timelines), `authService`
  (mock users/session), `storageService` (mock upload), `demoKit` (seed/reset),
  `mockDb` (localStorage keys, IDs, delay helper)

## 60-second judge script

1. Land on `/` → **Get started** → sign up (`demo@startup.in` / `password123`).
2. Sidebar → **Judge demo** → dashboard hero, recommended rail, funnel, activity.
3. **Browse**: sort *Best match*, toggle *Eligible for me*, bookmark one, select two →
   **Compare**.
4. **Details** (challenge 1): why-score, eligibility, key facts, sticky apply.
5. **Apply** (challenge 7): wizard + autosave → review → submit → calendar download.
6. **My Applications** → **Details** drawer → export. Sidebar → **Reset**.

## Future Supabase swap

Create `src/lib/supabase.js` + `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`),
then replace service internals with table calls (`startups`, `challenges`,
`applications`, storage bucket) keeping the same function names. Routes stay unchanged.
