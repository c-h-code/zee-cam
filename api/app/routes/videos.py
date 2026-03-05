from fastapi import APIRouter, Query
from app.services.dynamodb import list_videos, get_video, delete_video
from app.services.s3 import generate_url

router = APIRouter()

@router.get("/videos")
def get_videos(limit: int = Query(20, ge=0, le=50)):
    return list_videos(limit=limit)

@router.get("/videos/{video_id}")
def get_videos(video_id : str):
    item = get_video(video_id)
    video_url = generate_url(item.get("video_key"))
    thumbnail_url = generate_url(item.get("thumbnail_key"))

    return {
        "id": item["id"],
        "created_at": item["created_at"],
        "video_url": video_url,
        "thumbnail_url": thumbnail_url
    }

@router.delete("/videos/{video_id}")
def delete_video_endpoint(video_id : str):
    delete_video(video_id)
    