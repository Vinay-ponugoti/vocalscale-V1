import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    scrollContainerRef?: React.RefObject<HTMLElement>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, scrollContainerRef }) => {
    const [startY, setStartY] = useState(0);
    const [pulling, setPulling] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const location = useLocation();

    // Reset state on navigation
    useEffect(() => {
        setLoading(false);
        setPulling(false);
        setPullDistance(0);
    }, [location.pathname]);

    const getScrollTop = () => {
        if (scrollContainerRef?.current) {
            return scrollContainerRef.current.scrollTop;
        }
        return window.scrollY;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only enable if we are at the top of the page
        if (getScrollTop() === 0 && !loading) {
            setStartY(e.touches[0].clientY);
            // We don't set pulling=true yet, we wait for move to confirm direction
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (loading) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (getScrollTop() === 0 && diff > 0) {
            // Started pulling down from top
            if (!pulling) setPulling(true);

            // Prevent default scrolling ONLY when pulling to refresh
            e.preventDefault();

            // Add resistance
            const distance = Math.min(diff * 0.4, 120);
            setPullDistance(distance);
        } else {
            setPulling(false);
            setPullDistance(0);
        }
    };

    const handleTouchEnd = async () => {
        if (!pulling || loading) return;

        setPulling(false);
        if (pullDistance > 60) {
            setLoading(true);
            setPullDistance(60); // Keep it visible while loading
            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    setPullDistance(0);
                }, 500);
            }
        } else {
            setPullDistance(0);
        }
    };

    return (
        <div
            className="relative w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Loading Indicator */}
            <div
                className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-50 transition-all duration-300 ease-out"
                style={{
                    transform: `translateY(${pullDistance > 0 ? pullDistance + 10 : -50}px)`,
                    opacity: pullDistance > 0 ? Math.min(pullDistance / 40, 1) : 0
                }}
            >
                <div className="bg-white rounded-full p-2 shadow-lg border border-slate-100">
                    <Loader2
                        className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`}
                        size={20}
                        style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div
                className="transition-transform duration-200 ease-out"
                style={{ transform: `translateY(${pullDistance}px)` }}
            >
                {children}
            </div>
        </div>
    );
};
