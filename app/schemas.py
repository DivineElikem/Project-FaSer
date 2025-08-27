from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserBase(BaseModel):
    name: str
    active: bool = True

class UserCreate(BaseModel):
    name: str
    active: bool = True

        
class UserUpdate(BaseModel):
    name: Optional[str]
    active: Optional[bool]

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class LogOut(BaseModel):
    id: int
    user_id: Optional[int]
    user_name: Optional[str] = None
    status: str
    timestamp: datetime
    face_image_url: Optional[str] = None
    class Config:
        from_attributes = True

class TokenData(BaseModel):
    username: Optional[str] = None