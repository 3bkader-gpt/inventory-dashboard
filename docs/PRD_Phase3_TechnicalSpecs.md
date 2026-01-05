# Phase 3: Technical Specifications (RSD)

## ⚙️ Non-Functional Requirements

---

## 1. Performance

### 1.1 Caching Strategy (Redis)

| Aspect | Implementation |
|--------|----------------|
| **Technology** | Redis (Upstash for production) |
| **Connection** | `redis_url` from environment |
| **Use Cases** | Rate limiting, Session storage (future) |

```python
# config.py
redis_url: str = "redis://localhost:6379/0"  # Local dev
# Production: Upstash Redis URL from environment
```

### 1.2 Database Performance

| Aspect | Implementation |
|--------|----------------|
| **ORM** | SQLAlchemy 2.0 (async) |
| **Driver** | `asyncpg` for PostgreSQL |
| **Connection Pool** | Default pool with async sessions |
| **Indexes** | User.email (unique), Product.sku (unique) |

### 1.3 API Response Times

| Endpoint Category | Target | Notes |
|-------------------|--------|-------|
| Authentication | < 200ms | Password hashing is intentionally slow |
| CRUD Operations | < 100ms | Standard DB queries |
| AI Search | < 3000ms | Gemini API call + DB query |
| Dashboard Stats | < 150ms | Aggregation queries |

---

## 2. Security

### 2.1 Authentication (JWT)

```yaml
JWT Configuration:
  Algorithm: HS256
  Access Token Expiry: 30 minutes
  Refresh Token Expiry: 7 days
  Storage:
    - Access Token: sessionStorage (frontend)
    - Refresh Token: HttpOnly Cookie (secure, samesite=lax)
```

**Token Structure:**
```json
{
  "sub": "user@email.com",
  "exp": 1704067200,
  "type": "access|refresh"
}
```

### 2.2 Password Security

| Aspect | Implementation |
|--------|----------------|
| **Hashing Algorithm** | bcrypt |
| **Library** | `passlib` |
| **Max Password Length** | 72 bytes (bcrypt limit, auto-truncated) |

```python
# security.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

### 2.3 Rate Limiting

| Endpoint Type | Limit | Purpose |
|---------------|-------|---------|
| Default API | 100/minute | General protection |
| AI Search | 10/minute | Protect expensive AI operations |
| Authentication | 20/minute | Brute force prevention |

```python
# limiter.py
limiter = Limiter(key_func=get_remote_address)

DEFAULT_LIMIT = "100/minute"
AI_SEARCH_LIMIT = "10/minute"
AUTH_LIMIT = "20/minute"
```

### 2.4 CORS Configuration

```python
# main.py - CORSMiddleware
allow_origins: [FRONTEND_URL]  # e.g., http://localhost:5173
allow_credentials: True         # Required for HttpOnly cookies
allow_methods: ["*"]
allow_headers: ["*"]
```

### 2.5 Role-Based Access Control (RBAC)

| Role | Products | Categories | Users | Financials |
|------|----------|------------|-------|------------|
| **Admin** | CRUD | CRUD | CRUD | View |
| **Staff** | CRUD | CRUD | ❌ | ❌ |

---

## 3. AI Logic

### 3.1 Natural Language Query Parser

**Architecture:**
```
User Query → [Try Gemini AI] → [Success?] → Parsed Filters
                    ↓ (Fail)
              [Regex Fallback] → Parsed Filters
```

**AI Provider:**
| Setting | Value |
|---------|-------|
| Provider | Google Gemini |
| Model | `gemini-2.0-flash` |
| SDK | `google-genai` |
| Initialization | Lazy (on first request) |

**Fallback Mechanism:**
```python
async def parse(self, query: str) -> ParsedQuery:
    # Lazy initialization
    self._init_ai()
    
    # Try AI first
    if self.ai_available:
        try:
            ai_result = await self._parse_with_ai(query)
            if ai_result:
                return ai_result
        except Exception as e:
            print(f"AI parsing failed: {e}")
    
    # Fallback to regex
    return self._parse_with_regex(query)
```

**Parsed Query Fields:**
```python
@dataclass
class ParsedQuery:
    name_contains: Optional[str]      # Product name search
    category_contains: Optional[str]  # Category filter
    min_price: Optional[float]        # Price range
    max_price: Optional[float]        
    low_stock: bool = False           # Low stock filter
    sort_by: Optional[str]            # price, quantity, name
    sort_order: str = "asc"           # asc, desc
    parse_method: str = "none"        # "ai", "regex", "none"
```

**Regex Fallback Patterns:**
| Pattern | Detection |
|---------|-----------|
| `low stock`, `out of stock` | `low_stock = True` |
| `cheap`, `cheapest` | `sort_by = "price"`, `sort_order = "asc"` |
| `expensive`, `pricey` | `sort_by = "price"`, `sort_order = "desc"` |
| `under $50` | `max_price = 50` |
| `over $100` | `min_price = 100` |
| Category keywords | `electronics`, `furniture`, etc. |

### 3.2 Stock Forecasting

**Algorithm:**
```python
# prediction.py
avg_daily_sales = total_sales_last_30_days / 30
days_until_stockout = current_quantity / avg_daily_sales  # if avg > 0
suggested_reorder = max(0, (14 * avg_daily_sales) - current_quantity)  # 14-day buffer

# Urgency Classification
if days_until_stockout < 7:
    urgency = "critical"
elif days_until_stockout < 14:
    urgency = "warning"
else:
    urgency = "ok"
```

**Edge Cases:**
| Scenario | Handling |
|----------|----------|
| No sales history | `avg_daily_sales = 0`, `urgency = "ok"` |
| Zero quantity | `days_until_stockout = 0`, `urgency = "critical"` |
| Division by zero | Return `None` for `days_until_stockout` |

---

## 4. Infrastructure

### 4.1 Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
REDIS_URL=redis://...

# Security
JWT_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI
GEMINI_API_KEY=your-api-key

# Initial Admin
FIRST_ADMIN_EMAIL=admin@company.com
FIRST_ADMIN_PASSWORD=secure-password
```

### 4.2 Docker Configuration

| Service | Port | Notes |
|---------|------|-------|
| Backend (FastAPI) | 8000 | Uvicorn ASGI |
| Frontend (Vite) | 5173 | Dev server |
| PostgreSQL | 5432 | Persistent volume |
| Redis | 6379 | For rate limiting |

### 4.3 Deployment Targets

| Platform | Backend | Frontend | Database | Cache |
|----------|---------|----------|----------|-------|
| **Render** | Web Service | Static Site | Render PostgreSQL | Upstash Redis |
| **Vercel** | ❌ | Static | ❌ | ❌ |
| **Railway** | ✅ | ✅ | ✅ | ✅ |

---

## 5. Error Handling

### 5.1 Backend Exceptions

| HTTP Code | Scenario |
|-----------|----------|
| 400 | Validation error (Pydantic) |
| 401 | Invalid/expired token |
| 403 | Insufficient role permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate email/SKU) |
| 422 | Unprocessable entity |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### 5.2 Frontend Error Boundary

```tsx
// ErrorBoundary.tsx
- Catches React rendering errors
- Displays user-friendly fallback UI
- Logs errors to console (dev) and backend endpoint (prod)
- Provides "Try Again" and "Go Home" actions
```

---

## ✅ Phase 3 Summary

| Category | Key Specifications |
|----------|-------------------|
| **Performance** | Redis caching, async SQLAlchemy, indexed queries |
| **Security** | JWT (HS256), bcrypt, Rate limiting (100/10/20), HttpOnly cookies |
| **AI** | Gemini 2.0 Flash, Regex fallback, Lazy initialization |
| **Infrastructure** | Docker-ready, Render/Railway deployment |

---

## ✅ Phase 3 Confirmation

**Please review and confirm:**
1. Are the technical specifications accurate?
2. Any missing security or performance details?
3. Ready for Phase 4 (Master Document compilation)?

Once confirmed, I'll compile everything into `PRODUCT_SPECS.md`.
