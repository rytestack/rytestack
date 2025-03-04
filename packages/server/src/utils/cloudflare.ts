/**
 * @fileoverview Cloudflare utilities
 *
 * Utilities for deploying to Cloudflare Pages.
 */
import { Hono } from 'hono';

/**
 * Adapts a Hono app for deployment to Cloudflare Pages
 *
 * @param app Hono app
 * @returns Cloudflare Pages handler
 */
export function cloudflareAdapter(app: Hono): (request: Request, env: any, ctx: any) => Promise<Response> {
    return (request, env, ctx) => {
        // Add Cloudflare-specific environment to the request context
        app.env = {
            ...app.env,
            CLOUDFLARE: {
                env,
                ctx
            }
        };

        return app.fetch(request, env, ctx);
    };
}