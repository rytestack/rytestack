/**
 * @fileoverview CORS middleware
 *
 * Middleware for handling Cross-Origin Resource Sharing.
 */
import { Middleware } from '../types';

/**
 * Options for the CORS middleware
 */
export interface CorsOptions {
    /**
     * Allowed origins
     */
    origin?: string | string[] | ((origin: string) => string | boolean | Promise<string | boolean>);

    /**
     * Whether to allow credentials
     */
    credentials?: boolean;

    /**
     * Exposed headers
     */
    exposeHeaders?: string | string[];

    /**
     * Max age in seconds
     */
    maxAge?: number;

    /**
     * Allowed methods
     */
    allowMethods?: string | string[];

    /**
     * Allowed headers
     */
    allowHeaders?: string | string[];
}

/**
 * Create CORS middleware
 *
 * @param options CORS options
 * @returns CORS middleware
 */
export function cors(options: CorsOptions = {}): Middleware {
    const {
        origin = '*',
        credentials = false,
        exposeHeaders = '',
        maxAge = 86400,
        allowMethods = 'GET,HEAD,PUT,POST,DELETE,PATCH',
        allowHeaders = ''
    } = options;

    return {
        name: 'cors',
        handler: async (c, next) => {
            // Handle preflight requests
            if (c.req.method === 'OPTIONS') {
                // Set CORS headers for preflight
                c.header('Access-Control-Allow-Methods', Array.isArray(allowMethods) ? allowMethods.join(',') : allowMethods);
                c.header('Access-Control-Allow-Headers', Array.isArray(allowHeaders) ? allowHeaders.join(',') : allowHeaders);
                c.header('Access-Control-Max-Age', maxAge.toString());
                c.status(204);
                return;
            }

            // Set origin
            let originHeader = '*';

            if (typeof origin === 'function') {
                const requestOrigin = c.req.header('Origin') || '';
                const resolvedOrigin = await origin(requestOrigin);
                originHeader = resolvedOrigin ? (typeof resolvedOrigin === 'boolean' ? requestOrigin : resolvedOrigin) : '*';
            } else if (Array.isArray(origin)) {
                const requestOrigin = c.req.header('Origin') || '';
                originHeader = origin.includes(requestOrigin) ? requestOrigin : origin[0];
            } else {
                originHeader = origin;
            }

            c.header('Access-Control-Allow-Origin', originHeader);

            // Set other CORS headers
            if (credentials) {
                c.header('Access-Control-Allow-Credentials', 'true');
            }

            if (exposeHeaders) {
                c.header('Access-Control-Expose-Headers', Array.isArray(exposeHeaders) ? exposeHeaders.join(',') : exposeHeaders);
            }

            await next();
        }
    };
}