import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, MessageSquare, Trash2, LogIn, Send, CornerDownRight, CheckCircle2, UserCheck, ShieldCheck, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ReviewRecord } from '../types';
import { subscribeToReviews, createReview, toggleLikeReview, deleteReview } from '../lib/reviews';

interface ReviewSectionProps {
  targetType?: string;
  targetId?: string;
  title?: string;
  subtitle?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  targetType = 'platform',
  targetId = 'general',
  title = 'Community Reviews & Ratings',
  subtitle = 'Real feedback from developers, students, and corporate partners across our ecosystem.',
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // New review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reply target state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Liking loading state per review ID
  const [likingIds, setLikingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReviews((allReviews) => {
      const filtered = allReviews.filter((r) => {
        if (!targetType || targetType === 'platform') {
          return true;
        }
        if (targetType === 'course') {
          const normTarget = (targetId || 'web-development').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const rTarget = (r.targetId || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            rTarget === normTarget ||
            (normTarget !== '' && rTarget.includes(normTarget)) ||
            (rTarget !== '' && normTarget.includes(rTarget)) ||
            r.targetType === 'platform' ||
            r.targetId === 'general'
          );
        }
        return r.targetType === targetType && (targetId === 'general' || r.targetId === targetId);
      });
      setReviews(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetType, targetId]);

  // Handle post new review
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createReview({
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Kogla Developer',
        userAvatar: user.photoURL || '',
        userRole: profile?.role === 'admin' ? 'Kogla Admin' : 'Academy Student',
        rating: newRating,
        title: newTitle.trim(),
        content: newContent.trim(),
        targetType,
        targetId,
      });

      setNewTitle('');
      setNewContent('');
      setNewRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post reply
  const handlePostReply = async (parentId: string) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      await createReview({
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Kogla Developer',
        userAvatar: user.photoURL || '',
        userRole: profile?.role === 'admin' ? 'Kogla Admin' : 'Member',
        rating: 0,
        title: '',
        content: replyContent.trim(),
        targetType,
        targetId,
        parentId,
      });

      setReplyContent('');
      setReplyingToId(null);
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle like toggle
  const handleLike = async (review: ReviewRecord) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (likingIds[review.id]) return;

    setLikingIds((prev) => ({ ...prev, [review.id]: true }));
    try {
      await toggleLikeReview(review, user.uid);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikingIds((prev) => ({ ...prev, [review.id]: false }));
    }
  };

  // Handle delete
  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteReview(reviewId);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Organize reviews into top-level and nested replies
  const topLevelReviews = reviews.filter((r) => !r.parentId);
  const getReplies = (parentId: string) => reviews.filter((r) => r.parentId === parentId);

  // Filtered reviews
  const displayedReviews = filterRating 
    ? topLevelReviews.filter(r => (r.rating || 5) === filterRating)
    : topLevelReviews;

  // Calculate average rating
  const reviewsWithRating = topLevelReviews.filter((r) => r.rating && r.rating > 0);
  const avgRating =
    reviewsWithRating.length > 0
      ? (reviewsWithRating.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsWithRating.length).toFixed(1)
      : '5.0';

  // Calculate aggregate rating breakdown
  const totalWithRating = reviewsWithRating.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsWithRating.forEach((r) => {
    const rval = r.rating || 5;
    if (rval >= 1 && rval <= 5) {
      ratingCounts[rval as 5 | 4 | 3 | 2 | 1]++;
    }
  });

  return (
    <section id="reviews" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto font-sans text-gray-100">
      
      {/* SECTION HEADER (COMPACT) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-zinc-850 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block mb-0.5">
            VERIFIED COMMUNITY FEEDBACK
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* COMPACT OVERALL BADGE */}
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded shadow shrink-0 self-start sm:self-auto">
          <div className="text-2xl font-bold font-display text-gold-400 leading-none">{avgRating}</div>
          <div className="space-y-0.5">
            <div className="flex items-center text-gold-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={11} className="fill-gold-400 text-gold-400" />
              ))}
            </div>
            <div className="text-[9px] text-zinc-400 font-mono">
              {topLevelReviews.length} Reviews • Verified
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SIDE-BY-SIDE HIGH-DENSITY LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: SUMMARY & REVIEW FORM (COMPACT) ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* RATING BREAKDOWN CARD */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-wider">
                Rating Breakdown
              </span>
              {filterRating && (
                <button
                  onClick={() => setFilterRating(null)}
                  className="text-[10px] text-zinc-400 hover:text-gold-400 font-mono underline"
                >
                  Clear Filter ({filterRating}★)
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingCounts[stars as 5 | 4 | 3 | 2 | 1] || 0;
                const percentage = totalWithRating > 0 ? (count / totalWithRating) * 100 : 0;
                const isSelected = filterRating === stars;

                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                    className={`w-full flex items-center gap-2.5 text-xs py-1 px-2 rounded transition-colors text-left cursor-pointer ${
                      isSelected ? 'bg-gold-500/10 border border-gold-500/30' : 'hover:bg-zinc-900'
                    }`}
                  >
                    <span className="w-8 text-right text-zinc-300 font-mono text-[11px] font-medium shrink-0 flex items-center gap-1 justify-end">
                      {stars} <Star size={10} className="fill-gold-400 text-gold-400 shrink-0" />
                    </span>
                    <div className="flex-1 h-1.5 bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
                      <div 
                        className="h-full bg-gold-400 rounded transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-zinc-500 text-right font-mono text-[10px] shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMPACT SUBMISSION FORM */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={13} className="text-gold-500" /> Share Feedback / Review
            </h3>

            {user ? (
              <form onSubmit={handlePostReview} className="space-y-3">
                {/* Star Picker */}
                <div className="flex items-center justify-between bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                  <span className="text-[11px] text-zinc-300 font-mono">Rating:</span>
                  <div 
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeStarCount = hoverRating !== null ? hoverRating : newRating;
                      const isGold = star <= activeStarCount;

                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            size={16}
                            className={isGold ? 'fill-gold-400 text-gold-400' : 'text-zinc-700 hover:text-gold-400/50'}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-mono text-gold-400 font-bold">
                    {hoverRating !== null ? hoverRating : newRating} / 5★
                  </span>
                </div>

                {/* Title & Content */}
                <input
                  type="text"
                  placeholder="Summary title (e.g. Exceptional instructor support)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
                
                <textarea
                  rows={2}
                  placeholder="Your review or question for Kogla Tech community..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">
                    As: <b>{user.displayName || user.email?.split('@')[0]}</b>
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmitting || !newContent.trim()}
                    className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold rounded text-xs uppercase tracking-wider font-display flex items-center gap-1.5 transition-all cursor-pointer shadow"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Review'} <Send size={11} />
                  </button>
                </div>

                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-mono rounded flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={12} /> Review published live!
                  </motion.div>
                )}
              </form>
            ) : (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded p-3 text-center space-y-2">
                <p className="text-[11px] text-zinc-400">
                  Sign in with Google to post your feedback and engage in student discussions.
                </p>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider rounded font-display inline-flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <LogIn size={13} /> Sign In to Review
                </button>
              </div>
            )}
          </div>

          {/* TRUST BADGE */}
          <div className="p-3 bg-zinc-950 border border-zinc-850 rounded text-[10px] font-mono text-zinc-400 flex items-center gap-2">
            <ShieldCheck size={14} className="text-gold-400 shrink-0" />
            <span>Verified student & client submissions with direct instructor replies.</span>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: COMPACT REVIEWS FEED ================= */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="flex items-center justify-between pb-1 border-b border-zinc-850">
            <span className="text-[11px] font-mono text-zinc-400">
              Showing <b>{displayedReviews.length}</b> {filterRating ? `${filterRating}-star` : ''} review{displayedReviews.length === 1 ? '' : 's'}
            </span>
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="text-[10px] font-mono text-gold-400 hover:underline"
              >
                View all reviews
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-mono">
              Loading reviews feed...
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="text-center py-10 bg-zinc-950 border border-zinc-850 rounded p-6">
              <MessageSquare size={24} className="mx-auto text-zinc-600 mb-2" />
              <h4 className="text-xs text-zinc-300 font-semibold mb-1">No Reviews Found</h4>
              <p className="text-[11px] text-zinc-500">
                {filterRating ? `No ${filterRating}-star reviews yet.` : 'Be the first user to submit a review!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedReviews.map((review) => {
                const replies = getReplies(review.id);
                const isLikedByMe = user ? review.likedBy?.includes(user.uid) : false;
                const isReplying = replyingToId === review.id;
                const isAuthorOrAdmin = user && (user.uid === review.userId || profile?.role === 'admin');

                return (
                  <div
                    key={review.id}
                    className="bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded p-3 space-y-2 transition-all shadow-sm"
                  >
                    {/* TOP LINE: USER, ROLE, DATE, STARS */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-6 h-6 rounded-full object-cover border border-gold-500/40 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center font-bold text-gold-400 text-[10px] shrink-0">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white font-display leading-none">
                              {review.userName}
                            </span>
                            <span className="text-[8px] font-mono px-1.5 py-0.2 bg-zinc-900 text-gold-400 border border-gold-500/30 rounded uppercase font-semibold">
                              {review.userRole || 'Student'}
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      {review.rating && review.rating > 0 && (
                        <div className="flex items-center gap-0.5 text-gold-400 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              className={s <= (review.rating || 5) ? 'fill-gold-400' : 'text-zinc-700'}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* TITLE & CONTENT */}
                    {review.title && (
                      <h4 className="text-xs font-bold text-gold-300 leading-tight">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {review.content}
                    </p>

                    {/* COMPACT ACTION BAR */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-900/80 text-[11px] font-mono">
                      <div className="flex items-center gap-3">
                        {/* Like */}
                        <button
                          onClick={() => handleLike(review)}
                          disabled={likingIds[review.id]}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer ${
                            isLikedByMe
                              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          <ThumbsUp size={10} className={isLikedByMe ? 'fill-gold-400' : ''} />
                          <span>{review.likeCount || 0}</span>
                        </button>

                        {/* Reply Toggle */}
                        <button
                          onClick={() => {
                            setReplyingToId(isReplying ? null : review.id);
                            setReplyContent('');
                          }}
                          className="text-zinc-400 hover:text-gold-400 flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          <CornerDownRight size={10} />
                          <span>Reply {replies.length > 0 ? `(${replies.length})` : ''}</span>
                        </button>
                      </div>

                      {/* Delete */}
                      {isAuthorOrAdmin && (
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-zinc-500 hover:text-red-400 text-[10px] p-1 transition-colors cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>

                    {/* NESTED REPLIES */}
                    {replies.length > 0 && (
                      <div className="pl-3 border-l-2 border-gold-500/30 space-y-2 mt-2 pt-1">
                        {replies.map((reply) => {
                          const isReplyAuthorOrAdmin = user && (user.uid === reply.userId || profile?.role === 'admin');
                          return (
                            <div key={reply.id} className="bg-zinc-900/50 p-2 rounded text-[11px] space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white font-display text-[11px]">
                                    {reply.userName}
                                  </span>
                                  <span className="text-[8px] font-mono px-1 py-0.2 bg-black text-gold-400 border border-gold-500/20 rounded uppercase">
                                    {reply.userRole}
                                  </span>
                                </div>
                                <span className="text-[8px] text-zinc-500 font-mono">
                                  {new Date(reply.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <p className="text-zinc-300 font-sans text-[11px] leading-snug">
                                {reply.content}
                              </p>
                              {isReplyAuthorOrAdmin && (
                                <div className="text-right">
                                  <button
                                    onClick={() => handleDelete(reply.id)}
                                    className="text-[9px] text-zinc-500 hover:text-red-400 font-mono cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* REPLY INPUT FIELD */}
                    {isReplying && (
                      <div className="pl-3 border-l-2 border-gold-500/40 pt-2 space-y-2">
                        <textarea
                          rows={2}
                          placeholder={`Reply to ${review.userName}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingToId(null)}
                            className="px-2.5 py-1 text-zinc-400 hover:text-white text-[10px] font-mono uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isSubmittingReply || !replyContent.trim()}
                            onClick={() => handlePostReply(review.id)}
                            className="px-3 py-1 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold text-[10px] uppercase tracking-wider font-display rounded transition-all cursor-pointer shadow"
                          >
                            {isSubmittingReply ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
