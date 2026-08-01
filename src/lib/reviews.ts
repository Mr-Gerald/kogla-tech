import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  arrayUnion, 
  arrayRemove, 
  increment 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ReviewRecord } from '../types';

export function subscribeToReviews(onData: (reviews: ReviewRecord[]) => void, onError?: (err: unknown) => void) {
  const reviewsRef = collection(db, 'reviews');
  const q = query(reviewsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const reviews: ReviewRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId || '',
          userName: data.userName || 'Anonymous',
          userAvatar: data.userAvatar || '',
          userRole: data.userRole || 'Student',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          title: data.title || '',
          content: data.content || '',
          targetType: data.targetType || 'platform',
          targetId: data.targetId || 'general',
          parentId: data.parentId || null,
          likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
          likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || '',
        };
      });
      onData(reviews);
    },
    (error) => {
      console.error('Error listening to reviews:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'reviews');
    }
  );
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
  const path = 'reviews';
  try {
    const docData = {
      id: '', // Will be doc ID or assigned after doc creation
      userId: params.userId,
      userName: params.userName,
      userAvatar: params.userAvatar || '',
      userRole: params.userRole || 'Student',
      rating: params.rating !== undefined ? params.rating : 5,
      title: params.title || '',
      content: params.content.trim(),
      targetType: params.targetType || 'platform',
      targetId: params.targetId || 'general',
      parentId: params.parentId || null,
      likedBy: [],
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, path), docData);
    // Update self ID for strict blueprint alignment
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function toggleLikeReview(review: ReviewRecord, currentUserId: string): Promise<void> {
  if (!currentUserId) return;
  const path = `reviews/${review.id}`;
  const isLiked = review.likedBy.includes(currentUserId);

  try {
    const reviewRef = doc(db, 'reviews', review.id);
    if (isLiked) {
      await updateDoc(reviewRef, {
        likedBy: arrayRemove(currentUserId),
        likeCount: Math.max(0, review.likeCount - 1),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(reviewRef, {
        likedBy: arrayUnion(currentUserId),
        likeCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}
