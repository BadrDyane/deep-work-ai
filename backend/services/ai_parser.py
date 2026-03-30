import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def parse_session(raw_text: str) -> dict:
    """
    Takes a natural language session description and returns structured data.
    Uses direct REST call to avoid OpenAI SDK SSL issues on Windows.
    """

    system_prompt = """You are a productivity data extraction assistant.

The user will describe a work session in natural language.
Your job is to extract structured data from their description.

You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no backticks.

Extract these fields:
- summary: A clean 1-2 sentence summary of what they worked on (string)
- duration_minutes: How long they worked in minutes. Infer from context ("2 hours" = 120, "half an hour" = 30). If completely unclear, use null.
- task_type: Categorize the work. Use one of: "deep work", "meetings", "admin", "learning", "planning", "creative", "communication". Pick the best fit.
- energy_level: Rate the user's energy from 1-5 based on their description. (1=exhausted, 3=neutral, 5=energized). Infer from words like "tired", "focused", "sluggish", "productive".
- distraction_level: Rate how distracted they were from 1-5. (1=fully focused, 5=constantly distracted). Infer from mentions of Slack, interruptions, difficulty focusing.
- tags: A list of 2-4 relevant keyword tags (e.g. ["backend", "auth", "bug-fix"])

Example input:
"Spent about 90 minutes working on the login page. Kept getting interrupted by Slack messages. Got the form validation done but felt pretty tired by the end."

Example output:
{"summary": "Worked on login page form validation despite frequent Slack interruptions.", "duration_minutes": 90, "task_type": "deep work", "energy_level": 2, "distraction_level": 4, "tags": ["frontend", "login", "validation"]}"""

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_text}
        ],
        "temperature": 0.2,
        "max_tokens": 300
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
        content = response.json()["choices"][0]["message"]["content"].strip()

        # Clean up in case model adds backticks despite instructions
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        return json.loads(content)

    except Exception as e:
        print(f"AI parser error: {e}")
        # Return safe defaults if AI fails — session still gets saved
        return {
            "summary": None,
            "duration_minutes": None,
            "task_type": "deep work",
            "energy_level": 3,
            "distraction_level": 3,
            "tags": []
        }