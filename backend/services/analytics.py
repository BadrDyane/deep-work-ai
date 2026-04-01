from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import datetime, timezone, timedelta
from models import Session as SessionModel


async def get_summary_stats(user_id: int, db: AsyncSession) -> dict:
    """Top-level stats for the stat cards."""

    # Total sessions and minutes
    result = await db.execute(
        select(
            func.count(SessionModel.id),
            func.sum(SessionModel.duration_minutes),
            func.avg(SessionModel.productivity_score)
        ).where(SessionModel.user_id == user_id)
    )
    row = result.one()
    total_sessions = row[0] or 0
    total_minutes = row[1] or 0
    avg_score = round(row[2] or 0, 2)

    # Sessions this week
    week_start = datetime.now(timezone.utc) - timedelta(days=7)
    result_week = await db.execute(
        select(func.count(SessionModel.id))
        .where(SessionModel.user_id == user_id)
        .where(SessionModel.session_date >= week_start)
    )
    sessions_this_week = result_week.scalar() or 0

    # Best productivity score
    result_best = await db.execute(
        select(func.max(SessionModel.productivity_score))
        .where(SessionModel.user_id == user_id)
    )
    best_score = round(result_best.scalar() or 0, 2)

    return {
        "total_sessions": total_sessions,
        "total_hours": round(total_minutes / 60, 1),
        "avg_productivity_score": avg_score,
        "sessions_this_week": sessions_this_week,
        "best_score": best_score
    }


async def get_daily_trends(user_id: int, db: AsyncSession) -> list:
    """Daily productivity scores and session counts for the last 14 days."""
    since = datetime.now(timezone.utc) - timedelta(days=14)

    result = await db.execute(
        select(
            func.date(SessionModel.session_date).label("date"),
            func.count(SessionModel.id).label("session_count"),
            func.avg(SessionModel.productivity_score).label("avg_score"),
            func.sum(SessionModel.duration_minutes).label("total_minutes")
        )
        .where(SessionModel.user_id == user_id)
        .where(SessionModel.session_date >= since)
        .group_by(func.date(SessionModel.session_date))
        .order_by(func.date(SessionModel.session_date))
    )

    rows = result.all()
    return [
        {
            "date": str(row.date),
            "session_count": row.session_count,
            "avg_score": round(row.avg_score or 0, 2),
            "total_minutes": row.total_minutes or 0
        }
        for row in rows
    ]


async def get_task_distribution(user_id: int, db: AsyncSession) -> list:
    """Breakdown of session counts by task type."""
    result = await db.execute(
        select(
            SessionModel.task_type,
            func.count(SessionModel.id).label("count")
        )
        .where(SessionModel.user_id == user_id)
        .where(SessionModel.task_type.isnot(None))
        .group_by(SessionModel.task_type)
        .order_by(func.count(SessionModel.id).desc())
    )
    rows = result.all()
    return [{"task_type": row.task_type, "count": row.count} for row in rows]


async def get_heatmap_data(user_id: int, db: AsyncSession) -> list:
    """Daily productivity intensity for the heatmap — last 90 days."""
    since = datetime.now(timezone.utc) - timedelta(days=90)

    result = await db.execute(
        select(
            func.date(SessionModel.session_date).label("date"),
            func.count(SessionModel.id).label("session_count"),
            func.avg(SessionModel.productivity_score).label("avg_score")
        )
        .where(SessionModel.user_id == user_id)
        .where(SessionModel.session_date >= since)
        .group_by(func.date(SessionModel.session_date))
        .order_by(func.date(SessionModel.session_date))
    )

    rows = result.all()
    return [
        {
            "date": str(row.date),
            "count": row.session_count,
            "avg_score": round(row.avg_score or 0, 2)
        }
        for row in rows
    ]


async def get_energy_trends(user_id: int, db: AsyncSession) -> list:
    """Average energy and distraction levels over the last 14 days."""
    since = datetime.now(timezone.utc) - timedelta(days=14)

    result = await db.execute(
        select(
            func.date(SessionModel.session_date).label("date"),
            func.avg(SessionModel.energy_level).label("avg_energy"),
            func.avg(SessionModel.distraction_level).label("avg_distraction")
        )
        .where(SessionModel.user_id == user_id)
        .where(SessionModel.session_date >= since)
        .group_by(func.date(SessionModel.session_date))
        .order_by(func.date(SessionModel.session_date))
    )

    rows = result.all()
    return [
        {
            "date": str(row.date),
            "avg_energy": round(row.avg_energy or 0, 2),
            "avg_distraction": round(row.avg_distraction or 0, 2)
        }
        for row in rows
    ]