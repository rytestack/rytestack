/**
 * @fileoverview Router creation utility
 *
 * Creates routes for React Router from Rytestack routes.
 */
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Route } from '@rytestack/core';
import { RyteRouteObject } from './types';
import { ErrorBoundary } from '../components/ErrorBoundary';

/**
 * Options for creating a router
 */
export interface CreateRouterOptions {
    /**
     * Rytestack routes
     */
    routes: Route[];

    /**
     * Map of page components
     */
    pages: Record<string, any>;

    /**
     * Map of layout components
     */
    layouts: Record<string, any>;

    /**
     * Not found page component
     */
    notFoundPage?: React.ComponentType<any>;
}

/**
 * Default layout component
 */
function DefaultLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

/**
 * Default 404 page
 */
function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <p className="text-xl text-gray-600 mt-4">Page not found</p>

                href="/"
                className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                Go Home
            </a>
        </div>
</div>
);
}

/**
 * Creates routes for React Router from Rytestack routes
 *
 * @param options Router options
 * @returns React Router route objects
 */
export function createRouter({
                                 routes,
                                 pages,
                                 layouts,
                                 notFoundPage = NotFoundPage
                             }: CreateRouterOptions): RouteObject[] {
    // Create route hierarchy
    const routeMap: Record<string, RyteRouteObject> = {};

    // Process all routes
    routes.forEach(route => {
        // Get page component
        const component = pages[route.component];

        if (!component) {
            console.warn(`Component not found for route: ${route.path}`);
            return;
        }

        // Get layout component
        const layout = component.layout
            ? layouts[component.layout]
            : layouts.default || DefaultLayout;

        // Create a wrapped component with layout
        const WrappedComponent = (props: any) => {
            const Layout = layout;

            return (
                <ErrorBoundary>
                    <Layout>
                        {React.createElement(component, props)}
                    </Layout>
                </ErrorBoundary>
            );
        };

        // Create route object
        const routeObject: RyteRouteObject = {
            path: route.path,
            element: <WrappedComponent />,
            index: route.index,
            meta: route.meta
        };

        // Add to route map
        routeMap[route.path] = routeObject;
    });

    // Add 404 route
    const notFoundRoute: RyteRouteObject = {
        path: '*',
        element: React.createElement(notFoundPage)
    };

    // Convert to flat array of routes
    return [...Object.values(routeMap), notFoundRoute];
}