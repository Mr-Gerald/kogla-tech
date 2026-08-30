import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Download,
  UserCheck,
  UserPlus,
  Loader2,
  ShieldAlert,
  Lock,
  LogIn
} from 'lucide-react';
import { AffiliatePartner, ReferralLead } from '../types';
import { getAffiliateByCode, getReferralsByCode, saveAffiliatePartner, getUserReferralCode, formatPromoCodeInput, isValidPromoCode } from '../lib/affiliates';
import { formatNaira } from '../data/coursesPricing';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { generateAmbassadorAgreementPdf } from '../lib/agreementPdfGenerator';

export default function AffiliatePortal() {
  const { user, profile } = useAuth();
  const { config } = useSiteConfig();
  
  const [partnerCode, setPartnerCode] = useState(() => {
    return getUserReferralCode(profile, user?.uid);
  });

  useEffect(() => {
    setPartnerCode(getUserReferralCode(profile, user?.uid));
  }, [profile, user]);

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

  // Activation Form State (For new or unactivated partners)
  const [activateName, setActivateName] = useState(profile?.name || user?.email?.split('@')[0] || '');
  const [activateEmail, setActivateEmail] = useState(profile?.email || user?.email || '');
  const [activateHandle, setActivateHandle] = useState('');
  const [activateCustomCode, setActivateCustomCode] = useState('');
  const [activateTermsAgreed, setActivateTermsAgreed] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  useEffect(() => {
    if (profile?.name && !activateName) setActivateName(profile.name);
    if (user?.email && !activateEmail) setActivateEmail(user.email);
    if (!activateCustomCode) setActivateCustomCode(partnerCode);
  }, [profile, user, partnerCode]);

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
      } else {
        setPartner(null);
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

    // Auto-poll every 5 seconds so live approvals and payouts from Admin Portal reflect instantly
    const interval = setInterval(() => {
      if (partnerCode) {
        getAffiliateByCode(partnerCode).then(p => {
          if (p) setPartner(p);
        }).catch(() => {});
        getReferralsByCode(partnerCode).then(refs => {
          if (refs) setReferrals(refs);
        }).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [partnerCode]);

  const referralUrl = `${window.location.origin}/?ref=${partnerCode}`;

  const handleDownloadAgreement = async () => {
    if (!user) {
      alert('Authentication Required: You must be signed in to your account to generate or download the official ambassador agreement contract.');
      return;
    }
    try {
      await generateAmbassadorAgreementPdf({
        ambassadorName: partner?.name || activateName || 'Creator Partner',
        promoCode: partnerCode || activateCustomCode,
        email: partner?.email || activateEmail || '',
        instagramHandle: partner?.instagramHandle || activateHandle || '',
        tier1Rate: 6,
        tier2Rate: 10,
        discountRate: 5,
        bankName: bankName || partner?.bankDetails?.bankName,
        accountNumber: accountNumber || partner?.bankDetails?.accountNumber,
        cohortBatchName: config.cohortBatchName || 'COHORT CO-2026',
        cohortStartDate: config.cohortStartDate ? new Date(config.cohortStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'September 24, 2026',
        cohortEndDate: config.cohortEndDate ? new Date(config.cohortEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'December 18, 2026',
        logoUrl: config.logoUrl
      });

      // Mark agreement downloaded in partner record & persist to Firestore
      if (partner) {
        const updated: AffiliatePartner = {
          ...partner,
          agreementDownloaded: true,
          agreementDownloadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveAffiliatePartner(updated);
        setPartner(updated);
      }
    } catch (err) {
      console.error('Failed generating PDF:', err);
    }
  };

  const handleActivateCreatorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Authentication Required: You must be signed in to your account to activate your creator partner profile.');
      return;
    }
    if (!activateTermsAgreed) return;
    setIsActivating(true);

    const cleanCode = (activateCustomCode.trim() || partnerCode).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const cleanName = activateName.trim() || 'Creator Partner';
    const cleanEmail = activateEmail.trim();
    const cleanHandle = activateHandle.trim();

    try {
      const partnerId = user?.uid || `part_${Date.now()}`;
      const partnerRecord: AffiliatePartner = {
        id: partnerId,
        code: cleanCode,
        name: cleanName,
        email: cleanEmail,
        instagramHandle: cleanHandle,
        tier: 1,
        baseRate: 6,
        boostedRate: 10,
        discountOffered: 5,
        totalReferrals: 0,
        confirmedCount: 0,
        totalEarned: 0,
        totalPaidOut: 0,
        pendingPayout: 0,
        contractSigned: true,
        contractSignedDate: new Date().toISOString(),
        agreementDownloaded: true,
        agreementDownloadedAt: new Date().toISOString(),
        bankDetails: bankName && accountNumber ? {
          bankName,
          accountNumber,
          accountName: accountName || cleanName
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveAffiliatePartner(partnerRecord);
      setPartner(partnerRecord);
      setPartnerCode(cleanCode);

      // Immediately trigger PDF download for creator
      await generateAmbassadorAgreementPdf({
        ambassadorName: cleanName,
        promoCode: cleanCode,
        email: cleanEmail,
        instagramHandle: cleanHandle,
        tier1Rate: 6,
        tier2Rate: 10,
        discountRate: 5,
        bankName: bankName,
        accountNumber: accountNumber,
        cohortBatchName: config.cohortBatchName || 'COHORT CO-2026',
        cohortStartDate: config.cohortStartDate ? new Date(config.cohortStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'September 24, 2026',
        cohortEndDate: config.cohortEndDate ? new Date(config.cohortEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'December 18, 2026',
        logoUrl: config.logoUrl
      });

      setActivationSuccess(true);
      setShowContract(true);
    } catch (err) {
      console.error('Error activating creator partner:', err);
    } finally {
      setIsActivating(false);
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

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto text-gray-100 font-sans">
        {/* MARQUEE BANNER FOR KOGLA REFERRALS */}
        <div className="mb-10 bg-gold-500 text-black overflow-hidden py-2 font-mono text-xs font-bold uppercase tracking-widest rounded shadow-md">
          <div className="animate-marquee flex items-center gap-8">
            <span>🚀 KOGLA REFERRALS (FASTEST) GLOBAL</span>
            <span>•</span>
            <span>EARN 6% TO 10% COMMISSIONS ON EVERY VERIFIED ENROLLMENT</span>
            <span>•</span>
            <span>OFFICIAL HOTLINE: +234 701 248 9041</span>
            <span>•</span>
            <span>STRICT ANTI-FRAUD & COMPLIANCE ENFORCED</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8 sm:p-12 bg-zinc-950 border border-gold-500/30 rounded-lg shadow-2xl text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs rounded-full uppercase tracking-widest font-mono">
            <Lock size={13} /> Authentication &amp; Identity Verification Required
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-display font-black uppercase text-white tracking-tight">
              Partner &amp; Ambassador <span className="text-gold-500">Access Restricted</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
              To prevent fraudulent claims, safeguard student attribution, and legally bind official partnership contracts, you must be signed in to your verified Kogla Tech account before accessing the Partner Dashboard or downloading the Ambassador Agreement.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left py-4">
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded">
              <div className="text-gold-400 font-mono text-xs font-bold uppercase mb-1">6% Base Rate</div>
              <div className="text-[11px] text-zinc-400">Earn ₦30k–₦60k per verified student enrollment</div>
            </div>
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded">
              <div className="text-emerald-400 font-mono text-xs font-bold uppercase mb-1">10% Accelerator</div>
              <div className="text-[11px] text-zinc-400">Unlocked automatically on your 3rd verified student</div>
            </div>
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded">
              <div className="text-cyan-400 font-mono text-xs font-bold uppercase mb-1">Weekly Payouts</div>
              <div className="text-[11px] text-zinc-400">Direct electronic bank transfers &amp; PDF contracts</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/auth/login?redirect=/affiliate-portal"
              className="w-full sm:w-auto px-8 py-3.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-display font-bold text-xs uppercase tracking-widest rounded transition-all shadow-lg shadow-gold-500/10 flex items-center justify-center gap-2"
            >
              <LogIn size={16} /> Sign In to Access Dashboard
            </Link>
            <Link
              to="/auth/signup?redirect=/affiliate-portal"
              className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono font-bold text-xs uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={16} className="text-gold-400" /> Create Partner Account
            </Link>
          </div>

          <p className="text-[10px] text-zinc-500 font-mono">
            For admissions and enterprise partnerships: <span className="text-gold-400 font-bold">+234 701 248 9041</span> • <span className="text-zinc-400">solutions@koglatech.com</span>
          </p>
        </motion.div>
      </div>
    );
  }

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
            Real-time attribution engine for <b>{partner?.name || activateName || 'Creator Partner'}</b>. Track your community referrals, commission lifecycle (6% Base → 10% Accelerator), and automated payouts.
          </p>
        </div>

        {/* TOP CONTROLS: CONTRACT & CODE SWITCHER */}
        <div className="flex flex-wrap items-center gap-3">
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
          <button
            onClick={() => setShowContract(!showContract)}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all shadow cursor-pointer"
          >
            <FileText size={14} className="text-gold-400" />
            {showContract ? 'Hide Agreement' : 'View Formal Agreement'}
          </button>
        </div>
      </div>

      {/* NEW PARTNER ACTIVATION MODAL / SECTION (IF NOT YET REGISTERED AS CREATOR) */}
      {!partner && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 sm:p-8 bg-zinc-950 border-2 border-gold-500/50 rounded-lg shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Sparkles size={13} /> OFFICIAL CREATOR ENROLLMENT
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white">
                Activate Your Creator / Brand Ambassador Profile
              </h2>
              <p className="text-xs text-zinc-400">
                Choose your custom promo code, accept the legal terms, and immediately generate your official signed contract PDF.
              </p>
            </div>
            <div className="px-3 py-1.5 bg-gold-500/10 border border-gold-500/30 rounded text-gold-400 font-mono text-xs font-bold shrink-0">
              6% Base → 10% Accelerator
            </div>
          </div>

          <form onSubmit={handleActivateCreatorProfile} className="space-y-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={activateName}
                  onChange={(e) => setActivateName(e.target.value)}
                  placeholder="e.g. Shirley Okon"
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={activateEmail}
                  onChange={(e) => setActivateEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Social Handle / Channel (IG / X / TikTok / YouTube)
                </label>
                <input
                  type="text"
                  value={activateHandle}
                  onChange={(e) => {
                    const handle = e.target.value;
                    setActivateHandle(handle);
                    // Auto-suggest promo code from handle if user hasn't explicitly typed a custom one
                    if (!activateCustomCode || activateCustomCode === partnerCode) {
                      const letters = handle.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
                      if (letters.length >= 2) {
                        setActivateCustomCode(`${letters}24`);
                      }
                    }
                  }}
                  placeholder="@yourhandle or channel"
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-zinc-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gold-400 mb-1">
                  Custom Promo Code * (Letters + max 2 numbers)
                </label>
                <input
                  type="text"
                  required
                  value={activateCustomCode}
                  onChange={(e) => setActivateCustomCode(formatPromoCodeInput(e.target.value))}
                  placeholder="e.g. HANDLE24"
                  maxLength={14}
                  className="w-full p-2.5 bg-black border border-gold-500/40 rounded focus:border-gold-500 focus:outline-none text-xs text-gold-400 font-mono font-bold uppercase"
                />
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Enforces letters with maximum 2 digits (e.g. <b>{profile?.nickname ? profile.nickname.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) : 'CREATOR'}24</b>)
                </p>
              </div>
            </div>

            {/* TERMS CHECKBOX */}
            <div className="p-4 bg-black/60 border border-zinc-800 rounded space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activateTermsAgreed}
                  onChange={(e) => setActivateTermsAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-gold-500 bg-black border-zinc-700 focus:ring-0 cursor-pointer shrink-0"
                />
                <span className="text-xs text-zinc-300 leading-relaxed">
                  I accept the <b>Kogla Tech Creator Brand Ambassador Memorandum</b> (6% Base → 10% Accelerator Cohort Commissions, 5% Community Tuition Discount, and Independent Contractor Terms).
                </span>
              </label>
              {!activateTermsAgreed && (
                <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1 pl-6">
                  <ShieldAlert size={12} /> Please check the agreement box to activate your partnership profile.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!activateTermsAgreed || isActivating}
              className={`w-full sm:w-auto px-8 py-3 rounded font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                activateTermsAgreed && !isActivating
                  ? 'bg-gold-500 hover:bg-gold-600 text-black cursor-pointer shadow-gold-500/10'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
              }`}
            >
              {isActivating ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Activating Profile & Generating Contract...
                </>
              ) : (
                <>
                  <Download size={15} /> Activate Creator Account & Download Official Agreement (PDF)
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* FORMAL CONTRACT MODAL / EXPANDED SECTION */}
      {showContract && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 sm:p-10 bg-zinc-950 border-2 border-gold-500/40 rounded-lg shadow-2xl relative overflow-hidden text-zinc-300 space-y-6 print:block"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block">LEGAL PARTNERSHIP MEMORANDUM</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase">
                Creator Brand Ambassador Agreement
              </h2>
              {partner?.agreementDownloaded && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono rounded">
                  <CheckCircle2 size={11} /> Agreement Downloaded ({partner.agreementDownloadedAt ? new Date(partner.agreementDownloadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'})
                </span>
              )}
            </div>
            <button
              onClick={handleDownloadAgreement}
              className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display rounded-sm flex items-center gap-1.5 cursor-pointer shadow self-start sm:self-auto"
            >
              <Download size={13} /> {partner?.agreementDownloaded ? 'Re-Download Contract (PDF)' : 'Download Contract (PDF)'}
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed font-sans text-zinc-300">
            <p>
              This Brand Ambassador & Creator Partnership Legal Agreement is entered into between <b>Kogla Tech Global</b> (hereinafter referred to as the <i>"Academy"</i>, Contact: <code>solutions@koglatech.com</code> • <code>+234 701 248 9041</code>) and <b>{partner?.name || activateName || 'Ambassador Partner'}</b> (hereinafter referred to as the <i>"Ambassador"</i>).
            </p>

            <div className="bg-black/50 border border-zinc-800 p-4 rounded space-y-3 font-mono text-xs">
              <h4 className="text-gold-400 font-bold uppercase tracking-wider">1. Commission Structure & Cohort-Specific Escalator Clause</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li><b>Tier 1 (Cohort Base Rate):</b> Ambassador earns a <b>6% commission</b> on the net tuition of the first 3 enrolled and verified referrals in the active cohort.</li>
                <li><b>Tier 2 (Cohort Accelerator - 10% Rate):</b> Beginning with the <b>4th enrolled referral</b> in that specific cohort, the commission elevates to <b>10%</b> on all subsequent enrollments for the duration of that cohort cycle.</li>
                <li><b>Cohort Cycle Reset Policy:</b> Performance milestones apply per admission cohort. Each new official Academy intake resets the performance sprint, keeping campaigns vibrant and rewarding top seasonal producers.</li>
                <li><b>Community Discount:</b> Every student registering with promo code <b className="text-gold-400">{partnerCode}</b> receives a <b>5% direct discount</b> on their tuition.</li>
              </ul>
            </div>

            <div className="bg-black/50 border border-zinc-800 p-4 rounded space-y-3 font-mono text-xs">
              <h4 className="text-gold-400 font-bold uppercase tracking-wider">2. Payment Verification & Payout Timeline</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>Commission status begins as <i>"Pending Payment"</i> upon referral registration.</li>
                <li>Upon tuition confirmation by the Academy, commission moves to <i>"Confirmed & Earned"</i>.</li>
                <li>All earned commissions are disbursed directly to the Ambassador's registered bank account within <b>3 to 5 business days</b> following cohort tuition clearance.</li>
              </ul>
            </div>

            <div className="bg-black/50 border border-zinc-800 p-4 rounded space-y-3 font-mono text-xs">
              <h4 className="text-gold-400 font-bold uppercase tracking-wider">3. Ambassador Activation, Portal & Social Bio Link</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li><b>Official Partner Representation:</b> Ambassador agrees to feature their official partner designation and tracking link (e.g., <i>"🎓 Tech Ambassador @koglatech | Link in bio"</i>) in their social profile bio / link tree.</li>
                <li><b>Real-Time Tracking:</b> Ambassadors access their private portal at <code>/affiliate-portal</code> to view live referral clicks, attributions, and payout records.</li>
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
              <span className="text-gold-400 font-bold text-sm">{partner?.name || activateName || 'Ambassador Partner'}</span>
              <span className="text-zinc-400 block text-[10px]">{partner?.instagramHandle || activateHandle || '@creator'}</span>
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
                  Gives community 5% OFF
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-black/60 border border-zinc-800/80 rounded text-xs text-zinc-400 font-sans flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-gold-400 shrink-0 mt-0.5" />
            <span>
              Every user who clicks your link or enters <b>{partnerCode}</b> is automatically attributed to your dashboard for 30 full days.
            </span>
          </div>
        </div>

        {/* RIGHT: TIER PROGRESSION CARD */}
        <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border border-gold-500/30 rounded-lg p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold">
                COHORT COMMISSION STATUS
              </span>
              <span className="px-2.5 py-1 bg-gold-500/20 border border-gold-500/50 text-gold-400 font-mono font-bold text-xs rounded-full uppercase">
                {isTier2 ? 'Cohort Accelerator: 10%' : 'Cohort Base: 6%'}
              </span>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white uppercase">
                Active Rate: <span className="text-gold-400">{currentRate}%</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {isTier2 
                  ? '🎉 Congratulations! You have unlocked the elevated 10% commission rate for all enrollments in this active cohort.' 
                  : `${3 - confirmedCount} more confirmed enrollment${3 - confirmedCount === 1 ? '' : 's'} in this cohort needed to unlock 10% rate.`}
              </p>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>Base (6%)</span>
                <span>{confirmedCount} / 3 in Cohort</span>
                <span>Accelerator (10%)</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressToTier2}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-850 mt-4 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Next Cohort Milestone: <b>10% per enrollment</b></span>
            <span className="text-[10px] text-gold-400/80">Active Cohort Cycle</span>
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
            <CheckCircle2 size={12} className="text-emerald-400" /> Confirmed Paid Referrals
          </span>
          <div className="text-2xl font-bold font-display text-emerald-400">{confirmedCount}</div>
          <span className="text-[10px] text-zinc-400 font-mono">Verified by Admin</span>
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
              Referral Pipeline & Status
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {referrals.length} {referrals.length === 1 ? 'Record' : 'Records'} Tracked
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-850 rounded bg-black/40 space-y-2">
            <Users size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-xs font-mono uppercase text-zinc-400">No referrals recorded yet.</p>
            <p className="text-[11px] text-zinc-500">Share your link <b className="text-gold-400">{referralUrl}</b> or promo code <b className="text-gold-400">{partnerCode}</b> to start logging attributions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* MOBILE CARD VIEW (< md) */}
            <div className="block md:hidden space-y-3">
              {referrals.map((lead) => {
                let statusBadge = (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] uppercase font-bold flex items-center gap-1 w-fit shrink-0">
                    <Clock size={10} /> Pending Payment
                  </span>
                );
                if (lead.status === 'confirmed') {
                  statusBadge = (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] uppercase font-bold flex items-center gap-1 w-fit shrink-0">
                      <CheckCircle2 size={10} /> Confirmed (Ready)
                    </span>
                  );
                } else if (lead.status === 'paid_out') {
                  statusBadge = (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-[10px] uppercase font-bold flex items-center gap-1 w-fit shrink-0">
                      <Check size={10} /> Paid Out to Bank
                    </span>
                  );
                }

                return (
                  <div key={lead.id} className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                      <div>
                        <h4 className="font-sans font-bold text-white text-sm">{lead.studentName}</h4>
                        {lead.studentEmail && (
                          <span className="text-[10px] font-mono text-zinc-400 block">{lead.studentEmail}</span>
                        )}
                      </div>
                      <div>
                        {statusBadge}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 block">Course / Track</span>
                        <span className="text-zinc-200 font-sans text-xs">{lead.courseTitle}</span>
                        <span className="text-[9px] uppercase text-zinc-400 block mt-0.5">
                          {lead.mode === 'physical' ? 'Physical Hub' : 'Online Cohort'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 block">Net Tuition</span>
                        <span className="text-white font-bold whitespace-nowrap">{formatNaira(lead.discountedAmount)}</span>
                        <span className="text-[9px] text-emerald-400 block whitespace-nowrap">
                          -5% Promo ({formatNaira(lead.discountApplied)})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 block">Your Commission</span>
                        <span className="text-gold-400 font-bold text-sm whitespace-nowrap">
                          {formatNaira(lead.commissionAmount)}
                        </span>
                        <span className="text-[9px] text-zinc-500"> ({lead.commissionRate}% rate)</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase text-zinc-500 block">Date Tracked</span>
                        <span className="text-zinc-400 text-[11px] whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW (hidden on mobile, visible md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-mono min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                    <th className="pb-3 pr-4">Lead Name</th>
                    <th className="pb-3 px-4">Track / Service</th>
                    <th className="pb-3 px-4">Mode</th>
                    <th className="pb-3 px-4">Net Total</th>
                    <th className="pb-3 px-4">Your Commission</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {referrals.map((lead) => {
                    let statusBadge = (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] uppercase font-bold flex items-center gap-1 w-fit whitespace-nowrap">
                        <Clock size={10} /> Pending Payment
                      </span>
                    );
                    if (lead.status === 'confirmed') {
                      statusBadge = (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] uppercase font-bold flex items-center gap-1 w-fit whitespace-nowrap">
                          <CheckCircle2 size={10} /> Confirmed (Ready)
                        </span>
                      );
                    } else if (lead.status === 'paid_out') {
                      statusBadge = (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-[10px] uppercase font-bold flex items-center gap-1 w-fit whitespace-nowrap">
                          <Check size={10} /> Paid Out to Bank
                        </span>
                      );
                    }

                    return (
                      <tr key={lead.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-4 pr-4 font-sans font-medium text-white">
                          {lead.studentName}
                          {lead.studentEmail && (
                            <span className="block text-[10px] font-mono text-zinc-500">
                              {lead.studentEmail}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-zinc-300">
                          {lead.courseTitle}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] uppercase text-zinc-400 whitespace-nowrap">
                            {lead.mode === 'physical' ? 'Physical Hub' : 'Online Cohort'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-zinc-200 whitespace-nowrap">
                          <div className="font-bold text-white">{formatNaira(lead.discountedAmount)}</div>
                          <div className="text-[9px] text-emerald-400">
                            -5% promo ({formatNaira(lead.discountApplied)})
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-gold-400 whitespace-nowrap">
                          <div>{formatNaira(lead.commissionAmount)}</div>
                          <div className="text-[9px] text-zinc-500 font-normal">
                            ({lead.commissionRate}% rate)
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {statusBadge}
                        </td>
                        <td className="py-4 pl-4 text-zinc-500 text-[11px] whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
            className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            {isSavingBank ? 'Saving...' : 'Save Bank Details'}
          </button>
        </form>
      </div>

      {/* OFFICIAL TERMS & CONDITIONS & FCCPC COMPLIANCE POLICY */}
      <div className="mt-12 bg-zinc-950 border border-zinc-850 rounded-lg p-6 sm:p-8 space-y-6">
        <div className="border-b border-zinc-850 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] rounded-full uppercase tracking-widest font-mono mb-2">
            <ShieldCheck size={12} /> Legal Compliance & Governance
          </div>
          <h3 className="text-xl font-display font-black uppercase text-white tracking-wide">
            Referral Programme Terms, Conditions & FCCPC Compliance
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            In accordance with Federal Competition and Consumer Protection Commission (FCCPC) guidelines, Kogla Tech Global enforces strict transparency, full price disclosure, and factually accurate marketing across all brand ambassador partnerships.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-zinc-300">
          <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
            <h4 className="font-display font-bold uppercase text-gold-400">1. Refunds & Chargebacks</h4>
            <p className="text-zinc-400">
              Commissions are accrued only on completed, verified student enrollments. If a referred student requests a refund or initiates a bank chargeback during or after the cohort window, the associated commission will be automatically deducted from pending payouts or future disbursements.
            </p>
          </div>

          <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
            <h4 className="font-display font-bold uppercase text-gold-400">2. Self-Referrals Prohibited</h4>
            <p className="text-zinc-400">
              Ambassadors are strictly prohibited from using their own referral promo links or codes to enroll themselves or dummy accounts. Self-referrals result in instant disqualification, forfeiture of all pending commissions, and permanent account termination.
            </p>
          </div>

          <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
            <h4 className="font-display font-bold uppercase text-gold-400">3. Anti-Fraud & Fake Signups</h4>
            <p className="text-zinc-400">
              Our automated anti-fraud engine actively checks IP addresses, device signatures, and email records. Fake registrations, automated click farms, or duplicate submissions will be flagged and permanently blocked without notice.
            </p>
          </div>

          <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
            <h4 className="font-display font-bold uppercase text-gold-400">4. Commission Timing & Payouts</h4>
            <p className="text-zinc-400">
              Approved commissions are processed bi-weekly (every 14 days) directly to the ambassador's verified Nigerian bank account (Opay / Commercial Banks) once payment verification is completed by finance administration. Minimum payout threshold is ₦10,000.
            </p>
          </div>

          <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
            <h4 className="font-display font-bold uppercase text-gold-400">5. Prohibited Advertising Claims</h4>
            <p className="text-zinc-400">
              Ambassadors must not make misleading earnings guarantees, false job placement promises, or deceptive claims regarding Kogla Tech courses. All promotions must accurately reflect standard tuition pricing and verifiable curriculum outcomes.
            </p>
          </div>

          <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
            <h4 className="font-display font-bold uppercase text-gold-400">6. Official Contact & Support</h4>
            <p className="text-zinc-400">
              For any partnership inquiries or compliance clarifications, reach out directly through official Academy channels: <span className="text-gold-400 font-mono">solutions@koglatech.com</span> or phone hotline <span className="text-gold-400 font-mono">+234 701 248 9041</span>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
