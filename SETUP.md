# Setup Guide

## Option A — Docker (Recommended)

### Requirements
- Docker Desktop

```bash
cd HEALTH-AI
docker compose up --build
```

- Frontend: `http://localhost`
- Backend API docs: `http://localhost:8080/docs`

The SQLite database is persisted in a Docker volume (`db_data`).

---

## Option B — Manual

## Requirements

- Python 3.10+
- A modern web browser (Chrome, Firefox, Edge)

---

## 1. Backend

```bash
cd HEALTH-AI/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 127.0.0.1 --port 8080
```

API docs available at: `http://127.0.0.1:8080/docs`

> **Note:** Port 8000 may be blocked on some systems. Use `--port 8080` or any free port.
> If you change the port, update `API_BASE` in `frontend/shared.js` accordingly.

---

## 2. Frontend

Open a second terminal:

```bash
cd HEALTH-AI
python -m http.server 8060
```

Then open: `http://localhost:8060/frontend/login.html`

> Alternatively use VS Code Live Server on `frontend/login.html`.
> If you use a different port, add it to `_allowed_origins()` in `backend/main.py`.

---

## 3. First Run

The SQLite database (`backend/healthai.db`) is created automatically on first startup.

A default admin account is seeded on first run:

| Email | Password |
|-------|----------|
| `admin@healthai.edu` | `Admin123` |

Register new users with any `.edu` institutional email.

---

## Port Configuration

| Service | Default Port | Config Location |
|---------|-------------|-----------------|
| Backend API | `8080` | `uvicorn --port` flag |
| Frontend | `8060` | `python -m http.server` |
| API base URL | — | `frontend/shared.js` → `API_BASE` |
| CORS origins | — | `backend/main.py` → `_allowed_origins()` |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `[WinError 10013]` on uvicorn start | Port in use | Use `--port 8081` or any free port |
| `Permission denied` on `python -m venv venv` | venv already exists | Run `rmdir /s /q venv` then retry |
| `apiPost is not defined` | `shared.js` not loaded | Ensure `<script src="shared.js">` is before other scripts in HTML |
| `401 Unauthorized` on all requests | JWT sub was integer | Fixed in `auth.py` (sub is now string) |
| `bcrypt` version error | passlib incompatibility | `requirements.txt` pins `bcrypt==4.0.1` |
