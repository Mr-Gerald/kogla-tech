import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Award, 
  Shield, 
  Clock, 
  Layers, 
  Users, 
  Globe, 
  Building2, 
  Tag, 
  Check, 
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { addInquiry } from '../utils/storage';
import { ReviewSection } from '../components/ReviewSection';
import { ACADEMY_COURSES, getCourseBySlug, formatNaira, CourseTrack } from '../data/coursesPricing';
import { getActiveReferralCode, setManualReferralCode, captureUrlReferral } from '../lib/referralTracker';
import { createReferralLead } from '../lib/affiliates';

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const courseKey = slug?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'web-development';
  const course = getCourseBySlug(courseKey) || ACADEMY_COURSES[0];

  // Enrollment form state
  const [selectedFormat, setSelectedFormat] = useState<'online' | 'physical'>('online');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [motivation, setMotivation] = useState('');
  const [promoCode, setPromoCode] = useState(getActiveReferralCode() || '');
  const [promoApplied, setPromoApplied] = useState(Boolean(getActiveReferralCode()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const urlRef = captureUrlReferral();
    const active = urlRef || getActiveReferralCode();
    if (active) {
      setPromoCode(active);
      setPromoApplied(true);
    }
  }, []);

  const basePrice = selectedFormat === 'online' ? course.onlinePrice : course.physicalPrice;
  const isDiscountValid = promoApplied && promoCode.trim().length > 0;
  const discountAmount = isDiscountValid ? Math.round(basePrice * 0.05) : 0;
  const finalPrice = basePrice - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setManualReferralCode(promoCode.trim().toUpperCase());
      setPromoApplied(true);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      // 1. Log student inquiry
      addInquiry({
        type: 'enrollment',
        title: `${course.title.toUpperCase()} (${selectedFormat.toUpperCase()})`,
        senderName: name,
        senderEmail: email,
        description: `Format: ${selectedFormat === 'online' ? 'Online Cohort' : 'Physical Hub'}. Tuition: ${formatNaira(finalPrice)}. Promo: ${promoCode || 'None'}. Phone: ${phone || 'N/A'}. Motivation: ${motivation || 'Ready to start'}`
      });

      // 2. If promo code is applied (e.g. PHENA), log lead directly into referral engine!
      if (promoCode.trim()) {
        await createReferralLead({
          affiliateCode: promoCode.trim().toUpperCase(),
          studentName: name,
          studentEmail: email,
          studentPhone: phone,
          courseTitle: course.title,
          mode: selectedFormat,
          tuitionAmount: basePrice
        });
      }

      setFormSubmitted(true);
    } catch (err) {
      console.error('Enrollment error:', err);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 px-4 sm:px-6 pb-24 max-w-6xl mx-auto text-gray-100 font-sans">
      
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/academy')} 
        className="flex items-center text-zinc-400 hover:text-gold-400 mb-8 transition-colors text-xs font-mono tracking-widest uppercase"
      >
        <ArrowLeft size={14} className="mr-2" /> Return to all 11 tracks
      </button>

      {/* HERO BANNER */}
      <div className="border-b border-zinc-850 pb-10 mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] rounded-full uppercase tracking-widest font-mono">
            <Award size={12} /> {course.category} Specialization
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black bg-gradient-to-r from-white via-gold-400 to-white bg-clip-text text-transparent leading-tight uppercase">
            {course.title}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-3xl leading-relaxed font-mono uppercase tracking-wider">
            {course.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <a 
            href="#enroll"
            className="px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 font-bold text-black text-xs uppercase tracking-widest font-display rounded-sm flex items-center gap-2 shadow-lg transition-all"
          >
            Enroll in Cohort &rarr;
          </a>
          <Link
            to="/verify-certificate"
            className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs uppercase font-mono tracking-wider rounded-sm flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck size={14} className="text-gold-400" /> Verify Credentials
          </Link>
        </div>
      </div>

      {/* META SPECS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg">
          <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono block mb-1">Duration</span>
          <span className="text-white text-sm font-semibold flex items-center gap-1.5 font-display">
            <Clock size={14} className="text-gold-400" /> {course.duration}
          </span>
        </div>
        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg">
          <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono block mb-1">Weekly Commitment</span>
          <span className="text-white text-sm font-semibold flex items-center gap-1.5 font-display">
            <Layers size={14} className="text-gold-400" /> {course.intensity}
          </span>
        </div>
        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg">
          <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono block mb-1">Target Proficiency</span>
          <span className="text-white text-sm font-semibold flex items-center gap-1.5 font-display">
            <Users size={14} className="text-gold-400" /> {course.level}
          </span>
        </div>
        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg">
          <span className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono block mb-1">Dual Certification</span>
          <span className="text-gold-400 text-sm font-bold flex items-center gap-1.5 font-display">
            <Award size={14} /> Verified Credential
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT & ENROLLMENT FORM */}
      <div className="grid lg:grid-cols-12 gap-12 items-start mb-16">
        
        {/* LEFT COLUMN: DESCRIPTION, SYLLABUS & TOOLS */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Overview */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gold-400 font-display font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span> Curriculum Overview
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Tools & Stacks Covered */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">
              Key Technologies & Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.tools.map(tool => (
                <span key={tool} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono rounded">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Syllabus */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">
              Comprehensive Syllabus Schedule
            </h3>
            <div className="space-y-3">
              {course.syllabus.map((item, idx) => (
                <div key={idx} className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg hover:border-gold-500/30 transition-all space-y-1">
                  <span className="text-[10px] font-mono text-gold-400 font-bold uppercase block">
                    {item.week}
                  </span>
                  <h4 className="text-sm font-display font-bold text-white uppercase">
                    {item.topic}
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Career Outcomes */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">
              Practical Real-World Competencies
            </h3>
            <div className="space-y-2">
              {course.outcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-sans">
                  <CheckCircle2 size={15} className="text-gold-400 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE ENROLLMENT & DUAL PRICING CHECKOUT */}
        <div id="enroll" className="lg:col-span-5 bg-zinc-950 border-2 border-gold-500/30 rounded-lg p-6 sm:p-8 shadow-2xl space-y-6 sticky top-24">
          
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-bold block mb-1">
              DIRECT ADMISSIONS PORTAL
            </span>
            <h3 className="text-xl font-display font-bold text-white uppercase">
              Enrollment & Format Selection
            </h3>
          </div>

          {formSubmitted ? (
            <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <Check size={24} />
              </div>
              <div>
                <h4 className="text-base font-display font-bold text-white uppercase">
                  Admissions Application Logged
                </h4>
                <p className="text-xs text-zinc-300 font-sans mt-1">
                  Thank you, <b>{name}</b>! Your enrollment request for <b>{course.title}</b> ({selectedFormat === 'online' ? 'Online Class' : 'Physical Hub'}) has been recorded.
                </p>
              </div>

              <div className="p-3 bg-black/60 border border-zinc-800 rounded text-left text-xs font-mono space-y-1.5 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Net Tuition Payable:</span>
                  <span className="text-gold-400 font-bold">{formatNaira(finalPrice)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-400 text-[11px]">
                    <span>Promo Discount Applied:</span>
                    <span>-{formatNaira(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-850">
                  <span>Verification Status:</span>
                  <span className="text-amber-400 font-bold">Pending Tuition Transfer</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Bank payment details and cohort onboarding schedule have been sent to <b>{email}</b>. Our admissions coordinator will also reach out on WhatsApp.
              </p>

              <button
                onClick={() => setFormSubmitted(false)}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono uppercase rounded transition-all"
              >
                Submit Another Enrollment
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnroll} className="space-y-5">
              
              {/* FORMAT SELECTOR (ONLINE VS PHYSICAL) */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-2">
                  Select Study Format & Campus
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('online')}
                    className={`p-3.5 rounded border text-left transition-all ${
                      selectedFormat === 'online'
                        ? 'bg-gold-500/15 border-gold-500 text-white shadow-md'
                        : 'bg-black/40 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-display font-bold uppercase">
                      <Globe size={13} className={selectedFormat === 'online' ? 'text-gold-400' : 'text-zinc-500'} />
                      Online Class
                    </div>
                    <div className="text-sm font-mono font-bold text-gold-400 mt-1">
                      {isDiscountValid ? (
                        <div>
                          <span className="line-through text-zinc-500 text-xs mr-1.5">{formatNaira(course.onlinePrice)}</span>
                          <span className="text-emerald-400 font-black">{formatNaira(Math.round(course.onlinePrice * 0.95))}</span>
                        </div>
                      ) : (
                        formatNaira(course.onlinePrice)
                      )}
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                      Live interactive evening sessions
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('physical')}
                    className={`p-3.5 rounded border text-left transition-all ${
                      selectedFormat === 'physical'
                        ? 'bg-gold-500/15 border-gold-500 text-white shadow-md'
                        : 'bg-black/40 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-display font-bold uppercase">
                      <Building2 size={13} className={selectedFormat === 'physical' ? 'text-gold-400' : 'text-zinc-500'} />
                      Physical Hub
                    </div>
                    <div className="text-sm font-mono font-bold text-gold-400 mt-1">
                      {isDiscountValid ? (
                        <div>
                          <span className="line-through text-zinc-500 text-xs mr-1.5">{formatNaira(course.physicalPrice)}</span>
                          <span className="text-gold-400 font-black">{formatNaira(Math.round(course.physicalPrice * 0.95))}</span>
                        </div>
                      ) : (
                        formatNaira(course.physicalPrice)
                      )}
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                      In-person lab immersion
                    </div>
                  </button>
                </div>
              </div>

              {/* PROMO / REFERRAL CODE INPUT */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
                  Ambassador Promo / Referral Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoApplied(false);
                    }}
                    placeholder="e.g. PHENA"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-gold-400 font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs font-mono uppercase rounded transition-all shrink-0"
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>

                {promoApplied && promoCode && (
                  <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <Check size={12} /> 5% Ambassador Discount Applied (-{formatNaira(discountAmount)})
                  </p>
                )}
              </div>

              {/* TUITION BREAKDOWN SUMMARY */}
              <div className="p-3.5 bg-black/60 border border-zinc-850 rounded space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Gross Tuition ({selectedFormat === 'online' ? 'Online' : 'Physical'}):</span>
                  <span>{formatNaira(basePrice)}</span>
                </div>
                {promoApplied && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-[11px]">
                    <span>Creator Discount (-5%):</span>
                    <span>-{formatNaira(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-1.5 border-t border-zinc-800">
                  <span>Net Payable Amount:</span>
                  <span className="text-gold-400 font-black">{formatNaira(finalPrice)}</span>
                </div>
              </div>

              {/* STUDENT DETAILS FORM */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chidimma Okeke"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded focus:border-gold-500 focus:outline-none text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-widest font-display rounded shadow-lg transition-all"
              >
                {isSubmitting ? 'Logging Application...' : `Confirm Enrollment • ${formatNaira(finalPrice)}`}
              </button>

            </form>
          )}

        </div>

      </div>

      {/* COURSE SPECIFIC REVIEWS SECTION */}
      <div className="border-t border-zinc-850 pt-12">
        <ReviewSection 
          targetType="course" 
          targetId={course.slug} 
          title={`Verified Reviews: ${course.title}`} 
          subtitle="Real experiences and feedback from students and graduates of this specialization."
        />
      </div>

    </div>
  );
}
