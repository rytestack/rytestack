/**
 * @fileoverview HTTP API loader
 *
 * Loader for translations from an HTTP API.
 */
import { TranslationLoader, TranslationMap } from '../types';

/**
 * Options for the HTTP loader
 */
export interface HttpLoaderOptions {
    /**
     * API URL pattern
     */
    urlPattern: string;

    /**
     * Request headers
     */
    headers?: Record<string, string>;

    /**
     * Request options
     */
    fetchOptions?: RequestInit;
}

/**
 * Creates a loader for translations from an HTTP API
 *
 * @param options Loader options
 * @returns Translation loader function
 *
 * @example
 * ```typescript
 * const loader = createHttpLoader({
 *   urlPattern: 'https://api.example.com/i18n/{locale}',
 *   headers: {
 *     'Authorization': 'Bearer token123'
 *   }
 * });
 *
 * const translations = await loader('en');
 * ```
 */
export function createHttpLoader(options: HttpLoaderOptions): TranslationLoader {
    const { urlPattern, headers = {}, fetchOptions = {} } = options;

    return async (locale: string): Promise<TranslationMap> => {
        // Replace {locale} placeholder in URL
        const url = urlPattern.replace('{locale}', locale);

        try {
            // Fetch translations from API
            const response = await fetch(url, {
                ...fetchOptions,
                headers: {
                    ...headers,
                    ...fetchOptions.headers
                }
            });

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