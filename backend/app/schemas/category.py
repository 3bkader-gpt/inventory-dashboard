"""Category-related Pydantic schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base category schema."""
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category (all fields optional)."""
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None


class CategoryResponse(CategoryBase):
    """Schema for category responses."""
    id: int
    created_at: datetime
    product_count: int = 0  # Computed field
    
    model_config = {"from_attributes": True}
