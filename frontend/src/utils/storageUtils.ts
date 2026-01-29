/**
 * Safe wrappers for localStorage and sessionStorage to prevent 'The operation is insecure' errors
 * which occur in some browser environments (e.g., private mode, blocked cookies).
 */

export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn(`localStorage.getItem('${key}') failed:`, e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn(`localStorage.setItem('${key}') failed:`, e);
        }
    },
    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`localStorage.removeItem('${key}') failed:`, e);
        }
    },
    clear: (): void => {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('localStorage.clear() failed:', e);
        }
    },
    get length(): number {
        try {
            return localStorage.length;
        } catch (e) {
            console.warn('localStorage.length access failed:', e);
            return 0;
        }
    }
};

export const safeSessionStorage = {
    getItem: (key: string): string | null => {
        try {
            return sessionStorage.getItem(key);
        } catch (e) {
            console.warn(`sessionStorage.getItem('${key}') failed:`, e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.warn(`sessionStorage.setItem('${key}') failed:`, e);
        }
    },
    removeItem: (key: string): void => {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.warn(`sessionStorage.removeItem('${key}') failed:`, e);
        }
    },
    clear: (): void => {
        try {
            sessionStorage.clear();
        } catch (e) {
            console.warn('sessionStorage.clear() failed:', e);
        }
    },
    get length(): number {
        try {
            return sessionStorage.length;
        } catch (e) {
            console.warn('sessionStorage.length access failed:', e);
            return 0;
        }
    }
};
