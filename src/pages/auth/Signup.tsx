import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { ShieldCheck, Mail, Lock, User, Terminal, Loader2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoadingState(true);

    if (!name || !email || !password) {
      setErrorMsg('All registration parameters must be supplied.');
      setLoadingState(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password integrity constraint: Minimum 6 characters required.');
      setLoadingState(false);
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Set display name
      await updateProfile(user, { displayName: name });

      // 3. Write profile record securely to Firestore
      const userRef = doc(db, 'users', user.uid);
      const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com'];
      const isSystemAdmin = bootstrappedEmails.map(e => e.toLowerCase()).includes(email.toLowerCase());
      const role = isSystemAdmin ? 'admin' : 'user';

      const initialProfile = {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        xp: 0,
        completedRooms: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(userRef, initialProfile);

      // Create a welcome notification
      const notifId = `welcome-${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: user.uid,
        title: 'Academic Port Active',
        body: `Congratulations ${name}. Your sovereign credentials has been successfully deployed. Access our Academy room or Study path to start your engineering journey.`,
        read: false,
        timestamp: new Date().toISOString()
      });

      setLoadingState(false);
      const redirectTo = sessionStorage.getItem('studyRedirectTo');
      if (redirectTo) {
        sessionStorage.removeItem('studyRedirectTo');
        navigate(redirectTo);
      } else {
        navigate('/academy'); // Redirect to training academy
      }
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This corporate email address is already registered.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'The supplied email address format is invalid.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Weak password: Minimum 6 characters required.';
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
            <ShieldCheck size={11} /> Registration Node
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Join Kogla Tech
          </h1>
          <p className="text-[10px] text-gray-500 font-mono mt-1">
            Establish your credential keys across our secure digital matrix.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-sm mb-6 flex items-start gap-2 max-h-48 overflow-y-auto">
            <span className="font-bold text-[10px] font-mono text-red-500 uppercase shrink-0 mt-0.5">[ERROR]:</span>
            <p className="text-[11px] leading-relaxed font-mono">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <User size={10} /> Validated Full Name
            </label>
            <input 
              type="text" 
              required
              disabled={loadingState}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alexandra Sterling" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono placeholder:text-gray-700" 
            />
          </div>

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
              placeholder="sterling@apexcorp.luxury" 
              className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono placeholder:text-gray-700" 
            />
          </div>

          <div>
            <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
              <Lock size={10} /> Password Credentials
            </label>
            <input 
              type="password" 
              required
              disabled={loadingState}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters" 
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
                <Loader2 size={13} className="animate-spin" /> Transmitting Account Keys...
              </>
            ) : (
              'Deploy Account Profile'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-900 text-center text-xs">
          <span className="text-gray-600">Already registered? </span>
          <Link to="/auth/login" className="text-gold-500 hover:text-gold-400 font-mono uppercase tracking-wider font-bold">Log In</Link>
        </div>
      </motion.div>
    </div>
  );
}
