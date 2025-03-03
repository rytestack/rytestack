/**
 * @fileoverview Hydrate component
 *
 * Component for handling SSR hydration with TanStack Query.
 */
import React from 'react';
import { Hydrate as QueryHydrate, type DehydratedState } from '@tanstack/react-query';

export interface HydrateProps {
    /**
     * Dehydrated state from TanStack Query
     */
    state: DehydratedState | undefined;

    /**
     * Children to render
     */
    children: React.ReactNode;
}

/**
 * Component for handling SSR hydration with TanStack Query
 *
 * @example
 * ```tsx
 * <Hydrate state={pageProps.dehydratedState}>
 *   <MyComponent />
 * </Hydrate>
 * ```
 */
export function Hydrate({ state, children }: HydrateProps) {
    return <QueryHydrate state={state}>{children}</QueryHydrate>;
}