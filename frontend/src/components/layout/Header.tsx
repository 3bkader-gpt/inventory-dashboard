import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export function Header() {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme, sidebarOpen } = useUIStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header
            className="fixed right-6 top-6 z-30 flex h-16 items-center justify-between rounded-xl glass-panel border border-white/10 px-6 backdrop-blur transition-all duration-300"
            style={{ left: sidebarOpen ? '18rem' : '7rem' }}
        >
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">Inventory Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>

                {/* User info */}
                <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user?.full_name}</span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        {user?.role}
                    </span>
                </div>

                {/* Logout */}
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
