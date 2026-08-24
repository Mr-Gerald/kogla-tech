import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Shield, 
  Cpu, 
  Brain, 
  Layers, 
  Globe, 
  ArrowRight, 
  BookOpen, 
  Terminal, 
  Award,
  CheckCircle2,
  Sparkles,
  Smartphone,
  BarChart3,
  Building2,
  Search,
  Check,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_COURSES, formatNaira, CourseTrack } from '../data/coursesPricing';
import { getActiveReferralCode, captureUrlReferral } from '../lib/referralTracker';

export default function Academy() {
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePromo, setActivePromo] = useState<string | null>(null);

  useEffect(() => {
    const urlRef = captureUrlReferral();
    const active = urlRef || getActiveReferralCode();
    if (active) {
      setActivePromo(active);
    }
  }, []);

  const categories = ['All', 'Engineering', 'Analytics', 'Security', 'Design', 'Management', 'Automation', 'Business & Tech'];

  const filteredCourses = ACADEMY_COURSES.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 px-4 sm:px-6 pb-24 max-w-7xl mx-auto font-sans text-gray-100">
      
      {/* PAGE HEADER */}
      <div className="border-b border-zinc-850 pb-10 mb-12 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] rounded-full uppercase tracking-widest font-mono">
          <Award size={12} /> Kogla Tech Academic Registry
        </div>
        <h1 className="text-3xl sm:text-6xl md:text-7xl font-display font-black bg-gradient-to-r from-white via-gold-400 to-white bg-clip-text text-transparent uppercase tracking-tight">
          Kogla <span className="text-gold-500">Academy</span>
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider font-mono max-w-3xl mx-auto leading-relaxed">
          11 INDUSTRY-ACCREDITED ENGINEERING & LEADERSHIP SPECIALIZATIONS WITH LIVE ONLINE COHORTS & PHYSICAL HUBS.
        </p>

        {/* ACTIVE PROMO BADGE IF DETECTED */}
        {activePromo && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold-500/20 border border-gold-500/50 rounded-full text-gold-300 text-xs font-mono">
            <Tag size={13} className="text-gold-400" />
            <span>Referral Promo Active: <b className="text-white font-bold">{activePromo}</b> (5% Discount Applied at Checkout)</span>
          </div>
        )}
      </div>

      {/* GAMIFIED DASHBOARD OR CERTIFICATE VERIFY BANNER */}
      <div className="grid md:grid-cols-12 gap-6 mb-12">
        {profile ? (
          <div className="md:col-span-8 p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-gold-500/30 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle2 className="text-gold-400" size={16} /> Academic Profile Synchronized
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Student: <b className="text-white">{profile.name}</b> • <span className="text-gold-400 font-bold">{profile.xp || 0} XP</span> • {(profile.completedRooms || []).length} modules completed.
              </p>
            </div>
            <Link 
              to="/study"
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-widest font-display rounded-sm shrink-0 flex items-center gap-2 transition-all shadow-md"
            >
              Study Workspace <Terminal size={13} />
            </Link>
          </div>
        ) : (
          <div className="md:col-span-8 p-6 bg-zinc-950 border border-zinc-850 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-display font-bold uppercase text-white flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="text-gold-400" size={15} /> 2026 Admissions Open
              </h3>
              <p className="text-xs text-zinc-400">
                Choose between intensive live online evening classes or physical immersive hubs with dual certification.
              </p>
            </div>
            <Link 
              to="/auth/signup"
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display rounded-sm shrink-0 shadow"
            >
              Create Account
            </Link>
          </div>
        )}

        {/* VERIFY CERTIFICATE BUTTON CARD */}
        <div className="md:col-span-4 p-6 bg-zinc-950 border border-zinc-850 rounded-lg flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-gold-400 font-bold flex items-center gap-1">
              <ShieldCheck size={12} /> Credential Verification
            </span>
            <h4 className="text-xs font-display font-bold text-white uppercase mt-1">
              Authenticate Official Certificates
            </h4>
          </div>
          <Link
            to="/verify-certificate"
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-xs font-mono uppercase rounded text-center block transition-all"
          >
            Verify Credential &rarr;
          </Link>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-850">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all ${
                selectedCategory === cat 
                  ? 'bg-gold-500 text-black font-bold shadow' 
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, tools, skills..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-mono"
          />
        </div>
      </div>

      {/* 11 TRACKS GRID WITH DUAL PRICING */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.slug}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-950 border border-zinc-850 hover:border-gold-500/50 rounded-lg p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
            {course.featured && (
              <div className="absolute top-0 right-0">
                <span className="px-3 py-1 bg-gold-500 text-black font-mono font-bold text-[9px] uppercase tracking-wider rounded-bl">
                  POPULAR TRACK
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider block mb-1">
                  {course.category} • {course.duration}
                </span>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight">
                  {course.title}
                </h3>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-3">
                {course.description}
              </p>

              {/* DUAL PRICING DISPLAY (ONLINE VS PHYSICAL) */}
              <div className="p-3.5 bg-black/60 border border-zinc-800/80 rounded space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Globe size={13} className="text-blue-400" /> Online Class:
                  </span>
                  {activePromo ? (
                    <div className="text-right">
                      <span className="line-through text-zinc-500 text-[10px] mr-1.5">{formatNaira(course.onlinePrice)}</span>
                      <span className="font-bold text-emerald-400">{formatNaira(Math.round(course.onlinePrice * 0.95))}</span>
                    </div>
                  ) : (
                    <span className="font-bold text-white">{formatNaira(course.onlinePrice)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-zinc-900 pt-1.5">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Building2 size={13} className="text-gold-400" /> Physical Hub:
                  </span>
                  {activePromo ? (
                    <div className="text-right">
                      <span className="line-through text-zinc-500 text-[10px] mr-1.5">{formatNaira(course.physicalPrice)}</span>
                      <span className="font-bold text-gold-400">{formatNaira(Math.round(course.physicalPrice * 0.95))}</span>
                    </div>
                  ) : (
                    <span className="font-bold text-gold-400">{formatNaira(course.physicalPrice)}</span>
                  )}
                </div>

                {activePromo && (
                  <div className="pt-1 border-t border-zinc-900 flex items-center justify-between text-[10px] text-emerald-400">
                    <span className="flex items-center gap-1"><Tag size={10} /> 5% promo applied</span>
                    <span className="font-bold uppercase tracking-wider">{activePromo}</span>
                  </div>
                )}
              </div>

              {/* TOOLS PILLS */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {course.tools.slice(0, 4).map(tool => (
                  <span key={tool} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded text-[10px] font-mono">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-6 mt-4 border-t border-zinc-850 flex items-center gap-2.5">
              <Link
                to={`/academy/${course.slug}`}
                className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded text-center transition-all shadow"
              >
                Enroll Now &rarr;
              </Link>
              <Link
                to={`/academy/${course.slug}`}
                className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs font-mono uppercase rounded transition-all"
                title="View Full Syllabus"
              >
                Syllabus
              </Link>
            </div>

          </motion.div>
        ))}
      </div>

    </div>
  );
}
