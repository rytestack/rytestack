/**
 * @fileoverview Tree-shaking configuration and utilities
 *
 * Improves tree-shaking for Rytestack applications.
 */
import { BuildOptions } from 'esbuild';
import { RytestackConfig } from '@rytestack/core';

/**
 * Advanced tree-shaking options
 */
export interface TreeShakingOptions {
    /**
     * Whether to ignore side effects in package.json
     */
    ignoreSideEffects?: boolean;

    /**
     * Additional packages to mark as pure (side-effect free)
     */
    purePackages?: string[];

    /**
     * Whether to enable verbose debug logging for tree-shaking
     */
    debug?: boolean;
}

/**
 * Default pure packages that are known to be side-effect free
 */
const DEFAULT_PURE_PACKAGES = [
    'lodash',
    'lodash-es',
    'ramda',
    'date-fns',
    'zod',
    'tailwind-merge',
    'clsx',
    'class-variance-authority'
];

/**
 * Pure function annotation comment
 * Used to mark functions as pure for more aggressive tree-shaking
 */
const PURE_ANNOTATION = '/*#__PURE__*/';

/**
 * Creates an esbuild configuration with enhanced tree-shaking
 *
 * @param baseConfig Base esbuild configuration
 * @param rytestackConfig Rytestack configuration
 * @param options Tree-shaking options
 * @returns Enhanced esbuild configuration
 */
export function enhanceTreeShaking(
    baseConfig: BuildOptions,
    rytestackConfig: RytestackConfig,
    options: TreeShakingOptions = {}
): BuildOptions {
    const {
        ignoreSideEffects = true,
        purePackages = [],
        debug = false
    } = options;

    // Mark known packages as pure
    const allPurePackages = [...DEFAULT_PURE_PACKAGES, ...purePackages];

    // Create enhanced config
    const enhancedConfig: BuildOptions = {
        ...baseConfig,

        // Always use minify for production builds
        minify: rytestackConfig.mode === 'production',

        // Enable code splitting for better tree-shaking
        splitting: true,

        // Use ES modules for better tree-shaking
        format: 'esm',

        // Keep names in production for debugging if needed
        keepNames: debug,

        // Pure calls for better tree-shaking
        pure: ['useEffect', 'useMemo', 'useCallback', 'memo', 'createElement'],

        // Advanced optimizations
        treeShaking: true,
        ignoreAnnotations: false,

        // Add banner for pure annotations
        banner: debug ? `console.log("Tree-shaking enabled for: ${allPurePackages.join(', ')}");` : undefined,

        // Advanced minification options
        minifyOptions: {
            keepNames: debug,
            pure: true
        }
    };

    return enhancedConfig;
}

/**
 * Creates a code transformer for adding pure annotations
 *
 * @returns Code transformer function
 */
export function createPureAnnotationTransformer() {
    return {
        name: 'pure-annotations',
        transform(code: string, id: string) {
            // Skip node_modules except for specific packages that benefit from annotations
            if (id.includes('node_modules') && !id.includes('@rytestack')) {
                return code;
            }

            // Add /*#__PURE__*/ annotations to function calls
            return code
                // Arrow functions
                .replace(
                    /const\s+(\w+)\s*=\s*(\([^)]*\))\s*=>/g,
                    `const $1 = ${PURE_ANNOTATION}$2 =>`
                )
                // React component declarations
                .replace(
                    /function\s+(\w+)Component\s*\(/g,
                    `${PURE_ANNOTATION}function $1Component(`
                )
                // Hook calls
                .replace(
                    /(use\w+)\(/g,
                    `${PURE_ANNOTATION}$1(`
                );
        }
    };
}

/**
 * Analyzes a package for tree-shaking opportunities
 *
 * @param packageName Package name or path
 * @returns Analysis results
 */
export async function analyzeTreeShakingOpportunities(packageName: string) {
    try {
        // Import analysis utilities
        const fs = await import('fs');
        const path = await import('path');
        const glob = await import('glob');

        // Find the package
        const basePath = path.resolve('node_modules', packageName);

        // Check if package exists
        if (!fs.existsSync(basePath)) {
            return {
                error: `Package ${packageName} not found`
            };
        }

        // Check for package.json
        const packageJsonPath = path.join(basePath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return {
                error: `Package ${packageName} has no package.json`
            };
        }

        // Load package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Check for sideEffects
        const hasSideEffects = packageJson.sideEffects !== false;

        // Check for module field (ESM support)
        const hasEsmSupport = !!packageJson.module || !!packageJson.exports;

        // Find JS files
        const jsFiles = await glob.glob('**/*.{js,jsx,ts,tsx}', { cwd: basePath });

        // Count files with side effects
        let filesWithSideEffects = 0;

        // Sample a few files to check for side effects
        const sampleSize = Math.min(jsFiles.length, 10);
        const sampleFiles = jsFiles.slice(0, sampleSize);

        for (const file of sampleFiles) {
            const content = fs.readFileSync(path.join(basePath, file), 'utf-8');

            // Simple heuristic to detect side effects
            if (
                content.includes('window.') ||
                content.includes('document.') ||
                content.includes('global.') ||
                content.includes('process.') ||
                content.includes('addEventListener(') ||
                /^(?!\/\/|\/\*|import|export).+/m.test(content)
            ) {
                filesWithSideEffects++;
            }
        }

        // Calculate percentage of files with side effects
        const sideEffectsPercentage = sampleFiles.length > 0
            ? (filesWithSideEffects / sampleFiles.length) * 100
            : 0;

        return {
            packageName,
            hasSideEffects,
            hasEsmSupport,
            totalFiles: jsFiles.length,
            sideEffectsPercentage: Math.round(sideEffectsPercentage),
            recommendation: !hasSideEffects && hasEsmSupport
                ? 'Good for tree-shaking'
                : hasEsmSupport && sideEffectsPercentage < 20
                    ? 'Potential for tree-shaking with custom configuration'
                    : 'Not ideal for tree-shaking'
        };
    } catch (error) {
        return {
            error: `Error analyzing ${packageName}: ${error}`
        };
    }
}