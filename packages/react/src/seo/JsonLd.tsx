/**
 * @fileoverview JsonLd component
 *
 * Component for adding structured data to pages using JSON-LD.
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface JsonLdProps {
    /**
     * JSON-LD data to be rendered as a script tag
     */
    data: Record<string, any>;
}

/**
 * Component for adding structured data to pages using JSON-LD
 *
 * @example
 * ```tsx
 * <JsonLd
 *   data={{
 *     "@context": "https://schema.org",
 *     "@type": "Article",
 *     "headline": "Article headline",
 *     "author": {
 *       "@type": "Person",
 *       "name": "John Doe"
 *     }
 *   }}
 * />
 * ```
 */
export function JsonLd({ data }: JsonLdProps) {
    // Serialize data to JSON
    const jsonString = JSON.stringify(data);

    return (
        <Helmet>
            <script type="application/ld+json">{jsonString}</script>
        </Helmet>
    );
}