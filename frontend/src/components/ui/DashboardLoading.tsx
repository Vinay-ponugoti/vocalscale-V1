import React from 'react';
import { Loader2 } from 'lucide-react';

export const DashboardLoading = () => {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin absolute inset-0" />
            </div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">
                Initializing your dashboard...
            </p>
        </div>
    );
};
