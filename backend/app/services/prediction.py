"""Prediction engine for inventory forecasting."""
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.sales_order import SalesOrder


@dataclass
class ProductForecast:
    """Prediction result for a single product."""
    product_id: int
    sku: str
    name: str
    current_quantity: int
    avg_daily_sales: float
    days_until_stockout: float | None  # None if velocity is 0
    suggested_reorder: int
    urgency: str  # "critical", "warning", "ok"
    category_name: str | None


async def calculate_forecasts(
    db: AsyncSession,
    lookback_days: int = 30,
    target_days_stock: int = 14,
) -> list[ProductForecast]:
    """
    Calculate stock forecasts for all products.
    
    Args:
        db: Database session
        lookback_days: Number of days to calculate velocity from
        target_days_stock: Target number of days of stock to maintain
    
    Returns:
        List of ProductForecast sorted by urgency (critical first)
    """
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=lookback_days)

    # Get all products with their sales data
    products_result = await db.execute(select(Product))
    products = products_result.scalars().all()

    forecasts: list[ProductForecast] = []

    for product in products:
        # Calculate total sales in the lookback period
        sales_result = await db.execute(
            select(func.sum(SalesOrder.quantity_sold))
            .where(SalesOrder.product_id == product.id)
            .where(SalesOrder.sold_at >= cutoff_date)
        )
        total_sold = sales_result.scalar() or 0

        # Calculate average daily sales (velocity)
        avg_daily_sales = total_sold / lookback_days if lookback_days > 0 else 0

        # Calculate days until stockout
        if avg_daily_sales > 0:
            days_until_stockout = product.quantity / avg_daily_sales
        else:
            days_until_stockout = None  # Infinite (no sales)

        # Calculate suggested reorder quantity
        # Formula: (TargetDays * Velocity) - CurrentStock
        target_stock = target_days_stock * avg_daily_sales
        suggested_reorder = max(0, int(target_stock - product.quantity))

        # Determine urgency
        if days_until_stockout is None:
            urgency = "ok"  # No sales, not urgent
        elif days_until_stockout <= 3:
            urgency = "critical"
        elif days_until_stockout <= 7:
            urgency = "warning"
        else:
            urgency = "ok"

        forecasts.append(ProductForecast(
            product_id=product.id,
            sku=product.sku,
            name=product.name,
            current_quantity=product.quantity,
            avg_daily_sales=round(avg_daily_sales, 2),
            days_until_stockout=round(days_until_stockout, 1) if days_until_stockout else None,
            suggested_reorder=suggested_reorder,
            urgency=urgency,
            category_name=product.category.name if product.category else None,
        ))

    # Sort by urgency (critical first, then warning, then ok)
    urgency_order = {"critical": 0, "warning": 1, "ok": 2}
    forecasts.sort(key=lambda f: (urgency_order[f.urgency], f.days_until_stockout or 9999))

    return forecasts
