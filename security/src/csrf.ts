/**
 * @fileoverview CSRF protection for Rytestack
 *
 * Cross-Site Request Forgery protection utilities.
 */
import { Context, Next } from 'hono';
import * as csrf from 'csrf';
import { Middleware } from '@rytestack/server';

/**
 * CSRF protection middleware options
 */
export interface CsrfOptions {
    /**
     * Name of the CSRF token cookie
     */
    cookieName?: string;

    /**
     * Name of the CSRF token header
     */
    headerName?: string;

    /**
     * Name of the CSRF token form field
     */
    formFieldName?: string;

    /**
     * Cookie options
     */
    cookie?: {
        /**
         * Cookie path
         */
        path?: string;

        /**
         * Cookie domain
         */
        domain?: string;

        /**
         * Cookie secure flag
         */
        secure?: boolean;

        /**
         * Cookie httpOnly flag
         */
        httpOnly?: boolean;

        /**
         * Cookie sameSite flag
         */
        sameSite?: 'strict' | 'lax' | 'none';

        /**
         * Cookie max age in seconds
         */
        maxAge?: number;
    };

    /**
     * Methods to exclude from CSRF protection
     */
    ignoreMethods?: string[];

    /**
     * Paths to exclude from CSRF protection
     */
    ignorePaths?: string[];

    /**
     * Function to determine if a request should be excluded
     */
    shouldExclude?: (ctx: Context) => boolean;

    /**
     * CSRF token TTL in seconds
     */
    tokenTtl?: number;
}

/**
 * Default CSRF options
 */
const DEFAULT_CSRF_OPTIONS: CsrfOptions = {
    cookieName: 'rytestack-csrf',
    headerName: 'x-csrf-token',
    formFieldName: '_csrf',
    cookie: {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 86400 // 24 hours
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    ignorePaths: [],
    tokenTtl: 86400 // 24 hours
};

/**
 * Creates a CSRF protection middleware
 *
 * @param options CSRF protection options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * import { csrfProtection } from '@rytestack/security';
 *
 * app.use('*', csrfProtection());
 * ```
 */
export function csrfProtection(options: CsrfOptions = {}): Middleware {
    // Merge default and user options
    const config = { ...DEFAULT_CSRF_OPTIONS, ...options };
    const cookieConfig = { ...DEFAULT_CSRF_OPTIONS.cookie, ...options.cookie };

    // Create CSRF tokens instance
    const tokens = new csrf({
        ttl: config.tokenTtl
    });

    return {
        name: 'csrf-protection',
        handler: async (ctx: Context, next: Next) => {
            const { req } = ctx;
            const method = req.method;
            const path = new URL(req.url).pathname;

            // Skip CSRF protection for ignored methods
            if (config.ignoreMethods?.includes(method)) {
                await next();
                return;
            }

            // Skip CSRF protection for ignored paths
            if (config.ignorePaths?.some(ignorePath => {
                if (ignorePath.endsWith('*')) {
                    return path.startsWith(ignorePath.slice(0, -1));
                }
                return path === ignorePath;
            })) {
                await next();
                return;
            }

            // Skip if custom exclusion function returns true
            if (config.shouldExclude && config.shouldExclude(ctx)) {
                await next();
                return;
            }

            // Get CSRF secret from cookie
            let secret = req.cookie(config.cookieName!);

            // If no secret exists, create one
            if (!secret) {
                secret = tokens.secretSync();

                // Set cookie with the new secret
                ctx.cookie(config.cookieName!, secret, {
                    path: cookieConfig.path,
                    domain: cookieConfig.domain,
                    secure: cookieConfig.secure,
                    httpOnly: cookieConfig.httpOnly,
                    sameSite: cookieConfig.sameSite,
                    maxAge: cookieConfig.maxAge
                });
            }

            // Validate CSRF token for non-GET requests
            if (!config.ignoreMethods?.includes(method)) {
                // Try to get token from header or form
                const token =
                    req.header(config.headerName!) ||
                    (await req.parseBody())?.[config.formFieldName!];

                if (!token || !tokens.verify(secret, token as string)) {
                    ctx.status(403);
                    return ctx.json({ error: 'Invalid CSRF token' });
                }
            }

            // Add token generation function to context
            ctx.set('csrfToken', () => tokens.create(secret));

            await next();
        }
    };
}

/**
 * Gets a CSRF token from a request context
 *
 * @param ctx Hono context
 * @returns CSRF token string
 *
 * @example
 * ```typescript
 * app.get('/form', (ctx) => {
 *   const token = getCsrfToken(ctx);
 *   return ctx.html(`
 *     <form method="post">
 *       <input type="hidden" name="_csrf" value="${token}">
 *       <button type="submit">Submit</button>
 *     </form>
 *   `);
 * });
 * ```
 */
export function getCsrfToken(ctx: Context): string {
    const generateToken = ctx.get('csrfToken');

    if (!generateToken) {
        throw new Error('CSRF protection middleware is not enabled');
    }

    return generateToken();
}