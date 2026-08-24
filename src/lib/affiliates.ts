import { AffiliatePartner, ReferralLead } from '../types';
import { db, safeFirestoreWrite, safeFirestoreRead } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { DEFAULT_AFFILIATES } from './referralTracker';

const LOCAL_AFFILIATES_KEY = 'kogla_affiliates_cache';
const LOCAL_REFERRALS_KEY = 'kogla_referrals_cache';

// Default referrals (empty until real student signups occur)
const INITIAL_DEMO_REFERRALS: ReferralLead[] = [];

function getCachedAffiliates(): AffiliatePartner[] {
  try {
    const raw = localStorage.getItem(LOCAL_AFFILIATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Filter out any stale mock data
      const cleaned = parsed.filter((a: any) => a.code !== 'SHIRLEY' && a.code !== 'PHENA' && a.id !== 'aff-shirley');
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
        r.affiliateCode !== 'PHENA' && 
        !r.id?.startsWith('ref-demo-') &&
        r.studentEmail !== 'eechebegerald@gmail.com'
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

  return safeFirestoreRead(async () => {
    const docRef = doc(db, 'affiliates', normCode);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AffiliatePartner;
    }
    return foundInCache || null;
  }, foundInCache || null, 1500);
}

/**
 * Fetch all registered affiliate partners (for Admin)
 */
export async function getAllAffiliates(): Promise<AffiliatePartner[]> {
  const cached = getCachedAffiliates();

  return safeFirestoreRead(async () => {
    const snap = await getDocs(collection(db, 'affiliates'));
    if (!snap.empty) {
      const list: AffiliatePartner[] = [];
      snap.forEach(d => {
        const data = d.data() as AffiliatePartner;
        // Purge test PHENA / SHIRLEY docs
        if (data.code !== 'PHENA' && data.code !== 'SHIRLEY' && data.id !== 'aff-shirley') {
          list.push(data);
        }
      });
      saveCachedAffiliates(list);
      return list;
    }
    return cached;
  }, cached, 1500);
}

/**
 * Fetch all referrals for a specific affiliate code
 */
export async function getReferralsByCode(code: string): Promise<ReferralLead[]> {
  const normCode = code.trim().toUpperCase();
  const cached = getCachedReferrals().filter(r => r.affiliateCode.toUpperCase() === normCode);

  return safeFirestoreRead(async () => {
    const q = query(
      collection(db, 'referrals'),
      where('affiliateCode', '==', normCode)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: ReferralLead[] = [];
      snap.forEach(d => list.push(d.data() as ReferralLead));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
    return cached;
  }, cached, 1500);
}

/**
 * Fetch all referrals across the platform (for Admin)
 */
export async function getAllReferrals(): Promise<ReferralLead[]> {
  const cached = getCachedReferrals();

  return safeFirestoreRead(async () => {
    const snap = await getDocs(collection(db, 'referrals'));
    if (!snap.empty) {
      const list: ReferralLead[] = [];
      snap.forEach(d => {
        const data = d.data() as ReferralLead;
        // Exclude test referrals
        if (
          data.affiliateCode !== 'PHENA' && 
          data.affiliateCode !== 'SHIRLEY' && 
          !data.id?.startsWith('ref-demo-') &&
          data.studentEmail !== 'eechebegerald@gmail.com'
        ) {
          list.push(data);
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveCachedReferrals(list);
      return list;
    }
    return cached;
  }, cached, 1500);
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
  const partner = (await getAffiliateByCode(normCode)) || DEFAULT_AFFILIATES[0];

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
    status: 'pending', // Starts as pending until Admin approves payment
    createdAt: new Date().toISOString()
  };

  // Update local cache
  const cached = getCachedReferrals();
  const updatedReferrals = [newLead, ...cached];
  saveCachedReferrals(updatedReferrals);

  // Update partner total referrals in cache
  const cachedAffiliates = getCachedAffiliates();
  const updatedAffiliates = cachedAffiliates.map(a => {
    if (a.code.toUpperCase() === normCode) {
      return {
        ...a,
        totalReferrals: (a.totalReferrals || 0) + 1
      };
    }
    return a;
  });
  saveCachedAffiliates(updatedAffiliates);

  // Save to Firestore
  safeFirestoreWrite(async () => {
    await setDoc(doc(db, 'referrals', leadId), newLead);
    const partnerRef = doc(db, 'affiliates', normCode);
    const partnerSnap = await getDoc(partnerRef);
    if (partnerSnap.exists()) {
      const pData = partnerSnap.data() as AffiliatePartner;
      await updateDoc(partnerRef, {
        totalReferrals: (pData.totalReferrals || 0) + 1,
        updatedAt: new Date().toISOString()
      });
    }
  }, 2000);

  return newLead;
}

/**
 * Admin Action: Approve student payment and confirm enrollment.
 * Automatically recalculates commission, increments partner's confirmed count,
 * and permanently unlocks Tier 2 (10%) if 3 confirmed students reached!
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

  // Sync to Firestore
  return safeFirestoreWrite(async () => {
    await updateDoc(doc(db, 'referrals', leadId), {
      status: 'confirmed',
      confirmedAt: lead.confirmedAt,
      paymentProofNote: lead.paymentProofNote || ''
    });

    const partnerRef = doc(db, 'affiliates', lead.affiliateCode.toUpperCase());
    const partnerSnap = await getDoc(partnerRef);
    if (partnerSnap.exists()) {
      const p = partnerSnap.data() as AffiliatePartner;
      const newConfirmed = (p.confirmedCount || 0) + 1;
      await updateDoc(partnerRef, {
        confirmedCount: newConfirmed,
        totalEarned: (p.totalEarned || 0) + lead.commissionAmount,
        pendingPayout: (p.pendingPayout || 0) + lead.commissionAmount,
        tier: newConfirmed >= 3 ? 2 : 1,
        updatedAt: new Date().toISOString()
      });
    }
  }, 2500);
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

  return safeFirestoreWrite(async () => {
    await updateDoc(doc(db, 'referrals', leadId), {
      status: 'paid_out',
      paidAt: lead.paidAt
    });

    if (partner) {
      const pRef = doc(db, 'affiliates', partner.code.toUpperCase());
      await updateDoc(pRef, {
        pendingPayout: partner.pendingPayout,
        totalPaidOut: partner.totalPaidOut,
        updatedAt: new Date().toISOString()
      });
    }
  }, 2500);
}

/**
 * Delete a single referral lead (Admin action)
 */
export async function deleteReferralLead(leadId: string): Promise<boolean> {
  const referrals = getCachedReferrals().filter(r => r.id !== leadId);
  saveCachedReferrals(referrals);

  return safeFirestoreWrite(async () => {
    await deleteDoc(doc(db, 'referrals', leadId));
  }, 2000);
}

/**
 * Delete an affiliate partner by promo code (Admin action)
 */
export async function deleteAffiliatePartner(code: string): Promise<boolean> {
  const normCode = code.trim().toUpperCase();
  const affiliates = getCachedAffiliates().filter(a => a.code.toUpperCase() !== normCode);
  saveCachedAffiliates(affiliates);

  return safeFirestoreWrite(async () => {
    await deleteDoc(doc(db, 'affiliates', normCode));
  }, 2000);
}

/**
 * Purge all mock/test referral leads and test affiliates from local cache and Firestore
 */
export async function purgeAllTestReferralsAndAffiliates(): Promise<boolean> {
  // Clear local storage
  localStorage.removeItem(LOCAL_AFFILIATES_KEY);
  localStorage.removeItem(LOCAL_REFERRALS_KEY);

  return safeFirestoreWrite(async () => {
    // Delete PHENA and SHIRLEY docs if present
    try {
      await deleteDoc(doc(db, 'affiliates', 'PHENA'));
      await deleteDoc(doc(db, 'affiliates', 'SHIRLEY'));
      await deleteDoc(doc(db, 'affiliates', 'aff-shirley'));
    } catch (_) {}

    // Find and delete any referrals with PHENA or test email
    try {
      const snap = await getDocs(collection(db, 'referrals'));
      snap.forEach(async (d) => {
        const data = d.data() as ReferralLead;
        if (
          data.affiliateCode === 'PHENA' || 
          data.affiliateCode === 'SHIRLEY' || 
          data.id?.startsWith('ref-demo-') ||
          data.studentEmail === 'eechebegerald@gmail.com'
        ) {
          await deleteDoc(doc(db, 'referrals', d.id));
        }
      });
    } catch (_) {}
  }, 2500);
}

/**
 * Create or update an Affiliate Partner profile
 */
export async function saveAffiliatePartner(partner: AffiliatePartner): Promise<boolean> {
  const affiliates = getCachedAffiliates();
  const normCode = partner.code.trim().toUpperCase();
  const existingIdx = affiliates.findIndex(a => a.code.toUpperCase() === normCode);

  if (existingIdx !== -1) {
    affiliates[existingIdx] = { ...partner, code: normCode, updatedAt: new Date().toISOString() };
  } else {
    affiliates.push({ ...partner, code: normCode, createdAt: new Date().toISOString() });
  }
  saveCachedAffiliates(affiliates);

  return safeFirestoreWrite(async () => {
    await setDoc(doc(db, 'affiliates', normCode), partner);
  }, 2500);
}

