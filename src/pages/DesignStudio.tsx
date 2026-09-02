import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Layers, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Palette, 
  Monitor, 
  Smartphone, 
  Square, 
  Code2, 
  Shield, 
  Cpu, 
  Flame, 
  CheckCircle2, 
  ArrowUpRight, 
  QrCode, 
  Share2, 
  Zap,
  Globe,
  Award,
  Terminal,
  Server,
  Database
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function DesignStudio() {
  const { config } = useSiteConfig();
  
  // Customization States
  const [creatorName, setCreatorName] = useState('Phena');
  const [creatorHandle, setCreatorHandle] = useState('@phena_designs');
  const [promoCode, setPromoCode] = useState('PHENA');
  const [discountPercent, setDiscountPercent] = useState('5');
  const [cohortName, setCohortName] = useState(config.cohortBatchName || 'COHORT CO-2026');
  const [cohortDate, setCohortDate] = useState('September 2026');
  
  // View & Option States
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | 'option3'>('option1');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '4:5'>('9:16');
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const creatorScript = `🔥 Ready to break into tech or scale your skills? 
Use my official partner code "${promoCode.toUpperCase()}" on Kogla Tech for ${discountPercent}% OFF your tech cohort enrollment! 

🎓 Tracks Available:
• Full-Stack Software Engineering
• Cybersecurity & Ethical Hacking
• AI Automations & Systems
• UI/UX Product Design

💼 Need Custom Software or IT Solutions for your business? Kogla Tech also builds enterprise-grade web, mobile & AI apps.

👉 Visit koglatech.com/academy (Link in bio)
🎟️ Promo Code: ${promoCode.toUpperCase()} (${discountPercent}% OFF)`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(creatorScript);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <div className={`min-h-screen ${isScreenshotMode ? 'bg-black p-4 flex items-center justify-center' : 'bg-black text-white pt-24 pb-20'}`}>
      
      {/* Top Header Controls (Hidden during clean screenshot mode) */}
      {!isScreenshotMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono rounded-full uppercase tracking-wider mb-2">
                <Sparkles size={14} /> Kogla Brand & Creative Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
                Creator Screen & Social Flyers
              </h1>
              <p className="text-zinc-400 text-sm mt-1 max-w-2xl font-sans">
                High-converting promotional graphics designed for creators to put on screen during video ads, reels, TikToks, and feed posts. Select an option, customize the creator details, and screenshot in full resolution.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyCaption}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-white font-mono text-xs uppercase font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedCaption ? 'Script Copied!' : 'Copy Creator Script'}
              </button>

              <button
                type="button"
                onClick={() => setIsScreenshotMode(true)}
                className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-black font-display text-xs uppercase font-bold tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-gold-500/10 transition-all cursor-pointer"
              >
                <Maximize2 size={15} /> Screenshot Mode (Clean View)
              </button>
            </div>
          </div>

          {/* Style Selector Tabs & Live Config Toolbar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Options Tabs */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { setSelectedOption('option1'); setAspectRatio('9:16'); }}
                className={`flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedOption === 'option1' 
                    ? 'bg-gold-500/10 border-gold-500/60 shadow-lg shadow-gold-500/5' 
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-gold-400 uppercase">Option 1</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded">9:16 Video Overlay</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display">Creator Video & Story Overlay</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">High-contrast vertical flyer with punchy headers & promo code badge.</p>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedOption('option2'); setAspectRatio('1:1'); }}
                className={`flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedOption === 'option2' 
                    ? 'bg-gold-500/10 border-gold-500/60 shadow-lg shadow-gold-500/5' 
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-gold-400 uppercase">Option 2</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded">1:1 Square Feed</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display">Dark Luxury Dual-Grid</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Obsidian aesthetic showcasing Academy Cohorts + IT Enterprise Services.</p>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedOption('option3'); setAspectRatio('4:5'); }}
                className={`flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedOption === 'option3' 
                    ? 'bg-gold-500/10 border-gold-500/60 shadow-lg shadow-gold-500/5' 
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-gold-400 uppercase">Option 3</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded">4:5 Social Poster</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display">Modern Tech Academy & IT Solutions</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Editorial breakdown of tracks, lab experience, and direct discount badge.</p>
              </button>
            </div>

            {/* Quick Field Customizer */}
            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-[11px] font-mono text-gold-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                <Palette size={12} /> Live Creator Customization:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block">Creator Name</label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block">Promo Code</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-gold-400 font-mono font-bold focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block">Discount %</label>
                  <input
                    type="text"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block">Handle</label>
                  <input
                    type="text"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-300 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Mode Floating Exit Pill */}
      {isScreenshotMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 px-3 py-1.5 rounded-full shadow-2xl">
          <span className="text-xs font-mono text-zinc-300">Clean Screenshot View</span>
          <button
            type="button"
            onClick={() => setIsScreenshotMode(false)}
            className="p-1 bg-gold-500 hover:bg-gold-400 text-black rounded-full transition-all cursor-pointer"
            title="Exit Screenshot Mode"
          >
            <Minimize2 size={14} />
          </button>
        </div>
      )}

      {/* FLYER CANVAS DISPLAY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center items-center">
        
        {/* ================= OPTION 1: 9:16 VERTICAL CREATOR SCREEN OVERLAY ================= */}
        {selectedOption === 'option1' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[420px] aspect-[9/16] bg-gradient-to-b from-zinc-950 via-[#070709] to-black border-2 border-gold-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            {/* Ambient Background Tech Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Top Bar: Brand & Official Partnership Badge */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-black font-black font-display text-base shadow-lg shadow-gold-500/30">
                    K
                  </div>
                  <div>
                    <div className="font-display font-black text-sm tracking-wider uppercase text-white">
                      KOGLA TECH
                    </div>
                    <div className="text-[9px] font-mono text-gold-400 tracking-widest uppercase">
                      ACADEMY & IT SOLUTIONS
                    </div>
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-gold-500/15 border border-gold-500/40 rounded-full flex items-center gap-1.5 text-[10px] font-mono text-gold-300 font-bold">
                  <Sparkles size={10} className="text-gold-400" />
                  <span>{creatorName.toUpperCase()} PARTNER</span>
                </div>
              </div>

              {/* Main Attention-Grabbing Headline */}
              <div className="pt-2">
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-mono uppercase tracking-widest rounded inline-block mb-1.5">
                  ✦ {cohortName} • ADMISSIONS OPEN
                </span>
                <h2 className="text-2xl sm:text-[26px] font-black font-display uppercase tracking-tight leading-[1.1] text-white">
                  LAUNCH YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500">TECH CAREER</span> WITH REAL PROJECTS
                </h2>
                <p className="text-xs text-zinc-300 mt-1.5 font-sans leading-snug">
                  100% hands-on cohorts, live industry mentors, enterprise simulations, and verified portfolio certifications.
                </p>
              </div>
            </div>

            {/* Core Offerings: Dual Breakdown (Academy Tracks & IT Solutions) */}
            <div className="relative z-10 space-y-2.5 my-auto py-2">
              {/* Box 1: Academy Cohort Tracks */}
              <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-display text-white uppercase">
                    <Terminal size={13} className="text-gold-400" /> Academy Cohorts
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400">Live Mentorship</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-200 bg-black/60 px-2 py-1.5 rounded-lg border border-zinc-850">
                    <Code2 size={11} className="text-gold-400 shrink-0" />
                    <span className="truncate">Full-Stack Dev</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 bg-black/60 px-2 py-1.5 rounded-lg border border-zinc-850">
                    <Shield size={11} className="text-gold-400 shrink-0" />
                    <span className="truncate">Cybersecurity</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 bg-black/60 px-2 py-1.5 rounded-lg border border-zinc-850">
                    <Cpu size={11} className="text-gold-400 shrink-0" />
                    <span className="truncate">AI & Automations</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200 bg-black/60 px-2 py-1.5 rounded-lg border border-zinc-850">
                    <Layers size={11} className="text-gold-400 shrink-0" />
                    <span className="truncate">UI/UX Design</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Enterprise IT Solutions */}
              <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-display text-white uppercase">
                    <Server size={12} className="text-gold-400" /> Enterprise IT Solutions
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">Client Services</span>
                </div>
                <p className="text-[10.5px] text-zinc-300 leading-tight">
                  Custom Web & Mobile Apps • AI Systems • Cyber Security Audits • Cloud Architecture.
                </p>
              </div>
            </div>

            {/* Creator Discount & Call-to-Action Footer */}
            <div className="relative z-10 space-y-2.5 pt-2 border-t border-zinc-850">
              {/* Prominent Golden Code Voucher */}
              <div className="bg-gradient-to-r from-gold-500/20 via-gold-500/30 to-amber-500/20 border-2 border-gold-500/60 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono text-gold-300 uppercase font-bold tracking-wider">
                    Exclusive Audience Promo
                  </div>
                  <div className="text-lg font-black font-mono text-white tracking-widest">
                    CODE: <span className="text-gold-400">{promoCode}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-2.5 py-1 bg-gold-500 text-black font-black font-display text-xs rounded-lg uppercase tracking-wider shadow-md">
                    {discountPercent}% OFF
                  </div>
                  <div className="text-[9px] font-mono text-zinc-300 mt-0.5">Instant Discount</div>
                </div>
              </div>

              {/* Web URL and Registration Info */}
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
                <span className="text-white font-bold flex items-center gap-1">
                  <Globe size={11} className="text-gold-400" /> koglatech.com
                </span>
                <span className="text-gold-400 font-semibold">{creatorHandle}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= OPTION 2: 1:1 SQUARE DARK LUXURY DUAL-GRID ================= */}
        {selectedOption === 'option2' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[500px] aspect-square bg-[#050505] border-2 border-gold-500/50 rounded-3xl p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            {/* Subtle Circuit Grid lines in background */}
            <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Logo & Title */}
            <div className="relative z-10 flex items-start justify-between border-b border-zinc-850 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gold-500 rounded-md flex items-center justify-center text-black font-black font-display text-sm">
                    K
                  </div>
                  <span className="font-display font-black text-lg tracking-wider uppercase text-white">
                    KOGLA TECH
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-1 uppercase">
                  PRACTICAL TECH ACADEMY & ENTERPRISE IT
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-gold-500/20 border border-gold-500/40 text-gold-400 text-[10px] font-mono font-bold rounded uppercase">
                  PARTNER: {creatorName.toUpperCase()}
                </span>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">{creatorHandle}</div>
              </div>
            </div>

            {/* Dual Grid: Academy Tracks vs Enterprise Solutions */}
            <div className="relative z-10 grid grid-cols-2 gap-3 my-auto py-2">
              {/* Left Column: Tech Academy */}
              <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold font-display text-gold-400 uppercase">
                  <Code2 size={13} /> Academy Programs
                </div>
                <ul className="text-[11px] font-mono space-y-1.5 text-zinc-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-400 shrink-0" /> Full-Stack Engineering
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-400 shrink-0" /> Cybersecurity & Audits
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-400 shrink-0" /> AI & Automation Labs
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-400 shrink-0" /> UI/UX Product Design
                  </li>
                </ul>
                <div className="pt-1 text-[9px] font-mono text-zinc-400 border-t border-zinc-900">
                  ⚡ 100% Project-Based & Portfolio Ready
                </div>
              </div>

              {/* Right Column: IT Solutions */}
              <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold font-display text-gold-400 uppercase">
                  <Server size={13} /> Enterprise IT Solutions
                </div>
                <ul className="text-[11px] font-mono space-y-1.5 text-zinc-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-gold-400 shrink-0" /> Custom Software & Apps
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-gold-400 shrink-0" /> Penetration Testing
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-gold-400 shrink-0" /> Cloud & DevOps Setup
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-gold-400 shrink-0" /> Business AI Workflows
                  </li>
                </ul>
                <div className="pt-1 text-[9px] font-mono text-zinc-400 border-t border-zinc-900">
                  🛡️ Production-Grade Scalability
                </div>
              </div>
            </div>

            {/* Bottom Promo & CTA Strip */}
            <div className="relative z-10 bg-zinc-900/90 border border-gold-500/40 rounded-xl p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[9px] font-mono text-zinc-400 uppercase">Use Promo Code At Checkout:</div>
                <div className="text-base font-black font-mono text-gold-400 tracking-wider">
                  {promoCode} <span className="text-xs text-white">({discountPercent}% OFF)</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">koglatech.com</div>
                <div className="text-[9px] font-mono text-emerald-400 font-semibold">{cohortName}</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= OPTION 3: 4:5 SOCIAL POSTER & ENTERPRISE SHOWCASE ================= */}
        {selectedOption === 'option3' && (
          <div 
            ref={flyerRef}
            className="w-full max-w-[460px] aspect-[4/5] bg-gradient-to-b from-[#09090b] via-[#050505] to-black border-2 border-gold-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white select-none"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand & Target Batch */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gold-500 text-black font-black font-display text-base rounded-lg flex items-center justify-center">
                    K
                  </div>
                  <div>
                    <span className="font-display font-black text-sm tracking-wider uppercase">KOGLA TECH</span>
                    <span className="text-[9px] font-mono text-gold-400 block tracking-widest">BUILD • SECURE • SCALE</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-750 text-gold-400 font-mono text-[10px] font-bold rounded-full">
                  ✦ {cohortName}
                </span>
              </div>

              <div className="pt-1">
                <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white leading-tight">
                  MASTER INDUSTRY TECH OR SCALE YOUR BUSINESS
                </h2>
                <p className="text-xs text-zinc-300 mt-1 font-sans">
                  Join our hands-on engineering academy or partner with our IT enterprise team for world-class digital solutions.
                </p>
              </div>
            </div>

            {/* Features Highlight Grid */}
            <div className="relative z-10 space-y-2 my-auto">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl">
                  <Award size={14} className="text-gold-400 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-white">Verified Certs</div>
                  <div className="text-[8px] text-zinc-400">Cryptographic Proof</div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl">
                  <Terminal size={14} className="text-gold-400 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-white">Live Labs</div>
                  <div className="text-[8px] text-zinc-400">100% Real Projects</div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl">
                  <Zap size={14} className="text-gold-400 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-white">Mentorship</div>
                  <div className="text-[8px] text-zinc-400">Industry Guidance</div>
                </div>
              </div>

              {/* Service & Training Summary Line */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono space-y-1">
                <div className="text-gold-400 font-bold uppercase text-[10px] flex items-center justify-between">
                  <span>Available Tracks & Solutions:</span>
                  <span className="text-zinc-400 text-[9px]">{cohortDate}</span>
                </div>
                <div className="text-zinc-300 leading-snug text-[10.5px]">
                  Web Dev • Cybersecurity • AI Automations • UI/UX Design • Custom Enterprise Systems
                </div>
              </div>
            </div>

            {/* Creator Voucher Footer */}
            <div className="relative z-10 pt-2 border-t border-zinc-850 space-y-2">
              <div className="bg-gold-500/15 border border-gold-500/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono text-zinc-400 uppercase">
                    Partner Discount ({creatorName}):
                  </div>
                  <div className="text-base font-black font-mono text-white tracking-widest">
                    CODE: <span className="text-gold-400">{promoCode}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-gold-500 text-black font-black font-display text-xs rounded uppercase tracking-wider">
                  {discountPercent}% OFF
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="text-white font-bold">🌐 koglatech.com/academy</span>
                <span className="text-gold-400">{creatorHandle}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Creator Pitch Guide & Quick Instructions (Hidden in Screenshot mode) */}
      {!isScreenshotMode && (
        <div className="max-w-4xl mx-auto px-4 mt-12 space-y-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold-400 font-display font-bold text-sm uppercase">
              <Sparkles size={15} /> Creator Media Kit & Talking Points
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-zinc-300">
              <div className="bg-black/60 p-3.5 rounded-xl border border-zinc-850 space-y-1.5">
                <span className="text-gold-400 font-bold block uppercase text-[11px]">1. Academy Pitch:</span>
                <p className="leading-relaxed">
                  "If you want to transition into tech with real hands-on projects, live labs, and mentor support, check out Kogla Tech's upcoming cohort. Use code <strong>{promoCode}</strong> for {discountPercent}% off."
                </p>
              </div>

              <div className="bg-black/60 p-3.5 rounded-xl border border-zinc-850 space-y-1.5">
                <span className="text-gold-400 font-bold block uppercase text-[11px]">2. Business IT Pitch:</span>
                <p className="leading-relaxed">
                  "Need a custom web app, mobile product, cybersecurity audit, or AI automation for your business? Kogla Tech's engineering team builds production-ready systems."
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex items-center justify-between flex-wrap gap-2">
              <span>💡 <strong>Tip for creators:</strong> Put this flyer on screen or pin it in your story / video overlay while discussing the tech cohort.</span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="text-gold-400 hover:text-gold-300 font-bold underline cursor-pointer"
              >
                Copy caption text
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
