import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * A wrapper around React.lazy that reloads the page if the dynamic import fails
 * due to a "Failed to fetch dynamically imported module" error (common after deployments).
 */
export const lazyImport = <T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> => {
    return lazy(async () => {
        try {
            return await factory();
        } catch (error: any) {
            const isDynamicImportError = error?.message?.includes('Failed to fetch dynamically imported module');
            const isChunkLoadError = error?.name === 'ChunkLoadError';

            if (isDynamicImportError || isChunkLoadError) {
                // Prevent infinite reload loops
                const storageKey = `lazyImport_reload_${window.location.pathname}`;

                try {
                    const lastReload = sessionStorage.getItem(storageKey);
                    const now = Date.now();

                    // If we haven't reloaded for this path in the last 10 seconds, reload
                    if (!lastReload || now - parseInt(lastReload) > 10000) {
                        sessionStorage.setItem(storageKey, now.toString());
                        window.location.reload();
                        // Return a never-resolving promise to keep the suspense fallback shown while we reload
                        return new Promise(() => { });
                    }
                } catch (e) {
                    console.warn('sessionStorage access failed in lazyImport:', e);
                    // If sessionStorage fails, we can't track reloads effectively, 
                    // but we should still попытаться reload once to recover from chunk load errors.
                    window.location.reload();
                    return new Promise(() => { });
                }
            }

            // If it's another error or we just reloaded, throw it
            throw error;
        }
    });
};
