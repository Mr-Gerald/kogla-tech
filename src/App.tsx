/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Academy from './pages/Academy';
import Projects from './pages/Projects';
import Reviews from './pages/Reviews';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmailCallback from './pages/auth/VerifyEmailCallback';
import CourseDetails from './pages/CourseDetails';
import ServiceWorkflow from './pages/ServiceWorkflow';
import ProjectDetails from './pages/ProjectDetails';
import LabDetails from './pages/LabDetails';
import AdminPortal from './pages/AdminPortal';
import StudyRoom from './pages/StudyRoom';
import Profile from './pages/Profile';
import AffiliatePortal from './pages/AffiliatePortal';
import MonetizationHub from './pages/MonetizationHub';
import VerifyCertificate from './pages/VerifyCertificate';
import DesignStudio from './pages/DesignStudio';
import NotFound from './pages/NotFound';
import { AiAssistantChat } from './components/AiAssistantChat';

export default function App() {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-black-950 text-white selection:bg-gold-500 selection:text-black">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/academy" element={<Academy />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/verify-email" element={<VerifyEmailCallback />} />
                <Route path="/auth/callback" element={<VerifyEmailCallback />} />
                <Route path="/academy/:slug" element={<CourseDetails />} />
                <Route path="/services/:slug" element={<ServiceWorkflow />} />
                <Route path="/projects/:slug" element={<ProjectDetails />} />
                <Route path="/labs/:slug" element={<LabDetails />} />
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/affiliate-portal" element={<AffiliatePortal />} />
                <Route path="/monetize" element={<MonetizationHub />} />
                <Route path="/how-to-make-money-from-tech" element={<MonetizationHub />} />
                <Route path="/verify-certificate" element={<VerifyCertificate />} />
                <Route path="/verify-certificate/:certId" element={<VerifyCertificate />} />
                <Route path="/design-studio" element={<DesignStudio />} />
                <Route path="/brand-studio" element={<DesignStudio />} />
                <Route path="/flyers" element={<DesignStudio />} />
                <Route path="/study" element={<StudyRoom />} />
                <Route path="/study/:slug" element={<StudyRoom />} />
                <Route path="/study/:slug/room/:roomId" element={<StudyRoom />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <AiAssistantChat />
          </div>
        </Router>
      </AuthProvider>
    </SiteConfigProvider>
  );
}


