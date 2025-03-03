/**
 * @fileoverview useMediaQuery hook
 *
 * Hook for responsive design using media queries.
 */
import { useState, useEffect } from 'react';

/**
 * Hook for responsive design using media queries
 *
 * @param query Media query string
 * @returns Whether the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * return isMobile ? <MobileMenu /> : <DesktopMenu />;
 * ```
 */
export function useMediaQuery(query: string): boolean {
    // SSR check - return false on the server
    const isServer = typeof window === 'undefined';

    // Initial state based on the query
    const [matches, setMatches] = useState(() => {
        if (isServer) return false;
        return window.matchMedia(query).matches;
    });

    // Effect to add event listener for changes
    useEffect(() => {
        if (isServer) return undefined;

        const mediaQuery = window.matchMedia(query);

        // Update matches when the media query changes
        const updateMatches = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Modern browsers
        mediaQuery.addEventListener('change', updateMatches);

        // Update matches initially
        setMatches(mediaQuery.matches);

        // Clean up
        return () => {
            mediaQuery.removeEventListener('change', updateMatches);
        };
    }, [query, isServer]);

    return matches;
}