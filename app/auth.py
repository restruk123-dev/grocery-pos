import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from .config import settings
from .database import get_session
from .models import User, UserRole

security = HTTPBearer(auto_error=False)

# The previous build used the published application SECRET_KEY as a fixed password
# salt. Keep this value solely to verify and transparently upgrade existing hashes.
_LEGACY_PASSWORD_SALT = "grocery-pos-super-secret-production-key-2026"
_PASSWORD_HASH_ITERATIONS = 600_000

def hash_password(password: str) -> str:
    """Store PBKDF2-SHA256 with a per-password random salt and versioned parameters."""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PASSWORD_HASH_ITERATIONS)
    return f"pbkdf2_sha256${_PASSWORD_HASH_ITERATIONS}${salt.hex()}${digest.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            scheme, iterations_text, salt_hex, digest_hex = hashed_password.split("$", 3)
            if scheme != "pbkdf2_sha256":
                return False
            iterations = int(iterations_text)
            if iterations < 100_000 or iterations > 2_000_000:
                return False
            expected = bytes.fromhex(digest_hex)
            actual = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), bytes.fromhex(salt_hex), iterations)
            return hmac.compare_digest(actual, expected)

        # Legacy hashes were unsalted per user and depended on the old global key.
        for legacy_salt in {_LEGACY_PASSWORD_SALT, settings.SECRET_KEY}:
            legacy = hashlib.pbkdf2_hmac(
                "sha256", plain_password.encode("utf-8"), legacy_salt.encode("utf-8"), 100_000
            ).hex()
            if hmac.compare_digest(legacy, hashed_password):
                return True
        return False
    except (ValueError, TypeError, OverflowError):
        return False

def needs_password_rehash(hashed_password: str) -> bool:
    return not hashed_password.startswith(f"pbkdf2_sha256${_PASSWORD_HASH_ITERATIONS}$")

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
        
        header_padding = len(header_b64) % 4
        parsed_header = json.loads(base64.urlsafe_b64decode((header_b64 + "=" * ((4 - header_padding) % 4)).encode()).decode())
        if not isinstance(parsed_header, dict) or parsed_header.get("alg") != "HS256":
            return None

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
