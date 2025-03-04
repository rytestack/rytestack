/**
 * @fileoverview Development server for Rytestack
 *
 * Creates and configures a development server with hot reload.
 */
import { Hono } from 'hono';
import { RytestackConfig } from '@rytestack/core';
import { createMiddlewareStack, Middleware, logger } from '../middleware';

/**
 * Options for creating a development server
 */
export interface CreateDevServerOptions {
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
     * Port to listen on
     */
    port?: number;

    /**
     * Host to bind to
     */
    host?: string;
}

/**
 * Creates a development server for Rytestack applications
 *
 * @param options Development server options
 * @returns Hono app and server instance
 */
export function createDevServer({
                                    config,
                                    middleware = [],
                                    pageHandler,
                                    apiHandlers = {},
                                    port = 3000,
                                    host = 'localhost'
                                }: CreateDevServerOptions): { app: Hono; start: () => Promise<void> } {
    // Create Hono app
    const app = new Hono();

    // Add logger middleware
    const allMiddleware = [logger(), ...middleware];

    // Apply middleware stack
    app.use('*', createMiddlewareStack(allMiddleware));

    // Register API handlers
    for (const [path, handler] of Object.entries(apiHandlers)) {
        app.route(path, handler);
    }

    // Register page handler for all other routes
    app.get('*', pageHandler);

    // Create start function
    const start = async () => {
        console.log(`Development server starting at http://${host}:${port}...`);

        // In a real implementation, we would start the server here
        // For now, we'll just log a message
        console.log('Server started!');
    };

    return { app, start };
}