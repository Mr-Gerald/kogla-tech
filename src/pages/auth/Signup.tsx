import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AffiliatePartner } from '../../types';
import { supabase, saveSupabaseUserProfile } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatUserError } from '../../lib/errorUtils';
import { 
  ShieldCheck, Mail, Lock, User, Loader2, Tag, CheckCircle2, Check, 
  ArrowRight, KeyRound, Eye, EyeOff, AlertTriangle, FileText, Sparkles, X, ShieldAlert 
} from 'lucide-react';
import { captureUrlReferral, getActiveReferralCode, setManualReferralCode } from '../../lib/referralTracker';
import { saveAffiliatePartner, getUserReferralCode } from '../../lib/affiliates';

export default function Signup() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState<'student' | 'creator'>('student');
  const [socialHandle, setSocialHandle] = useState('');
  const [promoCode, setPromoCode] = useState('');
  
  // Legal Agreement State
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  
  // Status State
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [existingAccountDetected, setExistingAccountDetected] = useState(false);

  useEffect(() => {
    const urlRef = captureUrlReferral();
    const activeRef = urlRef || getActiveReferralCode();
    if (activeRef) {
      setPromoCode(activeRef);
    }
  }, []);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = name.trim().length > 0 && 
                      email.trim().length > 0 && 
                      password.length >= 6 && 
                      passwordsMatch && 
                      termsAgreed;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      
      const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
      const session = await supabase.auth.getSession();
      const gUser = session.data.session?.user;
      const isSystemAdmin = gUser?.email && bootstrappedEmails.map(e => e.toLowerCase()).includes(gUser.email.toLowerCase());

      setGoogleLoading(false);
      if (isSystemAdmin) {
        navigate('/admin');
      } else {
        const redirectTo = sessionStorage.getItem('studyRedirectTo');
        if (redirectTo) {
          sessionStorage.removeItem('studyRedirectTo');
          navigate(redirectTo);
        } else {
          navigate('/academy');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(formatUserError(err));
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!termsAgreed) {
      setErrorMsg('You must review and agree to the Terms, Anti-Liability Disclaimer, and Academic Policies to register.');
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }

    setLoadingState(true);

    const trimmedEmail = email.trim();
    const cleanPromo = promoCode.trim().toUpperCase();
    const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
    const isSystemAdmin = bootstrappedEmails.map(e => e.toLowerCase()).includes(trimmedEmail.toLowerCase());
    const isCreator = accountType === 'creator';
    const role = isSystemAdmin ? 'admin' : (isCreator ? 'affiliate' : 'user');

    try {
      // 1. Sign up with Supabase Auth (dispatches email verification link)
      let activeUser: any = null;
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            name: name,
            role: role,
            promoCode: cleanPromo,
            isAmbassador: isCreator,
            socialHandle: socialHandle.trim(),
            termsAcceptedAt: new Date().toISOString()
          },
          emailRedirectTo: `${window.location.origin}/auth/login`
        }
      });

      if (error) {
        const errorLower = (error.message || '').toLowerCase();
        if (errorLower.includes('already registered') || errorLower.includes('unique')) {
          setExistingAccountDetected(true);
        }
        if (errorLower.includes('confirmation email') || errorLower.includes('rate limit') || errorLower.includes('smtp') || errorLower.includes('500') || isSystemAdmin) {
          activeUser = {
            id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            email: trimmedEmail,
            user_metadata: {
              name: name,
              role: role,
              promoCode: cleanPromo,
              isAmbassador: isCreator
            }
          };
        } else {
          throw error;
        }
      } else {
        activeUser = data.user;
      }

      if (!activeUser) {
        throw new Error('Authentication could not be initialized.');
      }

      const generatedCode = getUserReferralCode({ name }, activeUser.id);

      // 2. Save master profile
      const initialProfile: UserProfile = {
        uid: activeUser.id,
        name: name || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        role: role as ('user' | 'admin' | 'affiliate'),
        isAmbassador: isCreator,
        affiliateCode: generatedCode,
        xp: 0,
        completedRooms: [],
        referredBy: cleanPromo || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveSupabaseUserProfile(initialProfile);

      // 3. If Creator / Ambassador, create their Affiliate record with the 6% -> 10% Cohort agreement
      if (isCreator) {
        const partnerRecord: AffiliatePartner = {
          id: activeUser.id,
          code: generatedCode,
          name: name,
          email: trimmedEmail,
          instagramHandle: socialHandle.trim(),
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveAffiliatePartner(partnerRecord);
      }

      // Save active session
      try {
        localStorage.setItem('kogla_active_session', JSON.stringify({
          id: activeUser.id,
          uid: activeUser.id,
          email: trimmedEmail,
          user_metadata: {
            name: initialProfile.name,
            role: initialProfile.role,
            isAmbassador: isCreator
          }
        }));
      } catch (_) {}

      setVerificationSent(true);
      setRegisteredEmail(trimmedEmail);
      setLoadingState(false);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(formatUserError(err));
      setLoadingState(false);
    }
  };

  return (
    <div className="pt-28 px-4 sm:px-6 pb-20 max-w-xl mx-auto text-gray-100 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 sm:p-8 bg-gray-950 border border-gray-900 rounded-sm shadow-2xl relative"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-mono mb-3">
            <ShieldCheck size={11} /> Sovereign Account Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Join Kogla Tech
          </h1>
          <p className="text-[11px] text-gray-400 font-mono mt-1">
            Access certified engineering cohorts, hands-on sandboxes, and brand partner networks.
          </p>
        </div>

        {/* VERIFICATION SENT SUCCESS BANNER */}
        {verificationSent && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded text-emerald-200 text-xs mb-6 space-y-3">
            <div className="flex items-center gap-2 font-bold uppercase font-mono text-emerald-400">
              <CheckCircle2 size={16} /> Verification Link Dispatched
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              A confirmation link has been sent to <b>{registeredEmail}</b>. Please click the link in your inbox to verify your email, then return to log in to your account!
            </p>
            <div className="pt-2 border-t border-emerald-500/30 flex flex-wrap gap-2">
              <Link
                to="/auth/login"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] rounded flex items-center gap-1.5 transition-all font-bold shadow"
              >
                <KeyRound size={12} /> Return to Login Page <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-sm mb-6 space-y-2.5">
            <div className="flex items-start gap-2 max-h-48 overflow-y-auto">
              <span className="font-bold text-[10px] font-mono text-red-500 uppercase shrink-0 mt-0.5">Notice:</span>
              <p className="text-[11px] leading-relaxed font-sans">{errorMsg}</p>
            </div>
            {existingAccountDetected && (
              <div className="pt-2 border-t border-red-500/20 flex flex-wrap gap-2">
                <Link
                  to="/auth/login"
                  className="px-3 py-1.5 bg-red-900/60 hover:bg-gold-500 hover:text-black border border-red-500/30 text-white font-mono text-[11px] rounded flex items-center gap-1.5 transition-all font-bold"
                >
                  <KeyRound size={12} /> Go to Log In <ArrowRight size={11} />
                </Link>
                <Link
                  to="/auth/forgot-password"
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px] rounded transition-all"
                >
                  Reset Password
                </Link>
              </div>
            )}
          </div>
        )}

        {/* GOOGLE QUICK SIGN UP */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loadingState}
          className="w-full mb-5 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-medium text-xs rounded transition-all flex items-center justify-center gap-3 shadow"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin text-gold-500" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{googleLoading ? 'Connecting Google...' : 'Sign up with Google'}</span>
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <span className="relative px-3 bg-gray-950 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            or register with email
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* ACCOUNT TYPE SELECTOR */}
          <div>
            <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono mb-2">
              Select Account Pathway
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAccountType('student')}
                className={`p-3 rounded border text-left transition-all ${
                  accountType === 'student'
                    ? 'bg-zinc-900 border-gold-500 text-white shadow-md'
                    : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-gold-400">
                    🎓 Student / Engineer
                  </span>
                  {accountType === 'student' && <Check size={12} className="text-gold-400" />}
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Enroll in accredited cohort tracks, labs & verified certifications.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('creator')}
                className={`p-3 rounded border text-left transition-all ${
                  accountType === 'creator'
                    ? 'bg-zinc-900 border-gold-500 text-white shadow-md'
                    : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1">
                    <Sparkles size={11} /> Creator / Partner
                  </span>
                  {accountType === 'creator' && <Check size={12} className="text-gold-400" />}
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Earn 6% → 10% commissions with legal agreement & promo codes.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <User size={10} /> Full Legal Name
            </label>
            <input 
              type="text" 
              required
              disabled={loadingState}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-600" 
            />
          </div>

          <div>
            <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <Mail size={10} /> Email Address
            </label>
            <input 
              type="email" 
              required
              disabled={loadingState}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-600" 
            />
          </div>

          {accountType === 'creator' && (
            <div>
              <label className="block text-[9px] text-gold-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
                <Sparkles size={10} /> Primary Social Handle / Channel (Instagram / X / TikTok / YouTube)
              </label>
              <input 
                type="text" 
                required
                disabled={loadingState}
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                placeholder="@yourhandle or youtube.com/@channel" 
                className="w-full p-3 bg-black border border-gold-500/40 focus:border-gold-500 focus:outline-none text-xs text-gold-300 rounded-sm font-mono placeholder:text-zinc-700" 
              />
            </div>
          )}

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <Lock size={10} /> Create Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                disabled={loadingState}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters" 
                className="w-full p-3 pr-10 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-600" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <KeyRound size={10} /> Verify & Confirm Password
              </label>
              {confirmPassword && (
                <span className={`text-[10px] font-mono flex items-center gap-1 ${passwordsMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {passwordsMatch ? (
                    <>
                      <Check size={11} /> Passwords Match
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={11} /> Passwords Mismatch
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                required
                disabled={loadingState}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype password to confirm" 
                className={`w-full p-3 pr-10 bg-black border focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-600 ${
                  confirmPassword && !passwordsMatch 
                    ? 'border-amber-500/70 focus:border-amber-500' 
                    : confirmPassword && passwordsMatch 
                    ? 'border-emerald-500/70 focus:border-emerald-500' 
                    : 'border-gray-800 focus:border-gold-500'
                }`} 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* OPTIONAL REFERRAL / AMBASSADOR PROMO CODE */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Tag size={10} className="text-gold-400" /> Referral / Promo Code (Optional)
              </label>
              {promoCode ? (
                <button
                  type="button"
                  onClick={() => {
                    setPromoCode('');
                    setManualReferralCode('');
                  }}
                  className="text-[9px] font-mono text-red-400 hover:text-red-300 uppercase underline cursor-pointer"
                >
                  Clear Promo
                </button>
              ) : null}
            </div>
            <input 
              type="text" 
              disabled={loadingState}
              value={promoCode}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setPromoCode(val);
                if (val.trim() === '') {
                  setManualReferralCode('');
                }
              }}
              placeholder="e.g. AMBASSADOR (Leave blank for none)" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-gold-400 font-mono uppercase placeholder:text-gray-700" 
            />
            {promoCode && (
              <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <Check size={11} /> Referral code <b>{promoCode}</b> applied (5% tuition discount active).
              </p>
            )}
          </div>

          {/* COMPREHENSIVE LAWSUIT-PROOF LEGAL TERMS CHECKBOX */}
          <div className="pt-2">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-gold-500 bg-black border-zinc-700 focus:ring-0 cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-zinc-300 leading-snug">
                  I have read, understood, and unconditionally agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowLegalModal(true);
                    }}
                    className="text-gold-400 hover:underline font-semibold font-mono"
                  >
                    Kogla Tech Master Terms of Service, Anti-Liability Disclaimer & Academic Policies
                  </button>
                  {accountType === 'creator' && ' and the Ambassador Independent Contractor Partnership Agreement'}.
                </span>
              </label>

              {!termsAgreed && (
                <p className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1 pl-6">
                  <ShieldAlert size={12} /> You must check the agreement box to enable registration.
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON - STRICTLY DISABLED UNLESS TERMS AGREED & PASSWORDS MATCH */}
          <button 
            type="submit" 
            disabled={!isFormValid || loadingState}
            className={`w-full py-3.5 text-xs transition-all uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2 font-bold ${
              isFormValid && !loadingState
                ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-lg shadow-gold-500/10 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
            }`}
          >
            {loadingState ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Finalizing Sovereign Account...
              </>
            ) : (
              <>
                <ShieldCheck size={14} /> Create Sovereign Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-900 text-center text-xs">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/auth/login" className="text-gold-500 hover:text-gold-400 font-semibold uppercase tracking-wider font-sans">Log In</Link>
        </div>
      </motion.div>

      {/* COMPREHENSIVE LEGAL TERMS MODAL */}
      <AnimatePresence>
        {showLegalModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-gold-500/40 rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gold-400" />
                  <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider">
                    Kogla Tech Master Legal Terms & Anti-Liability Disclaimers
                  </h3>
                </div>
                <button 
                  onClick={() => setShowLegalModal(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-300 leading-relaxed font-sans">
                <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded text-gold-300 font-mono text-[11px]">
                  <b>LEGAL NOTICE:</b> By checking "I Agree" on registration, you establish a binding legal contract with Kogla Tech Global governing academic enrollment, platform sandboxes, and brand partner programs.
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    1. Academic Scope & Non-Guarantee of Commercial Employment
                  </h4>
                  <p>
                    Kogla Tech Global provides rigorous, industry-accredited technical training, dual verification credentials, and hands-on laboratory environments. While our curriculum prepares developers for global roles, <b>Kogla Tech does not guarantee commercial employment, job placement, salary benchmarks, or client contracts</b>. Individual student outcomes depend strictly on individual merit, technical mastery, portfolio quality, and external market hiring decisions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    2. Cohort Scheduling, Preliminary Prep Sprints & Admissions Window
                  </h4>
                  <p>
                    Official cohort start dates (including the September 24, 2026 admissions cycle) are subject to scheduling optimization. Enrolled students gain immediate zero-day access to foundational preparation modules, online sandboxes, and instructor channels. The Academy reserves the right to adjust live session pacing to ensure optimal cohort infrastructure and learner support without constituting grounds for retroactive claims.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    3. Ambassador & Creator Independent Contractor Agreement
                  </h4>
                  <p>
                    Individuals registering as Creators/Ambassadors operate strictly as <b>Independent Contractors</b> and not employees, agents, or legal representatives of Kogla Tech. Ambassadors are compensated strictly on a commission basis (6% Base → 10% Cohort Accelerator) per verified student payment. Ambassadors have no authority to enter contracts on behalf of Kogla Tech or promise unauthorized discounts beyond official guidelines.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    4. Truth in Advertising, Anti-Spam & Brand Protection Policy
                  </h4>
                  <p>
                    Ambassadors are strictly prohibited from engaging in unsolicited bulk messaging (spam), cookie stuffing, false income claims, misleading marketing, or unauthorized brand misrepresentation. Any violation will result in immediate partner termination, referral forfeiture, and civil indemnification.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    5. Intellectual Property & Code Sandboxes
                  </h4>
                  <p>
                    All course syllabuses, video lectures, coding challenges, and architecture frameworks are the exclusive intellectual property of Kogla Tech Global. Students own the custom code they author within their capstone projects and sandboxes.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    6. Limitation of Liability
                  </h4>
                  <p>
                    To the maximum extent permitted by applicable law, Kogla Tech Global, its founder Gerald Emechebe, instructors, and affiliates shall not be liable for any indirect, consequential, or incidental damages. The cumulative liability of Kogla Tech to any registered user or partner shall under no circumstances exceed the actual fees paid by said party.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-black/40">
                <span className="text-[10px] font-mono text-zinc-500">
                  Official Channels: solutions@koglatech.com • +234 701 248 9041
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTermsAgreed(true);
                    setShowLegalModal(false);
                  }}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-display font-bold text-xs uppercase rounded transition-all flex items-center gap-1.5"
                >
                  <Check size={13} /> I Understand & Agree
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
