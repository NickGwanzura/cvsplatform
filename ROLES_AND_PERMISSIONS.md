# CVS Simbisa Platform: Roles and Permissions

Complete reference for user roles, access levels, and capabilities in the CVS (Controlled Vendor System) petty cash management platform.

---

## Overview

The CVS platform uses a six-tier role hierarchy with specific scopes, permissions, and data access levels. Each role has defined views, actions, and reports.

| Role | Label | Brand/Scope | User Count | Access Level |
|------|-------|-------------|-----------|--------------|
| **manager** | Shop Manager | Individual shop | 24 | Limited — shop level only |
| **accountant** | Brand Accountant | Single brand | 9 | Brand level |
| **brandmgr** | Brand Manager | Single brand | 9 | Brand level with approvals |
| **procurement** | Procurement | Head Office | 3 | Cross-brand supplier management |
| **admin** | System Admin | Head Office | 1 | All systems, user management |
| **executive** | Executive | Simbisa Group | 2 | Group-wide analytics |

---

## Role Details

### 1. Shop Manager (manager)

**Label:** Shop Manager
**Name:** K. Mutasa
**Brand/Scope:** Chicken Inn — Sh-14 (individual shop)
**Color Code:** `#0f62fe` (Blue)

#### Sidebar Navigation

| Nav Item | View Route | Links To | Notes |
|----------|-----------|----------|-------|
| Dashboard | `mgr-dashboard` | Tab 0 | My shop overview and pending requests |
| New Request | `mgr-new-request` | Tab 0 | Create new petty cash request |
| My Requests | `mgr-dashboard` | Tab 0 | Personal request history (badge: 3) |
| Reports | `reports` | (standalone) | Shop-level activity reports |

#### Available Actions

- **Submit Request** — Create new petty cash request for shop expenses
- **View Requests** — Track personal requests by status (review, paid, rejected)
- **Request Exception** — Submit exception approval for amounts exceeding budget threshold
- **View Details** — Click "View" to see full request details including supplier and purpose

#### Modals/Forms

- **ExceptionRequestModal** — Request exception for budget overages
- **RequestDetailModal** — View full request details and audit trail

#### Data Access (Read-Only)

- Monthly budget for own shop (e.g., Sh-14: $800)
- Spent amount and remaining balance
- Budget utilization percentage and threshold alerts (90% warning)
- Personal request list (only own requests)
- Audit log entries for own requests and shop activity
- Categories available for requests (Cleaning, Gas, Maintenance, Emergency, etc.)

#### Data Restrictions

- Cannot see other shops' requests
- Cannot see other brands' budgets
- Cannot approve or validate requests
- Cannot make payments
- No access to supplier information
- Cannot view brand-level analytics

---

### 2. Brand Accountant (accountant)

**Label:** Brand Accountant
**Name:** C. Mutandwa
**Brand/Scope:** Pizza Inn (all shops under one brand)
**Color Code:** `#da1e28` (Red)

#### Sidebar Navigation

| Nav Item | View Route | Links To | Notes |
|----------|-----------|----------|-------|
| Dashboard | `acc-dashboard` | Tab 0 | Overview and alerts |
| Review Queue | `acc-dashboard` | Tab 1 | Pending validations (badge: 7, alert: true) |
| Budget Management | `acc-dashboard` | Tab 2 | Set and monitor shop budgets |
| Reports | `reports` | (standalone) | Brand-level financial reports |

#### Available Actions

- **Validate Requests** — Approve or adjust request amounts in the review queue
- **Reject Requests** — Decline requests that don't meet criteria
- **Adjust Amounts** — Modify request amounts (especially for over-budget items)
- **Batch Validate** — Select multiple requests and validate in bulk
- **Set Budgets** — Configure per-shop monthly budget limits and category caps
- **View Budget Details** — Monitor spend trends and allocation per shop

#### Modals/Forms

- **ValidateModal** — Approve and forward request to Brand Manager
- **BudgetModal** — Edit shop budget limits and thresholds
- **RejectModal** — Reject request with reason notification
- **RequestDetailModal** — View request details before validation

#### Data Access (Read-Only)

- Brand-level total budget ($12,400 for Pizza Inn)
- Per-shop budget limits and utilization
- All pending requests for the brand (not just own shop)
- Request queue with filters (over limit, within limit, by manager)
- Budget burn trend charts (multi-week view per shop)
- Audit log entries for brand (validations, rejections, budget changes)
- All shop locations under brand
- Supplier names and amounts requested

#### Data Restrictions

- Cannot see other brands' requests
- Cannot approve or pay (Brand Manager only)
- Cannot manage system users
- Cannot view executive-level group analytics
- Cannot access procurement data

---

### 3. Brand Manager (brandmgr)

**Label:** Brand Manager
**Name:** T. Ndlovu
**Brand/Scope:** Chicken Inn (all shops under one brand)
**Color Code:** `#0f62fe` (Blue)

#### Sidebar Navigation

| Nav Item | View Route | Links To | Notes |
|----------|-----------|----------|-------|
| Dashboard | `bm-dashboard` | Tab 0 | Approvals and pending payments |
| InnBucks Sales | `bm-dashboard` | Tab 1 | Live transaction stream (badge: Live) |
| Audit Log | `bm-dashboard` | Tab 2 | Brand-level activity history |
| Reports | `reports` | (standalone) | Brand approval and sales reports |

#### Available Actions

- **Approve Payments** — Approve validated requests individually
- **Pay via InnBucks** — Process single payment to supplier wallet
- **Batch Pay** — Select multiple requests and process bulk payment via InnBucks
- **Approve Exceptions** — Approve or reject exception requests from shops
- **Reject Payments** — Decline approved requests (notify shop manager)
- **View InnBucks Sales** — Monitor live customer transactions and settlements
- **Raise Disputes** — Flag reconciliation discrepancies for InnBucks resolution
- **Download Statement** — Export InnBucks transaction statement (PDF)
- **Download Recon Report** — Export reconciliation report (PDF)

#### Modals/Forms

- **PayModal** — Process single InnBucks payment (enter wallet, confirm amount)
- **BatchPayModal** — Batch payment confirmation and processing
- **ExceptionApproveModal** — Approve or reject budget exception
- **StatementModal** — View and download InnBucks statement
- **RejectModal** — Reject approved request with notification

#### Data Access (Read-Only)

- All pending approvals for brand (validated by accountant)
- Total to disburse if all approved
- Paid this week (transaction count and total)
- Exception requests requiring approval
- Live InnBucks transactions (timestamp, shop, wallet, amount, status)
- Daily InnBucks sales trend (7-day chart)
- Reconciliation data (invoice vs settlement, discrepancies)
- Supplier wallets and InnBucks references
- Audit log for all brand activities

#### Data Restrictions

- Cannot modify budgets (accountant only)
- Cannot validate requests (accountant only)
- Cannot invite users or manage system roles
- Cannot see other brands' data
- Cannot access procurement supplier portal

---

### 4. Procurement (procurement)

**Label:** Procurement
**Name:** R. Chikwanda
**Brand/Scope:** Head Office (all brands, cross-brand management)
**Color Code:** `#6929c4` (Purple)

#### Sidebar Navigation

| Nav Item | View Route | Links To | Notes |
|----------|-----------|----------|-------|
| Overview | `proc-dashboard` | Tab 0 | Top suppliers and products summary |
| Supplier Trends | `proc-dashboard` | Tab 1 | Supplier spend and transaction analysis |
| Product Trends | `proc-dashboard` | Tab 2 | Category-level spend analytics |
| Supplier Portal | `proc-dashboard` | Tab 3 | Supplier verification and registry (badge: 2) |
| Reports | `reports` | (standalone) | Supplier and category analysis reports |

#### Available Actions

- **Verify Suppliers** — Approve supplier registration and activate on platform
- **Edit Supplier Details** — Update supplier wallet, category, or credentials
- **Renew Certifications** — Notify supplier to renew expiring certificates
- **Manage Credentials** — Add/update InnBucks wallet and verification docs
- **Export Data** — Download supplier, product, or breakdown tables to CSV
- **Register Supplier** — Add new supplier to system (via new request form)

#### Modals/Forms

- None explicitly shown; suppliers managed in Supplier Portal tab inline

#### Data Access (Read-Only)

- Supplier spend: MTD, YTD, transactions, trend
- All suppliers across all brands (7 active, 1 pending verification)
- Supplier categories (Cleaning, Maintenance, Gas, Equipment, Plumbing, Stationery)
- Supplier certification status and expiry dates
- InnBucks wallet numbers per supplier
- Brands served by each supplier
- Product category breakdown: value, quantity, percentage of spend
- Product trends: MoM change, avg cost per request
- Detailed breakdown by supplier, product, brand, shop, location
- Top 5 suppliers by spend
- Alert: Suppliers with expiring certifications (within 3 months)

#### Data Restrictions

- Cannot approve or reject requests
- Cannot make payments
- Cannot set budgets
- Cannot access shop-specific request details
- Cannot view executive-level group analytics beyond procurement data
- Cannot invite users or manage roles

---

### 5. System Admin (admin)

**Label:** System Admin
**Name:** S. Moyo
**Brand/Scope:** Head Office (system-wide access)
**Color Code:** `#005f73` (Teal/Dark)

#### Sidebar Navigation

| Nav Item | View Route | Links To | Notes |
|----------|-----------|----------|-------|
| Users & Invites | `admin-dashboard` | Tab 0 | User directory and invitations |
| Roles & Permissions | `admin-dashboard` | Tab 1 | Role definitions and access levels |
| System Audit | `admin-dashboard` | Tab 2 | System event log and compliance |

#### Available Actions

- **Invite User** — Send invitation emails to onboard new users
- **Edit User** — Modify user role, brand, and shop assignments
- **Resend Invite** — Resend invitation to pending users
- **Cancel Invite** — Withdraw pending invitations
- **Revoke User** — Deactivate active user accounts
- **Edit Role Permissions** — Adjust role-level permissions (placeholder action)
- **Search/Filter Logs** — Filter audit logs by role, brand, time range
- **Monitor Logins** — View failed login attempts and active sessions

#### Modals/Forms

- **InviteUserModal** — Send new user invitations (email, role, brand, shop)
- **EditUserModal** — Modify user role and scope
- **RevokeUserModal** — Deactivate user account

#### Data Access (Read-Only)

- All user accounts across system (active and pending)
- User details: name, email, role, brand, shop, invited by, status
- Active session count and failed login attempts (24h)
- Pending invites count
- Role definitions: 6 roles, permissions per role, access level percentage
- User count per role
- System audit log: all events (logins, invites, changes, exceptions)
- Event details: timestamp, actor, action, resource, brand/shop affected
- Failed login monitoring with IP and browser info

#### Data Restrictions

- Cannot approve or validate requests (not a business role)
- Cannot make payments
- Cannot see request details beyond audit context
- Cannot access brand or shop business analytics

---

### 6. Executive (executive)

**Label:** Executive
**Name:** D. Chinhoro
**Brand/Scope:** Simbisa Group (all brands, group-wide view)
**Color Code:** `#161616` (Black)

#### Sidebar Navigation

| Nav Item | View Route | Links To | Notes |
|----------|-----------|----------|-------|
| Group Overview | `exec-dashboard` | Tab 0 | Consolidated budget and sales |
| Brand Breakdown | `exec-dashboard` | Tab 1 | Per-brand utilization and alerts |
| InnBucks Sales | `exec-dashboard` | Tab 2 | Live group sales (badge: Live) |
| Supplier Trends | `exec-dashboard` | Tab 3 | Top suppliers and spend |
| Reports | `reports` | (standalone) | Group-wide analytics and exports |

#### Available Actions

- **View Group Analytics** — All consolidated dashboards
- **Download Reports** — Export group reports (petty cash, brand expenditure, InnBucks, supplier)
- **Monitor Threshold Alerts** — View shops exceeding 80% and 90% budget limits
- **Track InnBucks Performance** — Monitor live sales, transactions, trends

#### Modals/Forms

- None; view-only role with dashboard navigation

#### Data Access (Read-Only)

- Total group petty cash disbursed (MTD, MoM trend)
- Total group InnBucks sales (real-time)
- Total budget across all brands and utilization percentage
- Threshold alerts: shops over 80% limit, shops over 90% limit
- Per-brand metrics: budget, disbursed, remaining, alerts count, shop count
- InnBucks data per brand: daily sales, transaction count, avg basket, trend
- 7-day spend trend chart (all brands consolidated)
- 7-day InnBucks sales trend chart (all brands consolidated)
- Top 5 suppliers group-wide (spend, brands served, trend)
- Reconciliation summary: matched vs discrepancies
- All report types: Monthly Petty Cash, Brand Expenditure, InnBucks Sales, Supplier Spend, Exception/Audit, Budget vs Actual

#### Data Restrictions

- Cannot approve or validate requests
- Cannot make payments
- Cannot invite users (admin only)
- Cannot edit budgets (accountant only)
- View-only access to all data; no direct actions

---

## Sidebar Navigation Summary

All roles access their respective dashboards and Reports via the sidebar. The Reports view is common but shows role-specific report sets.

### Tab System

Many dashboards use a tab system to organize views:

- **Shop Manager (mgr-dashboard):** Single tab (overview + request list)
- **Brand Accountant (acc-dashboard):** Tab 0 = Overview, Tab 1 = Review Queue, Tab 2 = Budget Management
- **Brand Manager (bm-dashboard):** Tab 0 = Approvals, Tab 1 = InnBucks Sales, Tab 2 = Audit Log
- **Procurement (proc-dashboard):** Tab 0 = Overview, Tab 1 = Supplier Trends, Tab 2 = Product Trends, Tab 3 = Supplier Portal
- **Admin (admin-dashboard):** Tab 0 = Users & Invites, Tab 1 = Roles & Permissions, Tab 2 = System Audit
- **Executive (exec-dashboard):** Tab 0 = Group Overview, Tab 1 = Brand Breakdown, Tab 2 = InnBucks Sales, Tab 3 = Supplier Trends
- **Reports (reports):** Tab 0 = Report Library, Tab 1 = Download History

---

## Available Modals by Role

| Modal | Purpose | Accessible By |
|-------|---------|---|
| **ExceptionRequestModal** | Request budget exception | Shop Manager |
| **RequestDetailModal** | View full request info | Shop Manager, Accountant, Brand Manager, Procurement |
| **ValidateModal** | Validate and adjust requests | Brand Accountant |
| **BudgetModal** | Set shop budget limits | Brand Accountant |
| **RejectModal** | Reject request with reason | Brand Accountant, Brand Manager |
| **PayModal** | Pay single request via InnBucks | Brand Manager |
| **BatchPayModal** | Pay multiple requests in bulk | Brand Manager |
| **ExceptionApproveModal** | Approve/reject exception | Brand Manager |
| **StatementModal** | View/download InnBucks statement | Brand Manager |
| **InviteUserModal** | Send user invitations | System Admin |
| **EditUserModal** | Edit user role/scope | System Admin |
| **RevokeUserModal** | Deactivate user | System Admin |

---

## Key Permissions Matrix

| Action | Shop Manager | Accountant | Brand Manager | Procurement | Admin | Executive |
|--------|---|---|---|---|---|---|
| **Submit Request** | ✓ | — | — | — | — | — |
| **Request Exception** | ✓ | — | — | — | — | — |
| **Validate Request** | — | ✓ | — | — | — | — |
| **Adjust Amount** | — | ✓ | — | — | — | — |
| **Reject Request** | — | ✓ | ✓ | — | — | — |
| **Approve Payment** | — | — | ✓ | — | — | — |
| **Pay via InnBucks** | — | — | ✓ | — | — | — |
| **Batch Pay** | — | — | ✓ | — | — | — |
| **Approve Exception** | — | — | ✓ | — | — | — |
| **Set Budget** | — | ✓ | — | — | — | — |
| **Verify Supplier** | — | — | — | ✓ | — | — |
| **Manage Supplier Certs** | — | — | — | ✓ | — | — |
| **Invite User** | — | — | — | — | ✓ | — |
| **Edit User Role** | — | — | — | — | ✓ | — |
| **Revoke User** | — | — | — | — | ✓ | — |
| **View Group Analytics** | — | — | — | — | — | ✓ |
| **Download Reports** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Data Scoping Rules

### Budget Scope

- **Shop Manager:** Own shop only (e.g., Sh-14)
- **Accountant:** Own brand all shops (e.g., all Pizza Inn shops)
- **Brand Manager:** Own brand all shops (e.g., all Chicken Inn shops)
- **Procurement:** All brands, suppliers (cross-brand view)
- **Admin:** No budget data (system role)
- **Executive:** Group-wide consolidated data

### Request Visibility

- **Shop Manager:** Own requests only
- **Accountant:** Brand requests (all shops under brand)
- **Brand Manager:** Brand requests (validated + pending approval)
- **Procurement:** Supplier/product context (not approval flow)
- **Admin:** Audit log only
- **Executive:** Group aggregate data only

### Brand Filtering

- **Accountant, Brand Manager, Procurement:** Can filter views by brand
- **Executive:** Can filter reports by brand or view all brands
- **Shop Manager:** Fixed to own shop/brand
- **Admin:** No brand filtering (system level)

---

## Report Access

Reports visible to each role (from ReportsDashboard scope):

| Report | Manager | Accountant | Brand Mgr | Procurement | Admin | Executive |
|--------|---------|-----------|----------|-------------|-------|-----------|
| Monthly Petty Cash Summary | ✓ | ✓ | ✓ | — | — | ✓ |
| Brand Expenditure Report | — | ✓ | ✓ | — | — | ✓ |
| InnBucks Sales Report | — | — | ✓ | — | — | ✓ |
| Supplier Spend Analysis | — | ✓ | — | ✓ | — | ✓ |
| Exception & Audit Log Report | — | ✓ | — | — | ✓ | ✓ |
| Budget vs Actual Report | — | ✓ | ✓ | — | — | — |
| Shop Activity Report | ✓ | — | — | — | — | — |
| Supplier Certification Report | — | — | — | ✓ | — | — |
| Product & Category Spend | — | — | — | ✓ | — | — |

---

## Threshold & Alert System

- **80% Threshold:** "Monitor" status — shop may need attention
- **90% Threshold:** "Alert" status — exceptions required for new requests
- **Alerts trigger automatically** and notify Accountant and Brand Manager
- **Exception Approval:** Brand Manager must approve before payment
- **Shop Manager** can request exception when over threshold
- **Accountant** must approve exception for Accountant (Brand Accountant approves in queue)
- **Brand Manager** approves exception for payment processing

---

## Audit & Compliance

All actions logged by role:

- **Shop Manager:** Request submissions, exceptions
- **Accountant:** Validations, rejections, budget changes, threshold alerts
- **Brand Manager:** Approvals, payments, exception decisions
- **Procurement:** Supplier verifications, certifications
- **Admin:** All user actions, logins, role changes, system events
- **Executive:** View-only; no loggable actions beyond report downloads

Logs include: timestamp, user name, action, resource ID, reason (if reject), IP/browser.

---

## Summary

The CVS platform enforces a **strict request flow hierarchy**:

1. **Shop Manager** submits request
2. **Brand Accountant** validates and may adjust amount
3. **Brand Manager** approves and pays via InnBucks
4. **Procurement** manages suppliers and categories
5. **Admin** manages users and system configuration
6. **Executive** views consolidated group analytics

Each role has clear data boundaries and specific actions; cross-role access is minimal and audit-logged.
