"""Dashboard router for aggregate statistics and charts."""
from decimal import Decimal
from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DbSession
from app.models.category import Category
from app.models.product import Product
from app.models.user import UserRole
from app.schemas.dashboard import CategoryValue, DashboardStats, LowStockItem

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: CurrentUser,
    db: DbSession,
) -> DashboardStats:
    """Get aggregate dashboard statistics."""
    # Total products
    products_result = await db.execute(select(func.count(Product.id)))
    total_products = products_result.scalar() or 0
    
    # Total categories
    categories_result = await db.execute(select(func.count(Category.id)))
    total_categories = categories_result.scalar() or 0
    
    # Low stock count
    low_stock_result = await db.execute(
        select(func.count(Product.id)).where(
            Product.quantity <= Product.low_stock_threshold
        )
    )
    low_stock_count = low_stock_result.scalar() or 0
    
    # Total inventory value and quantity
    value_result = await db.execute(
        select(
            func.sum(Product.quantity * Product.unit_price),
            func.sum(Product.quantity),
        )
    )
    row = value_result.one()
    total_value = Decimal(row[0]) if row[0] else Decimal(0)
    total_quantity = row[1] or 0
    
    # Staff cannot see total revenue/value
    if current_user.role == UserRole.STAFF:
        total_value = Decimal(0)
    
    return DashboardStats(
        total_products=total_products,
        total_categories=total_categories,
        low_stock_count=low_stock_count,
        total_inventory_value=total_value,
        total_quantity=total_quantity,
    )


@router.get("/low-stock", response_model=list[LowStockItem])
async def get_low_stock_items(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = 10,
) -> list[LowStockItem]:
    """Get products with low stock for alerts chart."""
    result = await db.execute(
        select(Product)
        .where(Product.quantity <= Product.low_stock_threshold)
        .order_by(Product.quantity.asc())
        .limit(limit)
    )
    products = result.scalars().all()
    
    items = []
    for p in products:
        items.append(LowStockItem(
            id=p.id,
            sku=p.sku,
            name=p.name,
            quantity=p.quantity,
            low_stock_threshold=p.low_stock_threshold,
            category_name=p.category.name if p.category else None,
        ))
    
    return items


@router.get("/category-value", response_model=list[CategoryValue])
async def get_category_values(
    current_user: CurrentUser,
    db: DbSession,
) -> list[CategoryValue]:
    """Get inventory value breakdown by category for charts."""
    # Group by category including products with no category
    result = await db.execute(
        select(
            Product.category_id,
            func.count(Product.id).label("product_count"),
            func.sum(Product.quantity).label("total_quantity"),
            func.sum(Product.quantity * Product.unit_price).label("total_value"),
        )
        .group_by(Product.category_id)
    )
    
    rows = result.all()
    
    # Get category names
    category_ids = [r[0] for r in rows if r[0] is not None]
    categories = {}
    if category_ids:
        cat_result = await db.execute(
            select(Category).where(Category.id.in_(category_ids))
        )
        categories = {c.id: c.name for c in cat_result.scalars().all()}
    
    items = []
    for row in rows:
        cat_id = row[0]
        cat_name = categories.get(cat_id, "Uncategorized") if cat_id else "Uncategorized"
        
        # Staff cannot see value
        value = Decimal(row[3]) if row[3] else Decimal(0)
        if current_user.role == UserRole.STAFF:
            value = Decimal(0)
        
        items.append(CategoryValue(
            category_id=cat_id,
            category_name=cat_name,
            product_count=row[1] or 0,
            total_quantity=row[2] or 0,
            total_value=value,
        ))
    
    # Sort by value descending
    items.sort(key=lambda x: x.total_value, reverse=True)
    
    return items
