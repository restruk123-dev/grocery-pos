import base64
import hashlib
import hmac
import json
import time
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from .config import settings
from .database import get_session
from .models import User, UserRole

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes password with SHA256 and a fixed application salt."""
    salt = settings.SECRET_KEY.encode("utf-8")
    pwd_bytes = password.encode("utf-8")
    dk = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt, 100_000)
    return dk.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def create_access_token(data: dict, expires_delta_seconds: Optional[int] = None) -> str:
    if expires_delta_seconds is None:
        expires_delta_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_delta_seconds
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b"=")
    payload_bytes = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=")
    
    signing_input = header_bytes + b"." + payload_bytes
    signature = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    sig_bytes = base64.urlsafe_b64encode(signature).rstrip(b"=")
    
    return f"{header_bytes.decode()}.{payload_bytes.decode()}.{sig_bytes.decode()}"

def decode_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify signature
        signing_input = (header_b64 + "." + payload_b64).encode()
        expected_sig = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        
        # Base64 pad
        sig_padding = len(sig_b64) % 4
        padded_sig_b64 = sig_b64 + ("=" * (4 - sig_padding) if sig_padding else "")
        provided_sig = base64.urlsafe_b64decode(padded_sig_b64.encode())
        
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
        
        payload_padding = len(payload_b64) % 4
        padded_payload_b64 = payload_b64 + ("=" * (4 - payload_padding) if payload_padding else "")
        payload = json.loads(base64.urlsafe_b64decode(padded_payload_b64.encode()).decode())
        
        # Check expiry
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    user = session.exec(select(User).where(User.username == username)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")
    return user

def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker
