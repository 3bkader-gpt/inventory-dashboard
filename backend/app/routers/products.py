"""Products router with full CRUD and CSV operations."""
import csv
import io
import math
from decimal import Decimal
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select

from app.core.dependencies import AdminUser, CurrentUser, DbSession
from app.core.cache import cache
from app.models.product import Product
from app.models.user import UserRole
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductQuantityUpdate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    category_id: int | None = Query(None),
    low_stock_only: bool = Query(False),
) -> ProductListResponse:
    """List products with pagination, search, and filters."""
    # Base query
    query = select(Product)
    count_query = select(func.count(Product.id))
    
    # Apply filters
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)
    
    if category_id:
        query = query.where(Product.category_id == category_id)
        count_query = count_query.where(Product.category_id == category_id)
    
    if low_stock_only:
        query = query.where(Product.quantity <= Product.low_stock_threshold)
        count_query = count_query.where(Product.quantity <= Product.low_stock_threshold)
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Product.updated_at.desc()).offset(offset).limit(page_size)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    admin: AdminUser,
    db: DbSession,
    product_data: ProductCreate,
) -> ProductResponse:
    """Create a new product (Admin only)."""
    # Check for duplicate SKU
    existing = await db.execute(
        select(Product).where(Product.sku == product_data.sku)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists",
        )
    
    product = Product(**product_data.model_dump(), created_by=admin.id)
    db.add(product)
    await db.flush()
    await db.refresh(product)
    
    # Invalidate dashboard cache
    await cache.delete_pattern("dashboard_stats_*")
    
    return ProductResponse.model_validate(product)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    current_user: CurrentUser,
    db: DbSession,
) -> ProductResponse:
    """Get a specific product."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    admin: AdminUser,
    db: DbSession,
    product_data: ProductUpdate,
) -> ProductResponse:
    """Update all product fields (Admin only)."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    # Check for duplicate SKU if changing
    if product_data.sku and product_data.sku != product.sku:
        existing = await db.execute(
            select(Product).where(Product.sku == product_data.sku)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU already exists",
            )
    
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.flush()
    await db.refresh(product)
    
    # Invalidate dashboard cache
    await cache.delete_pattern("dashboard_stats_*")
    
    return ProductResponse.model_validate(product)


@router.patch("/{product_id}/quantity", response_model=ProductResponse)
async def update_product_quantity(
    product_id: int,
    current_user: CurrentUser,
    db: DbSession,
    quantity_data: ProductQuantityUpdate,
) -> ProductResponse:
    """Update only product quantity (Staff and Admin)."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    product.quantity = quantity_data.quantity
    await db.flush()
    await db.refresh(product)
    
    # Invalidate dashboard cache
    await cache.delete_pattern("dashboard_stats_*")
    
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    admin: AdminUser,
    db: DbSession,
) -> None:
    """Delete a product (Admin only)."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    await db.delete(product)
    
    # Invalidate dashboard cache
    await cache.delete_pattern("dashboard_stats_*")


@router.get("/export/csv")
async def export_products_csv(
    current_user: CurrentUser,
    db: DbSession,
) -> StreamingResponse:
    """Export all products as CSV."""
    result = await db.execute(select(Product).order_by(Product.sku))
    products = result.scalars().all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "SKU", "Name", "Description", "Category ID", 
        "Quantity", "Unit Price", "Low Stock Threshold"
    ])
    
    # Data rows
    for p in products:
        writer.writerow([
            p.sku, p.name, p.description or "", p.category_id or "",
            p.quantity, float(p.unit_price), p.low_stock_threshold
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


@router.post("/import/csv", status_code=status.HTTP_201_CREATED)
async def import_products_csv(
    admin: AdminUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> dict:
    """Import products from CSV (Admin only)."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV",
        )
    
    content = await file.read()
    csv_text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(csv_text))
    
    created = 0
    updated = 0
    errors = []
    
    for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
        try:
            sku = row.get("SKU", "").strip()
            if not sku:
                errors.append(f"Row {row_num}: Missing SKU")
                continue
            
            # Check if product exists
            existing = await db.execute(
                select(Product).where(Product.sku == sku)
            )
            product = existing.scalar_one_or_none()
            
            product_data = {
                "name": row.get("Name", "").strip() or sku,
                "description": row.get("Description", "").strip() or None,
                "category_id": int(row["Category ID"]) if row.get("Category ID") else None,
                "quantity": int(row.get("Quantity", 0)),
                "unit_price": Decimal(row.get("Unit Price", 0)),
                "low_stock_threshold": int(row.get("Low Stock Threshold", 10)),
            }
            
            if product:
                # Update existing
                for field, value in product_data.items():
                    setattr(product, field, value)
                updated += 1
            else:
                # Create new
                product = Product(sku=sku, **product_data, created_by=admin.id)
                db.add(product)
                created += 1
        
        except (ValueError, KeyError) as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    await db.flush()
    
    # Invalidate dashboard cache
    await cache.delete_pattern("dashboard_stats_*")
    
    return {
        "created": created,
        "updated": updated,
        "errors": errors[:10],  # Limit error messages
    }
