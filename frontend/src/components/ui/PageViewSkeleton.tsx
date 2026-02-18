import React from 'react';

export const PageViewSkeleton = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-3">
                    <div className="w-48 h-8 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="w-64 h-4 bg-slate-100 rounded-lg animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-32 h-10 bg-slate-100 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full h-64 bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse" />

            {/* Secondary Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse" />
                <div className="h-48 bg-white border border-slate-100 rounded-3xl shadow-sm animate-pulse" />
            </div>
        </div>
    );
};
