/**
 * @fileoverview Server runtime for Rytestack
 *
 * Creates and configures a production server for Rytestack applications.
 */
import { Hono } from 'hono';
import { RytestackConfig } from '@rytestack/core';
import { createMiddlewareStack, Middleware, createDefaultMiddleware } from '../middleware';

/**
 * Options for creating a server
 */
export interface CreateServerOptions {
    /**
     * Rytestack configuration
     */
    config: RytestackConfig;

    /**
     * Application middleware
     */
    middleware?: Middleware[];

    /**
     * Page handler function
     */
    pageHandler: (c: any) => Promise<Response>;

    /**
     * API handlers
     */
    apiHandlers?: Record<string, any>;

    /**
     * Whether to use default middleware
     */
    useDefaultMiddleware?: boolean;
}

/**
 * Creates a production server for Rytestack applications
 *
 * @param options Server options
 * @returns Hono app
 */
export function createServer({
                                 config,
                                 middleware = [],
                                 pageHandler,
                                 apiHandlers = {},
                                 useDefaultMiddleware = true
                             }: CreateServerOptions): Hono {
    // Create Hono app
    const app = new Hono();

    // Apply middleware stack
    const allMiddleware = [...middleware];

    // Add default middleware if requested
    if (useDefaultMiddleware) {
        const defaultMiddleware = createDefaultMiddleware(config);
        allMiddleware.unshift(...defaultMiddleware);
    }

    // Apply middleware stack
    app.use('*', createMiddlewareStack(allMiddleware));

    // Register API handlers
    for (const [path, handler] of Object.entries(apiHandlers)) {
        app.route(path, handler);
    }

    // Register page handler for all other routes
    app.get('*', pageHandler);

    return app;
}