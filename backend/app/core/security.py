import base64
import hmac
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Union, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings

# ---------- Base64url helpers ----------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += '=' * padding
    return base64.urlsafe_b64decode(data.encode('utf-8'))

# ---------- Token creation / verification ----------

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(subject), "exp": int(expire.timestamp())}
    
    hdr_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    pay_b64 = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{hdr_b64}.{pay_b64}".encode('utf-8')
    sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    
    return f"{hdr_b64}.{pay_b64}.{sig_b64}"

def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        hdr_b64, pay_b64, sig_b64 = parts
        signing_input = f"{hdr_b64}.{pay_b64}".encode('utf-8')
        expected_sig = _b64url_encode(hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest())
        if not hmac.compare_digest(sig_b64, expected_sig):
            return None
        payload = json.loads(_b64url_decode(pay_b64).decode('utf-8'))
        if datetime.utcnow().timestamp() > payload.get('exp', 0):
            return None
        return payload
    except Exception:
        return None

# ---------- Password hashing ----------

def get_password_hash(password: str) -> str:
    salt = "pramaan_salt_"
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

# ---------- FastAPI auth dependencies ----------

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
):
    """
    FastAPI dependency: extracts and validates the JWT from the Authorization
    header, looks up the user in the DB, and returns the User ORM object.
    Raises 401 if the token is missing, invalid, expired, or the user doesn't exist.
    """
    # Lazy import to avoid circular dependency (database -> config -> security)
    from app.core.database import get_db, SessionLocal
    from app.models.user import User

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
    finally:
        db.close()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def require_officer(current_user=Depends(get_current_user)):
    """
    Chains on get_current_user and ensures the user has 'officer' or higher role.
    """
    if current_user.role not in ("officer", "supervisor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges: officer role required",
        )
    return current_user
