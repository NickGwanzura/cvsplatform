# Dataflow — CVS Simbisa

End-to-end map of how a request crosses the wire, who triggers it, and which dashboard reacts. Companion document to [ENDPOINTS.md](ENDPOINTS.md) (which is the per-endpoint inventory). This file is the "narrative" view organised role-by-role.

---

## 1. Three-layer architecture

```
┌─────────────────────────┐    HTTPS    ┌────────────────────┐    HTTPS    ┌──────────────────────┐
│  Browser SPA            │ ─────────►  │  Hono proxy        │ ─────────►  │  Laravel API         │
│  (React + Vite)         │  /api/v1/*  │  (server.js)       │  /api/v1/*  │  69.197.142.170      │
│  src/lib/cvsApi.js      │ ◄─────────  │  same-origin shim  │ ◄─────────  │  (cvsplatform-prod)  │
└─────────────────────────┘             └────────────────────┘             └──────────────────────┘
```

- **SPA** — calls relative `/api/v1/*` URLs through axios. Token is stored in `localStorage.token` and attached as `Bearer` on every request.
- **Hono proxy** — same-origin shim so the browser talks to a single host. Forwards every `/api/v1/*` request to `UPSTREAM_API_URL` from `.env`. Logs every proxied call with a per-request id (visible in railway logs).
- **Laravel API** — the source of truth. Returns either `{ data: [...], meta }` (paginated) or `{ message, data }` (single). Auth is `auth:sanctum` Bearer tokens.

`src/lib/cvsApi.js` exports one helper per endpoint (~80 of them) and an `unwrap` shim that flattens Laravel's paginated `{ current_page, data: [...] }` into a plain array.

---

## 2. Auth bootstrap — how the SPA learns who you are

```
   ┌──────────────┐
   │  LoginPage   │
   └──────┬───────┘
          │ email + password
          ▼
   POST /auth/login  ───►  { token, user }
          │
          │ store token, navigate
          ▼
   AppContext.bootstrapping = true
          │
          ▼
   GET /auth/me  ───►  {
                          user: { id, full_name, email, ... },
                          access_context: {
                            roles: [{ code, scope_type, brand_id, shop_id }, ...],
                            permissions: [...]
                          }
                        }
          │
          ▼
   normalizeAuth(payload)            ┌─ src/lib/authMap.js ────────┐
          │                          │ pickPrimaryRoleCode →       │
          │                          │   prefer scope_type=global  │
          │                          │ mapRoleCode(code) →         │
          │                          │   "BRAND_MANAGER" → "brandmgr" │
          │                          └─────────────────────────────┘
          ▼
   roleKey ∈ { admin, executive, brandmgr, accountant, manager, procurement }
          │
          ▼
   session = { roleKey, ...ROLES[roleKey], name, email }
          │
          ▼
   navigate to ROLES[roleKey].nav[0]   →  e.g. brandmgr → BmDashboard tab 0
```

If `/auth/me` 401s, the bootstrap clears the token and renders LoginPage again. If the user's role code isn't in `ROLE_CODE_MAP` ([src/lib/authMap.js:5](src/lib/authMap.js#L5)), the token is dropped — the SPA treats unknown roles as logged-out.

---

## 3. Role registry

Defined in [src/data/mockData.js](src/data/mockData.js). The `roleKey` resolved at bootstrap is the lookup key.

| Backend code | `roleKey` | Brand binding | Lands on | Tabs |
|---|---|---|---|---|
| `ADMIN` / `SYSTEM_ADMIN` | `admin` | Head Office (global) | AdminDashboard | Users & Invites · Roles & Permissions · Brands & Shops · System Audit |
| `EXECUTIVE` / `EXEC` | `executive` | Simbisa Group (global) | ExecDashboard | Group Overview · Brand Breakdown · Petty Cash · InnBucks Sales · Supplier Analytics · Custom Reports |
| `BRAND_MANAGER` | `brandmgr` | Single brand | BmDashboard | Approvals · InnBucks Sales |
| `BRAND_ACCOUNTANT` | `accountant` | Single brand | AccDashboard | Overview · Review Queue · Budget Management |
| `SHOP_MANAGER` | `manager` | Single shop within brand | MgrDashboard (+ MgrNewRequest) | Dashboard · New Request · My Requests |
| `PROCUREMENT` | `procurement` | Head Office (global) | ProcDashboard | Overview · Supplier Profiles · Products · Analytics · Statements · Supplier Portal |

Brand/shop scope from `access_context.roles[i]` gates what the dashboard fetches — e.g. `BmDashboard` filters approvals to the session brand; `MgrDashboard` will eventually filter requests to the session shop once `?shop_id=` is honoured.

---

## 4. Per-role dataflow

Each section: **nav** → **API calls** → **what gets rendered** → **broken bits**.

### 4.1 Admin (`roleKey: admin`)

```
AdminDashboard mount
   │
   ├─► Promise.all([
   │     GET /users               → users[]      (with assignments[])
   │     GET /invitations         → invitations[]
   │     GET /roles               → roles[]      (each w/ permissions[])
   │     GET /brand-shop/brands   → brands[]
   │     GET /brand-shop/shops    → shops[]
   │   ])
   │
   ├─► Tab 0 — Users & Invites
   │     row "Roles" button       → UserRolesModal
   │       POST /users/:id/assignments        ← add
   │       PUT  /users/:id/assignments/:aid   ← edit scope
   │       DELETE /users/:id/assignments/:aid ← remove
   │     row "Edit"                → EditUserModal
   │       PUT /users/:id
   │     row "Revoke"              → RevokeUserModal
   │       PATCH /users/:id/status
   │     "+ Invite User"           → InviteUserModal
   │       POST /invitations
   │     invitation row "Resend"   → POST /invitations/:id/resend
   │     invitation row "Cancel"   → POST /invitations/:id/revoke
   │
   ├─► Tab 1 — Roles & Permissions
   │     "+ New Role"              → RoleEditModal (create)
   │       POST /roles
   │     row "Edit"                → RoleEditModal (edit)
   │       PUT /roles/:id
   │     row "Edit perms"          → RolePermissionsModal
   │       GET /permissions   ⚠ 500 — see ENDPOINTS.md P0 #1
   │       PUT /roles/:id/permissions
   │     row "Delete"              → DELETE /roles/:id
   │
   ├─► Tab 2 — Brands & Shops
   │     CRUD on /brand-shop/{brands,shops}
   │
   └─► Tab 3 — System Audit
         GET /audit-logs   🚧 404 → EndpointPendingBanner
```

**Broken paths reaching this view:** `GET /permissions` (P0), `GET /audit-logs` (P1).

### 4.2 Executive (`roleKey: executive`)

```
ExecDashboard mount
   │
   ├─► GET /brand-shop/brands     → filter dropdown + brand summary table
   ├─► GET /brand-shop/shops      → shop filter dropdown
   │
   └─► Tabs 0-3 all need /reports/* — currently 404, EndpointPendingBanner everywhere.
       Tab 2 InnBucks Sales also needs /innbucks (404).
```

**KPI tiles render `—` until `/reports/executive` ships.**

### 4.3 Brand Manager (`roleKey: brandmgr`)

```
BmDashboard mount
   │
   ├─► GET /procurement/requests?status=pending   → APPROVALS[]
   │
   ├─► Tab 0 — Approvals queue
   │     row "Approve" → POST /procurement/requests/:id/approve  ─► refresh
   │     row "Reject"  → RejectModal (collects reason)
   │                     POST /procurement/requests/:id/reject
   │     row "Pay InnBucks" / Batch Pay
   │                   → POST /payments    ❌ unstarted (P2)
   │
   └─► Tab 1 — InnBucks Sales / Reconciliation / Daily Sales
         GET /innbucks            ❌
         GET /daily-sales         ❌
         GET /reconciliation      ❌
```

**Broken:** `/payments`, `/innbucks`, `/daily-sales`, `/reconciliation` (all P2).

### 4.4 Brand Accountant (`roleKey: accountant`)

```
AccDashboard mount
   │
   ├─► GET /brand-shop/shops               → SHOPS[] (filtered to session brand)
   ├─► GET /procurement/requests?status=pending → QUEUE_DATA[]
   ├─► GET /budgets                        → budgetsRaw[]  (joined to shops by shop_id)
   │
   ├─► Tab 0 — Overview
   │     Renders shop budget rows joined with budgets data.
   │     Disbursed totals → need GET /reports/brand   🚧 404 (P1)
   │
   ├─► Tab 1 — Review Queue
   │     row "Approve" → POST /procurement/requests/:id/approve
   │     row "Reject"  → RejectModal → POST /procurement/requests/:id/reject
   │     Over-budget flag column → need GET /reports/shop   🚧 404 (P1)
   │
   └─► Tab 2 — Budget Management
         List uses /budgets ✅
         "Edit Budgets" → BudgetModal (currently local-state only;
                          PUT /budgets/:id helper exists, not yet wired)
         Disbursed % bars → need GET /reports/brand   🚧 404 (P1)
```

### 4.5 Shop Manager (`roleKey: manager`)

```
MgrDashboard
   │
   ├─► GET /procurement/requests   → "My Requests" table
   │
   └─► "+ New Request" navigates to MgrNewRequest

MgrNewRequest (3 steps: Details · Supplier · Submit)
   │
   ├─► On mount:
   │     GET /procurement/categories  → category dropdown
   │     GET /procurement/suppliers   → supplier dropdown (filter status=active|approved)
   │
   ├─► Step 1 inline:
   │     "+ New Supplier" → NewSupplierModal → POST /procurement/suppliers
   │
   └─► Step 3 Submit:
         POST /procurement/requests
           payload: { category_id, supplier_id, amount, description }
         on success → toast → SubmitRequestModal → back to MgrDashboard
```

The file-attachment input has no upload target yet — `/files` doesn't exist (P3 #15). Budget KPIs at the top of MgrDashboard show `—` until a per-shop `/budgets?shop_id=` filter ships.

### 4.6 Procurement (`roleKey: procurement`)

```
ProcDashboard mount
   │
   ├─► Promise.all([
   │     GET /procurement/suppliers
   │     GET /procurement/products
   │     GET /procurement/categories
   │   ])
   │
   ├─► Tab 0 — Overview KPIs
   │
   ├─► Tab 1 — Supplier Profiles
   │     row "Approve"     → POST /procurement/suppliers/:id/approve
   │     row "Reject"      → POST /procurement/suppliers/:id/reject  (with reason)
   │     row "Suspend"     → POST /procurement/suppliers/:id/suspend
   │     row "Reactivate"  → POST /procurement/suppliers/:id/reactivate
   │     row "Delete"      → DELETE /procurement/suppliers/:id
   │     SupplierDetailModal:
   │       GET /procurement/suppliers/:id
   │       GET /procurement/suppliers/:id/documents
   │       GET /procurement/suppliers/:id/products
   │       upload/approve/reject/delete document endpoints
   │       link/update/unlink supplier↔product endpoints
   │       sync brand scope: POST /procurement/suppliers/:id/brands
   │
   ├─► Tab 2 — Products
   │     CRUD on /procurement/products (incl. delete)
   │
   ├─► Tab 3 — Analytics — local computation from already-loaded arrays
   │
   ├─► Tab 4 — Statements — local
   │
   └─► Tab 5 — Supplier Portal — local
```

This dashboard is the most fully wired (24 distinct endpoints).

---

## 5. The cross-role lifecycle: a procurement request

The most important multi-actor flow in the system.

```
┌──────────────────────┐
│  Shop Manager        │
│  MgrNewRequest       │
└──────────┬───────────┘
           │ POST /procurement/requests
           │   { category_id, supplier_id, amount, description }
           ▼
┌──────────────────────────────────────┐
│  request.status = "pending"          │
│  visible to BM and Accountant        │
│  via GET /procurement/requests       │
│         ?status=pending              │
└──────────┬─────────────────┬─────────┘
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌────────────────────┐
│ Brand Accountant │  │  Brand Manager     │
│ AccDashboard T1  │  │  BmDashboard T0    │
└──────────┬───────┘  └─────────┬──────────┘
           │                    │
   approve │ reject     approve │ reject
           ▼                    ▼
   POST /procurement/requests/:id/approve
           or
   POST /procurement/requests/:id/reject  (body: { reason })
           │
           ▼
┌──────────────────────────────────────┐
│  request.status = "approved" |       │
│                  "rejected"          │
│  Manager's "My Requests" reflects it │
└──────────────────────────────────────┘

           ⚠ Pay InnBucks (BM) → POST /payments  → 404 module unstarted (P2)
           ⚠ The legacy /cash-entries.{view,create,submit,approve} permissions
             still exist on three roles but no routes — see P3 #13.
```

What's *not* there: `/submit`, `/cancel`, `/items`, `/comments`, `/history`, `/forward`, `/restore`. The workflow is deliberately collapsed into create → approve / reject. Status filtering happens via query params on the index.

---

## 6. The other cross-cutting flows

### 6.1 Currency (read-only lookup)

```
AppContext mount
   │
   ▼
GET /currency  →  [{ code: "USD", symbol: "$", is_default: 1 },
                   { code: "ZWG", symbol: "Z$", is_default: 0 }]
   │
   ▼
context.currencies  ← available everywhere via useApp()
```

The legacy `formatMoney/formatMoneyShort/convert` helpers in [src/lib/currency.js](src/lib/currency.js) still hard-code USD↔ZWL with `ZWL_RATE = 2750`. They're untouched — `currencies` is a parallel data source for any future code that needs the dynamic list.

### 6.2 Sign-out (per-device vs everywhere)

```
SideNav profile footer
   │
   ├─ "Sign out (this device)" icon → AppContext.logout()
   │      └─ POST /auth/logout       (current token only)
   │
   └─ "Sign out everywhere" icon (with confirm prompt)
          └─ AppContext.logoutEverywhere()
                 └─ POST /auth/logout-all  (revokes every token)
```

Both paths clear `localStorage.token`, drop the session, and re-render LoginPage.

### 6.3 Auth-restricted lookups

Some endpoints look like simple GETs but are gated by the user's `access_context`:

| Endpoint | Gate | Symptom for ADMIN without scope |
|---|---|---|
| `GET /budgets` | requires brand assignment | `422 "No brand is assigned to this user."` |
| `POST /procurement/requests` | requires SHOP_MANAGER | `422 "Logged-in user is not assigned as a Shop Manager."` |
| `POST /procurement/suppliers/:id/approve` | requires `procurement.suppliers.approve` permission | `403 / 422` |

Discovery of these gates happens at runtime — there's no client-side enforcement of role scope. The SPA shows the action button if the role has the role nav item; the server may still 422.

---

## 7. Pagination + response shape

Almost every list endpoint returns Laravel's pagination envelope:

```json
{
  "current_page": 1,
  "data": [ /* ... */ ],
  "first_page_url": "...",
  "last_page": 1,
  "per_page": 15,
  "total": 42
}
```

The `unwrap` helper in [src/lib/cvsApi.js](src/lib/cvsApi.js) flattens this — list helpers (`listUsers`, `listBudgets`, etc.) return just the inner array. Single-record endpoints return `{ message, data }` and the helpers `.then((r) => r.data)` to give the caller the full envelope; views typically destructure further (`r.data.user`, `r.data.role`, etc.) based on the controller.

---

## 8. Failure modes & how the UI degrades

| Failure | What the user sees |
|---|---|
| **401 on any request** | axios response interceptor clears `localStorage` and forces `window.location = '/login'` ([src/lib/cvsApi.js:104](src/lib/cvsApi.js#L104)). |
| **404 on a wired endpoint** | View renders an inline `EndpointPendingBanner` with the path name, plus an empty table / `—` KPIs. |
| **5xx (e.g. /permissions)** | View renders an in-context error block (RolePermissionsModal explicitly handles `>=500` differently to surface "permissions service is temporarily unavailable"). |
| **422 (validation / role gate)** | Toast: `"<Verb> failed"` with the server's `message`. The form stays open so the user can retry. |
| **Network failure (CORS / DNS / mixed-content)** | Console group with `[cvsApi] ✗ Network error` and a hint. UI behaves like 5xx — empty state. |

The standard view pattern is: `loading` → `loadError` → `data.length === 0` → table — so every dashboard renders something even when the backend is misbehaving.

---

## 9. One-screen summary

```
                                            ┌─────────────────────────────────────┐
                                            │  LIVE & WIRED                       │
  Browser SPA                                │  /auth/* (8)   /users/*  /roles/*   │
   │                                         │  /invitations/*  /brand-shop/*      │
   │ Bearer token in localStorage            │  /procurement/products              │
   ▼                                         │  /procurement/categories            │
  axios → /api/v1/*                          │  /procurement/suppliers + workflow  │
   │                                         │  /procurement/suppliers/:id/        │
   ▼                                         │      documents + products           │
  Hono proxy (server.js)                     │  /procurement/requests + approve/   │
   │                                         │      reject                         │
   ▼                                         │  /budgets (brand-scoped)            │
  Laravel API                                │  /currency                          │
   │                                         └─────────────────────────────────────┘
   │
   ▼                                         ┌─────────────────────────────────────┐
  MySQL / Redis                              │  BROKEN OR MISSING                  │
                                             │  ⚠ /permissions          (P0 500)   │
                                             │  🚧 /reports/* (×5)       (P1 404)  │
                                             │  🚧 /audit-logs           (P1 404)  │
                                             │  ❌ /payments             (P2)       │
                                             │  ❌ /innbucks /daily-sales /recon   │
                                             │  ❌ /notifications        (P2)       │
                                             │  ❌ /cash-entries (legacy, P3 #13)  │
                                             │  ❌ /files                (P3 #15)   │
                                             └─────────────────────────────────────┘
```

For the canonical broken-endpoint triage with severity and fixes, see [ENDPOINTS.md → 🚨 Backend attention required](ENDPOINTS.md#-backend-attention-required).
