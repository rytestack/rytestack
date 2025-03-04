/**
 * @fileoverview Log formatters
 *
 * Utility functions for formatting logs.
 */

/**
 * Formats an error for logging
 *
 * @param error Error object
 * @returns Formatted error
 */
export function formatError(error: Error): any {
    return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error as any) // Include any custom properties
    };
}

/**
 * Redacts sensitive information from an object
 *
 * @param obj Object to redact
 * @param keys Keys to redact
 * @param replacement Replacement for redacted values
 * @returns Redacted object
 */
export function redact<T extends object>(
    obj: T,
    keys: string[],
    replacement = '[REDACTED]'
): T {
    const result = { ...obj };

    const redactRecursive = (object: any, path = '') => {
        if (!object || typeof object !== 'object') {
            return;
        }

        for (const [key, value] of Object.entries(object)) {
            const currentPath = path ? `${path}.${key}` : key;

            if (keys.some(k => k === key || k === currentPath)) {
                object[key] = replacement;
            } else if (value && typeof value === 'object') {
                redactRecursive(value, currentPath);
            }
        }
    };

    redactRecursive(result);
    return result;
}

/**
 * Creates a simple log message
 *
 * @param message Message text
 * @param data Additional data
 * @returns Structured log object
 */
export function logMessage(message: string, data?: Record<string, any>): any {
    return {
        msg: message,
        ...data
    };
}