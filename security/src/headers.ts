/**
 * @fileoverview Security headers middleware
 *
 * HTTP security headers management.
 */
import { Context, Next } from 'hono';
import { Middleware } from '@rytestack/server';

/**
 * Content Security Policy configuration
 */
export interface ContentSecurityPolicyConfig {
    /**
     * Default source directive
     */
    'default-src'?: string[];

    /**
     * Script source directive
     */
    'script-src'?: string[];

    /**
     * Style source directive
     */
    'style-src'?: string[];

    /**
     * Image source directive
     */
    'img-src'?: string[];

    /**
     * Font source directive
     */
    'font-src'?: string[];

    /**
     * Connect source directive
     */
    'connect-src'?: string[];

    /**
     * Media source directive
     */
    'media-src'?: string[];

    /**
     * Object source directive
     */
    'object-src'?: string[];

    /**
     * Frame source directive
     */
    'frame-src'?: string[];

    /**
     * Worker source directive
     */
    'worker-src'?: string[];

    /**
     * Manifest source directive
     */
    'manifest-src'?: string[];

    /**
     * Form action directive
     */
    'form-action'?: string[];

    /**
     * Frame ancestors directive
     */
    'frame-ancestors'?: string[];

    /**
     * Report URI directive
     */
    'report-uri'?: string;

    /**
     * Report To directive
     */
    'report-to'?: string;

    /**
     * Upgrade Insecure Requests directive
     */
    'upgrade-insecure-requests'?: boolean;

    /**
     * Block All Mixed Content directive
     */
    'block-all-mixed-content'?: boolean;

    /**
     * Whether to include the 'unsafe-inline' directive
     */
    'unsafe-inline'?: boolean;

    /**
     * Whether to include the 'unsafe-eval' directive
     */
    'unsafe-eval'?: boolean;
}

/**
 * Security headers options
 */
export interface SecurityHeadersOptions {
    /**
     * X-XSS-Protection header value
     */
    xssProtection?: string | boolean;

    /**
     * X-Content-Type-Options header value
     */
    contentTypeOptions?: string | boolean;

    /**
     * X-Frame-Options header value
     */
    frameOptions?: 'DENY' | 'SAMEORIGIN' | boolean;

    /**
     * Strict-Transport-Security header value
     */
    hsts?: {
        /**
         * Max age in seconds
         */
        maxAge?: number;

        /**
         * Include subdomains flag
         */
        includeSubDomains?: boolean;

        /**
         * Preload flag
         */
        preload?: boolean;
    } | boolean;

    /**
     * Content-Security-Policy header configuration
     */
    contentSecurityPolicy?: ContentSecurityPolicyConfig | boolean;

    /**
     * Referrer-Policy header value
     */
    referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url' | boolean;

    /**
     * Custom headers to add
     */
    customHeaders?: Record<string, string>;

    /**
     * Whether to enable all protections by default
     */
    enableDefaults?: boolean;
}

/**
 * Default security headers options
 */
const DEFAULT_SECURITY_HEADERS: SecurityHeadersOptions = {
    xssProtection: '1; mode=block',
    contentTypeOptions: 'nosniff',
    frameOptions: 'SAMEORIGIN',
    hsts: {
        maxAge: 15552000, // 180 days
        includeSubDomains: true,
        preload: false
    },
    contentSecurityPolicy: false, // Disabled by default as it requires careful configuration
    referrerPolicy: 'strict-origin-when-cross-origin',
    enableDefaults: true
};

/**
 * Builds a Content Security Policy string from configuration
 *
 * @param config CSP configuration
 * @returns CSP header value
 */
function buildCspString(config: ContentSecurityPolicyConfig): string {
    const directives: string[] = [];

    // Process each CSP directive
    for (const [directive, sources] of Object.entries(config)) {
        if (directive === 'unsafe-inline' || directive === 'unsafe-eval' ||
            directive === 'upgrade-insecure-requests' || directive === 'block-all-mixed-content') {
            continue;
        }

        if (sources === undefined) {
            continue;
        }

        // Handle array sources
        if (Array.isArray(sources)) {
            if (sources.length === 0) {
                continue;
            }

            directives.push(`${directive} ${sources.join(' ')}`);
        }
        // Handle string values (report-uri, etc.)
        else if (typeof sources === 'string') {
            directives.push(`${directive} ${sources}`);
        }
        // Handle boolean values (upgrade-insecure-requests, etc.)
        else if (typeof sources === 'boolean' && sources) {
            directives.push(directive);
        }
    }

    // Add unsafe-inline if specified
    if (config['unsafe-inline']) {
        if (config['script-src']) {
            const index = directives.findIndex(d => d.startsWith('script-src'));
            if (index >= 0) {
                directives[index] += " 'unsafe-inline'";
            }
        }

        if (config['style-src']) {
            const index = directives.findIndex(d => d.startsWith('style-src'));
            if (index >= 0) {
                directives[index] += " 'unsafe-inline'";
            }
        }
    }

    // Add unsafe-eval if specified
    if (config['unsafe-eval']) {
        if (config['script-src']) {
            const index = directives.findIndex(d => d.startsWith('script-src'));
            if (index >= 0) {
                directives[index] += " 'unsafe-eval'";
            }
        }
    }

    // Add upgrade-insecure-requests if specified
    if (config['upgrade-insecure-requests']) {
        directives.push('upgrade-insecure-requests');
    }

    // Add block-all-mixed-content if specified
    if (config['block-all-mixed-content']) {
        directives.push('block-all-mixed-content');
    }

    return directives.join('; ');
}

/**
 * Creates a security headers middleware
 *
 * @param options Security headers options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * import { securityHeaders } from '@rytestack/security';
 *
 * app.use('*', securityHeaders({
 *   contentSecurityPolicy: {
 *     'default-src': ["'self'"],
 *     'script-src': ["'self'", 'https://cdn.example.com'],
 *     'unsafe-inline': true
 *   }
 * }));
 * ```
 */
export function securityHeaders(options: SecurityHeadersOptions = {}): Middleware {
    // Merge default and user options
    const config = {
        ...DEFAULT_SECURITY_HEADERS,
        ...options
    };

    return {
        name: 'security-headers',
        handler: async (ctx: Context, next: Next) => {
            // Add X-XSS-Protection header
            if (config.xssProtection) {
                const value = typeof config.xssProtection === 'boolean'
                    ? '1; mode=block'
                    : config.xssProtection;
                ctx.header('X-XSS-Protection', value);
            }

            // Add X-Content-Type-Options header
            if (config.contentTypeOptions) {
                const value = typeof config.contentTypeOptions === 'boolean'
                    ? 'nosniff'
                    : config.contentTypeOptions;
                ctx.header('X-Content-Type-Options', value);
            }

            // Add X-Frame-Options header
            if (config.frameOptions) {
                const value = typeof config.frameOptions === 'boolean'
                    ? 'SAMEORIGIN'
                    : config.frameOptions;
                ctx.header('X-Frame-Options', value);
            }

            // Add Strict-Transport-Security header
            if (config.hsts) {
                let value = '';

                if (typeof config.hsts === 'boolean') {
                    value = 'max-age=15552000; includeSubDomains';
                } else {
                    value = `max-age=${config.hsts.maxAge || 15552000}`;

                    if (config.hsts.includeSubDomains) {
                        value += '; includeSubDomains';
                    }

                    if (config.hsts.preload) {
                        value += '; preload';
                    }
                }

                ctx.header('Strict-Transport-Security', value);
            }

            // Add Content-Security-Policy header
            if (config.contentSecurityPolicy) {
                const cspConfig = typeof config.contentSecurityPolicy === 'boolean'
                    ? {
                        'default-src': ["'self'"],
                        'script-src': ["'self'"],
                        'style-src': ["'self'"],
                        'img-src': ["'self'"],
                        'font-src': ["'self'"],
                        'connect-src': ["'self'"],
                        'object-src': ["'none'"]
                    }
                    : config.contentSecurityPolicy;

                const cspValue = buildCspString(cspConfig);
                if (cspValue) {
                    ctx.header('Content-Security-Policy', cspValue);
                }
            }

            // Add Referrer-Policy header
            if (config.referrerPolicy) {
                const value = typeof config.referrerPolicy === 'boolean'
                    ? 'strict-origin-when-cross-origin'
                    : config.referrerPolicy;
                ctx.header('Referrer-Policy', value);
            }

            // Add custom headers
            if (config.customHeaders) {
                for (const [name, value] of Object.entries(config.customHeaders)) {
                    ctx.header(name, value);
                }
            }

            await next();
        }
    };
}

/**
 * Predefined CSP configurations for common use cases
 */
export const cspPresets = {
    /**
     * Basic CSP configuration that allows only same-origin resources
     */
    basic: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'"],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"]
    },

    /**
     * Relaxed CSP configuration that allows common CDNs
     */
    relaxed: {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
        'style-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'connect-src': ["'self'", 'https:'],
        'object-src': ["'none'"],
        'unsafe-inline': true
    },

    /**
     * CSP configuration for SPAs (Single Page Applications)
     */
    spa: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'", 'https:'],
        'object-src': ["'none'"],
        'unsafe-inline': true,
        'unsafe-eval': true
    }
};