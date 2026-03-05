from fastapi import FastAPI
from app.routes.health import router as health_router
from app.routes.videos import router as videos_router


app = FastAPI()

app.include_router(health_router)
app.include_router(videos_router)

