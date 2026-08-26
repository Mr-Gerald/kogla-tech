import { motion } from 'motion/react';
import { ArrowRight, Cpu, Shield, Zap, BookOpen, BarChart3, Globe, ChevronRight, Mail, Users, Building, Code, Smartphone, Layers, Cloud, Briefcase, Award, MessageSquare, Terminal, Eye, Star, MessageCircle, Send, Calendar, Clock, Sparkles, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getImageConfig, ImageConfig, addInquiry, DEFAULT_IMAGES } from '../utils/storage';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ReviewSection } from '../components/ReviewSection';

const stats = [
    { label: 'Global Students', value: '150+' },
    { label: 'Projects Completed', value: '1,000+' },
    { label: 'Tutors', value: '13' },
    { label: 'Global Divisions', value: '4' },
];

const ecosystem = ['Academy', 'Solutions', 'AI', 'Cybersecurity', 'Labs', 'Digital', 'Innovations', 'Incubator'];
const courses = ['Web Development', 'Cybersecurity', 'AI & Automation', 'UI/UX Design', 'Data Analysis', 'Product Mgmt', 'Digital Marketing', 'Cloud Architecture', 'Mobile Apps'];
const services = [
  'Web Development',
  'AI Automation',
  'Cybersecurity',
  'Digital Marketing',
  'UI/UX Design',
  'Video Editing & Motion Graphics',
  'Data Analysis',
  'Social Media Management',
  'Graphic Designs',
  'Business Technology Solutions'
];

export default function Home() {
  const { config, images } = useSiteConfig();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Dynamic Cohort Countdown
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (config.cohortStartDate) {
      const target = new Date(config.cohortStartDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setDaysRemaining(Math.ceil(diff / (1000 * 60 * 60 * 24)));
      } else {
        setDaysRemaining(0);
      }
    }
  }, [config.cohortStartDate]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;

    addInquiry({
      type: 'contact',
      title: 'GENERAL CONTACT REQUEST',
      senderName: contactName,
      senderEmail: contactEmail,
      description: contactMessage || 'Requested consultation standard follow-up.'
    });

    setSubmissionSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setSubmissionSuccess(false), 5000);
  };

  return (
    <div className="text-gray-100">
      <section id="home" className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 px-6 md:px-16 overflow-hidden">
        
        {/* Dynamic Live Banner Background with Deep Contrast */}
        <div className="absolute inset-0 z-0">
          <img 
            src={images.hero} 
            alt="Programming workspace" 
            onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.hero; }}
            className="w-full h-full object-cover scale-105 animate-pulse duration-[15000ms]" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/75"></div>
        </div>

        {/* TOP HEADER STATUS BAR */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }} 
          className="relative z-10 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950/80 border border-gold-500/30 text-gold-500 rounded-sm text-[10px] tracking-widest font-display uppercase font-semibold shadow-xl">
            <span className="h-2 w-2 rounded-full bg-gold-400 animate-ping"></span>
            {config.cohortBatchName || 'COHORT CO-2026'}: {config.cohortStatus || 'ADMISSIONS OPEN NOW'}
            {config.showCountdownTimer && daysRemaining !== null && daysRemaining > 0 && (
              <span className="ml-1 pl-2 border-l border-gold-500/30 text-zinc-300 font-mono">
                [T-MINUS {daysRemaining} DAYS]
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5"><Terminal size={12} className="text-gold-500" /> GLOBAL TECHNOLOGY PARTNER</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span>24/7 SUPPORT READY</span>
          </div>
        </motion.div>

        {/* MAIN ASYMMETRIC EDITORIAL HERO CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto w-full my-auto grid lg:grid-cols-12 gap-12 items-center py-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.9 }} 
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block">
                WELCOME TO KOGLA TECH
              </span>
              <motion.h1 
                animate={{ 
                  backgroundPosition: ["0% 50%", "200% 50%"],
                  filter: ["drop-shadow(0 0 2px rgba(234,179,8,0.3))", "drop-shadow(0 0 16px rgba(253,224,71,0.85))", "drop-shadow(0 0 2px rgba(234,179,8,0.3))"]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                  backgroundImage: "linear-gradient(90deg, #fde047 0%, #ffffff 35%, #ca8a04 70%, #fde047 100%)",
                  backgroundSize: "250% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
                className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase leading-[1.05]"
              >
                {config.heroHeadline}
              </motion.h1>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-2xl font-sans leading-relaxed border-l-2 border-gold-500 pl-4 bg-gradient-to-r from-gold-500/5 to-transparent py-2">
              {config.heroSubheadline}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#academy" className="px-6 py-3 bg-gold-500 hover:bg-gold-600 transition-all text-black font-bold rounded-sm flex items-center gap-2 text-xs uppercase tracking-wider font-display shadow-lg shadow-gold-500/10">
                Explore Academy <ArrowRight size={14} />
              </a>
              <a href="#services" className="px-6 py-3 bg-zinc-950/80 border border-zinc-800 hover:border-gold-500 text-zinc-200 hover:text-white transition-all rounded-sm text-xs uppercase tracking-wider font-display flex items-center gap-2">
                Explore Services
              </a>
              <a href="#contact" className="px-6 py-3 border border-gold-500/40 hover:bg-gold-500/10 text-gold-400 hover:text-white transition-all rounded-sm text-xs uppercase tracking-wider font-display flex items-center gap-2">
                <MessageCircle size={14} /> Contact Us
              </a>
            </div>
          </motion.div>

          {/* RIGHT SIDE: EDITORIAL HERO IMAGE CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.9, delay: 0.2 }} 
            className="lg:col-span-5 block"
          >
            <div className="relative rounded-lg overflow-hidden border border-gold-500/30 shadow-2xl group bg-zinc-950">
              <div className="absolute inset-0 bg-gold-500/10 mix-blend-overlay pointer-events-none z-10"></div>
              <img 
                src={images.hero} 
                alt="Kogla Tech Professional Workspace" 
                onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.hero; }}
                className="w-full h-[360px] md:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-110"
              />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block font-bold">PROFESSIONAL EXCELLENCE</span>
                  <span className="text-xs text-white font-mono">KOGLA TECH // GLOBAL LEADERSHIP</span>
                </div>
                <span className="px-2.5 py-1 bg-gold-500 text-black font-mono font-bold text-[10px] rounded-sm uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
          </motion.div>

        </div>
        
        {/* FOOTER OF THE HERO BOX: Animated Marquee CTA + Strategic Partner Showcase */}
        <div className="w-full relative z-10 space-y-6 max-w-7xl mx-auto">
          {/* Animated Marquee CTA */}
          <div className="w-full overflow-hidden whitespace-nowrap bg-black/80 py-3 border-y border-zinc-850 rounded">
              <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 25, ease: 'linear' }} className="inline-block text-gold-500 text-xs font-display tracking-widest uppercase">
                  Register Now for Our Next Cohort • Expert-Led Tech Training • Advanced AI Masterclasses • Global Internship Programs • Apply Today • Build Your Future • Register Now for Our Next Cohort • Expert-Led Tech Training • Advanced AI Masterclasses • Global Internship Programs • Apply Today • Build Your Future
              </motion.div>
          </div>

          {/* BEAUTIFUL WORKSPACE PARTNER SEGMENT */}
          <div className="flex flex-wrap justify-between items-center gap-4 text-xs text-zinc-400 font-mono pt-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-display font-bold">COLLABORATORS & INDUSTRY VECTORS:</span>
            <div className="flex flex-wrap items-center gap-6 opacity-75">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <Terminal size={12} className="text-gold-500" /> [AI_FOUNDRY]
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <Shield size={12} className="text-gold-500" /> [ZERO_TRUST_LABS]
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <Cpu size={12} className="text-gold-500" /> [QUANTUM_GRID]
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                <Layers size={12} className="text-gold-500" /> [NEXT_GEN_INCUBATOR]
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* GLOBAL STUDENTS & COHORT ADMISSIONS GRID */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        className="px-6 max-w-7xl mx-auto my-10"
      >
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Global Students & Key Metrics (Constrained to left side on web) */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-850 rounded-lg p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-gold-500 uppercase flex items-center gap-1.5 bg-gold-500/10 border border-gold-500/20 px-2.5 py-1 rounded">
                  <Users size={13} /> Global Students & Impact Metrics
                </span>
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Network
                </span>
              </div>

              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">
                  Global Academic Reach & Execution
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-1">
                  Empowering developers, career switchers, and enterprise engineers with hands-on systems training and production delivery.
                </p>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {stats.map(s => (
                  <div key={s.label} className="bg-zinc-900/80 border border-zinc-800 rounded p-3 text-center hover:border-gold-500/40 transition-colors">
                    <div className="text-xl sm:text-2xl font-display font-bold text-gold-400">{s.value}</div>
                    <div className="text-[9px] text-zinc-400 uppercase tracking-wider font-mono mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Globe size={13} className="text-gold-500" /> Distributed Cohorts: Nigeria, USA, UK, Canada & Estonia
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Cohort Admissions & Verification Hub */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border border-gold-500/30 rounded-lg p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-gold-500 uppercase flex items-center gap-1.5 bg-gold-500/10 border border-gold-500/20 px-2.5 py-1 rounded w-fit">
                <Award size={13} /> {config.cohortBatchName || 'COHORT CO-2026'} • {config.cohortStatus || 'Admissions Open'}
              </span>

              <div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                  {config.cohortBatchName || 'CO-2026'}: Launching {config.cohortStartDate ? new Date(config.cohortStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 24, 2026'}
                </h3>
                <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                  {config.cohortAnnouncementBanner || 'Join expert-led cohorts in full-stack engineering, cybersecurity, video motion graphics, and data analytics with verified credentials.'}
                </p>
              </div>

              <div className="bg-zinc-950/80 border border-zinc-800 rounded p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gold-400" /> Kickoff Date:</span>
                  <span className="font-bold text-gold-400">{config.cohortStartDate ? new Date(config.cohortStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'September 24, 2026'}</span>
                </div>
                {config.cohortPrepPhaseEnabled && (
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-emerald-400" /> Prep Phase / Sandboxes:</span>
                    <span className="font-bold text-emerald-400">Immediate Access</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5"><Terminal size={13} className="text-gold-400" /> Interactive Sandboxes:</span>
                  <span className="font-bold text-emerald-400">100% Practical</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2.5 mt-2">
              <Link 
                to="/academy" 
                className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display rounded text-center flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                Explore Syllabuses <ArrowRight size={13} />
              </Link>
              <Link 
                to="/study" 
                className="py-2.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-gold-500 text-zinc-200 text-xs uppercase font-mono tracking-wider rounded text-center flex items-center justify-center gap-1.5 transition-all"
              >
                <Terminal size={13} className="text-gold-500" /> Sandbox
              </Link>
            </div>
          </div>

        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        id="about" 
        className="py-20 px-6 bg-black text-center border-b border-gray-900"
      >
          <h2 className="text-2xl md:text-3xl font-display font-black mb-6 uppercase tracking-wider text-white">{config.aboutHeadline}</h2>
          <p className="text-xs md:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed font-sans">{config.aboutText}</p>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        id="academy" 
        className="py-24 px-6 md:px-12 bg-zinc-950 border-t border-zinc-900"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Image with exquisite design */}
          <div className="lg:col-span-5 relative group min-h-[320px] lg:min-h-[440px] rounded-lg overflow-hidden border border-zinc-850 hover:border-gold-500/50 transition-all duration-500 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src={images.academy} 
              alt="Kogla Academy Learning Environment" 
              onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.academy; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <span className="px-2.5 py-1 bg-gold-500 text-black font-mono font-bold text-[9px] rounded-sm uppercase tracking-wider">
                KOGLA ACADEMY
              </span>
            </div>
          </div>

          {/* Right Column: Write-up & Learning Paths */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block">
                IMMERSIVE ACADEMIC TRAINING
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                Academy & Learning Paths
              </h2>
            </div>
            
            <p className="text-xs md:text-sm text-zinc-400 font-sans leading-relaxed border-l-2 border-gold-500/50 pl-4 py-1">
              Gain hands-on skills through interactive practice labs, live study rooms, real-time code sandboxes, and XP progression rewards. Master industry-aligned curriculums designed to launch you into elite engineering careers.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {courses.map(title => (
                <Link 
                  key={title} 
                  to={`/academy/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} 
                  className="p-3.5 border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:border-gold-500/50 transition-all flex items-center gap-2.5 group rounded-sm"
                >
                  <BookOpen className="text-gold-500 group-hover:scale-110 transition-transform shrink-0" size={16} />
                  <span className="text-xs font-bold font-display text-zinc-200 group-hover:text-white transition-colors tracking-wide">{title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        id="services" 
        className="py-24 px-6 md:px-12 bg-black border-t border-zinc-900"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Write-up & Ecosystem Paths */}
          <div className="lg:col-span-7 lg:order-1 order-2 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block">
                ENTERPRISE-GRADE CAPABILITIES
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                Premium Solution Ecosystem
              </h2>
            </div>
            
            <p className="text-xs md:text-sm text-zinc-400 font-sans leading-relaxed border-l-2 border-gold-500/50 pl-4 py-1">
              We design and engineer bespoke software systems, high-speed automated pipelines, zero-trust cybersecurity defenses, and elite digital assets optimized for heavy transaction volumes and global scale.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {services.map(title => (
                <Link 
                  key={title} 
                  to={`/services/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} 
                  className="p-3.5 border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/60 hover:border-gold-500/50 transition-all flex items-center gap-2.5 group rounded-sm"
                >
                  <Zap className="text-gold-500 group-hover:scale-110 transition-transform shrink-0" size={16} />
                  <span className="text-xs font-bold font-display text-zinc-200 group-hover:text-white transition-colors tracking-wide">{title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Image with exquisite design */}
          <div className="lg:col-span-5 lg:order-2 order-1 relative group min-h-[320px] lg:min-h-[440px] rounded-lg overflow-hidden border border-zinc-850 hover:border-gold-500/50 transition-all duration-500 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src={images.services} 
              alt="Kogla Services Platform Display" 
              onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.services; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <span className="px-2.5 py-1 bg-gold-500 text-black font-mono font-bold text-[9px] rounded-sm uppercase tracking-wider">
                KOGLA SERVICES
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        id="projects" 
        className="py-24 px-6 md:px-12 bg-zinc-950 border-t border-zinc-900"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Image with exquisite design */}
          <div className="lg:col-span-5 relative group min-h-[320px] lg:min-h-[440px] rounded-lg overflow-hidden border border-zinc-850 hover:border-gold-500/50 transition-all duration-500 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src={images.projects} 
              alt="Projects Portfolio Showcase" 
              onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.projects; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <span className="px-2.5 py-1 bg-gold-500 text-black font-mono font-bold text-[9px] rounded-sm uppercase tracking-wider">
                PORTFOLIO VECTORS
              </span>
            </div>
          </div>

          {/* Right Column: Write-up & Case Studies */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block">
                ENGINEERING TRIUMPHS
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                Featured Case Studies
              </h2>
            </div>
            
            <p className="text-xs md:text-sm text-zinc-400 font-sans leading-relaxed border-l-2 border-gold-500/50 pl-4 py-1">
              Explore concrete examples of our production deployments, highly integrated fintech engines, stateful real-time tools, and high-performance applications that deliver uninterrupted value globally.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                ['AI Infrastructure', 'Enterprise AI/ML'], 
                ['Cyber Immunity', 'Zero-Trust Defense'], 
                ['Digital Transformation', 'Retail Enterprise'], 
                ['Web Ecosystem', 'Global SaaS']
              ].map(([title, desc]) => (
                <Link 
                  key={title} 
                  to={`/projects/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} 
                  className="p-5 border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-gold-500/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] transition-all flex flex-col justify-between group cursor-pointer h-32 rounded-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-display font-bold text-white group-hover:text-gold-500 transition-colors uppercase tracking-wide">{title}</h3>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1 font-mono">{desc}</p>
                    </div>
                    <div className="text-zinc-600 group-hover:text-gold-500 group-hover:translate-x-1 transition-all font-mono">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-gold-500/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    VIEW CASE STUDY &bull; SECURE
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 md:px-12 bg-black border-t border-zinc-900"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Write-up & Innovation labs paths */}
          <div className="lg:col-span-7 lg:order-1 order-2 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block">
                EXPERIMENTAL FRONTIERS
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                Innovation Labs & AI Research
              </h2>
            </div>
            
            <p className="text-xs md:text-sm text-zinc-400 font-sans leading-relaxed border-l-2 border-gold-500/50 pl-4 py-1">
              Our advanced labs push the boundaries of computational efficiency, training custom LLM models, and testing stateful autonomous agent pipelines in highly secure cloud sandboxes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {['LLM Optimization', 'Cyber Security Labs', 'Automation OS'].map(title => (
                <Link 
                  key={title} 
                  to={`/labs/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} 
                  className="p-5 border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/60 hover:border-gold-500/50 transition-all text-center flex flex-col justify-between group cursor-pointer rounded-sm min-h-[140px]"
                >
                  <Cpu size={24} className="text-gold-500 mx-auto group-hover:scale-110 transition-transform"/>
                  <div>
                    <h3 className="text-xs font-bold font-display text-zinc-200 group-hover:text-gold-500 transition-colors uppercase tracking-wider">{title}</h3>
                    <p className="text-[8px] text-zinc-500 font-mono tracking-widest mt-1">RESEARCH LEVEL-4</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Image with exquisite design */}
          <div className="lg:col-span-5 lg:order-2 order-1 relative group min-h-[320px] lg:min-h-[440px] rounded-lg overflow-hidden border border-zinc-850 hover:border-gold-500/50 transition-all duration-500 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src={images.labs} 
              alt="AI Research labs Hardware" 
              onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.labs; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <span className="px-2.5 py-1 bg-gold-500 text-black font-mono font-bold text-[9px] rounded-sm uppercase tracking-wider">
                INNOVATION LABS
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        id="partnerships" 
        className="py-24 px-6 bg-gradient-to-b from-gray-950 to-black border-t border-gray-900 relative"
      >
        <div className="absolute top-0 right-10 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] text-gold-500 font-mono font-bold tracking-widest uppercase block bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full w-fit mx-auto">
              Corporate Partnerships & Integrations
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-medium text-white uppercase tracking-wider">
              Accelerate Your Enterprise Vector
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-sans leading-relaxed">
              We engineer mission-critical systems and build expert-level engineering teams for global enterprises, scaling startups, and high-security defense contractors. Our multi-disciplinary squads integrate directly into your operations to resolve structural bottlenecks and deploy secure, resilient architectures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-gray-950 border border-gray-900 hover:border-gold-500/30 rounded-sm space-y-4 transition-all group">
              <div className="p-3 bg-gold-400/5 border border-gold-400/10 rounded-sm w-fit group-hover:bg-gold-500/10 transition-colors">
                <Building size={20} className="text-gold-500" />
              </div>
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Bespoke Solutions Engineering</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Outsource your high-stakes operational engineering. From deep zero-trust cloud network provisioning to custom low-level database adapters and high-transaction client-facing web runtimes, our solutions perform flawlessly under maximum transactional volumes.
              </p>
            </div>

            <div className="p-6 bg-gray-950 border border-gray-900 hover:border-gold-500/30 rounded-sm space-y-4 transition-all group">
              <div className="p-3 bg-gold-400/5 border border-gold-400/10 rounded-sm w-fit group-hover:bg-gold-500/10 transition-colors">
                <Users size={20} className="text-gold-500" />
              </div>
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Specialized Corporate Academy</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Up-skill your technical workforce directly. Enroll your engineering teams into our hands-on training cohorts, aligning your developers with advanced cloud security modules, AI pipeline engineering, and zero-defect systems workflows.
              </p>
            </div>

            <div className="p-6 bg-gray-950 border border-gray-900 hover:border-gold-500/30 rounded-sm space-y-4 transition-all group">
              <div className="p-3 bg-gold-400/5 border border-gold-400/10 rounded-sm w-fit group-hover:bg-gold-500/10 transition-colors">
                <Shield size={20} className="text-gold-500" />
              </div>
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Joint Ventures & Research</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Partner with our state-of-the-art Innovation Labs on custom LLM optimization, secure decentralized consensus databases, or autonomous agentic operating pipelines with transaction-safe state controls and hardware enclave authorization vectors.
              </p>
            </div>

          </div>

          <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">Are you an Enterprise Leader, CTO, or Venture representative?</h4>
              <p className="text-[11px] text-gray-400 font-sans">Submit a priority consultation request or connect instantly via WhatsApp, Telegram, or Email below.</p>
            </div>
            <a href="#contact" className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-xs text-[11px] uppercase tracking-wider font-display shrink-0 transition-colors">
              Request Executive Consulting
            </a>
          </div>

        </div>
      </motion.section>

      {/* TECH MONETIZATION & REFERRAL WEALTH ENGINE SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        id="monetization" 
        className="py-24 px-6 bg-black border-t border-zinc-900 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-850 pb-6">
            <div className="space-y-2">
              <span className="text-[10px] text-gold-500 font-mono font-bold tracking-widest uppercase block bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full w-fit">
                Financial Sovereignty & High-Income Streams
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-wider">
                How to Make Money <span className="text-gold-500">From Tech</span>
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 max-w-2xl font-sans">
                Master high-ticket global freelancing, bug bounties, AI automation retainers, remote international jobs, and direct cash payouts via the Kogla Ambassador Referral System.
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <Link
                to="/monetize"
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all"
              >
                Explore Full Guide <ArrowRight size={13} />
              </Link>
              <Link
                to="/affiliate-portal"
                className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-display font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all shadow-md shadow-gold-500/10"
              >
                <Zap size={13} className="fill-current" /> Referral Engine
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Kogla Referral Partner */}
            <div className="p-6 bg-zinc-950 border border-gold-500/30 hover:border-gold-500 rounded-lg space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded uppercase font-bold">Fastest Cashflow</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">6% – 10% / Sale</span>
                </div>
                <h3 className="text-base font-display font-bold text-white uppercase">Kogla Tech Referrals</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Earn instant commissions whenever a student enrolls in a cohort using your custom promo code or affiliate link.
                </p>
              </div>
              <Link to="/affiliate-portal" className="pt-4 border-t border-zinc-850 text-xs font-mono text-gold-400 font-bold uppercase flex items-center justify-between group-hover:text-gold-300">
                <span>Join Ambassador Program</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2: International Freelancing */}
            <div className="p-6 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-lg space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded uppercase font-bold">USD Contracts</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">$1,500 – $8,000</span>
                </div>
                <h3 className="text-base font-display font-bold text-white uppercase">Global Web & App Dev</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Build custom React, Node.js, and cloud systems for businesses across the US, UK, and Europe via Upwork and direct outreach.
                </p>
              </div>
              <Link to="/monetize" className="pt-4 border-t border-zinc-850 text-xs font-mono text-zinc-300 font-bold uppercase flex items-center justify-between group-hover:text-gold-400">
                <span>View Freelance Blueprint</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3: Bug Bounty Hunting */}
            <div className="p-6 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-lg space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase font-bold">Cyber Defense</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">$500 – $25,000+</span>
                </div>
                <h3 className="text-base font-display font-bold text-white uppercase">Ethical Bug Bounties</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Hunt real-world vulnerabilities on HackerOne and Bugcrowd, legally reporting bugs to protect enterprise networks.
                </p>
              </div>
              <Link to="/monetize" className="pt-4 border-t border-zinc-850 text-xs font-mono text-zinc-300 font-bold uppercase flex items-center justify-between group-hover:text-gold-400">
                <span>View Security Roadmap</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 4: AI Automation Agency */}
            <div className="p-6 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-lg space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded uppercase font-bold">Recurring MRR</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">$2,000 – $10k/mo</span>
                </div>
                <h3 className="text-base font-display font-bold text-white uppercase">AI Automation Agency</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Design autonomous customer support, CRM lead engines, and workflow pipelines for corporate clients on monthly retainers.
                </p>
              </div>
              <Link to="/monetize" className="pt-4 border-t border-zinc-850 text-xs font-mono text-zinc-300 font-bold uppercase flex items-center justify-between group-hover:text-gold-400">
                <span>View Agency Blueprint</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </motion.section>

      {/* COMMUNITY REVIEWS SECTION */}
      <ReviewSection />

      {/* PROFESSIONAL INSTANT CONTACT US SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        id="contact" 
        className="py-24 px-6 bg-gray-950 border-t border-gray-850"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] text-gold-500 font-mono font-bold tracking-widest uppercase bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full">
              Instant Communication Channels
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-wider">
              Connect With Us At Once
            </h2>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl mx-auto font-sans">
              Choose your preferred channel below to reach our engineering and admissions team immediately, or submit a secure dispatch form directly stored in our database.
            </p>
          </div>

          {/* 4 PROFESSIONAL PROMPT CARDS FOR WHATSAPP, CALL US, EMAIL, TELEGRAM */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* WhatsApp Card */}
            <a 
              href={config.whatsappLink || 'https://wa.me/2347012489041'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 bg-black border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-950/20 transition-all rounded-sm flex flex-col justify-between group text-center cursor-pointer shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageCircle size={22} />
                </div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">WhatsApp Support</h3>
                <p className="text-xs text-gray-400 font-sans">
                  Chat directly with our admissions and technical consultants instantly via WhatsApp.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-900 text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                WhatsApp Chat <ArrowRight size={12} />
              </div>
            </a>

            {/* Call Us Hotline Card */}
            <a 
              href={`tel:${(config.contactPhone || '+2347012489041').replace(/[^0-9+]/g, '')}`}
              className="p-6 bg-black border border-gold-500/40 hover:border-gold-500 hover:bg-gold-950/20 transition-all rounded-sm flex flex-col justify-between group text-center cursor-pointer shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                  <Zap size={22} />
                </div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Call Us Hotline</h3>
                <p className="text-xs text-gray-400 font-sans">
                  Direct phone line for voice inquiries, urgent consults, and admissions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-900 text-[11px] font-mono text-gold-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                Call {config.contactPhone || '+234 701 248 9041'} <ArrowRight size={12} />
              </div>
            </a>

            {/* Email Card */}
            <a 
              href={`mailto:${config.contactEmail || 'solutions@koglatech.com'}?subject=Kogla%20Tech%20Enterprise%20Inquiry`}
              className="p-6 bg-black border border-amber-500/30 hover:border-amber-500 hover:bg-amber-950/20 transition-all rounded-sm flex flex-col justify-between group text-center cursor-pointer shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Direct Email</h3>
                <p className="text-xs text-gray-400 font-sans">
                  Send official inquiries, partnership requests, or custom briefs to our support desk.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-900 text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 truncate">
                {config.contactEmail || 'solutions@koglatech.com'} <ArrowRight size={12} className="shrink-0" />
              </div>
            </a>

            {/* Telegram Card */}
            <a 
              href={config.telegramLink || 'https://t.me/kogla_tech'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 bg-black border border-sky-500/30 hover:border-sky-500 hover:bg-sky-950/20 transition-all rounded-sm flex flex-col justify-between group text-center cursor-pointer shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Send size={22} />
                </div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Telegram Channel</h3>
                <p className="text-xs text-gray-400 font-sans">
                  Join our active developer community and direct support channel on Telegram.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-900 text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                Join Telegram <ArrowRight size={12} />
              </div>
            </a>
          </div>

          {/* SECURE INQUIRY FORM */}
          <div className="p-8 bg-black border border-gray-850 rounded-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-400" />
            <div className="max-w-2xl mx-auto space-y-6">
              
              <div className="text-center space-y-1">
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">Secure Inquiry Submission</h3>
                <p className="text-[11px] text-gray-400 font-sans">
                  Submissions here are securely stored in our encrypted database for priority response tracking.
                </p>
              </div>

              {submissionSuccess && (
                <div className="p-3.5 bg-gold-500 text-black font-bold text-xs rounded-sm text-center animate-pulse font-mono uppercase tracking-wider">
                  ✓ Consultation Request Saved to Database Successfully! Specialist responding in &lt; 2 Hours.
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Full Name / Organization</label>
                  <input 
                    type="text" 
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Alexandra Sterling (Apex Corp)" 
                    className="w-full p-3 bg-gray-950 border border-gray-850 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Business Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@company.com" 
                    className="w-full p-3 bg-gray-950 border border-gray-850 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Project Scope / Message</label>
                  <textarea 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your requirement, course enrollment query, or engineering project..." 
                    className="w-full p-3 bg-gray-950 border border-gray-850 h-28 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 resize-none font-mono" 
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-gold-500 hover:bg-gold-600 font-bold text-xs text-black uppercase tracking-widest font-display transition-colors rounded-sm flex items-center justify-center gap-2">
                  <Send size={14} /> Submit Inquiry Securely
                </button>
              </form>

            </div>
          </div>

        </div>
      </motion.section>
    </div>
  );
}


