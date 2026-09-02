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
  Mail
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import { isSystemAdminEmail } from '../lib/authUtils';

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
  
  // View & Option States
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | 'option3'>('option1');
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const officialAllCourses = [
    { title: 'Full-Stack Web Development', icon: Code2, tag: 'React 19 • Node.js' },
    { title: 'Mobile App Engineering', icon: Smartphone, tag: 'Flutter • React Native' },
    { title: 'Advanced Cybersecurity & Defense', icon: Shield, tag: 'Ethical Hacking • SOC' },
    { title: 'Cloud Architecture & DevOps', icon: Cloud, tag: 'AWS • Kubernetes • Docker' },
    { title: 'AI Automations & Systems', icon: Bot, tag: 'LLMs • Make.com • CRMs' },
    { title: 'Data Analysis & BI', icon: BarChart3, tag: 'PowerBI • SQL • Python' },
    { title: 'UI/UX Product Architecture', icon: Layers, tag: 'Figma • Design Systems' },
    { title: 'Graphic Design & Brand Identity', icon: PenTool, tag: 'Illustrator • Photoshop' },
    { title: 'Product Management & Growth', icon: Briefcase, tag: 'Roadmaps • Scrum' },
    { title: 'Digital Marketing & Performance', icon: TrendingUp, tag: 'Meta Ads • Google SEO' },
    { title: 'Real Estate & PropTech Systems', icon: Building2, tag: 'Feasibility • Syndication' },
  ];

  const promotionalScript = `🚀 LAUNCH YOUR TECH CAREER WITH KOGLA TECH
✦ Admissions Open for ${cohortName} (${cohortDate})

🎓 11 Industry-Ready Tracks:
1. Full-Stack Web Development
2. Mobile App Engineering (iOS & Android)
3. Advanced Cybersecurity & Ethical Hacking
4. Cloud Architecture & DevOps Engineering
5. AI Automations, LLMs & Systems
6. Data Analysis & Business Intelligence
7. UI/UX Design & Product Architecture
8. Graphic Design & Visual Brand Identity
9. Product Management & Growth Strategy
10. Digital Marketing & Performance Ads
11. Real Estate Development & PropTech

⭐ Why Kogla Tech?
✔ 100% Practical Client Simulations & Live Labs
✔ Direct Talent Whitelisting for Hiring & Internships
✔ Cryptographically Verifiable Certifications
✔ Live Senior Industry Mentorship

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
                Kogla Promotional Flyers (11 Tracks & IT Solutions)
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-3xl font-sans">
                Professional, high-converting graphics designed for creators to put on screen during video ads, reels, and feeds. Highlights all 11 course tracks, talent whitelisting pipeline, and enterprise IT services.
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
                <p className="text-[11px] text-zinc-400 mt-0.5">All 11 tracks + Talent Whitelisting guarantee + Enterprise IT solutions.</p>
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
                  <span className="text-xs font-mono font-bold text-gold-400 uppercase">Option 3</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded">1:1 Square Feed</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display">Dark Luxury Dual-Pillar</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">High-impact square design with obsidian badges & tech architecture.</p>
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
        
        {/* ================= OPTION 1: 4:5 EXECUTIVE EDITORIAL MASTER FLYER ================= */}
        {selectedOption === 'option1' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[540px] bg-gradient-to-b from-[#09090b] via-[#050505] to-black border-2 border-gold-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-white select-none space-y-4"
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
            <div className="relative z-10 space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-black font-display uppercase tracking-tight leading-[1.15] text-white">
                LEARN PRACTICAL TECH. <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500">GET WHITELISTED</span> FOR REAL JOBS.
              </h2>
              <p className="text-xs text-zinc-300 font-sans leading-snug">
                Industry-led training with live client project simulations, senior mentorship, and direct placement whitelist.
              </p>
            </div>

            {/* 3. All 11 Course Offerings Grid */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal size={13} /> Available Academy Tracks (11 Specialized Disciplines)
                </span>
                <span className="text-[9px] font-mono text-zinc-400">Beginner to Advanced</span>
              </div>

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
                        <span className="font-semibold text-zinc-200 text-[11px] truncate">
                          {course.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Talent Whitelisting & Quality Pillar Box */}
            <div className="relative z-10 bg-gradient-to-r from-gold-500/10 via-zinc-900 to-gold-500/10 border border-gold-500/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-bold font-display uppercase tracking-wider">
                <UserCheck size={14} className="text-gold-400" />
                <span>Training to Talent Whitelisting Guarantee</span>
              </div>
              <p className="text-[11px] text-zinc-200 leading-relaxed font-sans">
                Every cohort participant works on <strong>live enterprise client environments</strong> and production codebase audits. High-performing graduates are directly <strong>whitelisted into our talent network</strong> for client contracts, internships, and corporate recruitment.
              </p>
              
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono border-t border-zinc-800/80">
                <div className="text-[9.5px] text-zinc-300">
                  <span className="text-gold-400 font-bold block text-xs">100%</span> Practical Labs
                </div>
                <div className="text-[9.5px] text-zinc-300 border-x border-zinc-800">
                  <span className="text-gold-400 font-bold block text-xs">Verified</span> Cryptographic Certs
                </div>
                <div className="text-[9.5px] text-zinc-300">
                  <span className="text-gold-400 font-bold block text-xs">Direct</span> Hiring Whitelist
                </div>
              </div>
            </div>

            {/* 5. Enterprise IT Solutions Row */}
            <div className="relative z-10 bg-zinc-950/80 border border-zinc-850 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-gold-400 uppercase flex items-center gap-1.5">
                  <Server size={12} /> Enterprise IT Solutions (For Businesses):
                </div>
                <div className="text-[10.5px] text-zinc-300">
                  Custom Software • Web & Mobile Apps • Penetration Testing • Cloud Architecture • AI Systems
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold rounded uppercase">
                  Client Services
                </span>
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
            className="w-full max-w-[430px] aspect-[9/16] bg-gradient-to-b from-zinc-950 via-[#070709] to-black border-2 border-gold-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Main Logo & Cohort Banner */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={logoSrc} 
                    alt={config.companyName || 'Kogla Tech'} 
                    className="h-9 max-w-[130px] object-contain rounded-sm border border-gold-500/40 bg-black/80 p-1"
                  />
                  <div>
                    <div className="font-display font-black text-sm tracking-wider uppercase text-white leading-tight">
                      KOGLA TECH
                    </div>
                    <div className="text-[9px] font-mono text-gold-400 tracking-widest uppercase">
                      ACADEMY & IT SOLUTIONS
                    </div>
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-gold-500/15 border border-gold-500/40 rounded-full text-[10px] font-mono text-gold-300 font-bold uppercase">
                  {cohortName}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black font-display uppercase tracking-tight leading-tight text-white">
                  LEARN TECH & GET <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500">WHITELISTED</span> FOR JOBS
                </h2>
                <p className="text-xs text-zinc-300 mt-1 font-sans">
                  Intensive project-based training with verified cryptographic certificates & direct corporate talent whitelisting.
                </p>
              </div>
            </div>

            {/* Middle Section: All 11 Courses Compact Showcase */}
            <div className="relative z-10 space-y-2 my-auto py-1">
              <div className="flex items-center justify-between text-xs font-display font-bold text-gold-400 uppercase">
                <span>✦ All 11 Training Tracks Available</span>
                <span className="text-[9px] font-mono text-zinc-400">Live Mentors</span>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 space-y-1.5 text-[10.5px] font-mono">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Full-Stack Web Dev
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Mobile App Eng.
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Cybersecurity & SOC
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Cloud & DevOps (AWS)
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> AI & Automations
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Data Analysis & BI
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> UI/UX Architecture
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Graphic & Brand Design
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Product Management
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 truncate">
                    <CheckCircle2 size={11} className="text-gold-400 shrink-0" /> Digital Marketing Ads
                  </div>
                </div>
                <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] text-gold-400">
                  <span>+ Real Estate Development & PropTech</span>
                  <span className="text-zinc-400">{cohortDate}</span>
                </div>
              </div>

              {/* Whitelist Quality Box */}
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-2.5 text-xs text-zinc-200 space-y-1">
                <div className="font-bold text-gold-400 font-display text-[11px] uppercase flex items-center gap-1">
                  <Award size={12} /> Training to Talent Whitelist
                </div>
                <p className="text-[10px] leading-tight text-zinc-300">
                  Graduate directly onto our talent whitelist for client contracts, remote roles, and hiring partnerships.
                </p>
              </div>

              {/* Enterprise IT Solutions */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-[10.5px] font-mono text-zinc-300">
                <span className="text-gold-400 font-bold uppercase block text-[10px]">💼 Enterprise IT Solutions:</span>
                Custom Software • Security Audits • Cloud Architecture • AI Systems
              </div>
            </div>

            {/* Footer: Web URL and Registration Info */}
            <div className="relative z-10 pt-3 border-t border-zinc-850 space-y-2">
              <div className="bg-gradient-to-r from-gold-500 via-amber-400 to-yellow-500 text-black p-2.5 rounded-xl text-center font-display font-black text-sm uppercase tracking-wider shadow-lg">
                ENROLL NOW: KOGLATECH.COM/ACADEMY
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
                <span>Admissions: {cohortDate}</span>
                <span>solutions@koglatech.com</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= OPTION 3: 1:1 SQUARE DARK LUXURY DUAL-PILLAR ================= */}
        {selectedOption === 'option3' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[520px] aspect-square bg-[#050505] border-2 border-gold-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Main Logo & Title */}
            <div className="relative z-10 flex items-start justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={logoSrc} 
                  alt={config.companyName || 'Kogla Tech'} 
                  className="h-10 max-w-[130px] object-contain rounded-sm border border-gold-500/40 bg-black/80 p-1"
                />
                <div>
                  <div className="font-display font-black text-base tracking-wider uppercase text-white">
                    KOGLA TECH
                  </div>
                  <div className="text-[9.5px] font-mono text-gold-400 tracking-widest uppercase">
                    ACADEMY & IT SOLUTIONS
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-gold-500/20 border border-gold-500/40 text-gold-400 text-[10px] font-mono font-bold rounded uppercase">
                  {cohortName}
                </span>
                <div className="text-[9px] font-mono text-zinc-400 mt-1">{cohortDate}</div>
              </div>
            </div>

            {/* Dual Pillars: 11 Courses on Left, IT Solutions & Whitelisting on Right */}
            <div className="relative z-10 grid grid-cols-2 gap-3 my-auto py-1">
              
              {/* Left Column: All 11 Academy Tracks */}
              <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold font-display text-gold-400 uppercase">
                  <Code2 size={13} /> 11 Academy Tracks
                </div>
                <div className="text-[10px] font-mono space-y-1 text-zinc-300">
                  <div className="truncate">• Full-Stack Web Dev</div>
                  <div className="truncate">• Mobile App Engineering</div>
                  <div className="truncate">• Cybersecurity & SOC</div>
                  <div className="truncate">• Cloud & DevOps (AWS)</div>
                  <div className="truncate">• AI & Automations</div>
                  <div className="truncate">• Data Analysis & BI</div>
                  <div className="truncate">• UI/UX Product Design</div>
                  <div className="truncate">• Graphic & Brand Design</div>
                  <div className="truncate">• Product Management</div>
                  <div className="truncate">• Digital Marketing Ads</div>
                  <div className="truncate text-gold-400">• PropTech & Real Estate</div>
                </div>
              </div>

              {/* Right Column: Whitelisting & IT Enterprise */}
              <div className="space-y-2">
                {/* Box 1: Talent Whitelisting */}
                <div className="bg-gold-500/10 border border-gold-500/40 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold font-display text-gold-400 uppercase">
                    <UserCheck size={13} /> Talent Whitelist
                  </div>
                  <p className="text-[10px] text-zinc-200 font-sans leading-tight">
                    Graduate from live labs onto our verified talent whitelist for corporate hiring, contracts, and internships.
                  </p>
                </div>

                {/* Box 2: Enterprise IT Solutions */}
                <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold font-display text-gold-400 uppercase">
                    <Server size={13} /> Enterprise IT Solutions
                  </div>
                  <p className="text-[10px] text-zinc-300 font-sans leading-tight">
                    Custom Web & Mobile Apps, Penetration Testing, Cloud Infrastructure, and Business AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="relative z-10 bg-zinc-900/90 border border-gold-500/40 rounded-xl p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[9px] font-mono text-zinc-400 uppercase">Admissions & Inquiries:</div>
                <div className="text-sm font-black font-mono text-gold-400 tracking-wider">
                  koglatech.com/academy
                </div>
              </div>

              <div className="text-right font-mono text-[10px] text-zinc-300">
                <div className="text-white font-bold">100% Practical Labs</div>
                <div className="text-emerald-400">Verified Certifications</div>
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
                <span className="text-gold-400 font-bold block uppercase text-[11px]">1. Academy & Whitelisting Pitch:</span>
                <p className="leading-relaxed">
                  "Kogla Tech offers 11 hands-on tech training tracks. You don't just learn theory; you work on live client simulations and get directly whitelisted into their talent network for internships and corporate hiring."
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
