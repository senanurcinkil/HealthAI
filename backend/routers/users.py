from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import MeetingRequest, Post, User
from routers.utils import add_log, meeting_dict, post_dict, user_dict

router = APIRouter(prefix="/api/users", tags=["users"])


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    expertise: Optional[str] = None
    city: Optional[str] = None


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return user_dict(current_user)


@router.patch("/me")
def update_me(req: UpdateProfileRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    add_log(db, current_user.id, "PROFILE_UPDATED", "user", current_user.id)
    return user_dict(current_user)


@router.delete("/me")
def delete_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"ok": True, "message": "Account and all associated data deleted."}


@router.get("/me/export")
def export_my_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.user_id == current_user.id).all()
    requests = db.query(MeetingRequest).filter(MeetingRequest.from_user_id == current_user.id).all()
    return {
        "profile": user_dict(current_user),
        "posts": [post_dict(p) for p in posts],
        "meeting_requests": [meeting_dict(m) for m in requests],
        "exported_at": datetime.utcnow().isoformat(),
    }
