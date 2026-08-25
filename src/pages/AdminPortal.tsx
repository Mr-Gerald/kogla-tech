import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig, SiteConfig } from '../context/SiteConfigContext';
import { db, safeFirestoreWrite } from '../lib/firebase';
import { getSupabaseUserProfiles } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getImageConfig, 
  saveImageConfig, 
  Inquiry, 
  ImageConfig,
  DEFAULT_IMAGES 
} from '../utils/storage';
import { UserProfile, AffiliatePartner, ReferralLead, CertificateRecord } from '../types';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Layers, 
  Image as ImageIcon, 
  Mail, 
  Check, 
  Trash2, 
  TrendingUp, 
  BookOpen, 
  Zap, 
  RefreshCw, 
  Lock, 
  Eye, 
  Briefcase, 
  Sparkles, 
  ArrowUpRight,
  Upload,
  Users,
  Bell,
  Send,
  Loader2,
  Calendar,
  CheckCircle,
  FileText,
  Terminal,
  Save,
  RotateCcw,
  Award,
  ShieldCheck,
  QrCode,
  Printer,
  DollarSign,
  Clock,
  CheckCircle2,
  UserCheck,
  Plus,
  Tag,
  ExternalLink,
  Copy
} from 'lucide-react';
import { 
  getAllAffiliates, 
  getAllReferrals, 
  approveReferralPayment, 
  markReferralPaidOut, 
  saveAffiliatePartner,
  deleteReferralLead,
  deleteAffiliatePartner,
  purgeAllTestReferralsAndAffiliates
} from '../lib/affiliates';
import { generateAmbassadorAgreementPdf } from '../lib/agreementPdfGenerator';
import { getAllCertificates, issueCertificate, FOUNDER_NAME, FOUNDER_TITLE, getFounderSignature, saveFounderSignature } from '../lib/certificates';
import { makeSignatureTransparent } from '../lib/signatureProcessor';
import { ACADEMY_COURSES, formatNaira, getCustomPricingMap, saveCustomPricingMap, getAllCourses } from '../data/coursesPricing';
import { OfficialCertificate } from '../components/OfficialCertificate';

export default function AdminPortal() {
  const { user, profile, logout, loading } = useAuth();
  
  // Site Settings config hooks
  const { config, updateConfig, images: syncImages, updateImages } = useSiteConfig();

  const [images, setImages] = useState<ImageConfig>(syncImages);

  useEffect(() => {
    if (syncImages) {
      setImages(syncImages);
    }
  }, [syncImages]);

  // Firestore DB states
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Notifications Dispatcher state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tab, setTab] = useState<'leads' | 'affiliates' | 'pricing' | 'certificates' | 'users' | 'images' | 'settings'>('leads');

  // Course Pricing Editor State
  const [coursePrices, setCoursePrices] = useState<Record<string, { onlinePrice: number; physicalPrice: number }>>({});
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  useEffect(() => {
    const existing = getCustomPricingMap();
    const initMap: Record<string, { onlinePrice: number; physicalPrice: number }> = {};
    ACADEMY_COURSES.forEach(c => {
      initMap[c.slug] = {
        onlinePrice: existing[c.slug]?.onlinePrice ?? c.onlinePrice,
        physicalPrice: existing[c.slug]?.physicalPrice ?? c.physicalPrice
      };
    });
    setCoursePrices(initMap);
  }, []);

  const handlePriceChange = (slug: string, type: 'onlinePrice' | 'physicalPrice', val: number) => {
    setCoursePrices(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [type]: val
      }
    }));
  };

  const handleSaveCoursePricing = async () => {
    setIsSavingPricing(true);
    try {
      saveCustomPricingMap(coursePrices);
      // Also persist to Firestore config/courses_pricing if available
      try {
        const pricingRef = doc(db, 'config', 'courses_pricing');
        await setDoc(pricingRef, { pricing: coursePrices, updatedAt: new Date().toISOString() });
      } catch (cloudErr) {
        console.warn('Firestore pricing sync note:', cloudErr);
      }
      triggerSuccess('All 11 course track tuition prices updated and synced globally across the platform!');
    } catch (err: any) {
      console.error('Save pricing error:', err);
      setErrorMsg(`Failed saving prices: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleResetCoursePricing = () => {
    if (window.confirm('Reset all course tuition prices back to original default catalog prices?')) {
      const resetMap: Record<string, { onlinePrice: number; physicalPrice: number }> = {};
      ACADEMY_COURSES.forEach(c => {
        resetMap[c.slug] = {
          onlinePrice: c.onlinePrice,
          physicalPrice: c.physicalPrice
        };
      });
      setCoursePrices(resetMap);
      saveCustomPricingMap(resetMap);
      triggerSuccess('Course pricing reset to factory defaults.');
    }
  };

  // Affiliates & Creator Pipeline States
  const [affiliates, setAffiliates] = useState<AffiliatePartner[]>([]);
  const [referrals, setReferrals] = useState<ReferralLead[]>([]);
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);
  const [approvingReferralId, setApprovingReferralId] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [activeApprovalLead, setActiveApprovalLead] = useState<ReferralLead | null>(null);

  // New Affiliate Modal
  const [showNewAffiliateModal, setShowNewAffiliateModal] = useState(false);
  const [newAffCode, setNewAffCode] = useState('');
  const [newAffName, setNewAffName] = useState('');
  const [newAffEmail, setNewAffEmail] = useState('');
  const [newAffPhone, setNewAffPhone] = useState('');

  // Agreement PDF Generator State (for generating contracts for incoming ambassadors)
  const [agreeAmbName, setAgreeAmbName] = useState('');
  const [agreePromoCode, setAgreePromoCode] = useState('[YOUR_CODE]');
  const [agreeEmail, setAgreeEmail] = useState('');
  const [agreeHandle, setAgreeHandle] = useState('');
  const [agreeTier1Rate, setAgreeTier1Rate] = useState(6);
  const [agreeTier2Rate, setAgreeTier2Rate] = useState(10);
  const [agreeDiscountRate, setAgreeDiscountRate] = useState(5);
  const [isGeneratingAgreement, setIsGeneratingAgreement] = useState(false);
  const [lastGeneratedInfo, setLastGeneratedInfo] = useState<{name: string; email: string; code: string} | null>(null);

  // Certificates State
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);

  // Founder Signature State
  const [founderSig, setFounderSig] = useState(getFounderSignature());
  const [uploadingFounderSig, setUploadingFounderSig] = useState(false);
  const [processingSigEffect, setProcessingSigEffect] = useState(false);
  const [sigColorMode, setSigColorMode] = useState<'gold' | 'white' | 'original'>('gold');
  const founderSigInputRef = React.useRef<HTMLInputElement>(null);

  const handleFounderSigUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file for the founder signature.');
      return;
    }
    setUploadingFounderSig(true);
    try {
      // Automatically extract pure transparent signature
      const transparentDataUrl = await makeSignatureTransparent(file, {
        mode: sigColorMode,
        autoCrop: true,
        threshold: 0.28
      });
      setFounderSig(transparentDataUrl);
      saveFounderSignature(transparentDataUrl);
    } catch (err) {
      console.error('Failed to process signature:', err);
      alert('Failed to process signature image.');
    } finally {
      setUploadingFounderSig(false);
    }
  };

  const handleCleanSignature = async (modeToApply: 'gold' | 'white' | 'original' = sigColorMode) => {
    if (!founderSig) return;
    setProcessingSigEffect(true);
    try {
      const cleanTransparent = await makeSignatureTransparent(founderSig, {
        mode: modeToApply,
        autoCrop: true,
        threshold: 0.28
      });
      setFounderSig(cleanTransparent);
      saveFounderSignature(cleanTransparent);
      setSigColorMode(modeToApply);
    } catch (err) {
      console.error('Failed to apply transparency:', err);
      alert('Could not strip background. Please check the image source.');
    } finally {
      setProcessingSigEffect(false);
    }
  };
  
  // Issue Certificate Form State
  const [certStudentName, setCertStudentName] = useState('');
  const [certStudentEmail, setCertStudentEmail] = useState('');
  const [certCourseTitle, setCertCourseTitle] = useState(ACADEMY_COURSES[0].title);
  const [certMode, setCertMode] = useState<'Online Interactive Cohort' | 'Physical Hub Immersion'>('Online Interactive Cohort');
  const [certGrade, setCertGrade] = useState('Distinction (Top 5%)');
  const [isIssuingCert, setIsIssuingCert] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [siteForm, setSiteForm] = useState<SiteConfig>(config);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setSiteForm(config);
    }
  }, [config]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateConfig(siteForm);
      triggerSuccess('Site configurations synchronized globally across the live database!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed updating configurations: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSiteForm(prev => ({ ...prev, logoUrl: reader.result }));
          triggerSuccess('Logo file loaded! Submit settings below to commit changes.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSiteForm(prev => ({ ...prev, faviconUrl: reader.result }));
          triggerSuccess('Favicon file loaded! Submit settings below to commit changes.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Load local state & Firestore Listeners on Auth load
  useEffect(() => {
    if (profile?.role === 'admin') {
      // 1. Listen to dynamic child inquiries from Firestore
      const inquiriesRef = collection(db, 'inquiries');
      const unsubInquiries = onSnapshot(inquiriesRef, (snapshot) => {
        const loaded: Inquiry[] = [];
        snapshot.forEach((snap) => {
          loaded.push(snap.data() as Inquiry);
        });
        // Sort stably on client side descending by timestamp
        loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setInquiries(loaded);
      }, (err) => {
        console.error('Firestore inquiries sync failed:', err);
      });

      // 2. Load registered profiles from Supabase profile store
      const loadedSupabaseUsers = getSupabaseUserProfiles();
      loadedSupabaseUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setUsers(loadedSupabaseUsers);

      const unsubUsers = () => {};

      return () => {
        unsubInquiries();
        unsubUsers();
      };
    }
  }, [profile]);

  // Load Affiliates & Certificates data
  const loadAffiliatesData = async () => {
    setLoadingAffiliates(true);
    try {
      const affs = await getAllAffiliates();
      setAffiliates(affs);
      const refs = await getAllReferrals();
      setReferrals(refs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAffiliates(false);
    }
  };

  const loadCertificatesData = async () => {
    setLoadingCerts(true);
    try {
      const certs = await getAllCertificates();
      setCertificates(certs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (tab === 'affiliates') {
      loadAffiliatesData();
    } else if (tab === 'certificates') {
      loadCertificatesData();
    }
  }, [tab]);

  // Affiliate Handlers
  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApprovalLead) return;
    setApprovingReferralId(activeApprovalLead.id);
    try {
      await approveReferralPayment(activeApprovalLead.id, approvalNote || 'Bank tuition payment verified');
      triggerSuccess(`Payment verified! ${activeApprovalLead.studentName}'s enrollment is confirmed.`);
      setActiveApprovalLead(null);
      setApprovalNote('');
      await loadAffiliatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed approving payment: ${err.message}`);
    } finally {
      setApprovingReferralId(null);
    }
  };

  const handleMarkPaidOutAction = async (referralId: string) => {
    if (!window.confirm('Mark this affiliate commission as paid out to the creator\'s bank account?')) return;
    try {
      await markReferralPaidOut(referralId);
      triggerSuccess('Affiliate commission marked as Paid Out!');
      await loadAffiliatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed marking payout: ${err.message}`);
    }
  };

  const handleDeleteSingleReferral = async (referralId: string, studentName: string) => {
    if (!window.confirm(`Delete referral record for "${studentName}"? This cannot be undone.`)) return;
    try {
      await deleteReferralLead(referralId);
      triggerSuccess('Referral record deleted successfully.');
      await loadAffiliatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed deleting referral: ${err.message}`);
    }
  };

  const handleDeleteSingleAffiliate = async (code: string, name: string) => {
    if (!window.confirm(`Delete ambassador "${name}" (${code})? Their promo code will no longer be recognized.`)) return;
    try {
      await deleteAffiliatePartner(code);
      triggerSuccess(`Ambassador "${code}" removed from roster.`);
      await loadAffiliatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed deleting ambassador: ${err.message}`);
    }
  };

  const handlePurgeAllTestData = async () => {
    if (!window.confirm('Wipe and clear all test referral inquiries and test ambassador entries from database and storage?')) return;
    try {
      await purgeAllTestReferralsAndAffiliates();
      triggerSuccess('All test referrals & mock ambassador accounts purged successfully!');
      await loadAffiliatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed purging test data: ${err.message}`);
    }
  };

  const handleGenerateAgreementCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeAmbName.trim() || !agreePromoCode.trim()) {
      setErrorMsg('Please enter both the Ambassador Full Name and Assigned Promo Code.');
      return;
    }

    setIsGeneratingAgreement(true);
    try {
      const codeUpper = agreePromoCode.trim().toUpperCase();
      
      // Automatically save/register the affiliate partner in the database so their promo code is live & active right away!
      const partnerRecord: AffiliatePartner = {
        id: codeUpper,
        code: codeUpper,
        name: agreeAmbName.trim(),
        email: agreeEmail.trim(),
        phone: '',
        tier: 1,
        baseRate: Number(agreeTier1Rate) || 6,
        boostedRate: Number(agreeTier2Rate) || 10,
        discountOffered: Number(agreeDiscountRate) || 5,
        totalReferrals: 0,
        confirmedCount: 0,
        totalEarned: 0,
        totalPaidOut: 0,
        pendingPayout: 0,
        contractSigned: true,
        contractSignedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await saveAffiliatePartner(partnerRecord);

      await generateAmbassadorAgreementPdf({
        ambassadorName: agreeAmbName.trim(),
        promoCode: codeUpper,
        email: agreeEmail.trim(),
        instagramHandle: agreeHandle.trim(),
        tier1Rate: Number(agreeTier1Rate) || 6,
        tier2Rate: Number(agreeTier2Rate) || 10,
        discountRate: Number(agreeDiscountRate) || 5,
        logoUrl: config.logoUrl
      });
      triggerSuccess(`Official Legal Agreement generated & Promo Code "${codeUpper}" registered for ${agreeAmbName}!`);
      setLastGeneratedInfo({
        name: agreeAmbName.trim(),
        email: agreeEmail.trim(),
        code: codeUpper
      });
      await loadAffiliatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed generating agreement PDF: ${err.message}`);
    } finally {
      setIsGeneratingAgreement(false);
    }
  };

  const handleOpenEmailClient = () => {
    if (!lastGeneratedInfo?.email) {
      alert('Please enter an email address for the ambassador first.');
      return;
    }
    const subject = "Official Kogla Tech Global Ambassador Agreement & Partnership Onboarding";
    const body = `Hi ${lastGeneratedInfo.name},

Attached is your official Kogla Tech Global Ambassador Agreement outlining commission tiers, settlement terms, and creator guidelines.

To activate your promo code and claim your unique tracking link instantly, simply create a free student account on our website at ${window.location.origin}/profile, navigate to the Referral & Ambassador Code tab, and your personalized code (with 2 random digits) and live dashboard will be unlocked immediately!

Welcome aboard,
Kogla Tech Global Admissions & Partnerships`;

    window.open(`mailto:${lastGeneratedInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleCopyEmailTemplate = () => {
    const subject = "Official Kogla Tech Global Ambassador Agreement & Partnership Onboarding";
    const body = `Subject: ${subject}

Hi ${lastGeneratedInfo?.name || 'Partner'},

Attached is your official Kogla Tech Global Ambassador Agreement outlining commission tiers, settlement terms, and creator guidelines.

To activate your promo code and claim your unique tracking link instantly, simply create a free student account on our website at ${window.location.origin}/profile, navigate to the Referral & Ambassador Code tab, and your personalized code (with 2 random digits) and live dashboard will be unlocked immediately!

Welcome aboard,
Kogla Tech Global Admissions & Partnerships`;

    navigator.clipboard.writeText(body);
    triggerSuccess('Email template & onboarding instructions copied to clipboard!');
  };


  const handleCreateNewAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAffCode.trim() || !newAffName.trim()) return;

    try {
      const codeUpper = newAffCode.trim().toUpperCase();
      const newPartner: AffiliatePartner = {
        id: codeUpper,
        code: codeUpper,
        name: newAffName.trim(),
        email: newAffEmail.trim(),
        phone: newAffPhone.trim(),
        tier: 1,
        baseRate: 6,
        boostedRate: 10,
        discountOffered: 5,
        totalReferrals: 0,
        confirmedCount: 0,
        totalEarned: 0,
        totalPaidOut: 0,
        pendingPayout: 0,
        contractSigned: true,
        contractSignedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await saveAffiliatePartner(newPartner);
      triggerSuccess(`Affiliate partner "${newPartner.code}" successfully registered!`);
      setShowNewAffiliateModal(false);
      setNewAffCode('');
      setNewAffName('');
      setNewAffEmail('');
      setNewAffPhone('');
      await loadAffiliatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed creating partner: ${err.message}`);
    }
  };

  // Certificate Issuance Handler
  const handleIssueNewCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudentName.trim() || !certCourseTitle.trim()) return;

    setIsIssuingCert(true);
    try {
      const issued = await issueCertificate({
        studentName: certStudentName.trim(),
        studentEmail: certStudentEmail.trim(),
        courseTitle: certCourseTitle,
        mode: certMode,
        grade: certGrade
      });
      triggerSuccess(`Official Certificate [${issued.id}] successfully generated and issued to ${issued.studentName}!`);
      setCertStudentName('');
      setCertStudentEmail('');
      setPreviewCert(issued);
      await loadCertificatesData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed issuing certificate: ${err.message}`);
    } finally {
      setIsIssuingCert(false);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUpdateImage = (key: keyof ImageConfig, value: string) => {
    setImages(prev => ({ ...prev, [key]: value }));
    triggerSuccess(`Preview for "${key}" updated! Click "Save Image Configuration" to publish globally.`);
  };

  // Convert & compress uploaded image files locally via HTML5 canvas to guarantee small footprint (<150KB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof ImageConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(key);
    setSuccessMsg(`Optimizing "${key}" image binary...`);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsUploadingImage(null);
      setErrorMsg('Failed reading selected file.');
      setTimeout(() => setErrorMsg(''), 5000);
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setIsUploadingImage(null);
        setErrorMsg('Failed processing image dimensions.');
        setTimeout(() => setErrorMsg(''), 5000);
      };
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas rendering context unavailable');
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          setImages(prev => ({ ...prev, [key]: compressedDataUrl }));
          triggerSuccess(`Image "${key}" compressed & attached! Click "Save Image Configuration" to store to database.`);
        } catch (err: any) {
          console.error('Image compression failed:', err);
          setErrorMsg(`Image optimization error: ${err.message}`);
          setTimeout(() => setErrorMsg(''), 5000);
        } finally {
          setIsUploadingImage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImages = async () => {
    setIsSavingImages(true);
    try {
      await updateImages(images);
      triggerSuccess('All website images successfully stored and synchronized!');
    } catch (err: any) {
      console.warn('Save image configuration cloud sync notice:', err);
      if (err?.message === 'DATABASE_QUOTA_EXCEEDED' || err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
        triggerSuccess('Images saved locally to this browser! (Firebase daily write quota reached — local changes active).');
      } else {
        triggerSuccess('Images saved locally to your browser!');
      }
    } finally {
      setIsSavingImages(false);
    }
  };

  const handleResetImages = async () => {
    if (window.confirm('Reset all landing page images back to system original defaults?')) {
      setIsSavingImages(true);
      try {
        setImages(DEFAULT_IMAGES);
        await updateImages(DEFAULT_IMAGES);
        triggerSuccess('Landing images reset to original defaults!');
      } catch (err: any) {
        console.warn('Reset image notice:', err);
        setImages(DEFAULT_IMAGES);
        triggerSuccess('Images reset to original defaults locally!');
      } finally {
        setIsSavingImages(false);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: Inquiry['status']) => {
    setIsUpdatingStatus(true);
    try {
      const docRef = doc(db, 'inquiries', id);
      await updateDoc(docRef, { status: newStatus });
      
      // Update local state references instantly too
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }

      // If updating to contacted or processing, build an automated user notification
      const targetInq = inquiries.find(i => i.id === id);
      if (targetInq && targetInq.userId) {
        const autoNotifId = `auto-inq-${Date.now()}`;
        const notifRef = doc(db, 'notifications', autoNotifId);
        await setDoc(notifRef, {
          id: autoNotifId,
          userId: targetInq.userId,
          title: `Project State: ${newStatus}`,
          body: `Director status updated: Your intake request regarding "${targetInq.title}" is now set to ${newStatus}. An executive engineer will trace contact.`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }

      triggerSuccess(`Intake status updated successfully, and automated notification dispatched!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed updating status: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTogglePaid = async (userId: string, currentPaidState?: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isPaid: !currentPaidState, updatedAt: new Date().toISOString() });
      if (selectedUser && selectedUser.uid === userId) {
        setSelectedUser({ ...selectedUser, isPaid: !currentPaidState });
      }
      triggerSuccess(`User paid clearance successfully updated to ${!currentPaidState ? 'PAID / APPROVED' : 'UNPAID'}!`);
    } catch (err: any) {
      setErrorMsg(`Failed updating user paid status: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Verify: Permanently purge this database inquiries file?')) {
      try {
        const docRef = doc(db, 'inquiries', id);
        await deleteDoc(docRef);
        setSelectedInquiry(null);
        triggerSuccess('Intake record purged securely.');
      } catch (err: any) {
        console.error(err);
        setErrorMsg(`Failed to delete record: ${err.message}`);
        setTimeout(() => setErrorMsg(''), 5000);
      }
    }
  };

  const handleDeleteUserById = async (targetUser: any) => {
    if (!targetUser) return;
    if (confirm(`CRITICAL WARNING: Permanently delete user account "${targetUser.name}" (${targetUser.email})? This action will purge their profile data and allow this email to be registered afresh.`)) {
      try {
        const targetUid = targetUser.uid;
        const targetEmail = (targetUser.email || '').toLowerCase();

        // 1. Immediately store in persistent deletion sets so they never reappear on refresh
        const deletedUids: string[] = JSON.parse(localStorage.getItem('kogla_deleted_uids') || '[]');
        if (targetUid && !deletedUids.includes(targetUid)) {
          deletedUids.push(targetUid);
          localStorage.setItem('kogla_deleted_uids', JSON.stringify(deletedUids));
        }

        const deletedEmails: string[] = JSON.parse(localStorage.getItem('kogla_deleted_emails') || '[]');
        if (targetEmail && !deletedEmails.includes(targetEmail)) {
          deletedEmails.push(targetEmail);
          localStorage.setItem('kogla_deleted_emails', JSON.stringify(deletedEmails));
        }

        // 2. Remove from localStorage cache as well
        try {
          const rawUsers = localStorage.getItem('kogla_users_cache');
          if (rawUsers) {
            const parsed = JSON.parse(rawUsers);
            const filtered = parsed.filter((u: any) => u.uid !== targetUid && (u.email || '').toLowerCase() !== targetEmail);
            localStorage.setItem('kogla_users_cache', JSON.stringify(filtered));
          }
        } catch (_) {}

        // 3. Update React state immediately
        setUsers(prev => prev.filter(u => u.uid !== targetUid && (u.email || '').toLowerCase() !== targetEmail));
        if (selectedUser?.uid === targetUid) {
          setSelectedUser(null);
        }

        // 4. Safe delete from Firestore
        await safeFirestoreWrite(async () => {
          const userRef = doc(db, 'users', targetUid);
          await deleteDoc(userRef);
        }, 1500);

        triggerSuccess(`User account "${targetUser.email}" permanently purged successfully. The user can now recreate an account.`);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(`Failed to delete user account: ${err.message}`);
        setTimeout(() => setErrorMsg(''), 5000);
      }
    }
  };

  const handleDeleteUserPermanently = async () => {
    if (selectedUser) {
      await handleDeleteUserById(selectedUser);
    }
  };

  // Transmit customized system notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!notifTitle.trim() || !notifBody.trim()) {
      alert('Notification Title and Description are required parameters.');
      return;
    }

    setIsSendingNotif(true);
    try {
      const notifId = `sys-notif-${Date.now()}`;
      const docRef = doc(db, 'notifications', notifId);
      await setDoc(docRef, {
        id: notifId,
        userId: selectedUser.uid,
        title: notifTitle.trim(),
        body: notifBody.trim(),
        read: false,
        timestamp: new Date().toISOString()
      });

      setNotifTitle('');
      setNotifBody('');
      triggerSuccess(`Sovereign alert payload dispatched directly into ${selectedUser.name}'s account inbox!`);
    } catch (err: any) {
      console.error(err);
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const presetImagesList: Record<keyof ImageConfig, Array<{ label: string; url: string }>> = {
    hero: [
      { label: 'Original Cinematic Workspace', url: DEFAULT_IMAGES.hero },
      { label: 'Nigerian Tech Developer Workspace', url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1200' },
      { label: 'Lagos Tech Hub Innovation Founder', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200' },
      { label: 'Cyberpunk Command Center', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200' },
      { label: 'Luxury Minimalist Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200' }
    ],
    academy: [
      { label: 'Original Tech Students', url: DEFAULT_IMAGES.academy },
      { label: 'Nigerian Tech Students Cohort', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000' },
      { label: 'Lagos Peer Programming Workshop', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000' },
      { label: 'African Cloud Engineers Seminar', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000' },
      { label: 'Minimal Laboratory', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1000' }
    ],
    services: [
      { label: 'Original High-End Dashboard', url: DEFAULT_IMAGES.services },
      { label: 'African SaaS Solutions Briefing', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000' },
      { label: 'Server Matrix Blades', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000' },
      { label: 'Clean Enterprise Graphs', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000' }
    ],
    projects: [
      { label: 'Original Product Showcase', url: DEFAULT_IMAGES.projects },
      { label: 'Sleek Smart Device UI', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000' },
      { label: 'Mobile Mockup Studio', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000' }
    ],
    labs: [
      { label: 'Original Innovation Lab', url: DEFAULT_IMAGES.labs },
      { label: 'Quantum Supercomputer Spark', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000' },
      { label: 'Futuristic AI Array', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000' }
    ]
  };

  // 1. Loading screen segment
  if (loading) {
    return (
      <div className="pt-40 pb-40 text-center font-mono text-xs text-gray-500 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-gold-500 mb-3" size={20} />
        Synchronizing system roles clearance keys...
      </div>
    );
  }

  // 2. Lockdown check for users without active "admin" status
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="pt-32 px-4 pb-32 max-w-lg mx-auto text-gray-100 font-sans flex flex-col items-center justify-center min-h-[75vh]">
        <div className="w-full bg-gray-950 border border-gray-900 p-8 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-full mb-3">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-display font-bold uppercase text-white tracking-widest">
              Administrative Access Restricted
            </h2>
            <p className="text-[11px] text-gray-400 mt-2 font-sans">
              This area is reserved for authorized administrators only.
            </p>
          </div>

          <div className="p-4 bg-black border border-gray-900 rounded-sm text-xs text-gray-300 font-sans leading-relaxed mb-6 space-y-3">
            <p>
              Please sign in with an administrator account to manage platform settings, view lead inquiries, and configure website content.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-center text-xs text-gray-400 font-sans mb-2">
                  Currently signed in as: <span className="text-white font-semibold">{user.email}</span> (Standard User)
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-semibold text-xs uppercase tracking-wider font-display transition-all rounded-sm"
                >
                  Sign Out / Switch Account
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link 
                  to="/auth/login" 
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display text-center rounded-sm transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/auth/signup" 
                  className="flex-1 py-3 bg-transparent hover:bg-gray-900 border border-gray-800 text-white font-semibold text-xs uppercase tracking-wider font-display text-center rounded-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Clear Administrative dashboard screen
  return (
    <div className="pt-28 px-4 md:px-8 pb-32 max-w-7xl mx-auto text-gray-100 font-sans">
      
      {/* Top Banner and System stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-8 rounded-sm mb-8 flex flex-col md:flex-row md:items-center md:white justify-between gap-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-display tracking-widest uppercase">Kogla Administrator Suite</span>
            </div>
            <button 
              onClick={() => logout()}
              className="px-2 py-0.5 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 text-[9px] uppercase tracking-wider rounded-sm transition-all bg-red-950/20"
            >
              Sign Out
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            Operations command console
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Audit live incoming client requests, dispatch system alerts to student account databases, and calibrate background theme panels dynamically.
          </p>
        </div>

        {/* Action Quick Stats */}
        <div className="grid grid-cols-3 gap-3 bg-black/40 p-3 border border-gray-800/60 rounded-sm font-mono text-[11px]">
          <div className="px-3 py-1">
            <span className="block text-[9px] text-gray-500 uppercase">Lead Pipeline</span>
            <span className="text-base font-bold text-white">{inquiries.length}</span>
          </div>
          <div className="px-3 py-1 border-l border-gray-800/60">
            <span className="block text-[9px] text-gray-500 uppercase">Students Core</span>
            <span className="text-base font-bold text-cyan-400">{users.length}</span>
          </div>
          <div className="px-3 py-1 border-l border-gray-800/60">
            <span className="block text-[9px] text-gray-500 uppercase">Unread Log</span>
            <span className="text-base font-bold text-red-400">
              {inquiries.filter(i => i.status === 'Unread').length}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time feedback lines */}
      {successMsg && (
        <div className="p-3.5 bg-gold-500 text-black font-semibold text-xs rounded-sm mb-6 flex items-center gap-2 justify-center font-mono">
          <CheckCircle size={14} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-950 text-red-400 border border-red-500/20 text-xs rounded-sm mb-6 flex items-center gap-2 justify-center font-mono">
          <Lock size={14} /> [ERROR]: {errorMsg}
        </div>
      )}

      {/* Tabs list menu */}
      <div className="flex flex-wrap border-b border-gray-800 mb-8 font-display bg-gray-950 rounded-sm p-1 gap-1">
        <button 
          onClick={() => setTab('leads')}
          className={`flex-1 md:flex-none px-4 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'leads' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Mail size={13} /> Project Requests ({inquiries.length})
        </button>
        <button 
          onClick={() => {
            setTab('affiliates');
            loadAffiliatesData();
          }}
          className={`flex-1 md:flex-none px-4 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'affiliates' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <DollarSign size={13} /> Creators & Affiliates ({referrals.length})
        </button>
        <button 
          onClick={() => setTab('pricing')}
          className={`flex-1 md:flex-none px-4 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'pricing' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Tag size={13} /> Course Pricing (11 Tracks)
        </button>
        <button 
          onClick={() => {
            setTab('certificates');
            loadCertificatesData();
          }}
          className={`flex-1 md:flex-none px-4 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'certificates' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Award size={13} /> Certificates Registry ({certificates.length})
        </button>
        <button 
          onClick={() => {
            setTab('users');
            setSelectedUser(null);
          }}
          className={`flex-1 md:flex-none px-4 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'users' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Users size={13} /> Registered Students ({users.length})
        </button>
        <button 
          onClick={() => setTab('images')}
          className={`flex-1 md:flex-none px-4 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'images' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <ImageIcon size={13} /> Landing Page Images
        </button>
        <button 
          onClick={() => setTab('settings')}
          className={`flex-1 md:flex-none px-4 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'settings' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Settings size={13} /> Dynamic Site Settings
        </button>
      </div>

      {/* Tab 1: Leads Section */}
      {tab === 'leads' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Stream pipeline table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-950 border border-gray-800 rounded-sm">
              <div className="p-4 border-b border-gray-800 bg-black/40 flex items-center justify-between font-mono">
                <span className="text-xs font-display font-semibold text-gold-500 uppercase tracking-wider">
                  Leads Stream Log Files
                </span>
                <span className="text-[9px] text-gray-500 uppercase">
                  Select a record to audit payload
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-16 text-center text-gray-600 text-xs font-mono">
                  [EMPTY SUITE]: No admissions requests or custom project intakes received yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-900 max-h-[600px] overflow-y-auto">
                  {inquiries.map((inq) => (
                    <div 
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`p-4 transition-all cursor-pointer flex items-start gap-4 hover:bg-gray-900/30 ${
                        selectedInquiry?.id === inq.id ? 'bg-gold-500/5 border-l-2 border-gold-500' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {inq.type === 'enrollment' ? (
                          <div className="p-2 rounded-sm bg-cyan-950/60 text-cyan-400 border border-cyan-800/30">
                            <BookOpen size={14} />
                          </div>
                        ) : (
                          <div className="p-2 rounded-sm bg-purple-950/60 text-purple-400 border border-purple-800/30">
                            <Zap size={14} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-white truncate font-display uppercase tracking-wide">
                            {inq.senderName}
                          </h4>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {new Date(inq.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gold-550 font-display font-semibold mb-1 truncate">
                          {inq.title}
                        </p>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                          {inq.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold font-mono border ${
                            inq.status === 'Unread' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : inq.status === 'In Progress'
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : inq.status === 'Contacted'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-50s/20'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CRM Lead Inspector */}
          <div className="lg:col-span-1">
            {selectedInquiry ? (
              <div className="bg-gray-950 border border-gray-800 p-6 rounded-sm sticky top-28 space-y-6">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Inquiry telemetry panel</span>
                  <h3 className="text-base font-display font-bold text-white mt-1 break-words">
                    {selectedInquiry.senderName}
                  </h3>
                  <p className="text-xs text-gold-500 font-mono mt-1 font-semibold">
                    {selectedInquiry.senderEmail}
                  </p>
                </div>

                <div className="border-y border-gray-900 py-4 space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service Theme:</span>
                    <span className="text-white font-medium text-right max-w-[140px] truncate">
                      {selectedInquiry.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Intake Index:</span>
                    <span className="text-gray-300">{selectedInquiry.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recorded:</span>
                    <span className="text-gray-400">
                      {new Date(selectedInquiry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="text-white font-semibold capitalize">
                      {selectedInquiry.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-display text-gold-500 font-semibold mb-2 uppercase tracking-wide">
                    Description brief statement:
                  </h4>
                  <div className="p-4 bg-black border border-gray-900 rounded-sm text-xs text-gray-300 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line font-mono text-[11px]">
                    {selectedInquiry.description}
                  </div>
                </div>

                <div className="space-y-3 font-mono">
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest">
                    Status assignments workflow:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry.id, 'In Progress')}
                      className={`py-2 text-[10.5px] rounded-sm transition-all border uppercase tracking-wider ${
                        selectedInquiry.status === 'In Progress'
                          ? 'bg-yellow-500 text-black font-semibold border-yellow-500'
                          : 'bg-transparent border-gray-900 hover:border-yellow-500/50 text-yellow-500'
                      }`}
                    >
                      In Progress
                    </button>
                    <button 
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry.id, 'Contacted')}
                      className={`py-2 text-[10.5px] rounded-sm transition-all border uppercase tracking-wider ${
                        selectedInquiry.status === 'Contacted'
                          ? 'bg-green-500 text-black font-semibold border-green-500'
                          : 'bg-transparent border-gray-900 hover:border-green-500/50 text-green-400'
                      }`}
                    >
                      Contacted
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry.id, 'Unread')}
                      className="flex-1 py-1.5 bg-gray-900 hover:bg-gray-800 text-[9px] uppercase tracking-widest border border-gray-800 text-gray-400"
                    >
                      Reset Log status
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedInquiry.id)}
                      className="px-3 bg-red-950/40 hover:bg-red-950 hover:text-red-300 text-red-400 border border-red-900/40 rounded-sm flex items-center justify-center transition-colors"
                      title="Purge record file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-sm text-center text-gray-500 text-xs font-mono">
                Select an active intake file from the stream list to audit dynamic blueprints and alter tracking states.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab: Affiliates & Creator Pipeline */}
      {tab === 'affiliates' && (
        <div className="space-y-8">
          
          {/* Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div>
              <span className="text-[10px] font-mono uppercase text-gold-400 font-bold block mb-1">
                AMBASSADOR & CREATOR PARTNERSHIPS
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase">
                Referrals & Payouts Engine
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Generate official legal contracts with Kogla logo, track student referrals, approve verified payments, and authorize commissions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowNewAffiliateModal(true)}
                className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded-sm flex items-center gap-1.5 transition-all shadow"
              >
                <Plus size={14} /> Add Ambassador
              </button>
              <button
                onClick={handlePurgeAllTestData}
                className="px-3.5 py-2.5 bg-red-950/40 hover:bg-red-950 text-red-300 border border-red-800/50 text-xs font-mono uppercase rounded-sm flex items-center gap-1.5 transition-all"
                title="Purge test referrals & mock ambassador accounts"
              >
                <Trash2 size={13} /> Purge Test Data
              </button>
              <Link
                to="/affiliate-portal"
                target="_blank"
                className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono uppercase rounded-sm flex items-center gap-1.5 transition-all"
              >
                <ExternalLink size={13} className="text-gold-400" /> Public Partner Portal
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Active Ambassadors</span>
              <span className="text-xl font-bold font-display text-white">{affiliates.length}</span>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Pending Student Payments</span>
              <span className="text-xl font-bold font-display text-amber-400">
                {referrals.filter(r => r.status === 'pending').length}
              </span>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Confirmed Paid Students</span>
              <span className="text-xl font-bold font-display text-emerald-400">
                {referrals.filter(r => r.status === 'confirmed' || r.status === 'paid_out').length}
              </span>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Unsettled Commissions</span>
              <span className="text-xl font-bold font-display text-gold-400">
                {formatNaira(
                  referrals
                    .filter(r => r.status === 'confirmed')
                    .reduce((sum, r) => sum + r.commissionAmount, 0)
                )}
              </span>
            </div>
          </div>

          {/* INCOMING AMBASSADOR LEGAL AGREEMENT GENERATOR (PDF WITH LOGO) */}
          <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-gold-500/40 rounded-lg shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-400 font-bold block">
                  OFFICIAL CONTRACT ISSUANCE INSTRUMENT
                </span>
                <h3 className="text-base font-display font-bold text-white uppercase flex items-center gap-2">
                  <FileText className="text-gold-400" size={17} /> Generate Incoming Ambassador Legal Agreement (PDF)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded border border-zinc-800">
                Contains Official Kogla Crest & Executive Seal
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Fill in the incoming creator's full details below to automatically generate an official, signed PDF legal memorandum ready to download and send to them.
            </p>

            <form onSubmit={handleGenerateAgreementCustom} className="space-y-4 font-mono text-xs">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Ambassador Full Name *</label>
                  <input
                    type="text"
                    required
                    value={agreeAmbName}
                    onChange={(e) => setAgreeAmbName(e.target.value)}
                    placeholder="e.g. Joy Okafor"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded text-white focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Assigned Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={agreePromoCode}
                    onChange={(e) => setAgreePromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. JOYTECH"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded text-gold-400 font-bold uppercase focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={agreeEmail}
                    onChange={(e) => setAgreeEmail(e.target.value)}
                    placeholder="ambassador@gmail.com"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded text-white focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Instagram / Social Handle</label>
                  <input
                    type="text"
                    value={agreeHandle}
                    onChange={(e) => setAgreeHandle(e.target.value)}
                    placeholder="@joy_codes"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded text-white focus:border-gold-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Tier 1 Rate (1st 3 Students)</label>
                  <div className="p-2.5 bg-black border border-zinc-800 rounded text-white text-center font-bold">
                    6% Commission
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Tier 2 Escalator (4th+ Student)</label>
                  <div className="p-2.5 bg-black border border-zinc-800 rounded text-gold-400 text-center font-bold">
                    10% Lifetime Rate
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Student Discount</label>
                  <div className="p-2.5 bg-black border border-zinc-800 rounded text-emerald-400 text-center font-bold">
                    5% Off Tuition
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-zinc-400 font-sans">
                  The agreement incorporates strict legal indemnification, payment settlement clauses, and independent contractor terms.
                </span>
                <button
                  type="submit"
                  disabled={isGeneratingAgreement}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center justify-center gap-2 transition-all shadow-lg shrink-0 cursor-pointer"
                >
                  <FileText size={15} />
                  {isGeneratingAgreement ? 'Generating PDF...' : 'Download Official Agreement (PDF)'}
                </button>
              </div>
            </form>

            {lastGeneratedInfo && (
              <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                    <CheckCircle2 size={16} /> Agreement Downloaded & Partner Registered: {lastGeneratedInfo.name}
                  </div>
                  <p className="text-xs text-zinc-300 font-sans">
                    Target Email: <span className="font-mono text-white">{lastGeneratedInfo.email || 'Not provided'}</span> | Promo Code: <span className="font-mono text-gold-400 font-bold">{lastGeneratedInfo.code}</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Click below to open your email client (Zoho / Gmail) pre-filled with this recipient and onboarding message, or copy the template.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenEmailClient}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded font-display flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Mail size={14} /> Open Email Client
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyEmailTemplate}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded font-display flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
                  >
                    <Copy size={14} /> Copy Message
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* APPROVAL PROMPT / MODAL (WHEN ADMIN CLICKS APPROVE) */}
          {activeApprovalLead && (
            <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-gold-500 rounded-lg shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-display font-bold text-white uppercase flex items-center gap-2">
                  <ShieldCheck className="text-gold-400" size={18} /> Confirm Student Tuition Payment & Authorize Commission
                </h3>
                <button
                  onClick={() => setActiveApprovalLead(null)}
                  className="text-xs text-zinc-400 hover:text-white font-mono uppercase"
                >
                  Cancel
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs font-mono text-zinc-300">
                <div className="p-3 bg-black/60 border border-zinc-800 rounded">
                  <span className="text-zinc-500 block text-[10px] uppercase">Student</span>
                  <span className="font-bold text-white text-sm font-sans">{activeApprovalLead.studentName}</span>
                  <span className="block text-[10px] text-zinc-400">{activeApprovalLead.studentEmail}</span>
                </div>
                <div className="p-3 bg-black/60 border border-zinc-800 rounded">
                  <span className="text-zinc-500 block text-[10px] uppercase">Course & Format</span>
                  <span className="font-bold text-white">{activeApprovalLead.courseTitle}</span>
                  <span className="block text-[10px] text-gold-400 uppercase">
                    {activeApprovalLead.mode === 'physical' ? 'Physical Hub' : 'Online Cohort'}
                  </span>
                </div>
                <div className="p-3 bg-black/60 border border-zinc-800 rounded">
                  <span className="text-zinc-500 block text-[10px] uppercase">Tuition & Commission</span>
                  <span className="font-bold text-white">{formatNaira(activeApprovalLead.discountedAmount)}</span>
                  <span className="block text-[10px] text-emerald-400 font-bold">
                    Commission: {formatNaira(activeApprovalLead.commissionAmount)} ({activeApprovalLead.commissionRate}%)
                  </span>
                </div>
              </div>

              <form onSubmit={handleConfirmApproval} className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="text"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Payment reference (e.g. Bank Transfer Verified - GTBank / POS Receipt #4928)"
                  className="flex-1 p-2.5 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={Boolean(approvingReferralId)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded transition-all shadow shrink-0"
                >
                  {approvingReferralId ? 'Approving...' : '✓ Approve & Confirm Enrollment'}
                </button>
              </form>
            </div>
          )}

          {/* MAIN PIPELINE TABLE */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 font-mono">
              <span className="text-xs font-display font-semibold text-gold-400 uppercase tracking-wider">
                Student Referral Inquiries & Payment Verification Pipeline
              </span>
              <span className="text-[10px] text-zinc-400 uppercase">
                {referrals.length} Total Referrals
              </span>
            </div>

            {referrals.length === 0 ? (
              <div className="p-10 text-center text-zinc-500 font-mono text-xs">
                No student referrals logged yet. Share an active promo code or tracking link with prospective students.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-500">
                      <th className="pb-3 pr-3">Student</th>
                      <th className="pb-3 px-3">Partner Code</th>
                      <th className="pb-3 px-3">Course</th>
                      <th className="pb-3 px-3">Tuition Paid</th>
                      <th className="pb-3 px-3">Commission</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 pl-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-4 pr-3">
                          <span className="font-bold text-white font-sans text-sm block">{r.studentName}</span>
                          <span className="text-[10px] text-zinc-400">{r.studentEmail}</span>
                          {r.studentPhone && (
                            <span className="text-[10px] text-zinc-500 block">{r.studentPhone}</span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <span className="px-2 py-0.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded text-[10px] font-bold">
                            {r.affiliateCode}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="text-zinc-200 block">{r.courseTitle}</span>
                          <span className="text-[9px] uppercase text-zinc-500">
                            {r.mode === 'physical' ? 'Physical Hub' : 'Online'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-zinc-200">
                          {formatNaira(r.discountedAmount)}
                        </td>
                        <td className="py-4 px-3 font-bold text-gold-400">
                          {formatNaira(r.commissionAmount)}
                          <span className="block text-[9px] text-zinc-500 font-normal">({r.commissionRate}%)</span>
                        </td>
                        <td className="py-4 px-3">
                          {r.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[10px] uppercase">
                              <Clock size={10} /> Pending Payment
                            </span>
                          )}
                          {r.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[10px] uppercase font-bold">
                              <CheckCircle2 size={10} /> Confirmed
                            </span>
                          )}
                          {r.status === 'paid_out' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded text-[10px] uppercase font-bold">
                              <DollarSign size={10} /> Paid Out
                            </span>
                          )}
                        </td>
                        <td className="py-4 pl-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setActiveApprovalLead(r);
                                  setApprovalNote('');
                                }}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black font-bold text-[10px] uppercase tracking-wider font-display rounded transition-all shadow cursor-pointer"
                              >
                                Approve Payment
                              </button>
                            )}
                            {r.status === 'confirmed' && (
                              <button
                                onClick={() => handleMarkPaidOutAction(r.id)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-black font-bold text-[10px] uppercase tracking-wider font-display rounded transition-all cursor-pointer"
                              >
                                Mark Paid Out
                              </button>
                            )}
                            {r.status === 'paid_out' && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                Completed
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteSingleReferral(r.id, r.studentName)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                              title="Delete referral lead"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab: Course Pricing Management */}
      {tab === 'pricing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div>
              <span className="text-[10px] font-mono uppercase text-gold-400 font-bold block mb-1">
                TUITION & CURRICULUM PRICING ENGINE
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase">
                Update Course Tuition (All 11 Tracks)
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Set and calibrate online cohort and physical immersive hub tuition fees in Naira (₦). Changes reflect instantly across the catalog, checkout, and creator commission rates.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetCoursePricing}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw size={13} /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveCoursePricing}
                disabled={isSavingPricing}
                className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {isSavingPricing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save All Course Prices
                  </>
                )}
              </button>
            </div>
          </div>

          {/* COURSES PRICING GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACADEMY_COURSES.map((course) => {
              const currentOnline = coursePrices[course.slug]?.onlinePrice ?? course.onlinePrice;
              const currentPhysical = coursePrices[course.slug]?.physicalPrice ?? course.physicalPrice;

              return (
                <div 
                  key={course.slug} 
                  className="p-5 bg-zinc-950 border border-zinc-850 hover:border-gold-500/40 rounded-lg space-y-4 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-gold-400 font-bold">
                        {course.category} • {course.duration}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded">
                        {course.slug}
                      </span>
                    </div>
                    <h3 className="text-base font-display font-bold text-white uppercase">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                      {course.tagline}
                    </p>
                  </div>

                  {/* PRICE INPUTS */}
                  <div className="p-3.5 bg-black/60 border border-zinc-850 rounded space-y-3 font-mono text-xs">
                    {/* ONLINE TUITION */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase text-zinc-400 flex items-center gap-1">
                          Online Tuition (₦)
                        </label>
                        <span className="text-[10px] text-emerald-400">
                          -5% Promo: {formatNaira(Math.round(currentOnline * 0.95))}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={currentOnline}
                        onChange={(e) => handlePriceChange(course.slug, 'onlinePrice', parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-750 focus:border-gold-500 rounded text-white font-mono font-bold text-sm outline-none"
                      />
                    </div>

                    {/* PHYSICAL TUITION */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase text-zinc-400 flex items-center gap-1">
                          Physical Hub Tuition (₦)
                        </label>
                        <span className="text-[10px] text-gold-400">
                          -5% Promo: {formatNaira(Math.round(currentPhysical * 0.95))}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={currentPhysical}
                        onChange={(e) => handlePriceChange(course.slug, 'physicalPrice', parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-750 focus:border-gold-500 rounded text-white font-mono font-bold text-sm outline-none"
                      />
                    </div>

                    {/* COMMISSIONS PREVIEW */}
                    <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
                      <div>
                        <span className="text-zinc-500 block">Tier 1 Aff. (6%):</span>
                        <span className="text-white font-bold">{formatNaira(Math.round(currentOnline * 0.06))}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Tier 2 Aff. (10%):</span>
                        <span className="text-gold-400 font-bold">{formatNaira(Math.round(currentOnline * 0.1))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                    <span>Live status: Active</span>
                    <Link
                      to={`/academy/${course.slug}`}
                      target="_blank"
                      className="text-gold-400 hover:underline flex items-center gap-1"
                    >
                      Preview Live Page <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">
              Need to publish these updated prices to all student portals & admissions checkout?
            </span>
            <button
              type="button"
              onClick={handleSaveCoursePricing}
              disabled={isSavingPricing}
              className="px-6 py-2 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded shadow cursor-pointer"
            >
              {isSavingPricing ? 'Publishing...' : 'Save & Publish All Prices'}
            </button>
          </div>

        </div>
      )}

      {/* Tab: Certificates Registry & Issuance */}
      {tab === 'certificates' && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div>
              <span className="text-[10px] font-mono uppercase text-gold-400 font-bold block mb-1">
                ACADEMIC CREDENTIAL DISPATCHER
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase">
                Student Certificates & Official Registry
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Issue tamper-proof certificates featuring Gerald Emechebe's signature, official gold seal, and live verification codes.
              </p>
            </div>

            <Link
              to="/verify-certificate"
              target="_blank"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono uppercase rounded-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <ShieldCheck size={14} className="text-gold-400" /> Public Verification Portal
            </Link>
          </div>

          {/* CERTIFICATE PREVIEW MODAL / EXPANDED VIEW */}
          {previewCert && (
            <div className="p-6 bg-zinc-950 border-2 border-gold-500 rounded-lg shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-display font-bold text-white uppercase flex items-center gap-2">
                  <Award className="text-gold-400" size={18} /> Official Certificate Document Preview
                </h3>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="text-xs text-zinc-400 hover:text-white font-mono uppercase"
                >
                  Close Preview
                </button>
              </div>

              <OfficialCertificate certificate={previewCert} showActions={true} />
            </div>
          )}

          {/* FOUNDER SIGNATURE CONFIGURATION CARD */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block mb-0.5">
                  AUTHORIZED SIGNATORY CONFIGURATION
                </span>
                <h3 className="text-base font-display font-bold text-white uppercase">
                  Founder & CEO Digital Signature (Gerald Emechebe)
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Upload your handwritten or official signature stamp. This signature is automatically applied to all newly issued student certificates prior to printing or PDF downloading.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={founderSigInputRef}
                  onChange={handleFounderSigUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => founderSigInputRef.current?.click()}
                  disabled={uploadingFounderSig}
                  className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase font-display rounded flex items-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  {uploadingFounderSig ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={13} /> Upload Founder Signature
                    </>
                  )}
                </button>
                {founderSig && (
                  <button
                    type="button"
                    onClick={() => {
                      setFounderSig('');
                      saveFounderSignature('');
                    }}
                    className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono uppercase rounded border border-zinc-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 items-start">
              {/* High-Contrast Transparent Preview Box */}
              <div className="space-y-2">
                <div 
                  className="relative p-4 border border-zinc-800 rounded-lg flex items-center justify-center h-28 overflow-hidden shadow-inner"
                  style={{
                    backgroundColor: '#0a0a0c',
                    backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }}
                >
                  {founderSig ? (
                    <img
                      src={founderSig}
                      alt="Founder Signature Stamp"
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                    />
                  ) : (
                    <span className="text-[11px] text-zinc-500 font-mono italic text-center">
                      No signature uploaded yet. Default digital seal active.
                    </span>
                  )}
                  {founderSig && (
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 border border-gold-500/30 rounded text-[9px] font-mono text-gold-400">
                      Transparent Alpha
                    </span>
                  )}
                </div>

                {/* Instant Background Stripping & Tint Controls */}
                {founderSig && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={processingSigEffect}
                      onClick={() => handleCleanSignature('gold')}
                      className={`px-2.5 py-1.5 text-[10px] font-mono uppercase rounded flex items-center gap-1 border transition-all cursor-pointer ${
                        sigColorMode === 'gold' 
                          ? 'bg-gold-500 text-black border-gold-400 font-bold' 
                          : 'bg-zinc-900 text-gold-400 hover:bg-zinc-800 border-gold-500/30'
                      }`}
                      title="Make transparent with metallic Gold strokes"
                    >
                      {processingSigEffect ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      Gold
                    </button>
                    <button
                      type="button"
                      disabled={processingSigEffect}
                      onClick={() => handleCleanSignature('white')}
                      className={`px-2.5 py-1.5 text-[10px] font-mono uppercase rounded flex items-center gap-1 border transition-all cursor-pointer ${
                        sigColorMode === 'white' 
                          ? 'bg-white text-black border-white font-bold' 
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-700'
                      }`}
                      title="Make transparent with crisp White strokes"
                    >
                      White
                    </button>
                    <button
                      type="button"
                      disabled={processingSigEffect}
                      onClick={() => handleCleanSignature('original')}
                      className={`px-2.5 py-1.5 text-[10px] font-mono uppercase rounded flex items-center gap-1 border transition-all cursor-pointer ${
                        sigColorMode === 'original' 
                          ? 'bg-zinc-700 text-white border-zinc-500 font-bold' 
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border-zinc-800'
                      }`}
                      title="Preserve original stroke colors with 100% transparent background"
                    >
                      Original
                    </button>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">
                    Or Paste Signature Image URL (PNG / Transparent)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/gerald-signature.png"
                      value={founderSig}
                      onChange={(e) => {
                        setFounderSig(e.target.value);
                        saveFounderSignature(e.target.value);
                      }}
                      className="flex-1 p-2.5 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 focus:outline-none"
                    />
                    <span className="px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={12} /> Auto-Saved
                    </span>
                  </div>
                </div>

                {founderSig && (
                  <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded flex items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-zinc-300">
                      <span className="text-gold-400 font-bold block text-[10px] uppercase">Background Removal Status</span>
                      Background auto-stripped into 100% transparent alpha PNG for certificates & agreements.
                    </div>
                    <button
                      type="button"
                      disabled={processingSigEffect}
                      onClick={() => handleCleanSignature(sigColorMode)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-gold-500 hover:text-black border border-gold-500/40 text-gold-300 text-xs font-mono rounded flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      {processingSigEffect ? (
                        <>
                          <Loader2 size={11} className="animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} /> Re-clean Background
                        </>
                      )}
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-zinc-500 font-mono">
                  Tip: Any uploaded photo, scanned drawing, or inverted signature will automatically have its black or white background stripped out completely.
                </p>
              </div>
            </div>
          </div>

          {/* ISSUE NEW CERTIFICATE FORM */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-6 space-y-6">
            <div className="border-b border-zinc-850 pb-3">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block mb-0.5">
                ISSUANCE DISPATCH
              </span>
              <h3 className="text-base font-display font-bold text-white uppercase">
                Issue Official Certificate to Graduate
              </h3>
            </div>

            <form onSubmit={handleIssueNewCertificate} className="space-y-4 font-mono text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">
                    Student Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={certStudentName}
                    onChange={(e) => setCertStudentName(e.target.value)}
                    placeholder="e.g. Chidimma Okeke"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    value={certStudentEmail}
                    onChange={(e) => setCertStudentEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">
                    Course Specialization *
                  </label>
                  <select
                    value={certCourseTitle}
                    onChange={(e) => setCertCourseTitle(e.target.value)}
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white"
                  >
                    {ACADEMY_COURSES.map(c => (
                      <option key={c.slug} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">
                    Cohort Delivery Mode
                  </label>
                  <select
                    value={certMode}
                    onChange={(e) => setCertMode(e.target.value as any)}
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white"
                  >
                    <option value="Online Interactive Cohort">Online Interactive Cohort</option>
                    <option value="Physical Hub Immersion">Physical Hub Immersion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">
                    Honors / Grade Assessment
                  </label>
                  <select
                    value={certGrade}
                    onChange={(e) => setCertGrade(e.target.value)}
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white"
                  >
                    <option value="Distinction (Top 5%)">Distinction (Top 5%)</option>
                    <option value="Honors Excellence">Honors Excellence</option>
                    <option value="Pass with Merit">Pass with Merit</option>
                    <option value="Capstone Completed">Capstone Completed</option>
                  </select>
                </div>
              </div>

              {/* FOUNDER SIGNATURE VERIFICATION DETAILS */}
              <div className="p-4 bg-black/60 border border-zinc-800/80 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Authorized Signatory</span>
                  <b className="text-gold-400">{FOUNDER_NAME}</b>
                  <span className="text-zinc-400 block text-[11px]">{FOUNDER_TITLE}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 size={12} /> Digital Signature & Gold Seal Verified
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isIssuingCert}
                className="px-8 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-widest font-display rounded shadow transition-all flex items-center gap-2"
              >
                {isIssuingCert ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                {isIssuingCert ? 'Generating Credential...' : 'Issue & Publish Certificate'}
              </button>
            </form>
          </div>

          {/* ISSUED CERTIFICATES ROSTER TABLE */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 font-mono">
              <span className="text-xs font-display font-semibold text-white uppercase tracking-wider">
                Issued Credentials Ledger
              </span>
              <span className="text-[10px] text-zinc-400 uppercase">
                {certificates.length} Total Issued
              </span>
            </div>

            {certificates.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                No certificates registered in archive.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-500">
                      <th className="pb-3 pr-3">Certificate ID</th>
                      <th className="pb-3 px-3">Student Name</th>
                      <th className="pb-3 px-3">Specialization</th>
                      <th className="pb-3 px-3">Format</th>
                      <th className="pb-3 px-3">Issue Date</th>
                      <th className="pb-3 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-4 pr-3 font-bold text-gold-400">
                          {cert.id}
                        </td>
                        <td className="py-4 px-3 font-bold text-white font-sans text-sm">
                          {cert.studentName}
                          {cert.studentEmail && (
                            <span className="block text-[10px] text-zinc-500 font-mono font-normal">
                              {cert.studentEmail}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-zinc-300">
                          {cert.courseTitle}
                          <span className="block text-[9px] text-gold-400 font-mono">
                            {cert.grade}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded text-[10px]">
                            {cert.mode}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-zinc-400">
                          {cert.issueDate}
                        </td>
                        <td className="py-4 pl-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPreviewCert(cert)}
                              className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold text-[10px] uppercase tracking-wider font-display rounded transition-all shadow"
                            >
                              Preview / Print
                            </button>
                            <Link
                              to={`/verify-certificate/${cert.id}`}
                              target="_blank"
                              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-[10px] uppercase font-mono rounded"
                            >
                              Verify
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Users (Registered Students Accounts) Section */}
      {tab === 'users' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Users Database roster table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-950 border border-gray-800 rounded-sm">
              <div className="p-4 border-b border-gray-800 bg-black/40 flex items-center justify-between font-mono">
                <span className="text-xs font-display font-semibold text-gold-500 uppercase tracking-wider">
                  Registered developer accounts roster
                </span>
                <span className="text-[9px] text-gray-500 uppercase">
                  {users.length} Registered Accounts
                </span>
              </div>

              {users.length === 0 ? (
                <div className="p-16 text-center text-gray-500 text-xs font-mono">
                  [EMPTY DATABASE]: No developer registry profiles discovered.
                </div>
              ) : (
                <div className="divide-y divide-gray-900 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/60 text-gray-500 font-mono text-[9px] uppercase tracking-wider border-b border-gray-900">
                        <th className="p-4">Developer Profile</th>
                        <th className="p-4">Status &amp; Role</th>
                        <th className="p-4 text-center">Completed</th>
                        <th className="p-4 text-right">Metrics (XP)</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {users.map((item) => (
                        <tr 
                          key={item.uid}
                          className={`hover:bg-gray-900/40 transition-all ${
                            selectedUser?.uid === item.uid ? 'bg-gold-500/5' : ''
                          }`}
                        >
                          <td className="p-4 cursor-pointer" onClick={() => setSelectedUser(item)}>
                            <div className="font-semibold text-white uppercase tracking-wide">{item.name}</div>
                            <div className="text-gray-400 font-mono text-[10px]">{item.email}</div>
                          </td>
                          <td className="p-4 font-mono text-[10px]">
                            <span className={`px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold ${
                              item.role === 'admin' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : 'bg-gray-900 text-gray-400 border border-gray-800'
                            }`}>
                              {item.role || 'user'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-cyan-400 font-semibold">
                            {item.completedRooms?.length || 0} Rooms
                          </td>
                          <td className="p-4 text-right font-display font-bold text-gold-500">
                            {item.xp || 0} XP
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(item)}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono uppercase rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={11} /> Inspect
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUserById(item);
                                }}
                                className="px-2.5 py-1 bg-red-950/80 hover:bg-red-800 border border-red-800 text-red-300 hover:text-white text-[10px] font-mono uppercase font-bold rounded flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                title="Permanently delete user and allow recreation"
                              >
                                <Trash2 size={11} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User inspector & system alerts dispatch terminal */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className="bg-gray-950 border border-gray-800 p-6 rounded-sm sticky top-28 space-y-6">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Academic inspector tools</span>
                  <h3 className="text-base font-display font-bold text-white mt-1 uppercase">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-gold-500 font-mono mt-1">
                    {selectedUser.email}
                  </p>
                </div>

                <div className="border-y border-gray-900 py-3.5 space-y-2.5 font-mono text-[10px] text-gray-400">
                  <div className="flex justify-between">
                    <span>Account UID Key:</span>
                    <span className="text-gray-300 text-[9px]">{selectedUser.uid.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clearance Level:</span>
                    <span className="text-white uppercase font-bold">{selectedUser.role || 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rooms Mastered:</span>
                    <span className="text-cyan-400 font-bold">{selectedUser.completedRooms?.length || 0} Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registered On:</span>
                    <span>
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Academy Paid Clearance Approval Toggle */}
                <div className="pt-2 pb-4 border-b border-gray-900 space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Academy Paid Status:</span>
                    <span className={`px-2 py-0.5 rounded-sm font-bold uppercase ${selectedUser.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                      {selectedUser.isPaid ? '✓ PAID & APPROVED' : 'LOCKED (UNPAID)'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleTogglePaid(selectedUser.uid, selectedUser.isPaid)}
                    className={`w-full py-2.5 uppercase tracking-widest font-bold rounded-sm border transition-all cursor-pointer ${
                      selectedUser.isPaid 
                        ? 'bg-red-950/40 border-red-900/60 text-red-400 hover:bg-red-900 hover:text-white' 
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                    }`}
                  >
                    {selectedUser.isPaid ? 'Revoke Paid Clearance' : 'Approve & Grant Paid Clearance'}
                  </button>

                  {/* DANGER ZONE: PERMANENT DELETE */}
                  <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-sm space-y-2 mt-3">
                    <span className="text-[9px] text-red-400 font-mono uppercase font-bold block">
                      Danger Zone • Permanent Deletion
                    </span>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Permanently wipes this user's profile and unlocks this email so it can be registered again.
                    </p>
                    <button 
                      type="button"
                      onClick={() => handleDeleteUserById(selectedUser)}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-mono uppercase tracking-wider font-bold text-xs rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Trash2 size={13} /> Delete Account Permanently
                    </button>
                  </div>
                </div>

                {/* Direct notifications dispatch form */}
                <form onSubmit={handleSendNotification} className="space-y-4 pt-2">
                  <div className="flex items-center gap-1.5 border-b border-gray-900 pb-2">
                    <Bell size={13} className="text-gold-500" />
                    <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                      Transmit Sovereign Notification
                    </h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                    Instantly broadcast raw system warnings, badges, or special guidance alerts directly into this student's notification system log.
                  </p>

                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider font-mono mb-1">Alert Headline Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Cyber Program Level Verified"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-black border border-gray-800 text-white rounded-sm placeholder:text-gray-700 font-mono focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider font-mono mb-1">Payload Content (Instructions)</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g. Well done! Your advanced exploit scripts has completed bypass constraints... +200 XP Awarded."
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      className="w-full text-xs p-2.5 bg-black border border-gray-800 text-white rounded-sm placeholder:text-gray-700 font-mono focus:border-gold-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSendingNotif}
                    className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/20 text-black font-semibold text-xs uppercase tracking-widest font-display rounded-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    {isSendingNotif ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Transmitting...
                      </>
                    ) : (
                      <>
                        <Send size={11} /> Deploy Alert Payload
                      </>
                    )}
                  </button>
                </form>

              </div>
            ) : (
              <div className="bg-gray-950 border border-gray-805 p-8 rounded-sm text-center text-gray-500 text-xs font-mono">
                Select any user from the account ledger on the left to review metrics details and build custom system notifications alerts.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Images Section */}
      {tab === 'images' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-950 border border-gold-500/30 rounded-sm">
            <div>
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={16} className="text-gold-500" /> Landing Page Imagery Management
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Customize website graphics. Upload custom files, select presets, or paste web URLs.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetImages}
                disabled={isSavingImages}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={13} /> Reset
              </button>

              <button
                type="button"
                onClick={handleSaveImages}
                disabled={isSavingImages || !!isUploadingImage}
                className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs font-display uppercase tracking-widest rounded-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingImages ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Image Configuration
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Landing page images grid configuration */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* HERO BG */}
            <div className="bg-gray-950 border border-gray-800 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Hero Workspace Background
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Main Banner
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img 
                    src={images.hero} 
                    alt="Hero background configuration preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGES.hero; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.hero} 
                    onChange={(e) => handleUpdateImage('hero', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3 focus:border-gold-500 outline-none"
                    placeholder="Paste public image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presetImagesList.hero.map((opt) => (
                      <button 
                        key={opt.url} 
                        type="button"
                        onClick={() => handleUpdateImage('hero', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all cursor-pointer ${
                          images.hero === opt.url ? 'border-gold-500 bg-gold-500/10 text-gold-500 font-semibold' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      {isUploadingImage === 'hero' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {isUploadingImage === 'hero' ? 'Optimizing Binary...' : 'Choose or Capture Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'hero')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ACADEMY BG */}
            <div className="bg-gray-950 border border-gray-800 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Academy Section Collage
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Learning Section
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img 
                    src={images.academy} 
                    alt="Academy image preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGES.academy; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.academy} 
                    onChange={(e) => handleUpdateImage('academy', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3 focus:border-gold-500 outline-none"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presetImagesList.academy.map((opt) => (
                      <button 
                        key={opt.url} 
                        type="button"
                        onClick={() => handleUpdateImage('academy', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all cursor-pointer ${
                          images.academy === opt.url ? 'border-gold-500 bg-gold-500/10 text-gold-500 font-semibold' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      {isUploadingImage === 'academy' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {isUploadingImage === 'academy' ? 'Optimizing Binary...' : 'Choose or Capture Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'academy')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES BG */}
            <div className="bg-gray-950 border border-gray-800 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Services Display Banner
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Intake &amp; Solutions
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img 
                    src={images.services} 
                    alt="Services visual preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGES.services; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.services} 
                    onChange={(e) => handleUpdateImage('services', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3 focus:border-gold-500 outline-none"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presetImagesList.services.map((opt) => (
                      <button 
                        key={opt.url} 
                        type="button"
                        onClick={() => handleUpdateImage('services', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all cursor-pointer ${
                          images.services === opt.url ? 'border-gold-500 bg-gold-500/10 text-gold-500 font-semibold' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      {isUploadingImage === 'services' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {isUploadingImage === 'services' ? 'Optimizing Binary...' : 'Choose or Capture Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'services')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* PROJECTS BG */}
            <div className="bg-gray-950 border border-gray-800 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Projects Showcase Visual
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Showcase
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img 
                    src={images.projects} 
                    alt="Projects visual preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGES.projects; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.projects} 
                    onChange={(e) => handleUpdateImage('projects', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3 focus:border-gold-500 outline-none"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presetImagesList.projects.map((opt) => (
                      <button 
                        key={opt.url} 
                        type="button"
                        onClick={() => handleUpdateImage('projects', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all cursor-pointer ${
                          images.projects === opt.url ? 'border-gold-500 bg-gold-500/10 text-gold-500 font-semibold' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      {isUploadingImage === 'projects' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {isUploadingImage === 'projects' ? 'Optimizing Binary...' : 'Choose or Capture Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'projects')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* LABS BG */}
            <div className="bg-gray-950 border border-gray-800 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Innovation Labs Hardware Header
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    AI Research Labs
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img 
                    src={images.labs} 
                    alt="Labs hardware preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGES.labs; }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.labs} 
                    onChange={(e) => handleUpdateImage('labs', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3 focus:border-gold-500 outline-none"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presetImagesList.labs.map((opt) => (
                      <button 
                        key={opt.url} 
                        type="button"
                        onClick={() => handleUpdateImage('labs', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all cursor-pointer ${
                          images.labs === opt.url ? 'border-gold-500 bg-gold-500/10 text-gold-500 font-semibold' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      {isUploadingImage === 'labs' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {isUploadingImage === 'labs' ? 'Optimizing Binary...' : 'Choose or Capture Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'labs')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="p-6 bg-black border border-gray-900 rounded-sm">
            <h4 className="text-xs font-display text-gold-500 font-bold uppercase tracking-wider mb-2">💡 Operational Note</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              When configuring image records or uploading custom photographs, image compression algorithms execute automatically to ensure high resolution while guaranteeing cross-device database synchronization. Click "Save Image Configuration" to commit all changes globally.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-900">
            <button
              type="button"
              onClick={handleResetImages}
              disabled={isSavingImages}
              className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} /> Reset System Defaults
            </button>

            <button
              type="button"
              onClick={handleSaveImages}
              disabled={isSavingImages || !!isUploadingImage}
              className="w-full sm:w-auto px-8 py-3.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs font-display uppercase tracking-widest rounded-sm transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {isSavingImages ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Image Configuration
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* Tab 4: Site Settings Section */}
      {tab === 'settings' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 animate-fade-in text-gray-100"
        >
          <div className="bg-gray-950 border border-gray-900 rounded-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600"></div>
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-gold-500" size={18} />
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-white">Dynamic Brand Control Console</h2>
            </div>
            
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* GROUP 1: Brand & Logo */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Sparkles size={12} /> Live Identity Branding
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Company Legal Name</label>
                    <input 
                      type="text"
                      required
                      value={siteForm.companyName}
                      onChange={(e) => setSiteForm({ ...siteForm, companyName: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Logo Fallback Text</label>
                    <input 
                      type="text"
                      required
                      value={siteForm.logoText}
                      onChange={(e) => setSiteForm({ ...siteForm, logoText: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Active Logo Image URL</label>
                    <input 
                      type="text"
                      value={siteForm.logoUrl}
                      onChange={(e) => setSiteForm({ ...siteForm, logoUrl: e.target.value })}
                      placeholder="Paste image web address (URL) or upload a logo file..."
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={13} />
                      Upload Logo PNG/JPG
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {siteForm.logoUrl && (
                  <div className="p-3 bg-gray-950 border border-gray-850 rounded-sm w-fit">
                    <span className="block text-[9px] text-gray-500 uppercase font-mono mb-1.5">Live Header Logo Preview</span>
                    <img src={siteForm.logoUrl} alt="Logo preview" className="h-9 border border-gold-500/30 p-1 bg-black object-contain" />
                  </div>
                )}

                {/* Dynamic Browser Favicon Customizer */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-901">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Active Browser Favicon URL</label>
                    <input 
                      type="text"
                      value={siteForm.faviconUrl || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, faviconUrl: e.target.value })}
                      placeholder="Paste image web address (URL) or upload a favicon file..."
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={13} />
                      Upload Favicon PNG/JPG
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFaviconUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {siteForm.faviconUrl && (
                  <div className="p-3 bg-gray-950 border border-gray-850 rounded-sm w-fit">
                    <span className="block text-[9px] text-gray-500 uppercase font-mono mb-1.5">Live Tab Favicon Preview</span>
                    <img src={siteForm.faviconUrl} alt="Favicon preview" className="h-6 w-6 border border-gold-500/30 p-0.5 bg-black object-contain" />
                  </div>
                )}
              </div>

              {/* GROUP 2: Contact Numbers & Community Links */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Mail size={12} /> Global Contact Nodes & Support Phone Numbers
                </h3>
                
                <div className="p-3 bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-300 font-mono rounded-sm leading-relaxed">
                  💡 <b>Contact Controls Note:</b> You can set different or identical numbers for WhatsApp and Call Us Hotline. Any changes here instantly update all WhatsApp buttons, Call Us hotlines, and contact links across the entire platform.
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-1 font-mono">
                      WhatsApp Contact Number
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="+234 701 248 9041"
                      value={siteForm.whatsappPhone || ''}
                      onChange={(e) => {
                        const newPhone = e.target.value;
                        const cleanDigits = newPhone.replace(/[^0-9]/g, '');
                        const newLink = cleanDigits ? `https://wa.me/${cleanDigits}` : siteForm.whatsappLink;
                        setSiteForm({ 
                          ...siteForm, 
                          whatsappPhone: newPhone,
                          whatsappLink: newLink
                        });
                      }}
                      className="w-full p-2.5 bg-gray-950 border border-gold-500/50 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Target WhatsApp number for all chat triggers.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-1 font-mono">
                      "Call Us" Hotline Phone Number
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="+234 701 248 9041"
                      value={siteForm.contactPhone}
                      onChange={(e) => setSiteForm({ ...siteForm, contactPhone: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gold-500/50 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Direct phone hotline for voice calls (tel:).
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Inquiry Support Email
                    </label>
                    <input 
                      type="email"
                      required
                      value={siteForm.contactEmail}
                      onChange={(e) => setSiteForm({ ...siteForm, contactEmail: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Main email address for support & inquiries.
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-gray-900">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Direct Chat WhatsApp Link
                    </label>
                    <input 
                      type="text"
                      required
                      value={siteForm.whatsappLink}
                      onChange={(e) => setSiteForm({ ...siteForm, whatsappLink: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Auto-generated wa.me link (or custom link).
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Join WhatsApp Community Link
                    </label>
                    <input 
                      type="text"
                      required
                      value={siteForm.communityLink}
                      onChange={(e) => setSiteForm({ ...siteForm, communityLink: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Group invite link for WhatsApp Community.
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Telegram Channel Link
                    </label>
                    <input 
                      type="text"
                      required
                      value={siteForm.telegramLink}
                      onChange={(e) => setSiteForm({ ...siteForm, telegramLink: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Telegram channel or group link.
                    </span>
                  </div>
                </div>
              </div>

              {/* GROUP 3: Homepage Headlines & Advertisements */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Layers size={12} /> Marketing Copy & Headings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Primary Hero Main Headline</label>
                    <input 
                      type="text"
                      required
                      value={siteForm.heroHeadline}
                      onChange={(e) => setSiteForm({ ...siteForm, heroHeadline: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Hero Subheadline Explanation Text</label>
                    <textarea 
                      required
                      value={siteForm.heroSubheadline}
                      onChange={(e) => setSiteForm({ ...siteForm, heroSubheadline: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 h-20 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 border-t border-gray-900 pt-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">About Section Headline</label>
                      <input 
                        type="text"
                        required
                        value={siteForm.aboutHeadline}
                        onChange={(e) => setSiteForm({ ...siteForm, aboutHeadline: e.target.value })}
                        className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">About Long Description Description</label>
                      <textarea 
                        required
                        value={siteForm.aboutText}
                        onChange={(e) => setSiteForm({ ...siteForm, aboutText: e.target.value })}
                        className="w-full p-2.5 bg-gray-950 border border-gray-800 h-20 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GROUP 4: Footer compliance */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Terminal size={12} /> Footer Copyright Info
                </h3>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Footer Legal Credits & Disclaimers</label>
                  <input 
                    type="text"
                    required
                    value={siteForm.footerCredits}
                    onChange={(e) => setSiteForm({ ...siteForm, footerCredits: e.target.value })}
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>

              {/* GROUP 5: Dynamic Accessibility & Visual Theme Controls */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-5">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <span className="text-xs">🎨</span> Display, Accessibility & Theme Tones
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Font Sizer */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                        Global Font Scale Factor
                      </label>
                      <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[10px] font-mono font-bold rounded">
                        {siteForm.fontSizeScale || 100}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Scale the entire site typography proportionately and simultaneously. Relative headers and body fonts grow and shrink together.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-500">80%</span>
                      <input 
                        type="range"
                        min="80"
                        max="180"
                        step="5"
                        value={siteForm.fontSizeScale || 100}
                        onChange={(e) => setSiteForm({ ...siteForm, fontSizeScale: parseInt(e.target.value) })}
                        className="flex-1 accent-gold-500 h-1.5 rounded-lg cursor-pointer bg-gray-950"
                      />
                      <span className="text-[10px] font-mono text-gray-300">180%</span>
                    </div>
                  </div>

                  {/* Theme Mode Toggles */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Corporate Visual Mode
                    </label>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Toggle between Dark (default cosmic), Light (high-contrast eye-safe light background), or Mixed (amber cyber deck) mode. Texts automatically adapt contrast rates.
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {(['dark', 'light', 'mixed'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setSiteForm({ ...siteForm, themeMode: mode })}
                          className={`py-2 text-[10px] font-mono uppercase tracking-wider border rounded-xs transition-all ${
                            (siteForm.themeMode || 'dark') === mode
                              ? 'bg-gold-500 border-gold-500 text-black font-bold'
                              : 'bg-transparent border-gray-901 hover:border-gray-800 text-gray-400'
                          }`}
                        >
                          {mode} Mode
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <button 
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 active:scale-[0.99] disabled:bg-gold-500/40 text-black font-semibold text-xs transition-all uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2 select-none h-12 shadow-md shadow-gold-500/10"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Synchronizing configurations...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} /> Commit Dynamic Changes Live
                  </>
                )}
              </button>

            </form>

          </div>
        </motion.div>
      )}

    </div>
  );
}
