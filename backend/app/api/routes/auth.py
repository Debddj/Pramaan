from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.middleware.rate_limiter import limiter
from app.core.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login")
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(request: Request, creds: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user by email and password.
    Returns a JWT only if credentials match a registered, active user.
    """
    user = db.query(User).filter(User.email == creds.email).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(subject=user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.full_name,
    }
