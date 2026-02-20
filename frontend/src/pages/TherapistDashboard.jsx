import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedItem from '../components/AnimatedItem.jsx';

const TherapistDashboard = () => {
  const [therapist, setTherapist] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Simulating therapist data fetch
  useEffect(() => {
    // In a real app, this would come from the auth context
    const mockTherapist = {
      firstName: 'د. سارة',
      lastName: 'أحمد',
      email: 'dr.sara.ahmed@example.com',
      specialty: 'العلاج السلوكي المعرفي',
      yearsOfExperience: 8,
      licenseNumber: 'THER-2024-001',
      rating: 4.8,
      totalClients: 120
    };
    
    setTherapist(mockTherapist);
    
    // Mock appointments
    setAppointments([
      { id: 1, clientName: 'أحمد محمد', time: '10:00 AM', status: 'pending' },
      { id: 2, clientName: 'نور إبراهيم', time: '11:30 AM', status: 'confirmed' },
      { id: 3, clientName: 'محمد علي', time: '2:00 PM', status: 'pending' }
    ]);
    
    // Mock clients
    setClients([
      { id: 1, name: 'أحمد محمد', lastSession: '2024-01-20', progress: 'Good' },
      { id: 2, name: 'نور إبراهيم', lastSession: '2024-01-19', progress: 'Excellent' },
      { id: 3, name: 'محمد علي', lastSession: '2024-01-18', progress: 'Fair' }
    ]);
    
    // Mock reviews
    setReviews([
      { id: 1, clientName: 'أحمد محمد', rating: 5, comment: 'دكتورة ممتازة، ساعدتني كثيراً' },
      { id: 2, clientName: 'نور إبراهيم', rating: 5, comment: 'العلاج كان فعال جداً' },
      { id: 3, clientName: 'محمد علي', rating: 4, comment: 'ممتازة في تبسيط الأمور' }
    ]);
  }, []);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Welcome Banner */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <section className="py-12 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">مرحباً، {therapist?.firstName} {therapist?.lastName}</h1>
            <p className="text-xl opacity-90">نأمل أن تكون في يوم مثمر ونفسي مريح</p>
          </div>
        </section>
      </AnimatedItem>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Appointments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">إحصائيات سريعة</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">{therapist?.totalClients || 0}</div>
                    <div className="text-[var(--text-secondary)]">إجمالي العملاء</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">{appointments.filter(a => a.status === 'confirmed').length}</div>
                    <div className="text-[var(--text-secondary)]">الجلسات اليوم</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">{therapist?.rating || 0}</div>
                    <div className="text-[var(--text-secondary)]">التقييم</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">{therapist?.yearsOfExperience || 0}</div>
                    <div className="text-[var(--text-secondary)]">سنوات الخبرة</div>
                  </div>
                </div>
              </div>
            </AnimatedItem>

            {/* Today's Appointments */}
            <AnimatedItem type="slideUp" delay={0.3}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الجلسات اليوم</h2>
                <div className="space-y-4">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                      <div>
                        <div className="text-[var(--text-primary)] font-medium">{appointment.clientName}</div>
                        <div className="text-[var(--text-secondary)] text-sm">{appointment.time}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {appointment.status === 'confirmed' ? 'مؤكدة' : 'معلقة'}
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-[var(--primary-color)] text-white rounded-lg text-sm">بدء الجلسة</button>
                        <button className="px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg text-sm border border-[var(--border-color)]">إلغاء</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedItem>

            {/* Clients List */}
            <AnimatedItem type="slideUp" delay={0.4}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">العملاء الحاليين</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-right py-3 text-[var(--text-primary)]">الاسم</th>
                        <th className="text-right py-3 text-[var(--text-primary)]">آخر جلسة</th>
                        <th className="text-right py-3 text-[var(--text-primary)]">التحسن</th>
                        <th className="text-right py-3 text-[var(--text-primary)]">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(client => (
                        <tr key={client.id} className="border-b border-[var(--border-color)]/50">
                          <td className="py-3 text-[var(--text-primary)]">{client.name}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{client.lastSession}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              client.progress === 'Excellent' 
                                ? 'bg-green-500/20 text-green-500' 
                                : client.progress === 'Good' 
                                  ? 'bg-blue-500/20 text-blue-500' 
                                  : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {client.progress}
                            </span>
                          </td>
                          <td className="py-3">
                            <button className="px-3 py-1 bg-[var(--primary-color)] text-white rounded-lg text-sm">عرض التفاصيل</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedItem>
          </div>

          {/* Right Column - Profile and Reviews */}
          <div className="space-y-8">
            {/* Therapist Profile */}
            <AnimatedItem type="slideRight" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الملف الشخصي</h2>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{therapist?.firstName} {therapist?.lastName}</h3>
                  <p className="text-[var(--text-secondary)]">{therapist?.specialty}</p>
                  <div className="flex items-center justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fas fa-star ${i < Math.floor(therapist?.rating || 0) ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}
                      ></i>
                    ))}
                    <span className="ml-2 text-[var(--text-primary)]">{therapist?.rating || 0}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">رقم الترخيص:</span>
                    <span className="text-[var(--text-primary)]">{therapist?.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">سنوات الخبرة:</span>
                    <span className="text-[var(--text-primary)]">{therapist?.yearsOfExperience} سنة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">البريد الإلكتروني:</span>
                    <span className="text-[var(--text-primary)]">{therapist?.email}</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors">
                  <i className="fas fa-edit ml-2"></i> تعديل الملف
                </button>
              </div>
            </AnimatedItem>

            {/* Recent Reviews */}
            <AnimatedItem type="slideRight" delay={0.3}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">المراجعات الأخيرة</h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-[var(--text-primary)]">{review.clientName}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas fa-star ${i < review.rating ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedItem>

            {/* Quick Actions */}
            <AnimatedItem type="slideRight" delay={0.4}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الوصول السريع</h2>
                <div className="grid grid-cols-1 gap-4">
                  <Link to="/therapist/sessions" className="p-4 bg-[var(--bg-secondary)] rounded-xl flex items-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-calendar-check text-[var(--primary-color)] text-xl ml-3"></i>
                    <span className="text-[var(--text-primary)]">إدارة الجلسات</span>
                  </Link>
                  <Link to="/therapist/clients" className="p-4 bg-[var(--bg-secondary)] rounded-xl flex items-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-users text-[var(--primary-color)] text-xl ml-3"></i>
                    <span className="text-[var(--text-primary)]">قائمة العملاء</span>
                  </Link>
                  <Link to="/therapist/resources" className="p-4 bg-[var(--bg-secondary)] rounded-xl flex items-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-book text-[var(--primary-color)] text-xl ml-3"></i>
                    <span className="text-[var(--text-primary)]">الموارد</span>
                  </Link>
                  <Link to="/therapist/analytics" className="p-4 bg-[var(--bg-secondary)] rounded-xl flex items-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-chart-line text-[var(--primary-color)] text-xl ml-3"></i>
                    <span className="text-[var(--text-primary)]">التحليلات</span>
                  </Link>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;