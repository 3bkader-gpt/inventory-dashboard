# 📋 AI-Powered SaaS Inventory Dashboard
## Complete Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** January 5, 2026  
**Tech Stack:** React, FastAPI, PostgreSQL, Redis, Docker, Gemini AI

---

# 📑 Table of Contents

1. [High-Level Architecture & Actors](#part-1-high-level-architecture--actors)
2. [User Stories & Acceptance Criteria](#part-2-user-stories--acceptance-criteria)
3. [Technical Specifications (RSD)](#part-3-technical-specifications-rsd)
4. [API Reference](#part-4-api-reference)
5. [Appendix](#appendix)

---

# Part 1: High-Level Architecture & Actors

## 👥 Actors (User Roles)

| Actor | Role Code | Description | Capabilities |
|-------|-----------|-------------|--------------|
| **Admin** | `admin` | Full system access | CRUD all entities, view financials, manage users |
| **Staff** | `staff` | Limited operational access | CRUD products/categories, view dashboard (no financials) |
| **System (AI)** | N/A | Automated background processes | Stock prediction, Natural Language Query parsing |

---

## 🧩 Core Modules (Backend Routers)

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (React)"]
        LP[LoginPage]
        DP[DashboardPage]
        PP[ProductsPage]
        CP[CategoriesPage]
        UP[UsersPage]
    end

    subgraph API["⚡ API Layer (FastAPI)"]
        AUTH[auth.py]
        USERS[users.py]
        PRODUCTS[products.py]
        CATEGORIES[categories.py]
        DASHBOARD[dashboard.py]
        ANALYTICS[analytics.py]
        SEARCH[search.py]
    end

    subgraph Services["🤖 AI/Business Services"]
        LLM[llm_search.py<br/>Gemini AI NLP]
        PRED[prediction.py<br/>Stock Forecasting]
    end

    subgraph Data["💾 Data Layer"]
        PG[(PostgreSQL)]
        RD[(Redis Cache)]
    end

    LP --> AUTH
    DP --> DASHBOARD
    DP --> ANALYTICS
    PP --> PRODUCTS
    PP --> SEARCH
    CP --> CATEGORIES
    UP --> USERS

    SEARCH --> LLM
    ANALYTICS --> PRED

    AUTH --> PG
    PRODUCTS --> PG
    PRODUCTS --> RD
    DASHBOARD --> RD
```

---

## 📦 Module Breakdown

### 1. Authentication Module (`auth.py`)
- **Endpoints:** `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
- **Features:** JWT with HttpOnly cookies, Token refresh, Role-based access
- **Data:** `User` model (email, password, role, is_active)

### 2. User Management Module (`users.py`)
- **Endpoints:** CRUD on `/api/users`
- **Access:** Admin only
- **Features:** Create staff accounts, deactivate users

### 3. Inventory Module (`products.py`, `categories.py`)
- **Endpoints:** CRUD on `/api/products`, `/api/categories`
- **Features:** 
  - Product management (SKU, name, quantity, price, reorder_level)
  - Category hierarchy
  - Quantity adjustments with audit trail

### 4. Dashboard Module (`dashboard.py`)
- **Endpoints:** `/api/dashboard/stats`, `/api/dashboard/low-stock`, `/api/dashboard/category-value`
- **Features:**
  - Aggregated statistics (total products, categories, inventory value)
  - Low stock alerts
  - Category distribution charts

### 5. Analytics Module (`analytics.py`)
- **Endpoints:** `/api/analytics/forecast`, `/api/analytics/summary`
- **Features:**
  - AI-powered stock forecasting (days until stockout)
  - Reorder recommendations with urgency levels (Critical/Warning/OK)

### 6. AI Search Module (`search.py` + `llm_search.py`)
- **Endpoints:** `/api/search`
- **Features:**
  - Natural Language Query → Structured Filters (via Gemini AI)
  - Regex fallback when AI unavailable
  - Example: "show me electronics under $50 low stock" → `{category: "electronics", price_max: 50, stock_status: "low"}`

---

## 🔧 Infrastructure Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Cache | Redis (Upstash) | Rate limiting, Query caching |
| Rate Limiter | SlowAPI | 100 req/min per user |
| Database | PostgreSQL | Primary data store |
| AI Provider | Google Gemini | NLP query parsing, Forecast generation |

---

# Part 2: User Stories & Acceptance Criteria

## 📋 User Stories by Module

---

## 1. Authentication Module

### US-1.1: User Login
**As a** Staff or Admin user  
**I want to** log in with my email and password  
**So that** I can access the inventory dashboard securely

**Acceptance Criteria:**
```gherkin
Feature: User Authentication
  Scenario: Successful login
    Given I am on the login page
    When I enter valid email "admin@test.com" and password
    And I click the "Sign In" button
    Then I should be redirected to the Dashboard
    And I should see my name in the header

  Scenario: Invalid credentials
    Given I am on the login page
    When I enter invalid credentials
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  Scenario: Token refresh
    Given I am logged in with an expired access token
    When I make any API request
    Then the system should automatically refresh my token
    And the request should succeed without re-login
```

### US-1.2: Secure Logout
**As a** logged-in user  
**I want to** log out securely  
**So that** my session is terminated and tokens are invalidated

---

## 2. User Management Module (Admin Only)

### US-2.1: Create Staff Account
**As an** Admin  
**I want to** create new staff accounts  
**So that** I can onboard new team members

**Acceptance Criteria:**
```gherkin
Feature: User Management
  Scenario: Admin creates staff account
    Given I am logged in as Admin
    When I navigate to "Personnel" page
    And I click "Add User"
    And I fill in email, name, password, and role "Staff"
    Then the new user should appear in the users list
    And they should be able to log in

  Scenario: Staff cannot access user management
    Given I am logged in as Staff
    Then I should NOT see the "Personnel" menu item
    And direct navigation to /users should redirect to Dashboard
```

### US-2.2: Deactivate User
**As an** Admin  
**I want to** deactivate a user account  
**So that** they can no longer access the system

---

## 3. Inventory Module

### US-3.1: View Products List
**As a** Staff or Admin  
**I want to** view a paginated list of all products  
**So that** I can browse and find inventory items

**Acceptance Criteria:**
```gherkin
Feature: Products List
  Scenario: View products with pagination
    Given I am on the Products page
    Then I should see a table with columns: SKU, Name, Category, Quantity, Price, Status
    And I should see pagination controls
    When I click "Next Page"
    Then I should see the next set of products

  Scenario: Filter by category
    Given I am on the Products page
    When I select "Electronics" from the category filter
    Then I should only see products in the Electronics category
```

### US-3.2: Add New Product
**As a** Staff or Admin  
**I want to** add a new product to inventory  
**So that** I can track new stock items

### US-3.3: Edit Product
**As a** Staff or Admin  
**I want to** edit product details (name, price, category)  
**So that** I can keep product information accurate

### US-3.4: Adjust Quantity
**As a** Staff or Admin  
**I want to** adjust product quantity  
**So that** I can record stock additions or removals

**Acceptance Criteria:**
```gherkin
Feature: Quantity Adjustment
  Scenario: Increase stock quantity
    Given Product "Wireless Mouse" has quantity 10
    When I adjust quantity by +50
    Then the quantity should be 60
    And the low stock warning should disappear if applicable

  Scenario: Decrease stock quantity
    Given Product "USB-C Hub" has quantity 20
    When I adjust quantity by -15
    Then the quantity should be 5
    And if below threshold, low stock warning should appear
```

### US-3.5: Delete Product
**As a** Staff or Admin  
**I want to** delete a product  
**So that** I can remove discontinued items

---

## 4. Categories Module

### US-4.1: Manage Categories
**As a** Staff or Admin  
**I want to** create, edit, and delete categories  
**So that** I can organize products logically

---

## 5. Dashboard Module

### US-5.1: View Dashboard Statistics
**As a** Staff or Admin  
**I want to** see high-level inventory statistics  
**So that** I can quickly assess inventory health

**Acceptance Criteria:**
```gherkin
Feature: Dashboard Statistics
  Scenario: Staff user views dashboard
    Given I am logged in as Staff
    When I navigate to the Dashboard
    Then I should see:
      | Metric           | Visible |
      | Total Products   | Yes     |
      | Total Categories | Yes     |
      | Low Stock Alerts | Yes     |
      | Inventory Value  | NO      |

  Scenario: Admin user views dashboard
    Given I am logged in as Admin
    When I navigate to the Dashboard
    Then I should see:
      | Metric           | Visible |
      | Total Products   | Yes     |
      | Total Categories | Yes     |
      | Low Stock Alerts | Yes     |
      | Inventory Value  | YES     |
```

### US-5.2: View Low Stock Alerts
**As a** Staff or Admin  
**I want to** see products that are below their reorder threshold  
**So that** I can prioritize restocking

### US-5.3: View Category Distribution Chart
**As a** Staff or Admin  
**I want to** see a pie chart of inventory by category  
**So that** I can understand inventory composition

---

## 6. Analytics Module (AI-Powered)

### US-6.1: View Stock Forecasts
**As a** Staff or Admin  
**I want to** see AI-predicted days until stockout for each product  
**So that** I can proactively reorder inventory

**Acceptance Criteria:**
```gherkin
Feature: AI Stock Forecasting
  Scenario: View forecast list sorted by urgency
    Given I am on the Dashboard
    When I view the "AI Reorder Alerts" widget
    Then I should see products sorted by urgency (Critical first)
    And each product should show:
      | Field               | Example           |
      | Product Name        | Wireless Mouse    |
      | SKU                 | ELEC-001          |
      | Days Until Stockout | 3 days            |
      | Urgency             | Critical/Warning/OK |

  Scenario: Urgency calculation
    Given a product with:
      | Current Quantity | 10           |
      | Avg Daily Sales  | 5            |
    Then Days Until Stockout = 10 / 5 = 2 days
    And Urgency should be "Critical" (< 7 days)

  Scenario: No sales history
    Given a product with no sales history
    Then Avg Daily Sales should be 0
    And Days Until Stockout should be "N/A"
    And Urgency should be "OK"
```

### US-6.2: Filter Forecasts by Urgency
**As a** Staff or Admin  
**I want to** filter the forecast list by urgency level  
**So that** I can focus on critical items only

---

## 7. AI Search Module (Critical Feature)

### US-7.1: Natural Language Product Search
**As a** Staff or Admin  
**I want to** search products using natural language  
**So that** I can find items without knowing exact filter syntax

**Acceptance Criteria:**
```gherkin
Feature: AI-Powered Natural Language Search
  Scenario Outline: Parse natural language queries
    Given I am on the Products page
    When I type "<query>" in the search bar
    Then the system should parse it as:
      | Category | Min Price | Max Price | Low Stock | Sort |
      | <cat>    | <min>     | <max>     | <low>     | <sort> |
    And I should see matching products

    Examples:
      | query                          | cat         | min  | max | low   | sort       |
      | show me electronics under $50  | electronics | null | 50  | false | null       |
      | cheap office supplies          | office      | null | 20  | false | price asc  |
      | low stock items                | null        | null | null| true  | null       |
      | expensive furniture            | furniture   | 100  | null| false | price desc |

  Scenario: AI fallback to regex
    Given the Gemini API is unavailable
    When I search for "electronics"
    Then the system should use regex fallback
    And I should still see relevant products
    And the response should indicate parse_method: "regex"

  Scenario: Rate limiting
    Given I have made 30 AI search requests in 1 minute
    When I make another AI search request
    Then I should receive a 429 Too Many Requests error
    And I should see a message to wait before retrying
```

---

## 📊 User Stories Summary

| Module | User Stories | Critical AC |
|--------|--------------|-------------|
| Authentication | 2 | Token refresh, Secure logout |
| User Management | 2 | Role-based access control |
| Inventory | 5 | CRUD, Quantity adjustment |
| Categories | 1 | CRUD |
| Dashboard | 3 | Role-based metric visibility |
| Analytics (AI) | 2 | Urgency calculation, Forecast accuracy |
| AI Search | 1 | NLP parsing, Regex fallback, Rate limiting |

**Total: 16 User Stories**

---

# Part 3: Technical Specifications (RSD)

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

# Part 4: API Reference

## 4.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns access token |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Clear refresh cookie |
| GET | `/api/auth/me` | Get current user |

## 4.2 Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| GET | `/api/users/{id}` | Get user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

## 4.3 Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List (paginated, filterable) |
| POST | `/api/products` | Create product |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| PATCH | `/api/products/{id}/quantity` | Adjust quantity |

## 4.4 Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all |
| POST | `/api/categories` | Create |
| PUT | `/api/categories/{id}` | Update |
| DELETE | `/api/categories/{id}` | Delete |

## 4.5 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregate statistics |
| GET | `/api/dashboard/low-stock` | Low stock products |
| GET | `/api/dashboard/category-value` | Category distribution |

## 4.6 Analytics (AI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/forecast` | Stock forecasts |
| GET | `/api/analytics/summary` | Inventory health summary |

## 4.7 Search (AI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search/smart` | Natural language search |
| GET | `/api/search/products?q=` | Simple text search |

---

# Appendix

## A. Data Models

### User
```
id: int (PK)
email: str (unique, indexed)
hashed_password: str
full_name: str
role: enum (admin, staff)
is_active: bool
created_at: datetime
```

### Product
```
id: int (PK)
sku: str (unique)
name: str
description: str
quantity: int
unit_price: decimal
low_stock_threshold: int
category_id: int (FK)
created_at: datetime
updated_at: datetime
```

### Category
```
id: int (PK)
name: str (unique)
description: str
```

### SalesOrder
```
id: int (PK)
product_id: int (FK)
quantity: int
order_date: datetime
```

## B. Glossary

| Term | Definition |
|------|------------|
| SKU | Stock Keeping Unit - unique product identifier |
| Low Stock | Quantity ≤ threshold |
| Stockout | Days until quantity reaches 0 |
| Urgency | Critical (< 7d), Warning (< 14d), OK (≥ 14d) |

## C. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-05 | Initial release - Complete PRD |

---

**Document Status:** ✅ Complete  
**Source of Truth:** This document serves as the master reference for all product, technical, and business requirements.

---
*Generated by AI Product Analyst • Last Updated: January 5, 2026*
