import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, safeFirestoreWrite } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { formatUserError } from '../../lib/errorUtils';
import { ShieldCheck, Mail, Lock, User, Loader2, Tag, CheckCircle2, Check, ArrowRight, KeyRound } from 'lucide-react';
import { captureUrlReferral, getActiveReferralCode, setManualReferralCode } from '../../lib/referralTracker';

export default function Signup() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
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

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const gUser = await signInWithGoogle();
      
      const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
      const isSystemAdmin = gUser.email && bootstrappedEmails.map(e => e.toLowerCase()).includes(gUser.email.toLowerCase());

      const activeCode = promoCode.trim().toUpperCase() || getActiveReferralCode();
      if (activeCode && gUser.uid) {
        await safeFirestoreWrite(async () => {
          await setDoc(doc(db, 'users', gUser.uid), {
            referredBy: activeCode,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }, 2000);
      }

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
    setExistingAccountDetected(false);
    setLoadingState(true);

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all registration fields.');
      setLoadingState(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid, authenticated email address (e.g. name@domain.com).');
      setLoadingState(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoadingState(false);
      return;
    }

    const trimmedEmail = email.trim();
    const cleanPromo = promoCode.trim().toUpperCase();
    const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
    const isSystemAdmin = bootstrappedEmails.map(e => e.toLowerCase()).includes(trimmedEmail.toLowerCase());
    const role = isSystemAdmin ? 'admin' : 'user';

    try {
      let activeUser: any = null;

      try {
        // 1. Attempt to create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        activeUser = userCredential.user;
        await updateProfile(activeUser, { displayName: name });

        try {
          await sendEmailVerification(activeUser);
          setVerificationSent(true);
          setRegisteredEmail(trimmedEmail);
        } catch (verifErr: any) {
          console.warn('Email verification dispatch notice:', verifErr);
          // If Google Identity Toolkit throttles/blocks email sending (e.g. daily quota reached or 400 Bad Request)
          if (verifErr?.message?.includes('TOO_MANY_ATTEMPTS_TRY_LATER') || verifErr?.code === 'auth/too-many-requests') {
            console.info('Email verification request was rate-limited by Firebase Auth.');
          }
        }
      } catch (authErr: any) {
        // If email already exists in Firebase Auth (e.g., deleted from Firestore earlier or previously created),
        // attempt seamless sign-in with the provided password
        if (authErr?.code === 'auth/email-already-in-use') {
          try {
            const loginCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
            activeUser = loginCred.user;
            if (name && !activeUser.displayName) {
              await updateProfile(activeUser, { displayName: name });
            }
          } catch (loginErr: any) {
            // Password did not match existing Auth credential
            setExistingAccountDetected(true);
            setErrorMsg('An account with this email address already exists. Please log in with your password or reset your credentials.');
            setLoadingState(false);
            return;
          }
        } else {
          throw authErr;
        }
      }

      if (!activeUser) {
        throw new Error('Authentication could not be initialized.');
      }

      // 2. Write/Restore profile record in Firestore
      const userRef = doc(db, 'users', activeUser.uid);
      const initialProfile = {
        uid: activeUser.uid,
        name: name || activeUser.displayName || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        role: role,
        xp: 0,
        completedRooms: [],
        referredBy: cleanPromo || null,
        emailVerified: activeUser.emailVerified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await safeFirestoreWrite(async () => {
        await setDoc(userRef, initialProfile, { merge: true });
        const notifId = `welcome-${Date.now()}`;
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: activeUser.uid,
          title: 'Welcome to Kogla Tech',
          body: `Congratulations ${name || 'Student'}. Your account has been initialized and synchronized.`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }, 2000);

      if (cleanPromo) {
        setManualReferralCode(cleanPromo);
      }

      setLoadingState(false);

      setTimeout(() => {
        const redirectTo = sessionStorage.getItem('studyRedirectTo');
        if (redirectTo) {
          sessionStorage.removeItem('studyRedirectTo');
          navigate(redirectTo);
        } else {
          if (isSystemAdmin) {
            navigate('/admin');
          } else {
            navigate('/academy');
          }
        }
      }, 1200);
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
            <ShieldCheck size={11} /> Create Account
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Join Kogla Tech
          </h1>
          <p className="text-[10px] text-gray-400 font-mono mt-1">
            Create your account to access our professional academy and services.
          </p>
        </div>

        {/* VERIFICATION SENT SUCCESS BANNER */}
        {verificationSent && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded text-emerald-200 text-xs mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase font-mono text-emerald-400">
              <CheckCircle2 size={16} /> Verification Link Dispatched
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              We sent a verification link to <b>{registeredEmail}</b>. Click the link in your email to authenticate your credential. Redirecting to Academy...
            </p>
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
              <User size={10} /> Full Name
            </label>
            <input 
              type="text" 
              required
              disabled={loadingState}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" 
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
              placeholder="Minimum 6 characters" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans placeholder:text-gray-600" 
            />
          </div>

          {/* OPTIONAL REFERRAL / AMBASSADOR PROMO CODE */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Tag size={10} className="text-gold-400" /> Referral / Promo Code (Optional)
              </label>
              {promoCode && (
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <Check size={11} /> 5% Discount Active
                </span>
              )}
            </div>
            <input 
              type="text" 
              disabled={loadingState}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="e.g. AMBASSADOR" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-gold-400 font-mono uppercase placeholder:text-gray-700" 
            />
            {promoCode && (
              <p className="text-[10px] text-zinc-400 font-sans mt-1">
                Ambassador referral code <b>{promoCode}</b> will automatically grant you a 5% tuition discount across all academy courses.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loadingState}
            className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/40 text-black font-semibold text-xs transition-all uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2"
          >
            {loadingState ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-900 text-center text-xs">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/auth/login" className="text-gold-500 hover:text-gold-400 font-semibold uppercase tracking-wider font-sans">Log In</Link>
        </div>
      </motion.div>
    </div>
  );
}
