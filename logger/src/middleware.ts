/**
 * @fileoverview Logging middleware for Rytestack
 *
 * Middleware for request/response logging.
 */
import { Context, Next } from 'hono';
import { Logger, getLogger } from './logger';
import { Middleware } from '@rytestack/server';

/**
 * Request logging middleware options
 */
export interface RequestLoggerOptions {
    /**
     * Logger instance to use
     */
    logger?: Logger;

    /**
     * Whether to log request body
     */
    logBody?: boolean;

    /**
     * Whether to log request headers
     */
    logHeaders?: boolean;

    /**
     * Headers to redact for privacy/security
     */
    redactHeaders?: string[];

    /**
     * Whether to log request timing
     */
    logTiming?: boolean;

    /**
     * Whether to log errors
     */
    logErrors?: boolean;

    /**
     * Custom logging function
     */
    customLogFn?: (logger: Logger, ctx: Context, responseTime: number) => void;
}

/**
 * Default headers to redact
 */
const DEFAULT_REDACT_HEADERS = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-auth-token'
];

/**
 * Creates a request logging middleware
 *
 * @param options Middleware options
 * @returns Hono middleware
 *
 * @example
 * ```typescript
 * import { requestLogger } from '@rytestack/logger';
 *
 * app.use('*', requestLogger({
 *   logTiming: true,
 *   redactHeaders: ['cookie', 'authorization']
 * }));
 * ```
 */
export function requestLogger(options: RequestLoggerOptions = {}): Middleware {
    const {
        logger = getLogger(),
        logBody = false,
        logHeaders = true,
        redactHeaders = DEFAULT_REDACT_HEADERS,
        logTiming = true,
        logErrors = true,
        customLogFn
    } = options;

    /**
     * Redacts sensitive information from headers
     */
    function redactSensitiveHeaders(headers: Headers): Record<string, string> {
        const result: Record<string, string> = {};

        headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (redactHeaders.includes(lowerKey)) {
                result[key] = '[REDACTED]';
            } else {
                result[key] = value;
            }
        });

        return result;
    }

    return {
        name: 'request-logger',
        handler: async (ctx: Context, next: Next) => {
            const startTime = Date.now();
            const { req } = ctx;
            const method = req.method;
            const url = req.url;

            // Log request
            const requestLog: any = {
                type: 'request',
                method,
                url
            };

            // Add headers if enabled
            if (logHeaders) {
                requestLog.headers = redactSensitiveHeaders(req.headers);
            }

            // Add body if enabled and available
            if (logBody && req.headers.get('content-type')?.includes('application/json')) {
                try {
                    const body = await req.json();
                    requestLog.body = body;
                } catch (e) {
                    // Ignore body parsing errors
                }
            }

            logger.info(requestLog, `Incoming request: ${method} ${url}`);

            try {
                // Process the request
                await next();

                // Calculate response time
                const responseTime = Date.now() - startTime;

                // Get response details
                const status = ctx.res.status;

                // Prepare response log
                const responseLog: any = {
                    type: 'response',
                    method,
                    url,
                    status,
                    success: status < 400
                };

                // Add timing if enabled
                if (logTiming) {
                    responseLog.responseTime = responseTime;
                }

                // Use custom log function if provided
                if (customLogFn) {
                    customLogFn(logger, ctx, responseTime);
                } else {
                    // Standard logging
                    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
                    logger[level](responseLog, `Response sent: ${method} ${url} ${status} ${responseTime}ms`);
                }
            } catch (error) {
                // Calculate response time even for errors
                const responseTime = Date.now() - startTime;

                if (logErrors) {
                    logger.error(
                        {
                            type: 'error',
                            method,
                            url,
                            error,
                            ...(logTiming ? { responseTime } : {})
                        },
                        `Error processing request: ${method} ${url}`
                    );
                }

                throw error;
            }
        }
    };
}