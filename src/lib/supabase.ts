import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { db } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { isSystemAdminEmail } from './authUtils';

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
 * Helper to convert a Supabase DB profiles row into a UserProfile object
 */
export function rowToUserProfile(row: any): UserProfile {
  let extra: any = {};
  if (row.bio) {
    try {
      if (typeof row.bio === 'string' && row.bio.startsWith('{')) {
        extra = JSON.parse(row.bio);
      }
    } catch (_) {}
  }
  const normEmail = (row.email || '').toLowerCase().trim();
  const isAdmin = isSystemAdminEmail(normEmail);

  return {
    uid: row.id || row.uid || `user-${Date.now()}`,
    name: row.name || (normEmail ? normEmail.split('@')[0] : 'User'),
    email: normEmail,
    role: isAdmin ? 'admin' : (row.role || 'user'),
    xp: row.xp || 0,
    completedRooms: Array.isArray(row.completed_rooms) ? row.completed_rooms : [],
    avatarUrl: extra.avatarUrl || row.github || '',
    isPaid: typeof extra.isPaid === 'boolean' ? extra.isPaid : (isAdmin ? true : false),
    emailVerified: typeof row.email_verified === 'boolean' ? row.email_verified : (isAdmin ? true : false),
    emailConfirmedAt: extra.emailConfirmedAt || (isAdmin ? '2026-01-01T00:00:00.000Z' : undefined),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

/**
 * Helper to convert a UserProfile object into a Supabase DB profiles row
 */
export function userProfileToRow(profile: UserProfile): any {
  const normEmail = (profile.email || '').toLowerCase().trim();
  const isAdmin = isSystemAdminEmail(normEmail);
  const uid = profile.uid || `user_${Date.now()}`;

  return {
    id: uid,
    uid: uid,
    email: normEmail,
    name: profile.name || (normEmail ? normEmail.split('@')[0] : 'User'),
    role: isAdmin ? 'admin' : (profile.role || 'user'),
    xp: profile.xp || 0,
    completed_rooms: profile.completedRooms || [],
    email_verified: isAdmin || !!profile.emailVerified,
    bio: JSON.stringify({
      avatarUrl: profile.avatarUrl || '',
      isPaid: isAdmin || !!profile.isPaid,
      emailConfirmedAt: profile.emailConfirmedAt || (isAdmin ? '2026-01-01T00:00:00.000Z' : undefined)
    }),
    created_at: profile.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Master Profile Registry using Supabase Postgres Database as the Single Source of Truth
 */
export async function saveSupabaseUserProfile(profile: UserProfile): Promise<void> {
  try {
    const normEmail = (profile.email || '').toLowerCase().trim();
    if (!normEmail && !profile.uid) return;

    const row = userProfileToRow(profile);

    // 1. Direct write to Supabase Database (profiles table)
    const { error } = await supabase.from('profiles').upsert(row);
    if (error) {
      console.warn('[Supabase DB] Error upserting profile:', error.message);
    }

    // 2. Update local storage session cache for snappy UI response in current browser
    const existingRaw = localStorage.getItem('kogla_supabase_users');
    let profiles: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updatedProfile: UserProfile = { 
      ...profile,
      email: normEmail || profile.email,
      role: isSystemAdminEmail(normEmail) ? 'admin' : (profile.role || 'user'),
      emailVerified: isSystemAdminEmail(normEmail) || !!profile.emailVerified,
      updatedAt: new Date().toISOString() 
    };

    const index = profiles.findIndex(p => p.uid === profile.uid || (normEmail && p.email.toLowerCase() === normEmail));
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updatedProfile };
    } else {
      profiles.push(updatedProfile);
    }
    localStorage.setItem('kogla_supabase_users', JSON.stringify(profiles));

    // 3. Background non-blocking sync to Express server & Firestore
    try {
      fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile })
      }).catch(() => {});
    } catch (_) {}

    if (profile.uid) {
      try {
        const userRef = doc(db, 'users', profile.uid);
        setDoc(userRef, {
          uid: profile.uid,
          name: profile.name,
          email: normEmail,
          role: profile.role,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      } catch (_) {}
    }
  } catch (err) {
    console.warn('[Supabase Profiles] Error saving profile:', err);
  }
}

export function getSupabaseUserProfiles(): UserProfile[] {
  try {
    const existingRaw = localStorage.getItem('kogla_supabase_users');
    if (!existingRaw) return [];
    return JSON.parse(existingRaw);
  } catch (err) {
    console.warn('[Supabase Profiles] Error loading profiles:', err);
    return [];
  }
}

/**
 * Loads the complete, cross-device user roster directly from Supabase Database.
 * IGNORES stale local storage from other browsers to ensure 100% database accuracy.
 */
export async function fetchFullUserRosterAsync(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.warn('[Supabase DB] Error selecting profiles:', error.message);
    }

    const roster: UserProfile[] = [];
    const seenEmails = new Set<string>();

    if (Array.isArray(data)) {
      for (const row of data) {
        const p = rowToUserProfile(row);
        if (p.email) {
          roster.push(p);
          seenEmails.add(p.email);
        }
      }
    }

    // Always guarantee system admin accounts exist in roster
    const masterAdmins = [
      {
        uid: 'admin_master_gerald',
        name: 'Gerald Emechebe',
        email: 'solutions@koglatech.com',
        role: 'admin' as const,
        xp: 1500,
        completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines', 'cyber-defense-protocols'],
        isPaid: true,
        emailVerified: true,
        emailConfirmedAt: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      },
      {
        uid: 'admin_gerald_emechebe',
        name: 'Gerald Emechebe',
        email: 'emechebegerald@gmail.com',
        role: 'admin' as const,
        xp: 1500,
        completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines'],
        isPaid: true,
        emailVerified: true,
        emailConfirmedAt: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      }
    ];

    for (const admin of masterAdmins) {
      if (!seenEmails.has(admin.email)) {
        roster.push(admin);
        // Persist missing admin into Supabase DB
        saveSupabaseUserProfile(admin);
      }
    }

    // Update local cache for current browser session
    try {
      localStorage.setItem('kogla_supabase_users', JSON.stringify(roster));
    } catch (_) {}

    return roster;
  } catch (err) {
    console.warn('[Supabase DB] Error in fetchFullUserRosterAsync:', err);
    return getSupabaseUserProfiles();
  }
}

/**
 * Fetches an individual user's profile from Supabase Database
 */
export async function fetchUserProfileAsync(uidOrEmail: string): Promise<UserProfile | null> {
  const norm = uidOrEmail.toLowerCase().trim();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${uidOrEmail},email.ilike.${norm}`);

    if (data && data.length > 0) {
      return rowToUserProfile(data[0]);
    }
  } catch (e) {
    console.warn('[Supabase DB] fetchUserProfileAsync error:', e);
  }

  // Fallback check against full roster
  const roster = await fetchFullUserRosterAsync();
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
 * Permanently purges a user profile directly from Supabase Database
 */
export async function deleteSupabaseUserProfile(uid: string, email: string): Promise<void> {
  const normEmail = (email || '').toLowerCase().trim();

  // 1. Delete from Supabase Database (profiles table)
  try {
    if (uid) {
      await supabase.from('profiles').delete().eq('id', uid);
    }
    if (normEmail) {
      await supabase.from('profiles').delete().ilike('email', normEmail);
    }
  } catch (err) {
    console.warn('[Supabase DB] Delete profile error:', err);
  }

  // 2. Remove from local storage cache
  try {
    const raw = localStorage.getItem('kogla_supabase_users');
    if (raw) {
      const parsed: UserProfile[] = JSON.parse(raw);
      const filtered = parsed.filter(p => p.uid !== uid && (p.email || '').toLowerCase().trim() !== normEmail);
      localStorage.setItem('kogla_supabase_users', JSON.stringify(filtered));
    }
  } catch (_) {}

  // 3. Background delete from Cloud Firestore and Server API
  if (uid) {
    try {
      deleteDoc(doc(db, 'users', uid)).catch(() => {});
    } catch (_) {}
  }
  try {
    fetch('/api/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email: normEmail })
    }).catch(() => {});
  } catch (_) {}
}

/**
 * Completely purges all non-admin user records directly in Supabase Database
 */
export async function purgeAllUsersAndDatabaseRecords(): Promise<void> {
  try {
    // Delete non-admin profiles in Supabase Database
    await supabase.from('profiles').delete().neq('role', 'admin');
  } catch (err) {
    console.warn('[Supabase DB] Purge all error:', err);
  }

  // Reseed master admin records in Supabase Database
  const masterAdmins: UserProfile[] = [
    {
      uid: 'admin_master_gerald',
      name: 'Gerald Emechebe',
      email: 'solutions@koglatech.com',
      role: 'admin',
      xp: 1500,
      completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines', 'cyber-defense-protocols'],
      isPaid: true,
      emailVerified: true,
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      uid: 'admin_gerald_emechebe',
      name: 'Gerald Emechebe',
      email: 'emechebegerald@gmail.com',
      role: 'admin',
      xp: 1500,
      completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines'],
      isPaid: true,
      emailVerified: true,
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    }
  ];

  for (const admin of masterAdmins) {
    await saveSupabaseUserProfile(admin);
  }

  // Clear local storage
  try {
    localStorage.removeItem('kogla_supabase_users');
    localStorage.removeItem('kogla_users');
    localStorage.removeItem('user_profile');
    localStorage.setItem('kogla_supabase_users', JSON.stringify(masterAdmins));
  } catch (_) {}

  // Background server clear
  try {
    fetch('/api/users/purge-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {});
  } catch (_) {}
}



