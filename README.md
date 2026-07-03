# Leave Management System

A full-stack MVP that lets employees submit and track leave requests, and lets managers review, approve, or reject them — replacing manual email/spreadsheet tracking with a single source of truth.

Built for the Proteccio Data Full Stack Developer Intern technical assessment.

---

## 1. Project Overview

Employees can log in, apply for leave, edit or cancel pending requests, and track status. Managers can log in, see their team's pending requests in a queue, approve or reject with comments, and monitor team-wide leave activity from a dashboard. Authentication is JWT-based with role-based access control (RBAC) enforced on both the API and the frontend routes.

## 2. Features

**Authentication**
- Email/password login, JWT access token + httpOnly refresh-token cookie, protected routes, RBAC (`employee` / `manager`), logout, generic error messages on invalid credentials (no user enumeration).

**Employee**
- Dashboard (totals, approved/pending/rejected, leave balance, recent activity)
- Apply for leave, edit/cancel while Pending, full leave history with search/filter/pagination, leave details view.

**Manager**
- Dashboard (team size, pending/approved/rejected counts, recent activity)
- Pending-approvals queue (oldest first) with employee search + leave-type filter
- Approve / reject with mandatory comments on rejection
- View any employee's full leave history

**Engineering**
- Centralized error handling, Zod input validation, rate limiting, Helmet security headers, Mongoose schema validation + indexes, soft-delete (cancel) instead of destructive deletes, pagination everywhere lists appear, Docker Compose one-command setup.

## 3. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + React Router | Fast dev loop, small bundle, utility CSS keeps styling consistent without a design system dependency |
| State | React Context (`AuthContext`) + local component state | App's shared state is just "who's logged in" — Redux/Zustand would be overkill for this scope |
| Backend | Node.js + Express | Matches the stack already used across this candidate's projects; minimal boilerplate for a REST API this size |
| Database | MongoDB + Mongoose | Leave records are naturally document-shaped; schema validation + indexes still give relational-style guarantees |
| Auth | JWT (access + refresh) via `jsonwebtoken`, `bcryptjs` for hashing | Stateless, scales horizontally, refresh token in httpOnly cookie mitigates XSS token theft |
| Validation | Zod | Type-safe schema validation shared style between routes |
| Containerization | Docker + Docker Compose | One-command local setup for reviewers |

## 4. Folder Structure

```
leave-management-system/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # Route handlers (business logic)
│   │   ├── middleware/    # auth, RBAC, validation, error handler
│   │   ├── models/        # Mongoose schemas (Employee, Leave)
│   │   ├── routes/        # Express routers
│   │   ├── seed/          # Demo data seeder
│   │   ├── utils/         # logger, AppError, asyncHandler, token utils
│   │   └── validators/    # Zod schemas
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, ProtectedRoute, StatCard, StatusBadge…
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Login, Dashboards, ApplyLeave, LeaveHistory…
│   │   └── services/      # axios client with token refresh interceptor
│   └── Dockerfile
├── docs/API.md             # Full endpoint reference
├── postman/*.json          # Importable Postman collection
├── docker-compose.yml
└── README.md
```

## 5. Database Schema

**Employee**
| Field | Type | Notes |
|---|---|---|
| name, email, password | String | email unique + indexed, password bcrypt-hashed & never returned by default |
| department | String | |
| role | enum: `employee`, `manager` | |
| manager | ObjectId → Employee | self-reference for team scoping |
| leaveBalance | Number | defaults to 20, decremented on approval |
| isActive | Boolean | supports deactivation without deleting history |
| createdAt / updatedAt | Date | automatic timestamps |

**Leave**
| Field | Type | Notes |
|---|---|---|
| employee | ObjectId → Employee | indexed |
| leaveType | enum | Sick / Casual / Earned / Unpaid / Maternity / Paternity |
| startDate, endDate | Date | validated `endDate >= startDate` at schema level |
| totalDays | Number | server-computed, never trusted from client |
| reason | String | |
| status | enum | Pending / Approved / Rejected / Cancelled |
| managerComments, reviewedBy, reviewedAt | | audit trail of the decision |

**Relationships**: one Employee → many Leaves (1:N). Employee → Employee (manager) is a self-referencing 1:N for team scoping. Indexes on `email`, `department+role`, `employee+status`, and `startDate+endDate` cover the app's actual query patterns (login lookup, manager team views, pending queues, date-range checks).

Normalization: leave records don't duplicate employee data (name/department) — they reference it via `employee` and the API populates it on read, keeping a single writable source of truth.

## 6. Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster) — or just use Docker Compose, which includes Mongo.

### Option A — Docker Compose (fastest, one command)
```bash
docker compose up --build
```
This starts MongoDB, the backend on `:5000`, and the frontend on `:5173`. Then seed demo data (see step below).

### Option B — Manual setup

**1. Database**
Install MongoDB locally, or create a free Atlas cluster and copy its connection string.

**2. Backend**
```bash
cd backend
cp .env.example .env      # then edit MONGO_URI / JWT secrets
npm install
npm run seed               # loads demo manager/employee + sample leave requests
npm run dev                 # starts on http://localhost:5000
```

**3. Frontend**
```bash
cd frontend
cp .env.example .env       # VITE_API_BASE_URL should point at the backend
npm install
npm run dev                 # starts on http://localhost:5173
```

### Environment Variables

**backend/.env**
| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Access token secret + lifetime |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Refresh token secret + lifetime |
| `CLIENT_URL` | Frontend origin, for CORS |

**frontend/.env**
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

## 7. Running the Application

1. Start MongoDB (or `docker compose up mongo`)
2. `npm run dev` in `backend/`
3. `npm run dev` in `frontend/`
4. Visit `http://localhost:5173`

## 8. API Documentation

- Full endpoint reference: [`docs/API.md`](./docs/API.md)
- Importable collection: [`postman/LeaveManagementSystem.postman_collection.json`](./postman/LeaveManagementSystem.postman_collection.json)

## 9. Sample Login Credentials

Run `npm run seed` in `backend/` first, then:

| Role | Email | Password |
|---|---|---|
| Employee | employee@company.com | Employee@123 |
| Manager | manager@company.com | Manager@123 |

## 10. Assumptions

- One manager oversees all employees for this MVP (the `manager` field on `Employee` exists so this can be extended to multi-manager team scoping later).
- "Working days" isn't factored into `totalDays` — it's an inclusive calendar-day count. Real payroll systems would exclude weekends/public holidays via a company calendar.
- Leave balance resets are out of scope (no year-end rollover logic).
- Deactivated employees (`isActive: false`) are supported at the schema level but there's no admin UI to toggle it yet — that's the "user management" feature a v2 would add.

## 11. Known Limitations

- No password reset / "forgot password" flow.
- No file attachments on leave requests (e.g. medical certificates for sick leave).
- No email notifications yet (see Future Enhancements).
- No automated test suite is included in this MVP submission — see Future Enhancements.

## 12. Future Enhancements

- Unit + integration tests (Jest + Supertest for backend, React Testing Library for frontend) and CI via GitHub Actions.
- Email notifications on status change (SendGrid/Nodemailer).
- Leave balance accrual/rollover rules and a company holiday calendar to exclude non-working days from `totalDays`.
- Audit log of all approve/reject actions beyond the single `reviewedBy`/`reviewedAt` fields already on each Leave.
- Multi-level approval chains for longer leave durations.
- Dark mode and full WCAG AA accessibility audit.

## 13. Challenges Encountered

- Balancing "soft delete" (cancel) vs hard delete for leave records — chose soft delete so the audit trail (who approved/rejected what, and when) is never lost, which better matches how HR systems actually need to behave.
- Keeping the refresh-token flow secure without adding a dependency-heavy session store: solved with a short-lived JWT access token + httpOnly refresh cookie, refreshed transparently via an axios interceptor.

## 14. If I Had More Time

- Add the automated test suite and CI pipeline (listed above) — this was the main tradeoff made to hit the assessment deadline.
- Add optimistic UI updates on approve/reject so the manager queue updates instantly rather than waiting on a refetch.
- Add a company holiday calendar for accurate working-day calculations.

---

*Built as a technical assessment submission. Every design decision above is one I can walk through in detail in a follow-up technical interview.*
