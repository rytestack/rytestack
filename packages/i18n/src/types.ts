/**
 * @fileoverview Internationalization types
 *
 * Type definitions for the internationalization system.
 */

/**
 * Message formatter function
 */
export type MessageFormatter = (message: string, values?: Record<string, any>) => string;

/**
 * Translation map type
 */
export type TranslationMap = Record<string, string | Record<string, any>>;

/**
 * Locale direction
 */
export type LocaleDirection = 'ltr' | 'rtl';

/**
 * Translation resources
 */
export interface TranslationResources {
    /**
     * Map of locales to translation maps
     */
    [locale: string]: TranslationMap;
}

/**
 * Locale information
 */
export interface LocaleInfo {
    /**
     * Locale code
     */
    code: string;

    /**
     * Locale name in its own language
     */
    name: string;

    /**
     * Locale direction
     */
    dir: LocaleDirection;

    /**
     * Whether this is the default locale
     */
    isDefault?: boolean;
}

/**
 * Translation loader function
 */
export type TranslationLoader = (locale: string) => Promise<TranslationMap>;

/**
 * Internationalization configuration
 */
export interface I18nConfig {
    /**
     * Default locale
     */
    defaultLocale: string;

    /**
     * Supported locales
     */
    locales: string[] | LocaleInfo[];

    /**
     * Whether to automatically detect locale
     */
    autoDetect?: boolean;

    /**
     * Namespace separator
     */
    namespaceSeparator?: string;

    /**
     * Locale loader
     */
    loader?: TranslationLoader;

    /**
     * Preloaded translations
     */
    resources?: TranslationResources;

    /**
     * RTL locales
     */
    rtlLocales?: string[];
}

/**
 * I18n instance
 */
export interface I18n {
    /**
     * Current locale
     */
    locale: string;

    /**
     * Available locales
     */
    locales: LocaleInfo[];

    /**
     * Default locale
     */
    defaultLocale: string;

    /**
     * Translate a message
     */
    t: (key: string, values?: Record<string, any>) => string;

    /**
     * Change locale
     */
    changeLocale: (locale: string) => Promise<void>;

    /**
     * Get locale direction
     */
    getDirection: () => LocaleDirection;

    /**
     * Add translations
     */
    addTranslations: (locale: string, translations: TranslationMap) => void;
}