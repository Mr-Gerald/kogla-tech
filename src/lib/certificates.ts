import { CertificateRecord } from '../types';
import { db, safeFirestoreWrite, safeFirestoreRead } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';

const LOCAL_CERTIFICATES_KEY = 'kogla_certificates_cache';

export const FOUNDER_NAME = 'Gerald Emechebe';
export const FOUNDER_TITLE = 'Founder & CEO, Kogla Tech';

// Default pre-issued demo certificates
const INITIAL_DEMO_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'KOGLA-CERT-2026-8941',
    studentName: 'Chidimma Okeke',
    studentEmail: 'chidimma.o@gmail.com',
    courseTitle: 'Full-Stack Web Development',
    mode: 'Online Interactive Cohort',
    grade: 'Distinction (Top 5%)',
    issueDate: '2026-08-20',
    completionDate: '2026-08-18',
    issuedBy: 'Kogla Tech Academic Board',
    founderName: FOUNDER_NAME,
    founderTitle: FOUNDER_TITLE,
    verified: true,
    credentialUrl: 'https://koglatech.com/verify-certificate/KOGLA-CERT-2026-8941',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'KOGLA-CERT-2026-7215',
    studentName: 'Tunde Bakare',
    studentEmail: 'tunde.b@yahoo.com',
    courseTitle: 'Data Analysis & Business Intelligence',
    mode: 'Physical Hub Immersion',
    grade: 'Honors Excellence',
    issueDate: '2026-08-22',
    completionDate: '2026-08-20',
    issuedBy: 'Kogla Tech Academic Board',
    founderName: FOUNDER_NAME,
    founderTitle: FOUNDER_TITLE,
    verified: true,
    credentialUrl: 'https://koglatech.com/verify-certificate/KOGLA-CERT-2026-7215',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

function getCachedCertificates(): CertificateRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return INITIAL_DEMO_CERTIFICATES;
}

function saveCachedCertificates(certs: CertificateRecord[]) {
  try {
    localStorage.setItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(certs));
  } catch (_) {}
}

/**
 * Generate a unique Certificate ID
 */
export function generateCertificateId(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `KOGLA-CERT-${year}-${randomDigits}`;
}

export function getFounderSignature(): string {
  try {
    return localStorage.getItem('kogla_founder_signature') || '';
  } catch (_) {
    return '';
  }
}

export function saveFounderSignature(sig: string) {
  try {
    localStorage.setItem('kogla_founder_signature', sig);
  } catch (_) {}

  // Sync to Firestore for persistence
  safeFirestoreWrite(async () => {
    await setDoc(doc(db, 'config', 'founder_signature'), {
      signature: sig,
      updatedAt: new Date().toISOString()
    });
  }, 2000);
}

export async function fetchFounderSignatureCloud(): Promise<string> {
  const local = getFounderSignature();
  return safeFirestoreRead(async () => {
    const snap = await getDoc(doc(db, 'config', 'founder_signature'));
    if (snap.exists() && snap.data()?.signature) {
      const cloudSig = snap.data().signature as string;
      try {
        localStorage.setItem('kogla_founder_signature', cloudSig);
      } catch (_) {}
      return cloudSig;
    }
    return local;
  }, local, 1500);
}

/**
 * Issue a new certificate (Admin action)
 */
export async function issueCertificate(params: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  mode: 'Online Interactive Cohort' | 'Physical Hub Immersion';
  grade?: string;
  completionDate?: string;
  signatureImage?: string;
}): Promise<CertificateRecord> {
  const certId = generateCertificateId();
  const issueDate = new Date().toISOString().split('T')[0];
  const completionDate = params.completionDate || issueDate;
  const signature = params.signatureImage || getFounderSignature();

  const newCert: CertificateRecord = {
    id: certId,
    studentName: params.studentName.trim(),
    studentEmail: params.studentEmail.trim(),
    courseTitle: params.courseTitle,
    mode: params.mode,
    grade: params.grade || 'Pass with Merit',
    issueDate,
    completionDate,
    issuedBy: 'Kogla Tech Academic Board',
    founderName: FOUNDER_NAME,
    founderTitle: FOUNDER_TITLE,
    signatureImage: signature,
    verified: true,
    credentialUrl: `${window.location.origin}/verify-certificate/${certId}`,
    createdAt: new Date().toISOString()
  };

  // Update local cache
  const cached = getCachedCertificates();
  saveCachedCertificates([newCert, ...cached]);

  // Sync to Firestore
  safeFirestoreWrite(async () => {
    await setDoc(doc(db, 'certificates', certId), newCert);
  }, 2500);

  return newCert;
}

/**
 * Verify a certificate by ID (Public verification route)
 */
export async function verifyCertificate(certId: string): Promise<CertificateRecord | null> {
  const cleanId = certId.trim().toUpperCase();
  const cached = getCachedCertificates().find(c => c.id.toUpperCase() === cleanId);

  return safeFirestoreRead(async () => {
    const docRef = doc(db, 'certificates', cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CertificateRecord;
    }
    return cached || null;
  }, cached || null, 1500);
}

/**
 * Get all certificates (for Admin)
 */
export async function getAllCertificates(): Promise<CertificateRecord[]> {
  const cached = getCachedCertificates();

  return safeFirestoreRead(async () => {
    const snap = await getDocs(collection(db, 'certificates'));
    if (!snap.empty) {
      const list: CertificateRecord[] = [];
      snap.forEach(d => list.push(d.data() as CertificateRecord));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveCachedCertificates(list);
      return list;
    }
    return cached;
  }, cached, 1500);
}
