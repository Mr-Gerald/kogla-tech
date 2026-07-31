import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { KeyRound, Mail, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);
    setLoadingState(true);

    if (!email) {
      setErrorMsg('Please enter your email address.');
      setLoadingState(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setLoadingState(false);
    } catch (err: any) {
      console.error(err);
      let friendlyError = err.message;
      if (err.code === 'auth/user-not-found') {
        friendlyError = 'No account found matching that email address.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Please enter a valid email address format.';
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
            <KeyRound size={11} /> Password Recovery
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Reset Password
          </h1>
          <p className="text-[10px] text-gray-400 font-mono mt-1">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-sm mb-6 flex items-start gap-2">
            <span className="font-bold text-[10px] font-mono text-red-500 uppercase shrink-0 mt-0.5">Error:</span>
            <p className="text-[11px] leading-relaxed font-sans">{errorMsg}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center py-4">
            <CheckCircle className="text-gold-500 mx-auto" size={40} />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-sans">Email Sent Successfully</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                A password reset link has been sent to <span className="text-white font-bold">{email}</span>. Please check your inbox and spam folder.
              </p>
            </div>
            <Link 
              to="/auth/login" 
              className="inline-block px-6 py-2 bg-transparent hover:bg-gold-500/10 border border-gold-500 text-gold-500 text-[10px] font-mono tracking-widest uppercase transition-all rounded-sm"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
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

            <button 
              type="submit" 
              disabled={loadingState}
              className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/40 text-black font-semibold text-xs transition-all uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2"
            >
              {loadingState ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-6 pt-4 border-t border-gray-900 text-center text-xs">
            <Link to="/auth/login" className="text-gold-500 hover:text-gold-400 font-semibold uppercase tracking-wider font-sans">Back to Login</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
