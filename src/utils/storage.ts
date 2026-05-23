// Kogla Tech State Persistence Engine

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

const DEFAULT_IMAGES: ImageConfig = {
  hero: '/src/assets/images/hero_coder_image_1779562735408.png',
  academy: '/src/assets/images/academy_image_1779563651039.png',
  services: '/src/assets/images/services_image_1779563668755.png',
  projects: '/src/assets/images/projects_image_1779563685288.png',
  labs: '/src/assets/images/labs_image_1779563699805.png'
};

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

export function addInquiry(inquiry: Omit<Inquiry, 'id' | 'timestamp' | 'status'>): Inquiry {
  const list = getInquiries();
  const created: Inquiry = {
    ...inquiry,
    id: `inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    status: 'Unread'
  };
  const updated = [created, ...list];
  localStorage.setItem('kogla_inquiries', JSON.stringify(updated));
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
