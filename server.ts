import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[Gemini Server] Failed to initialize GoogleGenAI client:', err);
  }
}

const SYSTEM_INSTRUCTION = `You are Kogla AI, the official intelligent assistant for Kogla Tech (https://kogla-tech.com).
Your purpose is to assist visitors, students, developers, and clients with any questions regarding Kogla Tech's platform, academy, software services, enterprise solutions, and community.

ABOUT KOGLA TECH:
- Core Mission: Empowering software developers and building enterprise-grade digital solutions across Africa and globally.
- Services Offered: Custom Software Engineering, Workflow & AI Automation, Cloud Infrastructure, Agile System Audits, Corporate Consulting.
- Kogla Academy: Interactive learning hub with hands-on practice labs, live study rooms, real-time code execution, XP progression rewards, and verified developer certificates.
- Community Reviews & Ratings: Transparent community feedback hub where users share experiences and rate products.
- Main Contact Info: Email: solutions@kogla-tech.com, Phone: +234 701 248 9041, WhatsApp: https://wa.me/2347012489041

NAVIGATION & FEATURES:
- / (Home): Overview of Kogla Tech capabilities, enterprise solutions, software architecture expertise, and client reviews.
- /academy: Full catalog of software engineering courses and interactive practice labs.
- /projects: Showcase of enterprise projects and student portfolio builds.
- /reviews: Community reviews, ratings, and feedback section.
- /profile: Personal developer dashboard, XP stats, completed labs, bookmarks, and account security.
- /auth/login & /auth/signup: Account portal.
- /admin: Command Portal for administrators to manage courses, projects, site configuration, and analytics.

BEHAVIOR GUIDELINES:
1. Always maintain a professional, tech-forward, friendly, and helpful tone.
2. Provide concise, clear, and direct answers tailored to the user's question.
3. When users ask complex questions, custom software quote requests, billing inquiries, partnership opportunities, or express needing direct support, ALWAYS recommend contacting a Kogla Tech Admin directly via WhatsApp:
   👉 WhatsApp: https://wa.me/2347012489041 (Phone: +234 701 248 9041)
4. NEVER mention internal framework details (such as Firebase, Google AI Studio, Vite, etc.). Always refer to the platform simply as "Kogla Tech".`;

// API Route for AI Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // If Gemini client is active, call Gemini 3.6 Flash
    if (ai) {
      try {
        const contents: any[] = [];
        
        // Add chat history if available
        if (Array.isArray(history) && history.length > 0) {
          history.slice(-6).forEach((item: { role: string; content: string }) => {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.content }],
            });
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const replyText = response.text || 'I am here to help with any questions about Kogla Tech! For detailed inquiries, feel free to chat with our admin on WhatsApp at https://wa.me/2347012489041.';

        return res.json({ reply: replyText });
      } catch (geminiError: any) {
        // Silently handle Gemini quota/rate-limit errors and fall back to local assistant
      }
    }

    // Fallback response engine if Gemini API key is unavailable or fails
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('course') || lower.includes('academy') || lower.includes('learn') || lower.includes('study')) {
      reply = `Welcome to Kogla Academy! We offer hands-on courses and interactive practice labs covering Web Development, Backend Architecture, Cloud Infrastructure, and AI Automation.\n\nExplore all courses at our Academy (/academy). For specialized corporate training, you can reach our admin team on WhatsApp: https://wa.me/2347012489041.`;
    } else if (lower.includes('contact') || lower.includes('admin') || lower.includes('whatsapp') || lower.includes('phone') || lower.includes('support') || lower.includes('help')) {
      reply = `You can get in touch with our team anytime!\n\n💬 WhatsApp Support: https://wa.me/2347012489041\n📞 Phone: +234 701 248 9041\n✉️ Email: solutions@kogla-tech.com\n\nOur admins are available to assist you with custom quotes, enrollment, or technical questions.`;
    } else if (lower.includes('project') || lower.includes('service') || lower.includes('hire') || lower.includes('build')) {
      reply = `Kogla Tech builds enterprise-grade software solutions, custom web applications, workflow automations, and cloud pipelines.\n\nCheck out our case studies at /projects or speak directly with our engineering lead on WhatsApp: https://wa.me/2347012489041.`;
    } else {
      reply = `Thank you for reaching out to Kogla Tech! I am your AI Assistant. We provide full-stack software development, automated tech solutions, and Kogla Academy training.\n\nFor direct assistance or personalized support, feel free to connect with our Admin on WhatsApp: https://wa.me/2347012489041 (+234 701 248 9041).`;
    }

    return res.json({ reply });
  } catch (err: any) {
    console.error('[Server /api/chat error]', err);
    return res.status(500).json({
      reply: 'Thank you for reaching out! For immediate assistance, please connect directly with our admin on WhatsApp: https://wa.me/2347012489041 (+234 701 248 9041).'
    });
  }
});

// Server-side State Persistence for Cross-Device Synchronization
interface SyncedUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  xp?: number;
  completedRooms?: string[];
  avatarUrl?: string;
  signatureUrl?: string;
  phone?: string;
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  isPaid?: boolean;
  isAmbassador?: boolean;
  affiliateCode?: string;
  referredBy?: string | null;
  discountPercent?: number;
  appliedPromoCode?: string;
  emailVerified?: boolean;
  emailConfirmedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface SyncedAffiliate {
  id: string;
  code: string;
  name: string;
  email: string;
  instagramHandle?: string;
  tier: 1 | 2;
  baseRate: number;
  boostedRate: number;
  discountOffered: number;
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
  contractSignedDate: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncedReferral {
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
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'paid_out';
  paymentProofNote?: string;
  confirmedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

const USERS_FILE_PATH = path.join(process.cwd(), 'server_data_users.json');
const DELETED_USERS_FILE_PATH = path.join(process.cwd(), 'server_deleted_users.json');
const AFFILIATES_FILE_PATH = path.join(process.cwd(), 'server_data_affiliates.json');
const REFERRALS_FILE_PATH = path.join(process.cwd(), 'server_data_referrals.json');
const REVIEWS_FILE_PATH = path.join(process.cwd(), 'server_data_reviews.json');

interface SyncedReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  rating?: number;
  title?: string;
  content: string;
  targetType?: string;
  targetId?: string;
  parentId?: string | null;
  likedBy?: string[];
  likeCount?: number;
  createdAt: string;
  updatedAt?: string;
}

const SERVER_BASELINE_LIKES: Record<string, number> = {
  'rev-nnamdi-lagos': 14,
  'rev-nnamdi-reply-1': 6,
  'rev-blessing-abuja': 19,
  'rev-emeka-ph': 11,
  'rev-fatima-kano': 9,
  'rev-damilola-ibadan': 16,
  'rev-chiamaka-enugu': 22,
};

const SERVER_SEED_REVIEWS: SyncedReview[] = [
  {
    id: 'rev-nnamdi-lagos',
    userId: 'user-nnamdi-k',
    userName: 'Nnamdi K.',
    userAvatar: '',
    userRole: 'Full-Stack Graduate (Lekki Hub)',
    rating: 5,
    title: 'Physical class in Lekki Hub was the turning point for my career tbh',
    content: 'Honestly when I enrolled for the Full-Stack Web Dev physical class, I was skeptical because I had tried YouTube tutorials for 6 months without building anything solid. Mr Gerald and the instructors literally tore down my spaghetti code on day 3 lol. We built a full banking webhook engine from scratch. Now working remotely as a React dev for a top fintech. Worth every kobo of the tuition fee.',
    targetType: 'course',
    targetId: 'web-development',
    parentId: null,
    likedBy: ['user-demo-1', 'user-demo-2', 'user-demo-3'],
    likeCount: 14,
    createdAt: '2026-08-01T10:14:00.000Z',
    updatedAt: ''
  },
  {
    id: 'rev-nnamdi-reply-1',
    userId: 'admin-gerald',
    userName: 'Gerald Emechebe',
    userAvatar: '',
    userRole: 'Founder & CEO, Kogla Tech',
    rating: 5,
    title: '',
    content: 'Proud of how far you have come Nnamdi! That webhook engine you built during the capstone sprint was top tier.',
    targetType: 'course',
    targetId: 'web-development',
    parentId: 'rev-nnamdi-lagos',
    likedBy: ['user-nnamdi-k'],
    likeCount: 6,
    createdAt: '2026-08-01T16:20:00.000Z',
    updatedAt: ''
  },
  {
    id: 'rev-blessing-abuja',
    userId: 'user-blessing-a',
    userName: 'Blessing Adebayo',
    userAvatar: '',
    userRole: 'Data Analytics Cohort (Abuja)',
    rating: 5,
    title: 'Data Analysis track got me my first contract with a USAID partner',
    content: 'Took the online data analysis cohort from Abuja while working my 9-5. The SQL and PowerBI projects were 100% practical, not just theory. The tutor pushed us on DAX formulas until 11pm some nights haha. Submitted my portfolio link during an interview last month and landed a business intelligence consultant role. The certificate verification link was also requested by HR.',
    targetType: 'course',
    targetId: 'data-analysis',
    parentId: null,
    likedBy: ['user-demo-4', 'user-demo-5'],
    likeCount: 19,
    createdAt: '2026-07-28T16:20:00.000Z',
    updatedAt: ''
  },
  {
    id: 'rev-emeka-ph',
    userId: 'user-emeka-n',
    userName: 'Emeka Nwosu',
    userAvatar: '',
    userRole: 'Cybersecurity Alumni (Port Harcourt)',
    rating: 5,
    title: 'Cybersecurity curriculum is deeper than standard CEH syllabus',
    content: "I've paid for other courses before, but Kogla’s cybersecurity lab setup with Burp Suite and Wireshark traffic breakdown was on another level. The simulated penetration testing on live vulnerable servers made concepts stick fast. If you're serious about ethical hacking in Nigeria or abroad, don't sleep on this.",
    targetType: 'course',
    targetId: 'cybersecurity',
    parentId: null,
    likedBy: ['user-demo-1', 'user-demo-6'],
    likeCount: 11,
    createdAt: '2026-07-24T09:45:00.000Z',
    updatedAt: ''
  },
  {
    id: 'rev-fatima-kano',
    userId: 'user-fatima-h',
    userName: 'Fatima Al-Hassan',
    userAvatar: '',
    userRole: 'UI/UX Design Graduate (Kano)',
    rating: 3,
    title: 'Great UI/UX mentoring, but fast-paced',
    content: 'The Figma design systems and auto-layout training was top tier, and the instructor reviewed my portfolio screen by screen. Only rating 3 stars because the assignments were very fast-paced for someone balancing a full-time job. Still learned more in 10 weeks than 2 years of self-study!',
    targetType: 'course',
    targetId: 'ui-ux-design',
    parentId: null,
    likedBy: ['user-demo-2'],
    likeCount: 9,
    createdAt: '2026-07-10T12:00:00.000Z',
    updatedAt: ''
  },
  {
    id: 'rev-damilola-ibadan',
    userId: 'user-dami-o',
    userName: 'Damilola Oladipo',
    userAvatar: '',
    userRole: 'Mobile App Developer (Ibadan)',
    rating: 4,
    title: 'Mobile App engineering with Flutter is intense but solid',
    content: 'Building cross-platform apps with real state management (Riverpod) and offline caching was exactly what I needed. The physical lab community kept me accountable throughout the 14 weeks. Even when my emulator was hanging my laptop, the lab systems had us covered.',
    targetType: 'course',
    targetId: 'mobile-app-development',
    parentId: null,
    likedBy: ['user-demo-3', 'user-demo-7'],
    likeCount: 16,
    createdAt: '2026-07-17T11:15:00.000Z',
    updatedAt: ''
  },
  {
    id: 'rev-chiamaka-enugu',
    userId: 'user-chia-e',
    userName: 'Chiamaka Eze',
    userAvatar: '',
    userRole: 'AI & Automation Specialist (Enugu)',
    rating: 5,
    title: 'Sales Funnels & AI Automation doubled my agency clients',
    content: 'As a freelancer handling social media, learning Make.com, WhatsApp automation, and custom AI agents was a game changer. I packaged automated lead pipelines for 3 real estate companies in Lagos and Enugu, charging ₦300k setup fees each. The course paid for itself within week 4.',
    targetType: 'course',
    targetId: 'sales-funnels-ai-automation',
    parentId: null,
    likedBy: ['user-demo-5', 'user-demo-8'],
    likeCount: 22,
    createdAt: '2026-06-03T14:32:00.000Z',
    updatedAt: ''
  }
];

function computeEffectiveLikes(reviewId: string, likedBy: string[] = []): number {
  const base = SERVER_BASELINE_LIKES[reviewId] ?? 0;
  const realUserLikes = likedBy.filter(u => !u.startsWith('user-demo-') && u !== 'user-nnamdi-k').length;
  return base + realUserLikes;
}

function loadReviewsFromDisk(): Map<string, SyncedReview> {
  const map = new Map<string, SyncedReview>();
  
  // 1. Initialize with authentic seed reviews
  for (const s of SERVER_SEED_REVIEWS) {
    map.set(s.id, {
      ...s,
      likeCount: computeEffectiveLikes(s.id, s.likedBy)
    });
  }

  // 2. Load disk data if present
  try {
    if (fs.existsSync(REVIEWS_FILE_PATH)) {
      const raw = fs.readFileSync(REVIEWS_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const r of data) {
          if (r && r.id) {
            const existing = map.get(r.id);
            const mergedLikedBy = Array.from(new Set([...(existing?.likedBy || []), ...(r.likedBy || [])]));
            map.set(r.id, {
              ...(existing || {}),
              ...r,
              likedBy: mergedLikedBy,
              likeCount: computeEffectiveLikes(r.id, mergedLikedBy)
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Server] Error loading reviews from disk:', err);
  }
  return map;
}

function saveReviewsToDisk(map: Map<string, SyncedReview>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Server] Error saving reviews to disk:', err);
  }
}

const serverReviewsMap = loadReviewsFromDisk();

function loadAffiliatesFromDisk(): Map<string, SyncedAffiliate> {
  const map = new Map<string, SyncedAffiliate>();
  try {
    if (fs.existsSync(AFFILIATES_FILE_PATH)) {
      const raw = fs.readFileSync(AFFILIATES_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const a of data) {
          if (a && a.code) {
            const key = a.code.toUpperCase().trim();
            map.set(key, a);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Server] Error loading affiliates from disk:', err);
  }
  return map;
}

function saveAffiliatesToDisk(map: Map<string, SyncedAffiliate>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(AFFILIATES_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Server] Error saving affiliates to disk:', err);
  }
}

const serverAffiliatesMap = loadAffiliatesFromDisk();

function loadReferralsFromDisk(): Map<string, SyncedReferral> {
  const map = new Map<string, SyncedReferral>();
  try {
    if (fs.existsSync(REFERRALS_FILE_PATH)) {
      const raw = fs.readFileSync(REFERRALS_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const r of data) {
          if (r && r.id) {
            map.set(r.id, r);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Server] Error loading referrals from disk:', err);
  }
  return map;
}

function saveReferralsToDisk(map: Map<string, SyncedReferral>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(REFERRALS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Server] Error saving referrals to disk:', err);
  }
}

const serverReferralsMap = loadReferralsFromDisk();

function recalculateAffiliateStats(partnerCode: string) {
  const normCode = partnerCode.toUpperCase().trim();
  const partner = serverAffiliatesMap.get(normCode);
  if (!partner) return;

  const partnerRefs = Array.from(serverReferralsMap.values()).filter(
    r => (r.affiliateCode || '').toUpperCase().trim() === normCode
  );

  const totalReferrals = partnerRefs.length;
  const confirmedLeads = partnerRefs.filter(r => r.status === 'confirmed' || r.status === 'paid_out');
  const confirmedCount = confirmedLeads.length;
  const totalEarned = confirmedLeads.reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
  const totalPaidOut = partnerRefs.filter(r => r.status === 'paid_out').reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
  const pendingPayout = partnerRefs.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
  const tier: 1 | 2 = confirmedCount >= 3 ? 2 : 1;

  partner.totalReferrals = totalReferrals;
  partner.confirmedCount = confirmedCount;
  partner.totalEarned = totalEarned;
  partner.totalPaidOut = totalPaidOut;
  partner.pendingPayout = pendingPayout;
  partner.tier = tier;
  partner.updatedAt = new Date().toISOString();

  serverAffiliatesMap.set(normCode, partner);
  saveAffiliatesToDisk(serverAffiliatesMap);
}

function loadDeletedUsersFromDisk(): Set<string> {
  const set = new Set<string>();
  try {
    if (fs.existsSync(DELETED_USERS_FILE_PATH)) {
      const raw = fs.readFileSync(DELETED_USERS_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (typeof item === 'string') set.add(item.toLowerCase().trim());
        });
      }
    }
  } catch (err) {
    console.warn('[Server] Error loading deleted users from disk:', err);
  }
  return set;
}

function saveDeletedUsersToDisk(set: Set<string>) {
  try {
    const list = Array.from(set.values());
    fs.writeFileSync(DELETED_USERS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Server] Error saving deleted users to disk:', err);
  }
}

const serverDeletedUsersSet = loadDeletedUsersFromDisk();

function getInitialAdminMap(): Map<string, SyncedUser> {
  const map = new Map<string, SyncedUser>();
  map.set('solutions@koglatech.com', {
    uid: 'admin_master_gerald',
    name: 'Gerald Emechebe',
    email: 'solutions@koglatech.com',
    role: 'admin',
    xp: 1500,
    completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines', 'cyber-defense-protocols'],
    avatarUrl: '',
    isPaid: true,
    emailVerified: true,
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  });

  map.set('emechebegerald@gmail.com', {
    uid: 'admin_gerald_emechebe',
    name: 'Gerald Emechebe',
    email: 'emechebegerald@gmail.com',
    role: 'admin',
    xp: 1500,
    completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines'],
    avatarUrl: '',
    isPaid: true,
    emailVerified: true,
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  });
  return map;
}

function loadUsersFromDisk(): Map<string, SyncedUser> {
  const map = getInitialAdminMap();
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const raw = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const u of data) {
          if (u && u.email) {
            const key = u.email.toLowerCase().trim();
            map.set(key, { ...map.get(key), ...u, email: key });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Server] Error loading users from disk:', err);
  }
  return map;
}

function saveUsersToDisk(map: Map<string, SyncedUser>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Server] Error saving users to disk:', err);
  }
}

const serverUsersMap = loadUsersFromDisk();

// GET /api/users - Return all registered developer profiles across all devices
app.get('/api/users', (req, res) => {
  try {
    // Reload from disk to guarantee cross-process consistency
    const diskMap = loadUsersFromDisk();
    const list = Array.from(diskMap.values());
    res.json({ success: true, users: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, users: [] });
  }
});

// POST /api/users/sync - Merges and updates profile across all connected devices
app.post('/api/users/sync', (req, res) => {
  try {
    const { profile, batch } = req.body;
    
    if (batch && Array.isArray(batch)) {
      for (const item of batch) {
        if (item && item.email) {
          const normEmail = item.email.toLowerCase().trim();
          // Remove from deleted set if re-registered or active
          serverDeletedUsersSet.delete(normEmail);
          const existing = serverUsersMap.get(normEmail);
          serverUsersMap.set(normEmail, {
            ...existing,
            ...item,
            email: normEmail,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } else if (profile && profile.email) {
      const normEmail = profile.email.toLowerCase().trim();
      serverDeletedUsersSet.delete(normEmail);
      const existing = serverUsersMap.get(normEmail);
      serverUsersMap.set(normEmail, {
        ...existing,
        ...profile,
        email: normEmail,
        updatedAt: new Date().toISOString()
      });
    }

    saveUsersToDisk(serverUsersMap);
    saveDeletedUsersToDisk(serverDeletedUsersSet);
    const currentList = Array.from(serverUsersMap.values());
    res.json({ success: true, users: currentList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/deleted - Return list of all purged/deleted accounts
app.get('/api/users/deleted', (req, res) => {
  try {
    const diskDeleted = loadDeletedUsersFromDisk();
    res.json({ success: true, deleted: Array.from(diskDeleted.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, deleted: [] });
  }
});

// POST /api/users/delete - Permanently deletes an account globally
app.post('/api/users/delete', (req, res) => {
  try {
    const { uid, email } = req.body;
    if (email) {
      const normEmail = email.toLowerCase().trim();
      serverUsersMap.delete(normEmail);
      serverDeletedUsersSet.add(normEmail);
    }
    if (uid) {
      for (const [k, v] of serverUsersMap.entries()) {
        if (v.uid === uid) {
          serverUsersMap.delete(k);
          serverDeletedUsersSet.add(k);
        }
      }
      serverDeletedUsersSet.add(uid);
    }
    saveUsersToDisk(serverUsersMap);
    saveDeletedUsersToDisk(serverDeletedUsersSet);
    res.json({ success: true, message: 'User purged globally' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users/purge-all - Wipes all test/ghost users and resets server database
app.post('/api/users/purge-all', (req, res) => {
  try {
    // Record all purged non-admin accounts
    for (const [k, v] of serverUsersMap.entries()) {
      if (v.role !== 'admin') {
        serverDeletedUsersSet.add(k);
      }
    }
    serverUsersMap.clear();
    const freshAdminMap = getInitialAdminMap();
    for (const [k, v] of freshAdminMap.entries()) {
      serverUsersMap.set(k, v);
    }
    saveUsersToDisk(serverUsersMap);
    saveDeletedUsersToDisk(serverDeletedUsersSet);

    res.json({ success: true, message: 'All non-admin user records and ghost sessions purged completely.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/affiliates - Return all registered affiliate partners
app.get('/api/affiliates', (req, res) => {
  try {
    const diskMap = loadAffiliatesFromDisk();
    const list = Array.from(diskMap.values());
    res.json({ success: true, affiliates: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, affiliates: [] });
  }
});

// POST /api/affiliates/sync - Save or update an affiliate partner profile
app.post('/api/affiliates/sync', (req, res) => {
  try {
    const { partner, list } = req.body;
    if (list && Array.isArray(list)) {
      for (const item of list) {
        if (item && item.code) {
          const normCode = item.code.toUpperCase().trim();
          serverAffiliatesMap.set(normCode, {
            ...serverAffiliatesMap.get(normCode),
            ...item,
            code: normCode,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } else if (partner && partner.code) {
      const normCode = partner.code.toUpperCase().trim();
      serverAffiliatesMap.set(normCode, {
        ...serverAffiliatesMap.get(normCode),
        ...partner,
        code: normCode,
        updatedAt: new Date().toISOString()
      });
    }
    saveAffiliatesToDisk(serverAffiliatesMap);
    res.json({ success: true, affiliates: Array.from(serverAffiliatesMap.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/affiliates/delete - Remove an affiliate partner
app.post('/api/affiliates/delete', (req, res) => {
  try {
    const { code } = req.body;
    if (code) {
      const normCode = code.toUpperCase().trim();
      serverAffiliatesMap.delete(normCode);
      saveAffiliatesToDisk(serverAffiliatesMap);
    }
    res.json({ success: true, message: 'Affiliate removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/referrals - Return all referrals globally across all devices
app.get('/api/referrals', (req, res) => {
  try {
    const diskMap = loadReferralsFromDisk();
    const list = Array.from(diskMap.values());
    res.json({ success: true, referrals: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, referrals: [] });
  }
});

// POST /api/referrals/sync - Save or update referral leads globally
app.post('/api/referrals/sync', (req, res) => {
  try {
    const { referral, list } = req.body;
    if (list && Array.isArray(list)) {
      for (const item of list) {
        if (item && item.id) {
          const existing = serverReferralsMap.get(item.id);
          serverReferralsMap.set(item.id, {
            ...existing,
            ...item,
            updatedAt: new Date().toISOString()
          });
          if (item.affiliateCode) {
            recalculateAffiliateStats(item.affiliateCode);
          }
        }
      }
    } else if (referral && referral.id) {
      const existing = serverReferralsMap.get(referral.id);
      serverReferralsMap.set(referral.id, {
        ...existing,
        ...referral,
        updatedAt: new Date().toISOString()
      });
      if (referral.affiliateCode) {
        recalculateAffiliateStats(referral.affiliateCode);
      }
    }
    saveReferralsToDisk(serverReferralsMap);
    res.json({ success: true, referrals: Array.from(serverReferralsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/referrals/approve - Admin global payment approval
app.post('/api/referrals/approve', (req, res) => {
  try {
    const { id, paymentProofNote } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Referral ID is required.' });
    }

    const lead = serverReferralsMap.get(id);
    if (!lead) {
      // If not yet in map, return failure so client can sync first
      return res.status(404).json({ success: false, error: 'Referral record not found on server.' });
    }

    lead.status = 'confirmed';
    lead.confirmedAt = new Date().toISOString();
    if (paymentProofNote) lead.paymentProofNote = paymentProofNote;
    lead.updatedAt = new Date().toISOString();

    serverReferralsMap.set(id, lead);
    saveReferralsToDisk(serverReferralsMap);

    if (lead.affiliateCode) {
      recalculateAffiliateStats(lead.affiliateCode);
    }

    res.json({
      success: true,
      referral: lead,
      affiliates: Array.from(serverAffiliatesMap.values()),
      referrals: Array.from(serverReferralsMap.values())
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/referrals/paid-out - Admin global commission payout confirmation
app.post('/api/referrals/paid-out', (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Referral ID is required.' });
    }

    const lead = serverReferralsMap.get(id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Referral record not found on server.' });
    }

    lead.status = 'paid_out';
    lead.paidAt = new Date().toISOString();
    lead.updatedAt = new Date().toISOString();

    serverReferralsMap.set(id, lead);
    saveReferralsToDisk(serverReferralsMap);

    if (lead.affiliateCode) {
      recalculateAffiliateStats(lead.affiliateCode);
    }

    res.json({
      success: true,
      referral: lead,
      affiliates: Array.from(serverAffiliatesMap.values()),
      referrals: Array.from(serverReferralsMap.values())
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/referrals/delete - Remove a single referral lead globally
app.post('/api/referrals/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const lead = serverReferralsMap.get(id);
      const affCode = lead?.affiliateCode;
      serverReferralsMap.delete(id);
      saveReferralsToDisk(serverReferralsMap);
      if (affCode) {
        recalculateAffiliateStats(affCode);
      }
    }
    res.json({ success: true, message: 'Referral removed', referrals: Array.from(serverReferralsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/referrals/purge-all - Clear mock/test referrals
app.post('/api/referrals/purge-all', (req, res) => {
  try {
    for (const [id, r] of serverReferralsMap.entries()) {
      if (r.affiliateCode === 'PHENA' || r.affiliateCode === 'SHIRLEY' || id.startsWith('ref-demo-')) {
        serverReferralsMap.delete(id);
      }
    }
    saveReferralsToDisk(serverReferralsMap);
    res.json({ success: true, message: 'Test referrals cleared.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reviews - Return all persisted reviews
app.get('/api/reviews', (req, res) => {
  try {
    const diskMap = loadReviewsFromDisk();
    const list = Array.from(diskMap.values());
    res.json({ success: true, reviews: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, reviews: [] });
  }
});

// POST /api/reviews - Save / upsert a review globally (supports reviews and replies)
app.post('/api/reviews', (req, res) => {
  try {
    const { review, list } = req.body;
    if (list && Array.isArray(list)) {
      for (const item of list) {
        if (item && item.id) {
          const existing = serverReviewsMap.get(item.id);
          const mergedLikedBy = Array.from(new Set([...(existing?.likedBy || []), ...(item.likedBy || [])]));
          serverReviewsMap.set(item.id, {
            ...existing,
            ...item,
            likedBy: mergedLikedBy,
            likeCount: computeEffectiveLikes(item.id, mergedLikedBy),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } else if (review && review.id) {
      const existing = serverReviewsMap.get(review.id);
      const mergedLikedBy = Array.from(new Set([...(existing?.likedBy || []), ...(review.likedBy || [])]));
      serverReviewsMap.set(review.id, {
        ...existing,
        ...review,
        likedBy: mergedLikedBy,
        likeCount: computeEffectiveLikes(review.id, mergedLikedBy),
        updatedAt: new Date().toISOString()
      });
    }
    saveReviewsToDisk(serverReviewsMap);
    res.json({ success: true, reviews: Array.from(serverReviewsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews/like - Toggle like on review or reply
app.post('/api/reviews/like', (req, res) => {
  try {
    const { reviewId, userId } = req.body;
    if (!reviewId || !userId) {
      return res.status(400).json({ success: false, error: 'reviewId and userId are required.' });
    }
    let r = serverReviewsMap.get(reviewId);
    if (!r) {
      const seed = SERVER_SEED_REVIEWS.find(s => s.id === reviewId);
      if (seed) {
        r = { ...seed };
        serverReviewsMap.set(reviewId, r);
      }
    }
    if (r) {
      const likedBy = r.likedBy || [];
      const isLiked = likedBy.includes(userId);
      const nextLikedBy = isLiked ? likedBy.filter(u => u !== userId) : [...likedBy, userId];
      r.likedBy = nextLikedBy;
      r.likeCount = computeEffectiveLikes(reviewId, nextLikedBy);
      r.updatedAt = new Date().toISOString();
      serverReviewsMap.set(reviewId, r);
      saveReviewsToDisk(serverReviewsMap);
    }
    res.json({ success: true, reviews: Array.from(serverReviewsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews/delete - Delete a review
app.post('/api/reviews/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      serverReviewsMap.delete(id);
      // Also delete any child replies
      for (const [rid, r] of serverReviewsMap.entries()) {
        if (r.parentId === id) {
          serverReviewsMap.delete(rid);
        }
      }
      saveReviewsToDisk(serverReviewsMap);
    }
    res.json({ success: true, reviews: Array.from(serverReviewsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Google Search Console verification endpoint
app.get('/google9a8cd485a4553fe6.html', (req, res) => {
  res.type('text/html').send('google-site-verification: google9a8cd485a4553fe6.html');
});

// Serve static assets from public folder (favicons, manifest, etc.)
app.use(express.static(path.join(process.cwd(), 'public')));

// Vite middleware / static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kogla Tech server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
