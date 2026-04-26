from typing import Optional
from sqlalchemy.orm import Session
from models import ActivityLog, User, Post, MeetingRequest
import json


def add_log(db: Session, user_id: int, action: str, target_type: str, target_id: Optional[int] = None):
    db.add(ActivityLog(user_id=user_id, action=action, target_type=target_type, target_id=target_id))
    db.commit()


def user_dict(u: User) -> dict:
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role,
        "institution": u.institution,
        "expertise": u.expertise,
        "city": u.city,
        "is_suspended": u.is_suspended,
        "created_at": u.created_at.strftime("%Y-%m-%d"),
    }


def post_dict(p: Post) -> dict:
    return {
        "id": p.id,
        "user_id": p.user_id,
        "author_name": p.author.name if p.author else "",
        "title": p.title,
        "domain": p.domain,
        "role_type": p.role_type,
        "stage": p.stage,
        "status": p.status,
        "explanation": p.explanation,
        "expertise_needed": p.expertise_needed,
        "confidentiality": p.confidentiality,
        "expiry_date": p.expiry_date or "",
        "city": p.city,
        "country": p.country,
        "auto_close": p.auto_close,
        "created_at": p.created_at.strftime("%Y-%m-%d"),
    }


def meeting_dict(m: MeetingRequest) -> dict:
    return {
        "id": m.id,
        "post_id": m.post_id,
        "from_user_id": m.from_user_id,
        "requester_name": m.requester.name if m.requester else "",
        "message": m.message,
        "nda_accepted": m.nda_accepted,
        "proposed_slots": json.loads(m.proposed_slots or "[]"),
        "confirmed_slot": m.confirmed_slot,
        "meeting_link": m.meeting_link or "",
        "status": m.status,
        "created_at": m.created_at.strftime("%Y-%m-%d"),
    }
