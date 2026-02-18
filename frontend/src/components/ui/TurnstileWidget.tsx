/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: (error: any) => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark' | 'auto';
}

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    theme?: string;
                    callback?: (token: string) => void;
                    'error-callback'?: (error: any) => void;
                    'expired-callback'?: () => void;
                }
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'light',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // Use a ref instead of state so widgetId never triggers re-renders
    const widgetIdRef = useRef<string | null>(null);
    // Keep callbacks in refs so the effect never needs to re-run when they change
    const onVerifyRef = useRef(onVerify);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    // Keep callback refs up-to-date without re-running the effect
    useEffect(() => { onVerifyRef.current = onVerify; }, [onVerify]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);
    useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

    useEffect(() => {
        if (!containerRef.current || !siteKey) return;

        let intervalId: ReturnType<typeof setInterval>;
        let cancelled = false;

        const render = () => {
            if (cancelled || !window.turnstile || !containerRef.current) return;
            // Already rendered — don't render again
            if (widgetIdRef.current !== null) return;

            try {
                const id = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    theme,
                    callback: (token: string) => {
                        onVerifyRef.current(token);
                    },
                    'error-callback': (error: any) => {
                        console.error('Turnstile error:', error);
                        onErrorRef.current?.(error);
                    },
                    'expired-callback': () => {
                        onExpireRef.current?.();
                    },
                });
                widgetIdRef.current = id;
            } catch (err) {
                console.error('Failed to render Turnstile:', err);
            }
        };

        if (window.turnstile) {
            // Script already loaded — render immediately
            render();
        } else {
            // Poll until the Cloudflare script loads (max 10s)
            const startTime = Date.now();
            intervalId = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(intervalId);
                    render();
                } else if (Date.now() - startTime > 10000) {
                    clearInterval(intervalId);
                    console.error('Turnstile failed to load within 10 seconds');
                    onErrorRef.current?.(new Error('Security verification failed to load. Please refresh the page.'));
                }
            }, 100);
        }

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            // Clean up widget on unmount
            if (widgetIdRef.current && window.turnstile) {
                try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
                widgetIdRef.current = null;
            }
        };
    // Only re-run if siteKey or theme changes — never on callback changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteKey, theme]);

    return <div ref={containerRef} className="w-full flex justify-center my-4" />;
};

export default TurnstileWidget;
