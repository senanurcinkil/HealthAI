import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import MeetingRequest, Post, User
from routers.utils import add_log, meeting_dict, post_dict

router = APIRouter(prefix="/api/posts", tags=["posts"])


class CreatePostRequest(BaseModel):
    title: str
    domain: str
    explanation: str
    expertise_needed: str
    stage: str
    confidentiality: str = "public"
    expiry_date: Optional[str] = None
    city: str = ""
    country: str = ""
    auto_close: bool = False
    status: str = "draft"


class UpdatePostRequest(BaseModel):
    title: Optional[str] = None
    domain: Optional[str] = None
    explanation: Optional[str] = None
    expertise_needed: Optional[str] = None
    stage: Optional[str] = None
    confidentiality: Optional[str] = None
    expiry_date: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None


class CreateMeetingRequest(BaseModel):
    message: str
    nda_accepted: bool = False
    proposed_slots: List[str] = []


@router.get("")
def list_posts(
    domain: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    expertise: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Post)
    if domain:    q = q.filter(Post.domain.ilike(f"%{domain}%"))
    if city:      q = q.filter(Post.city.ilike(f"%{city}%"))
    if status:    q = q.filter(Post.status == status)
    if expertise: q = q.filter(Post.expertise_needed.ilike(f"%{expertise}%"))
    if stage:     q = q.filter(Post.stage == stage)
    return [post_dict(p) for p in q.order_by(Post.created_at.desc()).all()]


@router.get("/mine")
def my_posts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.user_id == current_user.id).order_by(Post.created_at.desc()).all()
    return [post_dict(p) for p in posts]


@router.get("/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    return post_dict(post)


@router.post("")
def create_post(req: CreatePostRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.status not in ("draft", "active"):
        raise HTTPException(status_code=400, detail="Status must be 'draft' or 'active'.")

    post = Post(
        user_id=current_user.id,
        title=req.title,
        domain=req.domain,
        role_type=current_user.role,
        stage=req.stage,
        status=req.status,
        explanation=req.explanation,
        expertise_needed=req.expertise_needed,
        confidentiality=req.confidentiality,
        expiry_date=req.expiry_date,
        city=req.city,
        country=req.country,
        auto_close=req.auto_close,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    add_log(db, current_user.id, "POST_CREATED", "post", post.id)
    return post_dict(post)


@router.patch("/{post_id}")
def update_post(post_id: int, req: UpdatePostRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised.")

    for field, value in req.model_dump(exclude_none=True).items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    add_log(db, current_user.id, "POST_UPDATED", "post", post.id)
    return post_dict(post)


@router.delete("/{post_id}")
def delete_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorised.")

    add_log(db, current_user.id, "POST_DELETED", "post", post_id)
    db.delete(post)
    db.commit()
    return {"ok": True}


@router.post("/{post_id}/meeting-requests")
def create_meeting_request(post_id: int, req: CreateMeetingRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.status != "active":
        raise HTTPException(status_code=400, detail="This post is not accepting requests.")
    if post.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot request a meeting on your own post.")
    if post.confidentiality == "meeting_only" and not req.nda_accepted:
        raise HTTPException(status_code=400, detail="NDA must be accepted for this post.")
    if not req.proposed_slots:
        raise HTTPException(status_code=400, detail="At least one time slot is required.")

    mr = MeetingRequest(
        post_id=post_id,
        from_user_id=current_user.id,
        message=req.message,
        nda_accepted=req.nda_accepted,
        proposed_slots=json.dumps(req.proposed_slots),
        status="pending",
    )
    db.add(mr)
    post.status = "meeting_scheduled"
    db.commit()
    db.refresh(mr)
    add_log(db, current_user.id, "MEETING_REQUEST", "meeting_request", mr.id)
    return meeting_dict(mr)


@router.get("/{post_id}/meeting-requests")
def get_meeting_requests(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorised.")

    requests = db.query(MeetingRequest).filter(MeetingRequest.post_id == post_id).all()
    return [meeting_dict(m) for m in requests]
