# HealthAI Co-Creation Platform

A web platform that connects **engineers** and **healthcare professionals** for structured collaboration on health-tech innovation projects.

Built for **SENG 384 — Software Project III** (V2: Full Stack Integration).

---

## Features

- **Authentication** — JWT-based login & register, `.edu` email enforcement
- **Dashboard** — Personal stats, your posts, recently active posts
- **Post Feed** — Browse all posts with 5 filters (domain, city, status, expertise, stage)
- **Create Post** — Publish or save as draft, expiry date, confidentiality level, NDA flow
- **Post Detail** — Owner actions (publish / mark partner found / delete); visitor actions (express interest + meeting request)
- **Meeting Request** — Propose up to 3 time slots, NDA acceptance
- **Profile & Settings** — Edit profile, export data (GDPR), delete account
- **Admin Panel** — Manage posts, suspend users, view activity logs, export CSV

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML / CSS / JavaScript (served via nginx) |
| Backend | FastAPI (Python) |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT (python-jose) + bcrypt |
| Deployment | Docker + Docker Compose |

---

## Project Structure

```
HEALTH-AI/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── theme.css                  # Design system (CSS variables + components)
│   ├── shared.js                  # API helpers, JWT session, nav bar
│   ├── login.html / login.js
│   ├── register.html / register.js
│   ├── dashboard.html / dashboard.js
│   ├── post-feed.html / post-feed.js
│   ├── create-post.html / create-post.js
│   ├── post-detail.html / post-detail.js
│   ├── meeting-request.html / meeting-request.js
│   ├── profile.html / profile.js
│   └── admin.html / admin.js
├── backend/
│   ├── Dockerfile
│   ├── main.py                    # FastAPI app entry point
│   ├── models.py                  # SQLAlchemy models
│   ├── database.py                # SQLite engine + session
│   ├── auth.py                    # JWT + bcrypt helpers
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py                # /api/auth/register, /api/auth/login
│   │   ├── posts.py               # /api/posts — CRUD + meeting requests
│   │   ├── users.py               # /api/users — profile, export, delete
│   │   └── admin.py               # /api/admin — posts, users, logs
│   └── healthai.db                # SQLite database (auto-created)
└── docs/
    ├── SRS_HealthAI_CoCreation_Platform_V2.pdf
    └── SDD_Template_HealthAI_EN.docx
```

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@healthai.edu` | `Admin123` | Admin |

Register with any `.edu` email to create Engineer or Doctor accounts.

---

## Roadmap

- [x] V1: Frontend + SRS_V1
- [x] V2: FastAPI + SQLite + JWT — Full Stack Integration
- [ ] V3: Final report (SRS_V2, SDD_V2, User Guide) + demo video — 07.05.2026
