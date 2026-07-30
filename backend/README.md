# Relay Desk — Backend (Express + MySQL)

REST API backend for the Relay Desk support dashboard, built with **Express**
and **MySQL**.

---

## 0. Admin / Dealer / Client access model

This backend supports **three roles**:

- **`admin`** — no `branch_id`, sees and manages everything across every
  branch. Only admins can change a ticket's status.
- **`dealer`** — has a `branch_id` (e.g. Delhi), and every ticket/customer
  query is automatically scoped to only that branch.
- **`client`** — has a `customer_id`, and only ever sees their own tickets
  (a client-facing login, e.g. `it@gclbroking.com`).

This is enforced by `middleware/scopeToBranch.middleware.js` (branch/customer
filtering) and `middleware/requireAdmin.middleware.js` (status-change lock).

### New in this update
- `access_logs` table — every login/login-failure/logout is recorded.
  `GET /api/logs` (admin-only) lists them for the frontend's Excel export.
- `app_settings` table — key/value store for branding (logo, portal name),
  the dashboard-tickets toggle, and session timeout minutes.
  `GET /api/settings` is public (the Login page needs it before auth);
  `PUT /api/settings` is admin-only.
- `downloads` table — Essential Downloads (Margin Download, MTF Eligible
  Stock, Odd Lot, GCL Returns Software), filtered by role via `visible_to`.
  `GET /api/downloads`.
- `GET /api/reports/tickets-by-branch` — open ticket counts per branch/location.
- Login now returns `sessionTimeoutMinutes` (default 10) so the frontend can
  run a real countdown and auto-logout.

A full diagram of the original branch-scoping flow, plus the database ERD,
is in `architecture-diagram.html` in this same folder.

Each client has a `client_code` (e.g. `DEL-1001`) whose prefix reflects its
branch — this is just a human-readable convention; the actual access control
is enforced by the `branch_id`/`customer_id` foreign keys, not by parsing the code.

---

## 1. Requirements

| Tool | Version | Check with |
|------|---------|------------|
| Node.js | 18+ | `node -v` |
| MySQL | 8.x (or MariaDB 10.5+) | `mysql --version` |

Don't have MySQL installed?
- **macOS:** `brew install mysql && brew services start mysql`
- **Windows:** install MySQL Community Server from https://dev.mysql.com/downloads/installer/
- **Linux:** `sudo apt install mysql-server`

---

## 2. Create the database

### Option A — Windows one-click setup

Just double-click **`setup-database.bat`** in this folder.

It will:
- Check that MySQL is installed and reachable
- Ask for your MySQL root password
- Run `schema.sql` — creating the database, all tables, and seed data
- Print login credentials for testing once it's done

Edit the `DB_HOST`, `DB_PORT`, or `DB_USER` values near the top of the `.bat`
file if your MySQL setup isn't the default.

### Option B — Manual (macOS/Linux, or if you prefer the terminal)

Import the schema (this creates the database, tables, and seed data):

```bash
mysql -u root -p < schema.sql
```

This creates:
- `branches`, `agents`, `customers`, `tickets`, `comments`, `knowledge_base_articles`
- Sample rows matching the data already in the React frontend
- All 5 seeded agents can log in immediately with password: **`password123`**
  (the hash is already baked into `schema.sql`, no extra step needed)

---

## 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=relay_desk
JWT_SECRET=change_this_to_a_long_random_string
```

---

## 4. Install dependencies & run

```bash
npm install
npm run dev
```

You should see:

```
Relay Desk API running on http://localhost:5000
```

---

## 5. API reference

All routes except `/api/auth/login` require a header:
`Authorization: Bearer <token>` (token returned from login).

| Method | Route | Description |
|--------|-------|-------------|
| POST   | `/api/auth/login` | Log in with `{ email, password }` → `{ token, agent, sessionTimeoutMinutes }` |
| POST   | `/api/auth/logout` | Logs the logout event |
| GET    | `/api/auth/me` | Get the logged-in agent from the token |
| GET    | `/api/tickets` | List tickets — **auto-scoped** to dealer's branch or client's own tickets |
| GET    | `/api/tickets/:ticketNumber` | Full ticket detail + comments — 403 if outside your scope |
| POST   | `/api/tickets` | Create a ticket `{ subject, description, priority, customerId, assignedAgentId }` |
| PATCH  | `/api/tickets/:ticketNumber` | **Admin only** — update `{ status, priority, assignedAgentId }` |
| POST   | `/api/tickets/:ticketNumber/comments` | Add a comment `{ authorName, authorType, body }` |
| GET    | `/api/customers` | List customers — auto-scoped to dealer's branch |
| POST   | `/api/customers` | Create a customer `{ name, email, company, clientCode, branchId }` |
| GET    | `/api/agents` | List agents |
| GET    | `/api/agents/workload` | Open-ticket count per agent |
| GET    | `/api/knowledge-base` | List articles |
| GET    | `/api/knowledge-base/:id` | Get one article (increments views) |
| GET    | `/api/reports/stats` | Stat cards data |
| GET    | `/api/reports/priority-volume` | Donut chart data |
| GET    | `/api/reports/tickets-by-branch` | Open tickets grouped by branch/location |
| GET    | `/api/reports/trend` | Created vs. resolved, last 7 days |
| GET    | `/api/logs` | **Admin only** — access log for the Excel export |
| GET    | `/api/settings` | Public — branding, dashboard toggle, session timeout |
| PUT    | `/api/settings` | **Admin only** — update any setting `{ key: value }` |
| GET    | `/api/downloads` | Essential Downloads, filtered to your role |
| GET    | `/api/downloads/admin` | **Admin only** — every download, unfiltered |
| POST/PUT/DELETE | `/api/downloads` / `/:id` | **Admin only** — full CRUD |
| GET    | `/api/slides` | Public — enabled login slides, for the Login page |
| GET    | `/api/slides/admin` | **Admin only** — every slide |
| POST/PUT/DELETE | `/api/slides` / `/:id` | **Admin only** — full CRUD (max 4 slides) |
| PUT    | `/api/slides/reorder` | **Admin only** — `{ order: [id1, id2, ...] }` |
| GET    | `/api/license/status` | Public — is there an active license right now |
| POST   | `/api/license/activate` | Public — `{ licenseKey }`, reactivates for 30 days |
| GET    | `/api/license` | **Admin only** — full license history |
| POST   | `/api/license/generate` | **Admin only** — `{ validityDays }` |
| POST   | `/api/license/:id/revoke` | **Admin only** |
| POST   | `/api/auth/forgot-password` | `{ email }` → generates a reset link (logged server-side, no email provider wired up yet) |
| POST   | `/api/auth/reset-password` | `{ token, password }` |
| DELETE | `/api/tickets/:ticketNumber` | **Admin only** — delete a ticket |
| DELETE | `/api/logs/:id` \| `/api/logs` \| `/api/logs/all` | **Admin only** — single / bulk (`{ ids }`) / all |
| GET    | `/api/logs?range=&search=&page=` | Now supports date-range filters, search, and pagination |

**Important:** `POST /api/auth/login` now returns **HTTP 423** with `code: "LICENSE_EXPIRED"` if there's no active license — the frontend catches this and redirects to `/license`. A demo license (`RELAY-DESK-DEMO-0001`, 30 days) is seeded automatically.

---

## 6. Quick test

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.menon@relaydesk.com","password":"password123"}'
```

Copy the `token` from the response, then:

```bash
curl http://localhost:5000/api/tickets \
  -H "Authorization: Bearer <paste token here>"
```

---

## 7. Connecting the React frontend

In your frontend, replace the hardcoded sample data (`src/data/tickets.js`
etc.) with `fetch`/`axios` calls to this API, e.g.:

```js
const res = await fetch('http://localhost:5000/api/tickets', {
  headers: { Authorization: `Bearer ${token}` },
});
const tickets = await res.json();
```

Store the `token` (from `/api/auth/login`) in memory or `sessionStorage` after
a successful sign-in on your Login page, and attach it to every subsequent
request.

---

## 8. Project structure

```
relay-desk-backend/
  server.js              # App entry point
  schema.sql              # MySQL schema + seed data
  .env.example
  config/
    db.js                 # MySQL connection pool
  middleware/
    auth.middleware.js    # JWT verification
  controllers/
    auth.controller.js
    tickets.controller.js
    customers.controller.js
    agents.controller.js
    knowledgeBase.controller.js
    reports.controller.js
  routes/
    auth.routes.js
    tickets.routes.js
    customers.routes.js
    agents.routes.js
    knowledgeBase.routes.js
    reports.routes.js
  utils/
    hashPassword.js       # CLI helper to generate bcrypt hashes
```
