
from pydantic import BaseModel, EmailStr

class VeterinarianCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    farm_id: int
    farmer_id: int

class VeterinarianResponse(VeterinarianCreate):
    id: int

    model_config = {
        "from_attributes": True
    }
