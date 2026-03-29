from pydantic import BaseModel, EmailStr
from typing import Optional
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