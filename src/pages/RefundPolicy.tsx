import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Ban, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Scale, 
  BookOpen, 
  Code2, 
  Mail, 
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-200 pt-24 pb-20 selection:bg-gold-500 selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Ecosystem
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-zinc-850 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-mono uppercase rounded-full mb-4">
            <ShieldAlert size={14} className="text-red-400" />
            Binding Legal Notice & Financial Protocol
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight uppercase">
            Master Refund & <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-amber-600">
              Cancellation Policy
            </span>
          </h1>
          
          <p className="mt-4 text-sm text-zinc-400 font-mono">
            Official Policy Effective Date: <span className="text-zinc-200">January 1, 2026</span> &bull; Applicable across Kogla Tech Global, Kogla Academy & Enterprise Solutions
          </p>
        </div>

        {/* High-Impact Executive Summary Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-950/40 via-zinc-900/90 to-black border-2 border-red-600/60 rounded-xl p-6 md:p-8 mb-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-lg shrink-0 text-red-400">
              <Ban size={28} />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold uppercase font-display text-white tracking-wide flex items-center gap-2">
                Executive Notice: Strict No-Refund Standard
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                Kogla Tech Global (<strong className="text-white">"Kogla Tech"</strong>, <strong className="text-white">"the Company"</strong>, <strong className="text-white">"we"</strong>, or <strong className="text-white">"us"</strong>) operates under an <span className="text-red-400 font-bold uppercase underline decoration-red-500 underline-offset-4">absolute and unconditional No-Refund Policy</span>. 
                All payments, tuition fees, cohort seat reservations, enterprise retainers, software engineering milestones, mentoring sessions, and digital asset purchases are <strong className="text-white">100% final, irrevocable, and non-refundable</strong> upon transaction completion.
              </p>
              <div className="p-3 bg-black/60 border border-red-500/20 rounded-md text-[11px] font-mono text-red-300/90 leading-relaxed">
                By clicking "Enroll", "Submit Payment", "Pay Tuition", or by authorizing any charge via our payment gateways (Paystack, Flutterwave, Stripe, Bank Wire, or Cryptocurrency), you expressly acknowledge that you have read, understood, and irrevocably consented to this strict non-refund policy.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Policy Detailed Sections */}
        <div className="space-y-10">

          {/* Section 1: Scope & Rationale */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-gold-400 border-b border-zinc-800 pb-3">
              <Scale size={20} />
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
                1. Universal Scope & Operational Rationale
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              This Policy applies to all services and products rendered by Kogla Tech, whether accessed via <span className="text-gold-400 font-mono">koglatech.com</span>, subsidiary portals, enterprise contracts, or authorized affiliate referrals.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg space-y-2">
                <span className="text-xs font-mono font-bold text-gold-400 uppercase block">Instant Resource Provisioning</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Upon payment confirmation, specialized cloud compute resources, sandbox environments, dedicated instructor hours, and proprietary source repositories are permanently allocated to your account.
                </p>
              </div>
              <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg space-y-2">
                <span className="text-xs font-mono font-bold text-gold-400 uppercase block">Zero-Inventory Seat Exclusivity</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Our cohorts maintain strict student-to-mentor ratios. Reserving an academy seat instantly and permanently deprives another candidate of that position for the duration of the curriculum.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Kogla Academy Policies */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-gold-400 border-b border-zinc-800 pb-3">
              <BookOpen size={20} />
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
                2. Kogla Academy (Tuition & Cohort Enrollments)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              For all students and learners enrolled in Kogla Academy bootcamps, certificate tracks, study rooms, or interactive coding laboratories:
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2.5">
                <Ban size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">No Prorated Refunds:</strong> No partial or prorated refunds will be issued under any circumstance, including if a student withdraws on Day 1, misses live study sessions, fails to submit assignments, or leaves before cohort completion.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Ban size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Non-Attendance & Scheduling Conflicts:</strong> Inability to participate due to job changes, internet outages, electrical disruptions, personal scheduling conflicts, or academic difficulty does not constitute grounds for tuition reimbursement.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Ban size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Subjective Dissatisfaction:</strong> Technical training requires active commitment, discipline, and practical effort. Dislike of course difficulty, teaching methodology, or individual assessments does not warrant a refund.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Cohort Deferral Protocol (Alternative to Refund):</strong> If extreme medical emergencies or provable hardship prevents attendance prior to the cohort midpoint, the student may submit an official written request to <span className="text-gold-400 font-mono">admissions@koglatech.com</span> to request a one-time deferral to the subsequent cohort cycle, subject to seat availability and administrative approval. Cash refunds are strictly prohibited.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3: Enterprise Solutions & Bespoke Engineering */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-gold-400 border-b border-zinc-800 pb-3">
              <Code2 size={20} />
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
                3. Enterprise Solutions & Custom Engineering Contracts
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              For corporate clients engaging Kogla Tech for bespoke software engineering, cybersecurity architecture, systems deployment, or technical consulting:
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-300 font-sans">
              <div className="p-3.5 bg-black/50 border border-zinc-800 rounded-lg">
                <strong className="text-white block font-mono text-xs uppercase mb-1">Architecture & Discovery Deposits</strong>
                Initial scoping fees, architectural blueprints, and sprint retainers are non-refundable once engineering analysis or sprint initialization has commenced.
              </div>

              <div className="p-3.5 bg-black/50 border border-zinc-800 rounded-lg">
                <strong className="text-white block font-mono text-xs uppercase mb-1">Milestone Payments</strong>
                Payments associated with completed sprints, code deliverables, or deployed modules are final upon client sign-off or deployment to staging/production environments.
              </div>

              <div className="p-3.5 bg-black/50 border border-zinc-800 rounded-lg">
                <strong className="text-white block font-mono text-xs uppercase mb-1">30-Day Defect Warranty in Lieu of Refunds</strong>
                Instead of financial refunds on custom software deliverables, Kogla Tech provides a 30-day post-delivery bug-fix warranty. Any defect failing to meet agreed-upon technical specifications documented in the Statement of Work (SOW) will be remediated at no additional charge during this warranty window.
              </div>
            </div>
          </section>

          {/* Section 4: Digital Assets & Certifications */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-gold-400 border-b border-zinc-800 pb-3">
              <FileText size={20} />
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
                4. Digital Products, Templates & Verified Credentials
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              All digital software downloads, pre-built codebase templates, verified cryptographic certificates, and premium sandbox access tokens are delivered instantaneously in electronic format. Once access credentials or download tokens have been dispatched, the product is deemed fully consumed, and all refund rights are permanently exhausted.
            </p>
          </section>

          {/* Section 5: Strict Anti-Chargeback & Fraud Enforcement */}
          <section className="bg-gradient-to-b from-red-950/30 to-zinc-900 border border-red-500/40 rounded-xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-red-400 border-b border-red-500/30 pb-3">
              <AlertTriangle size={20} />
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
                5. Strict Anti-Chargeback Protocol & Financial Disputes
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Kogla Tech enforces a zero-tolerance policy against fraudulent chargebacks and frivolous payment disputes initiated through issuing banks, credit card providers, or payment aggregators.
            </p>

            <div className="bg-black/70 border border-red-500/30 rounded-lg p-4 space-y-2 text-xs font-mono text-red-300">
              <div className="font-bold uppercase tracking-wide text-red-400">Consequences of Initiating an Unjustified Chargeback:</div>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>Immediate and permanent forfeiture of all platform, laboratory, and repository access.</li>
                <li>Immediate revocation and public invalidation of any issued certificates, credentials, and verification IDs.</li>
                <li>Notification to international fraud reporting databases and partner payment networks.</li>
                <li>Legal pursuit for the full transaction sum, associated bank penalties, recovery fees, and reasonable legal costs incurred.</li>
              </ul>
            </div>
            
            <p className="text-xs text-zinc-400 italic">
              If you believe a billing error or unauthorized transaction has occurred, you must contact our Billing Compliance Division directly at <span className="text-gold-400 font-mono">billing@koglatech.com</span> prior to contacting your financial institution.
            </p>
          </section>

          {/* Section 6: Force Majeure & Administrative Rescheduling */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-gold-400 border-b border-zinc-800 pb-3">
              <Lock size={20} />
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
                6. Program Adjustments & Force Majeure
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              In the extraordinary event that Kogla Tech reschedules a cohort launch due to infrastructure upgrades, instructor unavailability, or force majeure events (e.g., natural disasters, widespread telecom grid failures, regional civil unrest), all registered students will be automatically migrated to the next available cohort with full priority rights. Program adjustments, date changes, or instructor substitutions do not entitle any participant to a monetary refund.
            </p>
          </section>

          {/* Section 7: Mandatory Consent & Contact */}
          <section className="bg-black border border-gold-500/30 rounded-xl p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-gold-400" />
              7. Legal Consent & Official Compliance Inquiries
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              By registering an account, making a tuition down-payment, or paying for an engineering invoice, you certify that you are at least 18 years old (or have authorized parental consent), possess the legal authority to enter into binding agreements, and unequivocally accept all stipulations outlined in this Master Refund & Cancellation Policy.
            </p>

            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
              <div className="text-zinc-400">
                Billing Support: <a href="mailto:billing@koglatech.com" className="text-gold-400 hover:underline">billing@koglatech.com</a>
              </div>
              <div className="text-zinc-400">
                General Counsel: <a href="mailto:solutions@koglatech.com" className="text-gold-400 hover:underline">solutions@koglatech.com</a>
              </div>
            </div>
          </section>

        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-gold-500/40 hover:border-gold-500 text-gold-400 text-xs uppercase font-mono font-bold rounded-lg transition-all"
          >
            Review Academy Offerings
          </Link>
        </div>

      </div>
    </div>
  );
}
