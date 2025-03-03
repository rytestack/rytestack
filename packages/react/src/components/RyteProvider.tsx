/**
 * @fileoverview RyteProvider component
 *
 * Main provider component that wraps the application with all necessary context providers.
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

export interface RyteProviderProps {
    /**
     * Router type (browser or memory)
     */
    routerType?: 'browser' | 'memory';

    /**
     * Router instance (for memory router)
     */
    router?: any;

    /**
     * QueryClient instance
     */
    queryClient?: QueryClient;

    /**
     * Application children
     */
    children: React.ReactNode;
}

/**
 * Main provider component for Rytestack React applications
 *
 * Wraps the application with all necessary context providers:
 * - QueryClientProvider for TanStack Query
 * - Router provider for navigation
 * - HelmetProvider for SEO
 *
 * @example
 * ```tsx
 * <RyteProvider>
 *   <App />
 * </RyteProvider>
 * ```
 */
export function RyteProvider({
                                 routerType = 'browser',
                                 router,
                                 queryClient = new QueryClient(),
                                 children
                             }: RyteProviderProps) {
    // Wrap with all required providers
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                {routerType === 'browser' ? (
                    <BrowserRouter>{children}</BrowserRouter>
                ) : (
                    <RouterProvider router={router} />
                )}
            </QueryClientProvider>
        </HelmetProvider>
    );
}