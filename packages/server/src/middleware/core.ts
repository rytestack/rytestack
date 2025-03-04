/**
 * @fileoverview Core middleware utilities
 *
 * Core utilities for the middleware system.
 */
import { Context, Next } from 'hono';
import { Middleware, MiddlewareContext } from './types';

/**
 * Creates a new middleware context
 *
 * @param c Original Hono context
 * @returns Middleware context
 */
export function createMiddlewareContext(c: Context): MiddlewareContext {
    // Cast and initialize Rytestack-specific properties
    const context = c as MiddlewareContext;

    context.rytestack = {
        params: {},
        startTime: Date.now(),
        data: {}
    };

    return context;
}

/**
 * Creates a middleware stack from a list of middleware
 *
 * @param middlewares List of middleware to apply
 * @returns Hono middleware function
 */
export function createMiddlewareStack(middlewares: Middleware[]) {
    return async (c: Context, next: Next) => {
        // Create middleware context
        const context = createMiddlewareContext(c);

        // Apply middleware stack
        let currentIndex = -1;

        // Execute the next middleware in the stack
        const executeNext = async (): Promise<void> => {
            currentIndex++;

            if (currentIndex < middlewares.length) {
                // Execute the current middleware
                await middlewares[currentIndex].handler(context, executeNext);
            } else {
                // End of middleware stack, continue to the route handler
                await next();
            }
        };

        // Start executing middleware
        await executeNext();
    };
}