from fastapi import HTTPException
from models import User


FREE_PLAN_LIMITS = {
    "max_session_history_days": 7,
    "ai_chat": False,
    "weekly_brief": False,
}

PRO_PLAN_LIMITS = {
    "max_session_history_days": 365,
    "ai_chat": True,
    "weekly_brief": True,
}


def get_plan_limits(user: User) -> dict:
    return PRO_PLAN_LIMITS if user.plan == "pro" else FREE_PLAN_LIMITS


def require_pro(user: User, feature: str):
    """Raise 403 if user is on free plan and tries to access a pro feature."""
    if user.plan != "pro":
        raise HTTPException(
            status_code=403,
            detail={
                "error": "pro_required",
                "feature": feature,
                "message": f"'{feature}' is a Pro feature. Upgrade to access it."
            }
        )