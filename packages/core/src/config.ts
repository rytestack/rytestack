/**
 * @fileoverview Configuration types and utilities
 *
 * Defines the configuration schema and utilities for validating
 * and resolving configuration for Rytestack applications.
 */
import { z } from 'zod';

/**
 * Available frontend frameworks supported by Rytestack
 */
export const SupportedFrameworks = ['react', 'vue', 'svelte'] as const;
export type Framework = typeof SupportedFrameworks[number];

/**
 * Available deployment targets supported by Rytestack
 */
export const DeploymentTargets = ['cloudflare', 'vercel', 'netlify', 'node'] as const;
export type DeploymentTarget = typeof DeploymentTargets[number];

/**
 * Schema for Rytestack configuration file
 */
export const RytestackConfigSchema = z.object({
    /**
     * The frontend framework to use (react, vue, svelte)
     */
    framework: z.enum(SupportedFrameworks).default('react'),

    /**
     * Root directory of the source code
     */
    srcDir: z.string().default('./src'),

    /**
     * Output directory for the build
     */
    outDir: z.string().default('./dist'),

    /**
     * Public directory for static assets
     */
    publicDir: z.string().default('./public'),

    /**
     * Deployment target configuration
     */
    deployment: z.object({
        /**
         * Target platform for deployment
         */
        target: z.enum(DeploymentTargets).default('cloudflare'),

        /**
         * Additional configuration specific to the deployment target
         */
        config: z.record(z.any()).optional()
    }).default({}),

    /**
     * Server-side rendering options
     */
    ssr: z.object({
        /**
         * Enable server-side rendering
         */
        enabled: z.boolean().default(true),

        /**
         * Enable streaming SSR when supported
         */
        streaming: z.boolean().default(true)
    }).default({}),

    /**
     * Progressive Web App configuration
     */
    pwa: z.object({
        /**
         * Enable PWA features
         */
        enabled: z.boolean().default(false),

        /**
         * Manifest configuration
         */
        manifest: z.object({
            name: z.string(),
            short_name: z.string().optional(),
            description: z.string().optional(),
            theme_color: z.string().optional(),
            background_color: z.string().optional(),
            display: z.string().default('standalone'),
            scope: z.string().default('/')
        }).optional()
    }).default({ enabled: false }),

    /**
     * Internationalization configuration
     */
    i18n: z.object({
        /**
         * Enable i18n features
         */
        enabled: z.boolean().default(false),

        /**
         * Default locale
         */
        defaultLocale: z.string().default('en'),

        /**
         * Supported locales
         */
        locales: z.array(z.string()).default(['en']),

        /**
         * Whether to auto-detect locale from browser
         */
        autoDetect: z.boolean().default(true)
    }).default({ enabled: false })
});

/**
 * Type of Rytestack configuration
 */
export type RytestackConfig = z.infer<typeof RytestackConfigSchema>;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: RytestackConfig = {
    framework: 'react',
    srcDir: './src',
    outDir: './dist',
    publicDir: './public',
    deployment: {
        target: 'cloudflare'
    },
    ssr: {
        enabled: true,
        streaming: true
    },
    pwa: {
        enabled: false
    },
    i18n: {
        enabled: false,
        defaultLocale: 'en',
        locales: ['en'],
        autoDetect: true
    }
};

/**
 * Load and validate configuration from a file
 *
 * @param configPath Path to the configuration file
 * @returns Validated configuration object
 */
export async function loadConfig(configPath: string): Promise<RytestackConfig> {
    try {
        // Use dynamic import to load the config file
        const userConfig = await import(configPath);

        // Validate against the schema
        const result = RytestackConfigSchema.safeParse(userConfig.default || userConfig);

        if (!result.success) {
            console.error('Invalid configuration:', result.error.format());
            return DEFAULT_CONFIG;
        }

        return result.data;
    } catch (error) {
        console.warn(`Could not load config from ${configPath}, using defaults`, error);
        return DEFAULT_CONFIG;
    }
}