import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { supabase, saveSupabaseUserProfile, getSupabaseUserProfile } from '../lib/supabase';
import { UserProfile, NotificationRecord } from '../types';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      handleUserSession(currentUser);
    });

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      handleUserSession(currentUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (currentUser: any) => {
    if (currentUser) {
      const normalizedUser: SupabaseUser = {
        ...currentUser,
        id: currentUser.id,
        uid: currentUser.id,
        photoURL: currentUser.user_metadata?.avatar_url || ''
      };
      setUser(normalizedUser);

      const bootstrappedEmails = ['emechebegerald@gmail.com', 'admin@kogla-tech.com', 'admin@koglatech.com', 'solutions@koglatech.com'];
      const isSystemAdmin = currentUser.email && bootstrappedEmails.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase());
      const role = isSystemAdmin ? 'admin' : 'user';

      let existingProfile = getSupabaseUserProfile(currentUser.id);
      if (!existingProfile && currentUser.email) {
        existingProfile = getSupabaseUserProfile(currentUser.email);
      }

      if (existingProfile) {
        if (isSystemAdmin && existingProfile.role !== 'admin') {
          existingProfile.role = 'admin';
        }
        setProfile(existingProfile);
        saveSupabaseUserProfile(existingProfile);
      } else {
        const newProfile: UserProfile = {
          uid: currentUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || (isSystemAdmin ? 'Gerald Emechebe' : 'Sovereign Developer'),
          email: currentUser.email || '',
          role: role,
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
        const userNotifs = allNotifs.filter(n => n.userId === currentUser.id);
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
    }
  };

  const logout = async () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/academy`
      }
    });
    if (error) throw error;
    return data;
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
      markNotificationRead
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
                <p className="text-xs text-zinc-400">Are you sure you want to end your active Sovereign session?</p>
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
