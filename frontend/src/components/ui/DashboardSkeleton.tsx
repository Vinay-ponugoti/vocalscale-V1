import React from 'react';

export const DashboardSkeleton = () => {
    return (
        <div className="h-screen w-full flex bg-[#F5F7FA] overflow-hidden font-sans">
            {/* Sidebar Skeleton */}
            {/* Sidebar Skeleton - Matching Layout width (288px = w-72) */}
            <aside className="hidden md:flex flex-col w-72 h-full bg-white border-r border-slate-200">
                <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="w-24 h-6 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>

                <div className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-hide">
                    {/* General Section */}
                    <div className="space-y-2">
                        <div className="w-16 h-3 bg-slate-50 rounded animate-pulse mb-3" />
                        <div className="w-full h-10 bg-slate-50 rounded-xl animate-pulse" />
                    </div>
                    {/* Operations Section */}
                    <div className="space-y-2">
                        <div className="w-20 h-3 bg-slate-50 rounded animate-pulse mb-3" />
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-full h-10 bg-slate-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                    {/* Configuration Section */}
                    <div className="space-y-2">
                        <div className="w-24 h-3 bg-slate-50 rounded animate-pulse mb-3" />
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="w-full h-10 bg-slate-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                    {/* System Section */}
                    <div className="space-y-2">
                        <div className="w-16 h-3 bg-slate-50 rounded animate-pulse mb-3" />
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="w-full h-10 bg-slate-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Navbar Skeleton - Matching Layout padding (px-2 md:px-10) */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-2 md:px-10 shrink-0">
                    {/* Mobile Menu Toggle Placeholder */}
                    <div className="md:hidden w-10 h-10 bg-slate-50 rounded-xl animate-pulse mr-2" />

                    {/* Search Bar Placeholder */}
                    <div className="flex-1 max-w-2xl h-10 bg-slate-50 rounded-xl animate-pulse mx-2" />

                    <div className="flex items-center gap-2 md:gap-4 ml-4">
                        <div className="hidden sm:block w-10 h-10 bg-slate-50 rounded-xl animate-pulse" /> {/* Billing */}
                        <div className="w-10 h-10 bg-slate-50 rounded-xl animate-pulse" /> {/* Bell */}
                        <div className="w-32 h-10 bg-slate-50 rounded-full animate-pulse" /> {/* Profile */}
                    </div>
                </header>

                {/* Page Content Skeleton - Matching Layout padding (p-4 md:p-8) */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                        <div className="space-y-3">
                            <div className="w-48 h-8 bg-slate-200 rounded-xl animate-pulse" />
                            <div className="w-64 h-4 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="w-40 h-10 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    <div className="w-full h-32 bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 2xl:gap-10">
                        <div className="lg:col-span-2 2xl:col-span-3 space-y-6">
                            <div className="w-full h-[400px] bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse" />
                        </div>
                        <div className="lg:col-span-1 2xl:col-span-1 h-full">
                            <div className="w-full h-[400px] bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
