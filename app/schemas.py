from pydantic import BaseModel
from typing import Optional, Literal
    
    
class PatientCreate(BaseModel):
    name: str
    email: str
    password: str
    
class DoctorCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    address: str
    designation: str
    license: str
    specialization: str
    experience: Optional[int] = 0
    bio: str
    hospital: str


class LoginCreate(BaseModel):
    type: Literal["doctor", "patient"]
    email: str
    password: str
    class Config:
        orm_mode = True
    