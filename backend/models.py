from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)          # engineer | doctor | admin
    institution = Column(String, default="")
    expertise = Column(String, default="")
    city = Column(String, default="")
    is_suspended = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    meeting_requests = relationship("MeetingRequest", back_populates="requester", cascade="all, delete-orphan")
    logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    role_type = Column(String, nullable=False)     # engineer | doctor
    stage = Column(String, nullable=False)
    status = Column(String, default="draft")       # draft | active | meeting_scheduled | partner_found | expired
    explanation = Column(Text, nullable=False)
    expertise_needed = Column(String, nullable=False)
    confidentiality = Column(String, default="public")   # public | meeting_only
    expiry_date = Column(String, nullable=True)
    city = Column(String, default="")
    country = Column(String, default="")
    auto_close = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="posts")
    meeting_requests = relationship("MeetingRequest", back_populates="post", cascade="all, delete-orphan")


class MeetingRequest(Base):
    __tablename__ = "meeting_requests"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    nda_accepted = Column(Boolean, default=False)
    proposed_slots = Column(Text, default="[]")   # JSON string list
    confirmed_slot = Column(String, nullable=True)
    status = Column(String, default="pending")    # pending | confirmed | declined | cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="meeting_requests")
    requester = relationship("User", back_populates="meeting_requests")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")
