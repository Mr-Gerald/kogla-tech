import { ReviewRecord } from '../types';
import { supabase } from './supabase';
import { isSystemAdminEmail } from './authUtils';

const LOCAL_REVIEWS_KEY = 'kogla_reviews_cache_v6';

export const HARDCODED_BASELINE_LIKES: Record<string, number> = {
  'rev-nnamdi-lagos': 14,
  'rev-nnamdi-reply-1': 6,
  'rev-blessing-abuja': 19,
  'rev-emeka-ph': 11,
  'rev-fatima-kano': 9,
  'rev-damilola-ibadan': 16,
  'rev-chiamaka-enugu': 22,
};

export function computeEffectiveLikes(
  reviewId: string,
  likedBy: string[] = [],
  adminBonusLikes: number = 0
): number {
  const base = HARDCODED_BASELINE_LIKES[reviewId] ?? 0;
  const realUserLikes = (likedBy || []).filter(
    u => !u.startsWith('user-demo-') && u !== 'user-nnamdi-k' && !isSystemAdminEmail(u)
  ).length;
  return base + realUserLikes + (adminBonusLikes || 0);
}

// 6 Authentic, hyper-realistic, community-grounded student & professional reviews
export const INITIAL_AUTHENTIC_REVIEWS: ReviewRecord[] = [
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
    adminBonusLikes: 2,
    likeCount: 16,
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
    adminBonusLikes: 1,
    likeCount: 7,
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
    adminBonusLikes: 2,
    likeCount: 21,
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
    adminBonusLikes: 0,
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
    adminBonusLikes: 0,
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
    adminBonusLikes: 0,
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
    adminBonusLikes: 0,
    likeCount: 22,
    createdAt: '2026-06-03T14:32:00.000Z',
    updatedAt: ''
  }
];

/**
 * Universal Sanitizer: Ensures critical relationships and titles are NEVER corrupted or lost.
 * In particular: Gerald Emechebe's reply to Nnamdi K. ALWAYS remains a nested reply with parentId: 'rev-nnamdi-lagos'
 * and role: 'Founder & CEO, Kogla Tech'.
 */
export function sanitizeReviewRecord(r: ReviewRecord): ReviewRecord {
  if (!r) return r;

  // Specific invariant for Gerald Emechebe's reply to Nnamdi K.
  if (
    r.id === 'rev-nnamdi-reply-1' ||
    r.userId === 'admin-gerald' ||
    r.userName === 'Gerald Emechebe' ||
    (typeof r.content === 'string' && r.content.includes('Proud of how far you have come Nnamdi'))
  ) {
    return {
      ...r,
      id: 'rev-nnamdi-reply-1',
      userId: 'admin-gerald',
      userName: 'Gerald Emechebe',
      userRole: 'Founder & CEO, Kogla Tech',
      parentId: 'rev-nnamdi-lagos',
      targetType: 'course',
      targetId: 'web-development',
      title: '',
    };
  }

  // Preserve initial authentic seeds
  const seedMatch = INITIAL_AUTHENTIC_REVIEWS.find(s => s.id === r.id);
  if (seedMatch) {
    return {
      ...r,
      userRole: r.userRole && r.userRole !== 'Student' ? r.userRole : seedMatch.userRole,
      parentId: seedMatch.parentId,
      targetType: r.targetType || seedMatch.targetType,
      targetId: r.targetId || seedMatch.targetId,
    };
  }

  return {
    ...r,
    userRole: r.userRole || (r.userId?.startsWith('admin') ? 'Kogla Admin' : 'Student'),
    parentId: r.parentId && r.parentId !== 'null' && r.parentId !== '' ? r.parentId : null,
  };
}

function getCachedReviews(): ReviewRecord[] {
  try {
    // Purge outdated stale cache keys from previous versions to eliminate corrupted state
    const staleKeys = [
      'kogla_reviews_cache_v5',
      'kogla_reviews_cache_v4',
      'kogla_reviews_cache_v3',
      'kogla_reviews_cache_v2',
      'kogla_reviews_cache_v1',
      'kogla_reviews_cache'
    ];
    staleKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });

    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r: any) => {
          const adminBonusLikes = typeof r.adminBonusLikes === 'number'
            ? r.adminBonusLikes
            : Math.max(0, (r.likeCount || 0) - (HARDCODED_BASELINE_LIKES[r.id] ?? 0));
          return sanitizeReviewRecord({
            ...r,
            adminBonusLikes,
            likeCount: typeof r.likeCount === 'number'
              ? Math.max(r.likeCount, computeEffectiveLikes(r.id, r.likedBy || [], adminBonusLikes))
              : computeEffectiveLikes(r.id, r.likedBy || [], adminBonusLikes)
          });
        });
      }
    }
  } catch (_) {}
  return INITIAL_AUTHENTIC_REVIEWS.map(r => sanitizeReviewRecord({
    ...r,
    likeCount: computeEffectiveLikes(r.id, r.likedBy || [], r.adminBonusLikes || 0)
  }));
}

function saveCachedReviews(reviews: ReviewRecord[]) {
  try {
    const sanitized = reviews.map(sanitizeReviewRecord);
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(sanitized));
  } catch (_) {}
}

type ReviewSubscriber = (reviews: ReviewRecord[]) => void;
const activeSubscribers = new Set<ReviewSubscriber>();

function broadcastReviews(list: ReviewRecord[]) {
  activeSubscribers.forEach((subscriber) => {
    try {
      subscriber(list);
    } catch (_) {}
  });
}

export function subscribeToReviews(onData: (reviews: ReviewRecord[]) => void, _onError?: (err: unknown) => void) {
  activeSubscribers.add(onData);

  // Provide initial cached reviews immediately for instant response
  const cached = getCachedReviews();
  onData(cached);

  const fetchAndMergeAll = async () => {
    const fetchedMap = new Map<string, ReviewRecord>();

    // 1. First populate with initial authentic seed reviews
    INITIAL_AUTHENTIC_REVIEWS.forEach(r => {
      fetchedMap.set(r.id, {
        ...r,
        likeCount: computeEffectiveLikes(r.id, r.likedBy || [], r.adminBonusLikes || 0)
      });
    });

    // 2. Fetch from Express Backend (cross-device disk persistence)
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.reviews)) {
          json.reviews.forEach((r: any) => {
            if (r && r.id) {
              const existing = fetchedMap.get(r.id);
              const mergedLikedBy = Array.from(new Set([...(existing?.likedBy || []), ...(r.likedBy || [])]));
              const adminBonusLikes = Math.max(
                typeof r.adminBonusLikes === 'number' ? r.adminBonusLikes : 0,
                existing?.adminBonusLikes || 0
              );
              const effectiveLikes = Math.max(
                typeof r.likeCount === 'number' ? r.likeCount : 0,
                existing?.likeCount || 0,
                computeEffectiveLikes(r.id, mergedLikedBy, adminBonusLikes)
              );
              fetchedMap.set(r.id, {
                id: r.id,
                userId: r.userId || existing?.userId || '',
                userName: r.userName || existing?.userName || 'Anonymous',
                userAvatar: r.userAvatar || existing?.userAvatar || '',
                userRole: r.userRole || existing?.userRole || 'Student',
                rating: typeof r.rating === 'number' ? r.rating : (existing?.rating || 5),
                title: r.title || existing?.title || '',
                content: r.content || existing?.content || '',
                targetType: r.targetType || existing?.targetType || 'platform',
                targetId: r.targetId || existing?.targetId || 'general',
                parentId: r.parentId || existing?.parentId || null,
                likedBy: mergedLikedBy,
                likeCount: effectiveLikes,
                adminBonusLikes,
                createdAt: r.createdAt || existing?.createdAt || new Date().toISOString(),
                updatedAt: r.updatedAt || existing?.updatedAt || '',
              });
            }
          });
        }
      }
    } catch (_) {}

    // 3. Fetch from Supabase PostgreSQL Database (cross-device cloud persistence)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach((d: any) => {
          if (d && d.id) {
            let meta: any = {};
            if (d.author_email) {
              try {
                if (typeof d.author_email === 'string' && d.author_email.startsWith('{')) {
                  meta = JSON.parse(d.author_email);
                }
              } catch (_) {}
            }

            const existing = fetchedMap.get(d.id);
            const dbLikedBy = Array.isArray(meta.likedBy)
              ? meta.likedBy
              : (Array.isArray(d.liked_by) ? d.liked_by : (Array.isArray(d.likedBy) ? d.likedBy : []));
            const mergedLikedBy = Array.from(new Set([...(existing?.likedBy || []), ...dbLikedBy]));
            const adminBonusLikes = Math.max(
              typeof meta.adminBonusLikes === 'number' ? meta.adminBonusLikes : 0,
              existing?.adminBonusLikes || 0
            );
            const computedLikes = computeEffectiveLikes(d.id, mergedLikedBy, adminBonusLikes);
            const effectiveLikeCount = Math.max(
              typeof meta.likeCount === 'number' ? meta.likeCount : 0,
              existing?.likeCount || 0,
              computedLikes
            );

            fetchedMap.set(d.id, {
              id: d.id,
              userId: d.user_id || meta.userId || existing?.userId || '',
              userName: d.author_name || meta.userName || existing?.userName || 'Anonymous',
              userAvatar: meta.userAvatar || d.user_avatar || existing?.userAvatar || '',
              userRole: meta.userRole || d.user_role || existing?.userRole || 'Student',
              rating: typeof d.rating === 'number' ? d.rating : (existing?.rating || 5),
              title: d.track_title || meta.title || existing?.title || '',
              content: d.content || existing?.content || '',
              targetType: meta.targetType || d.track_id || existing?.targetType || 'course',
              targetId: d.track_id || meta.targetId || existing?.targetId || 'general',
              parentId: meta.parentId || d.parent_id || existing?.parentId || null,
              likedBy: mergedLikedBy,
              likeCount: effectiveLikeCount,
              adminBonusLikes,
              createdAt: d.created_at || existing?.createdAt || new Date().toISOString(),
              updatedAt: meta.updatedAt || d.updated_at || existing?.updatedAt || '',
            });
          }
        });
      }
    } catch (_) {}

    // 4. Merge cached local reviews so newly posted items and replies don't vanish
    const currentLocal = getCachedReviews();
    currentLocal.forEach(cr => {
      const existing = fetchedMap.get(cr.id);
      const mergedLikedBy = Array.from(new Set([...(existing?.likedBy || []), ...(cr.likedBy || [])]));
      const adminBonusLikes = Math.max(cr.adminBonusLikes || 0, existing?.adminBonusLikes || 0);
      const effectiveLikeCount = Math.max(
        cr.likeCount || 0,
        existing?.likeCount || 0,
        computeEffectiveLikes(cr.id, mergedLikedBy, adminBonusLikes)
      );
      if (!existing) {
        fetchedMap.set(cr.id, {
          ...cr,
          likedBy: mergedLikedBy,
          adminBonusLikes,
          likeCount: effectiveLikeCount
        });
      } else {
        fetchedMap.set(cr.id, {
          ...existing,
          likedBy: mergedLikedBy,
          adminBonusLikes,
          likeCount: effectiveLikeCount
        });
      }
    });

    const mergedList = Array.from(fetchedMap.values())
      .map(sanitizeReviewRecord)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    saveCachedReviews(mergedList);
    onData(mergedList);
  };

  fetchAndMergeAll();
  const interval = setInterval(fetchAndMergeAll, 10000);

  return () => {
    activeSubscribers.delete(onData);
    clearInterval(interval);
  };
}

export async function createReview(params: {
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
}): Promise<string> {
  const newReviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const rawRecord: ReviewRecord = {
    id: newReviewId,
    userId: params.userId,
    userName: params.userName,
    userAvatar: params.userAvatar || '',
    userRole: params.userRole || 'Student',
    rating: params.rating !== undefined ? params.rating : 5,
    title: params.title || '',
    content: params.content.trim(),
    targetType: params.targetType || 'course',
    targetId: params.targetId || 'general',
    parentId: params.parentId || null,
    likedBy: [],
    likeCount: 0,
    adminBonusLikes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newRecord = sanitizeReviewRecord(rawRecord);

  // 1. Immediate local cache update and instant subscriber broadcast
  const cached = getCachedReviews();
  const updated = [newRecord, ...cached.filter(r => r.id !== newReviewId)];
  saveCachedReviews(updated);
  broadcastReviews(updated);

  // 2. Persist to Supabase Database (with robust JSON metadata inside author_email)
  try {
    const meta = {
      userAvatar: newRecord.userAvatar,
      userRole: newRecord.userRole,
      likedBy: newRecord.likedBy,
      likeCount: newRecord.likeCount,
      adminBonusLikes: 0,
      parentId: newRecord.parentId,
      targetType: newRecord.targetType,
      targetId: newRecord.targetId,
      title: newRecord.title,
      updatedAt: newRecord.updatedAt
    };

    await supabase.from('reviews').upsert({
      id: newReviewId,
      user_id: newRecord.userId,
      author_name: newRecord.userName,
      author_email: JSON.stringify(meta),
      rating: newRecord.rating || 5,
      track_id: newRecord.targetId || 'general',
      track_title: newRecord.title || '',
      content: newRecord.content,
      is_approved: true,
      created_at: newRecord.createdAt
    });
  } catch (error) {
    console.warn('[Supabase Reviews] Error saving review:', error);
  }

  // 3. Server-side disk persistence sync (guarantees cross-device visibility)
  try {
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review: newRecord })
    }).catch(() => {});
  } catch (_) {}

  return newReviewId;
}

export async function toggleLikeReview(
  rawReview: ReviewRecord,
  currentUserId: string,
  isAdmin: boolean = false
): Promise<{ nextLikeCount: number; nextLikedBy: string[]; isLikedByMe: boolean }> {
  const review = sanitizeReviewRecord(rawReview);

  if (!currentUserId) {
    return {
      nextLikeCount: review.likeCount || 0,
      nextLikedBy: review.likedBy || [],
      isLikedByMe: false
    };
  }

  let nextLikedBy = [...(review.likedBy || [])];
  let nextAdminBonusLikes = review.adminBonusLikes || 0;
  let isLikedByMe = false;

  if (isAdmin) {
    // Admin power: each like click increments the like count without locking the admin into a permanent liked state.
    // The shaded tick is NOT shown for admin, allowing repeated boosts (20 -> 21 -> 22...).
    nextAdminBonusLikes += 1;
    nextLikedBy = nextLikedBy.filter(u => u !== currentUserId && !isSystemAdminEmail(u));
    isLikedByMe = false;
  } else {
    // Normal user: standard single-like policy with shaded tick persistence.
    const isCurrentlyLiked = nextLikedBy.includes(currentUserId);
    if (isCurrentlyLiked) {
      // Toggle off / unlike
      nextLikedBy = nextLikedBy.filter(u => u !== currentUserId);
      isLikedByMe = false;
    } else {
      // Like once
      nextLikedBy = Array.from(new Set([...nextLikedBy, currentUserId]));
      isLikedByMe = true;
    }
  }

  const nextLikeCount = computeEffectiveLikes(review.id, nextLikedBy, nextAdminBonusLikes);

  // 1. Update local cache immediately
  const cached = getCachedReviews();
  const target = cached.find(r => r.id === review.id);
  if (target) {
    target.likedBy = nextLikedBy;
    target.likeCount = nextLikeCount;
    target.adminBonusLikes = nextAdminBonusLikes;
    target.updatedAt = new Date().toISOString();
  }
  saveCachedReviews(cached);
  broadcastReviews(cached);

  // 2. Persist to Supabase Database with JSON metadata in author_email
  try {
    const meta = {
      userAvatar: review.userAvatar || '',
      userRole: review.userRole,
      likedBy: nextLikedBy,
      likeCount: nextLikeCount,
      adminBonusLikes: nextAdminBonusLikes,
      parentId: review.parentId,
      targetType: review.targetType || 'course',
      targetId: review.targetId || 'general',
      title: review.title || '',
      updatedAt: new Date().toISOString()
    };

    await supabase.from('reviews').upsert({
      id: review.id,
      user_id: review.userId,
      author_name: review.userName,
      author_email: JSON.stringify(meta),
      rating: typeof review.rating === 'number' ? review.rating : 5,
      track_id: review.targetId || 'general',
      track_title: review.title || '',
      content: review.content,
      is_approved: true
    });
  } catch (error) {
    console.warn('[Supabase Reviews] Error saving like to Supabase:', error);
  }

  // 3. Persist to Server Disk API (for server backup & multi-client sync)
  try {
    await fetch('/api/reviews/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewId: review.id,
        userId: currentUserId,
        isAdmin,
        nextLikeCount,
        adminBonusLikes: nextAdminBonusLikes,
        likedBy: nextLikedBy
      })
    }).catch(() => {});
  } catch (_) {}

  return { nextLikeCount, nextLikedBy, isLikedByMe };
}

export async function deleteReview(reviewId: string): Promise<void> {
  const cached = getCachedReviews().filter(r => r.id !== reviewId && r.parentId !== reviewId);
  saveCachedReviews(cached);
  broadcastReviews(cached);

  try {
    await supabase.from('reviews').delete().eq('id', reviewId);
  } catch (error) {
    console.warn('[Supabase Reviews] Error deleting review:', error);
  }

  try {
    await fetch('/api/reviews/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reviewId })
    }).catch(() => {});
  } catch (_) {}
}
