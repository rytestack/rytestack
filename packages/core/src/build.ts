/**
 * @fileoverview Build utilities for Rytestack
 *
 * Handles the build process for Rytestack applications,
 * including bundling, optimization, and code generation.
 */
import { BuildOptions } from 'esbuild';
import { RytestackConfig } from './config';

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
}

/**
 * Creates esbuild configuration for client build
 *
 * @param options Common build options
 * @returns esbuild configuration
 */
export function createClientBuildConfig(options: CommonBuildOptions): BuildOptions {
    return {
        entryPoints: options.entryPoints,
        outdir: options.outdir,
        bundle: true,
        minify: options.mode === 'production',
        splitting: true,
        format: 'esm',
        target: ['es2020', 'chrome80', 'firefox80', 'safari14'],
        sourcemap: options.mode === 'development',
        metafile: true,
        define: {
            'process.env.NODE_ENV': JSON.stringify(options.mode)
        }
    };
}

/**
 * Creates esbuild configuration for server build
 *
 * @param options Common build options
 * @returns esbuild configuration
 */
export function createServerBuildConfig(options: CommonBuildOptions): BuildOptions {
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
            'process.env.NODE_ENV': JSON.stringify(options.mode)
        }
    };
}