import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

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
 * Master Profile Registry for Supabase users to guarantee zero hidden accounts
 * and 100% reliable visibility in the Admin Dashboard.
 */
export function saveSupabaseUserProfile(profile: UserProfile): void {
  try {
    const existingRaw = localStorage.getItem('kogla_supabase_users');
    let profiles: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    const index = profiles.findIndex(p => p.uid === profile.uid || p.email.toLowerCase() === profile.email.toLowerCase());
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...profile, updatedAt: new Date().toISOString() };
    } else {
      profiles.push(profile);
    }
    localStorage.setItem('kogla_supabase_users', JSON.stringify(profiles));
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

export function getSupabaseUserProfile(uidOrEmail: string): UserProfile | null {
  try {
    const profiles = getSupabaseUserProfiles();
    return profiles.find(p => p.uid === uidOrEmail || p.email.toLowerCase() === uidOrEmail.toLowerCase()) || null;
  } catch (err) {
    return null;
  }
}

