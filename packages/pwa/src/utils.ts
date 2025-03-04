/**
 * @fileoverview PWA utilities
 *
 * Common utilities for the PWA package.
 */

/**
 * Checks if the app can be installed
 *
 * @returns Whether the app can be installed
 */
export function canInstall(): boolean {
    // Check if beforeinstallprompt event is supported
    // and PWA is not already installed
    return (
        typeof window !== 'undefined' &&
        'BeforeInstallPromptEvent' in window &&
        !isInstalled()
    );
}

/**
 * Checks if the PWA is already installed
 *
 * @returns Whether the PWA is installed
 */
export function isInstalled(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    // Check if app is in standalone mode or installed
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true
    );
}

/**
 * Creates an install prompt handler
 *
 * @returns Install prompt utilities
 *
 * @example
 * ```typescript
 * const { canPrompt, prompt } = createInstallPrompt();
 *
 * // Show install button if available
 * if (canPrompt()) {
 *   showInstallButton();
 * }
 *
 * // Call prompt when user clicks install button
 * installButton.addEventListener('click', () => {
 *   prompt()
 *     .then((outcome) => {
 *       console.log('Install outcome:', outcome);
 *     })
 *     .catch((error) => {
 *       console.error('Install error:', error);
 *     });
 * });
 * ```
 */
export function createInstallPrompt() {
    // Store the deferred prompt event
    let deferredPrompt: any = null;

    // Listen for beforeinstallprompt event
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevent the mini-infobar from appearing on mobile
            event.preventDefault();

            // Store the event for later use
            deferredPrompt = event;
        });

        // Listen for appinstalled event
        window.addEventListener('appinstalled', () => {
            // Clear the deferred prompt
            deferredPrompt = null;
        });
    }

    return {
        /**
         * Checks if the install prompt is available
         */
        canPrompt: () => deferredPrompt !== null,

        /**
         * Shows the install prompt
         */
        prompt: () => {
            if (!deferredPrompt) {
                return Promise.reject(new Error('Install prompt not available'));
            }

            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            return deferredPrompt.userChoice
                .then((choiceResult: { outcome: string }) => {
                    // Clear the deferred prompt
                    deferredPrompt = null;

                    return choiceResult.outcome;
                });
        }
    };
}

/**
 * Generates a simple offline page
 *
 * @param options Offline page options
 * @returns HTML string for the offline page
 */
export function generateOfflinePage(options: {
    title?: string;
    message?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
} = {}): string {
    const {
        title = 'You are offline',
        message = 'Please check your internet connection and try again.',
        backgroundColor = '#f8f9fa',
        textColor = '#343a40',
        buttonColor = '#007bff'
    } = options;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: ${backgroundColor};
          color: ${textColor};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 20px;
          text-align: center;
        }
        
        h1 {
          margin-bottom: 1rem;
        }
        
        p {
          margin-bottom: 2rem;
        }
        
        button {
          background-color: ${buttonColor};
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
        
        button:hover {
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>${message}</p>
      <button onclick="window.location.reload()">Retry</button>
    </body>
    </html>
  `;
}