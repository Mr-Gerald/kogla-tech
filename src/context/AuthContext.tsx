import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase, saveSupabaseUserProfile, getSupabaseUserProfile, fetchUserProfileAsync } from '../lib/supabase';
import { UserProfile, NotificationRecord } from '../types';
import { isSystemAdminEmail } from '../lib/authUtils';

interface SupabaseUser {
  id: string;
  uid: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  email_confirmed_at?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  notifications: NotificationRecord[];
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  completeRoom: (roomSlug: string, xpReward: number) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  syncSession: (forcedUser?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleUserSession = async (currentUser: any) => {
    if (currentUser) {
      const normalizedUser: SupabaseUser = {
        ...currentUser,
        id: currentUser.id || currentUser.uid || `user-${Date.now()}`,
        uid: currentUser.id || currentUser.uid || `user-${Date.now()}`,
        photoURL: currentUser.user_metadata?.avatar_url || currentUser.photoURL || ''
      };
      setUser(normalizedUser);
      try {
        localStorage.setItem('kogla_active_session', JSON.stringify(normalizedUser));
      } catch (_) {}

      const isSystemAdmin = isSystemAdminEmail(currentUser.email);
      const role = isSystemAdmin ? 'admin' : (currentUser.user_metadata?.isAmbassador ? 'affiliate' : 'user');

      let existingProfile = getSupabaseUserProfile(normalizedUser.id);
      if (!existingProfile && currentUser.email) {
        existingProfile = getSupabaseUserProfile(currentUser.email);
      }

      // If not in local storage cache, fetch asynchronously from Cloud / Server
      if (!existingProfile) {
        existingProfile = await fetchUserProfileAsync(normalizedUser.id);
        if (!existingProfile && currentUser.email) {
          existingProfile = await fetchUserProfileAsync(currentUser.email);
        }
      }

      if (existingProfile) {
        let changed = false;
        if (isSystemAdmin && existingProfile.role !== 'admin') {
          existingProfile.role = 'admin';
          changed = true;
        }
        if (currentUser.email_confirmed_at && !existingProfile.emailVerified) {
          existingProfile.emailVerified = true;
          existingProfile.emailConfirmedAt = currentUser.email_confirmed_at;
          changed = true;
        }
        setProfile(existingProfile);
        if (changed) {
          saveSupabaseUserProfile(existingProfile);
        }
      } else {
        const newProfile: UserProfile = {
          uid: normalizedUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || (isSystemAdmin ? 'Gerald Emechebe' : 'Member'),
          email: currentUser.email || '',
          role: role,
          emailVerified: isSystemAdmin || !!currentUser.email_confirmed_at,
          emailConfirmedAt: currentUser.email_confirmed_at || (isSystemAdmin ? new Date().toISOString() : undefined),
          xp: 0,
          completedRooms: [],
          avatarUrl: currentUser.user_metadata?.avatar_url || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProfile(newProfile);
        saveSupabaseUserProfile(newProfile);
      }

      // Load notifications from localStorage cache
      try {
        const allNotifs: NotificationRecord[] = JSON.parse(localStorage.getItem('kogla_supabase_notifications') || '[]');
        const userNotifs = allNotifs.filter(n => n.userId === normalizedUser.id);
        userNotifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(userNotifs);
      } catch (e) {
        setNotifications([]);
      }

      setLoading(false);
    } else {
      setUser(null);
      setProfile(null);
      setNotifications([]);
      setLoading(false);
      try {
        localStorage.removeItem('kogla_active_session');
      } catch (_) {}
    }
  };

  const syncSession = async (forcedUser?: any) => {
    if (forcedUser) {
      await handleUserSession(forcedUser);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await handleUserSession(session.user);
      return;
    }
    try {
      const cached = localStorage.getItem('kogla_active_session');
      if (cached) {
        await handleUserSession(JSON.parse(cached));
        return;
      }
    } catch (_) {}
    await handleUserSession(null);
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      if (!currentUser) {
        try {
          const cachedSession = localStorage.getItem('kogla_active_session');
          if (cachedSession) {
            handleUserSession(JSON.parse(cachedSession));
            return;
          }
        } catch (_) {}
      }
      handleUserSession(currentUser);
    });

    // 2. Listen to auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      if (!currentUser) {
        try {
          const cachedSession = localStorage.getItem('kogla_active_session');
          if (cachedSession) {
            handleUserSession(JSON.parse(cachedSession));
            return;
          }
        } catch (_) {}
      }
      handleUserSession(currentUser);
    });

    // 3. Listen to custom sync events
    const handleCustomSync = (e: any) => {
      if (e.detail) {
        handleUserSession(e.detail);
      } else {
        syncSession();
      }
    };
    window.addEventListener('kogla_auth_sync', handleCustomSync);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('kogla_auth_sync', handleCustomSync);
    };
  }, []);

  const logout = async () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    try {
      localStorage.removeItem('kogla_active_session');
      await supabase.auth.signOut();
    } catch (_) {}
    setUser(null);
    setProfile(null);
    window.dispatchEvent(new CustomEvent('kogla_auth_sync', { detail: null }));
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        const gUser = result.user;
        const normalizedUser: SupabaseUser = {
          id: gUser.uid,
          uid: gUser.uid,
          email: gUser.email || '',
          user_metadata: {
            name: gUser.displayName || gUser.email?.split('@')[0] || 'User',
            avatar_url: gUser.photoURL || ''
          },
          photoURL: gUser.photoURL || ''
        };
        await handleUserSession(normalizedUser);
        window.dispatchEvent(new CustomEvent('kogla_auth_sync', { detail: normalizedUser }));
        return { user: normalizedUser };
      }
      return null;
    } catch (err: any) {
      console.warn('[Auth] Google sign in notice:', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        throw new Error('Google sign-in popup was closed before completion.');
      }
      if (err?.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups or use email & password.');
      }
      if (err?.code === 'auth/unauthorized-domain' || err?.code === 'auth/operation-not-allowed') {
        throw new Error('Google Authentication is undergoing domain verification. Please sign in or create an account with your email and password below.');
      }
      throw new Error(err?.message || 'Google sign-in encountered an issue. Please sign in with email and password.');
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`
    });
    if (error) throw error;
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data, updatedAt: new Date().toISOString() };
    setProfile(updated);
    saveSupabaseUserProfile(updated);
  };

  const completeRoom = async (roomSlug: string, xpReward: number) => {
    if (!profile) return;
    if (profile.completedRooms.includes(roomSlug)) return;
    const updatedRooms = [...profile.completedRooms, roomSlug];
    const newXp = (profile.xp || 0) + xpReward;
    const updated = { ...profile, completedRooms: updatedRooms, xp: newXp, updatedAt: new Date().toISOString() };
    setProfile(updated);
    saveSupabaseUserProfile(updated);
  };

  const markNotificationRead = async (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
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
      markNotificationRead,
      syncSession
    }}>
      {children}
      <AnimatePresence>
        {showSignOutModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 mx-auto">
                <LogOut size={22} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-white font-bold font-display text-base">Sign Out Confirmation</h3>
                <p className="text-xs text-zinc-400">Are you sure you want to sign out of your account?</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSignOut}
                  className="flex-1 py-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs uppercase rounded transition-all cursor-pointer"
                >
                  Sign Out
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
