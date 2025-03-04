/**
 * @fileoverview Server-side rendering types
 *
 * Type definitions for server-side rendering.
 */
import { RytestackConfig } from '@rytestack/core';
import { QueryClient } from '@tanstack/react-query';
import { Request, Response } from 'hono';

/**
 * Context for server-side rendering
 */
export interface ServerRenderContext {
    /**
     * Request URL
     */
    url: string;

    /**
     * Request object
     */
    req: Request;

    /**
     * Response object
     */
    res: Response;

    /**
     * Route parameters
     */
    params: Record<string, string>;

    /**
     * Query parameters
     */
    query: Record<string, string>;

    /**
     * Rytestack configuration
     */
    config: RytestackConfig;

    /**
     * QueryClient instance
     */
    queryClient: QueryClient;
}

/**
 * Server-side rendering result
 */
export interface ServerRenderResult {
    /**
     * HTML string
     */
    html: string;

    /**
     * Dehydrated state for client-side hydration
     */
    dehydratedState: any;

    /**
     * Initial page props
     */
    pageProps: any;

    /**
     * HTTP status code
     */
    statusCode: number;

    /**
     * HTTP headers
     */
    headers: Record<string, string>;
}