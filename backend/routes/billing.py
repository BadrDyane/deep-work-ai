from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import User
from schemas import BillingStatus, UpgradeRequest
from auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/status", response_model=BillingStatus)
async def get_billing_status(current_user: User = Depends(get_current_user)):
    return {
        "plan": current_user.plan,
        "is_pro": current_user.plan == "pro"
    }


@router.post("/upgrade")
async def upgrade_plan(
    data: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if data.plan not in ["free", "pro"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid plan. Must be 'free' or 'pro'.")

    current_user.plan = data.plan
    await db.commit()
    await db.refresh(current_user)
    return {
        "message": f"Plan updated to {data.plan}",
        "plan": current_user.plan,
        "is_pro": current_user.plan == "pro"
    }