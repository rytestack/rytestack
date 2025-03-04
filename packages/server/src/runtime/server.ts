/**
 * @fileoverview Server runtime for Rytestack
 *
 * Creates and configures a production server for Rytestack applications.
 */
import { Hono } from 'hono';
import { RytestackConfig } from '@rytestack/core';
import { createMiddlewareStack, Middleware } from '../middleware';

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
                                 apiHandlers = {}
                             }: CreateServerOptions): Hono {
    // Create Hono app
    const app = new Hono();

    // Apply middleware stack
    app.use('*', createMiddlewareStack(middleware));

    // Register API handlers
    for (const [path, handler] of Object.entries(apiHandlers)) {
        app.route(path, handler);
    }

    // Register page handler for all other routes
    app.get('*', pageHandler);

    return app;
}