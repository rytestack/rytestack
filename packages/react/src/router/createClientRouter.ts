/**
 * @fileoverview Client router creation utility
 *
 * Creates a client-side router using React Router.
 */
import { createBrowserRouter, type RouteObject } from 'react-router-dom';

/**
 * Creates a client-side router using React Router
 *
 * @param routes React Router route objects
 * @returns Browser router instance
 */
export function createClientRouter(routes: RouteObject[]) {
    /**
     * Creates a client-side router using React Router
     *
     * @param routes React Router route objects
     * @returns Browser router instance
     */
    export function createClientRouter(routes: RouteObject[]) {
        return createBrowserRouter(routes, {
            // We use basename in case the app is not deployed at the root
            basename: process.env.BASE_PATH || '/'
        });
    }
}