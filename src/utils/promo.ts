/**
 * Centralized Promo Code & Referral Code Validation Engine
 */

export const SPECIAL_PROMO_DISCOUNTS: Record<string, { percent: number; label: string }> = {
  'KOGLA21': { percent: 20, label: 'Early Bird 20% Discount' },
  'KOGLA20': { percent: 20, label: 'Early Bird 20% Discount' },
  'EARLYBIRD': { percent: 20, label: 'Early Bird 20% Discount' },
};

export const SYSTEM_PROMO_CODES = [
  'AMBASSADOR',
  'KOGLA5',
  'KOGLA10',
  'KOGLA21',
  'KOGLA20',
  'EARLYBIRD',
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
    const special = SPECIAL_PROMO_DISCOUNTS[clean];
    const discountPercent = special ? special.percent : (clean.includes('10') ? 10 : 5);
    const label = special ? special.label : `${discountPercent}% discount active`;

    return {
      isValid: true,
      discountPercent,
      code: clean,
      message: `Promo code ${clean} applied (${label}).`
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
