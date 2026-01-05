import { create } from 'zustand';
import { productsApi } from '@/api/products';
import type { Product, ProductFilters, ProductListResponse } from '@/types';

interface ProductState {
    products: Product[];
    total: number;
    totalPages: number;
    filters: ProductFilters;
    isLoading: boolean;
    error: string | null;
    selectedProduct: Product | null;
    currentRequest: AbortController | null;

    // Actions
    fetchProducts: () => Promise<void>;
    setFilters: (filters: Partial<ProductFilters>) => void;
    resetFilters: () => void;
    setSelectedProduct: (product: Product | null) => void;
    deleteProduct: (id: number) => Promise<boolean>;
    updateQuantity: (id: number, quantity: number) => Promise<boolean>;
}

const defaultFilters: ProductFilters = {
    page: 1,
    page_size: 20,
    search: '',
    category_id: null,
    low_stock_only: false,
};

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    total: 0,
    totalPages: 1,
    filters: { ...defaultFilters },
    isLoading: false,
    error: null,
    selectedProduct: null,
    currentRequest: null,

    fetchProducts: async () => {
        // Cancel previous request if exists
        if (get().currentRequest) {
            get().currentRequest?.abort();
        }

        const controller = new AbortController();
        set({ isLoading: true, error: null, currentRequest: controller });

        try {
            // Note: Assuming API supports signal, otherwise this is just client-side tracking
            const response: ProductListResponse = await productsApi.list(get().filters);
            set({
                products: response.items,
                total: response.total,
                totalPages: response.total_pages,
                isLoading: false,
                currentRequest: null,
            });
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') return;
            const message = error instanceof Error ? error.message : 'Failed to fetch products';
            set({ error: message, isLoading: false, currentRequest: null });
        }
    },

    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters, page: filters.page ?? 1 },
        }));
        // Auto-fetch after filter change
        get().fetchProducts();
    },

    resetFilters: () => {
        set({ filters: { ...defaultFilters } });
        get().fetchProducts();
    },

    setSelectedProduct: (product) => set({ selectedProduct: product }),

    deleteProduct: async (id) => {
        try {
            await productsApi.delete(id);
            // Refresh list
            await get().fetchProducts();
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete product';
            set({ error: message });
            return false;
        }
    },

    updateQuantity: async (id, quantity) => {
        try {
            const updated = await productsApi.updateQuantity(id, quantity);
            // Update in local state
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updated : p)),
            }));
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update quantity';
            set({ error: message });
            return false;
        }
    },
}));
