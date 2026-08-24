import { ReferralLead, AffiliatePartner } from '../types';
import { safeFirestoreWrite, safeFirestoreRead, db } from './firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, orderBy } from 'firebase/firestore';

const REF_STORAGE_KEY = 'kogla_referral_code';
const REF_TIMESTAMP_KEY = 'kogla_referral_timestamp';
const ATTRIBUTION_DAYS = 30;

// Default pre-seeded affiliate partners (Phena, etc.)
export const DEFAULT_AFFILIATES: AffiliatePartner[] = [
  {
    id: 'aff-phena',
    code: 'PHENA',
    name: 'Phena (Her Tech)',
    email: 'phena_designs@instagram.com',
    instagramHandle: '@phena_designs',
    tier: 1,
    baseRate: 6,
    boostedRate: 10,
    discountOffered: 5,
    totalReferrals: 0,
    confirmedCount: 0,
    totalEarned: 0,
    totalPaidOut: 0,
    pendingPayout: 0,
    contractSigned: true,
    contractSignedDate: '2026-08-23',
    createdAt: new Date().toISOString()
  }
];

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
