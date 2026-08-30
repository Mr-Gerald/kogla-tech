import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';
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
      } else if (typeof row.bio === 'object' && row.bio !== null) {
        extra = row.bio;
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
    completedRooms: Array.isArray(row.completed_rooms) ? row.completed_rooms : (Array.isArray(row.completedRooms) ? row.completedRooms : []),
    phone: row.phone || extra.phone || '',
    bio: extra.realBio !== undefined ? extra.realBio : (typeof row.bio === 'string' && !row.bio.startsWith('{') ? row.bio : ''),
    title: row.title || extra.title || '',
    location: row.location || extra.location || '',
    website: row.website || extra.website || '',
    githubUrl: row.github_url || extra.githubUrl || '',
    linkedinUrl: row.linkedin_url || extra.linkedinUrl || '',
    avatarUrl: extra.avatarUrl || row.github || '',
    signatureUrl: extra.signatureUrl || row.signature_url || '',
    isPaid: typeof extra.isPaid === 'boolean' ? extra.isPaid : (isAdmin ? true : false),
    isAmbassador: typeof extra.isAmbassador === 'boolean' ? extra.isAmbassador : (typeof row.is_ambassador === 'boolean' ? row.is_ambassador : false),
    affiliateCode: extra.affiliateCode || row.affiliate_code || '',
    preferences: extra.preferences || undefined,
    savedItems: Array.isArray(extra.savedItems) ? extra.savedItems : [],
    emailVerified: typeof row.email_verified === 'boolean' ? row.email_verified : (isAdmin ? true : false),
    emailConfirmedAt: extra.emailConfirmedAt || (isAdmin ? '2026-01-01T00:00:00.000Z' : undefined),
    discountPercent: typeof extra.discountPercent === 'number' ? extra.discountPercent : (extra.referredBy ? 5 : 0),
    appliedPromoCode: extra.appliedPromoCode || extra.referredBy || undefined,
    referredBy: extra.referredBy || extra.appliedPromoCode || null,
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

  const extra = {
    avatarUrl: profile.avatarUrl || '',
    signatureUrl: profile.signatureUrl || '',
    phone: profile.phone || '',
    title: profile.title || '',
    realBio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    githubUrl: profile.githubUrl || '',
    linkedinUrl: profile.linkedinUrl || '',
    isPaid: isAdmin || !!profile.isPaid,
    isAmbassador: !!profile.isAmbassador,
    affiliateCode: profile.affiliateCode || '',
    referredBy: profile.referredBy || profile.appliedPromoCode || '',
    appliedPromoCode: profile.appliedPromoCode || profile.referredBy || '',
    discountPercent: profile.discountPercent || (profile.referredBy ? 5 : 0),
    preferences: profile.preferences || {},
    savedItems: profile.savedItems || [],
    emailConfirmedAt: profile.emailConfirmedAt || (isAdmin ? '2026-01-01T00:00:00.000Z' : undefined),
  };

  return {
    id: uid,
    uid: uid,
    email: normEmail,
    name: profile.name || (normEmail ? normEmail.split('@')[0] : 'User'),
    role: isAdmin ? 'admin' : (profile.role || 'user'),
    xp: profile.xp || 0,
    completed_rooms: profile.completedRooms || [],
    email_verified: isAdmin || !!profile.emailVerified,
    bio: JSON.stringify(extra),
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

    if (normEmail) {
      unmarkAccountAsDeleted(normEmail);
    }

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

    // 3. Background non-blocking sync to Express server
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
    return JSON.parse(existingRaw);
  } catch (err) {
    console.warn('[Supabase Profiles] Error loading profiles:', err);
    return [];
  }
}

/**
 * Loads the complete, cross-device user roster directly from Supabase Database.
 * Strictly deduplicates by email so every account appears ONCE and only ONCE.
 */
export async function fetchFullUserRosterAsync(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.warn('[Supabase DB] Error selecting profiles:', error.message);
    }

    const rosterMap = new Map<string, UserProfile>();

    if (Array.isArray(data)) {
      for (const row of data) {
        const p = rowToUserProfile(row);
        if (p.email) {
          const normKey = p.email.toLowerCase().trim();
          // Skip any account that has been deleted/purged
          if (isAccountPurgedOrDeleted(normKey) || (p.uid && isAccountPurgedOrDeleted(p.uid))) {
            continue;
          }
          if (rosterMap.has(normKey)) {
            const existing = rosterMap.get(normKey)!;
            const merged: UserProfile = {
              ...existing,
              ...p,
              role: (existing.role === 'admin' || p.role === 'admin') ? 'admin' : (p.role || existing.role),
              xp: Math.max(existing.xp || 0, p.xp || 0),
              isPaid: existing.isPaid || p.isPaid,
              isAmbassador: p.isAmbassador !== undefined ? p.isAmbassador : existing.isAmbassador,
              affiliateCode: p.affiliateCode || existing.affiliateCode || '',
              emailVerified: existing.emailVerified || p.emailVerified,
              discountPercent: p.discountPercent || existing.discountPercent || (p.referredBy ? 5 : 0),
              appliedPromoCode: p.appliedPromoCode || existing.appliedPromoCode || p.referredBy || undefined
            };
            rosterMap.set(normKey, merged);
          } else {
            rosterMap.set(normKey, p);
          }
        }
      }
    }

    // Always guarantee system admin accounts exist in roster map
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
      const normAdminKey = admin.email.toLowerCase().trim();
      if (!rosterMap.has(normAdminKey)) {
        rosterMap.set(normAdminKey, admin);
        saveSupabaseUserProfile(admin);
      } else {
        // Upgrade existing admin row to ensure full admin permissions
        const current = rosterMap.get(normAdminKey)!;
        rosterMap.set(normAdminKey, { ...current, role: 'admin', isPaid: true, emailVerified: true });
      }
    }

    const roster = Array.from(rosterMap.values());

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
 * Check if an email or UID has been purged/deleted by an administrator
 */
export function isAccountPurgedOrDeleted(uidOrEmail: string): boolean {
  if (!uidOrEmail) return false;
  const norm = uidOrEmail.toLowerCase().trim();
  if (isSystemAdminEmail(norm)) return false;

  try {
    const raw = localStorage.getItem('kogla_deleted_users');
    if (raw) {
      const list: string[] = JSON.parse(raw);
      if (list.some(item => item.toLowerCase().trim() === norm)) {
        return true;
      }
    }
  } catch (_) {}
  return false;
}

/**
 * Marks an account as deleted locally and across connected servers
 */
export function markAccountAsDeletedLocally(uidOrEmail: string): void {
  if (!uidOrEmail) return;
  const norm = uidOrEmail.toLowerCase().trim();
  if (isSystemAdminEmail(norm)) return;

  try {
    const raw = localStorage.getItem('kogla_deleted_users');
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(norm)) {
      list.push(norm);
      localStorage.setItem('kogla_deleted_users', JSON.stringify(list));
    }
  } catch (_) {}
}

/**
 * Removes an account from deleted registry when user registers a new account
 */
export function unmarkAccountAsDeleted(email: string): void {
  if (!email) return;
  const norm = email.toLowerCase().trim();
  try {
    const raw = localStorage.getItem('kogla_deleted_users');
    if (raw) {
      const list: string[] = JSON.parse(raw);
      const filtered = list.filter(item => item.toLowerCase().trim() !== norm);
      localStorage.setItem('kogla_deleted_users', JSON.stringify(filtered));
    }
  } catch (_) {}
}

/**
 * Permanently purges a user profile directly from Supabase Database
 */
export async function deleteSupabaseUserProfile(uid: string, email: string): Promise<void> {
  const normEmail = (email || '').toLowerCase().trim();

  // 1. Mark as deleted in local blacklist
  if (normEmail) markAccountAsDeletedLocally(normEmail);
  if (uid) markAccountAsDeletedLocally(uid);

  // 2. Delete from Supabase Database (profiles table)
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

  // 3. Remove from local storage cache
  try {
    const raw = localStorage.getItem('kogla_supabase_users');
    if (raw) {
      const parsed: UserProfile[] = JSON.parse(raw);
      const filtered = parsed.filter(p => p.uid !== uid && (p.email || '').toLowerCase().trim() !== normEmail);
      localStorage.setItem('kogla_supabase_users', JSON.stringify(filtered));
    }
  } catch (_) {}

  // 4. Clear active session if this was the logged-in user
  try {
    const sessionRaw = localStorage.getItem('kogla_active_session');
    if (sessionRaw) {
      const s = JSON.parse(sessionRaw);
      if (s.id === uid || s.uid === uid || (s.email && s.email.toLowerCase().trim() === normEmail)) {
        localStorage.removeItem('kogla_active_session');
        supabase.auth.signOut().catch(() => {});
      }
    }
  } catch (_) {}

  // 5. Background delete from Server API
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



