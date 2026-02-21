import React from 'react';

const WelcomeBanner = ({ therapist, stats }) => {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {getGreeting()}، {therapist?.firstName} {therapist?.lastName}
            </h1>
            <p className="text-white/90 text-lg">
              {therapist?.specialty || 'معالج نفسي'}
            </p>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            {therapist?.avatar ? (
              <img 
                src={therapist.avatar.startsWith('/') ? `http://localhost:4000${therapist.avatar}` : therapist.avatar} 
                alt={therapist.firstName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {therapist?.firstName?.charAt(0) || 'م'}
              </div>
            )}
            <div className="text-right">
              <div className="text-sm font-medium">{therapist?.licenseNumber || 'رقم الترخيص'}</div>
              <div className="text-xs text-white/80">{therapist?.yearsOfExperience || 0} سنوات خبرة</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats?.sessionsToday || 0}</div>
            <div className="text-sm text-white/80">جلسات اليوم</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats?.pendingRequests || 0}</div>
            <div className="text-sm text-white/80">طلبات معلقة</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1">{stats?.activeClients || 0}</div>
            <div className="text-sm text-white/80">عميل نشط</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-sm text-white/80">التقييم</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
