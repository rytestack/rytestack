/**
 * @fileoverview Schema.org types
 *
 * Type definitions for Schema.org entities.
 */

/**
 * Base Schema.org thing
 */
export interface Thing {
    '@context': 'https://schema.org';
    '@type': string;
    '@id'?: string;
    name?: string;
    url?: string;
    description?: string;
    image?: string | ImageObject;
    [key: string]: any;
}

/**
 * Schema.org image object
 */
export interface ImageObject {
    '@type': 'ImageObject';
    url: string;
    height?: number;
    width?: number;
    caption?: string;
}

/**
 * Schema.org person
 */
export interface Person extends Thing {
    '@type': 'Person';
    givenName?: string;
    familyName?: string;
    email?: string;
    jobTitle?: string;
}

/**
 * Schema.org organization
 */
export interface Organization extends Thing {
    '@type': 'Organization';
    logo?: string | ImageObject;
    address?: PostalAddress;
    telephone?: string;
    email?: string;
    sameAs?: string[];
}

/**
 * Schema.org postal address
 */
export interface PostalAddress {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
}

/**
 * Schema.org article
 */
export interface Article extends Thing {
    '@type': 'Article' | 'NewsArticle' | 'BlogPosting';
    headline: string;
    author: Person | Organization | string;
    datePublished: string;
    dateModified?: string;
    publisher: Organization;
    mainEntityOfPage?: string;
    keywords?: string;
}

/**
 * Schema.org product
 */
export interface Product extends Thing {
    '@type': 'Product';
    brand?: string | Organization;
    sku?: string;
    mpn?: string;
    offers?: Offer | Offer[];
    review?: Review | Review[];
    aggregateRating?: AggregateRating;
}

/**
 * Schema.org offer
 */
export interface Offer {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    url?: string;
    priceValidUntil?: string;
    itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

/**
 * Schema.org review
 */
export interface Review extends Thing {
    '@type': 'Review';
    reviewRating: Rating;
    author: Person | Organization | string;
    datePublished?: string;
}

/**
 * Schema.org rating
 */
export interface Rating {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
}

/**
 * Schema.org aggregate rating
 */
export interface AggregateRating {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
}

/**
 * Schema.org breadcrumb list
 */
export interface BreadcrumbList extends Thing {
    '@type': 'BreadcrumbList';
    itemListElement: ListItem[];
}

/**
 * Schema.org list item
 */
export interface ListItem {
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
}

/**
 * Schema.org FAQ page
 */
export interface FAQPage extends Thing {
    '@type': 'FAQPage';
    mainEntity: Question[];
}

/**
 * Schema.org question
 */
export interface Question {
    '@type': 'Question';
    name: string;
    acceptedAnswer: Answer;
}

/**
 * Schema.org answer
 */
export interface Answer {
    '@type': 'Answer';
    text: string;
}