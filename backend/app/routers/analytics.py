"""Analytics router for AI-powered forecasting."""
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.core.dependencies import CurrentUser, DbSession
from app.services.prediction import calculate_forecasts


class ForecastResponse(BaseModel):
    """Single product forecast response."""
    product_id: int
    sku: str
    name: str
    current_quantity: int
    avg_daily_sales: float
    days_until_stockout: float | None
    suggested_reorder: int
    urgency: str
    category_name: str | None


router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/forecast", response_model=list[ForecastResponse])
async def get_forecasts(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = Query(20, ge=1, le=100),
    urgency_filter: str | None = Query(None, description="Filter by urgency: critical, warning, ok"),
) -> list[ForecastResponse]:
    """
    Get AI-powered stock forecasts for all products.
    
    Returns products sorted by urgency (critical items first).
    """
    forecasts = await calculate_forecasts(db)

    # Apply urgency filter if provided
    if urgency_filter:
        forecasts = [f for f in forecasts if f.urgency == urgency_filter]

    # Limit results
    forecasts = forecasts[:limit]

    return [
        ForecastResponse(
            product_id=f.product_id,
            sku=f.sku,
            name=f.name,
            current_quantity=f.current_quantity,
            avg_daily_sales=f.avg_daily_sales,
            days_until_stockout=f.days_until_stockout,
            suggested_reorder=f.suggested_reorder,
            urgency=f.urgency,
            category_name=f.category_name,
        )
        for f in forecasts
    ]


@router.get("/summary")
async def get_analytics_summary(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Get a high-level summary of inventory health."""
    forecasts = await calculate_forecasts(db)

    critical_count = sum(1 for f in forecasts if f.urgency == "critical")
    warning_count = sum(1 for f in forecasts if f.urgency == "warning")
    ok_count = sum(1 for f in forecasts if f.urgency == "ok")

    total_reorder_value = sum(f.suggested_reorder for f in forecasts)

    return {
        "critical_items": critical_count,
        "warning_items": warning_count,
        "healthy_items": ok_count,
        "total_suggested_reorder_units": total_reorder_value,
    }
