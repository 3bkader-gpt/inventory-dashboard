import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Users,
    ChevronLeft,
    Box,
    Hexagon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';

const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/products', label: 'Inventory', icon: Package },
    { to: '/categories', label: 'Categories', icon: FolderTree, adminOnly: true },
    { to: '/users', label: 'Personnel', icon: Users, adminOnly: true },
];

export function Sidebar() {
    const { user } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const isAdmin = user?.role === 'admin';

    const filteredItems = navItems.filter(
        (item) => !item.adminOnly || isAdmin
    );

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarOpen ? 256 : 80 }}
            className={cn(
                'fixed left-4 top-4 bottom-4 z-40 rounded-2xl glass-panel border border-white/10 flex flex-col overflow-hidden transition-all duration-300',
            )}
        >
            {/* Logo Area */}
            <div className="flex h-20 items-center justify-between px-5 mb-2 relative">
                {sidebarOpen ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <Hexagon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            ORBITAL
                        </span>
                    </motion.div>
                ) : (
                    <div className="mx-auto h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <Hexagon className="h-6 w-6 text-primary" />
                    </div>
                )}

                {sidebarOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="absolute right-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-full"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-3">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 group overflow-hidden',
                                isActive
                                    ? 'text-white'
                                    : 'text-muted-foreground hover:text-white hover:bg-white/5',
                                !sidebarOpen && 'justify-center px-2'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                                    </motion.div>
                                )}

                                <item.icon
                                    className={cn(
                                        "h-5 w-5 flex-shrink-0 z-10 transition-colors duration-200",
                                        isActive ? "text-primary filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "group-hover:text-primary/80"
                                    )}
                                />

                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="z-10 font-medium tracking-wide text-sm"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}

                                {!sidebarOpen && isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Mini - Dock Style */}
            <div className="p-4 mt-auto">
                <div className={cn(
                    "rounded-xl bg-white/5 border border-white/5 p-3 flex items-center gap-3 transition-all hover:bg-white/10 hover:border-white/10",
                    !sidebarOpen && "justify-center p-2"
                )}>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-white">{user?.full_name}</p>
                            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                    )}
                </div>
            </div>

            {!sidebarOpen && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white"
                    >
                        <Box className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </motion.aside>
    );
}
