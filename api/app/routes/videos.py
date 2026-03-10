from fastapi import APIRouter, Query, Depends
from app.services.dynamodb import list_videos, delete_video
from app.services.s3 import generate_url
from app.services.auth import require_auth

router = APIRouter(dependencies=[Depends(require_auth)])

@router.get("/videos")
def list_videos_endpoint(limit: int = Query(20, ge=0, le=50)):
    list = list_videos(limit=limit)
    videos = []
    for item in list:
        videos.append({
            "id": item["id"],
            "created_at": item["created_at"],
            "video_url": generate_url(item.get("video_key")),
            "thumbnail_url": generate_url(item.get("thumbnail_key"))
        })
    return videos

@router.delete("/videos/{video_id}")
def delete_video_endpoint(video_id: str):
    delete_video(video_id)
