"""User-related Pydantic schemas."""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(min_length=6, max_length=100)
    role: UserRole = UserRole.STAFF


class UserUpdate(BaseModel):
    """Schema for updating a user (all fields optional)."""
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=1, max_length=100)
    password: str | None = Field(default=None, min_length=6, max_length=100)
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    """Schema for user responses."""
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    """Schema for login request (OAuth2 form)."""
    username: EmailStr  # OAuth2 spec uses "username"
    password: str


class TokenResponse(BaseModel):
    """Schema for token responses."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
