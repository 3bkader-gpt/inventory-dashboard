# Inventory Management API

## Development

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -e ".[dev]"

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - SQLite connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_ALGORITHM` - Algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry
