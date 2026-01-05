"""Seed initial data on first run."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product
from app.models.user import User, UserRole

settings = get_settings()


async def seed_initial_data(db: AsyncSession) -> None:
    """Create initial admin user and sample data if database is empty."""
    # Check if any users exist
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return  # Database already has data
    
    # Create admin user from settings
    admin = User(
        email=settings.first_admin_email,
        hashed_password=hash_password(settings.first_admin_password),
        full_name="System Administrator",
        role=UserRole.ADMIN,
    )
    db.add(admin)
    
    # Create sample categories
    categories = [
        Category(name="Electronics", description="Electronic devices and accessories"),
        Category(name="Office Supplies", description="Stationery and office equipment"),
        Category(name="Furniture", description="Office and home furniture"),
    ]
    for cat in categories:
        db.add(cat)
    
    await db.flush()
    
    # Create sample products
    products = [
        Product(
            sku="ELEC-001",
            name="Wireless Mouse",
            description="Ergonomic wireless mouse with USB receiver",
            category_id=categories[0].id,
            quantity=150,
            unit_price=29.99,
            low_stock_threshold=20,
            created_by=admin.id,
        ),
        Product(
            sku="ELEC-002",
            name="USB-C Hub",
            description="7-in-1 USB-C hub with HDMI",
            category_id=categories[0].id,
            quantity=8,  # Low stock example
            unit_price=49.99,
            low_stock_threshold=10,
            created_by=admin.id,
        ),
        Product(
            sku="OFF-001",
            name="A4 Paper Ream",
            description="500 sheets, 80gsm white paper",
            category_id=categories[1].id,
            quantity=200,
            unit_price=5.99,
            low_stock_threshold=50,
            created_by=admin.id,
        ),
        Product(
            sku="OFF-002",
            name="Ballpoint Pens (Pack of 12)",
            description="Blue ink, medium point",
            category_id=categories[1].id,
            quantity=5,  # Low stock example
            unit_price=4.99,
            low_stock_threshold=10,
            created_by=admin.id,
        ),
        Product(
            sku="FURN-001",
            name="Ergonomic Office Chair",
            description="Adjustable height, lumbar support",
            category_id=categories[2].id,
            quantity=25,
            unit_price=299.99,
            low_stock_threshold=5,
            created_by=admin.id,
        ),
    ]
    for prod in products:
        db.add(prod)
    
    await db.commit()
