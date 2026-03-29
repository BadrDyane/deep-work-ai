from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="free")  # "free" or "pro"
    onboarding_complete = Column(Boolean, default=False)
    work_type = Column(String, nullable=True)        # from onboarding
    daily_focus_goal = Column(Float, default=4.0)    # hours per day
    improve_focus = Column(Boolean, default=False)
    improve_consistency = Column(Boolean, default=False)
    improve_energy = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    weekly_reports = relationship("WeeklyReport", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    raw_text = Column(Text, nullable=False)           # original user input
    summary = Column(Text, nullable=True)             # AI-extracted summary
    duration_minutes = Column(Integer, nullable=True)
    task_type = Column(String, nullable=True)         # e.g. "deep work", "meetings", "admin"
    energy_level = Column(Integer, nullable=True)     # 1-5
    distraction_level = Column(Integer, nullable=True) # 1-5
    productivity_score = Column(Float, nullable=True) # computed
    tags = Column(JSON, default=list)
    session_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_start = Column(DateTime(timezone=True), nullable=False)
    week_end = Column(DateTime(timezone=True), nullable=False)
    accomplishments = Column(Text, nullable=True)
    time_leaks = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    raw_brief = Column(Text, nullable=True)           # full AI output
    total_sessions = Column(Integer, default=0)
    total_minutes = Column(Integer, default=0)
    avg_productivity_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="weekly_reports")