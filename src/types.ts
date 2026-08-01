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
  role: 'user' | 'admin';
  isPaid?: boolean;
  xp: number;
  completedRooms: string[];
  phone?: string;
  bio?: string;
  title?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  preferences?: UserPreferences;
  savedItems?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InquiryRecord {
  id: string;
  type: 'enrollment' | 'solution_inquiry' | 'contact';
  title: string;
  senderName: string;
  senderEmail: string;
  description: string;
  timestamp: string;
  status: 'Unread' | 'In Progress' | 'Contacted' | 'Archived';
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
