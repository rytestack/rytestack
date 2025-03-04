/**
 * @fileoverview Middleware system for Rytestack
 *
 * This file exports the middleware system components.
 */
export * from './types';
export * from './core';
export * from './builtin';

// Import security and logging features if available
let securityModule: any;
let loggerModule: any;

try {
    securityModule = require('@rytestack/security');
} catch (error) {
    // Optional dependency, ignore if not available
}

try {
    loggerModule = require('@rytestack/logger');
} catch (error) {
    // Optional dependency, ignore if not available
}

/**
 * Creates default middleware stack based on config
 *
 * @param config Rytestack configuration
 * @returns Array of middleware
 */
export function createDefaultMiddleware(config: any): any[] {
    const middleware = [];

    // Add request logging if available
    if (loggerModule?.requestLogger) {
        middleware.push(
            loggerModule.requestLogger({
                logTiming: true,
                logHeaders: config.mode !== 'production'
            })
        );
    }

    // Add security headers if available and enabled
    if (securityModule?.securityHeaders && config.security?.headers?.enabled) {
        middleware.push(
            securityModule.securityHeaders({
                contentSecurityPolicy: config.security.headers.contentSecurityPolicy,
                hsts: config.security.headers.hsts
            })
        );
    }

    // Add CSRF protection if available and enabled
    if (securityModule?.csrfProtection && config.security?.csrf?.enabled) {
        middleware.push(
            securityModule.csrfProtection({
                cookieName: config.security.csrf.cookieName,
                headerName: config.security.csrf.headerName,
                ignoreMethods: config.security.csrf.ignoreMethods,
                ignorePaths: config.security.csrf.ignorePaths
            })
        );
    }

    // Add other built-in middleware
    middleware.push(
        require('./builtin').compression(),
        require('./builtin').cors({
            origin: config.mode === 'production' ? config.security?.cors?.origin || '*' : '*',
            credentials: true
        })
    );

    return middleware;
}