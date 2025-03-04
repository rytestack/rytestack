/**
 * @fileoverview Bundle analyzer plugin
 *
 * Plugin for analyzing and visualizing bundle contents.
 */
import { BuildOptions } from 'esbuild';
import { RytestackConfig } from '@rytestack/core';

/**
 * Bundle analyzer options
 */
export interface BundleAnalyzerOptions {
    /**
     * Whether to enable the bundle analyzer
     */
    enabled?: boolean;

    /**
     * Output file for the report
     */
    reportFile?: string;

    /**
     * Whether to open the report in a browser
     */
    openReport?: boolean;

    /**
     * Whether to generate stats for webpack-bundle-analyzer compatibility
     */
    generateStats?: boolean;
}

/**
 * Enhances build configuration with bundle analyzer
 *
 * @param baseConfig Base esbuild configuration
 * @param rytestackConfig Rytestack configuration
 * @param options Bundle analyzer options
 * @returns Enhanced build config
 */
export function enhanceBundleAnalyzer(
    baseConfig: BuildOptions,
    rytestackConfig: RytestackConfig,
    options: BundleAnalyzerOptions = {}
): BuildOptions {
    const {
        enabled = process.env.ANALYZE === 'true',
        reportFile = 'bundle-report.html',
        openReport = true,
        generateStats = false
    } = options;

    // Early return if not enabled
    if (!enabled) {
        return baseConfig;
    }

    // Create enhanced config
    const enhancedConfig: BuildOptions = {
        ...baseConfig,

        // Generate metadata required for analysis
        metafile: true,
    };

    // Add analyzer plugin
    const plugins = [...(baseConfig.plugins || [])];

    // Try to import the esbuild bundle analyzer plugin
    try {
        const { default: esbuildPluginBundleAnalyzer } = require('esbuild-plugin-bundle-analyzer');

        plugins.push(
            esbuildPluginBundleAnalyzer({
                outfile: reportFile,
                openAnalyzer: openReport,
                generateStats: generateStats
            })
        );
    } catch (error) {
        console.warn('esbuild-plugin-bundle-analyzer not found. Bundle analysis disabled.');
        console.warn('Install with: npm install -D esbuild-plugin-bundle-analyzer');
    }

    // Set the enhanced plugins
    enhancedConfig.plugins = plugins;

    return enhancedConfig;
}

/**
 * Creates a bundle visualization utility
 *
 * @param metafile Metafile from esbuild
 * @returns Visualization data
 */
export function createBundleVisualization(metafile: any) {
    if (!metafile || !metafile.outputs) {
        return {
            error: 'No metafile provided'
        };
    }

    // Process outputs
    const outputData = [];

    for (const [outputPath, outputInfo] of Object.entries(metafile.outputs)) {
        // Skip non-JS files
        if (!outputPath.endsWith('.js')) {
            continue;
        }

        // Gather imports
        const imports = [];
        for (const imp of (outputInfo.imports || [])) {
            imports.push({
                path: imp.path,
                size: metafile.inputs?.[imp.path]?.bytes || 0
            });
        }

        outputData.push({
            path: outputPath,
            size: outputInfo.bytes,
            imports
        });
    }

    // Sort by size
    outputData.sort((a, b) => b.size - a.size);

    // Generate summary
    const totalSize = outputData.reduce((sum, out) => sum + out.size, 0);
    const uniqueImports = new Set();

    outputData.forEach(out => {
        out.imports.forEach(imp => uniqueImports.add(imp.path));
    });

    // Return visualization data
    return {
        outputs: outputData,
        summary: {
            totalOutputSize: totalSize,
            totalOutputSizeFormatted: formatBytes(totalSize),
            totalOutputCount: outputData.length,
            uniqueImportCount: uniqueImports.size
        }
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