import { AffiliatePartner } from '../types';

const REF_STORAGE_KEY = 'kogla_referral_code';
const REF_TIMESTAMP_KEY = 'kogla_referral_timestamp';
const ATTRIBUTION_DAYS = 30;

// Default affiliate partners (empty until real creators register)
export const DEFAULT_AFFILIATES: AffiliatePartner[] = [];

/**
 * Captures ?ref=... or ?promo=... from current URL query parameters and persists in localStorage.
 */
export function captureUrlReferral(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('promo') || urlParams.get('code');

    if (refCode && refCode.trim() !== '') {
      const cleanCode = refCode.trim().toUpperCase();
      localStorage.setItem(REF_STORAGE_KEY, cleanCode);
      localStorage.setItem(REF_TIMESTAMP_KEY, Date.now().toString());
      return cleanCode;
    }
  } catch (err) {
    console.warn('[ReferralTracker] Error parsing referral from URL:', err);
  }

  return getActiveReferralCode();
}

/**
 * Returns the currently active cached referral code if within the 30-day attribution window.
 */
export function getActiveReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const code = localStorage.getItem(REF_STORAGE_KEY);
    const timestampStr = localStorage.getItem(REF_TIMESTAMP_KEY);

    if (!code) return null;

    if (timestampStr) {
      const timestamp = parseInt(timestampStr, 10);
      const daysDiff = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (daysDiff > ATTRIBUTION_DAYS) {
        // Expired after 30 days
        localStorage.removeItem(REF_STORAGE_KEY);
        localStorage.removeItem(REF_TIMESTAMP_KEY);
        return null;
      }
    }

    return code.toUpperCase();
  } catch (_) {
    return null;
  }
}

/**
 * Manually set or clear referral code
 */
export function setManualReferralCode(code: string) {
  if (typeof window === 'undefined') return;
  if (!code) {
    localStorage.removeItem(REF_STORAGE_KEY);
    localStorage.removeItem(REF_TIMESTAMP_KEY);
  } else {
    localStorage.setItem(REF_STORAGE_KEY, code.trim().toUpperCase());
    localStorage.setItem(REF_TIMESTAMP_KEY, Date.now().toString());
  }
}
