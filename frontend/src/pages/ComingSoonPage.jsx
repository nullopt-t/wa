import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedItem from '../components/AnimatedItem.jsx';

const ComingSoonPage = ({ title, icon }) => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center p-4">
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full mb-6">
              <i className={`fas ${icon || 'fa-tools'} text-white text-5xl`}></i>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            {title || 'قريباً'}
          </h1>

          <p className="text-xl text-[var(--text-secondary)] mb-8">
            هذه الصفحة قيد التطوير وستكون متاحة قريباً
          </p>

          {/* Back Button */}
          <Link
            to="/therapist/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            <i className="fas fa-arrow-right"></i>
            العودة للوحة التحكم
          </Link>
        </div>
      </AnimatedItem>
    </div>
  );
};

export default ComingSoonPage;
