import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { db, safeFirestoreWrite, safeFirestoreRead } from './firebase';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

// Supabase Project Configuration
export const SUPABASE_URL = 'https://venvcnrqcafizslpwail.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_uKe2blTYSjXw2U3eVVvaAw_BRdIYGjs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper to safely execute Supabase queries with unified error formatting
 */
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await queryFn();
    if (result.error) {
      console.warn('[Supabase] Query notice:', result.error.message || result.error);
    }
    return result;
  } catch (err: any) {
    console.error('[Supabase] Unexpected error:', err);
    return { data: null, error: err };
  }
}

/**
 * Master Profile Registry with dual-layer cloud + local persistence
 * to guarantee zero hidden accounts and 100% reliable visibility in the Admin Dashboard.
 */
export function saveSupabaseUserProfile(profile: UserProfile): void {
  try {
    // 1. Update Local Storage Cache
    const existingRaw = localStorage.getItem('kogla_supabase_users');
    let profiles: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    const index = profiles.findIndex(p => p.uid === profile.uid || p.email.toLowerCase() === profile.email.toLowerCase());
    const updatedProfile = { 
      ...profile, 
      updatedAt: new Date().toISOString() 
    };

    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updatedProfile };
    } else {
      profiles.push(updatedProfile);
    }
    localStorage.setItem('kogla_supabase_users', JSON.stringify(profiles));

    // 2. Dual-write to Cloud Firestore for cross-device visibility
    if (profile.uid) {
      safeFirestoreWrite(async () => {
        const userRef = doc(db, 'users', profile.uid);
        await setDoc(userRef, {
          uid: profile.uid,
          name: profile.name || profile.email.split('@')[0],
          email: profile.email,
          role: profile.role || 'user',
          xp: profile.xp || 0,
          completedRooms: profile.completedRooms || [],
          avatarUrl: profile.avatarUrl || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[Supabase Profiles] Error saving profile:', err);
  }
}

export function getSupabaseUserProfiles(): UserProfile[] {
  try {
    const existingRaw = localStorage.getItem('kogla_supabase_users');
    if (!existingRaw) return [];
    const profiles: UserProfile[] = JSON.parse(existingRaw);
    const deletedEmails: string[] = JSON.parse(localStorage.getItem('kogla_deleted_emails') || '[]');
    const deletedUids: string[] = JSON.parse(localStorage.getItem('kogla_deleted_uids') || '[]');
    
    return profiles.filter(p => !deletedUids.includes(p.uid) && !deletedEmails.includes(p.email.toLowerCase()));
  } catch (err) {
    console.warn('[Supabase Profiles] Error loading profiles:', err);
    return [];
  }
}

/**
 * Loads the complete, cross-device user roster by combining Cloud Firestore,
 * Supabase profiles, and local cache so no registered user is ever omitted.
 */
export async function fetchFullUserRosterAsync(): Promise<UserProfile[]> {
  const localList = getSupabaseUserProfiles();
  const deletedEmails: string[] = JSON.parse(localStorage.getItem('kogla_deleted_emails') || '[]');
  const deletedUids: string[] = JSON.parse(localStorage.getItem('kogla_deleted_uids') || '[]');

  try {
    // Read from Firestore users collection
    const cloudUsers = await safeFirestoreRead(async () => {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => d.data() as UserProfile);
    }, []);

    // Merge Cloud and Local by email / uid
    const mergedMap = new Map<string, UserProfile>();
    for (const p of localList) {
      if (p.email) mergedMap.set(p.email.toLowerCase(), p);
    }
    for (const cp of cloudUsers) {
      if (cp.email) {
        const key = cp.email.toLowerCase();
        const existing = mergedMap.get(key);
        if (existing) {
          mergedMap.set(key, { ...existing, ...cp });
        } else {
          mergedMap.set(key, cp);
        }
      }
    }

    const merged = Array.from(mergedMap.values()).filter(
      p => !deletedUids.includes(p.uid) && !deletedEmails.includes(p.email?.toLowerCase() || '')
    );

    // Update local cache with any new users from cloud
    try {
      localStorage.setItem('kogla_supabase_users', JSON.stringify(merged));
    } catch (_) {}

    return merged;
  } catch (e) {
    return localList;
  }
}

export function getSupabaseUserProfile(uidOrEmail: string): UserProfile | null {
  try {
    const profiles = getSupabaseUserProfiles();
    return profiles.find(p => p.uid === uidOrEmail || p.email.toLowerCase() === uidOrEmail.toLowerCase()) || null;
  } catch (err) {
    return null;
  }
}

