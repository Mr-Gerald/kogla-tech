import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, MessageSquare, Trash2, LogIn, Send, CornerDownRight, CheckCircle2, UserCheck } from 'lucide-react';
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
  const { user, profile, signInWithGoogle } = useAuth();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reply target state (which review ID is actively being replied to)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Liking loading state per review ID
  const [likingIds, setLikingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReviews((allReviews) => {
      // Filter by targetType & targetId if specified
      const filtered = allReviews.filter(
        (r) => r.targetType === targetType && (targetId === 'general' || r.targetId === targetId)
      );
      setReviews(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetType, targetId]);

  // Handle post new review
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContent.trim()) return;

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
    if (!user || !replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      await createReview({
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Kogla Developer',
        userAvatar: user.photoURL || '',
        userRole: profile?.role === 'admin' ? 'Kogla Admin' : 'Member',
        rating: 0, // Replies don't require rating
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
      signInWithGoogle();
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

  // Calculate average rating
  const reviewsWithRating = reviews.filter((r) => !r.parentId && r.rating && r.rating > 0);
  const avgRating =
    reviewsWithRating.length > 0
      ? (reviewsWithRating.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsWithRating.length).toFixed(1)
      : '5.0';

  return (
    <section id="reviews" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto font-sans text-gray-100">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-zinc-850 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block mb-1">
            VERIFIED COMMUNITY FEEDBACK
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl mt-1">
            {subtitle}
          </p>
        </div>

        {/* AGGREGATE STATS BADGE */}
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-lg shadow-lg self-start md:self-auto">
          <div className="text-2xl font-bold font-display text-gold-400 leading-none">{avgRating}</div>
          <div className="space-y-0.5">
            <div className="flex items-center text-gold-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} className="fill-gold-400 text-gold-400" />
              ))}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              {reviewsWithRating.length} {reviewsWithRating.length === 1 ? 'Review' : 'Reviews'} • Real-time
            </div>
          </div>
        </div>
      </div>

      {/* NEW REVIEW SUBMISSION BLOCK */}
      <div className="bg-zinc-950/90 border border-zinc-850 rounded-lg p-5 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquare size={16} className="text-gold-500" /> Share Your Experience
        </h3>

        {user ? (
          <form onSubmit={handlePostReview} className="space-y-4">
            {/* Rating Stars Selection */}
            <div className="flex flex-wrap items-center gap-3 bg-zinc-900/80 p-3.5 rounded-md border border-zinc-800 shadow-inner">
              <span className="text-xs text-zinc-300 font-mono font-semibold">Your Rating:</span>
              <div 
                className="flex items-center gap-1.5"
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
                      className="p-1.5 focus:outline-none transition-all hover:scale-125 group relative"
                      title={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        size={22}
                        className={`transition-all duration-200 ${
                          isGold
                            ? 'fill-gold-400 text-gold-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-110'
                            : 'text-zinc-600 hover:text-gold-400/50'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-mono text-gold-400 font-bold ml-2 px-2.5 py-1 bg-gold-500/10 border border-gold-500/30 rounded">
                {hoverRating !== null ? hoverRating : newRating} / 5 Stars {
                  (hoverRating !== null ? hoverRating : newRating) === 5 ? '★ Exceptional' :
                  (hoverRating !== null ? hoverRating : newRating) === 4 ? '★ Very Good' :
                  (hoverRating !== null ? hoverRating : newRating) === 3 ? '★ Good' :
                  (hoverRating !== null ? hoverRating : newRating) === 2 ? '★ Fair' : '★ Needs Improvement'
                }
              </span>
            </div>

            {/* Title & Content Fields */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Review Title (e.g. Exceptional Full-Stack Academy & Services)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 transition-colors"
              />
              <textarea
                rows={3}
                placeholder="Write your review or feedback here... (Publicly posted to Kogla Tech community)"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 transition-colors resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <UserCheck size={14} className="text-emerald-400" />
                Posting as <span className="text-white font-semibold">{user.displayName || user.email}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newContent.trim()}
                className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold rounded text-xs uppercase tracking-wider font-display flex items-center gap-2 transition-all shadow-md"
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'} <Send size={14} />
              </button>
            </div>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> Review published successfully!
              </motion.div>
            )}
          </form>
        ) : (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded p-4 text-center space-y-3">
            <p className="text-xs text-zinc-300">
              Only logged-in members can submit reviews and participate in community discussions.
            </p>
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider rounded font-display inline-flex items-center gap-2 shadow"
            >
              <LogIn size={14} /> Sign In With Google to Review
            </button>
          </div>
        )}
      </div>

      {/* REVIEWS & THREADED REPLIES LIST */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-xs font-mono">
            Loading community feedback...
          </div>
        ) : topLevelReviews.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950/40 border border-zinc-900 rounded p-6">
            <MessageSquare size={32} className="mx-auto text-zinc-600 mb-2" />
            <h4 className="text-sm text-zinc-300 font-semibold mb-1">No Reviews Yet</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Be the first logged-in user to share your review or question with Kogla Tech!
            </p>
          </div>
        ) : (
          topLevelReviews.map((review) => {
            const replies = getReplies(review.id);
            const isLikedByMe = user ? review.likedBy.includes(user.uid) : false;

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950 border border-zinc-850 rounded-lg p-5 shadow-lg space-y-3"
              >
                {/* TOP-LEVEL REVIEW HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-9 h-9 rounded-full object-cover border border-gold-500/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center font-bold text-gold-400 text-xs">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-display">
                          {review.userName}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-zinc-900 text-gold-400 border border-gold-500/30 rounded uppercase">
                          {review.userRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  {review.rating && review.rating > 0 && (
                    <div className="flex items-center gap-0.5 text-gold-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= (review.rating || 5) ? 'fill-gold-400' : 'text-zinc-700'}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* REVIEW TITLE & CONTENT */}
                {review.title && (
                  <h4 className="text-xs font-bold text-gold-300 uppercase tracking-wide">
                    {review.title}
                  </h4>
                )}
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>

                {/* ACTION BAR (LIKE, REPLY, DELETE) */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    {/* LIKE BUTTON */}
                    <button
                      onClick={() => handleLike(review)}
                      disabled={likingIds[review.id]}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors text-xs ${
                        isLikedByMe
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                      }`}
                    >
                      <ThumbsUp size={13} className={isLikedByMe ? 'fill-gold-400' : ''} />
                      <span>{review.likeCount}</span>
                      <span className="text-[10px] uppercase hidden sm:inline">
                        {isLikedByMe ? 'Liked' : 'Like'}
                      </span>
                    </button>

                    {/* REPLY BUTTON */}
                    <button
                      onClick={() => {
                        if (!user) {
                          signInWithGoogle();
                        } else {
                          setReplyingToId(replyingToId === review.id ? null : review.id);
                        }
                      }}
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-gold-400 transition-colors text-xs"
                    >
                      <MessageSquare size={13} />
                      <span>Reply ({replies.length})</span>
                    </button>
                  </div>

                  {/* DELETE BUTTON (IF AUTHOR OR ADMIN) */}
                  {user && (user.uid === review.userId || profile?.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      title="Delete review"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* INLINE REPLY FORM */}
                <AnimatePresence>
                  {replyingToId === review.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 pl-4 border-l-2 border-gold-500/40 space-y-2"
                    >
                      <textarea
                        rows={2}
                        placeholder={`Replying to ${review.userName}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReplyingToId(null)}
                          className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePostReply(review.id)}
                          disabled={isSubmittingReply || !replyContent.trim()}
                          className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold text-xs rounded font-display uppercase tracking-wider flex items-center gap-1"
                        >
                          Post Reply <Send size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* THREADED NESTED REPLIES */}
                {replies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-900/80 space-y-3 pl-4 sm:pl-6 border-l-2 border-zinc-850">
                    {replies.map((reply) => {
                      const isReplyLikedByMe = user ? reply.likedBy.includes(user.uid) : false;

                      return (
                        <div
                          key={reply.id}
                          className="bg-zinc-900/60 border border-zinc-850/80 rounded p-3 space-y-2 relative"
                        >
                          <CornerDownRight size={14} className="absolute -left-5 top-3 text-gold-500/50" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {reply.userAvatar ? (
                                <img
                                  src={reply.userAvatar}
                                  alt={reply.userName}
                                  className="w-6 h-6 rounded-full object-cover border border-gold-500/30"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center font-bold text-gold-400 text-[10px]">
                                  {reply.userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-xs font-bold text-white">{reply.userName}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded">
                                {reply.userRole}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(reply.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-300 whitespace-pre-line">{reply.content}</p>

                          <div className="flex items-center justify-between pt-1 text-xs font-mono">
                            <button
                              onClick={() => handleLike(reply)}
                              disabled={likingIds[reply.id]}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[11px] ${
                                isReplyLikedByMe
                                  ? 'text-gold-400 font-bold'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              <ThumbsUp size={11} className={isReplyLikedByMe ? 'fill-gold-400' : ''} />
                              <span>{reply.likeCount}</span>
                            </button>

                            {user && (user.uid === reply.userId || profile?.role === 'admin') && (
                              <button
                                onClick={() => handleDelete(reply.id)}
                                className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                                title="Delete reply"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};
