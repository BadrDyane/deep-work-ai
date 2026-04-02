from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models import User, Session as SessionModel
from schemas import InsightRequest, InsightResponse
from auth import get_current_user
from services.ai_chat import chat_with_assistant
from services.gating import require_pro

router = APIRouter(prefix="/insights", tags=["insights"])

STARTER_PROMPTS = [
    "What patterns do you see in my productivity this week?",
    "When am I most focused and energized?",
    "What's been hurting my focus the most?",
    "What should I prioritize differently next week?",
]


@router.get("/starters")
async def get_starter_prompts():
    return {"prompts": STARTER_PROMPTS}


@router.post("/chat", response_model=InsightResponse)
async def chat(
    data: InsightRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    require_pro(current_user, "AI Productivity Assistant")

    result = await db.execute(
        select(SessionModel)
        .where(SessionModel.user_id == current_user.id)
        .order_by(desc(SessionModel.session_date))
        .limit(20)
    )
    sessions = result.scalars().all()

    reply = chat_with_assistant(current_user, sessions, data.message, data.history)
    return {"reply": reply}