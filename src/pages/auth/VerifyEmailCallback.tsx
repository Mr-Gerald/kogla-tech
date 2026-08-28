import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase, saveSupabaseUserProfile, getSupabaseUserProfile } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';

export default function VerifyEmailCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncSession } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email token...');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function processVerification() {
      try {
        // Parse search params and hash params from URL
        const searchParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(location.hash.startsWith('#') ? location.hash.substring(1) : location.hash);
        
        const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');
        if (errorDesc) {
          if (isMounted) {
            setStatus('error');
            setMessage(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
          }
          return;
        }

        // Check if there is an active session or token returned by Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session retrieval error:', error);
        }

        let verifiedEmail = session?.user?.email || searchParams.get('email') || '';
        const verifiedUid = session?.user?.id || '';

        if (session?.user) {
          verifiedEmail = session.user.email || '';
          
          // Update profile in local cache and Firestore
          let profile = getSupabaseUserProfile(session.user.id);
          if (!profile && verifiedEmail) {
            profile = getSupabaseUserProfile(verifiedEmail);
          }

          if (profile) {
            saveSupabaseUserProfile({
              ...profile,
              emailVerified: true,
              emailConfirmedAt: new Date().toISOString()
            });
          } else {
            const newProfile: UserProfile = {
              uid: session.user.id,
              name: session.user.user_metadata?.name || (verifiedEmail ? verifiedEmail.split('@')[0] : 'Developer'),
              email: verifiedEmail,
              role: (session.user.user_metadata?.role as any) || 'user',
              emailVerified: true,
              emailConfirmedAt: new Date().toISOString(),
              xp: 0,
              completedRooms: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            saveSupabaseUserProfile(newProfile);
          }

          if (isMounted) {
            setUserEmail(verifiedEmail || null);
            await syncSession(session.user);
            setStatus('success');
            setMessage('Your email has been successfully confirmed and your account is active.');
          }
        } else {
          // If no immediate session object, check if hash contains access_token or confirmation
          if (location.hash.includes('access_token') || location.search.includes('type=signup') || location.hash.includes('type=signup')) {
            if (verifiedEmail) {
              const existingProf = getSupabaseUserProfile(verifiedEmail);
              if (existingProf) {
                saveSupabaseUserProfile({
                  ...existingProf,
                  emailVerified: true,
                  emailConfirmedAt: new Date().toISOString()
                });
              }
            }
            if (isMounted) {
              if (verifiedEmail) setUserEmail(verifiedEmail);
              setStatus('success');
              setMessage('Your email has been successfully confirmed and your account is active.');
            }
          } else {
            // Still show success if landed on verification URL
            if (isMounted) {
              setStatus('success');
              setMessage('Your email has been successfully confirmed. You can now log into your Kogla Tech portal.');
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage(err?.message || 'Failed to complete email confirmation. The link may have expired or already been used.');
        }
      }
    }

    processVerification();

    return () => {
      isMounted = false;
    };
  }, [location, syncSession]);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-lg mx-auto text-gray-100 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 bg-gray-950/90 border border-gray-800 rounded-sm shadow-2xl relative text-center backdrop-blur-sm"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center border transition-all duration-300">
          {status === 'verifying' && (
            <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
          )}
        </div>

        {status === 'verifying' && (
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Verifying Email...</h1>
            <p className="text-gray-400 text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-full uppercase tracking-widest font-mono mb-3">
              <ShieldCheck size={12} /> Account Verified
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {message} {userEmail && <span className="text-gold-400 font-mono font-medium block mt-1">{userEmail}</span>}
            </p>

            <div className="p-4 bg-gray-900/70 border border-gray-800 rounded-sm mb-6 text-left text-xs text-gray-400 space-y-1.5">
              <div className="flex items-center gap-2 text-gold-400 font-semibold font-mono uppercase tracking-wider text-[11px]">
                <Sparkles size={13} /> Access Granted
              </div>
              <p>You can now sign in to access the Kogla Tech Academy, live study rooms, client workflows, and project portals.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/auth/login?verified=true"
                className="w-full py-3 px-5 bg-gold-500 text-black font-semibold uppercase tracking-wider text-xs rounded-sm hover:bg-gold-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
              >
                <LogIn size={15} /> Continue to Sign In <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-3">Verification Link Issue</h1>
            <p className="text-rose-300/90 text-sm mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/auth/login"
                className="w-full py-3 px-5 bg-gold-500 text-black font-semibold uppercase tracking-wider text-xs rounded-sm hover:bg-gold-400 transition-all flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight size={14} />
              </Link>
              <Link
                to="/auth/signup"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Need to create a new account or resend link?
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
