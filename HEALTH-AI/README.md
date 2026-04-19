# HealthAI Co-Creation Platform

A web platform that connects **engineers** and **healthcare professionals** for collaborative research and innovation projects.

Built for **SENG 384** — frontend prototype with mock data (no backend yet).

---

## Features

- **Authentication** — Login & register with `.edu` email validation
- **Dashboard** — Personal stats, your posts, recently active posts
- **Post Feed** — Browse all posts with 5 filters (domain, city, status, expertise, stage)
- **Create Post** — Publish or save as draft, set expiry date, confidentiality level
- **Post Detail** — Owner actions (publish / mark partner found / delete); visitor actions (express interest + NDA + meeting request)
- **Meeting Request** — Propose up to 3 time slots, NDA acceptance flow
- **Profile & Settings** — Edit profile, download data (GDPR), delete account
- **Admin Panel** — Manage posts, suspend users, view activity logs, export CSV

---

## Tech Stack

- Vanilla HTML / CSS / JavaScript (no framework, no build step)
- `sessionStorage` as mock database
- Mock seed data in `frontend/mock-data.js`

---

## Running Locally

**Option 1 — VS Code Live Server (recommended):**
1. Open `HEALTH-AI/frontend/` in VS Code
2. Right-click `login.html` → Open with Live Server

**Option 2 — Python:**
```bash
cd HEALTH-AI/frontend
python -m http.server 8080
```
Then open: `http://localhost:8080/login.html`

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `alice@hospital.edu` | `pass123` | Doctor |
| `bob@techuni.edu` | `pass123` | Engineer |
| `admin@healthai.edu` | `pass123` | Admin |

---

## Project Structure

```
frontend/
├── theme.css               # Unified design system (CSS variables + all components)
├── mock-data.js            # Seed data: users, posts, activity logs
├── shared.js               # Shared helpers: nav, session, logging
├── login.html / login.js
├── register.html / register.js
├── dashboard.html / dashboard.js
├── post-feed.html / post-feed.js
├── create-post.html / create-post.js
├── post-detail.html / post-detail.js
├── meeting-request.html / meeting-request.js
├── profile.html / profile.js
└── admin.html / admin.js
```

---

## Roadmap

- [ ] V2: FastAPI backend with JWT authentication
- [ ] V2: Real database (PostgreSQL)
- [ ] V2: Full REST API (posts, meetings, users, admin)
- [ ] V3: Final report + demo video
