import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  CreditCard,
  Building,
  HelpCircle,
  Percent,
  Printer,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import { AffiliatePartner, ReferralLead } from '../types';
import { getAffiliateByCode, getReferralsByCode, saveAffiliatePartner } from '../lib/affiliates';
import { formatNaira } from '../data/coursesPricing';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { generateAmbassadorAgreementPdf } from '../lib/agreementPdfGenerator';

export default function AffiliatePortal() {
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const [partnerCode, setPartnerCode] = useState('AMBASSADOR');
  const [partner, setPartner] = useState<AffiliatePartner | null>(null);
  const [referrals, setReferrals] = useState<ReferralLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showContract, setShowContract] = useState(false);

  // Bank Form State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSavedSuccess, setBankSavedSuccess] = useState(false);

  const loadPartnerData = async (code: string) => {
    setLoading(true);
    try {
      const p = await getAffiliateByCode(code);
      if (p) {
        setPartner(p);
        if (p.bankDetails) {
          setBankName(p.bankDetails.bankName || '');
          setAccountNumber(p.bankDetails.accountNumber || '');
          setAccountName(p.bankDetails.accountName || '');
        }
      }
      const refs = await getReferralsByCode(code);
      setReferrals(refs);
    } catch (err) {
      console.error('Error loading partner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData(partnerCode);
  }, [partnerCode]);

  const referralUrl = `${window.location.origin}/?ref=${partnerCode}`;

  const handleDownloadAgreement = async () => {
    try {
      await generateAmbassadorAgreementPdf({
        ambassadorName: partner?.name || 'Ambassador Partner',
        promoCode: partnerCode,
        email: partner?.email || '',
        tier1Rate: 6,
        tier2Rate: 10,
        discountRate: 5,
        bankName: bankName || partner?.bankDetails?.bankName,
        accountNumber: accountNumber || partner?.bankDetails?.accountNumber,
        logoUrl: config.logoUrl
      });
    } catch (err) {
      console.error('Failed generating PDF:', err);
    }
  };

  const copyToClipboard = (text: string, isCode = false) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    setIsSavingBank(true);
    try {
      const updated: AffiliatePartner = {
        ...partner,
        bankDetails: {
          bankName,
          accountNumber,
          accountName
        }
      };
      await saveAffiliatePartner(updated);
      setPartner(updated);
      setBankSavedSuccess(true);
      setTimeout(() => setBankSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving bank details:', err);
    } finally {
      setIsSavingBank(false);
    }
  };

  const confirmedCount = referrals.filter(r => r.status === 'confirmed' || r.status === 'paid_out').length;
  const isTier2 = confirmedCount >= 3;
  const currentRate = isTier2 ? 10 : 6;
  const progressToTier2 = Math.min(100, Math.round((confirmedCount / 3) * 100));

  const totalPendingCommission = referrals
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const totalPaidOutCommission = referrals
    .filter(r => r.status === 'paid_out')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-gray-100 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-zinc-900 gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] rounded-full uppercase tracking-widest font-mono">
            <Sparkles size={11} /> Creator & Partner Growth Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-white tracking-tight">
            Partner <span className="text-gold-500">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans">
            Real-time attribution engine for <b>{partner?.name || 'Creator Partner'}</b>. Track your enrolled students, commission lifecycle, and instant payouts.
          </p>
        </div>

        {/* TOP CONTROLS: CONTRACT & CODE SWITCHER */}
        <div className="flex flex-wrap items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 bg-black border border-zinc-800 p-1.5 rounded">
              <span className="text-[10px] font-mono text-zinc-400 uppercase pl-2">Active Code:</span>
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="e.g. AMBASSADOR"
                className="w-32 bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-gold-400 font-mono uppercase rounded focus:outline-none focus:border-gold-500"
              />
            </div>
          )}
          <button
            onClick={() => setShowContract(!showContract)}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all shadow cursor-pointer"
          >
            <FileText size={14} className="text-gold-400" />
            {showContract ? 'Hide Agreement' : 'View Formal Agreement'}
          </button>
        </div>
      </div>

      {/* FORMAL CONTRACT MODAL / EXPANDED SECTION */}
      {showContract && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 sm:p-10 bg-zinc-950 border-2 border-gold-500/40 rounded-lg shadow-2xl relative overflow-hidden text-zinc-300 space-y-6 print:block"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block">LEGAL PARTNERSHIP MEMORANDUM</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase">
                Creator Brand Ambassador Agreement
              </h2>
            </div>
            <button
              onClick={handleDownloadAgreement}
              className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display rounded-sm flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download size={13} /> Download Contract (PDF)
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed font-sans text-zinc-300">
            <p>
              This Brand Ambassador & Creator Partnership Legal Agreement is entered into between <b>Kogla Tech Global</b> (hereinafter referred to as the <i>"Academy"</i>) and <b>{partner?.name || 'Ambassador Partner'}</b> (hereinafter referred to as the <i>"Ambassador"</i>).
            </p>

            <div className="bg-black/50 border border-zinc-800 p-4 rounded space-y-3 font-mono text-xs">
              <h4 className="text-gold-400 font-bold uppercase tracking-wider">1. Commission Structure & Escalator Clause</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li><b>Tier 1 (Base Rate):</b> Ambassador earns a <b>6% commission</b> on the net tuition of the first 3 enrolled and verified students.</li>
                <li><b>Tier 2 (Elevated Lifetime Rate):</b> Beginning with the <b>4th enrolled student</b> and indefinitely thereafter, the commission permanently elevates to <b>10%</b> on all subsequent student enrollments.</li>
                <li><b>Student Discount:</b> Every student registering with promo code <b className="text-gold-400">{partnerCode}</b> receives a <b>5% direct discount</b> on their tuition.</li>
              </ul>
            </div>

            <div className="bg-black/50 border border-zinc-800 p-4 rounded space-y-3 font-mono text-xs">
              <h4 className="text-gold-400 font-bold uppercase tracking-wider">2. Payment Verification & Payout Timeline</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>Commission status begins as <i>"Pending Payment"</i> upon student registration.</li>
                <li>Upon tuition confirmation by the Academy, commission moves to <i>"Confirmed & Earned"</i>.</li>
                <li>All earned commissions are disbursed directly to the Ambassador's registered bank account within <b>3 to 5 business days</b> following cohort tuition clearance.</li>
              </ul>
            </div>

            <div className="bg-black/50 border border-zinc-800 p-4 rounded space-y-3 font-mono text-xs">
              <h4 className="text-gold-400 font-bold uppercase tracking-wider">3. Ambassador Activation, Portal & Social Bio Link</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li><b>Official Partner Representation:</b> Ambassador agrees to feature their official partner designation and tracking link (e.g., <i>"🎓 Tech Ambassador @koglatech | Link in bio"</i>) in their social profile bio / link tree.</li>
                <li><b>Real-Time Tracking:</b> Ambassadors access their private portal at <code>/affiliate-portal</code> to view live student clicks, attributions, and payout records.</li>
                <li><b>Settlement Profile:</b> Valid bank account details must be maintained in the portal for automated settlement disbursements.</li>
              </ul>
            </div>

            <div className="bg-black/50 border border-zinc-800 p-4 rounded space-y-3 font-mono text-xs">
              <h4 className="text-gold-400 font-bold uppercase tracking-wider">4. Liability, Indemnification & Legal Protection</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li><b>Independent Contractor:</b> The Ambassador operates strictly as an independent contractor and is not an employee, legal partner, or agent of Kogla Tech Global.</li>
                <li><b>Indemnification:</b> Ambassador agrees to indemnify, defend, and hold harmless Kogla Tech Global, its founder, officers, directors, and employees from any claims, liabilities, damages, losses, or legal expenses arising out of Ambassador's promotional practices or misrepresentations.</li>
                <li><b>Limitation of Liability:</b> Kogla Tech Global's aggregate liability under this agreement shall never exceed the total commissions paid or payable to the Ambassador in the preceding 6 months.</li>
                <li><b>Intellectual Property:</b> All curriculum materials, trademarks, and branding remain the exclusive property of Kogla Tech Global.</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500 uppercase block">Signed on behalf of Kogla Tech</span>
              <span className="text-gold-400 font-bold text-sm">Gerald Emechebe</span>
              <span className="text-zinc-400 block text-[10px]">Founder & CEO, Kogla Tech Global</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase block">Ambassador Entity</span>
              <span className="text-gold-400 font-bold text-sm">{partner?.name || 'Ambassador Partner'}</span>
              <span className="text-zinc-400 block text-[10px]">{partner?.instagramHandle || '@creator'}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* SHAREABLE ASSETS & TIER PROGRESSION GRID */}
      <div className="grid lg:grid-cols-12 gap-8 mb-10 items-stretch">
        
        {/* LEFT: SHAREABLE PROMO CODE & LINK */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-850 rounded-lg p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold flex items-center gap-1.5">
              <ExternalLink size={12} /> YOUR EXCLUSIVE ATTRIBUTION ASSETS
            </span>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Shareable Referral Link (Auto-Applies 5% Discount)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="w-full bg-black border border-zinc-800 rounded px-3.5 py-2.5 text-xs text-gold-400 font-mono focus:outline-none select-all"
                />
                <button
                  onClick={() => copyToClipboard(referralUrl, false)}
                  className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Official Promo Code (Use at Checkout or DM)
              </label>
              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 bg-gold-500/10 border-2 border-dashed border-gold-500/40 rounded text-gold-400 font-mono font-black text-lg tracking-widest uppercase">
                  {partnerCode}
                </div>
                <button
                  onClick={() => copyToClipboard(partnerCode, true)}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono uppercase rounded flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check size={13} className="text-gold-400" /> : <Copy size={13} />}
                  {copiedCode ? 'Code Copied' : 'Copy Code'}
                </button>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Gives students 5% OFF
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-black/60 border border-zinc-800/80 rounded text-xs text-zinc-400 font-sans flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-gold-400 shrink-0 mt-0.5" />
            <span>
              Every student who clicks your link or enters <b>{partnerCode}</b> is automatically attributed to your dashboard for 30 full days.
            </span>
          </div>
        </div>

        {/* RIGHT: TIER PROGRESSION CARD */}
        <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border border-gold-500/30 rounded-lg p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold">
                COMMISSION TIER STATUS
              </span>
              <span className="px-2.5 py-1 bg-gold-500/20 border border-gold-500/50 text-gold-400 font-mono font-bold text-xs rounded-full uppercase">
                {isTier2 ? 'Tier 2: 10% Unlocked' : 'Tier 1: 6% Base'}
              </span>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white uppercase">
                Current Rate: <span className="text-gold-400">{currentRate}%</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {isTier2 
                  ? '🎉 Congratulations! You have permanently unlocked the 10% commission rate on all student enrollments.' 
                  : `${3 - confirmedCount} more confirmed student${3 - confirmedCount === 1 ? '' : 's'} needed to unlock lifetime 10% commission.`}
              </p>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>Tier 1 (6%)</span>
                <span>{confirmedCount} / 3 Confirmed</span>
                <span>Tier 2 (10%)</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressToTier2}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-850 mt-4 text-[11px] font-mono text-zinc-400">
            Next Level: <b>10% commission</b> on high-ticket tracks (e.g. ₦60,000 on Mobile Dev).
          </div>
        </div>

      </div>

      {/* METRIC STATS 4-BOX ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Users size={12} className="text-gold-400" /> Total Inquiries / Leads
          </span>
          <div className="text-2xl font-bold font-display text-white">{referrals.length}</div>
          <span className="text-[10px] text-zinc-400 font-mono">Registered with code</span>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" /> Confirmed Paid Students
          </span>
          <div className="text-2xl font-bold font-display text-emerald-400">{confirmedCount}</div>
          <span className="text-[10px] text-zinc-400 font-mono">Tuition verified by Admin</span>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Clock size={12} className="text-gold-400" /> Ready for Payout
          </span>
          <div className="text-2xl font-bold font-display text-gold-400">{formatNaira(totalPendingCommission)}</div>
          <span className="text-[10px] text-zinc-400 font-mono">Disbursed in 3-5 days</span>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <DollarSign size={12} className="text-blue-400" /> Total Paid Out
          </span>
          <div className="text-2xl font-bold font-display text-blue-400">{formatNaira(totalPaidOutCommission)}</div>
          <span className="text-[10px] text-zinc-400 font-mono">Lifetime bank settlements</span>
        </div>
      </div>

      {/* MAIN CLIENT PIPELINE TABLE */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-6 shadow-xl mb-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block">
              TRANSPARENT REVENUE LOG
            </span>
            <h3 className="text-lg sm:text-xl font-display font-bold text-white uppercase">
              Student Referral Pipeline & Status
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {referrals.length} {referrals.length === 1 ? 'Record' : 'Records'} Tracked
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded space-y-2">
            <Users className="mx-auto text-zinc-600" size={32} />
            <p className="text-xs font-mono uppercase text-zinc-400">No student referrals recorded yet.</p>
            <p className="text-[11px] text-zinc-500">Share your link <b className="text-gold-400">{referralUrl}</b> to start logging students.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-500">
                  <th className="pb-3 pr-4">Student Name</th>
                  <th className="pb-3 px-4">Course Track</th>
                  <th className="pb-3 px-4">Format</th>
                  <th className="pb-3 px-4">Net Tuition</th>
                  <th className="pb-3 px-4">Commission</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {referrals.map((lead) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[10px] uppercase">
                      <Clock size={11} /> Pending Payment
                    </span>
                  );
                  if (lead.status === 'confirmed') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[10px] uppercase font-bold">
                        <CheckCircle2 size={11} /> Confirmed & Enrolled
                      </span>
                    );
                  } else if (lead.status === 'paid_out') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded text-[10px] uppercase font-bold">
                        <DollarSign size={11} /> Paid Out
                      </span>
                    );
                  }

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 pr-4 font-bold text-white font-sans text-sm">
                        {lead.studentName}
                        {lead.paymentProofNote && (
                          <span className="block text-[10px] text-zinc-500 font-mono font-normal">
                            Note: {lead.paymentProofNote}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-zinc-300">
                        {lead.courseTitle}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] uppercase text-zinc-400">
                          {lead.mode === 'physical' ? 'Physical Hub' : 'Online Cohort'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-200">
                        {formatNaira(lead.discountedAmount)}
                        <span className="block text-[9px] text-emerald-400">
                          -5% applied ({formatNaira(lead.discountApplied)})
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gold-400">
                        {formatNaira(lead.commissionAmount)}
                        <span className="block text-[9px] text-zinc-500 font-normal">
                          ({lead.commissionRate}% rate)
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {statusBadge}
                      </td>
                      <td className="py-4 pl-4 text-zinc-500 text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BANK ACCOUNT SETTLEMENT FORM */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-6 shadow-xl max-w-2xl">
        <div className="space-y-1 mb-6 border-b border-zinc-850 pb-4">
          <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold flex items-center gap-1.5">
            <CreditCard size={12} /> AUTOMATED PAYOUT SETTLEMENT
          </span>
          <h3 className="text-base font-display font-bold text-white uppercase">
            Bank Account for Commission Deposits
          </h3>
          <p className="text-xs text-zinc-400">
            Commissions are transferred directly to this Nigerian bank account upon payment confirmation.
          </p>
        </div>

        <form onSubmit={handleSaveBankDetails} className="space-y-4">
          {bankSavedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded font-mono flex items-center gap-2">
              <Check size={14} /> Bank settlement information successfully updated!
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. GTBank, Zenith, Access"
                className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Account Number
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="0123456789"
                className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Account Name
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Shirley Okon"
              className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingBank}
            className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-1.5 transition-all shadow"
          >
            {isSavingBank ? 'Saving...' : 'Save Bank Details'}
          </button>
        </form>
      </div>

    </div>
  );
}
