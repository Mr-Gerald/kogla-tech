import { AffiliatePartner, ReferralLead } from '../types';
import { supabase, getSupabaseUserProfiles } from './supabase';

const LOCAL_AFFILIATES_KEY = 'kogla_affiliates_cache';
const LOCAL_REFERRALS_KEY = 'kogla_referrals_cache';

function getCachedAffiliates(): AffiliatePartner[] {
  try {
    const raw = localStorage.getItem(LOCAL_AFFILIATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Filter out any stale mock/test data
      const cleaned = parsed.filter((a: any) => 
        a.code !== 'SHIRLEY' && 
        a.id !== 'aff-shirley' &&
        !(a.code === 'PHENA' && (a.email?.includes('instagram.com') || a.name?.includes('Her Tech')))
      );
      return cleaned;
    }
  } catch (_) {}
  return [];
}

function saveCachedAffiliates(affiliates: AffiliatePartner[]) {
  try {
    localStorage.setItem(LOCAL_AFFILIATES_KEY, JSON.stringify(affiliates));
  } catch (_) {}
}

function getCachedReferrals(): ReferralLead[] {
  try {
    const raw = localStorage.getItem(LOCAL_REFERRALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleaned = parsed.filter((r: any) => 
        r.affiliateCode !== 'SHIRLEY' && 
        !r.id?.startsWith('ref-demo-') &&
        r.studentEmail !== 'eechebegerald@gmail.com' &&
        r.studentName !== 'DGS' &&
        !(r.affiliateCode === 'PHENA' && r.studentName === 'DGS')
      );
      return cleaned;
    }
  } catch (_) {}
  return [];
}

function saveCachedReferrals(referrals: ReferralLead[]) {
  try {
    localStorage.setItem(LOCAL_REFERRALS_KEY, JSON.stringify(referrals));
  } catch (_) {}
}

/**
 * Get an affiliate partner by their unique code
 */
export async function getAffiliateByCode(code: string): Promise<AffiliatePartner | null> {
  const normCode = code.trim().toUpperCase();
  const cached = getCachedAffiliates();
  const foundInCache = cached.find(a => a.code.toUpperCase() === normCode);
  if (foundInCache) return foundInCache;

  // Check user roster from Supabase cache
  try {
    const userProfiles = getSupabaseUserProfiles();
    const matchUser = userProfiles.find(u => 
      (u.affiliateCode && u.affiliateCode.toUpperCase() === normCode) ||
      getUserReferralCode(u, u.uid).toUpperCase() === normCode
    );
    if (matchUser) {
      return {
        id: matchUser.uid,
        code: normCode,
        name: matchUser.name || 'Ambassador Partner',
        email: matchUser.email || '',
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
        contractSignedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  } catch (_) {}

  // Fetch from Supabase
  try {
    const { data } = await supabase
      .from('affiliates')
      .select('*')
      .eq('code', normCode)
      .single();
    if (data) {
      return {
        id: data.id,
        code: data.code,
        name: data.name,
        email: data.email,
        instagramHandle: data.instagram_handle || data.instagramHandle,
        tier: data.tier || 1,
        baseRate: data.base_rate || data.baseRate || 6,
        boostedRate: data.boosted_rate || data.boostedRate || 10,
        discountOffered: data.discount_offered || data.discountOffered || 5,
        totalReferrals: data.total_referrals || data.totalReferrals || 0,
        confirmedCount: data.confirmed_count || data.confirmedCount || 0,
        totalEarned: data.total_earned || data.totalEarned || 0,
        totalPaidOut: data.total_paid_out || data.totalPaidOut || 0,
        pendingPayout: data.pending_payout || data.pendingPayout || 0,
        contractSigned: data.contract_signed ?? true,
        contractSignedDate: data.contract_signed_date || data.contractSignedDate,
        createdAt: data.created_at || data.createdAt,
        updatedAt: data.updated_at || data.updatedAt
      };
    }
  } catch (_) {}

  return null;
}

/**
 * Fetch all registered affiliate partners (for Admin)
 */
export async function getAllAffiliates(): Promise<AffiliatePartner[]> {
  const partnerMap = new Map<string, AffiliatePartner>();

  // 1. Load from local cache
  const cached = getCachedAffiliates();
  for (const c of cached) {
    if (c.code) partnerMap.set(c.code.toUpperCase().trim(), c);
  }

  // 2. Load from Express server disk store
  try {
    const res = await fetch('/api/affiliates');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.affiliates)) {
        for (const a of data.affiliates) {
          if (a.code) partnerMap.set(a.code.toUpperCase().trim(), a);
        }
      }
    }
  } catch (_) {}

  // 3. Load from User Roster (Supabase database / local storage)
  try {
    const userProfiles = getSupabaseUserProfiles();
    for (const u of userProfiles) {
      if (u.isAmbassador === true || u.role === 'affiliate') {
        const code = (u.affiliateCode || getUserReferralCode(u, u.uid)).toUpperCase().trim();
        if (code) {
          const existing = partnerMap.get(code);
          const synthesized: AffiliatePartner = {
            id: u.uid || `part_${code}`,
            code: code,
            name: u.name || u.email?.split('@')[0] || 'Ambassador Partner',
            email: u.email || '',
            instagramHandle: (u as any).instagramHandle || existing?.instagramHandle,
            tier: existing?.tier || 1,
            baseRate: existing?.baseRate || 6,
            boostedRate: existing?.boostedRate || 10,
            discountOffered: existing?.discountOffered || 5,
            totalReferrals: existing?.totalReferrals || 0,
            confirmedCount: existing?.confirmedCount || 0,
            totalEarned: existing?.totalEarned || 0,
            totalPaidOut: existing?.totalPaidOut || 0,
            pendingPayout: existing?.pendingPayout || 0,
            contractSigned: true,
            contractSignedDate: existing?.contractSignedDate || u.createdAt || new Date().toISOString(),
            createdAt: existing?.createdAt || u.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          partnerMap.set(code, { ...existing, ...synthesized });
        }
      }
    }
  } catch (_) {}

  // 4. Load from Supabase Database
  try {
    const { data } = await supabase.from('affiliates').select('*');
    if (data && Array.isArray(data)) {
      for (const d of data) {
        if (d.code) {
          const normCode = d.code.toUpperCase().trim();
          partnerMap.set(normCode, {
            ...partnerMap.get(normCode),
            id: d.id,
            code: normCode,
            name: d.name,
            email: d.email,
            instagramHandle: d.instagram_handle || d.instagramHandle,
            tier: d.tier || 1,
            baseRate: d.base_rate || d.baseRate || 6,
            boostedRate: d.boosted_rate || d.boostedRate || 10,
            discountOffered: d.discount_offered || d.discountOffered || 5,
            totalReferrals: d.total_referrals || d.totalReferrals || 0,
            confirmedCount: d.confirmed_count || d.confirmedCount || 0,
            totalEarned: d.total_earned || d.totalEarned || 0,
            totalPaidOut: d.total_paid_out || d.totalPaidOut || 0,
            pendingPayout: d.pending_payout || d.pendingPayout || 0,
            contractSigned: d.contract_signed ?? true,
            contractSignedDate: d.contract_signed_date || d.contractSignedDate,
            createdAt: d.created_at || d.createdAt,
            updatedAt: d.updated_at || d.updatedAt
          });
        }
      }
    }
  } catch (_) {}

  const finalAffiliates = Array.from(partnerMap.values());
  saveCachedAffiliates(finalAffiliates);
  return finalAffiliates;
}

/**
 * Fetch all referrals for a specific affiliate code
 */
export async function getReferralsByCode(code: string): Promise<ReferralLead[]> {
  const normCode = code.trim().toUpperCase();
  const allRefs = await getAllReferrals();
  return allRefs.filter(r => r.affiliateCode.toUpperCase() === normCode);
}

/**
 * Fetch all referrals across the platform (for Admin)
 */
export async function getAllReferrals(): Promise<ReferralLead[]> {
  const referralMap = new Map<string, ReferralLead>();

  // 1. Load local cache
  const cached = getCachedReferrals();
  for (const r of cached) {
    if (r.id) referralMap.set(r.id, r);
  }

  // 2. Load from Supabase DB
  try {
    const { data } = await supabase.from('referrals').select('*');
    if (data && Array.isArray(data) && data.length > 0) {
      for (const d of data) {
        const item: ReferralLead = {
          id: d.id,
          affiliateCode: (d.affiliate_code || d.affiliateCode || '').toUpperCase().trim(),
          studentName: d.student_name || d.studentName || 'Student',
          studentEmail: d.student_email || d.studentEmail || '',
          studentPhone: d.student_phone || d.studentPhone || '',
          courseTitle: d.course_title || d.courseTitle || 'Account Registration',
          mode: d.mode || 'online',
          tuitionAmount: d.tuition_amount || d.tuitionAmount || 250000,
          discountApplied: d.discount_applied || d.discountApplied || 12500,
          discountedAmount: d.discounted_amount || d.discountedAmount || 237500,
          commissionRate: d.commission_rate || d.commissionRate || 6,
          commissionAmount: d.commission_amount || d.commissionAmount || 14250,
          status: d.status || 'confirmed',
          confirmedAt: d.confirmed_at || d.confirmedAt,
          paidAt: d.paid_at || d.paidAt,
          paymentProofNote: d.payment_proof_note || d.paymentProofNote,
          createdAt: d.created_at || d.createdAt || new Date().toISOString()
        };
        referralMap.set(item.id, item);
      }
    }
  } catch (_) {}

  // 3. Auto-heal: Check user profiles for any registered students with referredBy or appliedPromoCode
  try {
    const userProfiles = getSupabaseUserProfiles();
    const existingKeys = new Set(
      Array.from(referralMap.values()).map(r => `${(r.studentEmail || '').toLowerCase().trim()}_${(r.affiliateCode || '').toUpperCase().trim()}`)
    );

    for (const u of userProfiles) {
      const code = (u.appliedPromoCode || u.referredBy || '').toUpperCase().trim();
      if (code && u.email) {
        const normEmail = u.email.toLowerCase().trim();
        const key = `${normEmail}_${code}`;
        if (!existingKeys.has(key)) {
          const leadId = `ref-syn-${u.uid || Math.random().toString(36).substring(2, 7)}`;
          const tuitionAmount = 250000;
          const discountApplied = Math.round(tuitionAmount * 0.05);
          const discountedAmount = tuitionAmount - discountApplied;
          const commissionRate = 6;
          const commissionAmount = Math.round(discountedAmount * 0.06);

          const synLead: ReferralLead = {
            id: leadId,
            affiliateCode: code,
            studentName: u.name || normEmail.split('@')[0],
            studentEmail: normEmail,
            studentPhone: (u as any).phone || '',
            courseTitle: 'Account Registration (Kogla Academy)',
            mode: 'online',
            tuitionAmount,
            discountApplied,
            discountedAmount,
            commissionRate,
            commissionAmount,
            status: 'confirmed',
            confirmedAt: u.createdAt || new Date().toISOString(),
            createdAt: u.createdAt || new Date().toISOString()
          };
          referralMap.set(leadId, synLead);
          existingKeys.add(key);

          // Save to Supabase DB asynchronously
          try {
            supabase.from('referrals').upsert({
              id: leadId,
              affiliate_code: code,
              student_name: synLead.studentName,
              student_email: synLead.studentEmail,
              student_phone: synLead.studentPhone || '',
              course_title: synLead.courseTitle,
              mode: synLead.mode,
              tuition_amount: tuitionAmount,
              discount_applied: discountApplied,
              discounted_amount: discountedAmount,
              commission_rate: commissionRate,
              commission_amount: commissionAmount,
              status: 'confirmed',
              confirmed_at: synLead.confirmedAt,
              created_at: synLead.createdAt
            }).then(() => {});
          } catch (_) {}
        }
      }
    }
  } catch (_) {}

  const finalReferrals = Array.from(referralMap.values());
  finalReferrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  saveCachedReferrals(finalReferrals);
  return finalReferrals;
}

/**
 * Record a new student referral lead (when a student signs up or submits enrollment with promo code)
 */
export async function createReferralLead(params: {
  affiliateCode: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseTitle: string;
  mode: 'online' | 'physical';
  tuitionAmount: number;
}): Promise<ReferralLead> {
  const normCode = params.affiliateCode.trim().toUpperCase();
  const partner = await getAffiliateByCode(normCode);

  if (partner && partner.email && params.studentEmail.toLowerCase().trim() === partner.email.toLowerCase().trim()) {
    throw new Error('Self-referrals are strictly prohibited under the Kogla Ambassador Terms & Conditions. You cannot refer yourself.');
  }

  const discountPercent = partner?.discountOffered || 5;
  const discountApplied = Math.round((params.tuitionAmount * discountPercent) / 100);
  const discountedAmount = params.tuitionAmount - discountApplied;

  // Determine current rate: Tier 2 (10%) if confirmedCount >= 3, otherwise Tier 1 (6%)
  const confirmedCount = partner?.confirmedCount || 0;
  const commissionRate = confirmedCount >= 3 ? 10 : 6;
  const commissionAmount = Math.round((discountedAmount * commissionRate) / 100);

  const leadId = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newLead: ReferralLead = {
    id: leadId,
    affiliateCode: normCode,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    studentPhone: params.studentPhone || '',
    courseTitle: params.courseTitle,
    mode: params.mode,
    tuitionAmount: params.tuitionAmount,
    discountApplied,
    discountedAmount,
    commissionRate,
    commissionAmount,
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  // Update local cache
  const cached = getCachedReferrals();
  const existingIdx = cached.findIndex(r => r.studentEmail.toLowerCase() === params.studentEmail.toLowerCase() && r.affiliateCode.toUpperCase() === normCode);
  let updatedReferrals: ReferralLead[];
  if (existingIdx !== -1) {
    cached[existingIdx] = { ...cached[existingIdx], ...newLead };
    updatedReferrals = [...cached];
  } else {
    updatedReferrals = [newLead, ...cached];
  }
  saveCachedReferrals(updatedReferrals);

  // Update partner total referrals in cache
  const cachedAffiliates = getCachedAffiliates();
  const updatedAffiliates = cachedAffiliates.map(a => {
    if (a.code.toUpperCase() === normCode) {
      return {
        ...a,
        totalReferrals: (a.totalReferrals || 0) + 1,
        confirmedCount: (a.confirmedCount || 0) + 1,
        totalEarned: (a.totalEarned || 0) + commissionAmount
      };
    }
    return a;
  });
  saveCachedAffiliates(updatedAffiliates);

  // Save to Supabase
  try {
    await supabase.from('referrals').upsert({
      id: leadId,
      affiliate_code: normCode,
      student_name: params.studentName,
      student_email: params.studentEmail,
      student_phone: params.studentPhone || '',
      course_title: params.courseTitle,
      mode: params.mode,
      tuition_amount: params.tuitionAmount,
      discount_applied: discountApplied,
      discounted_amount: discountedAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: 'confirmed',
      confirmed_at: newLead.confirmedAt,
      created_at: newLead.createdAt
    });
  } catch (_) {}

  return newLead;
}

/**
 * Admin Action: Approve student payment and confirm enrollment.
 */
export async function approveReferralPayment(leadId: string, paymentProofNote?: string): Promise<boolean> {
  const referrals = getCachedReferrals();
  const leadIndex = referrals.findIndex(r => r.id === leadId);
  if (leadIndex === -1) return false;

  const lead = referrals[leadIndex];
  if (lead.status === 'confirmed' || lead.status === 'paid_out') return true;

  // Mark lead confirmed
  lead.status = 'confirmed';
  lead.confirmedAt = new Date().toISOString();
  if (paymentProofNote) lead.paymentProofNote = paymentProofNote;
  referrals[leadIndex] = lead;
  saveCachedReferrals(referrals);

  // Update affiliate partner stats
  const affiliates = getCachedAffiliates();
  const affIndex = affiliates.findIndex(a => a.code.toUpperCase() === lead.affiliateCode.toUpperCase());
  if (affIndex !== -1) {
    const partner = affiliates[affIndex];
    const newConfirmedCount = (partner.confirmedCount || 0) + 1;
    const newTotalEarned = (partner.totalEarned || 0) + lead.commissionAmount;
    const newPendingPayout = (partner.pendingPayout || 0) + lead.commissionAmount;
    const newTier: 1 | 2 = newConfirmedCount >= 3 ? 2 : 1;

    affiliates[affIndex] = {
      ...partner,
      confirmedCount: newConfirmedCount,
      totalEarned: newTotalEarned,
      pendingPayout: newPendingPayout,
      tier: newTier,
      updatedAt: new Date().toISOString()
    };
    saveCachedAffiliates(affiliates);
  }

  // Update Supabase
  try {
    await supabase.from('referrals').update({
      status: 'confirmed',
      confirmed_at: lead.confirmedAt,
      payment_proof_note: lead.paymentProofNote || ''
    }).eq('id', leadId);
  } catch (_) {}

  return true;
}

/**
 * Admin Action: Mark affiliate commission as paid out to creator's bank account
 */
export async function markReferralPaidOut(leadId: string): Promise<boolean> {
  const referrals = getCachedReferrals();
  const lead = referrals.find(r => r.id === leadId);
  if (!lead || lead.status !== 'confirmed') return false;

  lead.status = 'paid_out';
  lead.paidAt = new Date().toISOString();
  saveCachedReferrals(referrals);

  const affiliates = getCachedAffiliates();
  const partner = affiliates.find(a => a.code.toUpperCase() === lead.affiliateCode.toUpperCase());
  if (partner) {
    partner.pendingPayout = Math.max(0, (partner.pendingPayout || 0) - lead.commissionAmount);
    partner.totalPaidOut = (partner.totalPaidOut || 0) + lead.commissionAmount;
    saveCachedAffiliates(affiliates);
  }

  try {
    await supabase.from('referrals').update({
      status: 'paid_out',
      paid_at: lead.paidAt
    }).eq('id', leadId);
  } catch (_) {}

  return true;
}

/**
 * Delete a single referral lead (Admin action)
 */
export async function deleteReferralLead(leadId: string): Promise<boolean> {
  const referrals = getCachedReferrals().filter(r => r.id !== leadId);
  saveCachedReferrals(referrals);

  try {
    await supabase.from('referrals').delete().eq('id', leadId);
  } catch (_) {}

  return true;
}

/**
 * Delete an affiliate partner by promo code (Admin action)
 */
export async function deleteAffiliatePartner(code: string): Promise<boolean> {
  const normCode = code.trim().toUpperCase();
  const affiliates = getCachedAffiliates().filter(a => a.code.toUpperCase() !== normCode);
  saveCachedAffiliates(affiliates);

  try {
    fetch('/api/affiliates/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normCode })
    }).catch(() => {});
  } catch (_) {}

  try {
    await supabase.from('affiliates').delete().eq('code', normCode);
  } catch (_) {}

  return true;
}

/**
 * Purge all mock/test referral leads and test affiliates from local cache and Supabase
 */
export async function purgeAllTestReferralsAndAffiliates(): Promise<boolean> {
  // Clear local storage
  localStorage.removeItem(LOCAL_AFFILIATES_KEY);
  localStorage.removeItem(LOCAL_REFERRALS_KEY);

  try {
    await supabase.from('affiliates').delete().in('code', ['PHENA', 'SHIRLEY']);
    await supabase.from('referrals').delete().in('affiliate_code', ['PHENA', 'SHIRLEY']);
  } catch (_) {}

  return true;
}

/**
 * Create or update an Affiliate Partner profile
 */
export async function saveAffiliatePartner(partner: AffiliatePartner): Promise<boolean> {
  const affiliates = getCachedAffiliates();
  const normCode = partner.code.trim().toUpperCase();
  const partnerToSave: AffiliatePartner = {
    ...partner,
    code: normCode,
    updatedAt: new Date().toISOString()
  };

  const existingIdx = affiliates.findIndex(a => 
    a.code.toUpperCase() === normCode || 
    (a.id && partner.id && a.id === partner.id) ||
    (a.email && partner.email && a.email.toLowerCase() === partner.email.toLowerCase())
  );

  if (existingIdx !== -1) {
    affiliates[existingIdx] = partnerToSave;
  } else {
    affiliates.push({ ...partnerToSave, createdAt: partner.createdAt || new Date().toISOString() });
  }
  saveCachedAffiliates(affiliates);

  // Sync to Express backend disk persistence
  try {
    fetch('/api/affiliates/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner: partnerToSave })
    }).catch(() => {});
  } catch (_) {}

  // Sync to Supabase
  try {
    await supabase.from('affiliates').upsert({
      id: partnerToSave.id,
      code: partnerToSave.code,
      name: partnerToSave.name,
      email: partnerToSave.email,
      instagram_handle: partnerToSave.instagramHandle,
      tier: partnerToSave.tier,
      base_rate: partnerToSave.baseRate,
      boosted_rate: partnerToSave.boostedRate,
      discount_offered: partnerToSave.discountOffered,
      total_referrals: partnerToSave.totalReferrals,
      confirmed_count: partnerToSave.confirmedCount,
      total_earned: partnerToSave.totalEarned,
      total_paid_out: partnerToSave.totalPaidOut,
      pending_payout: partnerToSave.pendingPayout,
      contract_signed: partnerToSave.contractSigned,
      contract_signed_date: partnerToSave.contractSignedDate,
      created_at: partnerToSave.createdAt,
      updated_at: partnerToSave.updatedAt
    });
  } catch (_) {}

  return true;
}

/**
 * Formats a promo code input to enforce uppercase letters and at most 2 trailing numbers.
 */
export function formatPromoCodeInput(input: string): string {
  if (!input) return '';
  const upper = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const letters = upper.replace(/[0-9]/g, '').slice(0, 10);
  const numbers = upper.replace(/[^0-9]/g, '').slice(0, 2);
  return `${letters}${numbers}`;
}

/**
 * Validates whether a promo code satisfies the requirement of letters with at most 2 numbers.
 */
export function isValidPromoCode(code: string): boolean {
  if (!code) return false;
  const norm = code.trim().toUpperCase();
  return /^[A-Z]{2,12}[0-9]{0,2}$/.test(norm);
}

/**
 * Generates or retrieves a unique referral code for a user based on nickname, IG/social handle, or name with max 2 numbers.
 */
export function getUserReferralCode(profile?: any, uid?: string): string {
  if (profile?.affiliateCode) return profile.affiliateCode;
  if (profile?.referralCode) return profile.referralCode;

  // Extract from nickname, IG handle, social handle, or name
  const rawCandidate = 
    profile?.nickname || 
    profile?.instagramHandle || 
    profile?.socialHandle || 
    profile?.handle || 
    profile?.name ||
    '';

  const cleanLetters = rawCandidate.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
  const nameBase = cleanLetters.length >= 2 ? cleanLetters : (uid ? uid.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase() : 'KOGLA');
  const safeBase = nameBase.length >= 2 ? nameBase : 'KOGLA';

  const seed = uid ? uid.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 90);
  const rand2 = 10 + (seed % 90);
  return `${safeBase}${rand2}`;
}
