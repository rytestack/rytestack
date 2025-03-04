/**
 * @fileoverview Router types for Rytestack
 *
 * Type definitions for routing.
 */
import { RouteObject } from 'react-router-dom';

/**
 * Enhanced route object with Rytestack features
 */
export interface RyteRouteObject extends RouteObject {
  /**
   * Route path
   */
  path?: string;

  /**
   * Whether this is an index route
   */
  index?: boolean;

  /**
   * Component to render
   */
  component?: React.ComponentType<any>;

  /**
   * Layout component to use
   */
  layout?: React.ComponentType<any>;

  /**
   * Additional metadata for the route
   */
  meta?: Record<string, any>;

  /**
   * Whether to prefetch this route
   */
  prefetch?: boolean;

  /**
   * Child routes
   */
  children?: RyteRouteObject[];
}