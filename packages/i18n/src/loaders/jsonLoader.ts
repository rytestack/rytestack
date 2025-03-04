/**
 * @fileoverview JSON file loader
 *
 * Loader for JSON translation files.
 */
import { TranslationLoader, TranslationMap } from '../types';

/**
 * Options for the JSON loader
 */
export interface JsonLoaderOptions {
    /**
     * Base path to translation files
     */
    basePath?: string;

    /**
     * File naming pattern
     */
    filePattern?: string;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: JsonLoaderOptions = {
    basePath: '/locales',
    filePattern: '{locale}.json'
};

/**
 * Creates a loader for JSON translation files
 *
 * @param options Loader options
 * @returns Translation loader function
 *
 * @example
 * ```typescript
 * const loader = createJsonLoader({
 *   basePath: '/assets/i18n',
 *   filePattern: '{locale}.json'
 * });
 *
 * const translations = await loader('en');
 * ```
 */
export function createJsonLoader(options: JsonLoaderOptions = {}): TranslationLoader {
    const { basePath, filePattern } = { ...DEFAULT_OPTIONS, ...options };

    return async (locale: string): Promise<TranslationMap> => {
        // Only available in browser
        if (typeof window === 'undefined') {
            return {};
        }

        // Create file path
        const filePath = `${basePath}/${filePattern.replace('{locale}', locale)}`;

        try {
            // Fetch translation file
            const response = await fetch(filePath);

            if (!response.ok) {
                throw new Error(`Failed to load translations for locale "${locale}": ${response.statusText}`);
            }

            // Parse JSON
            const translations = await response.json();

            return translations;
        } catch (error) {
            console.error(`Error loading translations for locale "${locale}":`, error);
            return {};
        }
    };
}