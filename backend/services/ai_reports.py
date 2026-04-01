import os
import requests
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def generate_weekly_brief(user, sessions) -> dict:
    """Generate a structured weekly productivity brief from session data."""

    if not sessions:
        return {
            "accomplishments": "No sessions were logged this week.",
            "time_leaks": "No data available.",
            "recommendations": "Start logging your work sessions to get personalized recommendations.",
            "raw_brief": ""
        }

    total_minutes = sum(s.duration_minutes or 0 for s in sessions)
    avg_score = sum(s.productivity_score or 0 for s in sessions) / len(sessions)
    avg_energy = sum(s.energy_level or 0 for s in sessions) / len(sessions)
    avg_distraction = sum(s.distraction_level or 0 for s in sessions) / len(sessions)

    task_types = {}
    for s in sessions:
        t = s.task_type or "unknown"
        task_types[t] = task_types.get(t, 0) + 1

    session_details = []
    for s in sessions:
        date = s.session_date.strftime("%A %b %d") if s.session_date else "unknown"
        summary = s.summary or s.raw_text[:80]
        session_details.append(f"- {date}: {summary} (score: {s.productivity_score}/10)")

    sessions_text = "\n".join(session_details)
    task_breakdown = ", ".join([f"{k}: {v}" for k, v in task_types.items()])

    prompt = f"""You are analyzing a weekly productivity report for {user.username}.

WEEK STATS:
- Total sessions: {len(sessions)}
- Total focus time: {round(total_minutes / 60, 1)} hours
- Average productivity score: {round(avg_score, 1)}/10
- Average energy level: {round(avg_energy, 1)}/5
- Average distraction level: {round(avg_distraction, 1)}/5
- Task breakdown: {task_breakdown}

SESSION LOG:
{sessions_text}

Write a weekly productivity brief with exactly these three sections:

**ACCOMPLISHMENTS**
What the user actually got done this week. Be specific, reference real sessions. 2-4 bullet points.

**TIME LEAKS**
Where focus broke down — high distraction sessions, low energy patterns, task types that hurt productivity. Be honest. 2-3 bullet points.

**RECOMMENDATIONS**
3 specific, actionable things to improve next week based on this data. Make them concrete, not generic.

Keep the tone direct, honest, and constructive. No fluff."""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 800
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=40
        )
        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"].strip()

        # Parse the three sections
        accomplishments = _extract_section(raw, "ACCOMPLISHMENTS")
        time_leaks = _extract_section(raw, "TIME LEAKS")
        recommendations = _extract_section(raw, "RECOMMENDATIONS")

        return {
            "accomplishments": accomplishments,
            "time_leaks": time_leaks,
            "recommendations": recommendations,
            "raw_brief": raw
        }

    except Exception as e:
        print(f"Weekly brief error: {e}")
        return {
            "accomplishments": "Failed to generate brief.",
            "time_leaks": "Failed to generate brief.",
            "recommendations": "Please try again.",
            "raw_brief": ""
        }


def _extract_section(text: str, section_name: str) -> str:
    """Extract a section from the brief by its header."""
    try:
        lines = text.split("\n")
        capturing = False
        captured = []
        for line in lines:
            if section_name in line.upper():
                capturing = True
                continue
            if capturing:
                if any(s in line.upper() for s in ["ACCOMPLISHMENTS", "TIME LEAKS", "RECOMMENDATIONS"]) and line.strip():
                    break
                captured.append(line)
        return "\n".join(captured).strip()
    except Exception:
        return ""