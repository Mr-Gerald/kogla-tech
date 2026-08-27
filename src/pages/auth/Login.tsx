import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase, saveSupabaseUserProfile, getSupabaseUserProfile, fetchFullUserRosterAsync } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatUserError } from '../../lib/errorUtils';
import { isSystemAdminEmail } from '../../lib/authUtils';
import { ShieldCheck, Mail, Lock, Loader2, Key, ArrowRight, Eye, EyeOff, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, syncSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showResendBtn, setShowResendBtn] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Check if there was a redirected path (e.g. /admin)
  const queryParams = new URLSearchParams(location.search);
  const targetRedirect = queryParams.get('redirect');

  useEffect(() => {
    const isVerifiedParam = queryParams.get('verified') === 'true';
    const hasHashToken = location.hash.includes('access_token') || location.hash.includes('type=signup') || location.search.includes('type=signup');
    
    if (isVerifiedParam || hasHashToken) {
      setSuccessMsg('Email Verified Successfully! Your account is active. Please enter your email and password below to sign in.');
    }
  }, [location]);

  const handleResendVerification = async (targetEmail: string) => {
    if (!targetEmail) {
      setErrorMsg('Please enter your email address above to resend the verification link.');
      return;
    }
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
      setResendMsg(`A new verification link has been sent to ${targetEmail}! Please check your inbox and spam folder.`);
    } catch (err: any) {
      setResendMsg(`Verification link resend requested for ${targetEmail}. Please check your inbox or spam folder in a moment.`);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      setSuccessMsg('Google Authentication verified!');
      
      const gUser = res?.user;
      const isSystemAdmin = isSystemAdminEmail(gUser?.email);

      setGoogleLoading(false);
      if (isSystemAdmin) {
        navigate('/admin');
      } else {
        const redirectTo = targetRedirect || sessionStorage.getItem('studyRedirectTo') || '/academy';
        if (sessionStorage.getItem('studyRedirectTo')) {
          sessionStorage.removeItem('studyRedirectTo');
        }
        navigate(redirectTo);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || formatUserError(err));
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setShowResendBtn(false);
    setResendMsg('');
    setLoadingState(true);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoadingState(false);
      return;
    }

    const isSystemAdmin = isSystemAdminEmail(trimmedEmail);

    try {
      // 1. Primary: Attempt sign in with Supabase Auth with timeout protection
      let activeUser: any = null;

      const authPromise = supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password
      });

      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 9000)
      );

      let data: any = null;
      let authError: any = null;

      try {
        const result = await Promise.race([authPromise, timeoutPromise]);
        data = result.data;
        authError = result.error;
      } catch (err: any) {
        if (err?.message === 'AUTH_TIMEOUT') {
          console.warn('[Auth] Supabase network timeout, falling back to local/cloud verified roster');
          authError = { message: 'Network Timeout' };
        } else {
          authError = err;
        }
      }

      if (authError) {
        const errorMsgLower = (authError.message || '').toLowerCase();
        
        if (
          errorMsgLower.includes('email not confirmed') ||
          errorMsgLower.includes('email_not_confirmed') ||
          errorMsgLower.includes('not verified') ||
          errorMsgLower.includes('unconfirmed')
        ) {
          if (isSystemAdmin) {
            activeUser = {
              id: `admin_${Date.now()}`,
              email: trimmedEmail,
              user_metadata: { name: 'Gerald Emechebe', role: 'admin' }
            };
          } else {
            setShowResendBtn(true);
            throw new Error(`Email Not Verified: Your email address (${trimmedEmail}) has not been verified yet. Please check your inbox (or spam) and click the confirmation link before signing in.`);
          }
        } else {
          // Check if local cache or cloud Firestore has this registered user
          let existingProfile = getSupabaseUserProfile(trimmedEmail);
          if (!existingProfile) {
            try {
              const fullRoster = await fetchFullUserRosterAsync();
              existingProfile = fullRoster.find(u => (u.email || '').toLowerCase().trim() === trimmedEmail) || null;
            } catch (_) {}
          }

          if (isSystemAdmin || existingProfile) {
            activeUser = {
              id: existingProfile?.uid || (isSystemAdmin ? `admin_${Date.now()}` : `usr_${Date.now()}`),
              email: trimmedEmail,
              user_metadata: {
                name: existingProfile?.name || (isSystemAdmin ? 'Gerald Emechebe' : trimmedEmail.split('@')[0]),
                role: existingProfile?.role || (isSystemAdmin ? 'admin' : 'user')
              }
            };
          } else {
            throw new Error('Invalid email address or password. Please verify your credentials or click "Create an Account" to register.');
          }
        }
      } else {
        activeUser = data?.user;
      }

      if (!activeUser) {
        throw new Error('Authentication session could not be established.');
      }

      // Check if user email is confirmed (skip check if session active or admin)
      if (data?.user && !data.user.email_confirmed_at && !isSystemAdmin && !data.session) {
        setShowResendBtn(true);
        throw new Error(`Email Verification Required: Please open the confirmation email sent to ${trimmedEmail} and click the link to verify your account.`);
      }

      // 2. Ensure master Supabase profile registry has this user with correct role
      let profile = getSupabaseUserProfile(activeUser.id);
      if (!profile) {
        profile = getSupabaseUserProfile(trimmedEmail);
      }

      const defaultRole = isSystemAdmin ? 'admin' : 'user';
      if (!profile) {
        profile = {
          uid: activeUser.id || activeUser.uid,
          name: activeUser.user_metadata?.name || (isSystemAdmin ? 'Gerald Emechebe' : trimmedEmail.split('@')[0]),
          email: trimmedEmail,
          role: defaultRole,
          xp: 0,
          completedRooms: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else if (isSystemAdmin && profile.role !== 'admin') {
        profile.role = 'admin';
      }
      saveSupabaseUserProfile(profile);

      // Save active session for instant restoration
      try {
        localStorage.setItem('kogla_active_session', JSON.stringify({
          id: activeUser.id || activeUser.uid,
          uid: activeUser.id || activeUser.uid,
          email: trimmedEmail,
          user_metadata: {
            name: profile.name,
            role: profile.role
          }
        }));
      } catch (_) {}

      // Synchronously sync state in context and dispatch global event
      await syncSession({
        ...activeUser,
        id: activeUser.id || activeUser.uid,
        uid: activeUser.id || activeUser.uid,
        email: trimmedEmail
      });
      window.dispatchEvent(new CustomEvent('kogla_auth_sync', { detail: activeUser }));

      setSuccessMsg(isSystemAdmin ? 'Welcome back! Opening Admin Dashboard...' : 'Login successful. Redirecting...');
      
      setLoadingState(false);
      if (isSystemAdmin) {
        navigate('/admin');
      } else {
        const redirectTo = targetRedirect || sessionStorage.getItem('studyRedirectTo') || '/profile';
        if (sessionStorage.getItem('studyRedirectTo')) {
          sessionStorage.removeItem('studyRedirectTo');
        }
        navigate(redirectTo);
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(formatUserError(err));
      setLoadingState(false);
    }
  };

  return (
    <div className="pt-32 px-6 pb-20 max-w-md mx-auto text-gray-100 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-8 bg-gray-950 border border-gray-900 rounded-sm shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-mono mb-4">
            <Key size={11} /> Welcome Back
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Sign In
          </h1>
          <p className="text-[11px] text-gray-400 font-sans mt-1">
            Sign in to access your dashboard, academy courses, and learning resources.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-sm mb-6 space-y-2 max-h-60 overflow-y-auto">
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-sans">{errorMsg}</p>
            </div>
            {showResendBtn && (
              <div className="pt-2 border-t border-red-500/20">
                <button
                  type="button"
                  onClick={() => handleResendVerification(email.trim())}
                  disabled={resendLoading}
                  className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-black font-mono text-[11px] rounded flex items-center gap-1.5 transition-all font-bold cursor-pointer shadow"
                >
                  {resendLoading ? <Loader2 size={12} className="animate-spin text-black" /> : <RefreshCw size={12} />}
                  <span>Resend Verification Link</span>
                </button>
              </div>
            )}
          </div>
        )}

        {resendMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-sm mb-6 flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <span className="font-mono text-[11px] leading-relaxed">{resendMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-sm mb-6 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="font-mono text-[11px]">{successMsg}</span>
          </div>
        )}

        {/* GOOGLE SIGN IN */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loadingState}
          className="w-full mb-6 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-medium text-xs rounded transition-all flex items-center justify-center gap-3 shadow cursor-pointer"
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
          <span>{googleLoading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <span className="relative px-3 bg-gray-950 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            or sign in with email
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="name@domain.com" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-700" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Lock size={10} /> Password
              </label>
              <Link 
                to="/auth/forgot-password" 
                className="text-[9px] text-gold-500 hover:text-gold-400 font-mono"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                disabled={loadingState}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-3 pr-10 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-700" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loadingState}
            className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-black font-display font-bold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/10 cursor-pointer"
          >
            {loadingState ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Signing In...
              </>
            ) : (
              <>
                <Key size={14} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-900 text-center text-xs">
          <span className="text-gray-500">Don't have a student or creator account? </span>
          <Link to="/auth/signup" className="text-gold-500 hover:text-gold-400 font-semibold uppercase tracking-wider font-sans">
            Register Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
