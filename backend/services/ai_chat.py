import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def build_system_prompt(user, sessions) -> str:
    """Build a personalized system prompt from user data and sessions."""

    session_summaries = []
    for s in sessions[-20:]:  # last 20 sessions max
        date = s.session_date.strftime("%Y-%m-%d") if s.session_date else "unknown date"
        summary = s.summary or s.raw_text[:100]
        session_summaries.append(
            f"- [{date}] {s.task_type or 'unknown'} | "
            f"Score: {s.productivity_score}/10 | "
            f"Energy: {s.energy_level}/5 | "
            f"Distraction: {s.distraction_level}/5 | "
            f"{summary}"
        )

    sessions_text = "\n".join(session_summaries) if session_summaries else "No sessions logged yet."

    work_type = user.work_type or "knowledge work"
    goal = user.daily_focus_goal or 4

    return f"""You are a Personal Productivity Assistant with access to the user's actual work session history.

USER PROFILE:
- Name: {user.username}
- Work type: {work_type}
- Daily focus goal: {goal} hours

RECENT SESSION DATA:
{sessions_text}

YOUR ROLE:
- Answer questions about the user's productivity patterns using ONLY the data above
- Provide specific, actionable recommendations based on their actual sessions
- Be honest — if patterns are negative, say so clearly but constructively
- Format responses with clear sections using bullet points where helpful
- Keep answers concise but insightful — no fluff
- If asked something you cannot answer from the data, say so clearly

Never make up data. Only reference sessions listed above."""


def chat_with_assistant(user, sessions, message: str, history: list) -> str:
    """Send a message to the AI assistant with full session context."""

    system_prompt = build_system_prompt(user, sessions)

    messages = [{"role": "system", "content": system_prompt}]

    # Include conversation history for multi-turn
    for h in history[-6:]:  # last 6 exchanges to stay within token limits
        messages.append({"role": h.role, "content": h.content})

    messages.append({"role": "user", "content": message})

    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 600
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"AI chat error: {e}")
        return "I'm having trouble connecting right now. Please try again in a moment."