from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from auth import get_current_user, require_admin
from database import get_db
from models import ActivityLog, Post, User
from routers.utils import add_log, post_dict, user_dict

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/posts")
def list_posts(
    domain: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    q = db.query(Post)
    if domain: q = q.filter(Post.domain.ilike(f"%{domain}%"))
    if status: q = q.filter(Post.status == status)
    return [post_dict(p) for p in q.order_by(Post.created_at.desc()).all()]


@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    add_log(db, admin.id, "POST_REMOVED", "post", post_id)
    db.delete(post)
    db.commit()
    return {"ok": True}


@router.get("/users")
def list_users(
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    q = db.query(User)
    if role: q = q.filter(User.role == role)
    return [user_dict(u) for u in q.order_by(User.created_at.desc()).all()]


@router.patch("/users/{user_id}/suspend")
def suspend_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot suspend yourself.")
    user.is_suspended = True
    db.commit()
    add_log(db, admin.id, "USER_SUSPENDED", "user", user_id)
    return {"ok": True}


@router.get("/logs")
def get_logs(
    user_id: Optional[int] = Query(None),
    date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    q = db.query(ActivityLog)
    if user_id: q = q.filter(ActivityLog.user_id == user_id)
    logs = q.order_by(ActivityLog.timestamp.desc()).limit(500).all()

    result = []
    for log in logs:
        ts = log.timestamp.strftime("%Y-%m-%d %H:%M")
        if date and not ts.startswith(date):
            continue
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_name": log.user.name if log.user else f"User #{log.user_id}",
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "timestamp": ts,
        })
    return result


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return {
        "total_users": db.query(User).count(),
        "total_posts": db.query(Post).count(),
        "active_posts": db.query(Post).filter(Post.status == "active").count(),
        "meetings_scheduled": db.query(Post).filter(Post.status == "meeting_scheduled").count(),
        "partners_found": db.query(Post).filter(Post.status == "partner_found").count(),
    }
