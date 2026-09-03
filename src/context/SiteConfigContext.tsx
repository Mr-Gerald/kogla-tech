import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
  logoUrl: '',
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

  // Remove old synthetic defaults if present
  if (merged.logoUrl === '/logo512.png' || merged.logoUrl === '/apple-touch-icon.png') {
    merged.logoUrl = '';
  }
  if (merged.faviconUrl === '/apple-touch-icon.png' || merged.faviconUrl === '/logo512.png' || !merged.faviconUrl) {
    merged.faviconUrl = '/favicon.svg';
  }

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
    // 1. Initial async load from Supabase settings / site_config table
    const loadFromSupabase = async () => {
      try {
        const { data: configRow } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'site')
          .single();
        if (configRow && configRow.value) {
          const sanitized = sanitizeSiteConfig(typeof configRow.value === 'string' ? JSON.parse(configRow.value) : configRow.value);
          setConfig(sanitized);
          localStorage.setItem('kogla_site_config', JSON.stringify(sanitized));
        }
      } catch (_) {}

      try {
        const { data: imagesRow } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'images')
          .single();
        if (imagesRow && imagesRow.value) {
          const sanitized = sanitizeImages(typeof imagesRow.value === 'string' ? JSON.parse(imagesRow.value) : imagesRow.value);
          setImages(sanitized);
          localStorage.setItem('kogla_images', JSON.stringify(sanitized));
        }
      } catch (_) {}

      setLoading(false);
    };

    loadFromSupabase();
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

    // Save to Supabase
    try {
      await supabase.from('site_config').upsert({
        key: 'site',
        value: updated,
        updated_at: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('[SiteConfig] Supabase site config upsert notice:', err?.message);
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

    // Save to Supabase
    try {
      await supabase.from('site_config').upsert({
        key: 'images',
        value: cleanImages,
        updated_at: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('[SiteConfig] Supabase images upsert notice:', err?.message);
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
