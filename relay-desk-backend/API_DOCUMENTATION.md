# Relay Desk — Complete API Documentation

Base URL (local development): **`http://localhost:5000/api`**

All requests/responses are JSON. Every endpoint except the ones explicitly
marked **Public** requires this header:

```
Authorization: Bearer <token>
```

The token comes from the Login API response (see below).

---

# 1. Authentication / Login API

## 1.1 Login

```
POST /api/auth/login
```
**Access:** Public

**Request body:**
```json
{
  "email": "burhan@gclbroking.com",
  "password": "password123"
}
```

### Test credentials (seeded users)

| Email | Password | Role | Access scope |
|---|---|---|---|
| `burhan@gclbroking.com` | `password123` | **admin** | All branches, full access |
| `atul@gclbroking.com` | `password123` | **dealer** | Delhi branch only |
| `it@gclbroking.com` | `password123` | **client** | Only their own tickets |

**Success response — `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "agent": {
    "id": 1,
    "name": "Burhan",
    "email": "burhan@gclbroking.com",
    "role": "admin",
    "branchId": null,
    "customerId": null
  },
  "sessionTimeoutMinutes": 10
}
```

**Error responses:**
| Status | Body | Meaning |
|---|---|---|
| `400` | `{ "message": "Email and password are required." }` | Missing fields |
| `401` | `{ "message": "Invalid email or password." }` | Wrong credentials |
| `423` | `{ "message": "License Expired. Please contact your administrator.", "code": "LICENSE_EXPIRED" }` | No active license — see License API below |

---

## 1.2 Get Current Logged-in Agent

```
GET /api/auth/me
```
**Access:** Any logged-in role

**Response — `200 OK`:**
```json
{
  "agent": {
    "id": 1,
    "name": "Burhan",
    "email": "burhan@gclbroking.com",
    "role": "admin",
    "branchId": null,
    "customerId": null
  }
}
```

---

## 1.3 Logout

```
POST /api/auth/logout
```
**Access:** Any logged-in role
**Body:** none
**Response:** `{ "message": "Logged out." }`
(Also writes a `logout` entry to the access log.)

---

## 1.4 Forgot Password

```
POST /api/auth/forgot-password
```
**Access:** Public

**Request body:**
```json
{ "email": "burhan@gclbroking.com" }
```

**Response — `200 OK`:**
```json
{
  "message": "If that email exists, a reset link has been generated.",
  "resetUrl": "http://localhost:5173/reset-password/8f2b1c...  (dev-mode only)"
}
```
> No email provider is wired up yet, so the reset link is returned directly
> in the response (and logged server-side) for testing. Swap this for a real
> email send once you have a provider configured.

---

## 1.5 Reset Password

```
POST /api/auth/reset-password
```
**Access:** Public

**Request body:**
```json
{
  "token": "8f2b1c...",
  "password": "newPassword123"
}
```
**Response — `200 OK`:** `{ "message": "Password updated. You can now log in." }`
**Errors:** `400` if the token is invalid/expired, or password is under 6 characters.

---

# 2. Tickets API

## 2.1 List Tickets

```
GET /api/tickets
```
**Access:** Any logged-in role — **auto-scoped**:
- **admin** → every ticket, every branch
- **dealer** → only tickets whose client is in their branch
- **client** → only their own tickets

**Optional query params:** `?status=Open&priority=High&search=login`

**Response — `200 OK`:**
```json
[
  {
    "id": 1,
    "ticket_number": "T-98051",
    "subject": "Login issue after password reset",
    "description": "Customer reset their password via the email link...",
    "priority": "High",
    "status": "In Progress",
    "created_at": "2026-07-13 11:42:00",
    "updated_at": "2026-07-13 11:58:00",
    "customer_id": 1,
    "requester_name": "Alex R.",
    "requester_email": "alex.r@brightwave.io",
    "branch_id": 1,
    "branch_name": "Relay Desk — Delhi",
    "branch_location": "Delhi",
    "assigned_name": "John D.",
    "assigned_agent_id": 2
  }
]
```

## 2.2 Get One Ticket (with full comment thread)

```
GET /api/tickets/:ticketNumber
```
Example: `GET /api/tickets/T-98051`

**Response — `200 OK`:** same fields as above, plus:
```json
{
  "...": "...",
  "comments": [
    { "id": 1, "author_name": "Alex R.", "author_type": "customer", "body": "I reset my password...", "created_at": "2026-07-13 11:42:00" }
  ]
}
```
**Errors:** `404` if not found, `403` if it belongs to another branch/client than the caller.

## 2.3 Create Ticket

```
POST /api/tickets
```
**Request body:**
```json
{
  "subject": "Cannot access dashboard",
  "description": "Getting a blank screen after login.",
  "priority": "High",
  "customerId": 1,
  "assignedAgentId": 2
}
```
**Response — `201 Created`:** `{ "id": 9, "ticketNumber": "T-98053" }`

## 2.4 Update Ticket Status / Priority / Assignment

```
PATCH /api/tickets/:ticketNumber
```
**Access: Admin only** — dealers/clients get `403`.

**Request body (send any/all of these):**
```json
{ "status": "Solved", "priority": "Medium", "assignedAgentId": 3 }
```
**Response:** `{ "message": "Ticket updated." }`

## 2.5 Delete Ticket

```
DELETE /api/tickets/:ticketNumber
```
**Access: Admin only**
**Response:** `{ "message": "Ticket deleted." }`

## 2.6 Add Comment

```
POST /api/tickets/:ticketNumber/comments
```
**Request body:**
```json
{ "authorName": "Burhan", "authorType": "agent", "body": "Looking into this now." }
```
**Response — `201 Created`:** `{ "message": "Comment added." }`

---

# 3. License API

## 3.1 Check License Status

```
GET /api/license/status
```
**Access:** Public (the Login page checks this before showing the form)

**Response when active:**
```json
{ "active": true, "expiresAt": "2026-08-19T10:00:00.000Z", "licenseKeyMasked": "••••••••••••••••2E6-1A91" }
```
**Response when expired/none:**
```json
{ "active": false, "message": "License Expired. Please contact your administrator." }
```

## 3.2 Activate a License Key

```
POST /api/license/activate
```
**Access:** Public — this is what makes the `/license` recovery page work even
when nobody can log in.

**Request body:**
```json
{ "licenseKey": "RELAY-DESK-DEMO-0001" }
```
**Response — `200 OK`:** `{ "message": "License activated.", "expiresAt": "..." }`
Reactivates the given key for **30 more days** from the moment of activation.

**Errors:** `404` invalid key, `403` if the key was revoked.

## 3.3 List All Licenses (history)

```
GET /api/license
```
**Access: Admin only**

**Response:**
```json
[
  { "id": 1, "license_key": "RELAY-DESK-DEMO-0001", "status": "active", "issued_at": "...", "expires_at": "...", "created_by": null }
]
```

## 3.4 Generate a New License

```
POST /api/license/generate
```
**Access: Admin only**
**Request body:** `{ "validityDays": 30 }`
**Response — `201 Created`:** `{ "licenseKey": "A1B2-C3D4-E5F6-A7B8", "expiresAt": "..." }`

## 3.5 Revoke a License

```
POST /api/license/:id/revoke
```
**Access: Admin only**
**Response:** `{ "message": "License revoked." }`
> Revoking the *currently active* license immediately blocks all logins
> until a new key is activated via `/license`.

---

# 4. User / Agents API

> "Agents" = the people who can log in (Admin, Dealer, or Client role) — not
> to be confused with "Customers" (the end clients tickets are raised for).

## 4.1 List All Agents

```
GET /api/agents
```
**Access:** Any logged-in role

**Response — `200 OK`:**
```json
[
  { "id": 1, "name": "Burhan", "email": "burhan@gclbroking.com", "role": "admin", "created_at": "..." },
  { "id": 2, "name": "Atul", "email": "atul@gclbroking.com", "role": "dealer", "created_at": "..." }
]
```

## 4.2 Agent Workload (open tickets per agent)

```
GET /api/agents/workload
```
**Access:** Any logged-in role

**Response:**
```json
[
  { "id": 2, "name": "John D.", "open_tickets": 3 },
  { "id": 3, "name": "Lisa M.", "open_tickets": 1 }
]
```
Used by the Agent Workload chart on the dashboard.

---

# 5. Quick Reference — All Endpoints

| Category | Method | Endpoint | Access |
|---|---|---|---|
| Auth | POST | `/auth/login` | Public |
| Auth | GET | `/auth/me` | Any |
| Auth | POST | `/auth/logout` | Any |
| Auth | POST | `/auth/forgot-password` | Public |
| Auth | POST | `/auth/reset-password` | Public |
| Tickets | GET | `/tickets` | Any (scoped) |
| Tickets | GET | `/tickets/:ticketNumber` | Any (scoped) |
| Tickets | POST | `/tickets` | Any (scoped) |
| Tickets | PATCH | `/tickets/:ticketNumber` | Admin only |
| Tickets | DELETE | `/tickets/:ticketNumber` | Admin only |
| Tickets | POST | `/tickets/:ticketNumber/comments` | Any |
| Customers | GET | `/customers` | Any (scoped) |
| Customers | POST | `/customers` | Any (scoped) |
| Agents | GET | `/agents` | Any |
| Agents | GET | `/agents/workload` | Any |
| Knowledge Base | GET | `/knowledge-base` | Any |
| Knowledge Base | GET | `/knowledge-base/:id` | Any |
| Reports | GET | `/reports/stats` | Any |
| Reports | GET | `/reports/priority-volume` | Any |
| Reports | GET | `/reports/tickets-by-branch` | Any (scoped) |
| Reports | GET | `/reports/trend` | Any |
| Logs | GET | `/logs` | Admin only |
| Logs | DELETE | `/logs/:id` | Admin only |
| Logs | DELETE | `/logs` (bulk) | Admin only |
| Logs | DELETE | `/logs/all` | Admin only |
| Settings | GET | `/settings` | Public |
| Settings | PUT | `/settings` | Admin only |
| Downloads | GET | `/downloads` | Any (role-filtered) |
| Downloads | GET | `/downloads/admin` | Admin only |
| Downloads | POST | `/downloads` | Admin only |
| Downloads | PUT | `/downloads/:id` | Admin only |
| Downloads | DELETE | `/downloads/:id` | Admin only |
| Slides | GET | `/slides` | Public |
| Slides | GET | `/slides/admin` | Admin only |
| Slides | POST | `/slides` | Admin only |
| Slides | PUT | `/slides/:id` | Admin only |
| Slides | PUT | `/slides/reorder` | Admin only |
| Slides | DELETE | `/slides/:id` | Admin only |
| License | GET | `/license/status` | Public |
| License | POST | `/license/activate` | Public |
| License | GET | `/license` | Admin only |
| License | POST | `/license/generate` | Admin only |
| License | POST | `/license/:id/revoke` | Admin only |
| Health | GET | `/health` | Public |

---

# 6. Testing this with Postman

A ready-to-import Postman collection covering every endpoint above (with
sample bodies already filled in) is available separately — import
`relay-desk-api.postman_collection.json` and
`relay-desk-local.postman_environment.json`, then run the **Login** request
first (it auto-saves your token for every other request).
