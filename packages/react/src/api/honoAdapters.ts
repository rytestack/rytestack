/**
 * @fileoverview Hono adapters for Rytestack
 *
 * Adapters for integrating Hono.js with Rytestack API routes.
 */
import { Context } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { RyteApiHandler, RyteApiRequest, RyteApiResponse } from './types';

/**
 * Creates a Hono adapter for a Rytestack API handler
 *
 * @param handler Rytestack API handler
 * @returns Hono handler function
 */
export function createHonoAdapter(handler: RyteApiHandler) {
    return async (c: Context) => {
        // Create request object
        const req: RyteApiRequest = {
            params: c.req.param() as Record<string, string>,
            query: Object.fromEntries(new URL(c.req.url).searchParams),
            body: await parseBody(c),
            headers: c.req.headers,
            context: c,
            url: c.req.url,
            method: c.req.method
        };

        // Create response object
        const res: RyteApiResponse = {
            json: (data: any) => c.json(data),
            text: (text: string) => c.text(text),
            status: (code: StatusCode) => {
                c.status(code);
                return res;
            },
            header: (name: string, value: string) => {
                c.header(name, value);
                return res;
            },
            stream: (readable: ReadableStream) => c.body(readable),
            redirect: (url: string, status?: StatusCode) => c.redirect(url, status)
        };

        // Call the handler
        await handler(req, res);

        // Return the Hono context
        return c;
    };
}

/**
 * Parses the request body
 *
 * @param c Hono context
 * @returns Parsed body
 */
async function parseBody(c: Context): Promise<any> {
    try {
        const contentType = c.req.header('content-type') || '';

        if (contentType.includes('application/json')) {
            return await c.req.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await c.req.formData();
            return Object.fromEntries(formData);
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await c.req.formData();
            return Object.fromEntries(formData);
        } else {
            // Raw text or unknown content type
            return await c.req.text();
        }
    } catch (error) {
        return null;
    }
}