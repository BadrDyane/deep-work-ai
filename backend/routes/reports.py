from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone, timedelta
from database import get_db
from models import User, Session as SessionModel, WeeklyReport
from schemas import WeeklyReportResponse
from auth import get_current_user
from services.ai_reports import generate_weekly_brief
from services.gating import require_pro
from typing import List

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/generate", response_model=WeeklyReportResponse, status_code=201)
async def generate_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    require_pro(current_user, "Weekly Brief")

    week_end = datetime.now(timezone.utc)
    week_start = week_end - timedelta(days=7)

    existing = await db.execute(
        select(WeeklyReport)
        .where(WeeklyReport.user_id == current_user.id)
        .where(WeeklyReport.week_start >= week_start)
        .order_by(desc(WeeklyReport.created_at))
    )
    cached = existing.scalar_one_or_none()
    if cached:
        return cached

    result = await db.execute(
        select(SessionModel)
        .where(SessionModel.user_id == current_user.id)
        .where(SessionModel.session_date >= week_start)
        .order_by(SessionModel.session_date)
    )
    sessions = result.scalars().all()

    brief = generate_weekly_brief(current_user, sessions)

    total_minutes = sum(s.duration_minutes or 0 for s in sessions)
    avg_score = sum(s.productivity_score or 0 for s in sessions) / len(sessions) if sessions else 0

    report = WeeklyReport(
        user_id=current_user.id,
        week_start=week_start,
        week_end=week_end,
        accomplishments=brief["accomplishments"],
        time_leaks=brief["time_leaks"],
        recommendations=brief["recommendations"],
        raw_brief=brief["raw_brief"],
        total_sessions=len(sessions),
        total_minutes=total_minutes,
        avg_productivity_score=round(avg_score, 2)
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/", response_model=List[WeeklyReportResponse])
async def get_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WeeklyReport)
        .where(WeeklyReport.user_id == current_user.id)
        .order_by(desc(WeeklyReport.created_at))
    )
    return result.scalars().all()