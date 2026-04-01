from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
from routes import auth as auth_router
from routes import sessions as sessions_router
from routes import analytics as analytics_router
from routes import insights as insights_router
from routes import reports as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Deep Work AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(sessions_router.router)
app.include_router(analytics_router.router)
app.include_router(insights_router.router)
app.include_router(reports_router.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Deep Work AI"}