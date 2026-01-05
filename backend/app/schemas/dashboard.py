"""Dashboard-related Pydantic schemas."""
from decimal import Decimal
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Aggregate dashboard statistics."""
    total_products: int
    total_categories: int
    low_stock_count: int
    total_inventory_value: Decimal
    total_quantity: int


class LowStockItem(BaseModel):
    """Product with low stock for alerts."""
    id: int
    sku: str
    name: str
    quantity: int
    low_stock_threshold: int
    category_name: str | None = None


class CategoryValue(BaseModel):
    """Inventory value per category for charts."""
    category_id: int | None
    category_name: str
    product_count: int
    total_quantity: int
    total_value: Decimal
