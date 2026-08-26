import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageConfig, DEFAULT_IMAGES, sanitizeImages } from '../utils/storage';

export interface SiteConfig {
  companyName: string;
  logoUrl: string;
  logoText: string;
  contactEmail: string;
  contactPhone: string;
  whatsappPhone?: string;
  communityLink: string;
  whatsappLink: string;
  telegramLink: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutHeadline: string;
  aboutText: string;
  footerCredits: string;
  fontSizeScale?: number;
  themeMode?: 'dark' | 'light' | 'mixed';
  faviconUrl?: string;
  // Cohort Scheduling & Admissions Status
  cohortBatchName?: string;
  cohortStatus?: string;
  cohortStartDate?: string;
  cohortEndDate?: string;
  cohortPrepPhaseEnabled?: boolean;
  showCountdownTimer?: boolean;
  cohortAnnouncementBanner?: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  companyName: 'Kogla Tech',
  logoUrl: '/logo512.png',
  logoText: 'KOGLA TECH',
  contactEmail: 'solutions@koglatech.com',
  contactPhone: '+234 701 248 9041',
  whatsappPhone: '+234 701 248 9041',
  communityLink: 'https://chat.whatsapp.com/KoglaTechCommunity',
  whatsappLink: 'https://wa.me/2347012489041',
  telegramLink: 'https://t.me/kogla_tech',
  heroHeadline: 'Empowering the Next Generation of African Developers',
  heroSubheadline: 'Expert software engineering, workflow automation, and immersive academic training hubs crafted for global competitiveness.',
  aboutHeadline: 'Engineered for High-Stakes Operations',
  aboutText: 'Founded by Gerald Emechebe (Founder & CEO), we engineer custom enterprise-grade platforms, establish agile automation pipelines, and host real-time developer sandboxes for global competitiveness.',
  footerCredits: 'Founded by Gerald Emechebe (Founder & CEO). All rights reserved.',
  fontSizeScale: 100,
  themeMode: 'dark',
  faviconUrl: '/favicon.svg',
  // Default Cohort Settings (Target Start: September 24, 2026)
  cohortBatchName: 'COHORT CO-2026',
  cohortStatus: 'Admissions Open Now',
  cohortStartDate: '2026-09-24',
  cohortEndDate: '2026-12-18',
  cohortPrepPhaseEnabled: true,
  showCountdownTimer: true,
  cohortAnnouncementBanner: 'Cohort admissions open for September 24, 2026. Interactive lab sandboxes and foundation materials activate upon enrollment.'
};

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  images: ImageConfig;
  updateImages: (newImages: Partial<ImageConfig>) => Promise<void>;
  loading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export function sanitizeSiteConfig(raw?: Partial<SiteConfig> | null): SiteConfig {
  const merged: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...(raw || {}) };

  // Strict Phone & WhatsApp Enforcement (Always set to official +234 701 248 9041)
  merged.contactPhone = '+234 701 248 9041';
  merged.whatsappPhone = '+234 701 248 9041';
  merged.whatsappLink = 'https://wa.me/2347012489041';

  // Strict Email Enforcement
  if (merged.contactEmail === 'solutions@kogla-tech.com' || !merged.contactEmail) {
    merged.contactEmail = 'solutions@koglatech.com';
  }

  return merged;
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(() => {
    // Optimistic offline / initial load check with strict sanitization
    try {
      const saved = localStorage.getItem('kogla_site_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeSiteConfig(parsed);
        localStorage.setItem('kogla_site_config', JSON.stringify(sanitized));
        return sanitized;
      }
    } catch (_) {}
    return DEFAULT_SITE_CONFIG;
  });

  const [images, setImages] = useState<ImageConfig>(() => {
    try {
      const saved = localStorage.getItem('kogla_images');
      if (saved) {
        return sanitizeImages(JSON.parse(saved));
      }
    } catch (_) {}
    return DEFAULT_IMAGES;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync config from Firestore doc config/site
    const configRef = doc(db, 'config', 'site');
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteConfig;
        const sanitized = sanitizeSiteConfig(data);
        setConfig(sanitized);
        localStorage.setItem('kogla_site_config', JSON.stringify(sanitized));
      } else {
        // Document does not exist yet. Use default config.
        setConfig(DEFAULT_SITE_CONFIG);
      }
      setLoading(false);
    }, (error) => {
      console.warn('[SiteConfig] Firestore sync notice, using local config fallback:', error?.message);
      setLoading(false);
    });

    // Sync images from Firestore doc config/images
    const imagesRef = doc(db, 'config', 'images');
    const unsubscribeImages = onSnapshot(imagesRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ImageConfig;
        const sanitized = sanitizeImages(data);
        setImages(sanitized);
        localStorage.setItem('kogla_images', JSON.stringify(sanitized));
      } else {
        // Document does not exist yet. Use default images.
        setImages(DEFAULT_IMAGES);
      }
    }, (error) => {
      console.warn('[SiteConfig] Firestore images sync notice:', error?.message);
    });

    return () => {
      unsubscribe();
      unsubscribeImages();
    };
  }, []);

  useEffect(() => {
    const scale = config.fontSizeScale || 100;
    document.documentElement.style.fontSize = `${scale}%`;
  }, [config.fontSizeScale]);

  useEffect(() => {
    const mode = config.themeMode || 'dark';
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-mixed');
    document.documentElement.classList.add(`theme-${mode}`);
  }, [config.themeMode]);

  useEffect(() => {
    const favicon = config.faviconUrl?.trim() || config.logoUrl?.trim() || '/favicon.svg';
    const iconLinks = document.querySelectorAll<HTMLLinkElement>(
      "link[rel*='icon'], link[rel='apple-touch-icon'], link[rel='shortcut icon']"
    );
    if (iconLinks.length > 0) {
      iconLinks.forEach(link => {
        link.href = favicon;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = favicon;
      document.head.appendChild(link);
    }
  }, [config.faviconUrl, config.logoUrl]);

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    const updated = sanitizeSiteConfig({ ...config, ...newConfig });
    
    // Update local state instantly and save to localStorage
    setConfig(updated);
    try {
      localStorage.setItem('kogla_site_config', JSON.stringify(updated));
    } catch (e) {
      console.warn('[SiteConfig] localStorage config save warning:', e);
    }

    // Save to Firestore with quota error protection
    try {
      const configRef = doc(db, 'config', 'site');
      await setDoc(configRef, updated);
    } catch (err: any) {
      console.warn('[SiteConfig] Firestore site config setDoc notice:', err?.message);
      // If Firestore quota is exceeded, local storage has already saved successfully.
      // Do not crash or block the UI.
    }
  };

  const updateImages = async (newImages: Partial<ImageConfig>) => {
    const updated = { ...DEFAULT_IMAGES, ...images, ...newImages };
    
    // Ensure clean string values for all keys
    const cleanImages: ImageConfig = {
      hero: updated.hero || DEFAULT_IMAGES.hero,
      academy: updated.academy || DEFAULT_IMAGES.academy,
      services: updated.services || DEFAULT_IMAGES.services,
      projects: updated.projects || DEFAULT_IMAGES.projects,
      labs: updated.labs || DEFAULT_IMAGES.labs,
    };
    
    // Update local state and localStorage immediately FIRST
    setImages(cleanImages);
    try {
      localStorage.setItem('kogla_images', JSON.stringify(cleanImages));
    } catch (e) {
      console.warn('[SiteConfig] localStorage save warning:', e);
    }

    // Attempt cloud save to Firestore
    try {
      const imagesRef = doc(db, 'config', 'images');
      await setDoc(imagesRef, cleanImages);
    } catch (err: any) {
      console.warn('[SiteConfig] Firestore images setDoc notice (local storage active):', err?.message);
    }
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, images, updateImages, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
