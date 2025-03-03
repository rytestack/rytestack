/**
 * @fileoverview Link component
 *
 * A wrapper around React Router's Link component with additional features.
 */
import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export interface LinkProps extends RouterLinkProps {
    /**
     * Whether to prefetch the linked page
     */
    prefetch?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Link children
     */
    children: React.ReactNode;
}

/**
 * Enhanced Link component with prefetching capabilities
 *
 * @example
 * ```tsx
 * <Link to="/about" prefetch>About</Link>
 * ```
 */
export function Link({ to, prefetch = false, className = '', children, ...rest }: LinkProps) {
    // TODO: Implement prefetching logic

    return (
        <RouterLink to={to} className={className} {...rest}>
            {children}
        </RouterLink>
    );
}