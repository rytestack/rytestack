/**
 * @fileoverview Meta component
 *
 * Component for setting page metadata and SEO tags.
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface MetaProps {
    /**
     * Page title
     */
    title?: string;

    /**
     * Page description
     */
    description?: string;

    /**
     * Page canonical URL
     */
    canonical?: string;

    /**
     * Open Graph metadata
     */
    openGraph?: {
        title?: string;
        description?: string;
        type?: string;
        url?: string;
        image?: string;
        site_name?: string;
    };

    /**
     * Twitter metadata
     */
    twitter?: {
        card?: 'summary' | 'summary_large_image' | 'app' | 'player';
        site?: string;
        creator?: string;
        title?: string;
        description?: string;
        image?: string;
    };

    /**
     * Additional custom meta tags
     */
    meta?: Array<{ name?: string; property?: string; content: string }>;

    /**
     * Additional link tags
     */
    links?: Array<{ rel: string; href: string; as?: string; type?: string }>;
}

/**
 * Component for setting page metadata and SEO tags
 *
 * @example
 * ```tsx
 * <Meta
 *   title="Home Page"
 *   description="Welcome to my website"
 *   openGraph={{
 *     title: "Home Page",
 *     description: "Welcome to my website",
 *     image: "https://example.com/og-image.jpg"
 *   }}
 * />
 * ```
 */
export function Meta({
                         title,
                         description,
                         canonical,
                         openGraph,
                         twitter,
                         meta = [],
                         links = []
                     }: MetaProps) {
    // Prepare Open Graph tags
    const ogTags = openGraph
        ? Object.entries(openGraph).map(([key, value]) => ({
            property: `og:${key}`,
            content: value
        }))
        : [];

    // Prepare Twitter tags
    const twitterTags = twitter
        ? Object.entries(twitter).map(([key, value]) => ({
            name: `twitter:${key}`,
            content: value
        }))
        : [];

    // Combine all meta tags
    const allMeta = [
        description ? { name: 'description', content: description } : null,
        ...ogTags,
        ...twitterTags,
        ...meta
    ].filter(Boolean) as Array<{ name?: string; property?: string; content: string }>;

    // Prepare link tags
    const allLinks = [
        canonical ? { rel: 'canonical', href: canonical } : null,
        ...links
    ].filter(Boolean) as Array<{ rel: string; href: string; as?: string; type?: string }>;

    return (
        <Helmet>
            {title && <title>{title}</title>}
            {allMeta.map((tag, index) => (
                <meta key={`meta-${index}`} {...tag} />
            ))}
            {allLinks.map((link, index) => (
                <link key={`link-${index}`} {...link} />
            ))}
        </Helmet>
    );
}