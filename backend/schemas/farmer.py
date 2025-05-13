from pydantic import BaseModel, EmailStr

class FarmerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    farm_id: int

class FarmerResponse(FarmerCreate):
    id: int

    class Config:
        from_attributes = True
