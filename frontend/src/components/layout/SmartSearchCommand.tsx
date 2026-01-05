import { useState, useEffect, useCallback } from 'react';
import {
    Package,
    LayoutDashboard,
    Users,
    LogOut,
    Moon,
    Sun,
    PlusCircle,
    Sparkles,
    Loader2,
    Brain
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import apiClient from '@/api/client';
import { Product } from '@/types';

interface SmartSearchResult {
    results: Product[];
    total: number;
    parsed_query: {
        name_contains: string | null;
        category_contains: string | null;
        min_price: number | null;
        max_price: number | null;
        low_stock: boolean;
        sort_by: string | null;
        sort_order: string;
    };
    parse_method: string;
}

export function SmartSearchCommand() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [aiResults, setAiResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [parseMethod, setParseMethod] = useState<string | null>(null);
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

    // Debounced AI search
    const performAISearch = useCallback(async (query: string) => {
        if (query.length < 3) {
            setAiResults([]);
            setParseMethod(null);
            return;
        }

        setIsSearching(true);
        try {
            const response = await apiClient.post<SmartSearchResult>('/search/smart', {
                query: query.trim()
            });
            setAiResults(response.data.results);
            setParseMethod(response.data.parse_method);
        } catch (error) {
            console.error('Smart search failed:', error);
            setAiResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                performAISearch(searchQuery);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, performAISearch]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        setSearchQuery('');
        setAiResults([]);
        command();
    };

    const handleInputChange = (value: string) => {
        setSearchQuery(value);
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="flex items-center border-b px-3 gap-2">
                {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                    <Brain className="h-4 w-4 text-primary" />
                )}
                <input
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ask AI: 'Show me cheap electronics' or 'low stock items'..."
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
                {parseMethod && (
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-primary/10 flex-shrink-0">
                        {parseMethod === 'ai' ? '🧠 AI' : '🔍 Regex'}
                    </span>
                )}
            </div>
            <CommandList>
                {/* AI Search Results */}
                {aiResults.length > 0 && (
                    <>
                        <CommandGroup heading={`AI Results (${aiResults.length})`}>
                            {aiResults.map(product => (
                                <CommandItem
                                    key={product.id}
                                    onSelect={() => runCommand(() => navigate(`/products?id=${product.id}`))}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-purple-400" />
                                        <div>
                                            <span className="font-medium">{product.name}</span>
                                            <span className="ml-2 text-xs text-muted-foreground font-mono">{product.sku}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className={product.is_low_stock ? 'text-red-400' : 'text-green-400'}>
                                            {product.quantity} units
                                        </span>
                                        <span className="text-muted-foreground">
                                            ${product.unit_price}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {searchQuery.length > 0 && aiResults.length === 0 && !isSearching && (
                    <CommandEmpty>No products match your query.</CommandEmpty>
                )}

                {!searchQuery && (
                    <>
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

                        <CommandGroup heading="AI Search Examples">
                            <CommandItem onSelect={() => handleInputChange('low stock items')}>
                                <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                                <span className="text-muted-foreground">"low stock items"</span>
                            </CommandItem>
                            <CommandItem onSelect={() => handleInputChange('cheap electronics')}>
                                <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                                <span className="text-muted-foreground">"cheap electronics"</span>
                            </CommandItem>
                            <CommandItem onSelect={() => handleInputChange('products under $50')}>
                                <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                                <span className="text-muted-foreground">"products under $50"</span>
                            </CommandItem>
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
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
