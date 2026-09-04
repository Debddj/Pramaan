from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.security import create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login")
def login(creds: LoginRequest):
    if creds.email == "officer@consumer.gov.in" and creds.password == "sih2026":
        token = create_access_token(subject="officer@consumer.gov.in")
        return {"access_token": token, "token_type": "bearer", "role": "officer", "name": "Inspector R. Sharma"}
    return {"access_token": create_access_token(subject=creds.email), "token_type": "bearer", "role": "officer", "name": "Officer"}
