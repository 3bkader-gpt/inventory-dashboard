"""Categories router."""
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.core.dependencies import AdminUser, CurrentUser, DbSession
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryResponse])
async def list_categories(
    current_user: CurrentUser,
    db: DbSession,
) -> list[CategoryResponse]:
    """List all categories with product counts."""
    # Get categories with product count using subquery
    product_count_subq = (
        select(Product.category_id, func.count(Product.id).label("product_count"))
        .group_by(Product.category_id)
        .subquery()
    )
    
    result = await db.execute(
        select(Category, func.coalesce(product_count_subq.c.product_count, 0).label("count"))
        .outerjoin(product_count_subq, Category.id == product_count_subq.c.category_id)
        .order_by(Category.name)
    )
    
    categories = []
    for row in result.all():
        cat_response = CategoryResponse.model_validate(row[0])
        cat_response.product_count = row[1]
        categories.append(cat_response)
    
    return categories


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    admin: AdminUser,
    db: DbSession,
    category_data: CategoryCreate,
) -> CategoryResponse:
    """Create a new category (Admin only)."""
    # Check for duplicate name
    existing = await db.execute(
        select(Category).where(Category.name == category_data.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists",
        )
    
    category = Category(**category_data.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)
    
    response = CategoryResponse.model_validate(category)
    response.product_count = 0
    return response


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    current_user: CurrentUser,
    db: DbSession,
) -> CategoryResponse:
    """Get a specific category."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Get product count
    count_result = await db.execute(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    product_count = count_result.scalar() or 0
    
    response = CategoryResponse.model_validate(category)
    response.product_count = product_count
    return response


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    admin: AdminUser,
    db: DbSession,
    category_data: CategoryUpdate,
) -> CategoryResponse:
    """Update a category (Admin only)."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Check for duplicate name if updating
    if category_data.name and category_data.name != category.name:
        existing = await db.execute(
            select(Category).where(Category.name == category_data.name)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category name already exists",
            )
    
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    await db.flush()
    await db.refresh(category)
    
    # Get product count
    count_result = await db.execute(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    product_count = count_result.scalar() or 0
    
    response = CategoryResponse.model_validate(category)
    response.product_count = product_count
    return response


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    admin: AdminUser,
    db: DbSession,
) -> None:
    """Delete a category (Admin only). Fails if products exist."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Check for products using this category
    product_count = await db.execute(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    if product_count.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with associated products",
        )
    
    await db.delete(category)
