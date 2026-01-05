import { z } from 'zod';

export const productSchema = z.object({
    sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be less than 50 characters'),
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    category_id: z.number().nullable().optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
    unit_price: z.coerce.number().min(0, 'Price cannot be negative'),
    low_stock_threshold: z.coerce.number().min(0, 'Threshold cannot be negative'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
