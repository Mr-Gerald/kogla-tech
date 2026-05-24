import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  UserPlus,
  BookOpenCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_PATHS, AcademyChapter, AcademyModule } from '../data/academyContent';

export default function StudyRoom() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile, completeRoom } = useAuth();

  // Load active path (default to cybersecurity if slug not provided or unmatched)
  const pathSlug = slug || 'advanced-cybersecurity';
  const activePath = ACADEMY_PATHS[pathSlug] || ACADEMY_PATHS['advanced-cybersecurity'];

  // Track active module and active chapter
  const [activeModIdx, setActiveModIdx] = useState(0);
  const [activeChapIdx, setActiveChapIdx] = useState(0);

  // Terminal state simulator
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  
  // Interactive quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  const activeModule = activePath.modules[activeModIdx] || activePath.modules[0];
  const activeChapter = activeModule?.chapters[activeChapIdx] || activeModule?.chapters[0];

  // Reset quiz states when chapter shifts
  useEffect(() => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizCorrect(null);
    setTerminalHistory([
      `KOGLA OS Security Shell v4.0.2 [Path: ${activePath.title}]`,
      `Telemetry loaded. Ready for dynamic commands execution.`,
      `Suggested instruction for module: "${activeChapter?.terminalCommand || 'help'}"`
    ]);
  }, [activePath, activeModIdx, activeChapIdx]);

  if (!activeChapter) {
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
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === activeChapter.quiz.correctIndex;
    setQuizCorrect(isCorrect);
    setQuizSubmitted(true);

    if (isCorrect) {
      setTerminalHistory(prev => [
        ...prev, 
        `[ACADEMY EXAM COMPLETED] Answer verified. Authenticating credits transfer...`,
        `[OK] Transfer complete: +${activeChapter.xpReward} XP written securely to database.`
      ]);
      // Execute live write to Firestore
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

  // Navigating between chapters
  const handlePrev = () => {
    if (activeChapIdx > 0) {
      setActiveChapIdx(activeChapIdx - 1);
    } else if (activeModIdx > 0) {
      const prevMod = activePath.modules[activeModIdx - 1];
      setActiveModIdx(activeModIdx - 1);
      setActiveChapIdx(prevMod.chapters.length - 1);
    }
  };

  const handleNext = () => {
    if (activeChapIdx < activeModule.chapters.length - 1) {
      setActiveChapIdx(activeChapIdx + 1);
    } else if (activeModIdx < activePath.modules.length - 1) {
      setActiveModIdx(activeModIdx + 1);
      setActiveChapIdx(0);
    }
  };

  const isCompleted = profile?.completedRooms?.includes(activeChapter.id);

  return (
    <div className="pt-24 min-h-screen bg-black text-gray-100 flex flex-col lg:flex-row font-sans">
      
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

        // 2. LOGGED IN MASTER STUDY WORKSPACE
        <>
          {/* LEFT SIDEBAR: Syllabus & Progress mapping */}
          <div className="w-full lg:w-80 bg-gray-950 border-r border-gray-900 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-900">
              <Link 
                to="/academy" 
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gold-500 text-[10px] uppercase font-mono tracking-wider transition-colors mb-4"
              >
                <ArrowLeft size={12} /> Back to core catalog
              </Link>

              <div className="space-y-1">
                <span className="text-gold-500 text-[9px] uppercase tracking-widest font-mono font-bold block">
                  Active Study Track
                </span>
                <span className="text-white text-sm font-display font-medium uppercase tracking-wide block">
                  {activePath.title}
                </span>
              </div>
            </div>

            {/* Path Selection Dropdown inside Study Workspace */}
            <div className="p-4 border-b border-gray-900">
              <label className="block text-[8px] text-gray-500 uppercase font-mono mb-1.5">Switch Learning Modules</label>
              <select 
                value={pathSlug}
                onChange={(e) => navigate(`/study/${e.target.value}`)}
                className="w-full p-2.5 bg-black border border-gray-900 text-[11px] font-mono text-gray-300 focus:border-gold-500 focus:outline-none"
              >
                {Object.values(ACADEMY_PATHS).map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Interactive Modules Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activePath.modules.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-2">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold border-b border-gray-900 pb-1.5">
                    {mod.title}
                  </h4>
                  <div className="space-y-1">
                    {mod.chapters.map((chap, chapIdx) => {
                      const chapCompleted = profile?.completedRooms?.includes(chap.id);
                      const isCurrent = activeModIdx === modIdx && activeChapIdx === chapIdx;

                      return (
                        <button
                          key={chap.id}
                          onClick={() => {
                            setActiveModIdx(modIdx);
                            setActiveChapIdx(chapIdx);
                          }}
                          className={`w-full text-left p-2.5 flex items-center justify-between text-xs transition-colors rounded-sm ${isCurrent ? 'bg-gold-500/10 border-l-2 border-gold-500 text-white' : 'hover:bg-gray-901 text-gray-400'}`}
                        >
                          <div className="space-y-0.5 max-w-[85%]">
                            <span className="block text-[9px] text-gold-500 font-mono">Room {modIdx * 10 + chapIdx + 1}</span>
                            <span className="block truncate font-medium text-[11px]">{chap.title.replace(`Room ${modIdx * 10 + chapIdx + 1}: `, '')}</span>
                          </div>
                          {chapCompleted ? (
                            <CheckCircle2 size={13} className="text-gold-500 shrink-0" />
                          ) : (
                            <ChevronRight size={10} className="text-gray-600 shrink-0 font-bold" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Statistics Indicator */}
            <div className="p-4 bg-black border-t border-gray-900 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-gray-400">
                <span>Core Profile:</span>
                <span className="text-white font-bold">{profile.name}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Accrued XP:</span>
                <span className="text-gold-500 font-bold">{profile.xp || 0} XP</span>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT WORKSPACE PANEL */}
          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
            
            {/* STUDY READING ZONE */}
            <div className="flex-1 p-6 md:p-8 space-y-8 border-b md:border-b-0 md:border-r border-gray-900 overflow-y-auto max-w-3xl">
              
              {/* Header Info */}
              <div className="flex justify-between items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-400 text-[10px] rounded-sm font-mono uppercase">
                  {activeChapter.difficulty} Module
                </span>
                <div className="flex items-center gap-1.5 font-mono text-gold-500 text-[11px] font-bold">
                  <Coins size={12} /> +{activeChapter.xpReward} XP Reward
                </div>
              </div>

              {/* Title Block */}
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-semibold text-white uppercase tracking-wider">
                  {activeChapter.title}
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-wide">
                  {activeChapter.subtitle}
                </p>
              </div>

              {/* Detailed Readout Core Content */}
              <div className="prose prose-invert prose-xs text-gray-300 leading-relaxed max-w-none text-xs md:text-sm font-sans space-y-6">
                {/* Visual Content representation splits by newlines to keep beautiful UI layout */}
                {activeChapter.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('```')) {
                    const code = paragraph.replace(/```[a-z]*/g, '').trim();
                    return (
                      <div key={index} className="p-4 bg-black border border-gray-900 rounded-sm font-mono text-[11px] text-gray-400 overflow-x-auto my-4 max-h-[400px]">
                        <pre>{code}</pre>
                      </div>
                    );
                  }
                  if (paragraph.startsWith('###')) {
                    return (
                      <h3 key={index} className="text-sm md:text-base font-display font-bold uppercase text-white mt-6 border-b border-gray-900 pb-2">
                        {paragraph.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>

              {/* INTERACTIVE STUDY TESTING EXAM QUIZ SECTION */}
              <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                  <HelpCircle size={15} className="text-gold-500" />
                  <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                    Compartment Integration Verification
                  </h4>
                </div>

                <p className="text-xs text-gray-300 font-medium">
                  {activeChapter.quiz.question}
                </p>

                <div className="space-y-2.5">
                  {activeChapter.quiz.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === activeChapter.quiz.correctIndex;
                    
                    let bgBorderClass = "border-gray-900 hover:border-gold-500/30 text-gray-400 bg-black";
                    if (isSelected) {
                      bgBorderClass = "border-gold-500 bg-gold-500/5 text-gold-500";
                    }
                    if (quizSubmitted) {
                      if (isCorrectOption) {
                        bgBorderClass = "border-green-500 bg-green-500/10 text-green-400";
                      } else if (isSelected) {
                        bgBorderClass = "border-red-500 bg-red-500/10 text-red-400";
                      } else {
                        bgBorderClass = "border-gray-900 text-gray-600 cursor-not-allowed bg-black";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-3.5 border rounded-sm text-xs transition-all font-mono flex items-center justify-between ${bgBorderClass}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrectOption && (
                          <span className="text-[10px] text-green-550 font-bold uppercase">[Correct]</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleQuizCheck}
                    className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/20 disabled:text-gray-800 disabled:cursor-not-allowed text-black font-semibold text-xs tracking-wider uppercase font-display rounded-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    Check Response Patterns <Play size={10} />
                  </button>
                ) : (
                  <div className="p-4 bg-black border border-gray-900 text-xs text-gray-400 font-mono leading-relaxed space-y-2">
                    <span className="text-white block font-bold uppercase">REMEDIATION DETAILS:</span>
                    <p>{activeChapter.quiz.explanation}</p>
                    {quizCorrect ? (
                      <span className="text-green-500 font-bold uppercase flex items-center gap-1 mt-2 text-[10px]">
                        <Sparkles size={11} /> CHAPTER VERIFIED. REWARD REDEEMED SUCCESSFULLY.
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setSelectedOption(null);
                          setQuizCorrect(null);
                        }}
                        className="text-gold-500 hover:underline uppercase block text-[10px] tracking-wider font-bold mt-2"
                      >
                        [RE-ATTEMPT QUESTION COMPARTMENT]
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center border-t border-gray-900 pt-6">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 hover:bg-gray-901 border border-gray-801 text-gray-400 hover:text-white text-xs font-mono rounded-sm transition-colors uppercase disabled:opacity-30 flex items-center gap-1"
                >
                  <ArrowLeft size={12} /> Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 hover:bg-gray-901 border border-gray-810 text-gray-400 hover:text-white text-xs font-mono rounded-sm transition-colors uppercase disabled:opacity-30 flex items-center gap-1"
                >
                  Next <ArrowRight size={12} />
                </button>
              </div>

            </div>

            {/* RIGHT SIDE WORKSPACE BAR: Custom Shell Terminal Environment */}
            <div className="w-full md:w-80 bg-black border-t md:border-t-0 border-l border-gray-900 flex flex-col shrink-0 text-xs font-mono">
              <div className="p-3 bg-gray-950 border-b border-gray-900 flex justify-between items-center text-[10px] text-gray-400">
                <span className="flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-widest text-gold-500">
                  <Terminal size={12} /> Shell Processor
                </span>
                <span className="text-[9px] uppercase">sh-4.2#</span>
              </div>

              {/* History output screen */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[250px] max-h-[400px] md:max-h-none overflow-x-hidden text-green-500 font-mono text-[11px] leading-relaxed">
                {terminalHistory.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap break-all border-b border-gray-950/20 pb-1.5 last:border-0">
                    {line}
                  </div>
                ))}
              </div>

              {/* Suggestion command payload box */}
              {activeChapter.terminalCommand && (
                <div className="p-3 bg-gray-950/50 border-t border-gray-900 space-y-2">
                  <span className="text-[9px] text-gray-500 uppercase block tracking-wider font-bold">Recommended Payload:</span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-black border border-gray-900 rounded-sm">
                    <span className="text-white text-[10px] max-w-[80%] truncate font-bold text-gold-500">
                      {activeChapter.terminalCommand}
                    </span>
                    <button
                      onClick={() => handleCommandSimulate(activeChapter.terminalCommand!)}
                      className="px-2 py-0.5 bg-gold-500 hover:bg-gold-650 text-black text-[9px] font-bold uppercase rounded-xs tracking-wider"
                    >
                      Deploy
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCommandSimulate(terminalInput);
                }}
                className="p-2 bg-gray-950 border-t border-gray-900 flex"
              >
                <span className="text-gray-500 mr-1 text-[11px] mt-1.5">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type cargo payload command..."
                  className="w-full bg-transparent p-1.5 focus:outline-none text-[11px] text-green-400 placeholder:text-gray-800"
                />
              </form>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
