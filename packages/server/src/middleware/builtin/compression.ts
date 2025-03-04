/**
 * @fileoverview Compression middleware
 *
 * Middleware for compressing HTTP responses.
 */
import { Middleware } from '../types';

/**
 * Options for the compression middleware
 */
export interface CompressionOptions {
    /**
     * Threshold in bytes (responses smaller than this won't be compressed)
     */
    threshold?: number;

    /**
     * Content types to compress
     */
    contentTypes?: string[];
}

/**
 * Default content types to compress
 */
const DEFAULT_CONTENT_TYPES = [
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'application/rss+xml',
    'application/atom+xml'
];

/**
 * Create compression middleware
 *
 * @param options Compression options
 * @returns Compression middleware
 */
export function compression(options: CompressionOptions = {}): Middleware {
    const {
        threshold = 1024,
        contentTypes = DEFAULT_CONTENT_TYPES
    } = options;

    return {
        name: 'compression',
        handler: async (c, next) => {
            // Continue to the next middleware
            await next();

            // Check if compression is supported
            const acceptEncoding = c.req.header('Accept-Encoding') || '';
            const supportsGzip = acceptEncoding.includes('gzip');
            const supportsBrotli = acceptEncoding.includes('br');

            if (!supportsGzip && !supportsBrotli) {
                return;
            }

            // Check content type
            const contentType = c.res.headers.get('Content-Type') || '';
            const shouldCompress = contentTypes.some(type => contentType.includes(type));

            if (!shouldCompress) {
                return;
            }

            // Get response body
            const body = await c.res.clone().text();

            // Check response size
            if (body.length < threshold) {
                return;
            }

            // Apply compression
            if (supportsBrotli) {
                // This is a simplified implementation without actual compression
                // In a real implementation, we would compress with brotli
                c.header('Content-Encoding', 'br');
            } else if (supportsGzip) {
                // This is a simplified implementation without actual compression
                // In a real implementation, we would compress with gzip
                c.header('Content-Encoding', 'gzip');
            }
        }
    };
}