import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from database import Base, engine
from routers import auth, posts, users, admin
from auth import hash_password
from database import SessionLocal
import models

# ── DB bootstrap ──────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# Seed default admin on first run
def _seed_admin():
    db = SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.email == "admin@healthai.edu").first():
            db.add(models.User(
                name="Admin User",
                email="admin@healthai.edu",
                password_hash=hash_password("Admin123"),
                role="admin",
                institution="HealthAI Platform",
                expertise="-",
                city="-",
            ))
            db.commit()
    finally:
        db.close()

_seed_admin()

# ── App ───────────────────────────────────────────────────────────
app = FastAPI(title="HealthAI Co-Creation Platform API", version="2.0")


def _allowed_origins() -> list[str]:
    raw = os.getenv("FRONTEND_ORIGINS", "").strip()
    if raw:
        return [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:8060",
        "http://127.0.0.1:8060",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(users.router)
app.include_router(admin.router)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health", include_in_schema=False)
def health():
    return {"ok": True}
