from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import User
from auth import get_current_user
from services.analytics import (
    get_summary_stats,
    get_daily_trends,
    get_task_distribution,
    get_heatmap_data,
    get_energy_trends
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_summary_stats(current_user.id, db)


@router.get("/trends")
async def trends(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_daily_trends(current_user.id, db)


@router.get("/distribution")
async def distribution(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_task_distribution(current_user.id, db)


@router.get("/heatmap")
async def heatmap(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_heatmap_data(current_user.id, db)


@router.get("/energy")
async def energy(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_energy_trends(current_user.id, db)