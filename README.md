<img width="1904" height="912" alt="image" src="https://github.com/user-attachments/assets/becc6e1c-20bf-4701-aa8e-e7860abd7715" />
<img width="1896" height="911" alt="image" src="https://github.com/user-attachments/assets/d3762b6d-8b49-4652-94c3-10e4d9e41bda" />
<img width="1910" height="914" alt="image" src="https://github.com/user-attachments/assets/319c60d3-1c37-49c5-b87c-851809f336c2" />
<img width="1892" height="913" alt="image" src="https://github.com/user-attachments/assets/f80defbb-4b23-4b27-984e-f511812f15bc" />


<div align="center">

# 🛰️ Relay Desk — Support Ticket Management System

### 🏢 Powered by GCL Broking · 🛠️ Developed by **TechDeployers**

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)
![Database](https://img.shields.io/badge/database-MySQL-4479A1)
![Auth](https://img.shields.io/badge/auth-JWT%20%2B%20Role--Based-yellow)

**A complete, license-protected, role-based (Admin / Dealer / Client) support ticket platform — built end-to-end with a React frontend and an Express + MySQL backend.**

</div>

---

## 📚 Table of Contents

1. [🔒 License & Copyright Notice](#-license--copyright-notice)
2. [📖 About This Project](#-about-this-project)
3. [🧱 Tech Stack](#-tech-stack)
4. [✨ Complete Feature List](#-complete-feature-list)
5. [🗂️ Project Structure](#️-project-structure)
6. [🗄️ Database Documentation](#️-database-documentation)
7. [⚙️ Complete Setup Guide](#️-complete-setup-guide)
8. [🔑 Login Credentials](#-login-credentials)
9. [🌐 Complete API Reference](#-complete-api-reference)
10. [🧪 How to Test the APIs (Postman)](#-how-to-test-the-apis-postman)
11. [🗺️ Development Timeline — What We Built, In Order](#️-development-timeline--what-we-built-in-order)
12. [🙋 Support & Contact](#-support--contact)

---

## 🔒 License & Copyright Notice

> ⚠️ **PROPRIETARY SOFTWARE — ALL RIGHTS RESERVED**

```
Copyright © 2026 TechDeployers. All Rights Reserved.

This software ("Relay Desk") — including its source code, database
schema, design, architecture, and documentation — is the exclusive
intellectual property of TechDeployers.

This is LICENSE-BASED software. Access, use, deployment, or
modification of this software is permitted ONLY under a valid,
active license issued by TechDeployers (see the built-in
License Management system, section 9).

🚫 STRICTLY PROHIBITED without written authorization from TechDeployers:
   • Copying, reproducing, or duplicating this software or any part of it
   • Reselling, sublicensing, or redistributing this software
   • Reverse-engineering, decompiling, or extracting the source code
   • Removing or altering this copyright/license notice
   • Using this software beyond an expired or revoked license

⚖️ LEGAL ACTION:
Unauthorized copying, distribution, or use of this software is a
violation of applicable copyright and IT laws. TechDeployers reserves
the right to pursue full legal action — including filing an FIR
(First Information Report) with law enforcement and/or civil
proceedings for damages — against any individual or organization
found copying, distributing, or misusing this software without a
valid license or written permission.

This software is protected by its built-in License Management
system (see /license and /admin/license) — the application will
not function without an active, valid license key.
```

---

## 📖 About This Project

**Relay Desk** is a complete support-ticket management system built for a
stock-broking company (GCL Broking), with three access levels:

| Role | Who | Can see |
|---|---|---|
| 👑 **Admin** | Internal management | Everything — all branches, all tickets, all settings |
| 🧑‍💼 **Dealer** | Branch staff | Only their own branch's clients & tickets |
| 🙋 **Client** | End customer | Only their own tickets |

It has **two parts**, delivered as two separate projects:

- 🖥️ **`relay-desk-dashboard`** — the React + Vite frontend
- ⚙️ **`relay-desk-backend`** — the Express + MySQL API server

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React 18, Vite, React Router, GSAP (animations) |
| 🔧 Backend | Node.js, Express, MySQL (`mysql2`) |
| 🔐 Auth | JWT (`jsonwebtoken`), password hashing (`bcryptjs`) |
| 📊 Excel Export | `xlsx` (SheetJS) |
| 🗄️ Database | MySQL 8.x |

---

## ✨ Complete Feature List

### 🔐 Authentication & Access Control
- ✅ 3-role system: **Admin / Dealer / Client**, enforced on every API route
- ✅ Branch-based data scoping (a Delhi dealer never sees Mumbai's data)
- ✅ Client logins scoped to exactly one customer record (their own tickets only)
- ✅ JWT-based sessions with a **10-minute countdown timer** (doesn't reset on mouse movement — only a fresh login restarts it)
- ✅ Protected routes — visiting `/dashboard` directly without logging in redirects to Login
- ✅ Logout confirmation popup (rendered via React Portal — never hidden behind other UI)
- ✅ **Forgot Password** flow (email → reset link → new password) for all 3 roles
- ✅ Dealer accounts can be **enabled/disabled** by an Admin (Dealer Mapping)

### 🔑 License Management System
- ✅ `/license` — public activation page (works even when no one can log in)
- ✅ `/admin/license` — Admin generates, revokes, and views license history
- ✅ 30-day default validity, auto-expiry
- ✅ Login is **completely blocked** (HTTP 423) when no license is active — without deleting any data
- ✅ License-expiry warning shown in advance

### 🖥️ Login Page
- ✅ Split layout with animated background graphics (GSAP)
- ✅ Quick-login shortcuts (Admin / Dealer / Client)
- ✅ "Verify you are human" checkbox
- ✅ Real image **slider** pulled from the database (Admin-managed, max 4 slides, 2 images per slide — background + product/logo)
- ✅ Ad placeholder row
- ✅ Brief "staging splash" screen after successful login

### 📊 Dashboard (Overview)
- ✅ 5 animated stat cards: Total Tickets, Open Tickets, Solved Today, Avg Resolution, CSAT Score
- ✅ Volume by Priority donut chart (GSAP draw-in animation)
- ✅ Agent Workload bar chart (animated)
- ✅ Performance Trend line chart (animated line-draw)
- ✅ Recent Tickets widget
- ✅ AI Chat popup — auto-opens once per session with a greeting
- ✅ Role-aware greeting ("Good morning, Admin Burhan")

### 🎫 Ticket System
- ✅ Full-page ticket detail (not a cramped side panel) with a right-hand **Ticket Timeline** + activity graph
- ✅ **7-stage status workflow**: Open → Assigned → In Progress → Pending → Resolved → Closed → Reopened
- ✅ Only **Admin** can change ticket status (enforced server-side, not just hidden in UI)
- ✅ **Department-wise routing** — 13 departments (KYC, Trading, Back Office, Risk, Demat, Finance, IT, Compliance, Support, Research, Mutual Fund, Sales, HR), each with its own email
- ✅ Threaded comments — customer replies, agent replies, department replies, internal notes, with attachments
- ✅ Search, priority/status filters, and pagination on the tickets list
- ✅ Admin-only ticket delete (with confirmation)
- ✅ New Ticket form: Subject → Priority → Assign To → Department → **Attachment → Description** (in that order)

### 👥 Customers & Dealers
- ✅ Extended customer profile: Mobile, PAN, Client Code, Branch, Dealer, Status, City, State, Registration Date, Last Login
- ✅ Bulk **Import** (Excel/CSV) and **Export** support
- ✅ **Dealer Mapping** admin page — Dealer ID/Name/Branch/Location, Allow/Disable Login, Reset Password

### 📁 Downloads Management
- ✅ Categories: Essential Downloads, Software Downloads (extensible to more)
- ✅ Supports PDF, EXE, ZIP, DOC, DOCX, XLS, XLSX, PPT, PNG, JPG
- ✅ File upload OR external URL
- ✅ Per-role visibility (Admin / Dealer / Client)
- ✅ Full admin CRUD: create, edit, delete, enable/disable

### 🔔 Notifications
- ✅ Global notification system — ticket replies, status changes, software uploads, license updates, system events
- ✅ Auto-triggered on ticket activity

### 📋 Access Logs & Audit
- ✅ Every login/logout/failed-login recorded automatically
- ✅ Filters: Today, Yesterday, Last 7 Days, Last 30 Days, Custom Range
- ✅ Search, pagination
- ✅ Single delete, bulk delete, delete-all (with confirmation)
- ✅ **Export to real Excel (.xlsx)**

### ⚙️ Settings & Branding
- ✅ Responsive grid-based Settings page (not a single cramped column)
- ✅ Admin-only: upload portal logo, rename the portal, toggle dashboard ticket widgets, set session timeout
- ✅ Sidebar can be **collapsed/hidden**
- ✅ "Admin Management" sidebar group (Downloads, Slider, License, Dealer Mapping, Access Logs) — visible only after Admin login
- ✅ Settings pinned to the bottom of the sidebar

### 📱 Mobile Responsive
- ✅ Top bar (user name + logout) and bottom sticky tab bar (e-commerce style icon+label navigation)
- ✅ Fully responsive tables, forms, and cards down to phone width

---

## 🗂️ Project Structure

```
📁 relay-desk-dashboard/          ← FRONTEND (React + Vite)
├── src/
│   ├── api/client.js             ← All backend API calls in one place
│   ├── context/                  ← AuthContext, BrandingContext
│   ├── components/                ← Sidebar, Topbar, MobileNav, charts, etc.
│   ├── pages/                     ← Login, Overview, Tickets, Settings, Admin pages...
│   └── data/                      ← Shared constants (statuses, nav links)
├── package.json
└── README.md

📁 relay-desk-backend/            ← BACKEND (Express + MySQL)
├── config/db.js                  ← MySQL connection
├── controllers/                  ← Business logic per resource
├── routes/                       ← API route definitions
├── middleware/                   ← Auth, role, branch-scoping guards
├── schema.sql                    ← Full database schema + seed data
├── setup-database.bat            ← One-click Windows DB setup
├── API_DOCUMENTATION.md
└── README.md
```

---

## 🗄️ Database Documentation

**Database name:** `relay_desk`
**Total tables:** 14

### 1️⃣ `branches`
Physical/regional locations (e.g. Delhi, Mumbai, Pune).
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Unique branch ID |
| `name` | VARCHAR | Display name, e.g. "Relay Desk — Delhi" |
| `location` | VARCHAR | City name, e.g. "Delhi" |
| `created_at` | DATETIME | When the branch was added |

### 2️⃣ `departments`
The 13 internal departments tickets can be routed to.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Unique department ID |
| `name` | VARCHAR | e.g. "IT / Technical Support" |
| `email` | VARCHAR | e.g. `it@gclbroking.com` |
| `created_at` | DATETIME | Created timestamp |

### 3️⃣ `agents`
Every login-capable user — Admin, Dealer, or Client.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Unique agent ID |
| `name` | VARCHAR | Full name |
| `email` | VARCHAR (unique) | Login email |
| `password_hash` | VARCHAR | Bcrypt-hashed password |
| `role` | ENUM | `admin` / `dealer` / `client` |
| `branch_id` | INT (FK) | Which branch (NULL for admins) |
| `customer_id` | INT (FK) | Which customer this login represents (client role only) |
| `active` | TINYINT | 1 = login allowed, 0 = disabled (Dealer Mapping) |
| `last_login_at` | DATETIME | Last successful login time |
| `created_at` | DATETIME | Account creation time |

### 4️⃣ `customers`
The end clients tickets are raised for.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Unique customer ID |
| `client_code` | VARCHAR (unique) | e.g. `DEL-1001` |
| `name`, `email`, `company` | VARCHAR | Basic profile |
| `mobile` | VARCHAR | Phone number |
| `pan` | VARCHAR | PAN card number |
| `branch_id` | INT (FK) | Which branch this client belongs to |
| `dealer_agent_id` | INT (FK) | Which dealer manages this client |
| `status` | ENUM | `active` / `inactive` |
| `city`, `state` | VARCHAR | Location details |
| `last_login_at` | DATETIME | Last time this client logged in |
| `created_at` | DATETIME | Registration date |

### 5️⃣ `tickets`
The core support tickets.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Internal ID |
| `ticket_number` | VARCHAR (unique) | Public-facing ID, e.g. `T-98051` |
| `subject`, `description` | TEXT | What the issue is |
| `category` | VARCHAR | Free-text category |
| `priority` | ENUM | `Low` / `Medium` / `High` / `Urgent` |
| `status` | ENUM | `Open` / `Assigned` / `In Progress` / `Pending` / `Resolved` / `Closed` / `Reopened` |
| `customer_id` | INT (FK) | Who raised it |
| `assigned_agent_id` | INT (FK) | Which agent is handling it |
| `department_id` | INT (FK) | Which department it's routed to |
| `created_at` / `updated_at` | DATETIME | Timestamps |

### 6️⃣ `comments`
The threaded conversation on each ticket.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Comment ID |
| `ticket_id` | INT (FK) | Which ticket |
| `author_name` | VARCHAR | Who wrote it |
| `author_type` | ENUM | `customer` / `agent` / `department` / `internal_note` / `system` |
| `body` | TEXT | The message |
| `attachment_url` / `attachment_name` | LONGTEXT / VARCHAR | Optional file attached to this reply |
| `is_read` | TINYINT | Read status |
| `created_at` | DATETIME | When it was posted |

### 7️⃣ `access_logs`
Every login/logout event, for the Admin audit trail.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Log entry ID |
| `agent_id` / `agent_email` / `agent_role` | — | Who triggered the event |
| `action` | VARCHAR | `login` / `login_failed` / `logout` / `session_timeout` |
| `ip_address` | VARCHAR | Caller's IP |
| `created_at` | DATETIME | When it happened |

### 8️⃣ `app_settings`
Key-value store for portal-wide settings (branding, toggles).
| Field | Type | Purpose |
|---|---|---|
| `setting_key` | VARCHAR (PK) | e.g. `branding_logo_url`, `session_timeout_minutes` |
| `setting_value` | TEXT | The value |
| `updated_at` | DATETIME | Last changed |

### 9️⃣ `downloads`
Essential Downloads / Software Downloads.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Download ID |
| `title`, `description` | — | Display info |
| `category` | VARCHAR | e.g. "Essential Downloads" |
| `file_type` | ENUM | pdf/exe/zip/doc/docx/xls/xlsx/ppt/png/jpg |
| `file_url` | LONGTEXT | Uploaded file (base64) or external URL |
| `status` | ENUM | `enabled` / `disabled` |
| `visible_to` | VARCHAR | Comma list of roles allowed to see it |
| `sort_order` | INT | Display order |

### 🔟 `login_slides`
The Login page's image slider (Admin-managed, max 4).
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Slide ID |
| `image_url` | LONGTEXT | Large background image |
| `product_image_url` | LONGTEXT | Small logo/product image overlay |
| `title`, `subtitle`, `description` | — | Slide text |
| `button_text` / `button_url` | — | Optional CTA button |
| `sort_order` | INT | Slide order |
| `status` | ENUM | `enabled` / `disabled` |

### 1️⃣1️⃣ `licenses`
The license-based activation system.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | License row ID |
| `license_key` | VARCHAR (unique) | The activation key |
| `status` | ENUM | `active` / `revoked` / `expired` |
| `issued_at` / `expires_at` | DATETIME | Validity window |
| `created_by` | INT (FK) | Which admin generated it |

### 1️⃣2️⃣ `password_resets`
Forgot Password tokens.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Row ID |
| `agent_id` | INT (FK) | Whose password is being reset |
| `token` | VARCHAR (unique) | The reset token |
| `expires_at` | DATETIME | Token validity (30 min) |
| `used` | TINYINT | Prevents token re-use |

### 1️⃣3️⃣ `notifications`
The global notification center's data.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Notification ID |
| `agent_id` | INT (FK, nullable) | NULL = broadcast |
| `target_roles` | VARCHAR | Which roles see it, when broadcast |
| `type` | VARCHAR | `ticket_reply` / `ticket_status` / `software_upload` / `license` / `system` |
| `title`, `body`, `link_url` | — | Notification content |
| `is_read` | TINYINT | Read status |

### 1️⃣4️⃣ `knowledge_base_articles`
Help center articles.
| Field | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Article ID |
| `title`, `category`, `content` | — | Article content |
| `views` | INT | View counter |

---

## ⚙️ Complete Setup Guide

### Step 1 — Database
```bash
cd relay-desk-backend
# Windows: just double-click setup-database.bat
# Or manually:
mysql -u root -p < schema.sql
```

### Step 2 — Backend
```bash
cd relay-desk-backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Step 3 — Frontend
```bash
cd relay-desk-dashboard
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Login Credentials

| Email | Password | Role |
|---|---|---|
| `burhan@gclbroking.com` | `password123` | 👑 Admin |
| `atul@gclbroking.com` | `password123` | 🧑‍💼 Dealer (Delhi) |
| `it@gclbroking.com` | `password123` | 🙋 Client |

**Demo license key** (pre-seeded, 30-day validity): `RELAY-DESK-DEMO-0001`

---

## 🌐 Complete API Reference

Base URL: `http://localhost:5000/api`

| Category | Method | Endpoint | Access |
|---|---|---|---|
| 🔐 Auth | POST | `/auth/login` | Public |
| 🔐 Auth | GET | `/auth/me` | Any |
| 🔐 Auth | POST | `/auth/logout` | Any |
| 🔐 Auth | POST | `/auth/forgot-password` | Public |
| 🔐 Auth | POST | `/auth/reset-password` | Public |
| 🎫 Tickets | GET | `/tickets` | Any (scoped) |
| 🎫 Tickets | GET | `/tickets/:ticketNumber` | Any (scoped) |
| 🎫 Tickets | POST | `/tickets` | Any (scoped) |
| 🎫 Tickets | PATCH | `/tickets/:ticketNumber` | Admin only |
| 🎫 Tickets | DELETE | `/tickets/:ticketNumber` | Admin only |
| 🎫 Tickets | POST | `/tickets/:ticketNumber/comments` | Any |
| 👥 Customers | GET/POST/PUT | `/customers`, `/customers/:id` | Any (scoped) / Admin |
| 👥 Customers | POST | `/customers/import` | Admin only |
| 🧑‍💼 Agents | GET | `/agents`, `/agents/workload` | Any |
| 🧑‍💼 Dealer Mapping | GET/POST | `/agents/dealers` | Admin only |
| 🧑‍💼 Dealer Mapping | PATCH | `/agents/:id/access` | Admin only |
| 🧑‍💼 Dealer Mapping | POST | `/agents/:id/reset-password` | Admin only |
| 🏢 Departments | GET | `/departments` | Any |
| 🏢 Departments | POST/PUT/DELETE | `/departments` | Admin only |
| 📚 Knowledge Base | GET | `/knowledge-base` | Any |
| 📊 Reports | GET | `/reports/stats`, `/priority-volume`, `/tickets-by-branch`, `/trend` | Any |
| 📋 Logs | GET | `/logs` (filters + pagination) | Admin only |
| 📋 Logs | DELETE | `/logs/:id`, `/logs`, `/logs/all` | Admin only |
| ⚙️ Settings | GET | `/settings` | Public |
| ⚙️ Settings | PUT | `/settings` | Admin only |
| 📁 Downloads | GET | `/downloads`, `/downloads/admin` | Any / Admin |
| 📁 Downloads | POST/PUT/DELETE | `/downloads/:id` | Admin only |
| 🖼️ Login Slides | GET | `/slides` | Public |
| 🖼️ Login Slides | GET/POST/PUT/DELETE | `/slides/admin`, `/slides/:id` | Admin only |
| 🔑 License | GET | `/license/status` | Public |
| 🔑 License | POST | `/license/activate` | Public |
| 🔑 License | GET/POST | `/license`, `/license/generate` | Admin only |
| 🔑 License | POST | `/license/:id/revoke` | Admin only |
| 🔔 Notifications | GET | `/notifications` | Any |
| 🔔 Notifications | PATCH | `/notifications/:id/read`, `/read-all` | Any |
| ❤️ Health | GET | `/health` | Public |

---

## 🧪 How to Test the APIs (Postman)

1. Open Postman → **Import** → load the collection + environment files (provided separately)
2. Select environment **"Relay Desk — Local"**
3. Start the backend (`npm run dev`)
4. Run **"Login (Admin — burhan)"** — the token auto-saves, no copy-paste needed
5. Run any other request — the token is attached automatically
6. To test role-based access, just run a different login (Dealer/Client) and re-run the same request — you'll see different results

**Quick manual test with curl:**
```bash
# 1. Log in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"burhan@gclbroking.com","password":"password123"}'

# 2. Copy the "token" from the response, then:
curl http://localhost:5000/api/tickets \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

**Expected status codes:**
| Code | Meaning |
|---|---|
| ✅ 200/201 | Success |
| 🔒 401 | Not logged in / invalid token |
| ⛔ 403 | Logged in, but this role can't do this |
| ❓ 404 | Not found |
| ⏳ 423 | License Expired — no login allowed |

---

## 🗺️ Development Timeline — What We Built, In Order

1. 🎨 Initial static dashboard mockup (UI only)
2. 🔐 Login page with GSAP animations
3. ⚛️ Converted the whole thing into a real React + Vite project (multi-page, routed)
4. 🎟️ Full-page Ticket Detail view with a timeline/activity graph
5. 📱 Responsive mobile navigation (top bar + bottom sticky tabs)
6. 🚪 Logout confirmation popup
7. 🗄️ Chose **MySQL** and built the **Express backend** from scratch
8. 👑 Added **Admin / Dealer** role-based branch scoping
9. 🔧 Windows one-click database setup script (`setup-database.bat`)
10. 🙋 Added the **Client** role (3-role system complete)
11. 🖼️ Rebuilt the Login page (Cloudways-inspired layout, quick login, verify checkbox)
12. ⏱️ Real 10-minute session timer with countdown
13. 🐛 Fixed session-timer-resets-on-mouse-move bug
14. 🐛 Fixed logout popup rendering behind other panels (React Portal fix)
15. 📋 Admin Logs — filters, search, bulk delete, Excel export
16. 📁 Downloads Management — full admin CRUD
17. 🖼️ Login Slider Management — admin CRUD, max 4 slides
18. 🔑 **License Management system** — `/license` page, generation, expiry blocking
19. 🔓 Forgot Password flow
20. 🏢 **Department-wise ticket routing** — 13 departments
21. 🔄 Expanded ticket status workflow (7 stages)
22. 🧑‍💼 **Dealer Mapping** module
23. 👥 Extended Customer fields + Import/Export
24. 🔔 Notification Center backend
25. ⚙️ Settings page redesign (responsive grid)
26. 📖 This documentation

---

## 🙋 Support & Contact

**Software developed by:** 🛠️ **TechDeployers**
**For:** GCL Broking
**License type:** Proprietary, license-key activated (see [License section](#-license--copyright-notice) above)

For license renewal, support, or reporting unauthorized use of this
software, contact TechDeployers through your assigned account manager.

---

<div align="center">

### 🔒 This is licensed, proprietary software. Unauthorized copying is illegal and will be prosecuted. 🔒

**© 2026 TechDeployers — All Rights Reserved**

</div>
