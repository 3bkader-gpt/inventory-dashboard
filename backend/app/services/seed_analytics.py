"""Seed analytics data for demo and testing."""
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.sales_order import SalesOrder


async def seed_sales_history(db: AsyncSession) -> int:
    """
    Generate dummy sales history for all products over the last 30 days.
    Returns the number of sales orders created.
    """
    # Check if we already have sales data
    existing = await db.execute(select(SalesOrder).limit(1))
    if existing.scalar_one_or_none():
        print("📊 Sales history already exists, skipping seed.")
        return 0

    # Get all products
    result = await db.execute(select(Product))
    products = result.scalars().all()

    if not products:
        print("⚠️ No products found, skipping sales seed.")
        return 0

    now = datetime.now(timezone.utc)
    sales_created = 0

    for product in products:
        # Assign a random "velocity category" to each product
        # Fast sellers: 5-15 sales/day, Medium: 1-5, Slow: 0-1
        velocity_type = random.choice(["fast", "medium", "slow"])
        
        if velocity_type == "fast":
            daily_range = (5, 15)
        elif velocity_type == "medium":
            daily_range = (1, 5)
        else:
            daily_range = (0, 2)

        # Generate sales for the last 30 days
        for days_ago in range(30):
            sale_date = now - timedelta(days=days_ago)
            num_sales = random.randint(*daily_range)

            for _ in range(num_sales):
                # Randomize time within the day
                random_hours = random.randint(0, 23)
                random_minutes = random.randint(0, 59)
                sale_time = sale_date.replace(hour=random_hours, minute=random_minutes)

                order = SalesOrder(
                    product_id=product.id,
                    quantity_sold=random.randint(1, 3),
                    sold_at=sale_time,
                )
                db.add(order)
                sales_created += 1

    await db.flush()
    print(f"✅ Seeded {sales_created} sales orders for {len(products)} products.")
    return sales_created
