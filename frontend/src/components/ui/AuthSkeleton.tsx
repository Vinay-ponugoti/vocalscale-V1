import React from 'react';
import { motion } from 'framer-motion';

export const AuthSkeleton = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white font-sans antialiased">
            {/* Background Decor (Grid & Spotlight) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.05),transparent_70%)]" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                {/* Header Skeleton */}
                <header className="w-full flex items-center justify-between px-6 py-8 md:px-12 opacity-40">
                    <div className="w-32 h-10 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="w-24 h-4 bg-slate-100 rounded-full animate-pulse hidden md:block" />
                </header>

                {/* Form Area Skeleton */}
                <main className="flex flex-1 items-center justify-center p-6 pb-20">
                    <div className="w-full max-w-[440px] flex flex-col items-center">
                        {/* Floating Top Icon Skeleton */}
                        <div className="mb-8 p-6 bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-50 animate-pulse">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                        </div>

                        {/* Content Card Skeleton */}
                        <div className="w-full h-[500px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 p-8 flex flex-col items-center space-y-8">
                            {/* Title & Description */}
                            <div className="w-full space-y-3 flex flex-col items-center">
                                <div className="w-48 h-8 bg-slate-100 rounded-xl animate-pulse" />
                                <div className="w-64 h-4 bg-slate-100 rounded-full animate-pulse" />
                            </div>

                            {/* Form Fields */}
                            <div className="w-full space-y-4 pt-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-[1rem] animate-pulse" />
                                ))}
                            </div>

                            {/* Button */}
                            <div className="w-full h-14 bg-slate-200 rounded-[1rem] animate-pulse mt-4" />

                            {/* Divider */}
                            <div className="w-full flex items-center gap-4 py-4 opacity-30">
                                <div className="flex-1 h-px bg-slate-200" />
                                <div className="w-20 h-3 bg-slate-200 rounded" />
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            {/* Bottom Social */}
                            <div className="w-32 h-16 bg-white border border-slate-100 rounded-[1rem] animate-pulse" />
                        </div>
                    </div>
                </main>

                {/* Footer Skeleton */}
                <footer className="w-full py-8 text-center opacity-30">
                    <div className="w-64 h-2 bg-slate-200 rounded-full mx-auto animate-pulse" />
                </footer>
            </div>
        </div>
    );
};
