# HealthAI Co-Creation Platform

A secure, GDPR-compliant web platform that enables structured partner discovery between healthcare professionals and engineers.

Built for **SENG 384 – Software Project III**

---

## What is this?

Finding the right collaborator in health-tech today depends on personal networks and coincidence. HealthAI eliminates that randomness.

Engineers and healthcare professionals can post structured collaboration announcements, discover each other by domain and location, and initiate a transparent meeting workflow — all without sharing sensitive IP or patient data on the platform.

## Core Workflow

```
Engineer/Doctor creates a post
         ↓
Other party expresses interest
         ↓
Post owner proposes meeting times
         ↓
Parties agree on a slot
         ↓
Meeting happens externally (Zoom / Teams)
         ↓
Post owner marks "Partner Found" → post closes
```

## Features

- **Role-based access** — Engineer, Healthcare Professional, Admin
- **Structured posts** — domain, project stage, expertise needed, confidentiality level
- **City-based matching** — find collaborators near you
- **Meeting workflow** — interest → NDA acceptance → time slot proposal → confirmation
- **Post lifecycle** — Draft → Active → Meeting Scheduled → Partner Found / Expired
- **Admin panel** — post moderation, user management, activity logs with CSV export
- **GDPR compliant** — data export and account deletion built in

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (no build step) |
| Backend | Python / FastAPI |
| Database | PostgreSQL |
| Auth | JWT + .edu email verification |
| Deployment | Render (backend) · GitHub Pages / Netlify (frontend) |

## Project Structure

```
healthai-cocreation/
├── frontend/
│   ├── mock-data.js          # Shared mock data (used during V1)
│   ├── register.html         # Registration (.edu only)
│   ├── login.html            # Login
│   ├── dashboard.html        # Main dashboard
│   ├── create-post.html      # Post creation form
│   ├── post-feed.html        # Browse & filter posts
│   ├── post-detail.html      # Post detail + Express Interest
│   ├── meeting-request.html  # Meeting request flow
│   ├── profile.html          # Profile & GDPR settings
│   └── admin.html            # Admin panel
├── backend/
│   └── main.py               # FastAPI application
├── docs/
│   ├── SRS_V1_...docx        # Software Requirements Specification
│   ├── SDD_V1_...docx        # Software Design Document
│   └── UserGuide_...docx     # User Guide
└── README.md
```

## Getting Started

### Frontend (V1 — no backend needed)

```bash
cd healthai-cocreation
python -m http.server 8080
# Open: http://localhost:8080/frontend/post-feed.html
```

Or use VS Code Live Server on any `.html` file.

### Backend (V2+)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
# Docs: http://127.0.0.1:8000/docs
```

## Delivery Schedule

| Deliverable | Date | Contents |
|-------------|------|----------|
| **Project V1 + SRS V1** | Sprint 1 | All frontend screens (mock backend) + SRS document |
| **Project V2 + SDD V1** | 23 Apr 2026 | Full-stack integration, database, API + SDD document |
| **Project V3 + Final Report** | 7 May 2026 | Finalized app + SRS V2 + SDD V2 + User Guide + Demo video |

## Branch Conventions

| Type | Format |
|------|--------|
| Feature | `feature/sprint[N]-[short-description]` |
| Bug fix | `bugfix/[short-description]` |
| Urgent fix | `hotfix/[short-description]` |

`main` is protected — all merges require 1 PR approval. Never push directly to `main`.

## Team

SENG 384 — Group project. All members are responsible for the entire codebase.

> AI tool usage is declared in the project report as required by course guidelines.

## License

MIT