from pydantic import BaseModel
from typing import Optional, Literal, Any


class PatientBase(BaseModel):
    name: str
    email: str
    
    class Config:
        orm_mode = True
        from_attributes = True

class PatientCreate(PatientBase):
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


class AccessTokenPayload(BaseModel):
    id: int
    role: Literal['patient', 'doctor']
    name: str
    email: str


class ApiResponse(BaseModel):
    message: str
    data: Optional[Any] = None
