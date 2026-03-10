from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.dynamodb import get_user
from app.services.auth import verify_password, create_token

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
def login(body: LoginRequest):
    user = get_user(body.username)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"token": create_token(body.username)}
