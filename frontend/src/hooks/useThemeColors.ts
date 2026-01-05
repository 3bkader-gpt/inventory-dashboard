import { useTheme } from '@/context/ThemeContext';
import { useMemo, useSyncExternalStore } from 'react';

// Subscribe to system preference changes
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function subscribeSystemTheme(callback: () => void) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
}

export function useThemeColors() {
    const { theme } = useTheme();

    // This will cause re-render when system preference changes
    const systemIsDark = useSyncExternalStore(
        subscribeSystemTheme,
        getSystemTheme,
        () => false // SSR fallback
    );

    const isDark = theme === 'dark' || (theme === 'system' && systemIsDark);

    return useMemo(() => ({
        // Premium Light Mode uses hsl(210, ...) warm blue-grays
        primary: isDark ? '#0ef' : '#0080ff',      // Cyan : Vibrant Blue
        secondary: isDark ? '#a855f7' : '#3b82f6', // Purple : Blue
        gridStroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        textColor: isDark ? '#e2e8f0' : '#1e3a5f', // Slate-200 : Dark Blue-Gray (hsl 210 40% 12%)
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    }), [isDark]);
}
