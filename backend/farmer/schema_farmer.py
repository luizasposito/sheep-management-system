from pydantic import BaseModel, EmailStr, ConfigDict

class FarmerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    farm_id: int

class FarmerResponse(FarmerCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
