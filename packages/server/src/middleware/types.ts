/**
 * @fileoverview Middleware types for Rytestack
 *
 * Type definitions for the middleware system.
 */
import { Context } from 'hono';

/**
 * Middleware context with additional properties
 */
export interface MiddlewareContext extends Context {
    /**
     * Rytestack-specific state
     */
    rytestack: {
        /**
         * Route parameters
         */
        params: Record<string, string>;

        /**
         * Request start time
         */
        startTime: number;

        /**
         * Custom data that can be used by middleware
         */
        data: Record<string, any>;
    };
}

/**
 * Middleware handler function
 */
export type MiddlewareHandler = (
    c: MiddlewareContext,
    next: () => Promise<void>
) => Promise<void> | void;

/**
 * Middleware definition
 */
export interface Middleware {
    /**
     * Middleware name
     */
    name: string;

    /**
     * Middleware handler
     */
    handler: MiddlewareHandler;

    /**
     * Middleware configuration
     */
    config?: Record<string, any>;
}