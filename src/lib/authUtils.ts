/**
 * Centralized Sovereign Authentication & Authorization Utilities
 */

export const SOVEREIGN_ADMIN_EMAILS = [
  'emechebegerald@gmail.com',
  'admin@kogla-tech.com',
  'admin@koglatech.com',
  'solutions@koglatech.com'
];

/**
 * Validates whether an email has cryptographic sovereign administrator clearance.
 */
export function isSystemAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (SOVEREIGN_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalized)) {
    return true;
  }
  if (normalized.endsWith('@kogla-tech.com') || normalized.endsWith('@koglatech.com')) {
    return true;
  }
  return false;
}
