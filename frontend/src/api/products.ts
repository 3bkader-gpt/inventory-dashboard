import { toast } from 'sonner';
import apiClient from './client';
import type {
    Product,
    ProductCreateInput,
    ProductFilters,
    ProductListResponse,
    ProductUpdateInput
} from '@/types';

/**
 * Products API calls.
 */
export const productsApi = {
    /**
     * Get paginated product list with filters.
     */
    async list(filters: Partial<ProductFilters> = {}): Promise<ProductListResponse> {
        const params: Record<string, unknown> = {
            page: filters.page ?? 1,
            page_size: filters.page_size ?? 20,
        };

        if (filters.search) params.search = filters.search;
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.low_stock_only) params.low_stock_only = true;

        const response = await apiClient.get<ProductListResponse>('/products', { params });
        return response.data;
    },

    /**
     * Get a single product by ID.
     */
    async get(id: number): Promise<Product> {
        const response = await apiClient.get<Product>(`/products/${id}`);
        return response.data;
    },

    /**
     * Create a new product.
     */
    async create(data: ProductCreateInput): Promise<Product> {
        const response = await apiClient.post<Product>('/products', data);
        toast.success('Product created successfully');
        return response.data;
    },

    /**
     * Update a product (all fields).
     */
    async update(id: number, data: ProductUpdateInput): Promise<Product> {
        const response = await apiClient.put<Product>(`/products/${id}`, data);
        toast.success('Product updated successfully');
        return response.data;
    },

    /**
     * Update only the quantity (Staff allowed).
     */
    async updateQuantity(id: number, quantity: number): Promise<Product> {
        const response = await apiClient.patch<Product>(`/products/${id}/quantity`, { quantity });
        toast.success('Stock quantity updated');
        return response.data;
    },

    /**
     * Delete a product.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/products/${id}`);
        toast.success('Product deleted');
    },

    /**
     * Export products as CSV.
     */
    async exportCsv(): Promise<Blob> {
        const response = await apiClient.get('/products/export/csv', {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Import products from CSV.
     */
    async importCsv(file: File): Promise<{ created: number; updated: number; errors: string[] }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/products/import/csv', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`Import complete: ${response.data.created} created, ${response.data.updated} updated`);
        return response.data;
    },

    /**
     * AI-powered natural language search.
     * Example queries: "show me cheap electronics", "low stock items", "products under $50"
     */
    async smartSearch(query: string): Promise<{
        results: Product[];
        total: number;
        parsed_query: Record<string, unknown>;
        parse_method: string;
    }> {
        const response = await apiClient.post('/search/smart', { query });
        return response.data;
    },
};
