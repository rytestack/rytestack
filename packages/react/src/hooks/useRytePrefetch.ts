/**
 * @fileoverview useRytePrefetch hook
 *
 * Hook for prefetching data from APIs during SSR and client-side.
 */
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

/**
 * Configuration options for the useRytePrefetch hook
 */
export interface RytePrefetchOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'> {
    /**
     * Whether to enable the query
     */
    enabled?: boolean;

    /**
     * Server-only fetch (only runs during SSR)
     */
    serverOnly?: boolean;
}

/**
 * Hook for prefetching data from APIs during SSR and client-side
 *
 * This is a wrapper around TanStack Query's useQuery that adds
 * support for SSR prefetching.
 *
 * @param queryKey Unique key for the query
 * @param fetchFn Function that returns a promise with the data
 * @param options Additional options for the query
 * @returns Query result from TanStack Query
 *
 * @example
 * ```tsx
 * // Fetch blog post data
 * const { data, isLoading, error } = useRytePrefetch(
 *   ['blog', slug],
 *   () => fetch(`/api/blog/${slug}`).then(res => res.json()),
 *   { staleTime: 60000 }
 * );
 * ```
 */
export function useRytePrefetch<TData = unknown, TError = Error>(
    queryKey: unknown[],
    fetchFn: () => Promise<TData>,
    options: RytePrefetchOptions<TData, TError> = {}
) {
    // If we're on the server and this is a server-only fetch, we should always enable it
    const isServer = typeof window === 'undefined';
    const enabled = options.serverOnly ? isServer : options.enabled !== false;

    return useQuery<TData, TError, TData>({
        queryKey,
        queryFn: fetchFn,
        ...options,
        enabled
    });
}