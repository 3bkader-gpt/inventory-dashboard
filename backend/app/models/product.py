"""Product ORM model."""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Product(Base):
    """Inventory product model."""
    
    __tablename__ = "products"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Inventory fields
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=10)
    
    # Foreign keys
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Relationships
    category: Mapped["Category | None"] = relationship(
        "Category",
        back_populates="products",
        lazy="selectin"
    )
    sales_orders: Mapped[list["SalesOrder"]] = relationship(
        "SalesOrder",
        back_populates="product",
        lazy="selectin",
        cascade="all, delete-orphan"
    )
    
    @property
    def is_low_stock(self) -> bool:
        """Check if product is below low stock threshold."""
        return self.quantity <= self.low_stock_threshold
    
    @property
    def total_value(self) -> Decimal:
        """Calculate total inventory value for this product."""
        return self.quantity * self.unit_price
    
    def __repr__(self) -> str:
        return f"<Product {self.sku}: {self.name}>"


# Import at bottom to avoid circular import
from app.models.category import Category  # noqa: E402, F401
