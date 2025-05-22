
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.farmer import Farmer
from models.veterinarian import Veterinarian
from schemas.auth import LoginRequest, TokenResponse
from utils import verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer
from utils import decode_token
from blacklist import blacklisted_tokens, is_token_blacklisted, add_token_to_blacklist
from schemas.auth import TokenUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
router = APIRouter()

# POST /login - user logs into the system
@router.post("/login", response_model=TokenResponse)
def login(user_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Farmer).filter(Farmer.email == user_data.email).first()
    role = "farmer"

    if not user:
        user = db.query(Veterinarian).filter(Veterinarian.email == user_data.email).first()
        role = "veterinarian"

    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.email, "role": role})
    return {"access_token": access_token, "token_type": "bearer"}


# POST /logout - user logs out of the system
@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    add_token_to_blacklist(token)
    return {"message": "Logout realizado com sucesso"}


# GET /me - get user's token
@router.get("/me", response_model=TokenUser)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email = payload.get("sub")
    role = payload.get("role")

    if role == "farmer":
        user = db.query(Farmer).filter(Farmer.email == email).first()
    elif role == "veterinarian":
        user = db.query(Veterinarian).filter(Veterinarian.email == email).first()
    else:
        user = None

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return TokenUser(
        id=user.id,
        name=user.name,
        email=user.email,
        role=role,
        farm_id=user.farm_id,
    )