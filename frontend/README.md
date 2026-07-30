# Relay Desk — Support Ticket Dashboard

A complete customer support dashboard built with **React + Vite**, including a
login screen (animated with GSAP) and a full multi-page ticketing dashboard.

---

## What's included

- **Login page** (`/`) — animated sign-in screen
- **Dashboard Overview** (`/dashboard`) — stats, recent tickets, priority
  chart, agent workload
- **Tickets** (`/tickets`) — full ticket list
- **New Ticket** (`/tickets/new`) — create-ticket form
- **Customers** (`/customers`) — customer directory
- **Reports** (`/reports`) — trends, activity feed, charts
- **Knowledge Base** (`/knowledge-base`) — help articles
- **Settings** (`/settings`) — profile & notification preferences

---

## 0. Login & authentication

This frontend is now wired to the **Express + MySQL backend** for real
authentication:

- Visiting `/` shows the Login page. Going straight to `/dashboard` (or any
  other page) without logging in first **redirects you back to `/`**.
- On successful login you're taken to `/dashboard`.
- The session (JWT + agent info) is kept in `sessionStorage` and cleared on
  logout or when the tab is closed.
- Make sure the backend (`relay-desk-backend`) is running on
  `http://localhost:5000` — the frontend's `.env` already points at it
  (`VITE_API_URL`).

**Test logins** (password for all: `password123`):

| Email | Role |
|---|---|
| `burhan@gclbroking.com` | **Admin** — sees every branch, can change ticket status |
| `atul@gclbroking.com` | **Dealer** — Delhi branch only |
| `it@gclbroking.com` | **Client** — sees only their own tickets |

**What's new in this update:**
- Login page rebuilt: split layout, quick-login row, "Verify you are human"
  checkbox, ad placeholder row, and a brief staging splash screen after login
- Real 10-minute session timer (visible in the topbar), resets on activity,
  auto-logs-out at zero
- Sidebar can be collapsed/hidden (button at the bottom of the sidebar)
- Admin-only ticket status control on the Ticket Detail page
- Admin-only Settings section: portal logo upload, portal name, session
  timeout, and a toggle to show/hide ticket widgets on the dashboard
- New **Downloads** page (Essential Downloads — Margin Download, MTF
  Eligible Stock, Odd Lot, GCL Returns Software), filtered to your role
- New **Access Logs** page (admin-only) with a real Excel (.xlsx) export
- AI chat popup auto-opens once per session on the dashboard with a greeting

**What's real vs. sample right now:** login/logout, session timeout, route
protection, settings/branding, downloads, and access logs are fully wired to
the backend and MySQL. The dashboard's ticket widgets and the Ticket Detail
page's core info still render from `src/data/tickets.js` sample data — the
admin-only status dropdown *is* wired to the real API, so status changes
persist to MySQL even though the rest of that page's content is still
sample data. `src/api/client.js` has all the functions needed to finish
connecting the remaining widgets whenever you're ready.

**What's new in this update:**
- **Session timer fixed** — no longer resets on mouse movement/clicks; only a fresh login starts a new countdown, and it survives a page refresh
- **Logout modal fixed** — now renders via a React Portal directly to `document.body`, so it can never appear behind other panels
- **Admin Logs** — single/bulk/delete-all, date-range filters (Today/Yesterday/Last 7/Last 30/Custom), search, pagination
- **Downloads Management** (`/admin/downloads`, admin-only) — full CRUD, file upload or URL, all common file types, per-role visibility, enable/disable
- **Login Slider Management** (`/admin/slides`, admin-only) — add/edit/delete/reorder, capped at 4 slides; the Login page now pulls real slides from the API
- **License Management** — `/license` page (works without login) to activate a key; `/admin/license` to generate/revoke/view history. Login is blocked with "License Expired" when there's no active license
- **Forgot Password** — `/forgot-password` and `/reset-password/:token`, works for all 3 roles
- **Settings page redesigned** — responsive multi-column grid instead of stacked panels, plus an Admin Management quick-links card
- **Tickets** — working search, priority/status filters, pagination, and admin-only delete
- Export button removed from the Overview page

---

## 1. Requirements

Install these on your system before you start:

| Tool | Minimum version | Check with |
|------|------------------|------------|
| Node.js | 18.x or newer | `node -v` |
| npm | 9.x or newer (comes with Node) | `npm -v` |

Don't have Node.js? Download it from **https://nodejs.org** (choose the LTS
version) and install it like any normal application, then re-open your
terminal.

---

## 2. Get the project onto your system

**Option A — you already have a Vite project (e.g. `trackdesk.cloud_frontend`):**

Copy this project's `src/` folder into your existing project's `src/` folder,
overwriting `App.jsx`, `main.jsx`, and `index.css`. Then add the two extra
dependencies to your **existing** project (don't overwrite your existing
`package.json` — just add these):

```bash
npm install react-router-dom gsap
```

Skip to step 4 (Run the project).

**Option B — starting fresh with this project as-is:**

Just unzip this project folder anywhere on your system — it already ships
with `package.json`, `vite.config.js`, `index.html`, and everything else
needed to run standalone. No scaffolding command needed.

---

## 3. Install dependencies

This project ships with a `package.json` that already lists everything it
needs — React, Vite, ESLint, `react-router-dom`, and `gsap`. You only need
one command:

```bash
cd relay-desk          # or your project's folder name
npm install
```

That single command installs **all** dependencies. Nothing else to add
manually.

---

## 4. Run the project locally

```bash
npm run dev
```

Vite will print a local URL in the terminal, usually:

```
  VITE ready
  ➜  Local:   http://localhost:5173/
```

Open that link in your browser. You'll land on the **Login page** first —
enter any email/password and hit **Sign In** to reach the dashboard (there's
no real backend wired up yet, so any input works for now).

---

## 5. Project structure

```
src/
  main.jsx                 # App entry point, wraps everything in BrowserRouter
  App.jsx                  # All page routes
  index.css                # Global styles + design tokens (colors, fonts)
  components/
    Sidebar.jsx / .css      # Left navigation
    Topbar.jsx / .css       # Page header bar (search, export, + New Ticket)
    PageShell.jsx / .css    # Wraps Sidebar + page content
    StatCard.jsx / .css     # Shared stat-card building block
    stats/
      TotalTicketsCard.jsx
      OpenTicketsCard.jsx
      SolvedTodayCard.jsx
      AvgResolutionCard.jsx
      CSATScoreCard.jsx
    RecentTickets.jsx / .css
    TicketsTable.jsx
    VolumeByPriority.jsx / .css
    AgentWorkload.jsx / .css
    PerformanceTrend.jsx / .css
    ActivityFeed.jsx / .css
  pages/
    Login.jsx / .css
    Overview.jsx / .css
    Tickets.jsx
    NewTicket.jsx / .css
    Customers.jsx / .css
    Reports.jsx / .css
    KnowledgeBase.jsx / .css
    Settings.jsx / .css
```

---

## 6. Routes reference

| Route             | Page                                   |
|--------------------|-----------------------------------------|
| `/`                | Login                                   |
| `/dashboard`       | Overview dashboard                      |
| `/tickets`         | Full tickets list                       |
| `/tickets/new`     | Create a new ticket                     |
| `/customers`       | Customer directory                      |
| `/reports`         | Trends, activity feed, charts           |
| `/knowledge-base`  | Help articles                           |
| `/settings`        | Profile & notification preferences      |

---

## 7. Other useful commands

```bash
npm run build     # Production build → outputs to dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

---

## 8. Notes for going further

- All data (tickets, customers, agents, articles) is sample data living
  directly inside each component file — swap it for real API calls whenever
  your backend is ready.
- The Login page's `handleSubmit` in `src/pages/Login.jsx` currently just
  navigates to `/dashboard`. Replace it with a real authentication call
  (and add route protection) once you have an auth API.
- Colors, fonts, and spacing tokens live as CSS variables at the top of
  `src/index.css` — change them there to re-theme the whole app in one place.
