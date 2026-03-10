from fastapi import FastAPI

from app.routes.videos import router as videos_router
from app.routes.settings import router as settings_router
from app.routes.auth import router as auth_router
from app.config import CORS_ORIGIN

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





app.include_router(auth_router)
app.include_router(videos_router)
app.include_router(settings_router)

@app.get("/health")
def get_health():
    return {"status" : "ok"}