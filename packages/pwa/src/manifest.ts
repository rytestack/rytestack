/**
 * @fileoverview Web app manifest utilities
 *
 * Utilities for creating and validating web app manifests.
 */
import { z } from 'zod';

/**
 * Schema for web app manifest
 */
export const ManifestSchema = z.object({
    /**
     * Name of the web application
     */
    name: z.string(),

    /**
     * Short name of the web application
     */
    short_name: z.string().optional(),

    /**
     * Description of the web application
     */
    description: z.string().optional(),

    /**
     * Start URL of the web application
     */
    start_url: z.string().default('/'),

    /**
     * Display mode of the web application
     */
    display: z.enum(['fullscreen', 'standalone', 'minimal-ui', 'browser']).default('standalone'),

    /**
     * Orientation of the web application
     */
    orientation: z.enum([
        'any', 'natural', 'landscape', 'portrait',
        'portrait-primary', 'portrait-secondary',
        'landscape-primary', 'landscape-secondary'
    ]).optional(),

    /**
     * Theme color of the web application
     */
    theme_color: z.string().optional(),

    /**
     * Background color of the web application
     */
    background_color: z.string().optional(),

    /**
     * Scope of the web application
     */
    scope: z.string().default('/'),

    /**
     * Icons for the web application
     */
    icons: z.array(
        z.object({
            src: z.string(),
            sizes: z.string(),
            type: z.string().optional(),
            purpose: z.enum(['any', 'maskable', 'monochrome']).optional()
        })
    ).optional(),

    /**
     * Screenshots of the web application
     */
    screenshots: z.array(
        z.object({
            src: z.string(),
            sizes: z.string(),
            type: z.string().optional(),
            platform: z.string().optional()
        })
    ).optional(),

    /**
     * Shortcuts for the web application
     */
    shortcuts: z.array(
        z.object({
            name: z.string(),
            short_name: z.string().optional(),
            description: z.string().optional(),
            url: z.string(),
            icons: z.array(
                z.object({
                    src: z.string(),
                    sizes: z.string(),
                    type: z.string().optional()
                })
            ).optional()
        })
    ).optional(),

    /**
     * Related applications
     */
    related_applications: z.array(
        z.object({
            platform: z.string(),
            url: z.string(),
            id: z.string().optional()
        })
    ).optional(),

    /**
     * Whether to prefer related applications
     */
    prefer_related_applications: z.boolean().optional()
});

/**
 * Web app manifest type
 */
export type WebAppManifest = z.infer<typeof ManifestSchema>;

/**
 * Default manifest values
 */
export const DEFAULT_MANIFEST: WebAppManifest = {
    name: 'Rytestack App',
    short_name: 'Rytestack',
    description: 'A Rytestack application',
    start_url: '/',
    display: 'standalone',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    scope: '/',
    icons: [
        {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
        },
        {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
        },
        {
            src: '/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
        }
    ]
};

/**
 * Creates a web app manifest
 *
 * @param options Manifest options
 * @returns Web app manifest
 *
 * @example
 * ```typescript
 * const manifest = createManifest({
 *   name: 'My PWA',
 *   short_name: 'PWA',
 *   theme_color: '#4285f4',
 *   background_color: '#ffffff',
 *   icons: [
 *     {
 *       src: '/icons/icon-192.png',
 *       sizes: '192x192',
 *       type: 'image/png'
 *     },
 *     {
 *       src: '/icons/icon-512.png',
 *       sizes: '512x512',
 *       type: 'image/png'
 *     }
 *   ]
 * });
 * ```
 */
export function createManifest(options: Partial<WebAppManifest>): WebAppManifest {
    // Merge with default manifest
    const manifest = {
        ...DEFAULT_MANIFEST,
        ...options
    };

    // Validate manifest
    const result = ManifestSchema.safeParse(manifest);

    if (!result.success) {
        console.error('Invalid manifest:', result.error.format());
        return DEFAULT_MANIFEST;
    }

    return result.data;
}

/**
 * Generates HTML for the manifest
 *
 * @param manifest Web app manifest
 * @returns HTML string
 */
export function generateManifestHtml(manifest: WebAppManifest): string {
    return `
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="theme-color" content="${manifest.theme_color || '#ffffff'}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="${manifest.short_name || manifest.name}">
    ${manifest.icons?.map(icon => `
      <link rel="apple-touch-icon" sizes="${icon.sizes}" href="${icon.src}">
    `).join('') || ''}
  `;
}