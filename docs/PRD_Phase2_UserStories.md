# Phase 2: Feature Breakdown & User Stories

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

## ✅ Phase 2 Summary

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

## ✅ Phase 2 Confirmation

**Please review and confirm:**
1. Are the User Stories complete for each module?
2. Are the Gherkin acceptance criteria clear?
3. Any missing scenarios or edge cases?

Once confirmed, proceed to **Phase 3: Technical Specifications (RSD)**.
