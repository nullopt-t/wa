import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ErrorProvider } from './context/ErrorContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/App.css';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import VisionPage from './pages/VisionPage.jsx';
import HabitsPage from './pages/HabitsPage.jsx';
import StoriesPage from './pages/StoriesPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import FutureMessagePage from './pages/FutureMessagePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import VideosPage from './pages/VideosPage.jsx';
import FindTherapistPage from './pages/FindTherapistPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import TherapistDashboard from './pages/TherapistDashboard.jsx';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';
import AccountSettingsPage from './pages/AccountSettingsPage.jsx';
import AnimatedRoute from './components/AnimatedRoute.jsx';

function AppWrapper() {
  const location = useLocation();

  return (
    <div className="App" dir="rtl">
      <Header />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <AnimatedRoute>
                <HomePage />
              </AnimatedRoute>
            } />
            <Route path="/categories" element={
              <AnimatedRoute>
                <CategoriesPage />
              </AnimatedRoute>
            } />
            <Route path="/community" element={
              <AnimatedRoute>
                <CommunityPage />
              </AnimatedRoute>
            } />
            <Route path="/contact" element={
              <AnimatedRoute>
                <ContactPage />
              </AnimatedRoute>
            } />
            <Route path="/about" element={
              <AnimatedRoute>
                <AboutPage />
              </AnimatedRoute>
            } />
            <Route path="/vision" element={
              <AnimatedRoute>
                <VisionPage />
              </AnimatedRoute>
            } />
            <Route path="/habits" element={
              <AnimatedRoute>
                <HabitsPage />
              </AnimatedRoute>
            } />
            <Route path="/stories" element={
              <AnimatedRoute>
                <StoriesPage />
              </AnimatedRoute>
            } />
            <Route path="/feedback" element={
              <AnimatedRoute>
                <FeedbackPage />
              </AnimatedRoute>
            } />
            <Route path="/future-message" element={
              <AnimatedRoute>
                <FutureMessagePage />
              </AnimatedRoute>
            } />
            <Route path="/login" element={
              <AnimatedRoute>
                <LoginPage />
              </AnimatedRoute>
            } />
            <Route path="/signup" element={
              <AnimatedRoute>
                <SignupPage />
              </AnimatedRoute>
            } />
            <Route path="/chatbot" element={
              <AnimatedRoute>
                <ChatbotPage />
              </AnimatedRoute>
            } />
            <Route path="/faq" element={
              <AnimatedRoute>
                <HomePage />
              </AnimatedRoute>
            } />
            <Route path="/help" element={
              <AnimatedRoute>
                <ContactPage />
              </AnimatedRoute>
            } />
            <Route path="/privacy" element={
              <AnimatedRoute>
                <PrivacyPolicyPage />
              </AnimatedRoute>
            } />
            <Route path="/terms" element={
              <AnimatedRoute>
                <TermsPage />
              </AnimatedRoute>
            } />
            <Route path="/forgot-password" element={
              <AnimatedRoute>
                <LoginPage />
              </AnimatedRoute>
            } />
            <Route path="/habits" element={
              <AnimatedRoute>
                <HabitsPage />
              </AnimatedRoute>
            } />
            <Route path="/stories" element={
              <AnimatedRoute>
                <StoriesPage />
              </AnimatedRoute>
            } />
            <Route path="/feedback" element={
              <AnimatedRoute>
                <FeedbackPage />
              </AnimatedRoute>
            } />
            <Route path="/videos" element={
              <AnimatedRoute>
                <VideosPage />
              </AnimatedRoute>
            } />
            <Route path="/find-therapist" element={
              <AnimatedRoute>
                <FindTherapistPage />
              </AnimatedRoute>
            } />
            <Route path="/dashboard" element={
              <AnimatedRoute>
                <DashboardRedirect />
              </AnimatedRoute>
            } />
            <Route path="/user-dashboard" element={
              <AnimatedRoute>
                <UserDashboard />
              </AnimatedRoute>
            } />
            <Route path="/therapist-dashboard" element={
              <AnimatedRoute>
                <TherapistDashboard />
              </AnimatedRoute>
            } />
            <Route path="/profile-settings" element={
              <AnimatedRoute>
                <ProfileSettingsPage />
              </AnimatedRoute>
            } />
            <Route path="/account-settings" element={
              <AnimatedRoute>
                <AccountSettingsPage />
              </AnimatedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

// Component to redirect based on user role
function DashboardRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }
  
  if (user?.role === 'therapist') {
    return <TherapistDashboard />;
  } else {
    return <UserDashboard />;
  }
}

function App() {
  return (
    <ErrorProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Router>
              <AppWrapper />
            </Router>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorProvider>
  );
}

export default App;