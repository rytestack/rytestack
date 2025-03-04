/**
 * @fileoverview Meta tag generators
 *
 * Functions for generating meta tags.
 */
import { BasicMeta, OpenGraphMeta, TwitterMeta, MetaTag, LinkTag, AllMeta } from './types';

/**
 * Generates basic meta tags
 *
 * @param options Basic meta options
 * @returns Array of meta and link tags
 */
export function generateBasicMeta(options: BasicMeta): { meta: MetaTag[], links: LinkTag[] } {
    const { title, description, keywords, canonicalUrl, robots, author } = options;

    const meta: MetaTag[] = [];
    const links: LinkTag[] = [];

    // Add description
    if (description) {
        meta.push({ name: 'description', content: description });
    }

    // Add keywords
    if (keywords) {
        const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
        meta.push({ name: 'keywords', content: keywordsString });
    }

    // Add robots
    if (robots) {
        meta.push({ name: 'robots', content: robots });
    }

    // Add author
    if (author) {
        meta.push({ name: 'author', content: author });
    }

    // Add canonical link
    if (canonicalUrl) {
        links.push({ rel: 'canonical', href: canonicalUrl });
    }

    return { meta, links };
}

/**
 * Generates Open Graph meta tags
 *
 * @param options Open Graph meta options
 * @returns Array of meta tags
 */
export function generateOpenGraphMeta(options: OpenGraphMeta): MetaTag[] {
    const { title, description, url, type, image, imageAlt, siteName, locale } = options;

    const meta: MetaTag[] = [];

    // Add title
    if (title) {
        meta.push({ property: 'og:title', content: title });
    }

    // Add description
    if (description) {
        meta.push({ property: 'og:description', content: description });
    }

    // Add URL
    if (url) {
        meta.push({ property: 'og:url', content: url });
    }

    // Add type
    if (type) {
        meta.push({ property: 'og:type', content: type });
    } else {
        meta.push({ property: 'og:type', content: 'website' });
    }

    // Add image
    if (image) {
        meta.push({ property: 'og:image', content: image });

        if (imageAlt) {
            meta.push({ property: 'og:image:alt', content: imageAlt });
        }
    }

    // Add site name
    if (siteName) {
        meta.push({ property: 'og:site_name', content: siteName });
    }

    // Add locale
    if (locale) {
        meta.push({ property: 'og:locale', content: locale });
    }

    return meta;
}

/**
 * Generates Twitter card meta tags
 *
 * @param options Twitter card meta options
 * @returns Array of meta tags
 */
export function generateTwitterMeta(options: TwitterMeta): MetaTag[] {
    const { card, title, description, image, imageAlt, site, creator } = options;

    const meta: MetaTag[] = [];

    // Add card type
    if (card) {
        meta.push({ name: 'twitter:card', content: card });
    } else {
        meta.push({ name: 'twitter:card', content: 'summary' });
    }

    // Add title
    if (title) {
        meta.push({ name: 'twitter:title', content: title });
    }

    // Add description
    if (description) {
        meta.push({ name: 'twitter:description', content: description });
    }

    // Add image
    if (image) {
        meta.push({ name: 'twitter:image', content: image });

        if (imageAlt) {
            meta.push({ name: 'twitter:image:alt', content: imageAlt });
        }
    }

    // Add site
    if (site) {
        meta.push({ name: 'twitter:site', content: site.startsWith('@') ? site : `@${site}` });
    }

    // Add creator
    if (creator) {
        meta.push({ name: 'twitter:creator', content: creator.startsWith('@') ? creator : `@${creator}` });
    }

    return meta;
}

/**
 * Generates all meta tags
 *
 * @param options All meta options
 * @returns All meta and link tags
 *
 * @example
 * ```typescript
 * const { meta, links } = generateAllMeta({
 *   basic: {
 *     title: 'My Website',
 *     description: 'A description of my website',
 *     canonicalUrl: 'https://example.com'
 *   },
 *   openGraph: {
 *     image: 'https://example.com/og-image.jpg',
 *     siteName: 'My Website'
 *   },
 *   twitter: {
 *     card: 'summary_large_image',
 *     site: '@mywebsite'
 *   }
 * });
 * ```
 */
export function generateAllMeta(options: AllMeta): { meta: MetaTag[], links: LinkTag[] } {
    const { basic, openGraph, twitter } = options;

    // Generate basic meta
    const { meta: basicMeta, links } = generateBasicMeta(basic);

    // Generate Open Graph meta
    const ogMeta = openGraph
        ? generateOpenGraphMeta({
            title: openGraph.title || basic.title,
            description: openGraph.description || basic.description,
            url: openGraph.url || basic.canonicalUrl,
            ...openGraph
        })
        : [];

    // Generate Twitter meta
    const twitterMeta = twitter
        ? generateTwitterMeta({
            title: twitter.title || basic.title,
            description: twitter.description || basic.description,
            ...twitter
        })
        : [];

    // Combine all meta tags
    const meta = [...basicMeta, ...ogMeta, ...twitterMeta];

    return { meta, links };
}