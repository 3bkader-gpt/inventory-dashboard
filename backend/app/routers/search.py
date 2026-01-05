"""Smart search router with natural language query support."""
from fastapi import APIRouter, Query, Request
from pydantic import BaseModel
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.core.dependencies import CurrentUser, DbSession
from app.core.limiter import limiter, AI_SEARCH_LIMIT
from app.models.product import Product
from app.models.category import Category
from app.services.llm_search import query_parser, ParsedQuery
from app.schemas.product import ProductResponse


class SmartSearchRequest(BaseModel):
    """Request body for smart search."""
    query: str


class SmartSearchResponse(BaseModel):
    """Response for smart search including parsed query info."""
    results: list[ProductResponse]
    total: int
    parsed_query: dict
    parse_method: str


router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("/smart", response_model=SmartSearchResponse)
@limiter.limit(AI_SEARCH_LIMIT)
async def smart_search(
    request: Request,  # Required by limiter
    body: SmartSearchRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> SmartSearchResponse:
    """
    Smart natural language search powered by AI.
    
    Examples:
    - "show me cheap electronics"
    - "low stock items"
    - "products under $50"
    - "expensive furniture"
    """
    # Parse the natural language query
    parsed = await query_parser.parse(body.query)
    
    # Build SQLAlchemy query
    query = select(Product).options(selectinload(Product.category))
    
    # Apply filters based on parsed query
    conditions = []
    
    if parsed.name_contains:
        conditions.append(Product.name.ilike(f"%{parsed.name_contains}%"))
    
    if parsed.category_contains:
        # Join with category and filter
        query = query.join(Category, Product.category_id == Category.id, isouter=True)
        conditions.append(Category.name.ilike(f"%{parsed.category_contains}%"))
    
    if parsed.min_price is not None:
        conditions.append(Product.unit_price >= parsed.min_price)
    
    if parsed.max_price is not None:
        conditions.append(Product.unit_price <= parsed.max_price)
    
    if parsed.low_stock:
        conditions.append(Product.quantity <= Product.low_stock_threshold)
    
    # Apply all conditions
    if conditions:
        query = query.where(*conditions)
    
    # Apply sorting
    if parsed.sort_by:
        sort_column = {
            "price": Product.unit_price,
            "quantity": Product.quantity,
            "name": Product.name,
        }.get(parsed.sort_by, Product.name)
        
        if parsed.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(Product.updated_at.desc())
    
    # Limit results
    query = query.limit(20)
    
    # Execute
    result = await db.execute(query)
    products = result.scalars().all()
    
    return SmartSearchResponse(
        results=[ProductResponse.model_validate(p) for p in products],
        total=len(products),
        parsed_query={
            "name_contains": parsed.name_contains,
            "category_contains": parsed.category_contains,
            "min_price": parsed.min_price,
            "max_price": parsed.max_price,
            "low_stock": parsed.low_stock,
            "sort_by": parsed.sort_by,
            "sort_order": parsed.sort_order,
        },
        parse_method=parsed.parse_method,
    )


@router.get("/products")
async def search_products(
    current_user: CurrentUser,
    db: DbSession,
    q: str = Query(..., min_length=1, description="Search query"),
) -> list[ProductResponse]:
    """Simple text search for products (for autocomplete)."""
    result = await db.execute(
        select(Product)
        .where(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.sku.ilike(f"%{q}%"),
            )
        )
        .limit(10)
    )
    products = result.scalars().all()
    return [ProductResponse.model_validate(p) for p in products]
