# API Endpoint Status

Snapshot of every dashboard / feature in this app and the backend route it depends on. Generated against `https://cvsplatform-production.up.railway.app/api/v1` — Laravel API authenticated as `tinashe.munyeki@simbisa.co.zw` (ADMIN).

## Legend

| Mark | Meaning |
|---|---|
| ✅ | Endpoint exists, helper in `src/lib/cvsApi.js`, UI invokes it |
| ⚠️ | Endpoint exists, but currently 5xx (broken backend) |
| 🚧 | No backend route registered (404). Permissions may be seeded |
| ❌ | No backend route, no permissions seeded — module unstarted |

## Headline numbers

- **68** distinct `(verb, path)` tuples wired and live (up from 57)
- **1** wired but broken: `GET /permissions` (Laravel TypeError)
- **2** routes wired in `cvsApi.js` that depend on a broken upstream (`PUT /roles/:id/permissions` works, but its picker UI needs `/permissions`)
- **3 modules newly shipped**: `procurement/requests` (5 routes), `budgets` (5 routes), `currency` (1 route)

---

## Auth & Session — wired everywhere

| Verb | Path | Helper | Used by |
|---|---|---|---|
| ✅ POST | `/auth/login` | `loginUser` | LoginPage |
| ✅ GET  | `/auth/me` | `getMyProfile` | AppContext bootstrap |
| ✅ POST | `/auth/change-password` | `changePassword` | AppHeader lock button → ChangePasswordModal |
| ✅ POST | `/auth/forgot-password` | `forgotPassword` | LoginPage |
| ✅ POST | `/auth/reset-password` | `completePasswordReset` | `/reset-password` page |
| ✅ POST | `/auth/accept-invite` | `acceptInvite` | `/accept-invite` page |
| ✅ POST | `/auth/logout` | `logoutAll` | AppContext.logout |

---

## Admin Dashboard

### Tab 0 — Users & Invitations

| Verb | Path | Helper | Status |
|---|---|---|---|
| ✅ GET | `/users` | `listUsers` | wired |
| ✅ GET | `/users/:id` | `showUser` | UserDetailModal |
| ✅ POST | `/users` | `createUser` | CreateUserModal |
| ✅ PUT | `/users/:id` | `updateUser` | EditUserModal |
| ✅ PATCH | `/users/:id/status` | `updateUserStatus` | RevokeUserModal |
| ✅ POST | `/users/:id/assignments` | `assignUserRole` | AssignUserRoleModal |
| ✅ GET | `/invitations` | `listInvitations` | wired |
| ✅ GET | `/invitations/:id` | `showInvitation` | InvitationDetailModal |
| ✅ POST | `/invitations` | `inviteUser` | InviteUserModal |
| ✅ POST | `/invitations/:id/resend` | `resendInvitation` | row action |
| ✅ POST | `/invitations/:id/revoke` | `revokeInvite` | row action |

### Tab 1 — Roles & Permissions

| Verb | Path | Helper | Status |
|---|---|---|---|
| ✅ GET | `/roles` | `listRoles` | wired |
| ⚠️ GET | `/permissions` | `listPermissions` | **500 — Laravel TypeError in `RoleManagementController::index` line 25**. Frontend shows soft error. |
| ✅ PUT | `/roles/:id/permissions` | `syncRolePermissions` | RolePermissionsModal — UX gated on the broken `/permissions` 5xx until backend fixes the auth-middleware binding. |

### Tab 2 — Brands & Shops

| Verb | Path | Helper | Status |
|---|---|---|---|
| ✅ GET | `/brand-shop/brands` | `listBrands` | wired |
| ✅ GET | `/brand-shop/brands/:id` | `showBrand` | BrandDetailModal |
| ✅ POST | `/brand-shop/brands` | `createBrand` | BrandEditModal |
| ✅ PUT | `/brand-shop/brands/:id` | `updateBrand` | BrandEditModal |
| ✅ GET | `/brand-shop/brands/:id/shops` | `listShopsForBrand` | BrandDetailModal |
| ✅ GET | `/brand-shop/shops` | `listShops` | wired |
| ✅ GET | `/brand-shop/shops/:id` | `showShop` | ShopDetailModal |
| ✅ POST | `/brand-shop/shops` | `createShop` | ShopEditModal |
| ✅ PUT | `/brand-shop/shops/:id` | `updateShop` | ShopEditModal |

### Tab 3 — System Audit

| Verb | Path | Status |
|---|---|---|
| 🚧 GET | `/audit-logs` | `audit_logs.view` permission seeded on ADMIN, route 404. EndpointPendingBanner shown. |

---

## Procurement Dashboard — fully wired

### Products

| Verb | Path | Helper |
|---|---|---|
| ✅ GET | `/procurement/products` | `listProcurementProducts` |
| ✅ GET | `/procurement/products/:id` | `showProcurementProduct` |
| ✅ POST | `/procurement/products` | `createProcurementProduct` |
| ✅ PUT | `/procurement/products/:id` | `updateProcurementProduct` |
| ✅ DELETE | `/procurement/products/:id` | `deleteProcurementProduct` |

### Categories

| Verb | Path | Helper |
|---|---|---|
| ✅ GET | `/procurement/categories` | `listProcurementCategories` |
| ✅ GET | `/procurement/categories/:id` | `showProcurementCategory` |
| ✅ POST | `/procurement/categories` | `createProcurementCategory` |
| ✅ PUT | `/procurement/categories/:id` | `updateProcurementCategory` |
| ✅ DELETE | `/procurement/categories/:id` | `deleteProcurementCategory` |

### Suppliers (core)

| Verb | Path | Helper |
|---|---|---|
| ✅ GET | `/procurement/suppliers` | `listSuppliers` |
| ✅ GET | `/procurement/suppliers/:id` | `showSupplier` |
| ✅ POST | `/procurement/suppliers` | `createSupplier` |
| ✅ PUT | `/procurement/suppliers/:id` | `updateSupplier` |
| ✅ DELETE | `/procurement/suppliers/:id` | `deleteSupplier` |

### Supplier workflow

| Verb | Path | Helper |
|---|---|---|
| ✅ POST | `/procurement/suppliers/:id/approve` | `approveSupplier` |
| ✅ POST | `/procurement/suppliers/:id/reject` | `rejectSupplier` |
| ✅ POST | `/procurement/suppliers/:id/suspend` | `suspendSupplier` |
| ✅ POST | `/procurement/suppliers/:id/reactivate` | `reactivateSupplier` |
| ✅ POST | `/procurement/suppliers/:id/brands` | `syncSupplierBrands` |

### Supplier documents

| Verb | Path | Helper |
|---|---|---|
| ✅ GET | `/procurement/suppliers/:id/documents` | `listSupplierDocuments` |
| ✅ POST | `/procurement/suppliers/:id/documents` | `uploadSupplierDocument` |
| ✅ POST | `/procurement/suppliers/:id/documents/:docId/approve` | `approveSupplierDocument` |
| ✅ POST | `/procurement/suppliers/:id/documents/:docId/reject` | `rejectSupplierDocument` |
| ✅ DELETE | `/procurement/suppliers/:id/documents/:docId` | `deleteSupplierDocument` |

### Supplier ↔ Product links

| Verb | Path | Helper |
|---|---|---|
| ✅ GET | `/procurement/suppliers/:id/products` | `listSupplierProducts` |
| ✅ POST | `/procurement/suppliers/:id/products` | `linkSupplierProduct` |
| ✅ PUT | `/procurement/suppliers/:id/products/:pid` | `updateSupplierProduct` |
| ✅ DELETE | `/procurement/suppliers/:id/products/:pid` | `unlinkSupplierProduct` |

### Procurement Requests — newly shipped, replaces the old `cash-entries` flow

| Verb | Path | Helper | Used by |
|---|---|---|---|
| ✅ GET | `/procurement/requests` | `listProcurementRequests` | MgrDashboard (My Requests), BmDashboard Tab 0, AccDashboard Tab 1 |
| ✅ POST | `/procurement/requests` | `createProcurementRequest` | MgrNewRequest submit (Shop Manager only) |
| ✅ GET | `/procurement/requests/:id` | `showProcurementRequest` | (helper available, not yet rendered) |
| ✅ POST | `/procurement/requests/:id/approve` | `approveProcurementRequest` | BmDashboard Tab 0 row Approve, AccDashboard Tab 1 row Approve |
| ✅ POST | `/procurement/requests/:id/reject` | `rejectProcurementRequest` | RejectModal in BM and Accountant dashboards |

There is **no** `/submit`, `/cancel`, `/items`, `/comments`, `/history` sub-route — the workflow collapses into create → approve / reject. Status filters use query params on the index (`?status=pending`).

---

## Shop Manager (`MgrDashboard` + `MgrNewRequest`)

### Wired

| Endpoint | Where | Helper |
|---|---|---|
| ✅ GET `/procurement/categories` | New Request → category dropdown | `listProcurementCategories` |
| ✅ GET `/procurement/suppliers` | New Request → supplier dropdown (active/approved only) | `listSuppliers` |
| ✅ POST `/procurement/suppliers` | New Request → "+ New Supplier" inline | `createSupplier` |
| ✅ GET `/procurement/requests` | MgrDashboard "My Requests" table | `listProcurementRequests` |
| ✅ POST `/procurement/requests` | MgrNewRequest → Submit Request | `createProcurementRequest` |

### Pending

| Path | Note |
|---|---|
| 🚧 GET `/budgets?shop_id=:id` | `/budgets` ships at brand scope; per-shop aggregation for the Monthly Budget / Spent / Available KPIs is still missing. |
| 🚧 GET `/cash-entries` | The `cash_entries` permissions remain seeded but no HTTP routes were registered — the workflow now lives at `/procurement/requests`. |

---

## Brand Manager (`BmDashboard`)

### Tab 0 — Approvals queue

| Path | Status |
|---|---|
| ✅ GET `/procurement/requests?status=pending` | `listProcurementRequests({ status: 'pending' })` — wired |
| ✅ POST `/procurement/requests/:id/approve` | row Approve button — wired |
| ✅ POST `/procurement/requests/:id/reject` | row Reject button (RejectModal collects reason) — wired |
| ❌ POST `/payments` | No permission code seeded. Pay InnBucks / Batch Pay still stubs. |

### Tab 1 — InnBucks Sales / Reconciliation / Daily Sales

| Path | Status |
|---|---|
| ❌ GET `/innbucks` | No permission codes seeded for InnBucks. |
| ❌ GET `/daily-sales` | Same. |
| ❌ GET `/reconciliation` | Same. |

Both tabs show `EndpointPendingBanner` with notes describing what's seeded vs. unstarted.

---

## Brand Accountant (`AccDashboard`)

### Wired

| Endpoint | Where | Helper |
|---|---|---|
| ✅ GET `/brand-shop/shops` | Shops table (filtered to session brand). | `listShops` |
| ✅ GET `/procurement/requests?status=pending` | Tab 1 Review Queue | `listProcurementRequests` |
| ✅ POST `/procurement/requests/:id/approve` | Tab 1 row Approve | `approveProcurementRequest` |
| ✅ POST `/procurement/requests/:id/reject` | Tab 1 RejectModal | `rejectProcurementRequest` |
| ✅ GET `/budgets` | Tab 2 Shop Budget Limits table | `listBudgets` |

### Pending

| Tab | Path | Note |
|---|---|---|
| 🚧 Overview | `GET /reports/brand` | reports module not yet shipped |
| 🚧 Overview | `GET /reports/shop` | same |
| 🚧 Review Queue | `GET /reports/shop` | needed for over-budget flagging |
| 🚧 Budget Management | `GET /reports/brand` | needed for disbursed totals + 80% threshold |
| 🚧 Budget Management | `PUT /budgets/:id` | helper exists (`updateBudget`); BudgetModal save still local-only |

---

## Executive (`ExecDashboard`)

### Wired

| Endpoint | Where | Helper |
|---|---|---|
| ✅ GET `/brand-shop/brands` | Brand filter dropdown + brand summary table (metrics default to 0). | `listBrands` |
| ✅ GET `/brand-shop/shops` | Shop filter dropdown. | `listShops` |

### Pending

| Tab | Path | Permission seeded |
|---|---|---|
| 🚧 Group Overview | `GET /reports/executive` | `reports.executive.view` |
| 🚧 Group Overview | `GET /reports/export` | `reports.export` |
| 🚧 Group Overview | `GET /cash-entries (aggregated)` | `cash_entries.view` (not on EXEC role) |
| 🚧 Brand Breakdown | `GET /reports/executive?group_by=brand` | `reports.executive.view` |
| 🚧 Petty Cash | `GET /cash-entries` | as above |
| ❌ InnBucks Sales | `GET /innbucks` | No perms seeded |

---

## Reports (`ReportsDashboard`)

### Wired

| Endpoint | Where | Helper |
|---|---|---|
| ✅ GET `/brand-shop/brands` | Brand filter dropdown. | `listBrands` |

### Pending — entire content

| Path | Permission seeded |
|---|---|
| 🚧 GET `/reports` | `reports.{shop, brand, executive}.view` (role-scoped) |
| 🚧 POST `/reports/:id/generate` | (guess) |
| 🚧 GET `/reports/export` | `reports.export` |

---

## Backend modules — what the permission table says vs. what's reachable

| Module | API routes registered? | Notes |
|---|---|---|
| `auth` | ✅ | Fully wired |
| `users` | ✅ | Fully wired (incl. `users.assign_roles` via `POST /users/:id/assignments`) |
| `roles` | ✅ | List + detail + permission sync. Permission *list* still 500 |
| `permissions` | ⚠️ | Routes exist but `GET /permissions` 500s |
| `brands` | ✅ | Wired via `/brand-shop/brands` |
| `shops` | ✅ | Wired via `/brand-shop/shops` |
| `procurement` (catalog) | ✅ | Products, categories, suppliers, documents, links — all live |
| `procurement.requests` | ✅ | **NEW.** index + show + create + approve + reject. No `/submit`, `/cancel`, `/items` sub-routes — workflow is create → approve / reject. |
| `budgets` | ✅ | **NEW.** Full resource (index/show/store/update/destroy). Brand-scoped — admin without brand assignment sees 422. |
| `currency` | ✅ | **NEW.** `GET /currency` lists active currencies (USD + ZWG). Read-only. |
| `cash` (`cash_entries`) | ❌ | Permissions still seeded but the workflow shipped at `/procurement/requests` instead — `cash_entries` routes appear abandoned. |
| `reports` | 🚧 | Permissions seeded across most roles but no HTTP routes registered |
| `audit` (`audit_logs`) | 🚧 | `audit_logs.view` seeded on ADMIN, no route |
| `payments` / `disbursements` | ❌ | Not in permission table — Pay InnBucks still stub |
| `innbucks` / `sales` / `reconciliation` | ❌ | Not in permission table — module unstarted |
| `notifications` | ❌ | No permissions, no route |
| `files` / `uploads` (separate from supplier-document upload) | ❌ | No permissions, no route |

---

## Action items for the backend team

Sorted by user impact:

1. **Fix `GET /permissions`.** Add the `auth:sanctum` middleware to `RoleManagementController::index` (or whichever guard the rest of the API uses). Currently throws TypeError because `$request->user()` is null.
2. **Register the `reports` routes.** `reports.{shop, brand, executive}.view` and `reports.export` permissions exist but no route serves them — the BM/Acc/Exec/Reports dashboards still show empty KPIs and unwired banners because of this.
3. **Register `GET /audit-logs`.** Permission seeded.
4. **Confirm `cash_entries` is intentional dead seed data** — the `cash_entries.{view,create,submit,approve}` permissions exist on three roles but no HTTP routes; the equivalent workflow appears to live at `/procurement/requests`.
5. **Scope out the `disbursements` / `payments` / `innbucks` modules** — these have no permissions in the seed data and the BM Pay InnBucks / sales / reconciliation views are entirely placeholder until backend confirms scope.
