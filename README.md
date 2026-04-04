# Deep Work AI 🧠

> An intelligent productivity tracking SaaS that transforms your work sessions into actionable insights using AI.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o--mini-412991?style=flat&logo=openai&logoColor=white)](https://openai.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

---

## What Makes This Different

Most productivity apps just track time. Deep Work AI understands it.

Instead of start/stop timers, you describe your work session in plain English:

> *"Spent 2 hours on the authentication system. Got distracted by Slack a few times but finished the login flow. Feeling pretty good about the progress."*

GPT-4o-mini automatically extracts the duration, task type, energy level, distraction level, productivity score, and tags — no forms, no manual input. Over time, the system builds a model of how *you specifically* work, then lets you have a real conversation with that data.

---

## Screenshots

### Dashboard & Heatmap
![Dashboard](screenshots/dashboard.png)

### Session Logger
![Sessions](screenshots/sessions.png)

### Personal Productivity Assistant
![AI Assistant](screenshots/assistant.png)

### Weekly Brief
![Weekly Brief](screenshots/weekly-brief.png)

### Onboarding & Settings
![Onboarding](screenshots/onboarding.png)

---

## Features

### 📝 Natural Language Session Logging
Describe your work session in plain English. The AI parser extracts structured data automatically:
- Duration in minutes
- Task type (deep work, meetings, admin, learning, creative, planning, communication)
- Energy level (1–5)
- Distraction level (1–5)
- Productivity score (1–10)
- Relevant tags

### 📊 Analytics Dashboard
Real-time charts built from your session data:
- Productivity score trend over 14 days
- Sessions per day bar chart
- Energy vs distraction line chart
- Task type distribution pie chart
- Focus minutes per day
- **GitHub-style productivity heatmap** — color intensity encodes score, not just activity count

### 🤖 Personal Productivity Assistant
An AI chat interface grounded in your actual session history. Ask natural questions:
- *"When am I most focused and energized?"*
- *"What's been hurting my productivity this month?"*
- *"What should I prioritize differently next week?"*

Responses reference your real sessions — no generic advice. Multi-turn conversation with persistent chat history.

### 📋 Weekly Brief Generator
On-demand AI report covering the past 7 days:
- **Accomplishments** — what you actually got done
- **Time Leaks** — where focus broke down and why
- **Recommendations** — 3 specific, actionable things to improve next week

Reports are cached so the same week is never regenerated unnecessarily.

### 💼 SaaS Subscription Model
Realistic free vs pro gating enforced at the API level:

| Feature | Free | Pro |
|---|---|---|
| Session logging | ✅ | ✅ |
| Analytics dashboard | ✅ | ✅ |
| Productivity heatmap | ✅ | ✅ |
| AI Productivity Assistant | ❌ | ✅ |
| Weekly Brief Generator | ❌ | ✅ |
| Full session history | ❌ | ✅ |

### 🧭 Onboarding Flow
3-step wizard on first login:
1. Work type selection
2. Daily focus goal (hours/day)
3. Improvement areas (focus, consistency, energy)

Data is stored and used to personalize the AI assistant's system prompt.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework |
| Charts | Recharts | Data visualization |
| Heatmap | react-calendar-heatmap | GitHub-style activity map |
| Markdown | react-markdown | AI response formatting |
| Backend | FastAPI | REST API |
| ORM | SQLAlchemy (async) | Database layer |
| Database driver | asyncpg | PostgreSQL async driver |
| Database | PostgreSQL 15 (Docker) | Primary data store |
| AI | OpenAI GPT-4o-mini | Parsing, chat, reports |
| Auth | JWT (python-jose + passlib) | Authentication |
| HTTP client | requests | OpenAI REST calls |

---

## Architecture

```
Frontend (React + Vite :5173)
├── /login          — JWT authentication
├── /register       — Account creation
├── /onboarding     — First-login wizard
├── /dashboard      — Charts + heatmap
├── /sessions       — Natural language logger
├── /insights       — AI assistant chat
├── /reports        — Weekly brief viewer
└── /settings       — Plan management

Backend (FastAPI :8000)
├── /auth           — Register, login, /me
├── /sessions       — CRUD + GPT NLP parsing
├── /analytics      — Aggregation endpoints
├── /insights       — RAG chat over sessions
├── /reports        — Brief generation + caching
├── /billing        — Plan gating (simulated)
└── /onboarding     — User personalization

Services
├── ai_parser.py    — Text → structured JSON via GPT
├── ai_chat.py      — Session context injection + chat
├── ai_reports.py   — Weekly brief generation
├── analytics.py    — SQL aggregation logic
└── gating.py       — Plan enforcement

Database (PostgreSQL via Docker :5433)
├── users           — Auth, plan, onboarding data, goals
├── sessions        — Raw text + all parsed AI fields
└── weekly_reports  — Cached AI briefs
```

---

## AI System Design

Three distinct AI use cases, all using GPT-4o-mini via direct REST calls:

### 1. Session Parser (`ai_parser.py`)
Converts natural language → structured JSON.

**Input:** `"Spent 90 minutes on the backend. Kept getting pulled into Slack. Got auth done."`

**Output:**
```json
{
  "summary": "Worked on backend authentication despite Slack interruptions.",
  "duration_minutes": 90,
  "task_type": "deep work",
  "energy_level": 3,
  "distraction_level": 4,
  "tags": ["backend", "auth", "api"]
}
```

### 2. Productivity Assistant (`ai_chat.py`)
RAG-style chat — injects the user's last 20 sessions as context into every message. The model is instructed to reference only the provided data, preventing hallucination.

### 3. Weekly Brief Generator (`ai_reports.py`)
Aggregates 7 days of session data into a structured prompt. Parses the response into three named sections automatically.

---

## Local Setup

### Prerequisites
- Python 3.11
- Node.js 18+
- Docker Desktop

### 1. Clone the repository
```bash
git clone https://github.com/BadrDyane/deep-work-ai.git
cd deep-work-ai
```

### 2. Start the database
```bash
docker-compose up -d
```

### 3. Set up the backend
```bash
cd backend

# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1

# Mac/Linux
python3.11 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env` from the example:
```bash
cp .env.example .env
```

Fill in your values:
```env
DATABASE_URL=postgresql+asyncpg://deepwork_user:deepwork_pass@localhost:5433/deepwork_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=your-openai-api-key-here
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 4. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app
```
http://localhost:5173
```

API documentation available at:
```
http://localhost:8000/docs
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login, returns JWT |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/sessions` | ✅ | Log session (AI parsed) |
| GET | `/sessions` | ✅ | Get session history |
| DELETE | `/sessions/{id}` | ✅ | Delete a session |
| GET | `/analytics/summary` | ✅ | Stats overview |
| GET | `/analytics/trends` | ✅ | 14-day trend data |
| GET | `/analytics/heatmap` | ✅ | 90-day heatmap data |
| GET | `/analytics/energy` | ✅ | Energy/distraction trends |
| GET | `/analytics/distribution` | ✅ | Task type breakdown |
| GET | `/insights/starters` | ✅ | Suggested prompts |
| POST | `/insights/chat` | ✅ 🔒 Pro | AI assistant chat |
| POST | `/reports/generate` | ✅ 🔒 Pro | Generate weekly brief |
| GET | `/reports` | ✅ | Get past reports |
| GET | `/billing/status` | ✅ | Get plan info |
| POST | `/billing/upgrade` | ✅ | Change plan |
| POST | `/onboarding/complete` | ✅ | Save onboarding data |

---

## Project Structure

```
deep-work-ai/
├── backend/
│   ├── main.py              — FastAPI app + middleware + routing
│   ├── database.py          — SQLAlchemy async engine + session
│   ├── models.py            — Database models (users, sessions, reports)
│   ├── schemas.py           — Pydantic request/response schemas
│   ├── auth.py              — JWT utilities + get_current_user dependency
│   ├── .env.example         — Environment variable template
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py          — /auth endpoints
│   │   ├── sessions.py      — /sessions endpoints
│   │   ├── analytics.py     — /analytics endpoints
│   │   ├── insights.py      — /insights endpoints
│   │   ├── reports.py       — /reports endpoints
│   │   ├── billing.py       — /billing endpoints
│   │   └── onboarding.py    — /onboarding endpoints
│   └── services/
│       ├── ai_parser.py     — NLP session parsing
│       ├── ai_chat.py       — RAG productivity assistant
│       ├── ai_reports.py    — Weekly brief generation
│       ├── analytics.py     — Aggregation query logic
│       └── gating.py        — Plan enforcement
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Onboarding.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Sessions.jsx
│       │   ├── Insights.jsx
│       │   ├── Reports.jsx
│       │   └── Settings.jsx
│       ├── components/
│       │   └── ProductivityHeatmap.jsx
│       ├── api/
│       │   ├── sessions.js
│       │   ├── analytics.js
│       │   ├── insights.js
│       │   ├── reports.js
│       │   ├── billing.js
│       │   └── onboarding.js
│       └── context/
│           └── AuthContext.jsx
└── docker-compose.yml
```

---

## Key Engineering Decisions

**Why direct REST calls instead of the OpenAI SDK?**
The SDK has SSL/proxy issues on some Windows environments. Direct `requests` calls are more reliable, easier to debug, and give full control over timeouts and error handling.

**Why simulate billing instead of Stripe?**
The goal is to demonstrate product thinking — free vs pro feature gating, API-level enforcement, upgrade flows. Real Stripe integration adds complexity without adding to the portfolio signal, and would require a live account to demo.

**Why natural language logging instead of forms?**
Lower friction = more consistent data. A form with 6 fields gets ignored after day 2. A text box you can write in naturally gets used. The AI parser is also a genuine demonstration of structured data extraction from unstructured text — a real enterprise use case.

**Why cache weekly reports?**
Re-generating the same week's report on every request would waste OpenAI credits and add latency. Caching by `week_start` date means the first generation is stored and retrieved instantly on all subsequent requests.

---

## What This Project Demonstrates

| Capability | Implementation |
|---|---|
| Full-stack development | FastAPI + React + PostgreSQL end-to-end |
| AI integration | 3 distinct GPT use cases (parsing, RAG chat, reports) |
| Product thinking | Onboarding, subscription gating, free vs pro model |
| Database design | Relational schema with relationships and aggregations |
| Data visualization | Recharts dashboard + heatmap with real analytics |
| Authentication | JWT with protected routes on frontend and backend |
| Clean architecture | Modular services, separated business logic |
| API design | RESTful endpoints with proper status codes and schemas |

---

## Author

**Badr Dyane**
- GitHub: [@BadrDyane](https://github.com/BadrDyane)
- Email: badrdyane@gmail.com
