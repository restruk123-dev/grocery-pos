from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import User, UserRole
from ..auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

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

@router.post("/token", response_model=TokenResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == req.username)).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Учетная запись деактивирована"
        )
    
    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        role=user.role,
        username=user.username,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role
    )

class SwitchCashierRequest(BaseModel):
    cashier_id: int

@router.get("/cashiers", response_model=list[dict])
def list_cashiers(session: Session = Depends(get_session)):
    """List all cashiers for instant 1-tap shift switching."""
    users = session.exec(select(User).where(User.is_active == True)).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role.value
        }
        for u in users
    ]

@router.post("/switch-cashier", response_model=TokenResponse)
def switch_cashier(req: SwitchCashierRequest, session: Session = Depends(get_session)):
    """Fast 1-tap cashier switch between shifts without typing credentials."""
    user = session.get(User, req.cashier_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="Kassir topilmadi / Кассир не найден")
    
    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        role=user.role,
        username=user.username,
        full_name=user.full_name
    )
