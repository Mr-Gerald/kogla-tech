import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase, saveSupabaseUserProfile, getSupabaseUserProfile } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatUserError } from '../../lib/errorUtils';
import { ShieldCheck, Mail, Lock, Loader2, Key } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('Google Authentication successful!');
      
      const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
      const session = await supabase.auth.getSession();
      const gUser = session.data.session?.user;
      const isSystemAdmin = gUser?.email && bootstrappedEmails.map(e => e.toLowerCase()).includes(gUser.email.toLowerCase());

      setTimeout(() => {
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
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(formatUserError(err));
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingState(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoadingState(false);
      return;
    }

    const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
    const isSystemAdmin = bootstrappedEmails.map(e => e.toLowerCase()).includes(trimmedEmail.toLowerCase());
    const defaultRole = isSystemAdmin ? 'admin' : 'user';

    try {
      // 1. Primary: Attempt sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password
      });

      let activeUser = data?.user;

      // 2. If login failed because account was not yet registered in Supabase Auth, attempt seamless signup
      if (error) {
        const errorMsgLower = (error.message || '').toLowerCase();
        
        if (
          errorMsgLower.includes('invalid login credentials') ||
          errorMsgLower.includes('invalid grant') ||
          errorMsgLower.includes('user not found')
        ) {
          // Attempt seamless initialization on Supabase
          const signUpRes = await supabase.auth.signUp({
            email: trimmedEmail,
            password: password,
            options: {
              data: {
                name: isSystemAdmin ? 'Gerald Emechebe' : trimmedEmail.split('@')[0],
                role: defaultRole
              }
            }
          });

          if (signUpRes.data?.user) {
            activeUser = signUpRes.data.user;
            if (signUpRes.data.session) {
              await supabase.auth.setSession(signUpRes.data.session);
            }
          } else if (signUpRes.error) {
            const signUpMsg = (signUpRes.error.message || '').toLowerCase();
            if (signUpMsg.includes('already registered')) {
              throw new Error('Incorrect password for this account. Please verify your password or use "Forgot password?" to reset it.');
            } else {
              throw signUpRes.error;
            }
          }
        } else if (errorMsgLower.includes('email not confirmed')) {
          throw new Error('Please check your email inbox to confirm your account, or check your spam folder.');
        } else {
          throw error;
        }
      }

      if (!activeUser) {
        throw new Error('Authentication session could not be established.');
      }

      // 3. Ensure master Supabase profile registry has this user
      let profile = getSupabaseUserProfile(activeUser.id);
      if (!profile) {
        profile = getSupabaseUserProfile(trimmedEmail);
      }

      if (!profile) {
        profile = {
          uid: activeUser.id,
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

      setSuccessMsg('Login successful. Redirecting...');
      
      setTimeout(() => {
        setLoadingState(false);
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
      }, 900);

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
        className="p-6 md:p-8 bg-gray-950 border border-gray-900 rounded-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-mono mb-4">
            <Key size={11} /> Secure Account Access
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Log In
          </h1>
          <p className="text-[10px] text-gray-400 font-mono mt-1">
            Sign in to access your portal and courses.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-sm mb-6 flex items-start gap-2 max-h-48 overflow-y-auto">
            <span className="font-bold text-[10px] font-mono text-red-500 uppercase shrink-0 mt-0.5">Error:</span>
            <p className="text-[11px] leading-relaxed font-sans">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-400 text-xs rounded-sm mb-6 flex items-start gap-2">
            <span className="font-bold text-[10px] font-mono text-green-500 uppercase shrink-0 mt-0.5">Success:</span>
            <p className="text-[11px] leading-relaxed font-sans">{successMsg}</p>
          </div>
        )}

        {/* GOOGLE QUICK SIGN IN */}
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
          <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
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
              placeholder="name@example.com" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-600" 
            />
          </div>

          <div>
            <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <Lock size={10} /> Password
            </label>
            <input 
              type="password" 
              required
              disabled={loadingState}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-600" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loadingState}
            className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/40 text-black font-semibold text-xs transition-all uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2"
          >
            {loadingState ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Signing In...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="mt-6 text-xs text-center space-y-2">
          <Link to="/auth/forgot-password" className="text-gray-400 hover:text-white block font-sans">Forgot password?</Link>
          <div className="text-gray-500">
            Don't have an account? <Link to="/auth/signup" className="text-gold-500 hover:underline font-semibold">Sign Up</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
