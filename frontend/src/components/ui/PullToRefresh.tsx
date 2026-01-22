import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void> | void;
    children: React.ReactNode;
    threshold?: number; // Distance in pixels to pull to trigger refresh
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    threshold = 80
}) => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Track if we can pull (scrollTop must be 0)
    const canPull = () => {
        if (!contentRef.current) return false;
        // Check if the parent scroll container is at the top
        const scrollContainer = contentRef.current.parentElement;
        return scrollContainer ? scrollContainer.scrollTop === 0 : window.scrollY === 0;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!canPull()) return;
        setStartY(e.touches[0].clientY);
        setIsPulling(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        // If not at top anymore, stop pulling
        if (!canPull()) {
            setIsPulling(false);
            setCurrentY(0);
            return;
        }

        const y = e.touches[0].clientY;
        const diff = y - startY;

        // Only allow pulling down
        if (diff > 0) {
            // Add resistance
            const dampedDiff = Math.min(diff * 0.5, threshold * 2);
            setCurrentY(dampedDiff);

            // Prevent default to stop scrolling if we are definitely pulling
            // Note: passive listeners might prevent preventDefault, handled via CSS usually
        }
    };

    const handleTouchEnd = async () => {
        if (!isPulling || isRefreshing) return;

        setIsPulling(false);

        if (currentY >= threshold) {
            setIsRefreshing(true);
            setCurrentY(threshold); // Snap to threshold

            // Trigger refresh
            try {
                await Promise.resolve(onRefresh());
            } finally {
                setIsRefreshing(false);
                setCurrentY(0);
            }
        } else {
            setCurrentY(0); // Snap back
        }
    };

    return (
        <div
            ref={contentRef}
            className="relative flex flex-col min-h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Indicator */}
            <div
                className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden"
                style={{
                    height: `${currentY}px`,
                    transition: isRefreshing ? 'height 0.2s ease-out' : 'height 0s'
                }}
            >
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium transform translate-y-2">
                    {isRefreshing ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>Refreshing...</span>
                        </>
                    ) : (
                        <>
                            <ArrowDown
                                size={18}
                                style={{
                                    transform: `rotate(${Math.min(currentY / threshold * 180, 180)}deg)`,
                                    transition: 'transform 0.2s'
                                }}
                            />
                            <span style={{ opacity: Math.min(currentY / threshold, 1) }}>
                                {currentY >= threshold ? 'Release to reload' : 'Pull to reload'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Content with transform */}
            <div
                className="flex-1"
                style={{
                    transform: `translateY(${currentY}px)`,
                    transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0,0,0.2,1)'
                }}
            >
                {children}
            </div>
        </div>
    );
};
