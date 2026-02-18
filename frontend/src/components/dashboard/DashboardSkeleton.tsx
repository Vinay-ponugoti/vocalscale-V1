const DashboardSkeleton = () => {
  return (
    <div className="animate-pulse space-y-8">
      {/* Overview Header Skeleton */}
      <div className="flex items-center justify-between opacity-50">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-100 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-40 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
              <div className="w-16 h-6 bg-gray-50 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
              <div className="h-4 w-32 bg-gray-50 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column Skeleton (Chart & Large area) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 h-[400px] shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div className="h-6 w-48 bg-gray-100 rounded"></div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-50 rounded-lg"></div>
                <div className="h-8 w-16 bg-gray-50 rounded-lg"></div>
              </div>
            </div>
            <div className="h-56 bg-gray-50/50 rounded-xl" />
          </div>
        </div>

        {/* Right Column Skeleton (Transcripts/Feed) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
              <div className="h-6 w-40 bg-gray-100 rounded"></div>
            </div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                    <div className="h-3 w-1/4 bg-gray-50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
