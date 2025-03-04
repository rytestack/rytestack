/**
 * @fileoverview Server-side rendering utility
 *
 * Renders a React component to an HTML string with state hydration.
 */
import React from 'react';
import { renderToString as reactRenderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { ServerRenderContext, ServerRenderResult } from './types';

/**
 * Options for server-side rendering
 */
export interface RenderToStringOptions {
    /**
     * React component to render
     */
    App: React.ComponentType<any>;

    /**
     * Server render context
     */
    context: ServerRenderContext;

    /**
     * Page props
     */
    pageProps?: any;
}

/**
 * Renders a React component to an HTML string with state hydration
 *
 * @param options Rendering options
 * @returns Server render result
 */
export async function renderToString({
                                         App,
                                         context,
                                         pageProps = {}
                                     }: RenderToStringOptions): Promise<ServerRenderResult> {
    // Create QueryClient for this request
    const queryClient = new QueryClient();

    // Create helmet context for collecting head tags
    const helmetContext: { helmet?: HelmetServerState } = {};

    // Render the app to string
    const html = reactRenderToString(
        <HelmetProvider context={helmetContext}>
            <QueryClientProvider client={queryClient}>
                <StaticRouter location={context.url}>
                    <App {...pageProps} />
                </StaticRouter>
            </QueryClientProvider>
        </HelmetProvider>
    );

    // Get dehydrated state
    const dehydratedState = dehydrate(queryClient);

    // Get helmet data
    const { helmet } = helmetContext;

    // Prepare meta tags
    const metaTags = helmet ? `
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${helmet.script.toString()}
  ` : '';

    // Return result
    return {
        html,
        dehydratedState,
        pageProps,
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html'
        },
        metaTags
    };
}