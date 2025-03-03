/**
 * @fileoverview API types for Rytestack
 *
 * Type definitions for API routes.
 */
import { Context } from 'hono';
import { StatusCode } from 'hono/utils/http-status';

/**
 * Type for API request handlers
 */
export type RyteApiHandler = (
    req: RyteApiRequest,
    res: RyteApiResponse
) => Promise<void> | void;

/**
 * API request object
 */
export interface RyteApiRequest {
    /**
     * Request parameters
     */
    params: Record<string, string>;

    /**
     * Query parameters
     */
    query: Record<string, string>;

    /**
     * Request body
     */
    body: any;

    /**
     * Request headers
     */
    headers: Headers;

    /**
     * Raw Hono context
     */
    context: Context;

    /**
     * Original URL
     */
    url: string;

    /**
     * HTTP method
     */
    method: string;
}

/**
 * API response object
 */
export interface RyteApiResponse {
    /**
     * Send a JSON response
     */
    json: (data: any) => void;

    /**
     * Send a text response
     */
    text: (text: string) => void;

    /**
     * Set response status code
     */
    status: (code: StatusCode) => RyteApiResponse;

    /**
     * Set response headers
     */
    header: (name: string, value: string) => RyteApiResponse;

    /**
     * Send a streaming response
     */
    stream: (readable: ReadableStream) => void;

    /**
     * Send a redirect response
     */
    redirect: (url: string, status?: StatusCode) => void;
}