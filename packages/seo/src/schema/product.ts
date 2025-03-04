/**
 * @fileoverview Product schema utilities
 *
 * Utilities for creating product schema markup.
 */
import { Product, Offer, Review, AggregateRating, Organization } from './types';

/**
 * Options for creating a product schema
 */
export interface ProductSchemaOptions {
    /**
     * Product name
     */
    name: string;

    /**
     * Product description
     */
    description?: string;

    /**
     * Product URL
     */
    url?: string;

    /**
     * Product image URL
     */
    imageUrl: string;

    /**
     * Product brand
     */
    brand?: string;

    /**
     * Product SKU
     */
    sku?: string;

    /**
     * Product MPN (Manufacturer Part Number)
     */
    mpn?: string;

    /**
     * Product offers
     */
    offers?: {
        price: number;
        priceCurrency: string;
        availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
        url?: string;
        priceValidUntil?: Date | string;
        itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
    }[];

    /**
     * Product reviews
     */
    reviews?: {
        author: string;
        datePublished?: Date | string;
        rating: number;
        bestRating?: number;
        worstRating?: number;
    }[];

    /**
     * Product aggregate rating
     */
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
        bestRating?: number;
        worstRating?: number;
    };
}

/**
 * Creates a product schema
 *
 * @param options Product schema options
 * @returns Product schema object
 *
 * @example
 * ```typescript
 * const schema = createProductSchema({
 *   name: 'Smartphone XYZ',
 *   description: 'The latest smartphone with amazing features',
 *   url: 'https://example.com/products/smartphone-xyz',
 *   imageUrl: 'https://example.com/images/smartphone-xyz.jpg',
 *   brand: 'BrandName',
 *   sku: 'SKU123',
 *   offers: [{
 *     price: 799.99,
 *     priceCurrency: 'USD',
 *     availability: 'InStock'
 *   }],
 *   aggregateRating: {
 *     ratingValue: 4.5,
 *     reviewCount: 89
 *   }
 * });
 * ```
 */
export function createProductSchema(options: ProductSchemaOptions): Product {
    const {
        name,
        description,
        url,
        imageUrl,
        brand,
        sku,
        mpn,
        offers,
        reviews,
        aggregateRating
    } = options;

    // Create offers
    const offerObjects: Offer[] = offers?.map(offer => ({
        '@type': 'Offer',
        price: offer.price,
        priceCurrency: offer.priceCurrency,
        availability: offer.availability ? `https://schema.org/${offer.availability}` : undefined,
        url: offer.url,
        priceValidUntil: offer.priceValidUntil
            ? typeof offer.priceValidUntil === 'string'
                ? offer.priceValidUntil
                : offer.priceValidUntil.toISOString().split('T')[0]
            : undefined,
        itemCondition: offer.itemCondition ? `https://schema.org/${offer.itemCondition}` : undefined
    })) || [];

    // Create reviews
    const reviewObjects: Review[] = reviews?.map(review => ({
        '@type': 'Review',
        author: {
            '@type': 'Person',
            name: review.author
        },
        datePublished: review.datePublished
            ? typeof review.datePublished === 'string'
                ? review.datePublished
                : review.datePublished.toISOString()
            : undefined,
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: review.bestRating || 5,
            worstRating: review.worstRating || 1
        }
    })) || [];

    // Create aggregate rating
    const aggregateRatingObject: AggregateRating | undefined = aggregateRating
        ? {
            '@type': 'AggregateRating',
            ratingValue: aggregateRating.ratingValue,
            reviewCount: aggregateRating.reviewCount,
            bestRating: aggregateRating.bestRating || 5,
            worstRating: aggregateRating.worstRating || 1
        }
        : undefined;

    // Create brand object
    const brandObject = brand
        ? {
            '@type': 'Brand',
            name: brand
        } as Organization
        : undefined;

    // Create product schema
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: imageUrl,
        url,
        brand: brandObject,
        sku,
        mpn,
        offers: offerObjects.length > 0 ? offerObjects : undefined,
        review: reviewObjects.length > 0 ? reviewObjects : undefined,
        aggregateRating: aggregateRatingObject
    };
}