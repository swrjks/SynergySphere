
# SynergySphere – Advanced Team Collaboration Platform (MVP)

A **mobile-first, desktop-ready** MVP with:
- JWT auth (register/login)
- Projects, members
- Tasks with status + due date (To‑Do / In Progress / Done)
- Project chat (thread-ready)
- Live updates via Socket.IO
- Clean, responsive UI (Tailwind, dark-first)
- Local SQLite (fast + ACID), indexed for snappy queries

## Run locally

### 1) Backend
```bash
cd backend
cp .env.sample .env    # optionally edit JWT_SECRET/PORT
npm install
npm run seed           # creates DB & demo data
npm run dev            # http://localhost:8080
```

### 2) Frontend
```bash
cd ../frontend
npm install
npm run dev            # http://localhost:5173
```

### 3) Login
Use demo account: `sahil@example.com / password`

## Notes
- Realtime: Frontend joins a Socket.IO "room" per project for instant task/chat updates.
- Efficiency: Better‑SQLite3 with WAL mode + indexes on (project_id, status, due_date).
- Mobile UX: one‑tap task updates; lightweight cards; accessible inputs.
- Extensibility: add push notifications (Web Push), file uploads, drag‑and‑drop Kanban, analytics.
