# API Documentation — Leave Management System

Base URL: `http://localhost:5000/api`

All protected routes require an `Authorization: Bearer <accessToken>` header. The access token is obtained from `POST /auth/login` and is short-lived (1 day by default); a `refreshToken` httpOnly cookie is used to silently obtain a new access token via `POST /auth/refresh`.

Every response follows the shape:
```json
{ "success": true, "data": {}, "message": "optional" }
```
Errors follow:
```json
{ "success": false, "message": "Human readable error message" }
```

---

## Authentication

### POST /auth/login
Log in with email and password.

**Body**
```json
{ "email": "employee@company.com", "password": "Employee@123" }
```
**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "Yash Raj", "email": "employee@company.com", "role": "employee", "department": "Engineering", "leaveBalance": 18 },
    "accessToken": "eyJhbGciOi..."
  }
}
```
**Errors**: `401` invalid credentials · `403` account deactivated

### POST /auth/logout
Clears the refresh-token cookie. **Auth required.**

### POST /auth/refresh
Exchanges a valid `refreshToken` cookie for a new `accessToken`.

### GET /auth/me
Returns the currently authenticated user's profile. **Auth required.**

---

## Employees (Manager-scoped)

### GET /employees
List/search employees. **Manager only.**
Query params: `search` (name/email), `department`, `page`, `limit`

### GET /employees/:id
Get a single employee. Employees can only fetch their own record; managers can fetch any.

### GET /employees/:id/leave-history
Full leave history for one employee. Accessible by that employee or any manager.

---

## Leaves (Employee actions)

### POST /leaves
Submit a new leave request. **Employee only.**
```json
{ "leaveType": "Sick", "startDate": "2026-08-01", "endDate": "2026-08-02", "reason": "Feeling unwell" }
```
Server computes `totalDays` (inclusive) and rejects the request if it exceeds the employee's `leaveBalance`, or if `startDate` is in the past.
**Errors**: `400` validation failure / insufficient balance

### GET /leaves
List the logged-in employee's own leave requests.
Query params: `status`, `leaveType`, `page`, `limit`

### GET /leaves/:id
Get one leave request. Owner or any manager may view it.

### PUT /leaves/:id
Edit a **Pending** request (owner only). Editing an already-reviewed request returns `400`.

### DELETE /leaves/:id
Cancels a **Pending** request (soft delete — status becomes `Cancelled`, preserving the audit trail). Owner only.

### GET /leaves/dashboard/stats
Aggregated counts (total / approved / pending / rejected), current leave balance, and 5 most recent activities for the employee dashboard.

---

## Manager Operations

### GET /pending-leaves
All leave requests with status `Pending`, oldest-first. **Manager only.**
Query params: `search` (employee name/email), `leaveType`, `page`, `limit`

### PUT /leaves/:id/approve
Approves a pending request and deducts `totalDays` from the employee's leave balance. **Manager only.**
```json
{ "managerComments": "Approved, enjoy!" }
```

### PUT /leaves/:id/reject
Rejects a pending request. `managerComments` is **required** so the employee understands why. **Manager only.**

### GET /manager/dashboard/stats
Total employees, pending/approved/rejected counts, and 5 most recent activities across the team.

---

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error / bad request |
| 401 | Not authenticated / invalid or expired token |
| 403 | Authenticated but not authorized for this action |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Unexpected server error |

## Authentication Model

- **Access token** (JWT, 1 day): sent as a Bearer token, used to authorize every request via the `protect` middleware.
- **Refresh token** (JWT, 7 days): stored as an `httpOnly`, `sameSite=strict` cookie — never exposed to client-side JavaScript, mitigating XSS token theft.
- **RBAC**: the `restrictTo('manager' | 'employee')` middleware enforces role checks per-route in addition to per-resource ownership checks inside controllers (e.g. an employee cannot fetch another employee's leave requests).
