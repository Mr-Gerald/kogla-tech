import { CertificateRecord } from '../types';
import { supabase } from './supabase';

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

  // Sync to Supabase for persistence
  try {
    supabase.from('site_config').upsert({
      key: 'founder_signature',
      value: { signature: sig },
      updated_at: new Date().toISOString()
    }).then(() => {});
  } catch (_) {}
}

export async function fetchFounderSignatureCloud(): Promise<string> {
  const local = getFounderSignature();
  try {
    const { data } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'founder_signature')
      .single();
    if (data && data.value && data.value.signature) {
      const cloudSig = data.value.signature as string;
      try {
        localStorage.setItem('kogla_founder_signature', cloudSig);
      } catch (_) {}
      return cloudSig;
    }
  } catch (_) {}
  return local;
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

  // Sync to Supabase
  try {
    await supabase.from('certificates').upsert({
      id: certId,
      student_name: newCert.studentName,
      student_email: newCert.studentEmail,
      course_title: newCert.courseTitle,
      mode: newCert.mode,
      grade: newCert.grade,
      issue_date: newCert.issueDate,
      completion_date: newCert.completionDate,
      issued_by: newCert.issuedBy,
      founder_name: newCert.founderName,
      founder_title: newCert.founderTitle,
      signature_image: newCert.signatureImage,
      verified: newCert.verified,
      credential_url: newCert.credentialUrl,
      created_at: newCert.createdAt
    });
  } catch (_) {}

  return newCert;
}

/**
 * Verify a certificate by ID (Public verification route)
 */
export async function verifyCertificate(certId: string): Promise<CertificateRecord | null> {
  const cleanId = certId.trim().toUpperCase();
  const cached = getCachedCertificates().find(c => c.id.toUpperCase() === cleanId);

  try {
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', cleanId)
      .single();
    if (data) {
      return {
        id: data.id,
        studentName: data.student_name || data.studentName,
        studentEmail: data.student_email || data.studentEmail,
        courseTitle: data.course_title || data.courseTitle,
        mode: data.mode,
        grade: data.grade,
        issueDate: data.issue_date || data.issueDate,
        completionDate: data.completion_date || data.completionDate,
        issuedBy: data.issued_by || data.issuedBy,
        founderName: data.founder_name || data.founderName || FOUNDER_NAME,
        founderTitle: data.founder_title || data.founderTitle || FOUNDER_TITLE,
        signatureImage: data.signature_image || data.signatureImage,
        verified: data.verified ?? true,
        credentialUrl: data.credential_url || data.credentialUrl,
        createdAt: data.created_at || data.createdAt || new Date().toISOString()
      };
    }
  } catch (_) {}

  return cached || null;
}

/**
 * Get all certificates (for Admin)
 */
export async function getAllCertificates(): Promise<CertificateRecord[]> {
  const cached = getCachedCertificates();

  try {
    const { data, error } = await supabase.from('certificates').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      const list: CertificateRecord[] = data.map((d: any) => ({
        id: d.id,
        studentName: d.student_name || d.studentName,
        studentEmail: d.student_email || d.studentEmail,
        courseTitle: d.course_title || d.courseTitle,
        mode: d.mode,
        grade: d.grade,
        issueDate: d.issue_date || d.issueDate,
        completionDate: d.completion_date || d.completionDate,
        issuedBy: d.issued_by || d.issuedBy,
        founderName: d.founder_name || d.founderName || FOUNDER_NAME,
        founderTitle: d.founder_title || d.founderTitle || FOUNDER_TITLE,
        signatureImage: d.signature_image || d.signatureImage,
        verified: d.verified ?? true,
        credentialUrl: d.credential_url || d.credentialUrl,
        createdAt: d.created_at || d.createdAt || new Date().toISOString()
      }));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveCachedCertificates(list);
      return list;
    }
  } catch (_) {}

  return cached;
}
