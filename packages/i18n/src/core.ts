/**
 * @fileoverview Core internationalization functionality
 *
 * Core functionality for the internationalization system.
 */
import IntlMessageFormat from 'intl-messageformat';
import {
    I18nConfig,
    LocaleInfo,
    LocaleDirection,
    MessageFormatter,
    TranslationMap,
    TranslationResources,
    I18n
} from './types';
import { detectLocale, isRTL } from './utils';

/**
 * Default RTL locales
 */
const DEFAULT_RTL_LOCALES = ['ar', 'he', 'fa', 'ur', 'ps', 'dv', 'ha'];

/**
 * Default configuration
 */
const DEFAULT_CONFIG: I18nConfig = {
    defaultLocale: 'en',
    locales: ['en'],
    autoDetect: true,
    namespaceSeparator: ':',
    rtlLocales: DEFAULT_RTL_LOCALES
};

/**
 * Create locales info from config
 *
 * @param config Internationalization config
 * @returns Array of locale info
 */
function createLocalesInfo(config: I18nConfig): LocaleInfo[] {
    // Convert locales to locale info objects
    if (typeof config.locales[0] === 'string') {
        const locales = config.locales as string[];
        return locales.map(code => ({
            code,
            name: new Intl.DisplayNames([code], { type: 'language' }).of(code) || code,
            dir: isRTL(code, config.rtlLocales || DEFAULT_RTL_LOCALES) ? 'rtl' : 'ltr',
            isDefault: code === config.defaultLocale
        }));
    }

    return config.locales as LocaleInfo[];
}

/**
 * Creates an i18n instance
 *
 * @param config Internationalization configuration
 * @returns I18n instance
 *
 * @example
 * ```typescript
 * const i18n = createI18n({
 *   defaultLocale: 'en',
 *   locales: ['en', 'fr', 'es'],
 *   resources: {
 *     en: {
 *       hello: 'Hello, {name}!',
 *       homepage: {
 *         title: 'Welcome to our website'
 *       }
 *     },
 *     fr: {
 *       hello: 'Bonjour, {name}!',
 *       homepage: {
 *         title: 'Bienvenue sur notre site'
 *       }
 *     }
 *   }
 * });
 *
 * // Usage:
 * i18n.t('hello', { name: 'World' }); // "Hello, World!"
 * i18n.t('homepage:title'); // "Welcome to our website"
 *
 * await i18n.changeLocale('fr');
 * i18n.t('hello', { name: 'Monde' }); // "Bonjour, Monde!"
 * ```
 */
export function createI18n(config: Partial<I18nConfig> = {}): I18n {
    // Merge with default config
    const mergedConfig: I18nConfig = {
        ...DEFAULT_CONFIG,
        ...config
    };

    // Create locale info
    const localesInfo = createLocalesInfo(mergedConfig);

    // Detect initial locale if auto-detect is enabled
    let currentLocale = mergedConfig.defaultLocale;

    if (mergedConfig.autoDetect && typeof window !== 'undefined') {
        const detectedLocale = detectLocale(
            localesInfo.map(locale => locale.code),
            mergedConfig.defaultLocale
        );

        if (detectedLocale) {
            currentLocale = detectedLocale;
        }
    }

    // Initialize translations
    const translations: TranslationResources = mergedConfig.resources || {};

    // Create message formatters cache
    const formatters: Record<string, Record<string, MessageFormatter>> = {};

    /**
     * Gets a formatter for a message
     *
     * @param locale Locale
     * @param message Message template
     * @returns Message formatter
     */
    function getFormatter(locale: string, message: string): MessageFormatter {
        // Initialize locale formatters if needed
        if (!formatters[locale]) {
            formatters[locale] = {};
        }

        // Create formatter if needed
        if (!formatters[locale][message]) {
            try {
                const formatter = new IntlMessageFormat(message, locale);
                formatters[locale][message] = (message, values) => formatter.format(values || {}) as string;
            } catch (error) {
                // Fallback formatter
                formatters[locale][message] = (message) => message;
                console.error(`Error creating formatter for message "${message}":`, error);
            }
        }

        return formatters[locale][message];
    }

    /**
     * Gets a value from a nested object using a path
     *
     * @param obj Object to get value from
     * @param path Path to value
     * @param separator Path separator
     * @returns Value or null if not found
     */
    function getNestedValue(obj: any, path: string, separator: string): any {
        const parts = path.split(separator);

        let current = obj;

        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return null;
            }

            current = current[part];
        }

        return current;
    }

    // Create i18n instance
    const i18n: I18n = {
        get locale() {
            return currentLocale;
        },

        locales: localesInfo,

        defaultLocale: mergedConfig.defaultLocale,

        t(key: string, values?: Record<string, any>): string {
            // Get translations for current locale
            const localeTranslations = translations[currentLocale] || {};

            // Try to get the translation
            let message = getNestedValue(localeTranslations, key, mergedConfig.namespaceSeparator || ':');

            // If not found, try default locale
            if (!message && currentLocale !== mergedConfig.defaultLocale) {
                const defaultTranslations = translations[mergedConfig.defaultLocale] || {};
                message = getNestedValue(defaultTranslations, key, mergedConfig.namespaceSeparator || ':');
            }

            // If still not found, return the key
            if (!message) {
                return key;
            }

            // If message is not a string, return it
            if (typeof message !== 'string') {
                return String(message);
            }

            // Format the message
            try {
                const formatter = getFormatter(currentLocale, message);
                return formatter(message, values);
            } catch (error) {
                console.error(`Error formatting message "${key}":`, error);
                return message;
            }
        },

        async changeLocale(locale: string): Promise<void> {
            // Validate locale
            if (!localesInfo.some(info => info.code === locale)) {
                throw new Error(`Locale "${locale}" is not supported`);
            }

            // If already using this locale, do nothing
            if (currentLocale === locale) {
                return;
            }

            // Load translations if needed
            if (!translations[locale] && mergedConfig.loader) {
                try {
                    translations[locale] = await mergedConfig.loader(locale);
                } catch (error) {
                    console.error(`Error loading translations for locale "${locale}":`, error);
                    translations[locale] = {};
                }
            }

            // Change locale
            currentLocale = locale;

            // Update document direction if needed
            if (typeof document !== 'undefined') {
                const dir = i18n.getDirection();
                document.documentElement.setAttribute('dir', dir);
                document.documentElement.setAttribute('lang', locale);
            }
        },

        getDirection(): LocaleDirection {
            const localeInfo = localesInfo.find(info => info.code === currentLocale);
            return localeInfo?.dir || 'ltr';
        },

        addTranslations(locale: string, newTranslations: TranslationMap): void {
            // Initialize locale translations if needed
            if (!translations[locale]) {
                translations[locale] = {};
            }

            // Merge new translations
            translations[locale] = {
                ...translations[locale],
                ...newTranslations
            };

            // Clear formatters cache for this locale
            if (formatters[locale]) {
                formatters[locale] = {};
            }
        }
    };

    return i18n;
}