// Add these to the RytestackConfigSchema
export const RytestackConfigSchema = z.object({
    // ... existing config

    /**
     * Logging configuration
     */
    logging: z.object({
        /**
         * Log level
         */
        level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

        /**
         * Application name for logs
         */
        appName: z.string().optional(),

        /**
         * Pretty printing for development
         */
        pretty: z.boolean().default(true),

        /**
         * Log destination
         */
        destination: z.string().optional()
    }).default({
        level: 'info',
        pretty: true
    }),

    /**
     * Security configuration
     */
    security: z.object({
        /**
         * CSRF protection configuration
         */
        csrf: z.object({
            /**
             * Whether to enable CSRF protection
             */
            enabled: z.boolean().default(true),

            /**
             * CSRF token cookie name
             */
            cookieName: z.string().default('rytestack-csrf'),

            /**
             * CSRF token header name
             */
            headerName: z.string().default('x-csrf-token'),

            /**
             * Methods to exclude from CSRF protection
             */
            ignoreMethods: z.array(z.string()).default(['GET', 'HEAD', 'OPTIONS']),

            /**
             * Paths to exclude from CSRF protection
             */
            ignorePaths: z.array(z.string()).default([])
        }).default({
            enabled: true,
            cookieName: 'rytestack-csrf',
            headerName: 'x-csrf-token',
            ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
            ignorePaths: []
        }),

        /**
         * Security headers configuration
         */
        headers: z.object({
            /**
             * Whether to enable security headers
             */
            enabled: z.boolean().default(true),

            /**
             * Content Security Policy configuration
             */
            contentSecurityPolicy: z.boolean().or(z.record(z.any())).default(false),

            /**
             * HSTS configuration
             */
            hsts: z.boolean().or(z.record(z.any())).default(true)
        }).default({
            enabled: true,
            contentSecurityPolicy: false,
            hsts: true
        })
    }).default({
        csrf: {
            enabled: true,
            cookieName: 'rytestack-csrf',
            headerName: 'x-csrf-token',
            ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
            ignorePaths: []
        },
        headers: {
            enabled: true,
            contentSecurityPolicy: false,
            hsts: true
        }
    })
});