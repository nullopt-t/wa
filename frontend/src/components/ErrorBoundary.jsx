import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-8 border border-[var(--border-color)]/30 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-5xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">حدث خطأ غير متوقع</h2>
            <p className="text-[var(--text-secondary)] mb-6">نأسف، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.</p>
            <div className="flex flex-col gap-3">
              <button onClick={this.handleReset} className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors">
                <i className="fas fa-redo ml-2"></i> إعادة المحاولة
              </button>
              <Link to="/" className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors">
                <i className="fas fa-home ml-2"></i> العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
