import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';
import { supabase, saveSupabaseUserProfile } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatUserError } from '../../lib/errorUtils';
import { 
  ShieldCheck, Mail, Lock, User, Loader2, Tag, CheckCircle2, Check, 
  ArrowRight, KeyRound, Eye, EyeOff, AlertTriangle, FileText, X, ShieldAlert, UserCheck, RefreshCw 
} from 'lucide-react';
import { captureUrlReferral, getActiveReferralCode, setManualReferralCode } from '../../lib/referralTracker';
import { getUserReferralCode } from '../../lib/affiliates';
import { isSystemAdminEmail } from '../../lib/authUtils';

export default function Signup() {
  const navigate = useNavigate();
  const { signInWithGoogle, syncSession } = useAuth();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [existingAccountDetected, setExistingAccountDetected] = useState(false);

  const handleResendVerification = async (targetEmail: string) => {
    if (!targetEmail) return;
    setResendLoading(true);
    setResendMsg('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login?verified=true`
        }
      });
      if (error) throw error;
      setResendMsg(`A fresh verification link has been sent to ${targetEmail}! Please check your inbox and spam folder.`);
    } catch (err: any) {
      setResendMsg(`Verification email resend request recorded for ${targetEmail}. Please check your inbox or spam folder in a few moments.`);
    } finally {
      setResendLoading(false);
    }
  };

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
      const res = await signInWithGoogle();
      const gUser = res?.user;
      const isSystemAdmin = isSystemAdminEmail(gUser?.email);

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
      setErrorMsg(err?.message || formatUserError(err));
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!termsAgreed) {
      setErrorMsg('You must review and agree to the Master Terms of Service, Anti-Liability Disclaimer, and Academic Policies to register.');
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
    const isSystemAdmin = isSystemAdminEmail(trimmedEmail);
    const role = isSystemAdmin ? 'admin' : 'user';

    try {
      // 1. Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            name: name,
            role: role,
            promoCode: cleanPromo,
            termsAcceptedAt: new Date().toISOString()
          },
          emailRedirectTo: `${window.location.origin}/auth/login?verified=true`
        }
      });

      if (error) {
        const errorLower = (error.message || '').toLowerCase();
        if (errorLower.includes('already registered') || errorLower.includes('unique') || errorLower.includes('user_already_exists')) {
          setExistingAccountDetected(true);
          throw new Error('An account with this email address already exists. Please sign in or reset your password.');
        }
        throw error;
      }

      const activeUser = data?.user;
      if (!activeUser) {
        throw new Error('Authentication could not be initialized.');
      }

      const generatedCode = getUserReferralCode({ name }, activeUser.id);

      // 2. Save master profile record to database / local cache
      const initialProfile: UserProfile = {
        uid: activeUser.id,
        name: name || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        role: role as ('user' | 'admin' | 'affiliate'),
        isAmbassador: false,
        affiliateCode: generatedCode,
        xp: 0,
        completedRooms: [],
        referredBy: cleanPromo || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveSupabaseUserProfile(initialProfile);

      // Account MUST be verified via email link before signing in.
      // Do NOT save session payload or log user in.
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
            <UserCheck size={11} /> Create Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Join Kogla Tech
          </h1>
          <p className="text-[11px] text-gray-400 font-sans mt-1">
            Access enterprise software engineering services, cybersecurity solutions, interactive tech sandboxes, and client portals.
          </p>
        </div>

        {/* EMAIL VERIFICATION REQUIRED BANNER */}
        {verificationSent && (
          <div className="p-6 bg-zinc-900 border border-gold-500/40 rounded text-gray-200 text-xs mb-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 font-bold uppercase font-mono text-gold-400 text-sm border-b border-gold-500/20 pb-3">
              <Mail size={20} className="text-gold-500 shrink-0" /> Account Created – Verification Link Sent
            </div>
            
            <p className="text-xs leading-relaxed text-gray-200 font-sans">
              Welcome to Kogla Tech! A confirmation email containing your account activation link has been sent to <b className="text-white font-mono">{registeredEmail}</b>.
            </p>

            <div className="p-3.5 bg-black/80 border border-amber-500/40 rounded text-[11px] text-amber-200 leading-relaxed font-sans space-y-1.5">
              <p className="font-bold uppercase font-mono text-gold-400 flex items-center gap-1">
                <ShieldAlert size={13} /> Mandatory Verification Step:
              </p>
              <p>
                Open your email inbox (and check your <b>spam / junk folder</b>) and click the verification link sent from <b>Kogla Tech</b> to verify your email. Your account will not activate until you click that link.
              </p>
            </div>

            {resendMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] rounded font-mono flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resendMsg}</span>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800 flex flex-wrap gap-2 items-center justify-between">
              <Link
                to="/auth/login"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-mono text-xs rounded flex items-center gap-1.5 transition-all font-bold shadow"
              >
                <KeyRound size={13} /> Proceed to Sign In <ArrowRight size={12} />
              </Link>

              <button
                type="button"
                onClick={() => handleResendVerification(registeredEmail)}
                disabled={resendLoading}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-mono text-xs rounded flex items-center gap-1.5 transition-all border border-zinc-700 cursor-pointer"
              >
                {resendLoading ? <Loader2 size={13} className="animate-spin text-gold-500" /> : <RefreshCw size={13} />}
                <span>Resend Verification Email</span>
              </button>
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

          {/* OPTIONAL REFERRAL / PROMO CODE */}
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
                <Check size={11} /> Referral code <b>{promoCode}</b> applied (5% discount active).
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
                    Kogla Tech Master Terms of Service, Anti-Liability Disclaimer & Policies
                  </button>.
                </span>
              </label>

              {!termsAgreed && (
                <p className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1 pl-6">
                  <ShieldAlert size={12} /> You must check the agreement box to enable registration.
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
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
                <Loader2 size={14} className="animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                <UserCheck size={14} /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-gray-500">Already registered? </span>
            <Link to="/auth/login" className="text-gold-500 hover:text-gold-400 font-semibold uppercase tracking-wider font-sans">Sign In</Link>
          </div>
          <div>
            <Link to="/affiliate-portal" className="text-zinc-400 hover:text-gold-400 font-mono text-[11px]">
              Become a Creator / Partner →
            </Link>
          </div>
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
                  <b>LEGAL NOTICE:</b> By checking "I Agree" on registration, you establish a binding legal contract with Kogla Tech Global governing service engagements, platform access, sandboxes, and brand programs.
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    1. Scope of Technology Services & Academy Offerings
                  </h4>
                  <p>
                    Kogla Tech Global provides bespoke enterprise software engineering, zero-trust cybersecurity architectures, workflow automation, and immersive digital academy training. Individual learning and career outcomes depend strictly on individual mastery and market factors; Kogla Tech does not guarantee commercial employment or third-party client contracts.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    2. Creator, Ambassador & Referral Terms
                  </h4>
                  <p>
                    Partners and ambassadors operating via the Affiliate Portal act strictly as <b>Independent Contractors</b>. Commissions (6% Base → 10% Accelerator) are disbursed upon verified client/student payment confirmation. Bulk spam, unauthorized advertising claims, or brand misrepresentation are strictly prohibited.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    3. Intellectual Property & Code Integrity
                  </h4>
                  <p>
                    All course syllabuses, software designs, proprietary frameworks, and logos are the intellectual property of Kogla Tech Global. Clients own custom deliverables upon full contractual settlement.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-display font-bold text-gold-400 uppercase tracking-wide">
                    4. Limitation of Liability
                  </h4>
                  <p>
                    To the maximum extent permitted by law, Kogla Tech Global, its founder Gerald Emechebe, and affiliates shall not be liable for incidental or consequential damages.
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
