import React, { useEffect, useRef, useState } from 'react';

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
    theme = 'auto',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetId, setWidgetId] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current || !siteKey) return;

        // Wait for turnstile to load
        const interval = setInterval(() => {
            if (window.turnstile) {
                clearInterval(interval);
                renderWidget();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [siteKey]);

    const renderWidget = () => {
        if (!window.turnstile || !containerRef.current) return;

        // If widget already exists, reset it
        if (widgetId) {
            window.turnstile.reset(widgetId);
            return;
        }

        try {
            const id = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                theme,
                callback: (token: string) => {
                    onVerify(token);
                },
                'error-callback': (error: any) => {
                    console.error('Turnstile error:', error);
                    if (onError) onError(error);
                },
                'expired-callback': () => {
                    if (onExpire) onExpire();
                },
            });
            setWidgetId(id);
        } catch (err) {
            console.error('Failed to render Turnstile:', err);
        }
    };

    return <div ref={containerRef} className="w-full flex justify-center my-4" />;
};

export default TurnstileWidget;
