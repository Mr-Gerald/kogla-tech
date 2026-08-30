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
 * Generate a deterministic ID for a referral lead based on student email and promo code
 */
export function getDeterministicReferralId(studentEmail: string, promoCode: string): string {
  const cleanEmail = (studentEmail || '').toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '');
  const cleanCode = (promoCode || '').toUpperCase().trim().replace(/[^a-zA-Z0-9]/g, '');
  return `ref-student-${cleanEmail}-${cleanCode}`;
}

/**
 * Get an affiliate partner by their unique code
 */
export async function getAffiliateByCode(code: string): Promise<AffiliatePartner | null> {
  const normCode = code.trim().toUpperCase();
  const cached = getCachedAffiliates();
  const foundInCache = cached.find(a => a.code.toUpperCase() === normCode);
  if (foundInCache) return foundInCache;

  // 1. Fetch from Supabase Database (Postgres)
  try {
    const { data } = await supabase
      .from('affiliates')
      .select('*')
      .eq('code', normCode)
      .maybeSingle();

    if (data) {
      let bankDetails: any = undefined;
      if (data.bank_name || data.account_number || data.account_name) {
        bankDetails = {
          bankName: data.bank_name || '',
          accountNumber: data.account_number || '',
          accountName: data.account_name || ''
        };
      }
      return {
        id: data.code,
        code: data.code,
        name: data.name,
        email: data.email,
        instagramHandle: data.instagram_handle || undefined,
        tier: Number(data.total_confirmed) >= 3 ? 2 : 1,
        baseRate: Number(data.tier1_rate) || 6,
        boostedRate: Number(data.tier2_rate) || 10,
        discountOffered: Number(data.student_discount_rate) || 5,
        totalReferrals: Number(data.total_leads) || 0,
        confirmedCount: Number(data.total_confirmed) || 0,
        totalEarned: Number(data.total_earned) || 0,
        totalPaidOut: Number(data.total_paid) || 0,
        pendingPayout: Math.max(0, (Number(data.total_earned) || 0) - (Number(data.total_paid) || 0)),
        bankDetails,
        contractSigned: true,
        contractSignedDate: data.created_at || new Date().toISOString(),
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    }
  } catch (_) {}

  // 2. Check user roster from Supabase profiles
  try {
    const userProfiles = getSupabaseUserProfiles();
    const matchUser = userProfiles.find(u => 
      (u.affiliateCode && u.affiliateCode.toUpperCase() === normCode) ||
      getUserReferralCode(u, u.uid).toUpperCase() === normCode
    );
    if (matchUser) {
      const bankDetails = (matchUser as any).bankDetails || undefined;
      return {
        id: matchUser.uid,
        code: normCode,
        name: matchUser.name || 'Ambassador Partner',
        email: matchUser.email || '',
        instagramHandle: (matchUser as any).instagramHandle,
        tier: 1,
        baseRate: 6,
        boostedRate: 10,
        discountOffered: 5,
        totalReferrals: 0,
        confirmedCount: 0,
        totalEarned: 0,
        totalPaidOut: 0,
        pendingPayout: 0,
        bankDetails,
        contractSigned: true,
        contractSignedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  } catch (_) {}

  return null;
}

/**
 * Fetch all registered affiliate partners (for Admin & Dashboard)
 */
export async function getAllAffiliates(): Promise<AffiliatePartner[]> {
  const partnerMap = new Map<string, AffiliatePartner>();

  // 1. Primary Source of Truth: Supabase PostgreSQL Database
  try {
    const { data } = await supabase.from('affiliates').select('*');
    if (data && Array.isArray(data)) {
      for (const d of data) {
        if (d.code) {
          const normCode = d.code.toUpperCase().trim();
          if (normCode === 'SHIRLEY') continue;
          let bankDetails: any = undefined;
          if (d.bank_name || d.account_number || d.account_name) {
            bankDetails = {
              bankName: d.bank_name || '',
              accountNumber: d.account_number || '',
              accountName: d.account_name || ''
            };
          }
          partnerMap.set(normCode, {
            id: d.code,
            code: normCode,
            name: d.name,
            email: d.email,
            instagramHandle: d.instagram_handle || undefined,
            tier: Number(d.total_confirmed) >= 3 ? 2 : 1,
            baseRate: Number(d.tier1_rate) || 6,
            boostedRate: Number(d.tier2_rate) || 10,
            discountOffered: Number(d.student_discount_rate) || 5,
            totalReferrals: Number(d.total_leads) || 0,
            confirmedCount: Number(d.total_confirmed) || 0,
            totalEarned: Number(d.total_earned) || 0,
            totalPaidOut: Number(d.total_paid) || 0,
            pendingPayout: Math.max(0, (Number(d.total_earned) || 0) - (Number(d.total_paid) || 0)),
            bankDetails,
            contractSigned: true,
            contractSignedDate: d.created_at || new Date().toISOString(),
            createdAt: d.created_at || new Date().toISOString(),
            updatedAt: d.updated_at || new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Affiliates] Error loading from Supabase:', err);
  }

  // 2. Load from User Profiles in Supabase
  try {
    const userProfiles = getSupabaseUserProfiles();
    for (const u of userProfiles) {
      if (u.isAmbassador === true || u.role === 'affiliate' || (u.affiliateCode && u.affiliateCode.trim())) {
        const code = (u.affiliateCode || getUserReferralCode(u, u.uid)).toUpperCase().trim();
        if (code && code !== 'SHIRLEY') {
          const existing = partnerMap.get(code);
          const bankDetails = existing?.bankDetails || (u as any).bankDetails || undefined;
          const partnerObj: AffiliatePartner = {
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
            bankDetails,
            contractSigned: true,
            contractSignedDate: existing?.contractSignedDate || u.createdAt || new Date().toISOString(),
            createdAt: existing?.createdAt || u.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          partnerMap.set(code, partnerObj);

          // Guarantee this ambassador is persisted in Supabase affiliates table
          if (!existing) {
            supabase.from('affiliates').upsert({
              code: code,
              name: partnerObj.name,
              email: partnerObj.email,
              instagram_handle: partnerObj.instagramHandle || null,
              bank_name: bankDetails?.bankName || null,
              account_number: bankDetails?.accountNumber || null,
              account_name: bankDetails?.accountName || null,
              tier1_rate: 6,
              tier2_rate: 10,
              student_discount_rate: 5,
              total_leads: 0,
              total_confirmed: 0,
              total_earned: 0,
              total_paid: 0,
              status: 'active',
              updated_at: new Date().toISOString()
            }).then(() => {});
          }
        }
      }
    }
  } catch (_) {}

  // 3. Load from local cache for any unsynced fields
  const cached = getCachedAffiliates();
  for (const c of cached) {
    if (c.code && !partnerMap.has(c.code.toUpperCase().trim())) {
      partnerMap.set(c.code.toUpperCase().trim(), c);
    } else if (c.code && partnerMap.has(c.code.toUpperCase().trim())) {
      const existing = partnerMap.get(c.code.toUpperCase().trim())!;
      if (!existing.bankDetails && c.bankDetails) {
        existing.bankDetails = c.bankDetails;
      }
    }
  }

  const finalAffiliates = Array.from(partnerMap.values());

  // 4. Dynamically compute live referral statistics
  try {
    const allRefs = await getAllReferrals();
    for (const partner of finalAffiliates) {
      const partnerCodeNorm = partner.code.toUpperCase().trim();
      const partnerRefs = allRefs.filter(r => (r.affiliateCode || '').toUpperCase().trim() === partnerCodeNorm);

      const totalReferrals = partnerRefs.length;
      const confirmedLeads = partnerRefs.filter(r => r.status === 'confirmed' || r.status === 'paid_out');
      const confirmedCount = confirmedLeads.length;
      const totalEarned = confirmedLeads.reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
      const totalPaidOut = partnerRefs.filter(r => r.status === 'paid_out').reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
      const pendingPayout = partnerRefs.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + (r.commissionAmount || 0), 0);

      partner.totalReferrals = totalReferrals;
      partner.confirmedCount = confirmedCount;
      partner.totalEarned = totalEarned;
      partner.totalPaidOut = totalPaidOut;
      partner.pendingPayout = pendingPayout;
      partner.tier = confirmedCount >= 3 ? 2 : 1;
    }
  } catch (_) {}

  saveCachedAffiliates(finalAffiliates);
  return finalAffiliates;
}

/**
 * Fetch all referrals for a specific affiliate code
 */
export async function getReferralsByCode(code: string): Promise<ReferralLead[]> {
  const normCode = code.trim().toUpperCase();
  const allRefs = await getAllReferrals();
  return allRefs.filter(r => (r.affiliateCode || '').toUpperCase().trim() === normCode);
}

/**
 * Fetch all referrals across the platform (for Admin & Creators)
 * Single Source of Truth: Supabase Postgres DB with real-time profile reconciliation
 */
export async function getAllReferrals(): Promise<ReferralLead[]> {
  const referralMap = new Map<string, ReferralLead>();

  // 1. Primary Source of Truth: Supabase PostgreSQL Database (referrals table)
  try {
    const { data } = await supabase.from('referrals').select('*');
    if (data && Array.isArray(data) && data.length > 0) {
      for (const d of data) {
        const promoCode = (d.promo_code || d.affiliate_code || '').toUpperCase().trim();
        if (promoCode === 'SHIRLEY') continue;
        const studentEmail = (d.lead_email || d.student_email || '').toLowerCase().trim();
        if (studentEmail === 'eechebegerald@gmail.com') continue;

        const tuitionAmount = Number(d.price) || 250000;
        const discountApplied = Number(d.discount_applied) || Math.round(tuitionAmount * 0.05);
        const discountedAmount = Number(d.final_price) || (tuitionAmount - discountApplied);
        const commissionRate = Number(d.commission_tier) === 2 ? 10 : 6;
        const commissionAmount = Number(d.commission_amount) || Math.round(discountedAmount * (commissionRate / 100));

        const item: ReferralLead = {
          id: d.id,
          affiliateCode: promoCode,
          studentName: d.lead_name || 'Student',
          studentEmail: studentEmail,
          studentPhone: d.lead_phone || '',
          courseTitle: d.course_name || 'Full-Stack Web Development',
          mode: (d.format === 'physical' ? 'physical' : 'online'),
          tuitionAmount,
          discountApplied,
          discountedAmount,
          commissionRate,
          commissionAmount,
          status: (d.status === 'confirmed' || d.status === 'paid_out') ? d.status : 'pending',
          confirmedAt: (d.status === 'confirmed' || d.status === 'paid_out') ? d.created_at : undefined,
          paidAt: d.paid_at || undefined,
          paymentProofNote: d.payment_proof_note || undefined,
          createdAt: d.created_at || new Date().toISOString()
        };
        referralMap.set(item.id, item);
      }
    }
  } catch (err) {
    console.warn('[Referrals] Error loading from Supabase:', err);
  }

  // 2. Auto-Reconciliation with Supabase User Profiles
  try {
    const userProfiles = getSupabaseUserProfiles();
    for (const u of userProfiles) {
      const code = (u.appliedPromoCode || u.referredBy || '').toUpperCase().trim();
      if (code && code !== 'SHIRLEY' && u.email) {
        const normEmail = u.email.toLowerCase().trim();
        if (normEmail === 'eechebegerald@gmail.com') continue;
        const deterministicId = getDeterministicReferralId(normEmail, code);

        const existingLead = referralMap.get(deterministicId) || 
          Array.from(referralMap.values()).find(r => r.studentEmail.toLowerCase().trim() === normEmail && r.affiliateCode.toUpperCase().trim() === code);

        const userSpecificTrack = (u as any).enrolledCourse || (u as any).interestTrack || (u as any).courseTitle || existingLead?.courseTitle || 'Full-Stack Web Development';
        const tuitionAmount = 250000;
        const discountApplied = Math.round(tuitionAmount * 0.05);
        const discountedAmount = tuitionAmount - discountApplied;
        const commissionRate = 6;
        const commissionAmount = Math.round(discountedAmount * 0.06);

        // If user is marked paid in profile OR lead was already confirmed/paid_out in Supabase DB
        const isConfirmed = Boolean(u.isPaid) || existingLead?.status === 'confirmed' || existingLead?.status === 'paid_out';
        const status: 'pending' | 'confirmed' | 'paid_out' = existingLead?.status === 'paid_out' ? 'paid_out' : (isConfirmed ? 'confirmed' : 'pending');

        const synLead: ReferralLead = {
          id: existingLead?.id || deterministicId,
          affiliateCode: code,
          studentName: u.name || existingLead?.studentName || normEmail.split('@')[0],
          studentEmail: normEmail,
          studentPhone: (u as any).phone || existingLead?.studentPhone || '',
          courseTitle: userSpecificTrack,
          mode: 'online',
          tuitionAmount,
          discountApplied,
          discountedAmount,
          commissionRate,
          commissionAmount,
          status,
          confirmedAt: isConfirmed ? (existingLead?.confirmedAt || u.createdAt || new Date().toISOString()) : undefined,
          paidAt: existingLead?.paidAt,
          paymentProofNote: existingLead?.paymentProofNote,
          createdAt: existingLead?.createdAt || u.createdAt || new Date().toISOString()
        };

        referralMap.set(synLead.id, synLead);

        // If not in Supabase referrals table or if status differed, sync to Supabase Postgres
        if (!existingLead || existingLead.status !== status) {
          supabase.from('referrals').upsert({
            id: synLead.id,
            promo_code: code,
            lead_name: synLead.studentName,
            lead_email: synLead.studentEmail,
            lead_phone: synLead.studentPhone || null,
            course_name: synLead.courseTitle,
            format: synLead.mode,
            price: tuitionAmount,
            discount_applied: discountApplied,
            final_price: discountedAmount,
            partner_name: code,
            status: synLead.status,
            commission_amount: commissionAmount,
            commission_tier: 1,
            created_at: synLead.createdAt,
            paid_at: synLead.paidAt || null
          }).then(() => {});
        }
      }
    }
  } catch (_) {}

  // 3. Load from Express backend server disk store
  try {
    const res = await fetch('/api/referrals');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.referrals)) {
        for (const r of data.referrals) {
          if (r && r.id && !referralMap.has(r.id)) {
            referralMap.set(r.id, r);
          } else if (r && r.id && referralMap.has(r.id)) {
            const existing = referralMap.get(r.id)!;
            if (r.status === 'confirmed' || r.status === 'paid_out') {
              existing.status = r.status;
              existing.confirmedAt = r.confirmedAt || existing.confirmedAt;
              existing.paidAt = r.paidAt || existing.paidAt;
            }
          }
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

  const leadId = getDeterministicReferralId(params.studentEmail, normCode);
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
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // 1. Update local cache
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

  // 2. Persist to Supabase PostgreSQL Database (referrals table)
  try {
    await supabase.from('referrals').upsert({
      id: leadId,
      promo_code: normCode,
      lead_name: params.studentName,
      lead_email: params.studentEmail,
      lead_phone: params.studentPhone || null,
      course_name: params.courseTitle,
      format: params.mode,
      price: params.tuitionAmount,
      discount_applied: discountApplied,
      final_price: discountedAmount,
      partner_name: partner?.name || normCode,
      status: 'pending',
      commission_amount: commissionAmount,
      commission_tier: commissionRate === 10 ? 2 : 1,
      created_at: newLead.createdAt
    });
  } catch (err) {
    console.warn('[Referrals] Error writing to Supabase:', err);
  }

  // 3. Sync to Express server disk persistence
  try {
    fetch('/api/referrals/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referral: newLead })
    }).catch(() => {});
  } catch (_) {}

  return newLead;
}

/**
 * Admin Action: Approve student payment and confirm enrollment globally.
 * Persists immediately to Supabase Postgres, User Profile, Express Server, and Cache.
 */
export async function approveReferralPayment(leadId: string, paymentProofNote?: string): Promise<boolean> {
  const referrals = await getAllReferrals();
  const leadIndex = referrals.findIndex(r => r.id === leadId);
  const lead = leadIndex !== -1 ? referrals[leadIndex] : null;

  const studentEmail = lead?.studentEmail?.toLowerCase().trim();
  const promoCode = (lead?.affiliateCode || '').toUpperCase().trim();

  // 1. Update in local cache
  if (lead) {
    lead.status = 'confirmed';
    lead.confirmedAt = new Date().toISOString();
    if (paymentProofNote) lead.paymentProofNote = paymentProofNote;
    referrals[leadIndex] = lead;
    saveCachedReferrals(referrals);
  }

  // 2. Update Supabase PostgreSQL Database (referrals table)
  try {
    await supabase.from('referrals').update({
      status: 'confirmed',
      paid_at: null
    }).eq('id', leadId);

    // Also update by email in case ID differed
    if (studentEmail) {
      await supabase.from('referrals').update({
        status: 'confirmed'
      }).ilike('lead_email', studentEmail);
    }
  } catch (err) {
    console.warn('[Supabase DB] Error approving referral in referrals table:', err);
  }

  // 3. Mark the Student's User Profile as `isPaid: true` in Supabase Postgres Profiles Table
  if (studentEmail) {
    try {
      const { data: profs } = await supabase.from('profiles').select('*').ilike('email', studentEmail);
      if (profs && Array.isArray(profs) && profs.length > 0) {
        for (const p of profs) {
          let extra: any = {};
          try {
            if (p.bio && typeof p.bio === 'string' && p.bio.startsWith('{')) {
              extra = JSON.parse(p.bio);
            }
          } catch (_) {}
          extra.isPaid = true;
          await supabase.from('profiles').update({
            bio: JSON.stringify(extra),
            updated_at: new Date().toISOString()
          }).eq('id', p.id);
        }
      }

      // Also update local storage session profile cache
      const localProfiles = getSupabaseUserProfiles();
      const userIdx = localProfiles.findIndex(u => u.email.toLowerCase().trim() === studentEmail);
      if (userIdx !== -1) {
        localProfiles[userIdx].isPaid = true;
        localStorage.setItem('kogla_supabase_users', JSON.stringify(localProfiles));
      }
    } catch (err) {
      console.warn('[Supabase DB] Error marking student profile isPaid:', err);
    }
  }

  // 4. Update Ambassador partner in Supabase affiliates table
  if (promoCode) {
    try {
      const { data: affRow } = await supabase.from('affiliates').select('*').eq('code', promoCode).maybeSingle();
      if (affRow) {
        const newConfirmed = (Number(affRow.total_confirmed) || 0) + 1;
        const addEarned = lead?.commissionAmount || 14250;
        const newEarned = (Number(affRow.total_earned) || 0) + addEarned;
        await supabase.from('affiliates').update({
          total_confirmed: newConfirmed,
          total_earned: newEarned,
          updated_at: new Date().toISOString()
        }).eq('code', promoCode);
      }
    } catch (_) {}
  }

  // 5. Broadcast to Express backend (persists across devices)
  try {
    const res = await fetch('/api/referrals/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, paymentProofNote })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.referrals && Array.isArray(data.referrals)) {
        saveCachedReferrals(data.referrals);
      }
      if (data.affiliates && Array.isArray(data.affiliates)) {
        saveCachedAffiliates(data.affiliates);
      }
    }
  } catch (err) {
    console.warn('[Affiliates] Failed to broadcast approval to server:', err);
  }

  return true;
}

/**
 * Admin Action: Mark affiliate commission as paid out to creator's bank account globally
 */
export async function markReferralPaidOut(leadId: string): Promise<boolean> {
  const referrals = await getAllReferrals();
  const lead = referrals.find(r => r.id === leadId);
  const promoCode = (lead?.affiliateCode || '').toUpperCase().trim();

  if (lead) {
    lead.status = 'paid_out';
    lead.paidAt = new Date().toISOString();
    saveCachedReferrals(referrals);
  }

  // 1. Update Supabase PostgreSQL Database (referrals table)
  try {
    await supabase.from('referrals').update({
      status: 'paid_out',
      paid_at: new Date().toISOString()
    }).eq('id', leadId);

    if (lead?.studentEmail) {
      await supabase.from('referrals').update({
        status: 'paid_out',
        paid_at: new Date().toISOString()
      }).ilike('lead_email', lead.studentEmail.toLowerCase().trim());
    }
  } catch (err) {
    console.warn('[Supabase DB] Error marking referral paid out:', err);
  }

  // 2. Update Supabase affiliates table total_paid
  if (promoCode && lead) {
    try {
      const { data: affRow } = await supabase.from('affiliates').select('*').eq('code', promoCode).maybeSingle();
      if (affRow) {
        const newPaid = (Number(affRow.total_paid) || 0) + lead.commissionAmount;
        await supabase.from('affiliates').update({
          total_paid: newPaid,
          updated_at: new Date().toISOString()
        }).eq('code', promoCode);
      }
    } catch (_) {}
  }

  // 3. Broadcast to Express backend (persists across devices)
  try {
    const res = await fetch('/api/referrals/paid-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.referrals && Array.isArray(data.referrals)) {
        saveCachedReferrals(data.referrals);
      }
      if (data.affiliates && Array.isArray(data.affiliates)) {
        saveCachedAffiliates(data.affiliates);
      }
    }
  } catch (err) {
    console.warn('[Affiliates] Failed to broadcast payout to server:', err);
  }

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

  try {
    fetch('/api/referrals/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId })
    }).catch(() => {});
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
    await supabase.from('affiliates').delete().eq('code', normCode);
    await supabase.from('referrals').delete().eq('promo_code', normCode);
  } catch (_) {}

  try {
    fetch('/api/affiliates/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normCode })
    }).catch(() => {});
  } catch (_) {}

  return true;
}

/**
 * Purge all mock/test referral leads and test affiliates from local cache, server, and Supabase
 */
export async function purgeAllTestReferralsAndAffiliates(): Promise<boolean> {
  localStorage.removeItem(LOCAL_AFFILIATES_KEY);
  localStorage.removeItem(LOCAL_REFERRALS_KEY);

  try {
    fetch('/api/referrals/purge-all', { method: 'POST' }).catch(() => {});
  } catch (_) {}

  try {
    await supabase.from('affiliates').delete().in('code', ['PHENA', 'SHIRLEY']);
    await supabase.from('referrals').delete().in('promo_code', ['PHENA', 'SHIRLEY']);
  } catch (_) {}

  return true;
}

/**
 * Create or update an Affiliate Partner profile in Supabase Postgres & Server
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

  // 1. Direct write to Supabase PostgreSQL Database (affiliates table)
  try {
    await supabase.from('affiliates').upsert({
      code: normCode,
      name: partnerToSave.name,
      email: partnerToSave.email,
      instagram_handle: partnerToSave.instagramHandle || null,
      bank_name: partnerToSave.bankDetails?.bankName || null,
      account_number: partnerToSave.bankDetails?.accountNumber || null,
      account_name: partnerToSave.bankDetails?.accountName || null,
      tier1_rate: partnerToSave.baseRate || 6,
      tier2_rate: partnerToSave.boostedRate || 10,
      student_discount_rate: partnerToSave.discountOffered || 5,
      total_leads: partnerToSave.totalReferrals || 0,
      total_confirmed: partnerToSave.confirmedCount || 0,
      total_earned: partnerToSave.totalEarned || 0,
      total_paid: partnerToSave.totalPaidOut || 0,
      status: 'active',
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Affiliates] Error saving partner to Supabase:', err);
  }

  // 2. Also update user profile in Supabase Profiles Table if registered user
  try {
    const { data: userRows } = await supabase.from('profiles').select('*').ilike('email', partnerToSave.email);
    if (userRows && userRows.length > 0) {
      for (const row of userRows) {
        let extra: any = {};
        try {
          if (row.bio && typeof row.bio === 'string' && row.bio.startsWith('{')) {
            extra = JSON.parse(row.bio);
          }
        } catch (_) {}
        extra.isAmbassador = true;
        extra.affiliateCode = normCode;
        if (partnerToSave.bankDetails) {
          extra.bankDetails = partnerToSave.bankDetails;
        }
        await supabase.from('profiles').update({
          bio: JSON.stringify(extra),
          updated_at: new Date().toISOString()
        }).eq('id', row.id);
      }
    }
  } catch (_) {}

  // 3. Sync to Express backend disk persistence
  try {
    fetch('/api/affiliates/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner: partnerToSave })
    }).catch(() => {});
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

