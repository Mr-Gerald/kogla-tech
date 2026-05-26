import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Play, 
  HelpCircle, 
  Coins, 
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ACADEMY_PATHS, AcademyChapter } from '../data/academyContent';

export default function StudyRoom() {
  const { slug, roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile, completeRoom } = useAuth();
  const { config } = useSiteConfig();

  // Load active path (default to cybersecurity if slug not provided or unmatched)
  const pathSlug = slug || 'advanced-cybersecurity';
  const activePath = ACADEMY_PATHS[pathSlug] || ACADEMY_PATHS['advanced-cybersecurity'];

  // Track active module and active chapter
  const [activeModIdx, setActiveModIdx] = useState(0);
  const [activeChapIdx, setActiveChapIdx] = useState(0);

  // Sync active track index and auto-redirect to valid slug if requested on empty path index
  useEffect(() => {
    if (!slug) {
      navigate('/study/advanced-cybersecurity', { replace: true });
    }
  }, [slug, navigate]);

  // Synchronize chapter indices when URL's roomId changes
  useEffect(() => {
    if (roomId && activePath) {
      let found = false;
      for (let mIdx = 0; mIdx < activePath.modules.length; mIdx++) {
        const mod = activePath.modules[mIdx];
        const cIdx = mod.chapters.findIndex(c => c.id === roomId);
        if (cIdx !== -1) {
          setActiveModIdx(mIdx);
          setActiveChapIdx(cIdx);
          found = true;
          break;
        }
      }
      if (!found) {
        setActiveModIdx(0);
        setActiveChapIdx(0);
      }
    }
  }, [roomId, activePath]);

  // RESTORE SCROLL INSTANTANEOUSLY ON CHAPTER AND SLUG SHIFTS (Crucial UX fix)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [roomId, slug]);

  // Terminal state simulator
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  
  // Interactive quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  const activeModule = activePath ? (activePath.modules[activeModIdx] || activePath.modules[0]) : null;
  const activeChapter = activeModule ? (activeModule.chapters[activeChapIdx] || activeModule.chapters[0]) : null;

  // Reset quiz states when chapter shifts
  useEffect(() => {
    if (activeChapter && activePath) {
      setSelectedOption(null);
      setQuizSubmitted(false);
      setQuizCorrect(null);
      setTerminalHistory([
        `KOGLA OS Security Shell v4.0.2 [Path: ${activePath.title}]`,
        `Telemetry loaded. Ready for dynamic commands execution.`,
        `Suggested instruction for module: "${activeChapter.terminalCommand || 'help'}"`
      ]);
    }
  }, [activePath, activeModIdx, activeChapIdx, activeChapter]);

  if (!activePath || !activeChapter) {
    return (
      <div className="pt-32 text-center text-gray-500 font-mono text-xs">
        No active study programs found. <Link to="/academy" className="text-gold-500">Back to Catalog</Link>
      </div>
    );
  }

  // Handle Command Simulation
  const handleCommandSimulate = (cmd: string) => {
    if (!cmd.trim()) return;
    const cleanCmd = cmd.trim();
    let response = `bash: command not found: ${cleanCmd}`;

    if (cleanCmd.toLowerCase().includes('objdump')) {
      response = `[ELF64 Header] Magic: 7f 45 4c 46 02 01 01 00\nEntry point address: 0x4010d0\nDisassembling section .text:\n000000000040101d0 <_start>:\n  40101d0:  31 ed              xor    ebp,ebp\n  40101d2:  49 89 d1           mov    r9,rdx\n  40101d5:  5e                 pop    rsi\n  40101d6:  48 89 e2           mov    rdx,rsp`;
    } else if (cleanCmd.toLowerCase().includes('gdb')) {
      response = `GNU gdb (Ubuntu 12.1) 7.12\n(gdb) file ./vulnerable_node\nReading symbols from ./vulnerable_node...\n(gdb) break vulnerable_function\nBreakpoint 1 at 0x1169: file main.c, line 6.`;
    } else if (cleanCmd.toLowerCase().includes('bpftool')) {
      response = `ID   TYPE            NAME             TAG              LOADED_AT\n12   kprobe          hello_clone      d81d5fcf721a     2026-05-24T11:32:00Z\n14   tracepoint      sys_enter_write  f239cb129112     2026-05-24T11:32:15Z`;
    } else if (cleanCmd.toLowerCase().includes('kyber')) {
      response = `Lattice system calibration ready.\nKyber-768 parameter metrics:\n- CPU cycles per encaps: 82,310\n- CPU cycles per decaps: 74,120\n- Strength: 192-bit security equivalence (Quantum resistant)`;
    } else if (cleanCmd.toLowerCase().includes('terraform')) {
      response = `Terraform v1.5.0 initialized.\nComparing declarations with active live resources...\nPlan: 1 to add, 0 to change, 0 to destroy.`;
    } else if (cleanCmd.toLowerCase().includes('npm run build')) {
      response = `vite v6.2.3 building for production...\n✓ 42 modules transformed.\ndist/assets/index-D7b31d.js   142.12 kB │ gzip: 42.10 kB\n✓ built in 530ms`;
    } else if (cleanCmd.toLowerCase().includes('help')) {
      response = `Available commands:\n- ${activeChapter.terminalCommand || 'help'}\n- clear: Purges shell prints`;
    } else if (cleanCmd.toLowerCase() === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    setTerminalHistory(prev => [...prev, `kogla-sh$ ${cleanCmd}`, response]);
    setTerminalInput('');
  };

  // Handle Quiz verification
  const handleQuizCheck = async () => {
    if (selectedOption === null || !activeChapter) return;
    
    const isCorrect = selectedOption === activeChapter.quiz.correctIndex;
    setQuizCorrect(isCorrect);
    setQuizSubmitted(true);

    if (isCorrect) {
      setTerminalHistory(prev => [
        ...prev, 
        `[ACADEMY EXAM COMPLETED] Answer verified. Authenticating credits transfer...`,
        `[OK] Transfer complete: +${activeChapter.xpReward} XP written securely to database.`
      ]);
      if (user && profile) {
        await completeRoom(activeChapter.id, activeChapter.xpReward);
      }
    } else {
      setTerminalHistory(prev => [
        ...prev, 
        `[ACADEMY EXAM WARNING] Verification failed: Incorrect response patterns parsed.`
      ]);
    }
  };

  // Find flattened collection of all rooms inside the syllabus for dynamic focus step mapping
  const allPathRooms: AcademyChapter[] = [];
  activePath.modules.forEach(m => {
    m.chapters.forEach(c => {
      allPathRooms.push(c);
    });
  });
  const currentRoomIdx = allPathRooms.findIndex(r => r.id === roomId);
  const prevRoom = currentRoomIdx > 0 ? allPathRooms[currentRoomIdx - 1] : null;
  const nextRoom = currentRoomIdx !== -1 && currentRoomIdx < allPathRooms.length - 1 ? allPathRooms[currentRoomIdx + 1] : null;

  const totalRooms = allPathRooms.length;
  const completedRoomsCount = allPathRooms.filter(r => profile?.completedRooms?.includes(r.id)).length;
  const progressPercentage = totalRooms ? Math.round((completedRoomsCount / totalRooms) * 100) : 0;

  return (
    <div className="pt-24 min-h-screen bg-black text-gray-100 font-sans">
      
      {/* 1. CHECK FOR ANONYMOUS SESSIONS LOCKOUT */}
      {!user || !profile ? (
        <div className="w-full min-h-[85vh] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 max-w-md bg-gray-950 border border-gray-900 rounded-sm text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-gold-500 to-red-500 animate-pulse" />
            <Lock className="text-gold-500 mx-auto mb-6" size={48} />
            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white mb-2">
              Sovereign clearance keys required
            </h2>
            <p className="text-xs text-gray-400 font-mono leading-relaxed mb-6">
              IN ACCORDANCE WITH KOGLA TECH SECURITY MANDATE-749, ONLINE ACADEMY READOUT MODULES AND INTERACTIVE DEVELOPMENT RANGES ARE EXCLUSIVELY AVAILABLE TO VERIFIED DEVELOPERS AND SYSTEM REPRESENTATIVES.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                to="/auth/login" 
                className="py-3 bg-gold-500 hover:bg-gold-600 font-bold text-black text-xs uppercase tracking-widest font-display rounded-sm transition-all text-center flex items-center justify-center gap-2"
              >
                <Terminal size={12} /> Decrypt with existing clearance keys
              </Link>
              <Link 
                to="/auth/signup" 
                className="py-3 bg-transparent hover:bg-gray-900 border border-gray-800 text-gray-300 text-xs uppercase tracking-widest font-mono rounded-sm transition-all text-center flex items-center justify-center gap-1.5"
              >
                <UserPlus size={12} /> Register new academic profile
              </Link>
            </div>
          </motion.div>
        </div>
      ) : (

        // 2. LOGGED IN MASTER SPACE DUAL DISPATCHER
        <div className="max-w-7xl mx-auto px-6 pb-20">

          {/* VIEW A: NO roomId IN URL -> RENDER SYLLABUS OVERVIEW HUB PAGE */}
          {!roomId ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Back to Catalog Breadcrumb */}
              <div>
                <Link 
                  to="/academy" 
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-gold-500 text-xs font-mono uppercase tracking-wider transition-colors animate-pulse"
                >
                  <ArrowLeft size={12} /> Back to core track catalog
                </Link>
              </div>

              {/* Headings & High-Stakes Branding */}
              <div className="border-b border-gray-900 pb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] uppercase font-mono tracking-widest font-bold rounded-full">
                  <Award size={11} className="animate-spin" style={{ animationDuration: '6s' }} /> Level-4 Sovereign Training Framework
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-medium text-white uppercase tracking-wider">
                  {activePath.title} Syllabus
                </h1>
                <p className="max-w-4xl text-xs md:text-sm text-gray-400 font-sans leading-relaxed">
                  This custom-engineered academic syllabus progresses system administrators and developers from fundamental constraints to core infrastructural orchestration patterns. Operating with extreme precision, each module unlocks a dynamic sandboxed workspace for practical, hands-on lab execution.
                </p>
              </div>

              {/* Accrued Progress & Telemetry Panel */}
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Progress bar card */}
                <div className="p-5 bg-gray-950 border border-gray-900 rounded-sm relative overflow-hidden">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block font-bold mb-1">Clearance Milestones</span>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-white text-base font-display font-bold font-mono">{progressPercentage}% Complete</span>
                    <span className="text-[10px] text-gray-400 font-mono">{completedRoomsCount} / {totalRooms} Rooms Secured</span>
                  </div>
                  <div className="w-full h-1.5 bg-black border border-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold-500 transition-all duration-1000" 
                      style={{ width: `${progressPercentage}%` }} 
                    />
                  </div>
                </div>

                {/* Account XP indicators */}
                <div className="p-5 bg-gray-950 border border-gray-900 rounded-sm">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block font-bold mb-1">Total Profile Valuation</span>
                  <span className="text-xl md:text-2xl font-display font-bold text-gold-500 font-mono block">
                    {profile.xp || 0} XP ACCRUED
                  </span>
                  <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase">Dynamic XP credits stored securely inside Firestore.</p>
                </div>

                {/* Student profile certificate clearance */}
                <div className="p-5 bg-gray-950 border border-gray-900 rounded-sm">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block font-bold mb-1">Academic Level Status</span>
                  <span className="text-sm font-mono font-bold text-white uppercase block">
                    {progressPercentage === 100 ? '👑 MASTER ARCHITECT' : '⚡ OPERATIONS INITIATE'}
                  </span>
                  <p className="text-[9px] text-gray-500 font-mono mt-2 uppercase">Subject ID: {profile.name} (Clearance Level: L4-ENG)</p>
                </div>
              </div>

              {/* Dynamic Path Select & Dropdown Option */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-950 border border-gray-900 rounded-sm">
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block font-bold">DISCIPLINE OUTLINE CALIBRATION</span>
                  <span className="text-white text-xs font-sans text-gray-400">Switch curriculum streams and adjust your focus points dynamically.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">ACTIVE SYLLABUS:</span>
                  <select 
                    value={pathSlug}
                    onChange={(e) => navigate(`/study/${e.target.value}`)}
                    className="p-2.5 bg-black border border-gray-800 text-xs font-mono text-gold-500 font-bold focus:border-gold-500 focus:outline-none rounded-sm min-w-[240px] cursor-pointer"
                  >
                    {Object.values(ACADEMY_PATHS).map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RE-DESIGNED MODULES outline card stream */}
              <div className="space-y-12">
                {activePath.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="p-6 bg-gray-950/20 border border-gray-900 rounded-sm space-y-6">
                    
                    {/* Module Title Header segment */}
                    <div className="border-b border-gray-900 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-gold-500 font-mono font-bold tracking-widest uppercase block">
                          MODULE {modIdx + 1}
                        </span>
                        <h3 className="text-lg font-display font-medium text-white uppercase tracking-wide">
                          {mod.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-black border border-gray-900 text-[10px] font-mono text-gray-400 rounded-sm">
                        Estimated scope: {mod.chapters.length * 20} Minutes Syllabus
                      </span>
                    </div>

                    {/* Grid list of room chapters inside module */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {mod.chapters.map((chap, chapIdx) => {
                        const chapCompleted = profile?.completedRooms?.includes(chap.id);
                        const roomGlobalNum = modIdx * 10 + chapIdx + 1;

                        return (
                          <Link
                            key={chap.id}
                            to={`/study/${pathSlug}/room/${chap.id}`}
                            className="group block p-5 bg-black/40 border border-gray-900 hover:border-gold-500/30 rounded-xs transition-all text-left relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-0.5 h-full bg-gold-500/20 group-hover:bg-gold-500 transition-all" />
                            
                            <div className="flex justify-between items-start gap-4 h-full">
                              <div className="space-y-2 max-w-[78%]">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gold-500 font-mono font-bold tracking-wider uppercase block">
                                    ROOM {roomGlobalNum}
                                  </span>
                                  <span className="px-1.5 py-0.2 bg-gray-950 border border-gray-900 text-[8px] font-mono text-gray-500 rounded font-semibold">
                                    {chap.difficulty}
                                  </span>
                                </div>
                                <h4 className="text-xs font-display font-bold uppercase text-white group-hover:text-gold-400 transition-colors line-clamp-1">
                                  {chap.title.replace(`Room ${roomGlobalNum}: `, '')}
                                </h4>
                                <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                                  {chap.subtitle}
                                </p>
                              </div>
                              <div className="text-right space-y-2 shrink-0 h-full flex flex-col justify-between items-end">
                                <span className="text-[10px] text-gold-500 font-mono font-bold">
                                  +{chap.xpReward} XP
                                </span>
                                {chapCompleted ? (
                                  <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 size={10} /> CLEAR
                                  </span>
                                ) : (
                                  <span className="text-[8px] text-gray-400 group-hover:text-white font-mono font-bold uppercase border border-gray-800 bg-black group-hover:bg-gold-500 group-hover:text-black group-hover:border-gold-500 px-2.5 py-1 rounded-sm transition-all tracking-wider">
                                    ENTER RANGE →
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          ) : (

            /* VIEW B: roomId SPECIFIED -> RENDER INDEPENDENT IMMERSIVE FOCUS CLASSROOM PAGE */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Back to syllabus overview header bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-gray-950 border border-gray-900 p-4 rounded-sm">
                <Link
                  to={`/study/${pathSlug}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-black border border-gray-800 text-gray-400 hover:text-gold-500 rounded-sm text-[10px] tracking-widest font-mono uppercase transition-colors"
                >
                  <ArrowLeft size={12} className="text-gold-500 shrink-0" /> ← Return to {activePath.title} Syllabus
                </Link>
                <div className="flex items-center gap-3 text-xs font-mono uppercase text-gray-400">
                  <span className="text-gold-500 font-bold">Active Station:</span> 
                  <span className="text-white">Active Room {currentRoomIdx !== -1 ? currentRoomIdx + 1 : 1} of {totalRooms}</span>
                  <span className="text-gray-600">|</span>
                  <span className="px-2 py-0.5 bg-gray-900 text-gold-500 text-[10px] font-bold rounded">Level-4 Focus Range</span>
                </div>
              </div>

              {/* Classroom core work area grid */}
              <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                
                {/* LEFT/MAIN PANE: Interactive Teaching lesson & verification Quiz (Takes full space) */}
                <div className="flex-1 bg-gray-950/20 border border-gray-900 p-6 md:p-8 rounded-sm space-y-8 min-w-0">
                  
                  {/* Lesson Metrics breadcrumb header */}
                  <div className="flex justify-between items-center gap-4 pb-2 border-b border-gray-900">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-900 border border-gray-800 text-gray-400 text-[9px] rounded font-mono uppercase font-bold">
                      {activeChapter.difficulty} COMPARTMENT
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-gold-500 text-[11px] font-bold">
                      <Coins size={12} /> +{activeChapter.xpReward} XP Credit Reward
                    </div>
                  </div>

                  {/* Room big typography headings */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold-500 font-mono uppercase tracking-widest block font-bold">
                      ACTIVE TRAINING TARGETS
                    </span>
                    <h1 className="text-2xl md:text-3xl font-display font-medium text-white uppercase tracking-wider">
                      {activeChapter.title}
                    </h1>
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wide">
                      {activeChapter.subtitle}
                    </p>
                  </div>

                  {/* Multi-layered educational writeup formatters */}
                  <div className={`prose ${config.themeMode === 'light' ? 'prose-neutral text-gray-850 font-medium' : 'prose-invert text-gray-300'} prose-sm leading-relaxed max-w-none text-xs md:text-sm font-sans space-y-6`}>
                    {activeChapter.content.split('\n\n').map((paragraph, index) => {
                      if (paragraph.startsWith('```')) {
                        const code = paragraph.replace(/```[a-z]*/g, '').trim();
                        return (
                          <div key={index} className="p-4 bg-black border border-gray-900 rounded-xs font-mono text-[11px] text-gray-400 overflow-x-auto my-4 max-h-[400px]">
                            <pre className="whitespace-pre">{code}</pre>
                          </div>
                        );
                      }
                      
                      const cleanPara = paragraph.trim();
                      if (cleanPara.startsWith('###')) {
                        return (
                          <h3 key={index} className="text-xs md:text-sm font-display font-bold uppercase text-gold-500 mt-8 mb-4 border-b border-gray-900 pb-2 tracking-wider flex items-center gap-2">
                            {cleanPara.replace('###', '').trim()}
                          </h3>
                        );
                      }
                      if (cleanPara.startsWith('#### 👶')) {
                        return (
                          <div key={index} className="p-4 bg-gold-500/5 border-l-2 border-gold-500 rounded-r-xs space-y-1 my-6 text-xs md:text-sm">
                            <h4 className="text-[11px] font-display font-bold uppercase text-gold-500 tracking-wider">
                              👶 IN PLAIN ENGLISH (For A 5-Year-Old)
                            </h4>
                            <p className="text-gray-300 leading-relaxed italic">
                              {cleanPara.replace('#### 👶 IN PLAIN ENGLISH (For A 5-Year-Old)', '').trim()}
                            </p>
                          </div>
                        );
                      }
                      if (cleanPara.startsWith('#### 🧠')) {
                        return (
                          <div key={index} className="p-4 bg-gray-950 border border-gray-900 rounded-sm space-y-1 my-6 text-xs md:text-sm">
                            <h4 className="text-[11px] font-display font-bold uppercase text-white tracking-wider">
                              🧠 ELITE ENGINEERING SPECIFICATIONS (Under the Hood)
                            </h4>
                            <div className="text-gray-400 leading-relaxed font-sans space-y-2">
                              {cleanPara.replace('#### 🧠 ELITE ENGINEERING SPECIFICATIONS (Under the Hood)', '').trim().split('\n').map((line, lIdx) => (
                                <p key={lIdx}>{line}</p>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      if (cleanPara.startsWith('#### 💻')) {
                        return (
                          <div key={index} className="p-4 bg-black border border-gray-900 rounded-xs space-y-2 my-6">
                            <h4 className="text-[11px] font-display font-bold uppercase text-green-400 tracking-wider">
                              💻 TERMINAL HANDS-ON ADVENTURE
                            </h4>
                            <p className="text-xs text-gray-400 font-mono leading-relaxed">
                              {cleanPara.replace('#### 💻 TERMINAL HANDS-ON ADVENTURE', '').trim()}
                            </p>
                          </div>
                        );
                      }

                      return <p key={index} className="leading-relaxed text-gray-300">{cleanPara}</p>;
                    })}
                  </div>

                  {/* INTERACTIVE COMPARTMENT TESTING EXAM QUIZ SECTION */}
                  <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                      <HelpCircle size={15} className="text-gold-500" />
                      <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white font-mono">
                        Verification Examination Checkpoint
                      </h4>
                    </div>

                    <p className="text-xs text-gray-300 font-semibold leading-relaxed">
                      {activeChapter.quiz.question}
                    </p>

                    <div className="grid gap-2.5">
                      {activeChapter.quiz.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectOption = idx === activeChapter.quiz.correctIndex;
                        
                        let bgBorderClass = "border-gray-900 hover:border-gold-500/20 text-gray-400 bg-black";
                        if (isSelected) {
                          bgBorderClass = "border-gold-500 bg-gold-400/5 text-gold-500";
                        }
                        if (quizSubmitted) {
                          if (isCorrectOption) {
                            bgBorderClass = "border-green-500 bg-green-500/10 text-green-400";
                          } else if (isSelected) {
                            bgBorderClass = "border-red-500 bg-red-500/10 text-red-400";
                          } else {
                            bgBorderClass = "border-gray-900 text-gray-650 cursor-not-allowed bg-black";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedOption(idx)}
                            className={`w-full text-left p-4 border rounded-sm text-xs transition-all font-mono flex items-center justify-between ${bgBorderClass}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrectOption && (
                              <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest">[Verified Correct]</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {!quizSubmitted ? (
                      <button
                        disabled={selectedOption === null}
                        onClick={handleQuizCheck}
                        className="w-full py-3 bg-gold-500 hover:bg-gold-650 disabled:bg-gold-500/20 disabled:text-gray-800 disabled:cursor-not-allowed text-black font-semibold text-xs tracking-wider uppercase font-display rounded-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        Submit Response telemetry <Play size={10} />
                      </button>
                    ) : (
                      <div className="p-4 bg-black border border-gray-900 text-xs text-gray-400 font-mono leading-relaxed space-y-2">
                        <span className="text-white block font-bold uppercase text-[10px]">REMEDIATION PROTOCOL:</span>
                        <p>{activeChapter.quiz.explanation}</p>
                        {quizCorrect ? (
                          <span className="text-green-400 font-bold uppercase flex items-center gap-1 mt-3 text-[10px]">
                            <Sparkles size={11} className="text-gold-500 animate-spin" /> CHAPTER SECURED. ACCOUNTS CREDITS DEPLOYED TO Database SAFELY.
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setSelectedOption(null);
                              setQuizCorrect(null);
                            }}
                            className="text-gold-500 hover:text-gold-400 hover:underline uppercase block text-[10px] tracking-widest font-bold mt-3"
                          >
                            [RE-AUDIT RESPONSE CODES CONSOLE]
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PREVIOUS/NEXT NAVIGATION ALIGNERS */}
                  <div className="flex justify-between items-center border-t border-gray-900 pt-6">
                    <button
                      disabled={!prevRoom}
                      onClick={() => navigate(`/study/${pathSlug}/room/${prevRoom?.id}`)}
                      className="px-4 py-2.5 bg-black hover:bg-gray-950 border border-gray-800 text-gray-400 hover:text-white text-[11px] font-mono rounded-sm transition-colors uppercase disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1.5"
                    >
                      <ArrowLeft size={12} /> Previous Room
                    </button>
                    <span className="text-[10px] font-mono text-gray-600">
                      Chapter Range Index: {currentRoomIdx !== -1 ? currentRoomIdx + 1 : 1} / {totalRooms}
                    </span>
                    <button
                      disabled={!nextRoom}
                      onClick={() => navigate(`/study/${pathSlug}/room/${nextRoom?.id}`)}
                      className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-black border border-gold-500 text-[11px] font-mono rounded-sm transition-all uppercase disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1.5 font-bold"
                    >
                      Next Room <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Completion Celebration block if no next room is available */}
                  {!nextRoom && (
                    <div className="p-6 bg-gold-500/10 border border-gold-500 rounded-sm text-center space-y-3">
                      <Award className="text-gold-500 mx-auto animate-bounce" size={32} />
                      <h3 className="text-sm font-display font-medium text-white uppercase tracking-widest">
                        Congratulations - Lesson Track Cleared!
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-mono max-w-xl mx-auto">
                        You have successfully audited every single chamber inside the active {activePath.title} syllabus scope. Operating under strict sovereign benchmarks, all credits have been recorded.
                      </p>
                      <Link 
                        to={`/study/${pathSlug}`} 
                        className="inline-block px-4 py-2 bg-gold-500 hover:bg-gold-600 font-bold text-black text-xs uppercase font-display rounded-xs transition-colors"
                      >
                        Return to Track Syllabus
                      </Link>
                    </div>
                  )}

                </div>

                {/* RIGHT PANE: Side Workstation Console Sandbox Terminal */}
                <div className="w-full lg:w-96 bg-black border border-gray-900 flex flex-col shrink-0 text-xs font-mono rounded-sm self-stretch min-h-[500px]">
                  <div className="p-3 bg-gray-950 border-b border-gray-900 flex justify-between items-center text-[10px] text-gray-400">
                    <span className="flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-widest text-gold-500">
                      <Terminal size={12} className="text-gold-400 animate-pulse" /> Sandbox Console Terminal
                    </span>
                    <span className="text-[9px] uppercase font-bold text-red-500">[LIVE SIM]</span>
                  </div>

                  {/* Console print zone */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[400px] lg:max-h-none text-green-500 font-mono text-[11px] leading-relaxed select-text">
                    {terminalHistory.map((line, index) => (
                      <div key={index} className="whitespace-pre-wrap break-all border-b border-gray-950/20 pb-1.5 last:border-0">
                        {line}
                      </div>
                    ))}
                  </div>

                  {/* Suggester deploy prompt box */}
                  {activeChapter.terminalCommand && (
                    <div className="p-3 bg-gray-950/70 border-t border-gray-901 space-y-2">
                      <span className="text-[9px] text-gray-500 uppercase block tracking-widest font-bold">Suggested Sandbox Payload:</span>
                      <div className="flex items-center justify-between gap-3 p-2 bg-black border border-gray-900 rounded-xs">
                        <span className="text-white text-[10px] max-w-[70%] truncate font-mono text-gold-400 block p-0.5">
                          {activeChapter.terminalCommand}
                        </span>
                        <button
                          onClick={() => handleCommandSimulate(activeChapter.terminalCommand!)}
                          className="px-2.5 py-1 bg-gold-500 hover:bg-gold-600 text-black text-[9px] font-bold uppercase rounded-xs tracking-wider transition-all"
                        >
                          Execute Payload
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual input form box */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCommandSimulate(terminalInput);
                    }}
                    className="p-3 bg-gray-950 border-t border-gray-900 flex items-center rounded-b-sm"
                  >
                    <span className="text-gray-500 mr-1.5 text-[11px] font-bold">$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Type custom verification command payload..."
                      className="w-full bg-transparent p-1 focus:outline-none text-[11px] text-green-400 placeholder:text-gray-700 font-mono"
                    />
                  </form>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}
