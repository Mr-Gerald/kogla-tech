export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  xp: number;
  completedRooms: string[];
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
