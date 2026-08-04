import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  increment, 
  onSnapshot,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, NotificationRecord } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  notifications: NotificationRecord[];
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  completeRoom: (roomSlug: string, xpReward: number) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeNotifs: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        // Listen to User Profile dynamically
        unsubscribeProfile = onSnapshot(userRef, async (document) => {
          if (document.exists()) {
            setProfile(document.data() as UserProfile);
            setLoading(false);
          } else {
            // Profile does not exist yet (first-time login / sync delay)
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Sovereign Developer',
              email: currentUser.email || '',
              role: (currentUser.email && ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'].includes(currentUser.email.toLowerCase())) ? 'admin' : 'user',
              xp: 0,
              completedRooms: [],
              avatarUrl: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setProfile(newProfile);
            setLoading(false);
            
            // Try saving to database silently
            try {
              await setDoc(userRef, newProfile);
            } catch (err) {
              console.warn('[AuthContext] Silent profile persistence note:', err);
            }
          }
        }, (error) => {
          console.warn('[AuthContext] Firestore profile listener warning:', error?.message);
          // Fallback profile if Firestore is rate limited or unavailable
          const fallbackProfile: UserProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Sovereign Developer',
            email: currentUser.email || '',
            role: (currentUser.email && ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'].includes(currentUser.email.toLowerCase())) ? 'admin' : 'user',
            xp: 0,
            completedRooms: [],
            avatarUrl: currentUser.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProfile(fallbackProfile);
          setLoading(false);
        });

        // Listen to User Notifications dynamically
        const notifCol = collection(db, 'notifications');
        const notifQuery = query(
          notifCol, 
          where('userId', '==', currentUser.uid)
        );

        unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
          const loadedNotifs: NotificationRecord[] = [];
          snapshot.forEach((docSnap) => {
            loadedNotifs.push(docSnap.data() as NotificationRecord);
          });
          // Sort descending by timestamp on client to avoid composite index requirements
          loadedNotifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(loadedNotifs);
        }, (error) => {
          console.warn('[AuthContext] Notifications listener warning:', error?.message);
          setNotifications([]);
        });

      } else {
        setProfile(null);
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, []);

  const logout = async () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const currentUser = userCredential.user;

    const userRef = doc(db, 'users', currentUser.uid);
    const profileSnap = await getDoc(userRef);

    const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
    const isSystemAdmin = currentUser.email && bootstrappedEmails.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase());
    const role = isSystemAdmin ? 'admin' : 'user';

    if (!profileSnap.exists()) {
      const initialProfile: UserProfile = {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Google User',
        email: currentUser.email || '',
        role: role,
        xp: 0,
        completedRooms: [],
        avatarUrl: currentUser.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, initialProfile);
    } else {
      const data = profileSnap.data();
      if (isSystemAdmin && data.role !== 'admin') {
        await updateDoc(userRef, { role: 'admin', updatedAt: new Date().toISOString() });
      }
    }

    return currentUser;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userRef, payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const completeRoom = async (roomSlug: string, xpReward: number) => {
    if (!user || !profile) return;
    
    // Check if room is already completed
    if (profile.completedRooms.includes(roomSlug)) return;

    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        completedRooms: arrayUnion(roomSlug),
        xp: increment(xpReward),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const markNotificationRead = async (notifId: string) => {
    if (!user) return;
    const notifRef = doc(db, 'notifications', notifId);
    try {
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notifId}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      notifications, 
      loading, 
      logout,
      signInWithGoogle,
      resetPassword, 
      updateProfileData,
      completeRoom,
      markNotificationRead 
    }}>
      {children}

      {/* Confirmation Modal for Sign Out */}
      <AnimatePresence>
        {showSignOutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-zinc-950 border border-gold-500/40 rounded-md p-6 max-w-sm w-full shadow-2xl relative overflow-hidden text-left"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-gold-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-start gap-3.5 mb-5">
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-sm shrink-0">
                  <LogOut size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base uppercase tracking-wider">
                    Confirm Sign Out
                  </h3>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed font-sans">
                    Are you sure you want to sign out of <span className="text-gold-400 font-semibold">{user?.email || 'your account'}</span>?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSignOut}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} /> Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

