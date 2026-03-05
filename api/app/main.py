from fastapi import FastAPI

from app.routes.videos import router as videos_router

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





app.include_router(videos_router)

@app.get("/health")
def get_health():
    return {"status" : "ok"}