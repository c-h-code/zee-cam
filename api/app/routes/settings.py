from fastapi import APIRouter, Depends
from app.services.s3 import get_uploads_enabled, set_uploads_enabled
from app.services.auth import require_auth

router = APIRouter(dependencies=[Depends(require_auth)])

@router.get("/settings/uploads")
def get_upload_status():
    return {"uploads_enabled": get_uploads_enabled()}

@router.post("/settings/uploads")
def set_upload_status(body: dict):
    enabled = body.get("uploads_enabled", True)
    set_uploads_enabled(enabled)
    return {"uploads_enabled": enabled}
