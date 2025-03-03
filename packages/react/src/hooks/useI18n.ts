/**
 * @fileoverview useI18n hook
 *
 * Hook for internationalization support.
 */
import { useCallback, useMemo } from 'react';

/**
 * Type for translation messages
 */
export type TranslationMessages = Record<string, string>;

/**
 * Data returned by the useI18n hook
 */
export interface I18nHookResult {
    /**
     * Current locale code
     */
    locale: string;

    /**
     * Available locales
     */
    locales: string[];

    /**
     * Default locale
     */
    defaultLocale: string;

    /**
     * Translate a message key to the current locale
     */
    t: (key: string, params?: Record<string, string | number>) => string;

    /**
     * Change the current locale
     */
    changeLocale: (locale: string) => void;

    /**
     * Direction (ltr or rtl) for the current locale
     */
    dir: 'ltr' | 'rtl';
}

// Global state for i18n (simplified for now)
const i18nState = {
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    messages: {} as Record<string, TranslationMessages>,
    rtlLocales: ['ar', 'he', 'fa', 'ur']
};

/**
 * Hook for internationalization support
 *
 * @returns Internationalization utilities
 *
 * @example
 * ```tsx
 * const { t, locale, changeLocale } = useI18n();
 * return <h1>{t('welcome', { name: 'John' })}</h1>;
 * ```
 */
export function useI18n(): I18nHookResult {
    // Get the current locale and messages
    const { locale, locales, defaultLocale, messages, rtlLocales } = i18nState;
    const currentMessages = messages[locale] || {};

    // Translation function
    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        let message = currentMessages[key] || key;

        // Replace parameters
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                message = message.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
            });
        }

        return message;
    }, [currentMessages]);

    // Change locale function
    const changeLocale = useCallback((newLocale: string): void => {
        if (locales.includes(newLocale)) {
            i18nState.locale = newLocale;

            // This is a simplified implementation, in a real app we would
            // have a proper state management solution
            window.location.reload();
        }
    }, [locales]);

    // Determine text direction
    const dir = useMemo((): 'ltr' | 'rtl' => {
        return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
    }, [locale, rtlLocales]);

    return {
        locale,
        locales,
        defaultLocale,
        t,
        changeLocale,
        dir
    };
}