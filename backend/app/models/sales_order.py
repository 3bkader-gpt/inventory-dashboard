"""Sales Order model for tracking product sales history."""
from datetime import datetime
from sqlalchemy import ForeignKey, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SalesOrder(Base):
    """Tracks individual sales for analytics and prediction."""
    __tablename__ = "sales_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    quantity_sold: Mapped[int] = mapped_column(Integer, default=1)
    sold_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="sales_orders")
