import { useState, useEffect } from 'react';
import {
    Search,
    Package,
    LayoutDashboard,
    Users,
    LogOut,
    Moon,
    Sun,
    PlusCircle
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { productsApi } from '@/api/products';
import { Product } from '@/types';

export function SearchCommand() {
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const { theme, setTheme } = useUIStore();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Prefetch products for search (optimized for fewer products, real app would search API on type)
    useEffect(() => {
        if (open) {
            productsApi.list({ page_size: 100 }).then(data => setProducts(data.items));
        }
    }, [open]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search products..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => navigate('/products'))}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>Manage Products</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => runCommand(() => navigate('/products?action=create'))}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Add New Product</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}>
                        {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                        <span>Toggle Theme</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Products">
                    {products.slice(0, 5).map(product => (
                        <CommandItem key={product.id} onSelect={() => runCommand(() => navigate(`/products?id=${product.id}`))}>
                            <Search className="mr-2 h-4 w-4" />
                            <span>{product.name}</span>
                            <span className="ml-2 text-muted-foreground text-xs font-mono">{product.sku}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runCommand(() => navigate('/users'))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>User Management</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => logout())}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
