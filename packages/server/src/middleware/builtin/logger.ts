/**
 * @fileoverview Logger middleware
 *
 * Middleware for logging HTTP requests.
 */
import { Middleware, MiddlewareContext } from '../types';

/**
 * Options for the logger middleware
 */
export interface LoggerOptions {
    /**
     * Whether to log request time
     */
    timing?: boolean;

    /**
     * Custom log format
     */
    format?: (info: {
        method: string;
        url: string;
        status: number;
        time?: number;
    }) => string;
}

/**
 * Default logger format
 */
const defaultFormat = (info: { method: string; url: string; status: number; time?: number }) => {
    const { method, url, status, time } = info;
    const timeStr = time ? ` - ${time}ms` : '';
    return `${method} ${url} ${status}${timeStr}`;
};

/**
 * Creates a logger middleware
 *
 * @param options Logger options
 * @returns Logger middleware
 */
export function logger(options: LoggerOptions = {}): Middleware {
    const { timing = true, format = defaultFormat } = options;

    return {
        name: 'logger',
        handler: async (c: MiddlewareContext, next: () => Promise<void>) => {
            // Record start time
            const startTime = Date.now();

            // Continue to the next middleware
            await next();

            // Get response status
            const status = c.res.status;

            // Calculate request time
            const time = timing ? Date.now() - startTime : undefined;

            // Format and log the request
            const logMessage = format({
                method: c.req.method,
                url: c.req.url,
                status,
                time
            });

            console.log(logMessage);
        }
    };
}