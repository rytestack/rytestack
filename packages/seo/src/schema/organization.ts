/**
 * @fileoverview Organization schema utilities
 *
 * Utilities for creating organization schema markup.
 */
import { Organization, PostalAddress } from './types';

/**
 * Options for creating an organization schema
 */
export interface OrganizationSchemaOptions {
    /**
     * Organization name
     */
    name: string;

    /**
     * Organization description
     */
    description?: string;

    /**
     * Organization URL
     */
    url?: string;

    /**
     * Organization logo URL
     */
    logoUrl?: string;

    /**
     * Organization address
     */
    address?: {
        street?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
    };

    /**
     * Organization contact information
     */
    contact?: {
        telephone?: string;
        email?: string;
    };

    /**
     * Organization social profiles
     */
    socialProfiles?: string[];
}

/**
 * Creates an organization schema
 *
 * @param options Organization schema options
 * @returns Organization schema object
 *
 * @example
 * ```typescript
 * const schema = createOrganizationSchema({
 *   name: 'Example Company',
 *   description: 'A company that does amazing things',
 *   url: 'https://example.com',
 *   logoUrl: 'https://example.com/logo.png',
 *   address: {
 *     street: '123 Main St',
 *     city: 'Anytown',
 *     region: 'CA',
 *     postalCode: '12345',
 *     country: 'US'
 *   },
 *   contact: {
 *     telephone: '+1-123-456-7890',
 *     email: 'info@example.com'
 *   },
 *   socialProfiles: [
 *     'https://facebook.com/example',
 *     'https://twitter.com/example',
 *     'https://linkedin.com/company/example'
 *   ]
 * });
 * ```
 */
export function createOrganizationSchema(options: OrganizationSchemaOptions): Organization {
    const {
        name,
        description,
        url,
        logoUrl,
        address,
        contact,
        socialProfiles
    } = options;

    // Create address object
    const addressObject: PostalAddress | undefined = address
        ? {
            '@type': 'PostalAddress',
            streetAddress: address.street,
            addressLocality: address.city,
            addressRegion: address.region,
            postalCode: address.postalCode,
            addressCountry: address.country
        }
        : undefined;

    // Create organization schema
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        description,
        url,
        logo: logoUrl
            ? {
                '@type': 'ImageObject',
                url: logoUrl
            }
            : undefined,
        address: addressObject,
        telephone: contact?.telephone,
        email: contact?.email,
        sameAs: socialProfiles?.length ? socialProfiles : undefined
    };
}