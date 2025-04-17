
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.farmer import Farmer
from models.veterinarian import Veterinarian
from schemas.auth import LoginRequest, TokenResponse
from utils import verify_password, create_access_token

router = APIRouter()

# login authentication
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
