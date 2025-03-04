/**
 * @fileoverview Dynamic imports optimization
 *
 * Utilities for optimizing dynamic imports and code splitting.
 */
import { BuildOptions } from 'esbuild';
import { RytestackConfig } from '@rytestack/core';

/**
 * Dynamic imports configuration
 */
export interface DynamicImportsConfig {
    /**
     * Routes to preload
     */
    preloadRoutes?: string[];

    /**
     * Chunks to prefetch
     */
    prefetchChunks?: string[];

    /**
     * Custom chunk naming pattern
     */
    chunkNaming?: 'hash' | 'name' | 'content';

    /**
     * Whether to generate runtime chunk maps
     */
    generateChunkMap?: boolean;
}

/**
 * Enhances build configuration for dynamic imports
 *
 * @param baseConfig Base esbuild configuration
 * @param rytestackConfig Rytestack configuration
 * @param options Dynamic imports options
 * @returns Enhanced build configuration
 */
export function enhanceDynamicImports(
    baseConfig: BuildOptions,
    rytestackConfig: RytestackConfig,
    options: DynamicImportsConfig = {}
): BuildOptions {
    const {
        chunkNaming = 'name',
        generateChunkMap = true
    } = options;

    // Create enhanced config
    const enhancedConfig: BuildOptions = {
        ...baseConfig,

        // Always enable code splitting for dynamic imports
        splitting: true,

        // Use ES modules format required for code splitting
        format: 'esm',

        // Custom chunk names for better debugging and caching
        chunkNames: chunkNaming === 'hash'
            ? '_chunks/[hash]'
            : chunkNaming === 'content'
                ? '_chunks/[hash]-[name]'
                : '_chunks/[name]-[hash]',

        // Create metadata for post-processing
        metafile: generateChunkMap,
    };

    return enhancedConfig;
}

/**
 * Creates a dynamic import with preload/prefetch capabilities
 *
 * @example
 * ```typescript
 * // Instead of:
 * const Page = React.lazy(() => import('./pages/About'));
 *
 * // Use:
 * const Page = lazyImport(() => import('./pages/About'), { preload: true });
 *
 * // Usage with prefetch:
 * const UserPage = lazyImport(() => import('./pages/User'), {
 *   prefetch: 'hover',
 *   fallback: <Loading />
 * });
 * ```
 */
export function createLazyImportFactory() {
    // Create or get the prefetch manager
    const prefetchManager = {
        prefetched: new Set<string>(),
        preloaded: new Set<string>(),

        prefetch: (importFn: () => Promise<any>) => {
            // Convert function to string to use as key
            const key = importFn.toString();

            if (!prefetchManager.prefetched.has(key)) {
                // Trigger the import without awaiting
                setTimeout(() => {
                    importFn().catch(() => {
                        // Silently catch errors from prefetching
                    });
                }, 0);

                prefetchManager.prefetched.add(key);
            }
        },

        preload: (importFn: () => Promise<any>) => {
            // Convert function to string to use as key
            const key = importFn.toString();

            if (!prefetchManager.preloaded.has(key)) {
                // Execute immediately
                importFn().catch(() => {
                    // Silently catch errors from preloading
                });

                prefetchManager.preloaded.add(key);
            }
        }
    };

    /**
     * Creates a lazy-loaded component with optimal loading
     *
     * @param importFn Dynamic import function
     * @param options Lazy loading options
     * @returns Lazy-loaded component
     */
    return function lazyImport<T>(
        importFn: () => Promise<{ default: T }>,
        options: {
            /**
             * Preload immediately (good for critical paths)
             */
            preload?: boolean;

            /**
             * Prefetch strategy
             */
            prefetch?: 'hover' | 'visible' | boolean;

            /**
             * Component to show while loading
             */
            fallback?: any;

            /**
             * Load timeout in milliseconds
             */
            timeout?: number;
        } = {}
    ) {
        const {
            preload = false,
            prefetch = false,
            timeout
        } = options;

        // Handle preloading
        if (preload) {
            prefetchManager.preload(importFn);
        }

        // Handle prefetching - future implementation
        if (prefetch && !preload) {
            prefetchManager.prefetch(importFn);
        }

        // Create enhanced import function
        const enhancedImporter = () => {
            let importPromise = importFn();

            // Add timeout if specified
            if (timeout) {
                importPromise = Promise.race([
                    importPromise,
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new Error(`Dynamic import timed out after ${timeout}ms`)),
                            timeout
                        )
                    )
                ]);
            }

            return importPromise;
        };

        // Return lazy loader
        // Actual implementation will depend on the framework:
        // For React: return React.lazy(enhancedImporter);
        // For Vue: return () => ({ component: enhancedImporter(), loading: options.fallback });
        // For Svelte: return { loader: enhancedImporter, loading: options.fallback };

        // This is a framework-agnostic return
        return {
            importFn: enhancedImporter,
            prefetchManager
        };
    };
}

/**
 * Generates a chunk map for the application
 *
 * @param metafile Metafile from esbuild
 * @returns Chunk map for client
 */
export function generateChunkMap(metafile: any) {
    if (!metafile || !metafile.outputs) {
        return {};
    }

    const chunkMap = {};
    const outputEntries = Object.entries(metafile.outputs);

    for (const [outputPath, outputInfo] of outputEntries) {
        // Skip non-JS files
        if (!outputPath.endsWith('.js')) {
            continue;
        }

        // Get import paths
        const importedBy = new Set<string>();

        // Find imports to this chunk
        for (const [otherPath, otherInfo] of outputEntries) {
            if (otherInfo.imports?.some(imp => imp.path === outputPath)) {
                importedBy.add(otherPath);
            }
        }

        // Add to chunk map
        chunkMap[outputPath] = {
            size: outputInfo.bytes,
            imports: outputInfo.imports?.map(imp => imp.path) || [],
            importedBy: Array.from(importedBy)
        };
    }

    return chunkMap;
}