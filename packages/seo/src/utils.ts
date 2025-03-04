/**
 * @fileoverview SEO utilities
 *
 * Common utilities for SEO package.
 */

/**
 * Formats a date as ISO string (YYYY-MM-DD)
 *
 * @param date Date or string
 * @returns ISO formatted date
 */
export function formatISO(date: Date | string): string {
    if (typeof date === 'string') {
        // If already in ISO format, return as is
        if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
            return date;
        }

        // Otherwise, convert to Date and format
        return new Date(date).toISOString();
    }

    return date.toISOString();
}

/**
 * Truncates a string to a maximum length
 *
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }

    // Find the last space before maxLength
    const lastSpace = text.lastIndexOf(' ', maxLength);

    // If no space found, just cut at maxLength
    const truncateAt = lastSpace > 0 ? lastSpace : maxLength;

    return text.substring(0, truncateAt) + '...';
}

/**
 * Escapes HTML entities in a string
 *
 * @param html HTML string
 * @returns Escaped HTML
 */
export function escapeHtml(html: string): string {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}