/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Academy from './pages/Academy';
import Projects from './pages/Projects';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import CourseDetails from './pages/CourseDetails';
import ServiceWorkflow from './pages/ServiceWorkflow';
import AdminPortal from './pages/AdminPortal';

export default function App() {
  return (
    <Router>
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
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/academy/:slug" element={<CourseDetails />} />
            <Route path="/services/:slug" element={<ServiceWorkflow />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
