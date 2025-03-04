/**
 * @fileoverview Server creation utility
 *
 * Creates a Hono server for serving Rytestack applications.
 */
import path from 'path';
import { Hono } from 'hono';
import { serveStatic } from 'hono/serve-static';
import { RytestackConfig } from '@rytestack/core';
import { createHonoAdapter } from '../api/honoAdapters';
import { ApiModule } from '../types';

/**
 * Options for creating a server
 */
export interface CreateServerOptions {
    /**
     * Rytestack configuration
     */
    config: RytestackConfig;

    /**
     * Root directory of the project
     */
    rootDir: string;

    /**
     * Map of API routes
     */
    apiRoutes: Record<string, ApiModule>;

    /**
     * Handler for page requests
     */
    pageHandler: (c: any) => Promise<Response>;
}

/**
 * Creates a Hono server for serving Rytestack applications
 *
 * @param options Server options
 * @returns Hono app
 */
export function createServer({
                                 config,
                                 rootDir,
                                 apiRoutes,
                                 pageHandler
                             }: CreateServerOptions): Hono {
    // Create Hono app
    const app = new Hono();

    // Serve static files from public directory
    const publicDir = path.join(rootDir, config.publicDir);
    app.use('/public/*', serveStatic({ root: publicDir }));

    // Register API routes
    for (const [routePath, routeModule] of Object.entries(apiRoutes)) {
        // Extract HTTP methods from the module
        for (const [method, handler] of Object.entries(routeModule)) {
            if (handler && typeof handler === 'function') {
                const httpMethod = method.toLowerCase();

                // Register the route with Hono
                if (httpMethod === 'get') {
                    app.get(routePath, createHonoAdapter(handler));
                } else if (httpMethod === 'post') {
                    app.post(routePath, createHonoAdapter(handler));
                } else if (httpMethod === 'put') {
                    app.put(routePath, createHonoAdapter(handler));
                } else if (httpMethod === 'delete') {
                    app.delete(routePath, createHonoAdapter(handler));
                } else if (httpMethod === 'patch') {
                    app.patch(routePath, createHonoAdapter(handler));
                }
            }
        }
    }

    // Handle all other requests as page requests
    app.get('*', pageHandler);

    return app;
}