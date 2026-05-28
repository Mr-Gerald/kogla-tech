import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { ShieldCheck, Mail, Lock, Loader2, Key } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingState(true);

    if (!email || !password) {
      setErrorMsg('Both credential pathways must be specified.');
      setLoadingState(false);
      return;
    }

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ensure Profile document exists in Firestore and check Admin status
      const userRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(userRef);

      // Bootstrapped Admin: If the email matches the user email or admin@kogla-tech.com, bootstrap role to admin
      const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com'];
      const isSystemAdmin = bootstrappedEmails.map(e => e.toLowerCase()).includes(email.toLowerCase());
      const role = isSystemAdmin ? 'admin' : 'user';

      if (!profileSnap.exists()) {
        const initialProfile = {
          uid: user.uid,
          name: user.displayName || email.split('@')[0] || 'Sovereign Developer',
          email: email,
          role: role,
          xp: 0,
          completedRooms: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, initialProfile);
      } else {
        // If profile exists and they are marked as system admin email but don't have role=admin, upgrade them securely
        const data = profileSnap.data();
        if (isSystemAdmin && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin', updatedAt: new Date().toISOString() });
        }
      }

      setSuccessMsg('Operational verification complete. Synchronizing systems...');
      
      setTimeout(() => {
        setLoadingState(false);
        if (isSystemAdmin) {
          navigate('/admin'); // Redirect to Admin Command center
        } else {
          const redirectTo = sessionStorage.getItem('studyRedirectTo');
          if (redirectTo) {
            sessionStorage.removeItem('studyRedirectTo');
            navigate(redirectTo);
          } else {
            navigate('/academy'); // Redirect users to learning catalog
          }
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      let friendlyError = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyError = 'Invalid credentials. Please verify your administrative or developer keys.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Sovereign standard error: email address format is invalid.';
      }
      setErrorMsg(friendlyError);
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
            <Key size={11} /> Authentication Node
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Log In
          </h1>
          <p className="text-[10px] text-gray-500 font-mono mt-1">
            Provide credentials to verify clearance nodes.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-sm mb-6 flex items-start gap-2 max-h-48 overflow-y-auto">
            <span className="font-bold text-[10px] font-mono text-red-500 uppercase shrink-0 mt-0.5">[ERROR]:</span>
            <p className="text-[11px] leading-relaxed font-mono">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-400 text-xs rounded-sm mb-6 flex items-start gap-2">
            <span className="font-bold text-[10px] font-mono text-green-500 uppercase shrink-0 mt-0.5">[OK]:</span>
            <p className="text-[11px] leading-relaxed font-mono">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <Mail size={10} /> Corporate Email
            </label>
            <input 
              type="email" 
              required
              disabled={loadingState}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@kogla-tech.com" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono placeholder:text-gray-700" 
            />
          </div>

          <div>
            <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <Lock size={10} /> Password Keys
            </label>
            <input 
              type="password" 
              required
              disabled={loadingState}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono placeholder:text-gray-700" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loadingState}
            className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/40 text-black font-semibold text-xs transition-all uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2"
          >
            {loadingState ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Verifying Credentials...
              </>
            ) : (
              'Decrypt and Access'
            )}
          </button>
        </form>

        <div className="mt-6 text-xs text-center space-y-2">
          <Link to="/auth/forgot-password" className="text-gray-400 hover:text-white block font-mono">Forgot password?</Link>
          <div className="text-gray-600">
            Don't have an account? <Link to="/auth/signup" className="text-gold-500 hover:underline">Sign Up</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
