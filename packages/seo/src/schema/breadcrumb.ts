/**
 * @fileoverview Breadcrumb schema utilities
 *
 * Utilities for creating breadcrumb schema markup.
 */
import { BreadcrumbList, ListItem } from './types';

/**
 * Options for creating a breadcrumb schema
 */
export interface BreadcrumbSchemaOptions {
    /**
     * List of breadcrumb items
     */
    items: Array<{
        name: string;
        url?: string;
    }>;
}

/**
 * Creates a breadcrumb schema
 *
 * @param options Breadcrumb schema options
 * @returns Breadcrumb schema object
 *
 * @example
 * ```typescript
 * const schema = createBreadcrumbSchema({
 *   items: [
 *     { name: 'Home', url: 'https://example.com' },
 *     { name: 'Blog', url: 'https://example.com/blog' },
 *     { name: 'How to Build a Website' }
 *   ]
 * });
 * ```
 */
export function createBreadcrumbSchema(options: BreadcrumbSchemaOptions): BreadcrumbList {
    const { items } = options;

    // Create list items
    const listItems: ListItem[] = items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
    }));

    // Create breadcrumb schema
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: listItems
    };
}