import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  MapPin
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
  const isRoleAdmin = profile?.role === 'admin' || user?.role === 'admin';
  const hasLocalAdmin = typeof window !== 'undefined' && localStorage.getItem('isKoglaAdmin') === 'true';
  const isAuthorizedAdmin = isSuperAdmin || isRoleAdmin || hasLocalAdmin;

  // Customization States
  const [cohortName, setCohortName] = useState(config.cohortBatchName || 'COHORT CO-2026');
  const [cohortDate, setCohortDate] = useState('September 2026');
  const [customSubtitle, setCustomSubtitle] = useState('From Zero to Industry-Ready & Talent Whitelisted');
  
  // View & Option States (Defaulted to Option 3 as requested)
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | 'option3'>('option3');
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

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
📩 Inquiries: solutions@koglatech.com`;

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
                className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-black font-display text-xs uppercase font-bold tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-gold-500/10 transition-all cursor-pointer"
              >
                <Maximize2 size={15} /> Clean Screenshot Mode
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

            {/* Quick Cohort Customizer */}
            <div className="lg:col-span-4 bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[11px] font-mono text-gold-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                <Palette size={12} /> Custom Text Controls:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block">Cohort Name</label>
                  <input
                    type="text"
                    value={cohortName}
                    onChange={(e) => setCohortName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block">Start Date</label>
                  <input
                    type="text"
                    value={cohortDate}
                    onChange={(e) => setCohortDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Mode Floating Exit Pill */}
      {isScreenshotMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-zinc-900/95 backdrop-blur-md border border-gold-500/40 px-4 py-2 rounded-full shadow-2xl">
          <span className="text-xs font-mono text-gold-400 font-bold">Screenshot Mode Active</span>
          <span className="text-[11px] text-zinc-400 font-mono">Press Esc or</span>
          <button
            type="button"
            onClick={() => setIsScreenshotMode(false)}
            className="p-1 bg-gold-500 hover:bg-gold-400 text-black rounded-full transition-all cursor-pointer"
            title="Exit Screenshot Mode"
          >
            <Minimize2 size={13} />
          </button>
        </div>
      )}

      {/* FLYER CANVAS DISPLAY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center items-center">
        
        {/* ================= OPTION 3: 1:1 SQUARE DARK LUXURY DUAL-PILLAR (WITH FULL PRICING) ================= */}
        {selectedOption === 'option3' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[520px] aspect-square bg-[#050505] border-2 border-gold-500/50 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            {/* Background Texture & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:18px_18px] opacity-10 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* 1. Top Header: Main Logo, Identity & Cohort */}
            <div className="relative z-10 flex items-center justify-between border-b border-zinc-850/90 pb-2.5">
              <div className="flex items-center gap-2.5">
                <img 
                  src={logoSrc} 
                  alt={config.companyName || 'Kogla Tech'} 
                  className="h-8 max-w-[110px] object-contain rounded-sm border border-gold-500/40 bg-black/80 p-0.5"
                />
                <div>
                  <div className="font-display font-black text-sm tracking-wider uppercase text-white leading-tight">
                    KOGLA TECH
                  </div>
                  <div className="text-[8px] font-mono text-gold-400 tracking-widest uppercase leading-tight">
                    PRACTICAL ACADEMY & IT SOLUTIONS
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 bg-gold-500/20 border border-gold-500/50 text-gold-300 text-[9px] font-mono font-bold rounded uppercase inline-block">
                  ✦ {cohortName}
                </span>
                <div className="text-[8px] font-mono text-zinc-400 mt-0.5">ADMISSIONS • {cohortDate}</div>
              </div>
            </div>

            {/* 2. Pricing Clarification & Legend Bar (Physical on-site vs Online remote) */}
            <div className="relative z-10 flex items-center justify-between bg-zinc-950/95 border border-gold-500/35 rounded-lg px-2.5 py-1 text-[8.5px] font-mono shadow-sm">
              <div className="flex items-center gap-1.5 text-gold-400 font-bold uppercase tracking-wider">
                <Sparkles size={11} className="text-gold-400 shrink-0" />
                <span>11 Career Tracks • Tuition</span>
              </div>
              
              <div className="flex items-center gap-2 font-mono">
                {/* Physical Legend */}
                <div className="flex items-center gap-1 text-amber-300 font-bold">
                  <span className="px-1 py-0.2 bg-amber-500/20 border border-amber-500/40 rounded text-[7.5px] uppercase">
                    🏢 PHYSICAL (Above)
                  </span>
                </div>
                <span className="text-zinc-600">/</span>
                {/* Online Legend */}
                <div className="flex items-center gap-1 text-zinc-300 font-bold">
                  <span className="px-1 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-[7.5px] uppercase">
                    🌐 ONLINE (Below)
                  </span>
                </div>
              </div>
            </div>

            {/* 3. 11 Tracks Grid with Physical (Above) and Online (Below) Prices */}
            <div className="relative z-10 grid grid-cols-2 gap-1.5 my-auto">
              
              {/* Column 1: First 6 Tracks */}
              <div className="space-y-1.5">
                {officialAllCourses.slice(0, 6).map((course, idx) => {
                  const Icon = course.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-zinc-950/90 border border-zinc-850/90 hover:border-gold-500/40 px-2 py-1 rounded-lg flex items-center justify-between gap-1.5 transition-all"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="p-1 rounded bg-gold-500/10 text-gold-400 shrink-0">
                          <Icon size={10} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9.5px] font-bold text-zinc-100 truncate leading-tight font-sans">
                            {course.shortTitle}
                          </div>
                          <div className="text-[7.5px] text-zinc-400 font-mono truncate leading-none">
                            {course.tag}
                          </div>
                        </div>
                      </div>

                      {/* Stacked Pricing: Physical STRICTLY ABOVE Online */}
                      <div className="shrink-0 text-right font-mono flex flex-col items-end leading-none space-y-0.5">
                        {/* Physical Price (Top) */}
                        <div className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
                          <span className="text-[7px] text-amber-400/90 font-semibold px-0.5 py-0.2 bg-amber-500/15 rounded">
                            PHY
                          </span>
                          <span>{course.physicalFormatted}</span>
                        </div>
                        {/* Online Price (Bottom) */}
                        <div className="text-[8px] font-medium text-zinc-300 flex items-center gap-1">
                          <span className="text-[7px] text-zinc-400 font-semibold px-0.5 py-0.2 bg-zinc-800 rounded">
                            ONL
                          </span>
                          <span>{course.onlineFormatted}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Remaining 5 Tracks + Whitelist Badge */}
              <div className="space-y-1.5">
                {officialAllCourses.slice(6, 11).map((course, idx) => {
                  const Icon = course.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-zinc-950/90 border border-zinc-850/90 hover:border-gold-500/40 px-2 py-1 rounded-lg flex items-center justify-between gap-1.5 transition-all"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="p-1 rounded bg-gold-500/10 text-gold-400 shrink-0">
                          <Icon size={10} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9.5px] font-bold text-zinc-100 truncate leading-tight font-sans">
                            {course.shortTitle}
                          </div>
                          <div className="text-[7.5px] text-zinc-400 font-mono truncate leading-none">
                            {course.tag}
                          </div>
                        </div>
                      </div>

                      {/* Stacked Pricing: Physical STRICTLY ABOVE Online */}
                      <div className="shrink-0 text-right font-mono flex flex-col items-end leading-none space-y-0.5">
                        {/* Physical Price (Top) */}
                        <div className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
                          <span className="text-[7px] text-amber-400/90 font-semibold px-0.5 py-0.2 bg-amber-500/15 rounded">
                            PHY
                          </span>
                          <span>{course.physicalFormatted}</span>
                        </div>
                        {/* Online Price (Bottom) */}
                        <div className="text-[8px] font-medium text-zinc-300 flex items-center gap-1">
                          <span className="text-[7px] text-zinc-400 font-semibold px-0.5 py-0.2 bg-zinc-800 rounded">
                            ONL
                          </span>
                          <span>{course.onlineFormatted}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 6th Slot in Col 2: Whitelisting & Quality Guarantee Box */}
                <div className="bg-gradient-to-r from-gold-500/15 via-zinc-900 to-amber-500/10 border border-gold-500/40 px-2 py-1 rounded-lg flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="p-1 rounded bg-gold-500/20 text-gold-400 shrink-0">
                      <Award size={10} />
                    </div>
                    <div className="min-w-0 leading-tight">
                      <div className="text-[8.5px] font-bold font-display text-gold-400 uppercase truncate">
                        Talent Whitelisting
                      </div>
                      <div className="text-[7.5px] text-zinc-300 font-mono truncate">
                        Live Labs & Hiring Pool
                      </div>
                    </div>
                  </div>
                  <span className="text-[7px] font-mono px-1 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded uppercase font-bold shrink-0">
                    Direct
                  </span>
                </div>
              </div>

            </div>

            {/* 4. Bottom Strip: Enterprise IT & Enrollment URL */}
            <div className="relative z-10 space-y-1.5 pt-1">
              {/* Enterprise IT Solutions Sub-Bar */}
              <div className="bg-zinc-950/90 border border-zinc-850 px-2 py-1 rounded-lg flex items-center justify-between text-[8px] font-mono">
                <div className="flex items-center gap-1 text-gold-400 font-bold uppercase truncate">
                  <Server size={10} className="shrink-0" />
                  <span>IT Solutions:</span>
                  <span className="text-zinc-300 font-normal normal-case truncate">
                    Custom Web/Apps • Pentesting • Cloud & AI Systems
                  </span>
                </div>
                <span className="text-[7.5px] text-emerald-400 font-bold uppercase shrink-0 pl-1">
                  Enterprise
                </span>
              </div>

              {/* Master Registration & Certification Bar */}
              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-gold-500/50 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-gold-500/15 text-gold-400 shrink-0">
                    <Globe size={12} />
                  </div>
                  <div>
                    <div className="text-[7.5px] font-mono text-zinc-400 uppercase leading-none">Apply & Register:</div>
                    <div className="text-xs font-black font-mono text-gold-400 tracking-wide leading-tight">
                      koglatech.com/academy
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[8px] text-zinc-300 leading-tight">
                  <div className="text-white font-bold flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 100% Practical Labs
                  </div>
                  <div className="text-gold-300 font-medium">Verified Cryptographic Certs</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= OPTION 1: 4:5 EXECUTIVE EDITORIAL MASTER FLYER ================= */}
        {selectedOption === 'option1' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[540px] bg-gradient-to-b from-[#09090b] via-[#050505] to-black border-2 border-gold-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-white select-none space-y-3.5"
          >
            {/* Top Atmospheric Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* 1. Header: Main Admin Logo & Identity */}
            <div className="relative z-10 flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={logoSrc} 
                  alt={config.companyName || 'Kogla Tech'} 
                  className="h-10 max-w-[140px] object-contain rounded-sm border border-gold-500/40 bg-black/80 p-1"
                />
                <div>
                  <div className="font-display font-black text-base tracking-wider uppercase text-white leading-tight">
                    KOGLA TECH
                  </div>
                  <div className="text-[9.5px] font-mono text-gold-400 tracking-widest uppercase">
                    PRACTICAL ACADEMY & IT SOLUTIONS
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="px-2.5 py-1 bg-gold-500/20 border border-gold-500/50 text-gold-400 text-[10px] font-bold rounded-full uppercase inline-block">
                  ✦ {cohortName}
                </span>
                <div className="text-[9px] text-zinc-400 mt-1">ADMISSIONS OPEN • {cohortDate}</div>
              </div>
            </div>

            {/* 2. Bold Headline */}
            <div className="relative z-10 space-y-0.5">
              <h2 className="text-xl sm:text-[24px] font-black font-display uppercase tracking-tight leading-[1.15] text-white">
                LEARN PRACTICAL TECH. <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500">GET WHITELISTED</span> FOR REAL JOBS.
              </h2>
              <p className="text-xs text-zinc-300 font-sans leading-snug">
                Industry-led training with live client project simulations, senior mentorship, and physical & online options.
              </p>
            </div>

            {/* 3. Pricing Legend Bar */}
            <div className="relative z-10 flex items-center justify-between bg-zinc-950 border border-gold-500/30 rounded-lg px-3 py-1.5 text-[9.5px] font-mono">
              <span className="text-gold-400 font-bold uppercase flex items-center gap-1.5">
                <Terminal size={12} /> 11 Specialized Career Tracks:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-bold">🏢 PHYSICAL (Above)</span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-300 font-bold">🌐 ONLINE (Below)</span>
              </div>
            </div>

            {/* 4. All 11 Course Offerings Grid with Physical & Online Prices */}
            <div className="relative z-10 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                {officialAllCourses.map((course, idx) => {
                  const Icon = course.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-zinc-950/90 border border-zinc-850 hover:border-gold-500/40 p-2 rounded-xl flex items-center justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="p-1 rounded bg-gold-500/10 text-gold-400 shrink-0">
                          <Icon size={12} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-200 text-[10.5px] block truncate">
                            {course.shortTitle}
                          </span>
                          <span className="text-[8px] text-zinc-400 truncate block">
                            {course.tag}
                          </span>
                        </div>
                      </div>

                      {/* Stacked Prices: Physical (Above) / Online (Below) */}
                      <div className="shrink-0 text-right leading-tight">
                        <div className="text-[9.5px] font-bold text-amber-300">
                          <span className="text-[7.5px] text-amber-400/80 mr-1">PHY</span>{course.physicalFormatted}
                        </div>
                        <div className="text-[8.5px] font-medium text-zinc-300">
                          <span className="text-[7.5px] text-zinc-400 mr-1">ONL</span>{course.onlineFormatted}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Talent Whitelisting Box */}
            <div className="relative z-10 bg-gradient-to-r from-gold-500/10 via-zinc-900 to-gold-500/10 border border-gold-500/40 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-bold font-display uppercase tracking-wider">
                <UserCheck size={14} className="text-gold-400" />
                <span>Training to Talent Whitelisting Guarantee</span>
              </div>
              <p className="text-[10.5px] text-zinc-200 leading-relaxed font-sans">
                Every cohort participant works on <strong>live enterprise client environments</strong>. High-performing graduates are directly <strong>whitelisted into our talent network</strong> for client contracts and hiring.
              </p>
              
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono border-t border-zinc-800/80">
                <div className="text-[9px] text-zinc-300">
                  <span className="text-gold-400 font-bold block text-xs">100%</span> Practical Labs
                </div>
                <div className="text-[9px] text-zinc-300 border-x border-zinc-800">
                  <span className="text-gold-400 font-bold block text-xs">Verified</span> Cryptographic Certs
                </div>
                <div className="text-[9px] text-zinc-300">
                  <span className="text-gold-400 font-bold block text-xs">Direct</span> Hiring Whitelist
                </div>
              </div>
            </div>

            {/* 6. Footer: Website & Contact */}
            <div className="relative z-10 pt-2 border-t border-zinc-850 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Globe size={13} className="text-gold-400" />
                <span className="font-bold text-white tracking-wide">koglatech.com/academy</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                <span>solutions@koglatech.com</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= OPTION 2: 9:16 VERTICAL CREATOR VIDEO SCREEN ================= */}
        {selectedOption === 'option2' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[430px] aspect-[9/16] bg-gradient-to-b from-zinc-950 via-[#070709] to-black border-2 border-gold-500/50 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Main Logo & Cohort Banner */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={logoSrc} 
                    alt={config.companyName || 'Kogla Tech'} 
                    className="h-8 max-w-[120px] object-contain rounded-sm border border-gold-500/40 bg-black/80 p-0.5"
                  />
                  <div>
                    <div className="font-display font-black text-xs tracking-wider uppercase text-white leading-tight">
                      KOGLA TECH
                    </div>
                    <div className="text-[8px] font-mono text-gold-400 tracking-widest uppercase">
                      ACADEMY & IT SOLUTIONS
                    </div>
                  </div>
                </div>

                <div className="px-2 py-0.5 bg-gold-500/15 border border-gold-500/40 rounded-full text-[9px] font-mono text-gold-300 font-bold uppercase">
                  {cohortName}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black font-display uppercase tracking-tight leading-tight text-white">
                  LEARN TECH & GET <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500">WHITELISTED</span> FOR JOBS
                </h2>
                <p className="text-[11px] text-zinc-300 font-sans">
                  Intensive project-based training with verified cryptographic certificates & direct talent whitelisting.
                </p>
              </div>
            </div>

            {/* Middle Section: All 11 Courses Showcase with Physical (Above) & Online (Below) Pricing */}
            <div className="relative z-10 space-y-1.5 my-auto py-1">
              <div className="flex items-center justify-between text-[11px] font-display font-bold text-gold-400 uppercase">
                <span>✦ 11 Tracks • Tuition Breakdown</span>
                <span className="text-[8.5px] font-mono text-amber-300">PHY (Above) / ONL (Below)</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 space-y-1 text-[9.5px] font-mono">
                <div className="grid grid-cols-2 gap-1">
                  {officialAllCourses.map((course, idx) => (
                    <div key={idx} className="bg-black/60 p-1.5 rounded-lg border border-zinc-800/80 flex items-center justify-between gap-1">
                      <div className="truncate font-sans font-medium text-zinc-200 text-[9px]">
                        {course.shortTitle}
                      </div>
                      <div className="text-right leading-none shrink-0">
                        <div className="text-[8.5px] font-bold text-amber-300">
                          {course.physicalFormatted}
                        </div>
                        <div className="text-[7.5px] text-zinc-400 font-medium">
                          {course.onlineFormatted}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Whitelist Quality Box */}
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-2 text-xs text-zinc-200 space-y-0.5">
                <div className="font-bold text-gold-400 font-display text-[10px] uppercase flex items-center gap-1">
                  <Award size={11} /> Training to Talent Whitelist
                </div>
                <p className="text-[9px] leading-tight text-zinc-300">
                  Graduate directly onto our talent whitelist for client contracts, remote roles, and hiring partnerships.
                </p>
              </div>

              {/* Enterprise IT Solutions */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-[9px] font-mono text-zinc-300">
                <span className="text-gold-400 font-bold uppercase block text-[8.5px]">💼 Enterprise IT Solutions:</span>
                Custom Software • Security Audits • Cloud Architecture • AI Systems
              </div>
            </div>

            {/* Footer: Web URL and Registration Info */}
            <div className="relative z-10 pt-2 border-t border-zinc-850 space-y-1.5">
              <div className="bg-gradient-to-r from-gold-500 via-amber-400 to-yellow-500 text-black p-2 rounded-xl text-center font-display font-black text-xs uppercase tracking-wider shadow-lg">
                ENROLL NOW: KOGLATECH.COM/ACADEMY
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-1">
                <span>Admissions: {cohortDate}</span>
                <span>solutions@koglatech.com</span>
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
