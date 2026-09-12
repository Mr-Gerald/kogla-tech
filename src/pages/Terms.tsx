import React from 'react';
import { FileCheck, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  const lastUpdated = 'September 12, 2026';

  return (
    <div className="pt-28 pb-20 bg-black-950 min-h-screen text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 border-b border-zinc-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-mono rounded-full mb-4">
            <Scale size={13} />
            <span>TERMS & CONDITIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-mono">
            Last Updated: {lastUpdated} | Kogla Tech
          </p>
        </div>

        {/* Core Content */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-gray-300">
          
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">01.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or enrolling in any program offered through <span className="text-white font-mono text-xs">koglatech.com</span> (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">02.</span> User Accounts & Authentication
            </h2>
            <p>
              To access learning materials, study rooms, and labs, you must maintain an active account. You may register using standard email/password or Google OAuth. You are solely responsible for maintaining the confidentiality of your credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">03.</span> Intellectual Property & Course Materials
            </h2>
            <p>
              All curriculum content, video masterclasses, technical documentation, source code templates, and branding are the proprietary intellectual property of Kogla Tech. Enrolled students are granted a personal, non-exclusive, non-transferable license to access course materials for educational purposes only.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">04.</span> Contact Information
            </h2>
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-gray-300 space-y-1">
              <p><strong className="text-white">Organization:</strong> Kogla Tech Global</p>
              <p><strong className="text-white">Support:</strong> emechebegerald@gmail.com</p>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-gold-400 transition-colors">Refund Policy</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-gold-400 transition-colors">Contact Support</Link>
          </div>
          <p>© {new Date().getFullYear()} Kogla Tech. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
