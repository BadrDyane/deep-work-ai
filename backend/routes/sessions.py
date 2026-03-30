from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from datetime import datetime, timezone

from database import get_db
from models import User, Session as SessionModel
from schemas import SessionCreate, SessionResponse
from auth import get_current_user
from services.ai_parser import parse_session

router = APIRouter(prefix="/sessions", tags=["sessions"])


def compute_productivity_score(energy: int, distraction: int) -> float:
    """
    Simple formula:
    - High energy + low distraction = high score
    - Scale: 1.0 to 10.0
    """
    if energy is None or distraction is None:
        return 5.0
    raw = (energy * 2) - distraction
    # raw ranges from -3 (energy=1,distraction=5) to 5 (energy=5,distraction=1)
    # normalize to 1.0 - 10.0
    normalized = ((raw + 3) / 8) * 9 + 1
    return round(min(max(normalized, 1.0), 10.0), 2)


@router.post("/", response_model=SessionResponse, status_code=201)
async def create_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not data.raw_text.strip():
        raise HTTPException(status_code=400, detail="Session description cannot be empty")

    # Parse with AI
    parsed = parse_session(data.raw_text)

    # Compute productivity score
    score = compute_productivity_score(
        parsed.get("energy_level"),
        parsed.get("distraction_level")
    )

    session = SessionModel(
        user_id=current_user.id,
        raw_text=data.raw_text,
        summary=parsed.get("summary"),
        duration_minutes=parsed.get("duration_minutes"),
        task_type=parsed.get("task_type"),
        energy_level=parsed.get("energy_level"),
        distraction_level=parsed.get("distraction_level"),
        productivity_score=score,
        tags=parsed.get("tags", []),
        session_date=data.session_date or datetime.now(timezone.utc)
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/", response_model=List[SessionResponse])
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SessionModel)
        .where(SessionModel.user_id == current_user.id)
        .order_by(desc(SessionModel.session_date))
    )
    return result.scalars().all()


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SessionModel)
        .where(SessionModel.id == session_id, SessionModel.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(session)
    await db.commit()