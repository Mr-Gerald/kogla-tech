/**
 * Centralized Promo Code & Referral Code Validation Engine
 */

export const SYSTEM_PROMO_CODES = [
  'AMBASSADOR',
  'KOGLA5',
  'KOGLA10',
  'SPECIAL5',
  'DISCOUNT5',
  'WELCOME5',
  'MASTER5',
  'STUDENT5',
  'GERALD5'
];

export interface PromoValidationResult {
  isValid: boolean;
  discountPercent: number;
  code: string;
  message: string;
}

/**
 * Validates whether a given promo code or referral code exists.
 * Code is VALID ONLY IF it matches a known system code or an existing affiliate/referral code.
 */
export function validatePromoCode(
  rawCode?: string,
  knownAffiliateCodes: string[] = []
): PromoValidationResult {
  if (!rawCode || !rawCode.trim()) {
    return {
      isValid: false,
      discountPercent: 0,
      code: '',
      message: ''
    };
  }

  const clean = rawCode.trim().toUpperCase();

  // Check against hardcoded system promo codes
  const isSystemCode = SYSTEM_PROMO_CODES.includes(clean);

  // Check against dynamic affiliate/referral codes from database/roster
  const isAffiliateCode = knownAffiliateCodes
    .filter(Boolean)
    .map(c => c.trim().toUpperCase())
    .includes(clean);

  if (isSystemCode || isAffiliateCode) {
    return {
      isValid: true,
      discountPercent: 5,
      code: clean,
      message: `Referral / Promo code ${clean} applied (5% discount active).`
    };
  }

  return {
    isValid: false,
    discountPercent: 0,
    code: clean,
    message: `Invalid promo code "${clean}". Please enter a valid referral or promo code.`
  };
}

/**
 * Helper to calculate discounted price with 5% off
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercent: number = 0): { original: number; final: number; isDiscounted: boolean; saved: number } {
  if (!discountPercent || discountPercent <= 0) {
    return { original: originalPrice, final: originalPrice, isDiscounted: false, saved: 0 };
  }
  const factor = (100 - discountPercent) / 100;
  const final = Math.round(originalPrice * factor);
  const saved = originalPrice - final;
  return { original: originalPrice, final, isDiscounted: true, saved };
}
