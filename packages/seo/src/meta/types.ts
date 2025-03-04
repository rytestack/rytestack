/**
 * @fileoverview Meta tag types
 *
 * Type definitions for meta tags.
 */

/**
 * Meta tag object
 */
export interface MetaTag {
    /**
     * Tag name (for name attribute)
     */
    name?: string;

    /**
     * Tag property (for property attribute)
     */
    property?: string;

    /**
     * Tag content
     */
    content: string;
}

/**
 * Link tag object
 */
export interface LinkTag {
    /**
     * Relationship type
     */
    rel: string;

    /**
     * Link URL
     */
    href: string;

    /**
     * Link type
     */
    type?: string;

    /**
     * Size information
     */
    sizes?: string;

    /**
     * Additional attributes
     */
    [key: string]: string | undefined;
}

/**
 * Basic meta information
 */
export interface BasicMeta {
    /**
     * Page title
     */
    title: string;

    /**
     * Page description
     */
    description?: string;

    /**
     * Page keywords
     */
    keywords?: string | string[];

    /**
     * Page canonical URL
     */
    canonicalUrl?: string;

    /**
     * Page robots directives
     */
    robots?: string;

    /**
     * Page author
     */
    author?: string;
}

/**
 * Open Graph meta information
 */
export interface OpenGraphMeta {
    /**
     * Page title
     */
    title?: string;

    /**
     * Page description
     */
    description?: string;

    /**
     * Page URL
     */
    url?: string;

    /**
     * Content type
     */
    type?: 'website' | 'article' | 'book' | 'profile' | 'music' | 'video';

    /**
     * Image URL
     */
    image?: string;

    /**
     * Image alt text
     */
    imageAlt?: string;

    /**
     * Site name
     */
    siteName?: string;

    /**
     * Locale
     */
    locale?: string;
}

/**
 * Twitter card meta information
 */
export interface TwitterMeta {
    /**
     * Card type
     */
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';

    /**
     * Page title
     */
    title?: string;

    /**
     * Page description
     */
    description?: string;

    /**
     * Image URL
     */
    image?: string;

    /**
     * Image alt text
     */
    imageAlt?: string;

    /**
     * Site username
     */
    site?: string;

    /**
     * Creator username
     */
    creator?: string;
}

/**
 * All meta information
 */
export interface AllMeta {
    /**
     * Basic meta
     */
    basic: BasicMeta;

    /**
     * Open Graph meta
     */
    openGraph?: OpenGraphMeta;

    /**
     * Twitter meta
     */
    twitter?: TwitterMeta;
}