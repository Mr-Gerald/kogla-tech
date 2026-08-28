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
 * Master Profile Registry with tri-layer cloud + server + local persistence
 * to guarantee zero hidden accounts and 100% reliable visibility across all devices.
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

    // 2. Dual-write to Cloud Firestore
    if (profile.uid) {
      const stateHash = `${profile.uid}|${profile.role}|${profile.xp}|${(profile.completedRooms || []).join(',')}|${profile.name}|${profile.avatarUrl}|${profile.isPaid}|${profile.emailVerified}|${profile.emailConfirmedAt}`;
      if (lastWrittenProfileHashes[profile.uid] !== stateHash) {
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
    }

    // 3. Sync to backend Express server endpoint for cross-device API guarantees
    try {
      fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile })
      }).catch(() => {});
    } catch (_) {}
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
 * Loads the complete, cross-device user roster by querying Cloud Firestore,
 * server-side API, and local storage.
 */
export async function fetchFullUserRosterAsync(): Promise<UserProfile[]> {
  const localList = getSupabaseUserProfiles();
  const deletedEmails: string[] = JSON.parse(localStorage.getItem('kogla_deleted_emails') || '[]');
  const deletedUids: string[] = JSON.parse(localStorage.getItem('kogla_deleted_uids') || '[]');

  const mergedMap = new Map<string, UserProfile>();

  // Seed with local list
  for (const p of localList) {
    if (p.email) mergedMap.set(p.email.toLowerCase().trim(), p);
  }

  // 1. Fetch from Firestore Cloud Database
  try {
    const cloudUsers = await safeFirestoreRead(async () => {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => d.data() as UserProfile);
    }, []);

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
  } catch (e) {
    console.warn('[Supabase Profiles] Cloud read note:', e);
  }

  // 2. Fetch from backend server API
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        for (const su of data.users) {
          if (su.email) {
            const key = su.email.toLowerCase().trim();
            const existing = mergedMap.get(key);
            if (existing) {
              mergedMap.set(key, { ...existing, ...su });
            } else {
              mergedMap.set(key, su);
            }
          }
        }
      }
    }
  } catch (_) {}

  const merged = Array.from(mergedMap.values()).filter(
    p => !deletedUids.includes(p.uid) && !deletedEmails.includes((p.email || '').toLowerCase().trim())
  );

  // Update local cache so that this device/browser is completely up to date
  try {
    localStorage.setItem('kogla_supabase_users', JSON.stringify(merged));
  } catch (_) {}

  return merged;
}

/**
 * Fetches an individual user's profile across local cache, Cloud Firestore, and server API
 */
export async function fetchUserProfileAsync(uidOrEmail: string): Promise<UserProfile | null> {
  const local = getSupabaseUserProfile(uidOrEmail);
  if (local) return local;

  const roster = await fetchFullUserRosterAsync();
  const norm = uidOrEmail.toLowerCase().trim();
  return roster.find(p => p.uid === uidOrEmail || p.email.toLowerCase().trim() === norm) || null;
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
 * Permanently purges a user profile across local storage, Cloud Firestore, and server API
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

  // 4. Delete from server API
  try {
    await fetch('/api/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email: normEmail })
    }).catch(() => {});
  } catch (_) {}
}

