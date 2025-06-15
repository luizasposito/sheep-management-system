
from pydantic import BaseModel, EmailStr, ConfigDict

class VeterinarianCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    farm_id: int
    farmer_id: int

class VeterinarianResponse(VeterinarianCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
