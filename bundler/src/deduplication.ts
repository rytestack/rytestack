/**
 * @fileoverview Dependency deduplication utilities
 *
 * Utilities for identifying and removing duplicate dependencies.
 */
import { BuildOptions } from 'esbuild';
import { RytestackConfig } from '@rytestack/core';

/**
 * Deduplication options
 */
export interface DeduplicationOptions {
    /**
     * Whether to deduplicate common libraries
     */
    deduplicateLibraries?: boolean;

    /**
     * Libraries to exclude from deduplication
     */
    excludeFromDeduplication?: string[];

    /**
     * Whether to extract common chunks
     */
    extractCommonChunks?: boolean;

    /**
     * Minimum size for common chunks in bytes
     */
    commonChunkMinSize?: number;

    /**
     * Debug mode
     */
    debug?: boolean;
}

/**
 * Common libraries to deduplicate
 */
const COMMON_LIBRARIES = [
    'react',
    'react-dom',
    'react-router',
    'react-router-dom',
    '@tanstack/react-query',
    'vue',
    'vue-router',
    'svelte',
    '@rytestack'
];

/**
 * Enhances build configuration for dependency deduplication
 *
 * @param baseConfig Base esbuild configuration
 * @param rytestackConfig Rytestack configuration
 * @param options Deduplication options
 * @returns Enhanced build config
 */
export function enhanceDeduplication(
    baseConfig: BuildOptions,
    rytestackConfig: RytestackConfig,
    options: DeduplicationOptions = {}
): BuildOptions {
    const {
        deduplicateLibraries = true,
        excludeFromDeduplication = [],
        extractCommonChunks = true,
        commonChunkMinSize = 20 * 1024, // 20KB
        debug = false
    } = options;

    // Create enhanced config
    const enhancedConfig: BuildOptions = {
        ...baseConfig,

        // Enable code splitting required for deduplication
        splitting: true,

        // Create separate chunks for libraries
        format: 'esm',

        // Generate metadata for analysis
        metafile: true,

        // Debug log
        logLevel: debug ? 'info' : baseConfig.logLevel || 'warning',
    };

    // Add plugins for deduplication
    const plugins = [...(baseConfig.plugins || [])];

    // Add library deduplication plugin
    if (deduplicateLibraries) {
        plugins.push({
            name: 'library-deduplication',
            setup(build) {
                // Get libraries to deduplicate
                const libraries = COMMON_LIBRARIES.filter(
                    lib => !excludeFromDeduplication.includes(lib)
                );

                // Create a namespace for deduplicated modules
                const namespace = 'deduplicated-libs';

                // Track resolved libraries
                const resolvedLibs = new Map();

                // Handle resolve
                build.onResolve({ filter: /.*/ }, args => {
                    // Skip non-library imports
                    if (args.kind !== 'import-statement' || !args.path.startsWith('@') && !args.path.includes('/')) {
                        return null;
                    }

                    // Check if this is a library to deduplicate
                    const isDeduplicatable = libraries.some(lib => {
                        return args.path === lib || args.path.startsWith(`${lib}/`);
                    });

                    if (!isDeduplicatable) {
                        return null;
                    }

                    // Check if we've already resolved this library
                    if (resolvedLibs.has(args.path)) {
                        return {
                            namespace,
                            path: args.path
                        };
                    }

                    // Resolve the library as normal
                    return null;
                });

                // Handle load
                build.onLoad({ filter: /.*/, namespace }, args => {
                    // Get the cached resolution
                    const resolution = resolvedLibs.get(args.path);

                    if (resolution) {
                        return {
                            contents: resolution.contents,
                            loader: resolution.loader
                        };
                    }

                    return null;
                });
            }
        });
    }

    // TODO: Add common chunk extraction plugin
    // This would typically be implemented as a post-build step
    // that analyzes the metafile and combines common chunks

    // Set the enhanced plugins
    enhancedConfig.plugins = plugins;

    return enhancedConfig;
}

/**
 * Analyzes dependencies for deduplication opportunities
 *
 * @param metafile Metafile from esbuild
 * @returns Deduplication opportunities
 */
export function analyzeDuplicateDependencies(metafile: any) {
    if (!metafile || !metafile.outputs) {
        return {
            duplicates: [],
            commonCodeSize: 0
        };
    }

    // Track duplicate modules
    const moduleUsage = new Map<string, string[]>();

    // Process all output chunks
    for (const [outputPath, outputInfo] of Object.entries(metafile.outputs)) {
        // Skip non-JS files
        if (!outputPath.endsWith('.js')) {
            continue;
        }

        // Process imports
        const imports = outputInfo.imports || [];
        for (const imp of imports) {
            // Register this module
            if (!moduleUsage.has(imp.path)) {
                moduleUsage.set(imp.path, []);
            }

            moduleUsage.get(imp.path)!.push(outputPath);
        }
    }

    // Find duplicate modules
    const duplicates = [];
    let commonCodeSize = 0;

    for (const [modulePath, usedBy] of moduleUsage.entries()) {
        if (usedBy.length > 1) {
            // Get module info
            const moduleInfo = metafile.inputs?.[modulePath];
            const moduleSize = moduleInfo?.bytes || 0;

            duplicates.push({
                module: modulePath,
                usedBy,
                size: moduleSize,
                sizeFormatted: formatBytes(moduleSize)
            });

            commonCodeSize += moduleSize;
        }
    }

    return {
        duplicates: duplicates.sort((a, b) => b.size - a.size),
        commonCodeSize,
        commonCodeSizeFormatted: formatBytes(commonCodeSize)
    };
}

/**
 * Formats bytes to a human-readable string
 *
 * @param bytes Bytes to format
 * @returns Formatted string
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}