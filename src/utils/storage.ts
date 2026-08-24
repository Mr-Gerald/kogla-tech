// Kogla Tech State Persistence Engine

import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import heroImage from '../assets/images/hero_coder_image_1779562735408.png';
import academyImage from '../assets/images/academy_image_1779563651039.png';
import servicesImage from '../assets/images/services_image_1779563668755.png';
import projectsImage from '../assets/images/projects_image_1779563685288.png';
import labsImage from '../assets/images/labs_image_1779563699805.png';

export interface Inquiry {
  id: string;
  type: 'enrollment' | 'solution_inquiry' | 'contact';
  title: string; // Course name or service title or custom message
  senderName: string;
  senderEmail: string;
  description: string;
  timestamp: string;
  status: 'Unread' | 'In Progress' | 'Contacted' | 'Archived';
}

export interface ImageConfig {
  hero: string;
  academy: string;
  services: string;
  projects: string;
  labs: string;
}

export const DEFAULT_IMAGES: ImageConfig = {
  hero: heroImage,
  academy: academyImage,
  services: servicesImage,
  projects: projectsImage,
  labs: labsImage
};

export function sanitizeImages(raw: Partial<ImageConfig> | null | undefined): ImageConfig {
  const result: ImageConfig = { ...DEFAULT_IMAGES };
  if (!raw) return result;

  const keys: (keyof ImageConfig)[] = ['hero', 'academy', 'services', 'projects', 'labs'];

  for (const key of keys) {
    const val = raw[key];
    if (typeof val === 'string' && val.trim() !== '') {
      // Catch unbundled dev paths like /src/assets/ or /assets/academy_image_... that causes 404s in prod
      if (
        val.startsWith('/src/assets/') ||
        (val.startsWith('/assets/') && (val.includes('_image_') || val.includes('_coder_')))
      ) {
        result[key] = DEFAULT_IMAGES[key];
      } else {
        result[key] = val;
      }
    } else {
      result[key] = DEFAULT_IMAGES[key];
    }
  }

  return result;
}

const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    type: 'enrollment',
    title: 'AI & Automation Masterclass',
    senderName: 'Alexandra Sterling',
    senderEmail: 'sterling.a@apexcorp.luxury',
    description: 'Enrolling under corporate sponsorship to automate commercial operations pipelines.',
    timestamp: '2026-05-23T14:15:00Z',
    status: 'Unread'
  },
  {
    id: 'inq-2',
    type: 'solution_inquiry',
    title: 'Cyber Defense Infrastructure',
    senderName: 'Marcus Vane',
    senderEmail: 'm.vane@vanesecure.io',
    description: 'Urgent compliance audit and advanced zero-trust defense overhaul requested for multi-regional logistics startup.',
    timestamp: '2026-05-23T15:30:00Z',
    status: 'In Progress'
  }
];

export function getImageConfig(): ImageConfig {
  try {
    const saved = localStorage.getItem('kogla_images');
    if (saved) {
      return { ...DEFAULT_IMAGES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading image configs', e);
  }
  return DEFAULT_IMAGES;
}

export function saveImageConfig(config: ImageConfig): void {
  try {
    localStorage.setItem('kogla_images', JSON.stringify(config));
  } catch (e) {
    console.error('Error saving image configs', e);
  }
}

export function getInquiries(): Inquiry[] {
  try {
    const saved = localStorage.getItem('kogla_inquiries');
    if (saved) {
      return JSON.parse(saved);
    }
    // Seed default clean records on first load
    localStorage.setItem('kogla_inquiries', JSON.stringify(DEFAULT_INQUIRIES));
    return DEFAULT_INQUIRIES;
  } catch (e) {
    console.error('Error reading inquiries', e);
    return DEFAULT_INQUIRIES;
  }
}

export function addInquiry(inquiry: Omit<Inquiry, 'id' | 'timestamp' | 'status'> & { userId?: string }): Inquiry {
  const list = getInquiries();
  const createdId = `inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const currentUser = auth.currentUser;
  
  const created: Inquiry = {
    ...inquiry,
    id: createdId,
    timestamp: new Date().toISOString(),
    status: 'Unread'
  };
  
  // Inject userId if user is currently logged in
  const firestorePayload = {
    ...created,
    userId: currentUser ? currentUser.uid : (inquiry.userId || null)
  };

  const updated = [created, ...list];
  localStorage.setItem('kogla_inquiries', JSON.stringify(updated));

  // Async Firestore dispatch
  try {
    const docRef = doc(db, 'inquiries', createdId);
    setDoc(docRef, firestorePayload).catch((err) => {
      console.error('[Firestore async addInquiry backup]:', err);
    });
  } catch (err) {
    console.error('Firestore connection was not fully loaded yet:', err);
  }

  return created;
}

export function updateInquiryStatus(id: string, status: Inquiry['status']): Inquiry[] {
  const list = getInquiries();
  const updated = list.map(item => item.id === id ? { ...item, status } : item);
  localStorage.setItem('kogla_inquiries', JSON.stringify(updated));
  return updated;
}

export function deleteInquiry(id: string): Inquiry[] {
  const list = getInquiries();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem('kogla_inquiries', JSON.stringify(updated));
  return updated;
}
