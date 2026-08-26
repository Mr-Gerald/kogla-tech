import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Award, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Calculator, 
  Compass, 
  Laptop, 
  Globe, 
  ShieldAlert, 
  Briefcase, 
  Layers, 
  Clock, 
  ChevronRight,
  ExternalLink,
  BookOpen,
  Filter,
  Check
} from 'lucide-react';
import { MONETIZATION_GUIDES, TECH_CAREER_ROADMAPS, MonetizationGuide } from '../data/monetizationData';
import { formatNaira } from '../data/coursesPricing';

export default function MonetizationHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeGuide, setActiveGuide] = useState<MonetizationGuide>(MONETIZATION_GUIDES[0]);
  const guideDetailRef = React.useRef<HTMLDivElement>(null);
  
  // Interactive Calculator State
  const [calcUnits, setCalcUnits] = useState<number>(activeGuide.calculator?.defaultUnits || 5);

  const handleSelectGuide = (guide: MonetizationGuide) => {
    setActiveGuide(guide);
    if (guide.calculator) {
      setCalcUnits(guide.calculator.defaultUnits);
    }
    setTimeout(() => {
      if (guideDetailRef.current) {
        guideDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const categories = [
    { id: 'all', label: 'All Revenue Streams' },
    { id: 'referrals', label: '🚀 Kogla Referrals (Fastest)' },
    { id: 'freelancing', label: 'Global Freelancing' },
    { id: 'agency', label: 'AI Agencies & Services' },
    { id: 'cyber_bounties', label: 'Bug Bounties ($500-$25k)' },
    { id: 'career', label: 'Remote Global Jobs' },
    { id: 'saas_products', label: 'Micro-SaaS Software' },
    { id: 'content_creator', label: 'Creator & Sponsorships' },
  ];

  const filteredGuides = selectedCategory === 'all' 
    ? MONETIZATION_GUIDES 
    : MONETIZATION_GUIDES.filter(g => g.category === selectedCategory);

  const calculatedRevenue = activeGuide.calculator 
    ? calcUnits * activeGuide.calculator.unitPrice 
    : 0;

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-gray-100 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-zinc-900 gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] rounded-full uppercase tracking-widest font-mono font-bold">
            <Sparkles size={11} /> TECH MONETIZATION & WEALTH ACCELERATOR
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-white tracking-tight">
            How to Make Money <span className="text-gold-500">From Tech</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl font-sans">
            Comprehensive financial blueprint to monetize software engineering, cybersecurity, AI automation, global freelancing, and the Kogla Referral & Ambassador Program.
          </p>
        </div>

        {/* FAST REFERRAL ACCELERATOR BUTTON */}
        <Link
          to="/affiliate-portal"
          className="px-5 py-3 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all shadow-lg shadow-gold-500/10 shrink-0 self-start md:self-end"
        >
          <Zap size={14} className="fill-current" />
          Start Earning via Referrals Today
        </Link>
      </div>

      {/* QUICK STATS / OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <TrendingUp size={12} className="text-gold-400" /> Fastest Cashflow
          </span>
          <div className="text-xl sm:text-2xl font-bold font-display text-white">Kogla Referrals</div>
          <span className="text-[10px] text-gold-400 font-mono">6% – 10% Per Enrollment (Instant)</span>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Globe size={12} className="text-emerald-400" /> Global Freelancing
          </span>
          <div className="text-xl sm:text-2xl font-bold font-display text-emerald-400">$1,500 – $8,000</div>
          <span className="text-[10px] text-zinc-400 font-mono">Per custom client project</span>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <ShieldCheck size={12} className="text-blue-400" /> Bug Bounty Bounties
          </span>
          <div className="text-xl sm:text-2xl font-bold font-display text-blue-400">$500 – $25,000+</div>
          <span className="text-[10px] text-zinc-400 font-mono">Per critical vulnerability report</span>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
            <Briefcase size={12} className="text-purple-400" /> Remote Silicon Valley/EU
          </span>
          <div className="text-xl sm:text-2xl font-bold font-display text-purple-400">$40k – $120k / Yr</div>
          <span className="text-[10px] text-zinc-400 font-mono">₦60M – ₦180M+ full-time salary</span>
        </div>
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-sm text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gold-500 text-black font-bold shadow-md shadow-gold-500/10'
                : 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid lg:grid-cols-12 gap-8 mb-16">
        
        {/* LEFT COLUMN: GUIDES SELECTION LIST */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block mb-2">
            PROVEN MONETIZATION PLAYBOOKS ({filteredGuides.length})
          </span>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredGuides.map((guide) => {
              const isSelected = activeGuide.id === guide.id;
              return (
                <div
                  key={guide.id}
                  onClick={() => handleSelectGuide(guide)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer text-left space-y-2 ${
                    isSelected
                      ? 'bg-zinc-900 border-gold-500/80 shadow-lg shadow-gold-500/5'
                      : 'bg-zinc-950/80 hover:bg-zinc-900/60 border-zinc-850 hover:border-zinc-750'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-display font-bold uppercase ${isSelected ? 'text-gold-400' : 'text-white'}`}>
                      {guide.title}
                    </h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-black/60 border border-zinc-800 text-gold-400/90 rounded shrink-0">
                      {guide.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">{guide.earningPotential}</span>
                    <span className="text-zinc-500 text-[10px]">Speed: {guide.timeToFirstIncome}</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans">
                    {guide.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE GUIDE DETAIL VIEW & INTERACTIVE SIMULATOR */}
        <div ref={guideDetailRef} className="lg:col-span-7 bg-zinc-950 border border-zinc-850 rounded-lg p-6 sm:p-8 shadow-xl space-y-6 scroll-mt-24">
          <div className="space-y-3 border-b border-zinc-850 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-[10px] font-bold rounded uppercase">
                {activeGuide.category.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Est. Time to First Payout: <b className="text-white">{activeGuide.timeToFirstIncome}</b>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white">
              {activeGuide.title}
            </h2>

            <div className="p-3 bg-black/70 border border-gold-500/30 rounded-lg flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase">Earning Ceiling:</span>
              <span className="text-base sm:text-lg font-mono font-bold text-gold-400">{activeGuide.earningPotential}</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {activeGuide.description}
            </p>
          </div>

          {/* INTERACTIVE EARNING SIMULATOR */}
          {activeGuide.calculator && (
            <div className="p-5 bg-gradient-to-br from-black via-zinc-900 to-black border border-gold-500/40 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-1.5">
                  <Calculator size={13} /> LIVE EARNING SIMULATOR
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Unit Value: <b>{formatNaira(activeGuide.calculator.unitPrice)}</b>
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300">{activeGuide.calculator.metricLabel}:</span>
                  <span className="text-gold-400 font-bold">{calcUnits}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Estimated Payout</span>
                  <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">
                    {formatNaira(calculatedRevenue)}
                  </div>
                </div>
                {activeGuide.koglaTrackLink && (
                  <Link
                    to={activeGuide.koglaTrackLink}
                    className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-1.5 transition-all shadow"
                  >
                    Start Now <ArrowRight size={13} />
                  </Link>
                )}
              </div>

              <p className="text-[10px] text-zinc-500 font-mono leading-normal">
                💡 {activeGuide.calculator.explanation}
              </p>
            </div>
          )}

          {/* STEP-BY-STEP ACTIONABLE EXECUTION */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gold-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Step-by-Step Action Plan
            </h4>
            <div className="space-y-2.5">
              {activeGuide.steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-black/50 border border-zinc-850 rounded flex items-start gap-3 text-xs text-zinc-300 leading-relaxed font-sans">
                  <span className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOOLS & PRO-TIPS */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-black/60 border border-zinc-850 rounded space-y-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold block">
                🛠️ Recommended Tools & Platforms
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeGuide.toolsAndPlatforms.map((tool, i) => (
                  <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono rounded">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-black/60 border border-zinc-850 rounded space-y-2">
              <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider font-bold block">
                🎯 Insider Pro-Tips
              </span>
              <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside font-sans">
                {activeGuide.proTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* RECOMMENDED KOGLA TRACK LINK */}
          {activeGuide.recommendedKoglaTrack && activeGuide.koglaTrackLink && (
            <div className="p-4 bg-gold-500/5 border border-gold-500/20 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-gold-400 uppercase block font-bold">Recommended Training & Accelerator</span>
                <span className="text-xs font-display font-bold text-white uppercase">{activeGuide.recommendedKoglaTrack}</span>
              </div>
              <Link
                to={activeGuide.koglaTrackLink}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display rounded-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all"
              >
                Enroll / Access Hub <ChevronRight size={13} />
              </Link>
            </div>
          )}

        </div>

      </div>

      {/* ROADMAP SECTION: 6-MONTH CAREER & MONETIZATION TIMELINES */}
      <div className="space-y-6 mb-16">
        <div className="border-b border-zinc-900 pb-4">
          <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block">
            STRUCTURED MILESTONES
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase">
            6-Month High-Income Tech Roadmaps
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Proven execution timelines from complete beginner to landing international client retainers, bug bounties, or remote USD salaries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TECH_CAREER_ROADMAPS.map((roadmap, idx) => (
            <div key={idx} className="p-6 bg-zinc-950 border border-zinc-850 rounded-lg space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded uppercase font-bold">
                  {roadmap.timeline}
                </span>
                <h3 className="text-lg font-display font-bold text-white uppercase">
                  {roadmap.title}
                </h3>
              </div>

              <div className="space-y-4">
                {roadmap.phases.map((phase, pIdx) => (
                  <div key={pIdx} className="p-4 bg-black/60 border border-zinc-850 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-gold-400 uppercase">{phase.month}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{phase.focus}</span>
                    </div>
                    <ul className="space-y-1 text-xs text-zinc-300 font-sans">
                      {phase.milestones.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-2">
                          <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REFERRAL SYSTEM ACCELERATION SPOTLIGHT */}
      <div className="p-8 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border-2 border-gold-500/40 rounded-lg shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-1.5">
            <Zap size={13} className="fill-current" /> ZERO CODING REQUIRED TO START
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-black uppercase text-white">
            Monetize Immediately with the Kogla Ambassador Engine
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
            Generate your personalized promo code and tracking link in seconds. Give your network a 5% discount, and pocket 6% to 10% commission on every enrolled cohort student.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Link
            to="/affiliate-portal"
            className="px-6 py-3.5 bg-gold-500 hover:bg-gold-600 text-black font-display font-bold text-xs uppercase tracking-wider rounded-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-gold-500/10"
          >
            <Zap size={14} className="fill-current" /> Open Ambassador Dashboard
          </Link>
          <Link
            to="/academy"
            className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono text-xs uppercase tracking-wider rounded-sm text-center flex items-center justify-center gap-2"
          >
            Explore Academy Courses
          </Link>
        </div>
      </div>

    </div>
  );
}
