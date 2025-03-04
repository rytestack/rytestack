/**
 * @fileoverview Build utilities for Rytestack
 *
 * Handles the build process for Rytestack applications,
 * including bundling, optimization, and code generation.
 */
import { BuildOptions } from 'esbuild';
import { RytestackConfig } from './config';

// Import optimizations if available
let bundlerModule: any;
try {
    bundlerModule = require('@rytestack/bundler');
} catch (error) {
    // Optional dependency, ignore if not available
}

/**
 * Build mode (development or production)
 */
export type BuildMode = 'development' | 'production';

/**
 * Common build options
 */
export interface CommonBuildOptions {
    /**
     * Build mode
     */
    mode: BuildMode;

    /**
     * Framework configuration
     */
    config: RytestackConfig;

    /**
     * Entry points
     */
    entryPoints: string[];

    /**
     * Output directory
     */
    outdir: string;

    /**
     * Enable bundle analysis
     */
    analyze?: boolean;

    /**
     * Performance optimizations
     */
    optimizations?: {
        /**
         * Tree-shaking enhancements
         */
        treeShaking?: boolean;

        /**
         * Dynamic imports optimization
         */
        dynamicImports?: boolean;

        /**
         * Dependency deduplication
         */
        deduplication?: boolean;
    };
}

/**
 * Creates esbuild configuration for client build
 *
 * @param options Common build options
 * @returns esbuild configuration
 */
export function createClientBuildConfig(options: CommonBuildOptions): BuildOptions {
    const {
        mode,
        config,
        entryPoints,
        outdir,
        analyze = false,
        optimizations = {}
    } = options;

    // Base configuration
    let buildConfig: BuildOptions = {
        entryPoints,
        outdir,
        bundle: true,
        minify: mode === 'production',
        splitting: true,
        format: 'esm',
        target: ['es2020', 'chrome80', 'firefox80', 'safari14'],
        sourcemap: mode === 'development',
        metafile: true,
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
            'process.env.RYTESTACK_CLIENT': 'true'
        }
    };

    // Apply optimizations if bundler module is available
    if (bundlerModule) {
        // Apply tree-shaking optimizations
        if (optimizations.treeShaking !== false && bundlerModule.enhanceTreeShaking) {
            buildConfig = bundlerModule.enhanceTreeShaking(buildConfig, config);
        }

        // Apply dynamic imports optimizations
        if (optimizations.dynamicImports !== false && bundlerModule.enhanceDynamicImports) {
            buildConfig = bundlerModule.enhanceDynamicImports(buildConfig, config);
        }

        // Apply deduplication optimizations
        if (optimizations.deduplication !== false && bundlerModule.enhanceDeduplication) {
            buildConfig = bundlerModule.enhanceDeduplication(buildConfig, config);
        }

        // Apply bundle analyzer if enabled
        if (analyze && bundlerModule.enhanceBundleAnalyzer) {
            buildConfig = bundlerModule.enhanceBundleAnalyzer(buildConfig, config, {
                enabled: true,
                openReport: true
            });
        }
    }

    return buildConfig;
}

/**
 * Creates esbuild configuration for server build
 *
 * @param options Common build options
 * @returns esbuild configuration
 */
export function createServerBuildConfig(options: CommonBuildOptions): BuildOptions {
    // Server builds typically need less optimization
    // as they're not sent to the client
    return {
        entryPoints: options.entryPoints,
        outdir: options.outdir,
        bundle: true,
        minify: false, // No need to minify server code
        platform: 'node',
        format: 'esm',
        target: 'node16',
        sourcemap: options.mode === 'development',
        metafile: true,
        define: {
            'process.env.NODE_ENV': JSON.stringify(options.mode),
            'process.env.RYTESTACK_SERVER': 'true'
        }
    };
}