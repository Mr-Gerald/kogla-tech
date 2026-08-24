import { createClient } from '@supabase/supabase-js';

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
