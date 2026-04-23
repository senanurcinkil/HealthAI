import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from database import get_db
from auth import create_access_token, hash_password, verify_password
from models import User, ActivityLog
from routers.utils import add_log, user_dict

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    institution: str = ""
    expertise: str = ""
    city: str = ""

    @field_validator("email")
    @classmethod
    def must_be_edu(cls, v):
        if not re.match(r"^[^\s@]+@[^\s@]+\.(edu|edu\.\w{2,})$", v, re.IGNORECASE):
            raise ValueError("Only institutional (.edu) email addresses are accepted.")
        return v.lower()

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        if v not in ("engineer", "doctor"):
            raise ValueError("Role must be 'engineer' or 'doctor'.")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role,
        institution=req.institution,
        expertise=req.expertise,
        city=req.city,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    add_log(db, user.id, "USER_REGISTERED", "user", user.id)
    return {"access_token": create_access_token(user.id), "token_type": "bearer", "user": user_dict(user)}


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Your account has been suspended. Please contact the administrator.")

    add_log(db, user.id, "USER_LOGIN", "user", user.id)
    return {"access_token": create_access_token(user.id), "token_type": "bearer", "user": user_dict(user)}
