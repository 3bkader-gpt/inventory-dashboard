import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { UsersPage } from '@/pages/UsersPage';

function App() {
    const { checkAuth, isAuthenticated, user } = useAuthStore();
    const { theme } = useUIStore();

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Apply theme class on mount
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Admin-only route wrapper
    const AdminRoute = ({ children }: { children: React.ReactNode }) => {
        if (user?.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
        return <>{children}</>;
    };

    return (
        <Routes>
            {/* Public route */}
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                }
            />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route
                    path="/categories"
                    element={
                        <AdminRoute>
                            <CategoriesPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <AdminRoute>
                            <UsersPage />
                        </AdminRoute>
                    }
                />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
