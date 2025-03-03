/**
 * @fileoverview Type definitions for Rytestack React adapter
 */
import { ReactNode } from 'react';

/**
 * Page props with dehydrated state
 */
export interface PageProps {
    /**
     * Dehydrated state for TanStack Query
     */
    dehydratedState?: any;

    /**
     * Initial data for the page
     */
    initialData?: any;

    /**
     * Additional props passed to the page
     */
    [key: string]: any;
}

/**
 * Page component type
 */
export interface PageComponent {
    (props: PageProps): ReactNode;

    /**
     * Layout component to use
     */
    layout?: (props: { children: ReactNode }) => ReactNode;

    /**
     * Get initial data for server-side rendering
     */
    getInitialData?: (context: any) => Promise<any>;
}

/**
 * API route module
 */
export interface ApiModule {
    get?: Function;
    post?: Function;
    put?: Function;
    delete?: Function;
    patch?: Function;
    [key: string]: Function | undefined;
}