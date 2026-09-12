import React from 'react';
import { Shield, Lock, Eye, CheckCircle2, FileText, Globe, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  const lastUpdated = 'September 12, 2026';

  return (
    <div className="pt-28 pb-20 bg-black-950 min-h-screen text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 border-b border-zinc-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-mono rounded-full mb-4">
            <Shield size={13} />
            <span>LEGAL & COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-mono">
            Last Updated: {lastUpdated} | Kogla Tech
          </p>
        </div>

        {/* Highlighted Google Auth Notice (Required by Google OAuth Review) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 rounded-xl bg-gradient-to-r from-gold-500/10 via-zinc-900 to-zinc-900 border border-gold-500/30"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-gold-500/20 text-gold-400 shrink-0 mt-0.5">
              <UserCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-1.5 flex items-center gap-2">
                Google Authentication & User Data Statement
              </h2>
              <p className="text-sm text-gray-200 leading-relaxed">
                <strong className="text-gold-400">Kogla Tech</strong> uses Google Authentication to securely sign in students, clients, and team members. When you choose to authenticate via Google OAuth, we collect and process only essential account identification information: strictly your <strong>Name</strong>, <strong>Email address</strong>, and <strong>Profile image URL</strong>.
              </p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                We strictly adhere to the <span className="text-gold-400/90 font-medium">Google API Services User Data Policy</span>, including the Limited Use requirements. We never sell your Google personal data, share it with advertisers, or use it for any unauthorized purpose beyond granting you authenticated access to your student dashboard, courses, and purchased services.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Core Content */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-gray-300">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">01.</span> Overview & Scope
            </h2>
            <p>
              This Privacy Policy applies to the Kogla Tech digital platform, including the Kogla Tech Academy learning management system, client portals, and associated web properties at <span className="text-white font-mono text-xs">koglatech.com</span>. We are committed to safeguarding the privacy and digital identity of our students, developers, and global enterprise clients.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">02.</span> Information We Collect
            </h2>
            <p>We collect information necessary to deliver comprehensive technical education and software development services:</p>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold-500 shrink-0 mt-1" />
                <span><strong>Account & Profile Information:</strong> Full name, verified email address, chosen password, and enrolled course tracks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold-500 shrink-0 mt-1" />
                <span><strong>Federated Identity (Google OAuth):</strong> Authorized OAuth credentials, primary email, display name, and avatar.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold-500 shrink-0 mt-1" />
                <span><strong>Learning Progress & Activity:</strong> Completed lessons, curriculum progress, quiz assessments, and certificate verifications.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold-500 shrink-0 mt-1" />
                <span><strong>Payment & Transaction Records:</strong> Tuition payment status and transaction references. (Payment card details are processed directly by certified global gateways and are never stored on Kogla Tech servers).</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">03.</span> How We Use Your Information
            </h2>
            <p>Your information is used strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li>Authenticate your identity and provide secure access to your academy study rooms and projects.</li>
              <li>Deliver course modules, track milestone achievements, and issue cryptographically verifiable certificates.</li>
              <li>Send critical system notifications, account security alerts, and curriculum updates.</li>
              <li>Maintain platform integrity, prevent unauthorized duplicate accounts, and protect academic community standards.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">04.</span> Data Security & Encryption
            </h2>
            <p>
              All traffic and data transactions on Kogla Tech are encrypted using industry-standard Transport Layer Security (TLS 1.3). Database records, authentication tokens, and sensitive attributes are secured with strict row-level security and access control policies.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-gold-500 font-mono">05.</span> Contact & Data Subject Rights
            </h2>
            <p>
              You have the right to inspect, correct, export, or request the deletion of your personal account data at any time. For privacy inquiries or compliance requests:
            </p>
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-gray-300 space-y-1">
              <p><strong className="text-white">Organization:</strong> Kogla Tech Global</p>
              <p><strong className="text-white">Email:</strong> emechebegerald@gmail.com</p>
              <p><strong className="text-white">Website:</strong> https://koglatech.com</p>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
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
