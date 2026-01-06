import { useEffect, useState } from 'react';
import { Plus, Search, Download, Upload, Trash2, Edit, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Category, Product } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { productSchema, type ProductFormValues } from '@/schemas/productSchema';

export function ProductsPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const {
        products,
        total,
        totalPages,
        filters,
        isLoading,
        fetchProducts,
        setFilters,
        deleteProduct,
        updateQuantity,
    } = useProductStore();

    const [categories, setCategories] = useState<Category[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [quantityEdit, setQuantityEdit] = useState<{ id: number; value: number } | null>(null);

    // AI Search state
    const [aiSearchMode, setAiSearchMode] = useState(false);
    const [aiSearchResults, setAiSearchResults] = useState<Product[] | null>(null);
    const [aiParseMethod, setAiParseMethod] = useState<string | null>(null);
    const [isAiSearching, setIsAiSearching] = useState(false);

    // Debounce search state
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            sku: '',
            name: '',
            description: '',
            quantity: 0,
            unit_price: 0,
            low_stock_threshold: 10,
            category_id: undefined,
        },
    });

    // Update filters when debounced search term changes
    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            setFilters({ search: debouncedSearch });
        }
    }, [debouncedSearch]);

    // Sync local state if filters change externally
    useEffect(() => {
        if (filters.search !== undefined && filters.search !== searchTerm) {
            setSearchTerm(filters.search);
        }
    }, [filters.search]);

    useEffect(() => {
        fetchProducts();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoriesApi.list();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    // AI-powered natural language search
    const handleAiSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsAiSearching(true);
        try {
            const result = await productsApi.smartSearch(searchTerm);
            setAiSearchResults(result.results);
            setAiParseMethod(result.parse_method);
        } catch (error) {
            console.error('AI Search failed:', error);
            setAiSearchResults([]);
            setAiParseMethod('error');
        } finally {
            setIsAiSearching(false);
        }
    };

    // Clear AI search results
    const clearAiSearch = () => {
        setAiSearchResults(null);
        setAiParseMethod(null);
        setSearchTerm('');
    };

    const handleOpenForm = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            form.reset({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                quantity: product.quantity,
                unit_price: product.unit_price,
                low_stock_threshold: product.low_stock_threshold,
                category_id: product.category_id || undefined,
            });
        } else {
            setEditingProduct(null);
            form.reset({
                sku: '',
                name: '',
                description: '',
                quantity: 0,
                unit_price: 0,
                low_stock_threshold: 10,
                category_id: undefined,
            });
        }
        setIsFormOpen(true);
    };

    const onSubmit = async (data: ProductFormValues) => {
        try {
            // Transform undefined category_id to null for API, and ensure description is undefined if null/empty
            const apiData = {
                ...data,
                category_id: data.category_id ?? null,
                description: data.description || undefined,
            };

            if (editingProduct) {
                await productsApi.update(editingProduct.id, apiData);
            } else {
                await productsApi.create(apiData);
            }
            setIsFormOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    const handleQuantityUpdate = async () => {
        if (quantityEdit) {
            await updateQuantity(quantityEdit.id, quantityEdit.value);
            setQuantityEdit(null);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await productsApi.exportCsv();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const result = await productsApi.importCsv(file);
                alert(`Imported: ${result.created} created, ${result.updated} updated`);
                fetchProducts();
            } catch (error) {
                console.error('Import failed:', error);
            }
        }
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Products</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    {isAdmin && (
                        <>
                            <Button variant="outline" asChild>
                                <label>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleImport}
                                    />
                                </label>
                            </Button>
                            <Button onClick={() => handleOpenForm()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters + AI Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        {/* AI Search Bar */}
                        <div className="flex-1">
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder={aiSearchMode ? 'Try: "show me cheap electronics" or "low stock items"' : 'Search by name or SKU...'}
                                        className={cn("pl-10", aiSearchMode && "border-primary/50 bg-primary/5")}
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (aiSearchResults) clearAiSearch();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && aiSearchMode) {
                                                handleAiSearch();
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    variant={aiSearchMode ? 'default' : 'outline'}
                                    onClick={() => {
                                        setAiSearchMode(!aiSearchMode);
                                        if (aiSearchResults) clearAiSearch();
                                    }}
                                    className="gap-2"
                                >
                                    ✨ AI
                                </Button>
                                {aiSearchMode && (
                                    <Button
                                        onClick={handleAiSearch}
                                        disabled={isAiSearching || !searchTerm.trim()}
                                    >
                                        {isAiSearching ? 'Searching...' : 'Search'}
                                    </Button>
                                )}
                            </div>
                            {/* AI Search Results Indicator */}
                            {aiSearchResults && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        aiParseMethod === 'ai' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                            aiParseMethod === 'regex' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    )}>
                                        {aiParseMethod === 'ai' ? '🤖 AI Parsed' : aiParseMethod === 'regex' ? '📝 Regex Fallback' : '❌ Error'}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Found {aiSearchResults.length} products
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={clearAiSearch} className="h-6 px-2 text-xs">
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Select
                            value={filters.category_id?.toString() || 'all'}
                            onValueChange={(value) =>
                                setFilters({ category_id: value === 'all' ? null : Number(value) })
                            }
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant={filters.low_stock_only ? 'default' : 'outline'}
                            onClick={() => setFilters({ low_stock_only: !filters.low_stock_only })}
                        >
                            Low Stock Only
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Products ({total})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading || isAiSearching ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : (aiSearchResults ? aiSearchResults : products).length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            {aiSearchResults ? 'No products match your search' : 'No products found'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="text-left text-sm text-muted-foreground">
                                        <th className="pb-3 px-4 font-medium">Image</th>
                                        <th className="pb-3 px-4 font-medium">SKU</th>
                                        <th className="pb-3 px-4 font-medium">Name</th>
                                        <th className="pb-3 px-4 font-medium">Category</th>
                                        <th className="pb-3 px-4 font-medium text-right">Quantity</th>
                                        {isAdmin && <th className="pb-3 px-4 font-medium text-right">Unit Price</th>}
                                        {isAdmin && <th className="pb-3 px-4 font-medium text-right">Total Value</th>}
                                        <th className="pb-3 px-4 font-medium">Updated</th>
                                        <th className="pb-3 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-4">
                                    {(aiSearchResults ?? products).map((product) => (
                                        <tr
                                            key={product.id}
                                            className="group bg-card hover:bg-accent/50 transition-all duration-300 border border-border hover:border-primary/20 shadow-sm hover:shadow-md rounded-xl"
                                        >
                                            <td className="py-2 px-4 rounded-l-xl border-y border-l border-transparent group-hover:border-primary/10 transition-colors">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden glass-panel border border-white/10">
                                                    <img
                                                        src={`https://picsum.photos/seed/${product.id}/200/200`}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-mono text-sm border-y border-transparent group-hover:border-primary/10 transition-colors text-foreground">
                                                {product.sku}
                                            </td>
                                            <td className="py-4 px-4 border-y border-transparent group-hover:border-primary/10 transition-colors">
                                                <div>
                                                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</div>
                                                    {product.description && (
                                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 border-y border-transparent group-hover:border-primary/10 transition-colors">
                                                {product.category?.name ? (
                                                    <span className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground border border-border">
                                                        {product.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right border-y border-transparent group-hover:border-primary/10 transition-colors">
                                                {quantityEdit?.id === product.id ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            className="w-20 text-right h-8"
                                                            value={quantityEdit.value}
                                                            onChange={(e) =>
                                                                setQuantityEdit({
                                                                    id: product.id,
                                                                    value: parseInt(e.target.value) || 0,
                                                                })
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleQuantityUpdate();
                                                                if (e.key === 'Escape') setQuantityEdit(null);
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button size="sm" onClick={handleQuantityUpdate} className="h-8">
                                                            Save
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className={cn(
                                                            'rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 border',
                                                            product.is_low_stock
                                                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        )}
                                                        onClick={() =>
                                                            setQuantityEdit({ id: product.id, value: product.quantity })
                                                        }
                                                    >
                                                        {product.quantity} units
                                                    </button>
                                                )}
                                            </td>
                                            {isAdmin && (
                                                <td className="py-4 px-4 text-right border-y border-transparent group-hover:border-primary/10 transition-colors text-foreground">
                                                    {formatCurrency(product.unit_price)}
                                                </td>
                                            )}
                                            {isAdmin && (
                                                <td className="py-4 px-4 text-right font-medium text-foreground border-y border-transparent group-hover:border-primary/10 transition-colors">
                                                    {formatCurrency(product.total_value)}
                                                </td>
                                            )}
                                            <td className="py-4 px-4 text-sm text-muted-foreground border-y border-transparent group-hover:border-primary/10 transition-colors">
                                                {formatDate(product.updated_at)}
                                            </td>
                                            <td className="py-4 px-4 text-right rounded-r-xl border-y border-r border-transparent group-hover:border-primary/10 transition-colors">
                                                <div className="flex justify-end gap-1">
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="hover:bg-primary/10 hover:text-primary"
                                                                onClick={() => handleOpenForm(product)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => handleDelete(product.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {filters.page} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={filters.page <= 1}
                                    onClick={() => setFilters({ page: filters.page - 1 })}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={filters.page >= totalPages}
                                    onClick={() => setFilters({ page: filters.page + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Product Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct
                                ? 'Update the product details below.'
                                : 'Fill in the details to create a new product.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value === 'none' ? undefined : Number(value))}
                                                defaultValue={field.value?.toString() || 'none'}
                                                value={field.value?.toString() || 'none'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unit_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="low_stock_threshold"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Low Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
