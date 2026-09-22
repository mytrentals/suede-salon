import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import { AdminLoginPage } from '@/pages/Onboarding/AdminLogin';
import { AdminDashboardPage } from '@/pages/Onboarding/AdminDashboard';
import { StylistLoginPage } from '@/pages/Onboarding/StylistLogin';
import { StylistDashboardPage } from '@/pages/Onboarding/StylistDashboard';
import { StylistSignupPage } from '@/pages/Onboarding/StylistSignup';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard/:token" element={<AdminDashboardPage />} />

        {/* Stylist Routes */}
        <Route path="/stylist/login" element={<StylistLoginPage />} />
        <Route path="/stylist/dashboard/:token" element={<StylistDashboardPage />} />
        <Route path="/stylist/signup/:inviteToken" element={<StylistSignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
