import threading
import time
from collections import deque
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Request
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import User, UserRole
from ..auth import verify_password, hash_password, needs_password_rehash, create_access_token, get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication"])
_login_attempts: dict[str, deque[float]] = {}
_login_attempts_lock = threading.Lock()
_LOGIN_WINDOW_SECONDS = 15 * 60
_LOGIN_MAX_FAILURES = 5

def _check_login_rate_limit(client_key: str) -> None:
    now = time.monotonic()
    with _login_attempts_lock:
        attempts = _login_attempts.setdefault(client_key, deque())
        while attempts and now - attempts[0] >= _LOGIN_WINDOW_SECONDS:
            attempts.popleft()
        if len(_login_attempts) > 10_000:
            stale_keys = [key for key, values in _login_attempts.items() if not values or now - values[-1] >= _LOGIN_WINDOW_SECONDS]
            for key in stale_keys:
                _login_attempts.pop(key, None)
        if len(attempts) >= _LOGIN_MAX_FAILURES:
            raise HTTPException(status_code=429, detail="Too many login attempts. Try again in 15 minutes.", headers={"Retry-After": "900"})

def _record_failed_login(client_key: str) -> None:
    with _login_attempts_lock:
        _login_attempts.setdefault(client_key, deque()).append(time.monotonic())

class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=1, max_length=1024)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    username: str
    full_name: str

class UserProfile(BaseModel):
    id: int
    username: str
    full_name: str
    role: UserRole

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=1024)
    new_password: str = Field(min_length=12, max_length=1024)

class CashierCreateRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_.-]+$")
    full_name: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=12, max_length=1024)

class SwitchCashierRequest(BaseModel):
    cashier_id: int
    password: str = Field(min_length=1, max_length=1024)

@router.post("/token", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, session: Session = Depends(get_session)):
    client_key = request.client.host if request.client else "unknown"
    _check_login_rate_limit(client_key)
    user = session.exec(select(User).where(User.username == req.username)).first()
    if not user or not verify_password(req.password, user.hashed_password):
        _record_failed_login(client_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль"
        )
    if not user.is_active:
        _record_failed_login(client_key)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Учетная запись деактивирована"
        )

    with _login_attempts_lock:
        _login_attempts.pop(client_key, None)

    if needs_password_rehash(user.hashed_password):
        user.hashed_password = hash_password(req.password)
        session.add(user)
        session.commit()

    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        role=user.role,
        username=user.username,
        full_name=user.full_name
    )

@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    if request.current_password == request.new_password:
        raise HTTPException(status_code=400, detail="Choose a different password")
    current_user.hashed_password = hash_password(request.new_password)
    session.add(current_user)
    session.commit()
    return None

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role
    )

@router.get("/cashiers", response_model=list[dict])
def list_cashiers(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List all cashiers for instant 1-tap shift switching."""
    users = session.exec(select(User).where(User.is_active == True, User.role == UserRole.CASHIER)).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role.value
        }
        for u in users
    ]

@router.post("/cashiers", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_cashier(
    request: CashierCreateRequest,
    current_user: User = Depends(require_role([UserRole.OWNER])),
    session: Session = Depends(get_session),
):
    username = request.username.strip()
    if session.exec(select(User).where(User.username == username)).first():
        raise HTTPException(status_code=409, detail="Username already exists")
    user = User(
        username=username,
        full_name=request.full_name.strip(),
        role=UserRole.CASHIER,
        hashed_password=hash_password(request.password),
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "username": user.username, "full_name": user.full_name, "role": user.role.value}

@router.post("/switch-cashier", response_model=TokenResponse)
def switch_cashier(
    req: SwitchCashierRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Switch the active register identity only after the selected cashier authenticates."""
    client_key = request.client.host if request.client else "unknown"
    _check_login_rate_limit(client_key)
    user = session.get(User, req.cashier_id)
    if not user or not user.is_active or user.role != UserRole.CASHIER:
        _record_failed_login(client_key)
        raise HTTPException(status_code=404, detail="Kassir topilmadi / Кассир не найден")
    if not verify_password(req.password, user.hashed_password):
        _record_failed_login(client_key)
        raise HTTPException(status_code=401, detail="Неверный пароль кассира")

    with _login_attempts_lock:
        _login_attempts.pop(client_key, None)
    if needs_password_rehash(user.hashed_password):
        user.hashed_password = hash_password(req.password)
        session.add(user)
        session.commit()

    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        role=user.role,
        username=user.username,
        full_name=user.full_name
    )
