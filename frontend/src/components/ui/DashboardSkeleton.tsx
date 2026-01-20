import React from 'react';

export const DashboardSkeleton = () => {
    return (
        <div className="h-screen w-full flex bg-[#F5F7FA] overflow-hidden font-sans">
            {/* Sidebar Skeleton */}
            <aside className="hidden md:flex flex-col w-72 h-full bg-white border-r border-slate-200">
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl animate-pulse" />
                    <div className="ml-4 space-y-2">
                        <div className="w-24 h-4 bg-slate-100 rounded animate-pulse" />
                        <div className="w-16 h-2 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="w-16 h-2 bg-slate-100 rounded animate-pulse" />
                            <div className="space-y-3">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="w-full h-10 bg-slate-50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Navbar Skeleton */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <div className="w-48 h-10 bg-slate-50 rounded-xl animate-pulse" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-full animate-pulse" />
                        <div className="w-32 h-10 bg-slate-50 rounded-xl animate-pulse" />
                    </div>
                </header>

                {/* Page Content Skeleton */}
                <main className="flex-1 p-8 overflow-y-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="w-64 h-8 bg-slate-200 rounded-xl animate-pulse" />
                            <div className="w-96 h-4 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                        <div className="w-32 h-12 bg-blue-600/10 rounded-xl animate-pulse" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse p-6 space-y-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                                <div className="w-24 h-6 bg-slate-100 rounded-lg" />
                            </div>
                        ))}
                    </div>

                    <div className="h-96 bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse" />
                </main>
            </div>
        </div>
    );
};
