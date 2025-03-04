/**
 * @fileoverview Logger implementation
 *
 * Configurable logger implementation using Pino.
 */
import pino from 'pino';
import { RytestackConfig } from '@rytestack/core';

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Logger configuration options
 */
export interface LoggerOptions {
    /**
     * Minimum log level to output
     */
    level?: LogLevel;

    /**
     * Whether to pretty-print logs (for development)
     */
    pretty?: boolean;

    /**
     * Optional application name to include in logs
     */
    appName?: string;

    /**
     * Whether to include timestamps in logs
     */
    timestamp?: boolean;

    /**
     * Custom serializers for specific objects
     */
    serializers?: Record<string, (value: any) => any>;

    /**
     * Environment (development, production, etc.)
     */
    environment?: string;

    /**
     * Optional destination for logs
     */
    destination?: string | NodeJS.WritableStream;
}

/**
 * Logger instance interface
 */
export interface Logger {
    /**
     * Log at trace level
     */
    trace: (obj: object | string, msg?: string, ...args: any[]) => void;

    /**
     * Log at debug level
     */
    debug: (obj: object | string, msg?: string, ...args: any[]) => void;

    /**
     * Log at info level
     */
    info: (obj: object | string, msg?: string, ...args: any[]) => void;

    /**
     * Log at warn level
     */
    warn: (obj: object | string, msg?: string, ...args: any[]) => void;

    /**
     * Log at error level
     */
    error: (obj: object | string, msg?: string, ...args: any[]) => void;

    /**
     * Log at fatal level
     */
    fatal: (obj: object | string, msg?: string, ...args: any[]) => void;

    /**
     * Create a child logger with additional context
     */
    child: (bindings: object) => Logger;
}

/**
 * Default serializers for common objects
 */
const defaultSerializers = {
    /**
     * Error serializer
     */
    err: (err: Error) => ({
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
        ...(err as any)
    }),

    /**
     * Request serializer
     */
    req: (req: any) => ({
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.remoteAddress || req.ip
    }),

    /**
     * Response serializer
     */
    res: (res: any) => ({
        statusCode: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : res.headers
    })
};

/**
 * Creates a logger instance
 *
 * @param options Logger configuration options
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger({
 *   level: 'info',
 *   pretty: process.env.NODE_ENV !== 'production',
 *   appName: 'my-rytestack-app'
 * });
 *
 * logger.info({ userId: '123' }, 'User logged in');
 * ```
 */
export function createLogger(options: LoggerOptions = {}): Logger {
    const {
        level = process.env.LOG_LEVEL || 'info',
        pretty = process.env.NODE_ENV !== 'production',
        appName,
        timestamp = true,
        serializers: customSerializers = {},
        environment = process.env.NODE_ENV || 'development',
        destination
    } = options;

    // Combine default and custom serializers
    const serializers = {
        ...defaultSerializers,
        ...customSerializers
    };

    // Base options
    const pinoOptions: pino.LoggerOptions = {
        level,
        serializers,
        base: {
            ...(appName ? { app: appName } : {}),
            env: environment,
            version: process.env.APP_VERSION || '1.0.0'
        }
    };

    // Add timestamp option
    if (!timestamp) {
        pinoOptions.timestamp = false;
    }

    // Configure pretty printing for development
    if (pretty) {
        const transport = {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
            }
        };
        pinoOptions.transport = transport;
    }

    // Create logger instance
    return pino(pinoOptions, destination);
}

/**
 * Creates a logger from Rytestack configuration
 *
 * @param config Rytestack configuration
 * @returns Logger instance
 */
export function createLoggerFromConfig(config: RytestackConfig): Logger {
    // Extract logging options from config
    const loggingConfig = config.logging || {};

    return createLogger({
        level: loggingConfig.level || (config.mode === 'production' ? 'info' : 'debug'),
        pretty: config.mode !== 'production',
        appName: loggingConfig.appName,
        environment: config.mode
    });
}

/**
 * Global logger instance
 */
let globalLogger: Logger;

/**
 * Gets or creates the global logger
 *
 * @param options Logger options (only used if logger doesn't exist)
 * @returns Logger instance
 */
export function getLogger(options?: LoggerOptions): Logger {
    if (!globalLogger) {
        globalLogger = createLogger(options);
    }
    return globalLogger;
}

/**
 * Sets the global logger
 *
 * @param logger Logger instance
 */
export function setLogger(logger: Logger): void {
    globalLogger = logger;
}