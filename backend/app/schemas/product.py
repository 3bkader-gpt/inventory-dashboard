"""Product-related Pydantic schemas."""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.schemas.category import CategoryResponse


class ProductBase(BaseModel):
    """Base product schema."""
    sku: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    quantity: int = Field(ge=0, default=0)
    unit_price: Decimal = Field(ge=0, decimal_places=2, default=0)
    low_stock_threshold: int = Field(ge=0, default=10)
    category_id: int | None = None


class ProductCreate(ProductBase):
    """Schema for creating a product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product (all fields optional)."""
    sku: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0, decimal_places=2)
    low_stock_threshold: int | None = Field(default=None, ge=0)
    category_id: int | None = None


class ProductQuantityUpdate(BaseModel):
    """Schema for staff-only quantity update."""
    quantity: int = Field(ge=0)


class ProductResponse(ProductBase):
    """Schema for product responses."""
    id: int
    category: CategoryResponse | None = None
    is_low_stock: bool
    total_value: Decimal
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Schema for paginated product list."""
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
