import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Top Bar Skeleton */}
      <div className="bg-[var(--card-bg)] backdrop-blur-md border-b border-[var(--border-color)]/30 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-[var(--bg-secondary)] rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-[var(--bg-secondary)] rounded animate-pulse hidden sm:block"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-[var(--bg-secondary)] rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-[var(--bg-secondary)] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner Skeleton */}
        <div className="bg-gradient-to-r from-gray-700/20 to-gray-600/20 rounded-2xl p-6 sm:p-8 mb-8 animate-pulse">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-gray-600/30 rounded"></div>
              <div className="h-5 w-32 bg-gray-600/30 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-600/30 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-600/30 rounded"></div>
                <div className="h-3 w-16 bg-gray-600/30 rounded"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-600/20 rounded-xl p-4">
                <div className="h-8 w-12 bg-gray-600/30 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-600/30 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--card-bg)] rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-600/20 rounded-xl"></div>
                <div className="h-3 w-12 bg-gray-600/30 rounded"></div>
              </div>
              <div className="h-8 w-16 bg-gray-600/30 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-600/30 rounded"></div>
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Sessions Skeleton */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-32 bg-gray-600/30 rounded"></div>
                <div className="h-6 w-20 bg-gray-600/30 rounded"></div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                    <div className="w-12 h-12 bg-gray-600/20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-600/30 rounded"></div>
                      <div className="h-3 w-24 bg-gray-600/30 rounded"></div>
                    </div>
                    <div className="h-8 w-24 bg-gray-600/30 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Clients Skeleton */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-32 bg-gray-600/30 rounded"></div>
                <div className="h-6 w-20 bg-gray-600/30 rounded"></div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 bg-gray-600/20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 bg-gray-600/30 rounded"></div>
                      <div className="h-3 w-20 bg-gray-600/30 rounded"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-600/30 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions Skeleton */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 animate-pulse">
              <div className="h-8 w-32 bg-gray-600/30 rounded mb-6"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--bg-secondary)] rounded-xl p-4">
                    <div className="w-12 h-12 bg-gray-600/20 rounded-xl mb-3"></div>
                    <div className="h-4 w-20 bg-gray-600/30 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Skeleton */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 animate-pulse">
              <div className="h-8 w-32 bg-gray-600/30 rounded mb-6"></div>
              <div className="bg-gray-600/20 rounded-xl p-4 mb-6">
                <div className="h-4 w-24 bg-gray-600/30 rounded mb-2"></div>
                <div className="h-8 w-32 bg-gray-600/30 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-600/20 rounded-xl p-4">
                  <div className="h-3 w-20 bg-gray-600/30 rounded mb-2"></div>
                  <div className="h-6 w-12 bg-gray-600/30 rounded"></div>
                </div>
                <div className="bg-gray-600/20 rounded-xl p-4">
                  <div className="h-3 w-20 bg-gray-600/30 rounded mb-2"></div>
                  <div className="h-6 w-12 bg-gray-600/30 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-12 w-full bg-gray-600/30 rounded-xl"></div>
                <div className="h-12 w-full bg-gray-600/30 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSkeleton;
