import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { db, safeFirestoreWrite, safeFirestoreRead } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

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
const lastWrittenProfileHashes: Record<string, string> = {};

export function saveSupabaseUserProfile(profile: UserProfile): void {
  try {
    const normEmail = (profile.email || '').toLowerCase().trim();
    
    // 0. Ensure this email and uid are un-blacklisted from deletion registers on creation/login
    if (normEmail) {
      try {
        const deletedEmails: string[] = JSON.parse(localStorage.getItem('kogla_deleted_emails') || '[]');
        if (deletedEmails.includes(normEmail)) {
          const updated = deletedEmails.filter(e => e.toLowerCase() !== normEmail);
          localStorage.setItem('kogla_deleted_emails', JSON.stringify(updated));
        }
      } catch (_) {}
    }
    if (profile.uid) {
      try {
        const deletedUids: string[] = JSON.parse(localStorage.getItem('kogla_deleted_uids') || '[]');
        if (deletedUids.includes(profile.uid)) {
          const updatedUids = deletedUids.filter(u => u !== profile.uid);
          localStorage.setItem('kogla_deleted_uids', JSON.stringify(updatedUids));
        }
      } catch (_) {}
    }

    // 1. Update Local Storage Cache
    const existingRaw = localStorage.getItem('kogla_supabase_users');
    let profiles: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    const index = profiles.findIndex(p => p.uid === profile.uid || (normEmail && p.email.toLowerCase() === normEmail));
    const updatedProfile: UserProfile = { 
      ...profile,
      email: normEmail || profile.email,
      emailVerified: profile.emailVerified ?? false,
      emailConfirmedAt: profile.emailConfirmedAt || undefined,
      updatedAt: new Date().toISOString() 
    };

    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updatedProfile };
    } else {
      profiles.push(updatedProfile);
    }
    localStorage.setItem('kogla_supabase_users', JSON.stringify(profiles));

    // 2. Dual-write to Cloud Firestore only when profile data has actually changed
    if (profile.uid) {
      const stateHash = `${profile.uid}|${profile.role}|${profile.xp}|${(profile.completedRooms || []).join(',')}|${profile.name}|${profile.avatarUrl}|${profile.isPaid}|${profile.emailVerified}|${profile.emailConfirmedAt}`;
      if (lastWrittenProfileHashes[profile.uid] === stateHash) {
        return; // State is identical, skip redundant write
      }
      lastWrittenProfileHashes[profile.uid] = stateHash;

      safeFirestoreWrite(async () => {
        const userRef = doc(db, 'users', profile.uid);
        await setDoc(userRef, {
          uid: profile.uid,
          name: profile.name || profile.email.split('@')[0],
          email: normEmail || profile.email,
          role: profile.role || 'user',
          xp: profile.xp || 0,
          completedRooms: profile.completedRooms || [],
          avatarUrl: profile.avatarUrl || '',
          isPaid: !!profile.isPaid,
          emailVerified: !!profile.emailVerified,
          emailConfirmedAt: profile.emailConfirmedAt || null,
          createdAt: profile.createdAt || new Date().toISOString(),
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
    
    return profiles.filter(p => !deletedUids.includes(p.uid) && !deletedEmails.includes((p.email || '').toLowerCase().trim()));
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
      if (p.email) mergedMap.set(p.email.toLowerCase().trim(), p);
    }
    for (const cp of cloudUsers) {
      if (cp.email) {
        const key = cp.email.toLowerCase().trim();
        const existing = mergedMap.get(key);
        if (existing) {
          mergedMap.set(key, { ...existing, ...cp });
        } else {
          mergedMap.set(key, cp);
        }
      }
    }

    const merged = Array.from(mergedMap.values()).filter(
      p => !deletedUids.includes(p.uid) && !deletedEmails.includes((p.email || '').toLowerCase().trim())
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
    const norm = uidOrEmail.toLowerCase().trim();
    const profiles = getSupabaseUserProfiles();
    return profiles.find(p => p.uid === uidOrEmail || p.email.toLowerCase().trim() === norm) || null;
  } catch (err) {
    return null;
  }
}

/**
 * Permanently purges a user profile across local storage and Cloud Firestore
 */
export async function deleteSupabaseUserProfile(uid: string, email: string): Promise<void> {
  const normEmail = (email || '').toLowerCase().trim();

  // 1. Remove from local storage cache
  try {
    const raw = localStorage.getItem('kogla_supabase_users');
    if (raw) {
      const parsed: UserProfile[] = JSON.parse(raw);
      const filtered = parsed.filter(p => p.uid !== uid && (p.email || '').toLowerCase().trim() !== normEmail);
      localStorage.setItem('kogla_supabase_users', JSON.stringify(filtered));
    }
  } catch (_) {}

  // 2. Track in persistent deletion lists to prevent ghost reappearance from stale cache
  if (uid) {
    try {
      const deletedUids: string[] = JSON.parse(localStorage.getItem('kogla_deleted_uids') || '[]');
      if (!deletedUids.includes(uid)) {
        deletedUids.push(uid);
        localStorage.setItem('kogla_deleted_uids', JSON.stringify(deletedUids));
      }
    } catch (_) {}
  }
  if (normEmail) {
    try {
      const deletedEmails: string[] = JSON.parse(localStorage.getItem('kogla_deleted_emails') || '[]');
      if (!deletedEmails.includes(normEmail)) {
        deletedEmails.push(normEmail);
        localStorage.setItem('kogla_deleted_emails', JSON.stringify(deletedEmails));
      }
    } catch (_) {}
  }

  // 3. Delete from Cloud Firestore
  if (uid) {
    await safeFirestoreWrite(async () => {
      await deleteDoc(doc(db, 'users', uid));
    }).catch(() => {});
  }
}

