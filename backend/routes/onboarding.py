from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import User
from schemas import OnboardingData
from auth import get_current_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/complete")
async def complete_onboarding(
    data: OnboardingData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_user.work_type = data.work_type
    current_user.daily_focus_goal = data.daily_focus_goal
    current_user.improve_focus = data.improve_focus
    current_user.improve_consistency = data.improve_consistency
    current_user.improve_energy = data.improve_energy
    current_user.onboarding_complete = True

    await db.commit()
    await db.refresh(current_user)
    return {"message": "Onboarding complete", "onboarding_complete": True}