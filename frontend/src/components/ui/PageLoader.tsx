import React from 'react';

export const PageLoader = () => {
  return (
    <div className="min-h-screen w-full bg-[#020617] p-8 space-y-12 overflow-hidden">
      {/* Top Navigation Skeleton */}
      <div className="flex items-center justify-between opacity-20">
        <div className="w-32 h-8 bg-slate-800 rounded-lg animate-pulse" />
        <div className="hidden md:flex gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-20 h-4 bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
        <div className="w-24 h-10 bg-blue-900/40 rounded-full animate-pulse" />
      </div>

      {/* Hero Content Skeleton */}
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 pt-12">
        <div className="w-48 h-6 bg-slate-800/50 rounded-full animate-pulse" />
        <div className="w-full h-16 md:h-24 bg-slate-800 rounded-2xl animate-pulse" />
        <div className="w-full max-w-2xl h-12 bg-slate-800/40 rounded-xl animate-pulse text-center" />

        {/* CTAs */}
        <div className="flex gap-4 mt-4">
          <div className="w-40 h-14 bg-blue-600/20 rounded-xl animate-pulse" />
          <div className="w-40 h-14 bg-slate-800/50 rounded-xl animate-pulse transition-all" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="max-w-6xl mx-auto pt-20">
        <div className="w-full aspect-video bg-slate-900/50 rounded-3xl border border-white/5 animate-pulse" />
      </div>

      {/* Animated Subtle Background Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>
    </div>
  );
};
