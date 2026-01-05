/**
 * Shared TypeScript types matching backend Pydantic schemas.
 */

export type UserRole = 'admin' | 'staff';

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    product_count: number;
}

export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    quantity: number;
    unit_price: number;
    low_stock_threshold: number;
    category_id: number | null;
    category: Category | null;
    is_low_stock: boolean;
    total_value: number;
    created_at: string;
    updated_at: string;
}

export interface ProductListResponse {
    items: Product[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface ProductFilters {
    page: number;
    page_size: number;
    search: string;
    category_id: number | null;
    low_stock_only: boolean;
}

export interface DashboardStats {
    total_products: number;
    total_categories: number;
    low_stock_count: number;
    total_inventory_value: number;
    total_quantity: number;
}

export interface LowStockItem {
    id: number;
    sku: string;
    name: string;
    quantity: number;
    low_stock_threshold: number;
    category_name: string | null;
}

export interface CategoryValue {
    category_id: number | null;
    category_name: string;
    product_count: number;
    total_quantity: number;
    total_value: number;
}

// Form types
export interface ProductCreateInput {
    sku: string;
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    low_stock_threshold: number;
    category_id?: number | null;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> { }

export interface UserCreateInput {
    email: string;
    full_name: string;
    password: string;
    role: UserRole;
}

export interface CategoryCreateInput {
    name: string;
    description?: string;
}
