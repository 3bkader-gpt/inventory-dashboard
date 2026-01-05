import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function ProtectedLayout() {
    const { isAuthenticated, isLoading } = useAuthStore();
    const { sidebarOpen } = useUIStore();

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />
            <main
                className={cn(
                    'min-h-screen pt-24 transition-all duration-300',
                    sidebarOpen ? 'pl-[18rem]' : 'pl-[7rem]'
                )}
            >
                <div className="container mx-auto p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
