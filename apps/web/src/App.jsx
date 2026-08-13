import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { StylistSignupPage } from './pages/Onboarding/StylistSignup';
import { StylistDashboardPage } from './pages/Onboarding/StylistDashboard';
import { AdminDashboardPage } from './pages/Onboarding/AdminDashboard';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/signup" element={<StylistSignupPage />} />
                <Route path="/stylist/dashboard/:token" element={<StylistDashboardPage />} />
                <Route path="/admin/dashboard/:token" element={<AdminDashboardPage />} />
            </Routes>
        </Router>
    );
}

export default App;
