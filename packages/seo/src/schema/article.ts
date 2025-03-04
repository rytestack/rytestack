/**
 * @fileoverview Article schema utilities
 *
 * Utilities for creating article schema markup.
 */
import { Article, Person, Organization } from './types';
import { formatISO } from '../utils';

/**
 * Options for creating an article schema
 */
export interface ArticleSchemaOptions {
    /**
     * Article type
     */
    type?: 'Article' | 'NewsArticle' | 'BlogPosting';

    /**
     * Article title
     */
    title: string;

    /**
     * Article description
     */
    description?: string;

    /**
     * Article URL
     */
    url: string;

    /**
     * Article image URL
     */
    imageUrl: string;

    /**
     * Author information
     */
    author: {
        name: string;
        url?: string;
        type?: 'Person' | 'Organization';
    };

    /**
     * Publisher information
     */
    publisher: {
        name: string;
        logo: string;
        url?: string;
    };

    /**
     * Article publish date
     */
    datePublished: Date | string;

    /**
     * Article modified date
     */
    dateModified?: Date | string;

    /**
     * Article keywords
     */
    keywords?: string | string[];
}

/**
 * Creates an article schema
 *
 * @param options Article schema options
 * @returns Article schema object
 *
 * @example
 * ```typescript
 * const schema = createArticleSchema({
 *   title: 'How to Build a Website',
 *   description: 'A comprehensive guide to building a website from scratch',
 *   url: 'https://example.com/blog/how-to-build-a-website',
 *   imageUrl: 'https://example.com/images/website-guide.jpg',
 *   author: {
 *     name: 'Jane Doe',
 *     url: 'https://example.com/authors/jane-doe',
 *     type: 'Person'
 *   },
 *   publisher: {
 *     name: 'Example Blog',
 *     logo: 'https://example.com/logo.png'
 *   },
 *   datePublished: new Date('2023-06-15'),
 *   dateModified: new Date('2023-06-20'),
 *   keywords: ['web development', 'html', 'css', 'javascript']
 * });
 * ```
 */
export function createArticleSchema(options: ArticleSchemaOptions): Article {
    const {
        type = 'Article',
        title,
        description,
        url,
        imageUrl,
        author,
        publisher,
        datePublished,
        dateModified,
        keywords
    } = options;

    // Create author object
    const authorObject = author.type === 'Organization'
        ? {
            '@type': 'Organization',
            name: author.name,
            url: author.url
        } as Organization
        : {
            '@type': 'Person',
            name: author.name,
            url: author.url
        } as Person;

    // Create publisher object
    const publisherObject: Organization = {
        '@type': 'Organization',
        name: publisher.name,
        logo: {
            '@type': 'ImageObject',
            url: publisher.logo
        },
        url: publisher.url
    };

    // Format dates
    const publishedDate = formatISO(datePublished);
    const modifiedDate = dateModified ? formatISO(dateModified) : publishedDate;

    // Format keywords
    const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

    // Create article schema
    return {
        '@context': 'https://schema.org',
        '@type': type,
        headline: title,
        description,
        image: imageUrl,
        author: authorObject,
        publisher: publisherObject,
        url,
        datePublished: publishedDate,
        dateModified: modifiedDate,
        keywords: keywordsString,
        mainEntityOfPage: url
    };
}