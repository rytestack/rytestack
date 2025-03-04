/**
 * @fileoverview Internationalization utilities
 *
 * Utility functions for the internationalization system.
 */

/**
 * Detects the user's preferred locale
 *
 * @param supportedLocales Array of supported locale codes
 * @param defaultLocale Default locale if no match found
 * @returns Detected locale code or default
 */
export function detectLocale(supportedLocales: string[], defaultLocale: string): string {
    // Browser environment check
    if (typeof window === 'undefined' || !window.navigator) {
        return defaultLocale;
    }

    // Try to get locale from URL or cookie
    const urlLocale = getLocaleFromUrl();
    if (urlLocale && supportedLocales.includes(urlLocale)) {
        return urlLocale;
    }

    const cookieLocale = getLocaleFromCookie();
    if (cookieLocale && supportedLocales.includes(cookieLocale)) {
        return cookieLocale;
    }

    // Try navigator.languages
    if (window.navigator.languages && window.navigator.languages.length > 0) {
        for (const lang of window.navigator.languages) {
            // Match the base language (e.g., 'en' for 'en-US')
            const baseLanguage = lang.split('-')[0];

            // Look for exact match
            if (supportedLocales.includes(lang)) {
                return lang;
            }

            // Look for base language match
            const baseMatch = supportedLocales.find(locale =>
                locale.toLowerCase() === baseLanguage.toLowerCase()
            );

            if (baseMatch) {
                return baseMatch;
            }
        }
    }

    // Try navigator.language
    if (window.navigator.language) {
        const navLang = window.navigator.language;
        const baseLanguage = navLang.split('-')[0];

        // Look for exact match
        if (supportedLocales.includes(navLang)) {
            return navLang;
        }

        // Look for base language match
        const baseMatch = supportedLocales.find(locale =>
            locale.toLowerCase() === baseLanguage.toLowerCase()
        );

        if (baseMatch) {
            return baseMatch;
        }
    }

    // Fallback to default locale
    return defaultLocale;
}

/**
 * Gets locale from URL
 *
 * @returns Locale code or null
 */
function getLocaleFromUrl(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const url = new URL(window.location.href);
    const localeParam = url.searchParams.get('locale') || url.searchParams.get('lang');

    if (localeParam) {
        return localeParam;
    }

    // Check for locale in path (e.g., /en/about)
    const pathParts = url.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] && pathParts[1].length === 2) {
        return pathParts[1];
    }

    return null;
}

/**
 * Gets locale from cookie
 *
 * @returns Locale code or null
 */
function getLocaleFromCookie(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');

        if (name === 'locale' || name === 'lang') {
            return value;
        }
    }

    return null;
}

/**
 * Checks if a locale is RTL
 *
 * @param locale Locale code
 * @param rtlLocales Array of RTL locale codes
 * @returns Whether locale is RTL
 */
export function isRTL(locale: string, rtlLocales: string[]): boolean {
    const baseLocale = locale.split('-')[0].toLowerCase();
    return rtlLocales.some(rtl => rtl.toLowerCase() === baseLocale);
}

/**
 * Sets locale cookie
 *
 * @param locale Locale code
 * @param options Cookie options
 */
export function setLocaleCookie(locale: string, options: {
    days?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
} = {}): void {
    if (typeof document === 'undefined') {
        return;
    }

    const { days = 365, path = '/', domain, secure } = options;

    // Calculate expiration date
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    // Build cookie string
    let cookieStr = `locale=${locale}; expires=${expires.toUTCString()}; path=${path}`;

    if (domain) {
        cookieStr += `; domain=${domain}`;
    }

    if (secure) {
        cookieStr += '; secure';
    }

    document.cookie = cookieStr;
}