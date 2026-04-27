# Backend Audit

Generated against `https://cvsplatform-production.up.railway.app/api/v1` as ADMIN. Backend discovery uses Laravel's 405 "Supported methods" reflection — every reported route is verified live, not guessed.

- **Backend exposes:** 77 registered (verb, path) tuples
- **Frontend wires:** 77 helpers in `src/lib/cvsApi.js`
- **Coverage:** 77/77 backend routes have a frontend helper
- **Unwired backend routes:** 0
- **Ghost wires (helper exists, server doesn't):** 0
- **Orphan helpers (no view imports):** 0

## 1. Backend — every registered route

| ✓ | Verb | Path | Helper in cvsApi.js |
|---|---|---|---|
| ✅ | DELETE | `/budgets/{id}` | `deleteBudget` |
| ✅ | DELETE | `/procurement/categories/{id}` | `deleteProcurementCategory` |
| ✅ | DELETE | `/procurement/products/{id}` | `deleteProcurementProduct` |
| ✅ | DELETE | `/procurement/suppliers/{id}` | `deleteSupplier` |
| ✅ | DELETE | `/procurement/suppliers/{id}/documents/{id}` | `deleteSupplierDocument` |
| ✅ | DELETE | `/procurement/suppliers/{id}/products/{id}` | `unlinkSupplierProduct` |
| ✅ | DELETE | `/roles/{id}` | `deleteRole` |
| ✅ | DELETE | `/users/{id}/assignments/{id}` | `removeUserRoleAssignment` |
| ✅ | GET | `/auth/me` | `getMyProfile` |
| ✅ | GET | `/brand-shop/brands` | `listBrands` |
| ✅ | GET | `/brand-shop/brands/{id}` | `showBrand` |
| ✅ | GET | `/brand-shop/brands/{id}/shops` | `listShopsForBrand` |
| ✅ | GET | `/brand-shop/shops` | `listShops` |
| ✅ | GET | `/brand-shop/shops/{id}` | `showShop` |
| ✅ | GET | `/budgets` | `listBudgets` |
| ✅ | GET | `/budgets/{id}` | `showBudget` |
| ✅ | GET | `/currency` | `listCurrencies` |
| ✅ | GET | `/invitations` | `listInvitations` |
| ✅ | GET | `/invitations/{id}` | `showInvitation` |
| ✅ | GET | `/permissions` | `listPermissions` |
| ✅ | GET | `/procurement/categories` | `listProcurementCategories` |
| ✅ | GET | `/procurement/categories/{id}` | `showProcurementCategory` |
| ✅ | GET | `/procurement/products` | `listProcurementProducts` |
| ✅ | GET | `/procurement/products/{id}` | `showProcurementProduct` |
| ✅ | GET | `/procurement/requests` | `listProcurementRequests` |
| ✅ | GET | `/procurement/requests/{id}` | `showProcurementRequest` |
| ✅ | GET | `/procurement/suppliers` | `listSuppliers` |
| ✅ | GET | `/procurement/suppliers/{id}` | `showSupplier` |
| ✅ | GET | `/procurement/suppliers/{id}/documents` | `listSupplierDocuments` |
| ✅ | GET | `/procurement/suppliers/{id}/products` | `listSupplierProducts` |
| ✅ | GET | `/roles` | `listRoles` |
| ✅ | GET | `/roles/{id}` | `showRole` |
| ✅ | GET | `/users` | `listUsers` |
| ✅ | GET | `/users/{id}` | `showUser` |
| ✅ | PATCH | `/users/{id}/status` | `updateUserStatus` |
| ✅ | POST | `/auth/accept-invite` | `acceptInvite` |
| ✅ | POST | `/auth/change-password` | `changePassword` |
| ✅ | POST | `/auth/forgot-password` | `forgotPassword` |
| ✅ | POST | `/auth/login` | `loginUser` |
| ✅ | POST | `/auth/logout` | `logout` |
| ✅ | POST | `/auth/logout-all` | `logoutAllSessions` |
| ✅ | POST | `/auth/reset-password` | `completePasswordReset` |
| ✅ | POST | `/brand-shop/brands` | `createBrand` |
| ✅ | POST | `/brand-shop/shops` | `createShop` |
| ✅ | POST | `/budgets` | `createBudget` |
| ✅ | POST | `/invitations` | `inviteUser` |
| ✅ | POST | `/invitations/{id}/resend` | `resendInvitation` |
| ✅ | POST | `/invitations/{id}/revoke` | `revokeInvite` |
| ✅ | POST | `/procurement/categories` | `createProcurementCategory` |
| ✅ | POST | `/procurement/products` | `createProcurementProduct` |
| ✅ | POST | `/procurement/requests` | `createProcurementRequest` |
| ✅ | POST | `/procurement/requests/{id}/approve` | `approveProcurementRequest` |
| ✅ | POST | `/procurement/requests/{id}/reject` | `rejectProcurementRequest` |
| ✅ | POST | `/procurement/suppliers` | `createSupplier` |
| ✅ | POST | `/procurement/suppliers/{id}/approve` | `approveSupplier` |
| ✅ | POST | `/procurement/suppliers/{id}/brands` | `syncSupplierBrands` |
| ✅ | POST | `/procurement/suppliers/{id}/documents` | `uploadSupplierDocument` |
| ✅ | POST | `/procurement/suppliers/{id}/documents/{id}/approve` | `approveSupplierDocument` |
| ✅ | POST | `/procurement/suppliers/{id}/documents/{id}/reject` | `rejectSupplierDocument` |
| ✅ | POST | `/procurement/suppliers/{id}/products` | `linkSupplierProduct` |
| ✅ | POST | `/procurement/suppliers/{id}/reactivate` | `reactivateSupplier` |
| ✅ | POST | `/procurement/suppliers/{id}/reject` | `rejectSupplier` |
| ✅ | POST | `/procurement/suppliers/{id}/suspend` | `suspendSupplier` |
| ✅ | POST | `/roles` | `createRole` |
| ✅ | POST | `/users` | `createUser` |
| ✅ | POST | `/users/{id}/assignments` | `assignUserRole` |
| ✅ | PUT | `/brand-shop/brands/{id}` | `updateBrand` |
| ✅ | PUT | `/brand-shop/shops/{id}` | `updateShop` |
| ✅ | PUT | `/budgets/{id}` | `updateBudget` |
| ✅ | PUT | `/procurement/categories/{id}` | `updateProcurementCategory` |
| ✅ | PUT | `/procurement/products/{id}` | `updateProcurementProduct` |
| ✅ | PUT | `/procurement/suppliers/{id}` | `updateSupplier` |
| ✅ | PUT | `/procurement/suppliers/{id}/products/{id}` | `updateSupplierProduct` |
| ✅ | PUT | `/roles/{id}` | `updateRole` |
| ✅ | PUT | `/roles/{id}/permissions` | `syncRolePermissions` |
| ✅ | PUT | `/users/{id}` | `updateUser` |
| ✅ | PUT | `/users/{id}/assignments/{id}` | `updateUserRoleAssignment` |

## 2. Frontend — every helper in `cvsApi.js`

Usage column counts how many files in `src/` (excluding cvsApi.js itself) import the helper.

| Verb | Helper | Path | Used in (#files) |
|---|---|---|---|
| POST | `loginUser` | `/auth/login` | 1 — src/components/Login/LoginPage.jsx |
| GET | `getMyProfile` | `/auth/me` | 2 — src/context/AppContext.jsx, src/lib/authMap.js |
| POST | `changePassword` | `/auth/change-password` | 1 — src/components/modals/AllModals.jsx |
| POST | `forgotPassword` | `/auth/forgot-password` | 1 — src/components/Login/LoginPage.jsx |
| POST | `logout` | `/auth/logout` | 2 — src/context/AppContext.jsx, src/components/Layout/AppSideNav.jsx |
| POST | `logoutAllSessions` | `/auth/logout-all` | 1 — src/context/AppContext.jsx |
| POST | `acceptInvite` | `/auth/accept-invite` | 1 — src/components/Login/AcceptInvitePage.jsx |
| POST | `completePasswordReset` | `/auth/reset-password` | 1 — src/components/Login/ResetPasswordPage.jsx |
| GET | `listUsers` | `/users` | 1 — src/views/AdminDashboard.jsx |
| GET | `showUser` | `/users/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createUser` | `/users` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateUser` | `/users/${id}` | 1 — src/components/modals/AllModals.jsx |
| PATCH | `updateUserStatus` | `/users/${id}/status` | 1 — src/components/modals/AllModals.jsx |
| POST | `assignUserRole` | `/users/${userId}/assignments` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateUserRoleAssignment` | `/users/${userId}/assignments/${assignmentId}` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `removeUserRoleAssignment` | `/users/${userId}/assignments/${assignmentId}` | 1 — src/components/modals/AllModals.jsx |
| GET | `listRoles` | `/roles` | 2 — src/components/modals/AllModals.jsx, src/views/AdminDashboard.jsx |
| GET | `showRole` | `/roles/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createRole` | `/roles` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateRole` | `/roles/${id}` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `deleteRole` | `/roles/${id}` | 2 — src/components/modals/AllModals.jsx, src/views/AdminDashboard.jsx |
| PUT | `syncRolePermissions` | `/roles/${roleId}/permissions` | 1 — src/components/modals/AllModals.jsx |
| GET | `listPermissions` | `/permissions` | 1 — src/components/modals/AllModals.jsx |
| GET | `listBrands` | `/brand-shop/brands` | 4 — src/components/modals/AllModals.jsx, src/views/AdminDashboard.jsx, src/views/ReportsDashboard.jsx, src/views/ExecDashboard.jsx |
| GET | `showBrand` | `/brand-shop/brands/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createBrand` | `/brand-shop/brands` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateBrand` | `/brand-shop/brands/${id}` | 1 — src/components/modals/AllModals.jsx |
| GET | `listShopsForBrand` | `/brand-shop/brands/${brandId}/shops` | 1 — src/components/modals/AllModals.jsx |
| GET | `listShops` | `/brand-shop/shops` | 3 — src/views/AdminDashboard.jsx, src/views/AccDashboard.jsx, src/views/ExecDashboard.jsx |
| GET | `showShop` | `/brand-shop/shops/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createShop` | `/brand-shop/shops` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateShop` | `/brand-shop/shops/${id}` | 1 — src/components/modals/AllModals.jsx |
| GET | `listInvitations` | `/invitations` | 1 — src/views/AdminDashboard.jsx |
| POST | `inviteUser` | `/invitations` | 1 — src/components/modals/AllModals.jsx |
| GET | `showInvitation` | `/invitations/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `resendInvitation` | `/invitations/${id}/resend` | 1 — src/views/AdminDashboard.jsx |
| POST | `revokeInvite` | `/invitations/${id}/revoke` | 1 — src/views/AdminDashboard.jsx |
| GET | `listProcurementProducts` | `/procurement/products` | 2 — src/components/modals/AllModals.jsx, src/views/ProcDashboard.jsx |
| GET | `showProcurementProduct` | `/procurement/products/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createProcurementProduct` | `/procurement/products` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateProcurementProduct` | `/procurement/products/${id}` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `deleteProcurementProduct` | `/procurement/products/${id}` | 2 — src/components/modals/AllModals.jsx, src/views/ProcDashboard.jsx |
| GET | `listProcurementCategories` | `/procurement/categories` | 2 — src/views/ProcDashboard.jsx, src/views/MgrNewRequest.jsx |
| GET | `showProcurementCategory` | `/procurement/categories/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createProcurementCategory` | `/procurement/categories` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateProcurementCategory` | `/procurement/categories/${id}` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `deleteProcurementCategory` | `/procurement/categories/${id}` | 1 — src/components/modals/AllModals.jsx |
| GET | `listSuppliers` | `/procurement/suppliers` | 2 — src/views/ProcDashboard.jsx, src/views/MgrNewRequest.jsx |
| GET | `showSupplier` | `/procurement/suppliers/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createSupplier` | `/procurement/suppliers` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateSupplier` | `/procurement/suppliers/${id}` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `deleteSupplier` | `/procurement/suppliers/${id}` | 2 — src/components/modals/AllModals.jsx, src/views/ProcDashboard.jsx |
| POST | `approveSupplier` | `/procurement/suppliers/${id}/approve` | 1 — src/views/ProcDashboard.jsx |
| POST | `rejectSupplier` | `/procurement/suppliers/${id}/reject` | 1 — src/components/modals/AllModals.jsx |
| POST | `suspendSupplier` | `/procurement/suppliers/${id}/suspend` | 1 — src/components/modals/AllModals.jsx |
| POST | `reactivateSupplier` | `/procurement/suppliers/${id}/reactivate` | 2 — src/components/modals/AllModals.jsx, src/views/ProcDashboard.jsx |
| POST | `syncSupplierBrands` | `/procurement/suppliers/${id}/brands` | 1 — src/components/modals/AllModals.jsx |
| GET | `listSupplierDocuments` | `/procurement/suppliers/${supplierId}/documents` | 1 — src/components/modals/AllModals.jsx |
| POST | `uploadSupplierDocument` | `/procurement/suppliers/${supplierId}/documents` | 1 — src/components/modals/AllModals.jsx |
| POST | `approveSupplierDocument` | `/procurement/suppliers/${supplierId}/documents/${documentId}/approve` | 1 — src/components/modals/AllModals.jsx |
| POST | `rejectSupplierDocument` | `/procurement/suppliers/${supplierId}/documents/${documentId}/reject` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `deleteSupplierDocument` | `/procurement/suppliers/${supplierId}/documents/${documentId}` | 1 — src/components/modals/AllModals.jsx |
| GET | `listSupplierProducts` | `/procurement/suppliers/${supplierId}/products` | 2 — src/components/modals/AllModals.jsx, src/views/ProcDashboard.jsx |
| POST | `linkSupplierProduct` | `/procurement/suppliers/${supplierId}/products` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateSupplierProduct` | `/procurement/suppliers/${supplierId}/products/${productId}` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `unlinkSupplierProduct` | `/procurement/suppliers/${supplierId}/products/${productId}` | 1 — src/components/modals/AllModals.jsx |
| GET | `listProcurementRequests` | `/procurement/requests` | 3 — src/views/AccDashboard.jsx, src/views/BmDashboard.jsx, src/views/MgrDashboard.jsx |
| GET | `showProcurementRequest` | `/procurement/requests/${id}` | 1 — src/components/modals/AllModals.jsx |
| POST | `createProcurementRequest` | `/procurement/requests` | 1 — src/views/MgrNewRequest.jsx |
| POST | `approveProcurementRequest` | `/procurement/requests/${id}/approve` | 2 — src/views/AccDashboard.jsx, src/views/BmDashboard.jsx |
| POST | `rejectProcurementRequest` | `/procurement/requests/${id}/reject` | 2 — src/views/AccDashboard.jsx, src/views/BmDashboard.jsx |
| GET | `listBudgets` | `/budgets` | 1 — src/views/AccDashboard.jsx |
| GET | `showBudget` | `/budgets/${id}` | 1 — src/views/AccDashboard.jsx |
| POST | `createBudget` | `/budgets` | 1 — src/components/modals/AllModals.jsx |
| PUT | `updateBudget` | `/budgets/${id}` | 1 — src/components/modals/AllModals.jsx |
| DELETE | `deleteBudget` | `/budgets/${id}` | 1 — src/components/modals/AllModals.jsx |
| GET | `listCurrencies` | `/currency` | 1 — src/context/AppContext.jsx |

## 3. Gaps & quality issues

### Unwired backend routes (server has them, no helper)

_None — every backend route has a helper._

### Ghost wires (helper exists, server doesn't respond)

_None — every helper points at a route the backend recognises._

### Orphan helpers (helper defined, no view imports it)

_None — every helper is consumed by at least one view/component._

### Modules confirmed missing on the backend

See [ENDPOINTS.md → Backend attention required](ENDPOINTS.md#-backend-attention-required) for the prioritised triage. Re-probed live now:

| Path | Status |
|---|---|
| `/audit-logs` | 404 not registered |
| `/auth/devices` | 404 not registered |
| `/auth/refresh` | 404 not registered |
| `/auth/sessions` | 404 not registered |
| `/auth/two-factor` | 404 not registered |
| `/auth/verify-email` | 404 not registered |
| `/brand-shop` | 404 not registered |
| `/cash-entries` | 404 not registered |
| `/currencies` | 404 not registered |
| `/currency/00000000-0000-0000-0000-000000000000` | 404 not registered |
| `/daily-sales` | 404 not registered |
| `/disbursements` | 404 not registered |
| `/files` | 404 not registered |
| `/innbucks` | 404 not registered |
| `/invitations/00000000-0000-0000-0000-000000000000/accept` | 404 not registered |
| `/notifications` | 404 not registered |
| `/payments` | 404 not registered |
| `/permissions/00000000-0000-0000-0000-000000000000` | 404 not registered |
| `/procurement` | 404 not registered |
| `/procurement/requests/00000000-0000-0000-0000-000000000000/cancel` | 404 not registered |
| `/procurement/requests/00000000-0000-0000-0000-000000000000/submit` | 404 not registered |
| `/reconciliation` | 404 not registered |
| `/reports` | 404 not registered |
| `/reports/brand` | 404 not registered |
| `/reports/executive` | 404 not registered |
| `/reports/export` | 404 not registered |
| `/reports/shop` | 404 not registered |
| `/roles/00000000-0000-0000-0000-000000000000/users` | 404 not registered |
| `/uploads` | 404 not registered |
| `/users/00000000-0000-0000-0000-000000000000/activity` | 404 not registered |
| `/users/00000000-0000-0000-0000-000000000000/avatar` | 404 not registered |
| `/users/00000000-0000-0000-0000-000000000000/permissions` | 404 not registered |
| `/users/00000000-0000-0000-0000-000000000000/roles` | 404 not registered |
| `/users/00000000-0000-0000-0000-000000000000/sessions` | 404 not registered |
