import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SiteConfig {
  companyName: string;
  logoUrl: string;
  logoText: string;
  contactEmail: string;
  contactPhone: string;
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
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  companyName: 'Kogla Tech',
  logoUrl: 'https://scontent.xx.fbcdn.net/v/t1.15752-9/679033424_1340416481327917_3114449704387631566_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_ohc=QTFzuqvVyEwQ7kNvwEQ3HkO&_nc_oc=Adq0Aps1oCzdcFqAZAUORHxlDuik930FWgR7q_bG6Rrw_VSh-1RqFtChA7cCqPbZbATlZ4M_Wu3uMuKpC9WlPuHY&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD5QFiQMxoovDD8V-pDwIuGMWsjPDrhbJXde89ezXPA-rM5w&oe=6A39344C',
  logoText: 'KOGLA TECH',
  contactEmail: 'solutions@kogla-tech.com',
  contactPhone: '+234 812 345 6789',
  communityLink: 'https://chat.whatsapp.com/KoglaTechCommunity',
  whatsappLink: 'https://wa.me/2348123456789',
  telegramLink: 'https://t.me/kogla_tech',
  heroHeadline: 'Empowering the Next Generation of African Developers',
  heroSubheadline: 'Expert software engineering, workflow automation, and immersive academic training hubs crafted for global competitiveness.',
  aboutHeadline: 'Engineered for High-Stakes Operations',
  aboutText: 'We design custom enterprise-grade platforms, establish agile automation pipelines, and host real-time developer sandboxes. Operating from Lagos, we trace the future of computing across Africa.',
  footerCredits: 'Kogla Tech. All system execution logs reserved.',
  fontSizeScale: 100,
  themeMode: 'dark',
};

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  loading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(() => {
    // Optimistic offline / initial load check
    try {
      const saved = localStorage.getItem('kogla_site_config');
      if (saved) {
        return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (_) {}
    return DEFAULT_SITE_CONFIG;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync config from Firestore doc config/site
    const configRef = doc(db, 'config', 'site');
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteConfig;
        const merged = { ...DEFAULT_SITE_CONFIG, ...data };
        setConfig(merged);
        localStorage.setItem('kogla_site_config', JSON.stringify(merged));
      } else {
        // Document does not exist yet. Seed it with default values!
        setDoc(configRef, DEFAULT_SITE_CONFIG).catch((err) => {
          console.warn('[SiteConfig] Auto-seeding config document failed:', err);
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('[SiteConfig] Firestore sync failed, using localStorage fallback:', error);
      setLoading(false);
    });

    return () => unsubscribe();
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

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    const updated = { ...config, ...newConfig };
    
    // Save to Firestore
    const configRef = doc(db, 'config', 'site');
    await setDoc(configRef, updated);
    
    // Update local state instantly too
    setConfig(updated);
    localStorage.setItem('kogla_site_config', JSON.stringify(updated));
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, loading }}>
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
