/**
 * @fileoverview Routing system for Rytestack
 *
 * Handles file-based routing similar to Next.js, provides APIs for
 * route discovery, parameter extraction, and integration with framework adapters.
 */
import path from 'path';
import fs from 'fs';
import { globby } from 'globby';

/**
 * Represents a route in the application
 */
export interface Route {
    /**
     * Path pattern for the route (e.g., '/blog/[slug]')
     */
    path: string;

    /**
     * Absolute file path to the component
     */
    component: string;

    /**
     * Route parameters (e.g., { slug: true } for dynamic routes)
     */
    params: Record<string, boolean>;

    /**
     * Optional layout for this route
     */
    layout?: string;

    /**
     * Whether this is an index route (e.g., index.tsx)
     */
    index: boolean;

    /**
     * Additional metadata for the route
     */
    meta: Record<string, any>;
}

/**
 * Represents an API route in the application
 */
export interface ApiRoute {
    /**
     * HTTP method(s) this API route handles
     */
    methods: string[];

    /**
     * Path pattern for the API route
     */
    path: string;

    /**
     * Absolute file path to the API handler
     */
    handler: string;

    /**
     * Route parameters
     */
    params: Record<string, boolean>;
}

/**
 * Options for discovering routes
 */
export interface RouteDiscoveryOptions {
    /**
     * Root directory of the source code
     */
    srcDir: string;

    /**
     * Pages directory (relative to srcDir)
     */
    pagesDir?: string;

    /**
     * API directory (relative to srcDir)
     */
    apiDir?: string;

    /**
     * Layouts directory (relative to srcDir)
     */
    layoutsDir?: string;

    /**
     * File extensions to consider
     */
    extensions?: string[];
}

/**
 * Default route discovery options
 */
const DEFAULT_ROUTE_OPTIONS: RouteDiscoveryOptions = {
    srcDir: './src',
    pagesDir: 'pages',
    apiDir: 'api',
    layoutsDir: 'layouts',
    extensions: ['.js', '.jsx', '.ts', '.tsx']
};

/**
 * Converts a file path to a route path
 *
 * Examples:
 * - pages/index.tsx -> /
 * - pages/about.tsx -> /about
 * - pages/blog/[slug].tsx -> /blog/:slug
 * - pages/[category]/[product].tsx -> /:category/:product
 *
 * @param filePath File path relative to pages directory
 * @returns Normalized route path
 */
export function filePathToRoutePath(filePath: string): { path: string; params: Record<string, boolean> } {
    // Remove file extension
    const withoutExtension = filePath.replace(/\.[^/.]+$/, '');

    // Handle index files
    let routePath = withoutExtension === 'index'
        ? '/'
        : `/${withoutExtension}`;

    // Replace directory index with parent path
    routePath = routePath.replace(/\/index$/, '/');

    // Normalize slashes
    routePath = routePath.replace(/\\/g, '/');

    // Extract dynamic parameters
    const params: Record<string, boolean> = {};
    let expressPath = routePath;

    // Replace [param] with :param for express-like routing
    expressPath = expressPath.replace(/\[([^\]]+)\]/g, (_, paramName) => {
        params[paramName] = true;
        return `:${paramName}`;
    });

    return { path: expressPath, params };
}

/**
 * Discovers all page routes in the application
 *
 * @param options Route discovery options
 * @returns Array of discovered routes
 */
export async function discoverRoutes(options: Partial<RouteDiscoveryOptions> = {}): Promise<Route[]> {
    const config = { ...DEFAULT_ROUTE_OPTIONS, ...options };
    const pagesPath = path.join(config.srcDir, config.pagesDir || 'pages');

    // Check if pages directory exists
    if (!fs.existsSync(pagesPath)) {
        console.warn(`Pages directory not found: ${pagesPath}`);
        return [];
    }

    // Find all page files
    const patterns = config.extensions!.map(ext => `${pagesPath}/**/*${ext}`);
    const files = await globby(patterns);

    // Convert to routes
    const routes: Route[] = [];

    for (const file of files) {
        // Get path relative to pages directory
        const relativePath = path.relative(pagesPath, file);
        const { path: routePath, params } = filePathToRoutePath(relativePath);

        routes.push({
            path: routePath,
            component: file,
            params,
            index: relativePath.includes('index.'),
            meta: {} // Metadata will be extracted from components during build
        });
    }

    return routes;
}

/**
 * Discovers all API routes in the application
 *
 * @param options Route discovery options
 * @returns Array of discovered API routes
 */
export async function discoverApiRoutes(options: Partial<RouteDiscoveryOptions> = {}): Promise<ApiRoute[]> {
    const config = { ...DEFAULT_ROUTE_OPTIONS, ...options };
    const apiPath = path.join(config.srcDir, config.apiDir || 'api');

    // Check if API directory exists
    if (!fs.existsSync(apiPath)) {
        console.warn(`API directory not found: ${apiPath}`);
        return [];
    }

    // Find all API files
    const patterns = config.extensions!.map(ext => `${apiPath}/**/*${ext}`);
    const files = await globby(patterns);

    // Convert to API routes
    const apiRoutes: ApiRoute[] = [];

    for (const file of files) {
        // Get path relative to API directory
        const relativePath = path.relative(apiPath, file);
        const { path: routePath, params } = filePathToRoutePath(relativePath);

        // TODO: Parse the file to determine the HTTP methods
        // For now, we'll default to handling all methods
        apiRoutes.push({
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            path: `/api${routePath}`,
            handler: file,
            params
        });
    }

    return apiRoutes;
}