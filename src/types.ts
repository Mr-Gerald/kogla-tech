export interface UserPreferences {
  themeTone?: 'dark' | 'gold' | 'midnight';
  fontSize?: 'normal' | 'compact' | 'large';
  emailNotifications?: boolean;
  activityDigest?: boolean;
  soundEffects?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'affiliate';
  isPaid?: boolean;
  isAmbassador?: boolean;
  xp: number;
  completedRooms: string[];
  phone?: string;
  bio?: string;
  title?: string;
  avatarUrl?: string;
  signatureUrl?: string;
  location?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  affiliateCode?: string;
  referredBy?: string | null;
  discountPercent?: number;
  appliedPromoCode?: string;
  preferences?: UserPreferences;
  savedItems?: string[];
  emailVerified?: boolean;
  emailConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryRecord {
  id: string;
  type: 'enrollment' | 'solution_inquiry' | 'contact';
  title: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  courseTitle?: string;
  mode?: 'online' | 'physical';
  promoCode?: string;
  tuitionAmount?: number;
  discountedAmount?: number;
  description: string;
  timestamp: string;
  status: 'Unread' | 'In Progress' | 'Contacted' | 'Enrolled' | 'Archived';
  userId?: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
}

export interface ReviewRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  rating?: number;
  title?: string;
  content: string;
  targetType: string;
  targetId?: string;
  parentId?: string | null;
  likedBy: string[];
  likeCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferralLead {
  id: string;
  affiliateCode: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseTitle: string;
  mode: 'online' | 'physical';
  tuitionAmount: number;
  discountedAmount: number;
  discountApplied: number;
  commissionRate: number; // e.g. 6% or 10%
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'paid_out';
  createdAt: string;
  confirmedAt?: string;
  paidAt?: string;
  paymentProofNote?: string;
}

export interface AffiliatePartner {
  id: string;
  code: string; // e.g. "PHENA"
  name: string;
  email: string;
  phone?: string;
  instagramHandle?: string;
  tier: 1 | 2; // Tier 1: 6%, Tier 2: 10%
  baseRate: number; // 6%
  boostedRate: number; // 10%
  discountOffered: number; // e.g. 5% discount for their students
  totalReferrals: number;
  confirmedCount: number;
  totalEarned: number;
  totalPaidOut: number;
  pendingPayout: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  contractSigned: boolean;
  contractSignedDate?: string;
  agreementDownloaded?: boolean;
  agreementDownloadedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CertificateRecord {
  id: string; // e.g. "KOGLA-CERT-2026-8941"
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  mode: 'Online Interactive Cohort' | 'Physical Hub Immersion';
  grade?: string;
  issueDate: string;
  completionDate: string;
  issuedBy: string;
  founderName: string;
  founderTitle: string;
  signatureImage?: string;
  verified: boolean;
  credentialUrl: string;
  createdAt: string;
}
