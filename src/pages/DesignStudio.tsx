import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { 
  Sparkles, 
  Layers, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Palette, 
  Code2, 
  Shield, 
  Cpu, 
  CheckCircle2, 
  ArrowUpRight, 
  Globe, 
  Award, 
  Terminal, 
  Server, 
  Database,
  Lock,
  ArrowLeft,
  Smartphone,
  BarChart3,
  PenTool,
  Briefcase,
  TrendingUp,
  Building2,
  Cloud,
  Bot,
  UserCheck,
  Zap,
  Phone,
  Mail,
  Laptop,
  MapPin,
  Image as ImageIcon,
  Loader2,
  FileImage,
  Share2,
  CheckCheck
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import { isSystemAdminEmail } from '../lib/authUtils';
import { getAllCourses, formatNaira } from '../data/coursesPricing';

export default function DesignStudio() {
  const { config } = useSiteConfig();
  const { user, profile } = useAuth();

  // Admin access verification check
  const isSuperAdmin = user?.email && isSystemAdminEmail(user.email);
  const isRoleAdmin = profile?.role === 'admin' || (user as any)?.role === 'admin';
  const hasLocalAdmin = typeof window !== 'undefined' && localStorage.getItem('isKoglaAdmin') === 'true';
  const isAuthorizedAdmin = isSuperAdmin || isRoleAdmin || hasLocalAdmin;

  // Customization States
  const [cohortName, setCohortName] = useState(config.cohortBatchName || 'COHORT CO-2026');
  const [cohortDate, setCohortDate] = useState('September 2026');
  const [customSubtitle, setCustomSubtitle] = useState('From Zero to Industry-Ready & Talent Whitelisted');
  const [customPhone, setCustomPhone] = useState(config.contactPhone || '+234 701 248 9041');
  const [customEmail, setCustomEmail] = useState(config.contactEmail || 'solutions@koglatech.com');
  
  // View & Option States (Defaulted to Option 3 as requested)
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | 'option3'>('option3');
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState<'4k' | '2k' | 'jpg'>('4k');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  // High-Resolution Image Export Engine
  const handleDownloadPhoto = async (format: 'png' | 'jpeg' = 'png', scaleFactor = 3.5) => {
    if (!flyerRef.current || isDownloading) return;
    setIsDownloading(true);
    
    try {
      // Ensure all custom fonts and assets are fully loaded and rendered
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      // Small pause to allow styles and glow effects to settle
      await new Promise((resolve) => setTimeout(resolve, 150));

      const node = flyerRef.current;
      
      const renderOptions = {
        quality: 1.0,
        pixelRatio: scaleFactor,
        cacheBust: true,
        backgroundColor: '#050505',
        style: {
          transform: 'none',
          margin: '0',
        },
      };

      let dataUrl = '';
      if (format === 'png') {
        dataUrl = await toPng(node, renderOptions);
      } else {
        dataUrl = await toJpeg(node, { ...renderOptions, quality: 0.98 });
      }

      // Generate clean filename
      const optionLabel = selectedOption === 'option3' ? '1x1-square-pricing' : selectedOption === 'option1' ? '4x5-editorial' : '9x16-vertical';
      const cleanCohort = cohortName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `kogla-tech-${optionLabel}-${cleanCohort}-ultrahd.${format === 'jpeg' ? 'jpg' : 'png'}`;

      const downloadLink = document.createElement('a');
      downloadLink.download = filename;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (primaryError) {
      console.warn('html-to-image render notice, engaging ultra-res html2canvas fallback...', primaryError);
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(flyerRef.current, {
          scale: 3.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#050505',
          logging: false
        });
        
        const dataUrl = canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', 1.0);
        const filename = `kogla-tech-${selectedOption}-ultrahd.${format === 'jpeg' ? 'jpg' : 'png'}`;
        const downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = dataUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      } catch (fallbackError) {
        console.error('All image export engines failed:', fallbackError);
        alert('Could not render image. Please try Screenshot Mode to capture.');
      }
    } finally {
      setIsDownloading(false);
      setShowFormatMenu(false);
    }
  };

  // Copy Image directly to clipboard for immediate paste
  const handleCopyImageToClipboard = async () => {
    if (!flyerRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      const blob = await toBlob(flyerRef.current, {
        pixelRatio: 3,
        backgroundColor: '#050505',
        cacheBust: true
      });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      // Fallback download if clipboard is restricted
      handleDownloadPhoto('png', 3.5);
    } finally {
      setIsDownloading(false);
    }
  };

  // Official tracks with full Physical and Online Pricing breakdown
  const officialAllCourses = [
    { 
      slug: 'web-development',
      title: 'Full-Stack Web Development', 
      shortTitle: 'Full-Stack Web Dev',
      icon: Code2, 
      tag: 'React 19 • Node.js • Next.js',
      physicalPrice: 450000,
      onlinePrice: 350000,
      physicalFormatted: '₦450K',
      onlineFormatted: '₦350K',
      physicalFull: '₦450,000',
      onlineFull: '₦350,000'
    },
    { 
      slug: 'mobile-app-development',
      title: 'Mobile App Engineering', 
      shortTitle: 'Mobile App Engineering',
      icon: Smartphone, 
      tag: 'Flutter • React Native • iOS',
      physicalPrice: 600000,
      onlinePrice: 500000,
      physicalFormatted: '₦600K',
      onlineFormatted: '₦500K',
      physicalFull: '₦600,000',
      onlineFull: '₦500,000'
    },
    { 
      slug: 'cybersecurity',
      title: 'Advanced Cybersecurity & Defense', 
      shortTitle: 'Cybersecurity & SOC',
      icon: Shield, 
      tag: 'Ethical Hacking • SOC • Pentest',
      physicalPrice: 550000,
      onlinePrice: 450000,
      physicalFormatted: '₦550K',
      onlineFormatted: '₦450K',
      physicalFull: '₦550,000',
      onlineFull: '₦450,000'
    },
    { 
      slug: 'cloud-architecture',
      title: 'Cloud Architecture & DevOps', 
      shortTitle: 'Cloud Architecture & DevOps',
      icon: Cloud, 
      tag: 'AWS • Kubernetes • Docker',
      physicalPrice: 550000,
      onlinePrice: 450000,
      physicalFormatted: '₦550K',
      onlineFormatted: '₦450K',
      physicalFull: '₦550,000',
      onlineFull: '₦450,000'
    },
    { 
      slug: 'sales-funnels-ai-automation',
      title: 'AI Automations & Systems', 
      shortTitle: 'AI Automations & Systems',
      icon: Bot, 
      tag: 'LLMs • Make.com • CRMs • Bots',
      physicalPrice: 350000,
      onlinePrice: 250000,
      physicalFormatted: '₦350K',
      onlineFormatted: '₦250K',
      physicalFull: '₦350,000',
      onlineFull: '₦250,000'
    },
    { 
      slug: 'data-analysis',
      title: 'Data Analysis & BI', 
      shortTitle: 'Data Analysis & BI',
      icon: BarChart3, 
      tag: 'PowerBI • SQL • Python',
      physicalPrice: 350000,
      onlinePrice: 250000,
      physicalFormatted: '₦350K',
      onlineFormatted: '₦250K',
      physicalFull: '₦350,000',
      onlineFull: '₦250,000'
    },
    { 
      slug: 'ui-ux-design',
      title: 'UI/UX Product Architecture', 
      shortTitle: 'UI/UX Product Design',
      icon: Layers, 
      tag: 'Figma • Design Systems • Wireframes',
      physicalPrice: 350000,
      onlinePrice: 250000,
      physicalFormatted: '₦350K',
      onlineFormatted: '₦250K',
      physicalFull: '₦350,000',
      onlineFull: '₦250,000'
    },
    { 
      slug: 'graphic-design',
      title: 'Graphic Design & Brand Identity', 
      shortTitle: 'Graphic & Brand Identity',
      icon: PenTool, 
      tag: 'Illustrator • Photoshop • Print',
      physicalPrice: 350000,
      onlinePrice: 250000,
      physicalFormatted: '₦350K',
      onlineFormatted: '₦250K',
      physicalFull: '₦350,000',
      onlineFull: '₦250,000'
    },
    { 
      slug: 'product-management',
      title: 'Product Management & Growth', 
      shortTitle: 'Product Management (PM)',
      icon: Briefcase, 
      tag: 'PRDs • Roadmaps • Agile Scrum',
      physicalPrice: 400000,
      onlinePrice: 300000,
      physicalFormatted: '₦400K',
      onlineFormatted: '₦300K',
      physicalFull: '₦400,000',
      onlineFull: '₦300,000'
    },
    { 
      slug: 'digital-marketing',
      title: 'Digital Marketing & Performance', 
      shortTitle: 'Digital Marketing & Ads',
      icon: TrendingUp, 
      tag: 'Meta Ads • Google SEO • Funnels',
      physicalPrice: 350000,
      onlinePrice: 250000,
      physicalFormatted: '₦350K',
      onlineFormatted: '₦250K',
      physicalFull: '₦350,000',
      onlineFull: '₦250,000'
    },
    { 
      slug: 'real-estate-development',
      title: 'Real Estate & PropTech Systems', 
      shortTitle: 'Real Estate & PropTech',
      icon: Building2, 
      tag: 'Feasibility • Land Title • PropTech',
      physicalPrice: 350000,
      onlinePrice: 250000,
      physicalFormatted: '₦350K',
      onlineFormatted: '₦250K',
      physicalFull: '₦350,000',
      onlineFull: '₦250,000'
    },
  ];

  const displayPhone = customPhone || config.contactPhone || '+234 701 248 9041';
  const displayEmail = customEmail || config.contactEmail || 'solutions@koglatech.com';

  const promotionalScript = `🚀 LAUNCH YOUR TECH CAREER WITH KOGLA TECH
✦ Admissions Open for ${cohortName} (${cohortDate})

🎓 11 Industry-Ready Tracks — Physical & Online Tuition:
(Physical on-site training includes dedicated lab workstations, physical hardware, & direct in-person mentorship)

1. Full-Stack Web Development: Physical: ₦450,000 | Online: ₦350,000
2. Mobile App Engineering (iOS & Android): Physical: ₦600,000 | Online: ₦500,000
3. Advanced Cybersecurity & Ethical Hacking: Physical: ₦550,000 | Online: ₦450,000
4. Cloud Architecture & DevOps (AWS/K8s): Physical: ₦550,000 | Online: ₦450,000
5. AI Automations & Systems: Physical: ₦350,000 | Online: ₦250,000
6. Data Analysis & Business Intelligence: Physical: ₦350,000 | Online: ₦250,000
7. UI/UX Design & Product Architecture: Physical: ₦350,000 | Online: ₦250,000
8. Graphic Design & Brand Identity: Physical: ₦350,000 | Online: ₦250,000
9. Product Management & Growth Strategy: Physical: ₦400,000 | Online: ₦300,000
10. Digital Marketing & Performance Ads: Physical: ₦350,000 | Online: ₦250,000
11. Real Estate Development & PropTech: Physical: ₦350,000 | Online: ₦250,000

⭐ Why Kogla Tech?
✔ 100% Practical Client Simulations & Live Production Labs
✔ Direct Talent Whitelisting for Hiring, Contracts & Internships
✔ Cryptographically Verifiable Certifications
✔ Senior 1-on-1 Mentorship & Codebase Audits

💼 Enterprise IT Solutions:
We also engineer custom web/mobile software, AI integrations, security audits, and cloud infrastructures for businesses worldwide.

🌐 Apply Now: koglatech.com/academy
📞 Phone / WhatsApp: ${displayPhone}
📩 Email: ${displayEmail}`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(promotionalScript);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // If not authenticated as admin, block access with clear prompt
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-850 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Lock size={26} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display uppercase tracking-wide text-white">
              Administrator Access Required
            </h2>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              The Marketing Flyer & Design Studio is exclusively accessible to verified Kogla administrators.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gold-500 hover:bg-gold-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-gold-500/10 cursor-pointer"
            >
              Log in to Admin Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const logoSrc = config.logoUrl || config.faviconUrl || '/apple-touch-icon.png';

  return (
    <div className={`min-h-screen ${isScreenshotMode ? 'bg-black p-4 flex items-center justify-center' : 'bg-black text-white pt-24 pb-20'}`}>
      
      {/* Top Header Controls (Hidden during clean screenshot mode) */}
      {!isScreenshotMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          
          {/* Navigation link back to admin */}
          <div className="mb-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-gold-400 transition-colors uppercase"
            >
              <ArrowLeft size={14} /> Back to Operations Command Console
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono rounded-full uppercase tracking-wider mb-2">
                <Sparkles size={14} /> Official Marketing & Screen Flyer Studio
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
                Kogla Promotional Flyers (11 Tracks & Physical/Online Tuition)
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-3xl font-sans">
                Professional, high-converting graphics designed for creators to put on screen during video ads, reels, and feeds. Clarifies both Physical on-site tuition (stacked on top) and Online virtual tuition across all 11 tracks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* PRIMARY ACTION: Download Photo Ultra-HD with Format Dropdown */}
              <div className="relative">
                <div className="flex items-center rounded-lg shadow-lg shadow-gold-500/15 overflow-hidden border border-gold-500/60">
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownloadPhoto('png', 3.5)}
                    className="px-4 py-2.5 bg-gradient-to-r from-gold-500 via-amber-400 to-yellow-500 hover:from-gold-400 hover:to-amber-300 text-black font-display text-xs uppercase font-black tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <Loader2 size={15} className="animate-spin text-black" />
                    ) : downloadSuccess ? (
                      <CheckCheck size={15} className="text-black" />
                    ) : (
                      <Download size={15} className="text-black" />
                    )}
                    <span>{isDownloading ? 'Rendering Ultra-HD...' : downloadSuccess ? 'Photo Downloaded!' : 'Download Ultra-HD Photo'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => setShowFormatMenu(!showFormatMenu)}
                    className="px-2.5 py-2.5 bg-amber-400 hover:bg-gold-300 text-black border-l border-amber-600/30 transition-all cursor-pointer"
                    title="Choose Format & Quality"
                  >
                    <span className="text-[10px] font-mono font-black">▼</span>
                  </button>
                </div>

                {/* Format Dropdown Menu */}
                {showFormatMenu && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-950 border-2 border-gold-500/60 rounded-xl p-2 shadow-2xl z-50 space-y-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1 text-[10px] text-gold-400 font-bold uppercase tracking-wider border-b border-zinc-850">
                      Select Image Quality & Format
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadPhoto('png', 4.0)}
                      className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-gold-500/10 hover:text-gold-300 flex items-center justify-between text-zinc-200 transition-all cursor-pointer"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <Sparkles size={13} className="text-gold-400" /> Ultra-HD PNG (4K Maximum)
                        </div>
                        <div className="text-[9.5px] text-zinc-400">Razor sharp text, lossless & crystal clear</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-gold-500/20 text-gold-300 rounded font-bold">4.0x</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPhoto('png', 2.5)}
                      className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-zinc-800 flex items-center justify-between text-zinc-200 transition-all cursor-pointer"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <FileImage size={13} className="text-blue-400" /> High-Res PNG (Standard HD)
                        </div>
                        <div className="text-[9.5px] text-zinc-400">Optimal balance of clarity and file size</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-bold">2.5x</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPhoto('jpeg', 3.0)}
                      className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-zinc-800 flex items-center justify-between text-zinc-200 transition-all cursor-pointer"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <ImageIcon size={13} className="text-amber-400" /> High-Quality JPG (98%)
                        </div>
                        <div className="text-[9.5px] text-zinc-400">Perfect for Instagram & WhatsApp feeds</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-bold">JPG</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyImageToClipboard}
                      className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-zinc-800 flex items-center justify-between text-zinc-200 transition-all cursor-pointer border-t border-zinc-850 pt-1.5"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <Copy size={13} className="text-emerald-400" /> Copy Photo to Clipboard
                        </div>
                        <div className="text-[9.5px] text-zinc-400">Directly paste into Slack, Canva or Docs</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">Copy</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-white font-mono text-xs uppercase font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedCaption ? 'Ad Script Copied!' : 'Copy Ad Script & Caption'}
              </button>

              <button
                type="button"
                onClick={() => setIsScreenshotMode(true)}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white font-mono text-xs uppercase font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                title="View full screen without surrounding UI"
              >
                <Maximize2 size={14} /> Full View
              </button>
            </div>
          </div>

          {/* Style Selector Tabs & Live Config Toolbar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Options Tabs */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setSelectedOption('option3')}
                className={`flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedOption === 'option3' 
                    ? 'bg-gold-500/10 border-gold-500/60 shadow-lg shadow-gold-500/5' 
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-gold-400 uppercase">Option 3 (Selected)</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded">1:1 Square Feed</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display">Dark Luxury Dual-Pillar with Pricing</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">High-impact square design with clear Physical & Online prices for all 11 tracks.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOption('option1')}
                className={`flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedOption === 'option1' 
                    ? 'bg-gold-500/10 border-gold-500/60 shadow-lg shadow-gold-500/5' 
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-gold-400 uppercase">Option 1</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded">4:5 Social Poster</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display">Executive Editorial Master Flyer</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Full 11 tracks with Physical & Online pricing + Whitelisting guarantee.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOption('option2')}
                className={`flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedOption === 'option2' 
                    ? 'bg-gold-500/10 border-gold-500/60 shadow-lg shadow-gold-500/5' 
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-gold-400 uppercase">Option 2</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded">9:16 Video Overlay</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display">Vertical Creator Video Screen</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Streamlined vertical layout optimized for Reels, TikToks & video displays.</p>
              </button>
            </div>

            {/* Quick Cohort & Contact Customizer */}
            <div className="lg:col-span-4 bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 flex flex-col justify-center">
              <div className="text-[11px] font-mono text-gold-400 uppercase font-bold mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Palette size={12} /> Custom Text Controls:</span>
                <span className="text-[9px] text-zinc-400 font-normal">Live Sync</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9.5px] text-zinc-400 font-mono block mb-0.5">Cohort Name</label>
                  <input
                    type="text"
                    value={cohortName}
                    onChange={(e) => setCohortName(e.target.value)}
                    className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-zinc-400 font-mono block mb-0.5">Start Date</label>
                  <input
                    type="text"
                    value={cohortDate}
                    onChange={(e) => setCohortDate(e.target.value)}
                    className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-zinc-400 font-mono block mb-0.5">Contact Phone</label>
                  <input
                    type="text"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    placeholder="+234 701 248 9041"
                    className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-zinc-400 font-mono block mb-0.5">Company Email</label>
                  <input
                    type="text"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="solutions@koglatech.com"
                    className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Mode Floating Action Bar */}
      {isScreenshotMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-zinc-950/95 backdrop-blur-md border border-gold-500/50 p-1.5 px-3 rounded-full shadow-2xl">
          <span className="text-xs font-mono text-gold-400 font-bold flex items-center gap-1.5">
            <Sparkles size={12} /> Full View
          </span>
          <div className="h-4 w-px bg-zinc-800" />
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => handleDownloadPhoto('png', 4.0)}
            className="px-3 py-1 bg-gold-500 hover:bg-gold-400 text-black font-display font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-75"
          >
            {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            <span>Download Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setIsScreenshotMode(false)}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full transition-all cursor-pointer"
            title="Exit Full View"
          >
            <Minimize2 size={13} />
          </button>
        </div>
      )}

      {/* Quick Download & Format Toolbar Above Canvas (Visible in standard mode) */}
      {!isScreenshotMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950/80 border border-zinc-850 px-3 py-1.5 rounded-lg">
            <Sparkles size={13} className="text-gold-400" />
            <span className="text-zinc-200 font-bold">Ultra-HD Clarity Active:</span>
            <span className="text-gold-400">3.5x - 4.0x Vector Rasterization (2,000+ px)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownloadPhoto('png', 4.0)}
              className="px-3 py-1.5 bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/50 text-gold-300 hover:text-gold-200 font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
            >
              {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>Download Ultra-HD PNG</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownloadPhoto('jpeg', 3.0)}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 text-zinc-300 hover:text-white font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
            >
              <ImageIcon size={13} />
              <span>Download JPG</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleCopyImageToClipboard}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 text-zinc-300 hover:text-white font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
              title="Copy photo directly to clipboard"
            >
              {copiedImage ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedImage ? 'Image Copied!' : 'Copy Image'}</span>
            </button>
          </div>
        </div>
      )}

      {/* FLYER CANVAS DISPLAY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center items-center">
        
        {/* ================= OPTION 3: 1:1 SQUARE CLEAN HUMAN GRAPHIC DESIGNER FLYER ================= */}
        {selectedOption === 'option3' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[520px] aspect-square bg-[#0b0c10] border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            {/* 1. Top Header: Brand Logo & Cohort Badge */}
            <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <img 
                  src={logoSrc} 
                  alt={config.companyName || 'Kogla Tech'} 
                  className="h-8 max-w-[110px] object-contain rounded bg-black px-1.5 py-0.5 border border-zinc-800"
                />
                <div>
                  <div className="font-display font-black text-sm tracking-wide uppercase text-white leading-tight">
                    KOGLA TECH
                  </div>
                  <div className="text-[8px] font-mono text-amber-400 tracking-wider uppercase leading-tight font-semibold">
                    PRACTICAL ACADEMY & IT SOLUTIONS
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[8.5px] font-mono font-bold rounded uppercase inline-block tracking-wider">
                  {cohortName}
                </span>
                <div className="text-[8px] font-mono text-zinc-400 mt-0.5">ADMISSIONS • {cohortDate}</div>
              </div>
            </div>

            {/* 2. Program Subhead & Tuition Legend Bar */}
            <div className="relative z-10 flex items-center justify-between bg-zinc-900/90 border border-zinc-800/90 rounded-lg px-2.5 py-1 text-[8.5px] font-mono">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
                <Sparkles size={11} className="text-amber-400 shrink-0" />
                <span>11 CAREER TRACKS & TUITION</span>
              </div>
              
              <div className="flex items-center gap-2 font-mono text-[8px]">
                <span className="text-amber-300 font-bold">PHY: Physical On-Site</span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-300 font-bold">ONL: Online Remote</span>
              </div>
            </div>

            {/* 3. 11 Career Tracks Clean Directory (2-Column Grid) */}
            <div className="relative z-10 grid grid-cols-2 gap-1.5 my-auto">
              
              {/* Column 1: First 6 Tracks */}
              <div className="space-y-1.5">
                {officialAllCourses.slice(0, 6).map((course, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#121319] border border-zinc-850 hover:border-amber-500/40 px-2 py-1 rounded-md flex items-center justify-between gap-1.5 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white truncate leading-tight font-sans tracking-tight">
                        {course.shortTitle}
                      </div>
                      <div className="text-[7.5px] text-amber-400/90 font-mono font-medium truncate leading-none">
                        {course.tag}
                      </div>
                    </div>

                    {/* Stacked Pricing: Physical ABOVE Online */}
                    <div className="shrink-0 text-right font-mono flex flex-col items-end leading-none space-y-0.5">
                      <div className="text-[9.5px] font-bold text-amber-300 flex items-center gap-0.5">
                        <span className="text-[6.5px] text-amber-400 font-bold px-0.5 py-0.2 bg-amber-500/20 rounded">PHY</span>
                        <span>{course.physicalFormatted}</span>
                      </div>
                      <div className="text-[8.5px] font-medium text-zinc-300 flex items-center gap-0.5">
                        <span className="text-[6.5px] text-zinc-400 font-bold px-0.5 py-0.2 bg-zinc-800 rounded">ONL</span>
                        <span>{course.onlineFormatted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Remaining 5 Tracks + Whitelist Slot */}
              <div className="space-y-1.5">
                {officialAllCourses.slice(6, 11).map((course, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#121319] border border-zinc-850 hover:border-amber-500/40 px-2 py-1 rounded-md flex items-center justify-between gap-1.5 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white truncate leading-tight font-sans tracking-tight">
                        {course.shortTitle}
                      </div>
                      <div className="text-[7.5px] text-amber-400/90 font-mono font-medium truncate leading-none">
                        {course.tag}
                      </div>
                    </div>

                    {/* Stacked Pricing: Physical ABOVE Online */}
                    <div className="shrink-0 text-right font-mono flex flex-col items-end leading-none space-y-0.5">
                      <div className="text-[9.5px] font-bold text-amber-300 flex items-center gap-0.5">
                        <span className="text-[6.5px] text-amber-400 font-bold px-0.5 py-0.2 bg-amber-500/20 rounded">PHY</span>
                        <span>{course.physicalFormatted}</span>
                      </div>
                      <div className="text-[8.5px] font-medium text-zinc-300 flex items-center gap-0.5">
                        <span className="text-[6.5px] text-zinc-400 font-bold px-0.5 py-0.2 bg-zinc-800 rounded">ONL</span>
                        <span>{course.onlineFormatted}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 6th Slot in Col 2: Whitelisting Guarantee Box */}
                <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-md flex items-center justify-between gap-1.5">
                  <div className="min-w-0 leading-tight">
                    <div className="text-[9px] font-bold font-display text-amber-300 uppercase truncate">
                      Talent Whitelisting
                    </div>
                    <div className="text-[7.5px] text-zinc-300 font-mono truncate">
                      Live Enterprise Labs & Hiring Network
                    </div>
                  </div>
                  <span className="text-[7px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded uppercase font-bold shrink-0">
                    Included
                  </span>
                </div>
              </div>

            </div>

            {/* 4. Footer Section: IT Solutions & Official Contact Details */}
            <div className="relative z-10 space-y-1.5 pt-1 border-t border-zinc-800/80">
              {/* Enterprise IT Sub-Bar */}
              <div className="text-[7.5px] font-mono text-zinc-400 flex items-center justify-between">
                <span className="text-amber-400 font-bold">IT SERVICES:</span>
                <span>Custom Software • Cloud & AI • Pentesting & Audits</span>
                <span className="text-emerald-400 font-semibold">Enterprise Ready</span>
              </div>

              {/* Master Registration, Phone & Email Bar */}
              <div className="bg-zinc-900 border border-amber-500/40 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                {/* Apply Website */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe size={13} className="text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[7px] font-mono text-zinc-400 uppercase leading-none">Apply Online:</div>
                    <div className="text-[11px] font-bold font-mono text-amber-300 tracking-wide leading-tight truncate">
                      koglatech.com/academy
                    </div>
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="flex flex-col items-center justify-center font-mono text-[8px] border-x border-zinc-800 px-2.5 leading-tight shrink-0">
                  <div className="text-white font-bold flex items-center gap-1">
                    <Phone size={9} className="text-amber-400 shrink-0" />
                    <span>{displayPhone}</span>
                  </div>
                  <div className="text-zinc-300 font-medium flex items-center gap-1 mt-0.5">
                    <Mail size={9} className="text-amber-400 shrink-0" />
                    <span>{displayEmail}</span>
                  </div>
                </div>

                {/* Practical Labs Note */}
                <div className="text-right font-mono text-[7.5px] text-zinc-300 leading-tight shrink-0">
                  <div className="text-white font-bold">100% Practical Labs</div>
                  <div className="text-amber-300/90 text-[7px]">Verified Cryptographic Certs</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= OPTION 1: 4:5 EXECUTIVE EDITORIAL MASTER FLYER ================= */}
        {selectedOption === 'option1' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[540px] bg-[#0b0c10] border border-amber-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-white select-none space-y-3.5"
          >
            {/* 1. Header: Brand Logo & Identity */}
            <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={logoSrc} 
                  alt={config.companyName || 'Kogla Tech'} 
                  className="h-9 max-w-[130px] object-contain rounded bg-black px-1.5 py-0.5 border border-zinc-800"
                />
                <div>
                  <div className="font-display font-black text-base tracking-wider uppercase text-white leading-tight">
                    KOGLA TECH
                  </div>
                  <div className="text-[9px] font-mono text-amber-400 tracking-widest uppercase font-semibold">
                    PRACTICAL ACADEMY & IT SOLUTIONS
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[9.5px] font-bold rounded uppercase inline-block">
                  {cohortName}
                </span>
                <div className="text-[8.5px] text-zinc-400 mt-1">ADMISSIONS OPEN • {cohortDate}</div>
              </div>
            </div>

            {/* 2. Headline & Subtitle */}
            <div className="relative z-10 space-y-1">
              <h2 className="text-xl sm:text-[22px] font-bold font-display uppercase tracking-tight leading-snug text-white">
                PRACTICAL TECH TRAINING. <span className="text-amber-400">DIRECT TALENT WHITELISTING.</span>
              </h2>
              <div className="h-0.5 w-12 bg-amber-400 my-1.5" />
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Industry-led practical training with live enterprise project simulations, senior mentorship, and physical or online attendance options.
              </p>
            </div>

            {/* 3. Pricing Legend Bar */}
            <div className="relative z-10 flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-[9px] font-mono">
              <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <Terminal size={12} /> 11 Specialized Career Tracks & Fees:
              </span>
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-amber-300 font-bold">PHY: Physical On-Site</span>
                <span>|</span>
                <span className="text-zinc-300 font-bold">ONL: Online Remote</span>
              </div>
            </div>

            {/* 4. Course Catalog Grid */}
            <div className="relative z-10 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                {officialAllCourses.map((course, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#121319] border border-zinc-850 hover:border-amber-500/40 p-2 rounded-lg flex items-center justify-between gap-1.5"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-white text-[11px] block truncate tracking-tight font-sans">
                        {course.shortTitle}
                      </span>
                      <span className="text-[8px] text-amber-400/90 truncate block font-medium">
                        {course.tag}
                      </span>
                    </div>

                    {/* Stacked Prices */}
                    <div className="shrink-0 text-right leading-tight font-mono">
                      <div className="text-[10px] font-bold text-amber-300">
                        <span className="text-[7.5px] text-amber-400 mr-1 font-bold">PHY</span>{course.physicalFormatted}
                      </div>
                      <div className="text-[8.5px] font-medium text-zinc-300">
                        <span className="text-[7.5px] text-zinc-400 mr-1 font-bold">ONL</span>{course.onlineFormatted}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Talent Whitelisting Guarantee Box */}
            <div className="relative z-10 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-display uppercase tracking-wider">
                <UserCheck size={15} className="text-amber-400" />
                <span>Training to Talent Whitelisting Guarantee</span>
              </div>
              <p className="text-[10.5px] text-zinc-200 leading-relaxed font-sans">
                Every cohort participant works on <strong>live enterprise client environments</strong>. High-performing graduates are directly <strong>whitelisted into our talent network</strong> for client contracts and hiring.
              </p>
              
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono border-t border-zinc-800">
                <div className="text-[9px] text-zinc-300 font-medium">
                  <span className="text-amber-400 font-bold block text-xs">100%</span> Practical Labs
                </div>
                <div className="text-[9px] text-zinc-300 font-medium border-x border-zinc-800">
                  <span className="text-amber-400 font-bold block text-xs">Verified</span> Cryptographic Certs
                </div>
                <div className="text-[9px] text-zinc-300 font-medium">
                  <span className="text-amber-400 font-bold block text-xs">Direct</span> Hiring Whitelist
                </div>
              </div>
            </div>

            {/* 6. Footer: Website, Phone & Email */}
            <div className="relative z-10 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-amber-400" />
                <span className="font-bold text-amber-300 tracking-wide text-xs">koglatech.com/academy</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300 text-[10.5px]">
                <span className="flex items-center gap-1 text-white font-bold">
                  <Phone size={11} className="text-amber-400" /> {displayPhone}
                </span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Mail size={11} className="text-amber-400" /> {displayEmail}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= OPTION 2: 9:16 VERTICAL STORY FLYER ================= */}
        {selectedOption === 'option2' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[430px] aspect-[9/16] bg-[#0b0c10] border border-amber-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            {/* Header: Main Logo & Cohort Banner */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={logoSrc} 
                    alt={config.companyName || 'Kogla Tech'} 
                    className="h-8 max-w-[120px] object-contain rounded bg-black px-1.5 py-0.5 border border-zinc-800"
                  />
                  <div>
                    <div className="font-display font-bold text-xs tracking-wider uppercase text-white leading-tight">
                      KOGLA TECH
                    </div>
                    <div className="text-[8px] font-mono text-amber-400 tracking-widest uppercase">
                      ACADEMY & IT SOLUTIONS
                    </div>
                  </div>
                </div>

                <div className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded text-[9px] font-mono text-amber-300 font-bold uppercase">
                  {cohortName}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold font-display uppercase tracking-tight leading-tight text-white">
                  LEARN TECH & GET <span className="text-amber-400">WHITELISTED</span> FOR JOBS
                </h2>
                <div className="h-0.5 w-10 bg-amber-400 my-1" />
                <p className="text-[10.5px] text-zinc-300 font-sans">
                  Intensive project-based training with verified cryptographic certificates & direct talent whitelisting.
                </p>
              </div>
            </div>

            {/* Middle Section: All 11 Courses Showcase */}
            <div className="relative z-10 space-y-1.5 my-auto py-1">
              <div className="flex items-center justify-between text-[10.5px] font-display font-bold text-amber-400 uppercase">
                <span>11 Tracks & Tuition Fees</span>
                <span className="text-[8px] font-mono text-amber-300 font-medium">PHY (On-Site) / ONL (Remote)</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 space-y-1 text-[9.5px] font-mono">
                <div className="grid grid-cols-2 gap-1">
                  {officialAllCourses.map((course, idx) => (
                    <div key={idx} className="bg-[#121319] p-1.5 rounded border border-zinc-800 flex items-center justify-between gap-1">
                      <div className="truncate font-sans font-bold text-white text-[9.5px]">
                        {course.shortTitle}
                      </div>
                      <div className="text-right leading-none shrink-0 font-mono">
                        <div className="text-[9px] font-bold text-amber-300">
                          {course.physicalFormatted}
                        </div>
                        <div className="text-[7.5px] text-zinc-300">
                          {course.onlineFormatted}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Whitelist Quality Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-xs text-zinc-200 space-y-0.5">
                <div className="font-bold text-amber-400 font-display text-[9.5px] uppercase flex items-center gap-1">
                  <Award size={11} /> Training to Talent Whitelist
                </div>
                <p className="text-[8.5px] leading-tight text-zinc-300">
                  Graduate directly onto our talent whitelist for client contracts, remote roles, and hiring partnerships.
                </p>
              </div>

              {/* Enterprise IT Solutions */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[8.5px] font-mono text-zinc-300">
                <span className="text-amber-400 font-bold uppercase block text-[8px]">💼 Enterprise IT Services:</span>
                Custom Software • Security Audits • Cloud Architecture • AI Systems
              </div>
            </div>

            {/* Footer: Web URL, Phone, Email and Registration Info */}
            <div className="relative z-10 pt-2 border-t border-zinc-800 space-y-1.5">
              <div className="bg-amber-500 text-black p-2 rounded-lg text-center font-display font-black text-xs uppercase tracking-wider">
                ENROLL NOW: KOGLATECH.COM/ACADEMY
              </div>
              <div className="flex items-center justify-between text-[8.5px] font-mono text-zinc-300 px-1">
                <span className="text-white font-bold flex items-center gap-1"><Phone size={9} className="text-amber-400" /> {displayPhone}</span>
                <span className="flex items-center gap-1"><Mail size={9} className="text-amber-400" /> {displayEmail}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Creator Media Kit & Talking Points (Hidden in clean screenshot mode) */}
      {!isScreenshotMode && (
        <div className="max-w-4xl mx-auto px-4 mt-12 space-y-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold-400 font-display font-bold text-sm uppercase">
              <Sparkles size={15} /> Official Brand Talking Points & Pitch Guide
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-zinc-300">
              <div className="bg-black/60 p-3.5 rounded-xl border border-zinc-850 space-y-1.5">
                <span className="text-gold-400 font-bold block uppercase text-[11px]">1. Academy & Pricing Structure:</span>
                <p className="leading-relaxed">
                  "Kogla Tech offers 11 hands-on tech training tracks available in both <strong>Physical on-site classes</strong> (with dedicated lab workstations, physical infrastructure & in-person mentorship) and <strong>Online classes</strong> (interactive remote live sessions). Students get directly whitelisted into the Kogla talent network for contracts and jobs."
                </p>
              </div>

              <div className="bg-black/60 p-3.5 rounded-xl border border-zinc-850 space-y-1.5">
                <span className="text-gold-400 font-bold block uppercase text-[11px]">2. Business IT Solutions Pitch:</span>
                <p className="leading-relaxed">
                  "If your business needs enterprise-grade software, mobile apps, penetration testing, cybersecurity audits, or AI workflows, Kogla Tech's engineering team delivers production-ready solutions."
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex items-center justify-between flex-wrap gap-2">
              <span>💡 <strong>Creator Instruction:</strong> Place this graphic on screen during video presentations or pin it in your story / video overlay.</span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="text-gold-400 hover:text-gold-300 font-bold underline cursor-pointer"
              >
                Copy caption & script
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
