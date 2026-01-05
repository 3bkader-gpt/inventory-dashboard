import { useEffect, useState } from 'react';
import { Plus, Search, Download, Upload, Trash2, Edit, Package } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Category, Product, ProductCreateInput } from '@/types';

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
    const [formData, setFormData] = useState<ProductCreateInput>({
        sku: '',
        name: '',
        description: '',
        quantity: 0,
        unit_price: 0,
        low_stock_threshold: 10,
        category_id: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantityEdit, setQuantityEdit] = useState<{ id: number; value: number } | null>(null);

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

    const handleOpenForm = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                quantity: product.quantity,
                unit_price: product.unit_price,
                low_stock_threshold: product.low_stock_threshold,
                category_id: product.category_id,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                sku: '',
                name: '',
                description: '',
                quantity: 0,
                unit_price: 0,
                low_stock_threshold: 10,
                category_id: null,
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingProduct) {
                await productsApi.update(editingProduct.id, formData);
            } else {
                await productsApi.create(formData);
            }
            setIsFormOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setIsSubmitting(false);
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

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or SKU..."
                                    className="pl-10"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ search: e.target.value })}
                                />
                            </div>
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
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            No products found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="text-left text-sm text-muted-foreground">
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
                                    {products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="group bg-black/20 hover:bg-black/40 transition-all duration-300 border border-white/5 hover:border-primary/20 shadow-sm hover:shadow-lg hover:shadow-primary/5 rounded-xl"
                                        >
                                            <td className="py-4 px-4 font-mono text-sm rounded-l-xl border-y border-l border-white/5 group-hover:border-primary/20 transition-colors">
                                                {product.sku}
                                            </td>
                                            <td className="py-4 px-4 border-y border-white/5 group-hover:border-primary/20 transition-colors">
                                                <div>
                                                    <div className="font-medium text-white group-hover:text-primary transition-colors">{product.name}</div>
                                                    {product.description && (
                                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 border-y border-white/5 group-hover:border-primary/20 transition-colors">
                                                {product.category?.name ? (
                                                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-muted-foreground border border-white/10">
                                                        {product.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right border-y border-white/5 group-hover:border-primary/20 transition-colors">
                                                {quantityEdit?.id === product.id ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            className="w-20 text-right h-8 bg-black/50"
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
                                                                ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20'
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
                                                <td className="py-4 px-4 text-right border-y border-white/5 group-hover:border-primary/20 transition-colors">
                                                    {formatCurrency(product.unit_price)}
                                                </td>
                                            )}
                                            {isAdmin && (
                                                <td className="py-4 px-4 text-right font-medium text-white border-y border-white/5 group-hover:border-primary/20 transition-colors">
                                                    {formatCurrency(product.total_value)}
                                                </td>
                                            )}
                                            <td className="py-4 px-4 text-sm text-muted-foreground border-y border-white/5 group-hover:border-primary/20 transition-colors">
                                                {formatDate(product.updated_at)}
                                            </td>
                                            <td className="py-4 px-4 text-right rounded-r-xl border-y border-r border-white/5 group-hover:border-primary/20 transition-colors">
                                                <div className="flex justify-end gap-1">
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="hover:bg-primary/20 hover:text-primary"
                                                                onClick={() => handleOpenForm(product)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="hover:bg-destructive/20 hover:text-destructive"
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category_id?.toString() || 'none'}
                                    onValueChange={(v) =>
                                        setFormData({
                                            ...formData,
                                            category_id: v === 'none' ? null : Number(v),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={0}
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Unit Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={formData.unit_price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            unit_price: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="threshold">Low Stock</Label>
                                <Input
                                    id="threshold"
                                    type="number"
                                    min={0}
                                    value={formData.low_stock_threshold}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            low_stock_threshold: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
