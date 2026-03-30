from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# --- Auth ---

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    plan: str
    onboarding_complete: bool
    daily_focus_goal: float
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Sessions ---

class SessionCreate(BaseModel):
    raw_text: str
    session_date: Optional[datetime] = None

class SessionResponse(BaseModel):
    id: int
    raw_text: str
    summary: Optional[str]
    duration_minutes: Optional[int]
    task_type: Optional[str]
    energy_level: Optional[int]
    distraction_level: Optional[int]
    productivity_score: Optional[float]
    tags: Optional[List[str]]
    session_date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}