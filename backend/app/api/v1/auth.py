from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Profile
from app.schemas.schemas import UserRegister, UserLogin, Token, ProfileResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/auth/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(Profile).filter(Profile.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    new_profile = Profile(
        email=user_in.email,
        display_name=user_in.display_name,
        hashed_password=hash_password(user_in.password)
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    token = create_access_token(data={"sub": new_profile.id, "email": new_profile.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_profile.id,
        "email": new_profile.email,
        "display_name": new_profile.display_name
    }

@router.post("/auth/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "display_name": user.display_name
    }

@router.get("/me", response_model=ProfileResponse)
def get_profile(current_user: Profile = Depends(get_current_user)):
    return current_user

@router.delete("/me")
def delete_account(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"message": "User account and all associated investigations permanently deleted."}
