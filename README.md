# Dayflow — Human Resource Management System

**Every workday, perfectly aligned.**

A full-stack HRMS built for the Odoo x NMIT Bangalore Hackathon '26. Real
authentication, real database persistence, real attendance/leave/payroll
workflows — no mock data hardcoded into the UI.

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4 + React Router
- **Backend:** Node.js + Express + REST APIs
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt, role-based middleware (employee / hr)

## Project structure

```
dayflow/
├── server/     Express API, MongoDB models, auth
└── client/     React app (Vite)
```

## 1. Set up the database

You need a MongoDB instance — either:

- **Local:** install MongoDB Community Server and run `mongod`, or
- **Atlas (recommended, free):** create a free cluster at
  https://www.mongodb.com/cloud/atlas and copy its connection string.

## 2. Backend setup

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI to your database, and JWT_SECRET to a long random string
npm install
npm run seed     # creates demo HR + Employee accounts with sample data
npm run dev       # starts the API on http://localhost:5000
```

Demo accounts created by `npm run seed`:

| Role     | Email                  | Password      |
|----------|-------------------------|---------------|
| HR/Admin | hr@dayflow.demo         | Password123!  |
| Employee | employee@dayflow.demo   | Password123!  |

## 3. Frontend setup

In a second terminal:

```bash
cd client
cp .env.example .env
# edit .env if your API runs somewhere other than localhost:5000
npm install
npm run dev       # starts the app on http://localhost:5173
```

Open http://localhost:5173 and sign in with one of the demo accounts above,
or register a new account.

## Demo flow (matches the spec's required end-to-end demo)

**As Employee** (employee@dayflow.demo):
1. Log in → lands on the Workday Pulse dashboard
2. Check in → the pulse ring starts tracking your day
3. Apply for Sick Leave → status shows Pending with a live timeline
4. Log out

**As HR** (hr@dayflow.demo):
1. Log in → lands on the Workforce Pulse dashboard
2. See the pending leave request under "Attention required" (or go to
   Leave Approvals)
3. Approve it, optionally with a comment

**Back as Employee:**
1. Log in → see the leave request now marked Approved
2. Go to Payroll → view salary slip (read-only)

## Notes on the build

- The backend enforces authorization from the database on every request —
  it never trusts a role claimed by the frontend.
- Employees can only edit their own `phone`, `address`, and
  `profilePicture`. All other profile/job/salary fields require HR.
- Leave days are computed server-side (inclusive of start and end date),
  and end-date-before-start-date is rejected.
- Attendance is a real database record per employee per day — checking in
  twice, or checking out before checking in, returns a clear error instead
  of silently succeeding.
- This codebase was generated and syntax-checked, but **not run against a
  live MongoDB instance** in the environment it was built in (no local
  MongoDB binary was installable there). Run the smoke test below before
  your demo.

## Suggested smoke test before demo day

```bash
# with the backend running and seeded:
curl http://localhost:5000/api/health

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@dayflow.demo","password":"Password123!"}'
```

You should get back a JSON `token` and `user`. Then walk through the demo
flow above in the browser.

## Team ownership (per the project spec)

| Member       | Owns                                             |
|--------------|---------------------------------------------------|
| Harshith T S | Auth, authorization, employee + HR dashboards, shell/integration |
| G N Bharath  | Attendance, employee profile                      |
| Chethan M S  | Leave management, leave approval                  |
| Chethan S    | Payroll, reports/analytics                        |

Built for the **Odoo x NMIT Bangalore Hackathon '26**.
