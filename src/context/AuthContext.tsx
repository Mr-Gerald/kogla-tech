import React, { createContext, useContext, useEffect, useState } from 'react';
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
            try {
              await setDoc(userRef, newProfile);
              setProfile(newProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
            }
            setLoading(false);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
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
          handleFirestoreError(error, OperationType.GET, 'notifications');
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

