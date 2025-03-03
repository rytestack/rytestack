/**
 * @fileoverview CLI utilities
 *
 * Common utilities used by CLI commands.
 */
import path from 'path';
import { resolvePath, fileExists, RytestackConfig, loadConfig, DEFAULT_CONFIG } from '@rytestack/core';

/**
 * Loads the project configuration
 *
 * @returns Project configuration
 */
export async function loadProjectConfig(): Promise<RytestackConfig> {
    const cwd = process.cwd();
    const configPaths = [
        path.join(cwd, 'rytestack.config.js'),
        path.join(cwd, 'rytestack.config.ts'),
        path.join(cwd, 'rytestack.config.mjs'),
        path.join(cwd, 'rytestack.config.cjs')
    ];

    for (const configPath of configPaths) {
        if (await fileExists(configPath)) {
            return loadConfig(configPath);
        }
    }

    console.warn('No configuration file found, using defaults.');
    return DEFAULT_CONFIG;
}