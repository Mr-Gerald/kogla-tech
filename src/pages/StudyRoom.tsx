import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Terminal as TerminalIcon, 
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
  Copy,
  Check,
  Cpu,
  RefreshCw,
  Clock,
  ExternalLink,
  MessageCircle,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ACADEMY_PATHS, AcademyChapter } from '../data/academyContent';

// Helper component to copy code snippet to clipboard with success state
function CodeCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-emerald-400 text-zinc-400 transition-colors flex items-center justify-center"
      title="Copy to clipboard"
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
}

// Custom parser to transform raw markdown blocks into extremely beautiful, structured React components
function renderCleanContent(content: string) {
  const paragraphs = content.split('\n\n');
  return paragraphs.map((paragraph, index) => {
    const cleanPara = paragraph.trim();
    if (!cleanPara) return null;

    // Handle code blocks (e.g., ```rust ... ```)
    if (cleanPara.startsWith('```')) {
      const lines = cleanPara.split('\n');
      const lang = lines[0].replace('```', '').trim() || 'rust';
      const code = lines.slice(1, lines.length - 1).join('\n');
      return (
        <div key={index} className="my-6 border border-zinc-850 rounded-lg bg-[#070809] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d0e11] border-b border-zinc-850 font-mono text-[10px] select-none text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/60"></span>
              <span className="w-2 h-2 rounded-full bg-yellow-500/60"></span>
              <span className="w-2 h-2 rounded-full bg-green-500/60"></span>
              <span className="ml-2 lowercase font-sans text-xs text-zinc-500">{lang} static reference</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">secured reference code</span>
              <CodeCopyButton text={code} />
            </div>
          </div>
          <div className="p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-[350px] leading-relaxed select-text">
            <pre className="whitespace-pre">{code}</pre>
          </div>
        </div>
      );
    }

    // Handle high-level classroom markers (removes any ugly '#' or raw syntax headers)
    if (cleanPara.startsWith('### CLASSROOM LESSON:') || cleanPara.startsWith('### Interactive Section:')) {
      const headingText = cleanPara.substring(cleanPara.indexOf(':') + 1).trim();
      return (
        <div key={index} className="pb-3 border-b border-zinc-850 mb-6 mt-4">
          <span className="text-[9px] text-[#10b981] font-mono font-bold tracking-widest uppercase block mb-1">
            CLASSROOM TASK THEORY
          </span>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            {headingText}
          </h2>
        </div>
      );
    }

    // General level-3 headers
    if (cleanPara.startsWith('###')) {
      return (
        <h3 key={index} className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-widest mt-6 mb-3 border-l-2 border-emerald-500 pl-3">
          {cleanPara.replace('###', '').trim()}
        </h3>
      );
    }

    // Blockquotes with elegant side accent
    if (cleanPara.startsWith('>')) {
      const quote = cleanPara.replace(/^>\s*"/, '').replace(/"\s*$/, '').replace(/^>\s*/, '').trim();
      return (
        <blockquote key={index} className="border-l-2 border-[#10b981] pl-4 py-1.5 my-5 italic text-xs md:text-sm text-zinc-400 leading-relaxed bg-zinc-950/20 rounded-r-sm">
          "{quote}"
        </blockquote>
      );
    }

    // Inline structural line dividers
    if (cleanPara === '---') {
      return <hr key={index} className="border-zinc-850 my-6" />;
    }

    // 💡 Concept Foundations callout block (No '#' displays)
    if (cleanPara.startsWith('#### 💡')) {
      const body = cleanPara.replace('#### 💡', '').trim();
      return (
        <div key={index} className="my-6 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[9px] font-bold tracking-wider uppercase">
            <BookOpen size={12} /> Cognitive Foundations Insight
          </div>
          <p className="text-zinc-300 text-xs md:text-sm leading-relaxed font-sans">
            {body}
          </p>
        </div>
      );
    }

    // 🧠 Under the Hood Spec Sheet (No '#' displays)
    if (cleanPara.startsWith('#### 🧠')) {
      const body = cleanPara.replace('#### 🧠', '').trim();
      return (
        <div key={index} className="my-6 p-5 bg-zinc-950/80 border border-zinc-850 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[9px] font-bold tracking-wider uppercase">
            <Cpu size={12} className="text-[#10b981]" /> Deep-Dive Engineering Mechanics
          </div>
          <div className="text-zinc-300 text-xs md:text-sm leading-relaxed font-sans space-y-2">
            {body.split('\n').map((line, idx) => {
              const cleanLine = line.trim();
              if (cleanLine.startsWith('•')) {
                return (
                  <div key={idx} className="flex gap-2 items-start pl-1">
                    <span className="text-[#10b981] mt-1 select-none font-bold">•</span>
                    <span className="text-zinc-300 font-medium">{cleanLine.substring(1).trim()}</span>
                  </div>
                );
              }
              return <p key={idx} className="text-zinc-400">{cleanLine}</p>;
            })}
          </div>
        </div>
      );
    }

    // 💻 Verification Checklist (No '#' displays)
    if (cleanPara.startsWith('#### 💻')) {
      const body = cleanPara.replace('#### 💻', '').trim();
      return (
        <div key={index} className="my-6 p-5 bg-[#060709] border border-zinc-850 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[9px] font-bold tracking-wider uppercase">
            <CheckCircle2 size={12} /> System Verification Checklist
          </div>
          <div className="text-zinc-400 text-xs font-mono leading-relaxed space-y-2 select-text">
            {body.split('\n').map((line, idx) => {
              const cleanLine = line.trim();
              if (cleanLine.startsWith('•')) {
                return (
                  <div key={idx} className="flex gap-2.5 items-start pl-1">
                    <span className="text-[#10b981] mt-0.5 select-none text-[11px]">✓</span>
                    <span className="text-zinc-300 font-sans text-xs">{cleanLine.substring(1).trim()}</span>
                  </div>
                );
              }
              return <p key={idx} className="text-zinc-450 font-sans text-xs">{cleanLine}</p>;
            })}
          </div>
        </div>
      );
    }

    // Milestone Instruction Lists
    if (cleanPara.startsWith('**Academic Milestone Instruction**:')) {
      const lines = cleanPara.split('\n');
      return (
        <div key={index} className="my-6 p-5 bg-[#0a0a0c] border border-zinc-800 rounded-lg space-y-2">
          <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold block">
            Recommended Action Plan
          </span>
          <ol className="list-decimal pl-4 text-xs text-zinc-400 space-y-1.5 font-sans leading-relaxed">
            {lines.slice(1).map((line, idx) => (
              <li key={idx} className="text-zinc-400">
                {line.replace(/^\d+\.\s+/, '').trim()}
              </li>
            ))}
          </ol>
        </div>
      );
    }

    // General fallback block headings
    if (cleanPara.startsWith('####')) {
      return (
        <h4 key={index} className="text-xs font-semibold text-zinc-200 uppercase tracking-wider my-4 font-mono">
          {cleanPara.replace('####', '').trim()}
        </h4>
      );
    }

    // Default clean paragraphs with great typography spacing
    return (
      <p key={index} className="leading-relaxed text-zinc-300 text-xs md:text-sm font-sans tracking-wide">
        {cleanPara}
      </p>
    );
  });
}

export default function StudyRoom() {
  const { slug, roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile, completeRoom } = useAuth();
  const { config } = useSiteConfig();
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Load active path with alias mapping (default to cybersecurity if slug not provided or unmatched)
  const rawSlug = slug || 'advanced-cybersecurity';
  const pathSlug = (function(s) {
    const clean = s ? s.toLowerCase().trim() : '';
    if (clean === 'cybersecurity' || clean === 'advanced-cybersecurity') return 'advanced-cybersecurity';
    if (clean === 'web-development' || clean === 'full-stack-engineering') return 'full-stack-engineering';
    if (clean === 'ai-automation' || clean === 'machine-learning-operations') return 'machine-learning-operations';
    if (clean === 'ui-ux-design' || clean === 'ui-ux-engineering') return 'ui-ux-engineering';
    if (clean === 'cloud-architecture' || clean === 'cloud-native-devops') return 'cloud-native-devops';
    return clean;
  })(rawSlug);

  const activePath = ACADEMY_PATHS[pathSlug] || ACADEMY_PATHS['advanced-cybersecurity'];

  // Track active module and active chapter
  const [activeModIdx, setActiveModIdx] = useState(0);
  const [activeChapIdx, setActiveChapIdx] = useState(0);

  // Track and save the last visited curriculum path
  useEffect(() => {
    if (pathSlug && pathSlug !== 'web-development') {
      localStorage.setItem('kogla_last_visited_path', pathSlug);
    }
  }, [pathSlug]);

  // Sync active track index and auto-redirect to valid slug if requested on empty path index
  useEffect(() => {
    if (!slug) {
      const lastVisited = localStorage.getItem('kogla_last_visited_path') || 'advanced-cybersecurity';
      navigate(`/study/${lastVisited}`, { replace: true });
    }
  }, [slug, navigate]);

  // Capture unauthenticated target path for authentication redirection
  useEffect(() => {
    if (!user || !profile) {
      sessionStorage.setItem('studyRedirectTo', window.location.pathname);
    }
  }, [user, profile]);

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

  // RESTORE SCROLL INSTANTANEOUSLY ON CHAPTER AND SLUG SHIFTS
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [roomId, slug]);

  // Terminal state simulator
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isTypingSim, setIsTypingSim] = useState(false);
  
  // Interactive quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  const activeModule = activePath ? (activePath.modules[activeModIdx] || activePath.modules[0]) : null;
  const activeChapter = activeModule ? (activeModule.chapters[activeChapIdx] || activeModule.chapters[0]) : null;

  // Auto-scroll terminal history to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // Reset quiz states when chapter shifts
  useEffect(() => {
    if (activeChapter && activePath) {
      setSelectedOption(null);
      setQuizSubmitted(false);
      setQuizCorrect(null);
      setTerminalHistory([
        `KOGLA SECURITY INTERACTIVE ENVIRONMENT v5.1.0 [Loaded Stream: ${activePath.title}]`,
        `Dynamic virtual target sandbox established. All tools connected.`,
        `Initialize your audit by running the suggested command probe below.`
      ]);
    }
  }, [activePath, activeModIdx, activeChapIdx, activeChapter]);

  const isPaidUser = profile?.role === 'admin' || profile?.isPaid === true;

  if (!isPaidUser) {
    return (
      <div className="pt-32 px-6 pb-24 max-w-2xl mx-auto text-center font-sans">
        <div className="p-8 bg-black border border-gold-500/40 rounded-sm shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-400" />
          <div className="w-16 h-16 mx-auto rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-2">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] text-gold-500 font-mono font-bold tracking-widest uppercase bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full">
              Academy Study Room • Enrollment Required
            </span>
            <h1 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
              {activePath?.title || 'Academy Study Module'}
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed font-sans max-w-md mx-auto">
              This interactive study room is part of our accredited curriculum. Enrolled students who have registered and confirmed access can view and complete modules in this workspace.
            </p>
          </div>

          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm text-left font-mono text-[11px] text-gray-400 space-y-2">
            <div className="text-gold-400 font-bold uppercase tracking-wider mb-1">How to Get Instant Access:</div>
            <p>1. Contact our WhatsApp support desk with your registered email and the training track you want.</p>
            <p>2. Complete payment verification with our admissions team.</p>
            <p>3. An administrator will instantly approve your account from the admin portal to unlock all rooms!</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <a 
              href={`https://wa.me/2347012489041?text=${encodeURIComponent(`Hello Kogla Tech, I want to pay and get approved for the Academy Course (${activePath?.title || 'Study Course'}). My Email: ${profile?.email || 'N/A'}. Please guide me on payment!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-widest font-display rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} /> Contact WhatsApp to Pay & Unlock
            </a>
            <Link 
              to="/academy"
              className="py-3 px-6 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-mono text-xs uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!activePath || !activeChapter) {
    return (
      <div className="pt-32 text-center text-zinc-500 font-mono text-xs">
        No active study programs found. <Link to="/academy" className="text-emerald-400 hover:underline">Back to Catalog</Link>
      </div>
    );
  }

  // Handle Command Simulation
  const handleCommandSimulate = (cmd: string) => {
    if (!cmd.trim() || isTypingSim) return;
    const cleanCmd = cmd.trim();
    setIsTypingSim(true);

    // Simulated terminal response mapping
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
    } else if (cleanCmd.toLowerCase().includes('echo') && cleanCmd.toLowerCase().includes('payload')) {
      response = `Written 16 raw bytes to file 'payload'. Hex verification stream: 90 90 31 c0 50 68 2f 2f 73 68 68 2f 62 69 6e 89`;
    } else if (cleanCmd.toLowerCase().includes('ldd') && cleanCmd.toLowerCase().includes('vuln')) {
      response = `linux-vdso.so.1 (0x00007ffeef123000)\nlibc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f3c4db45000)\n/lib64/ld-linux-x86-64.so.2 (0x00007f3c4dd2a000)`;
    } else if (cleanCmd.toLowerCase().includes('gcc') && cleanCmd.toLowerCase().includes('stack-protector')) {
      response = `gcc: compilation success. Bound stack checker protection initialized.\nOutput compiled successfully to '/bin/app'`;
    } else if (cleanCmd.toLowerCase().includes('cat') && (cleanCmd.toLowerCase().includes('va_space') || cleanCmd.toLowerCase().includes('randomize'))) {
      response = `2 (Standard System-Wide Dynamic ASLR Fully Enforced)`;
    } else if (cleanCmd.toLowerCase().includes('ropgadget')) {
      response = `Finding gadgets...\nUnique gadgets found: 3\n0x0000000000401b3d : pop rbx ; ret\n0x0000000000401c10 : pop rax ; ret\n0x00000000004022a1 : mov [rdi], rsi ; ret`;
    } else if (cleanCmd.toLowerCase().includes('redis-cli')) {
      response = `# Server\nredis_version:7.0.5\nused_memory_human:1.82M\nmaxmemory_policy:volatile-lru (Evicting LRU keys)`;
    } else if (cleanCmd.toLowerCase().includes('wscat')) {
      response = `Connected (press CTRL+C to quit)\n< [OK] Connection handshake established.\n< [INFO] Subscription pool initialized successfully.`;
    } else if (cleanCmd.toLowerCase().includes('psql')) {
      response = `QUERY PLAN:\nIndex Scan using idx_users_composite on users  (cost=0.42..8.44 rows=1 width=32)\n  Index Cond: ((org_key = 'kogla_admin'::text) AND (id = 'usr_02'::text))\nPlanning Time: 0.18 ms\nExecution Time: 0.05 ms`;
    } else if (cleanCmd.toLowerCase().includes('node') && cleanCmd.toLowerCase().includes('inspect')) {
      response = `Debugger listening on ws://127.0.0.1:9229/ef42-12aa\nFor help, see: https://nodejs.org/en/docs/inspector\n[HEAP ANALYSIS MODE] Captured garbage collection trace: Heap size cleaned 24MB => 11MB.`;
    } else if (cleanCmd.toLowerCase().includes('help')) {
      response = `Available terminal instructions:\n- ${activeChapter.terminalCommand || 'help'}\n- clear: Purges shell prints\n- ls: Catalogues workspace variables`;
    } else if (cleanCmd.toLowerCase() === 'ls') {
      response = `Makefile   vulnerable_node.c  vulnerable_node   payload.bin   state_manifest.json`;
    } else if (cleanCmd.toLowerCase() === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      setIsTypingSim(false);
      return;
    }

    setTerminalHistory(prev => [...prev, `kogla-sh$ ${cleanCmd}`]);
    
    // Simulate highly precise, cool CLI type delay response
    setTimeout(() => {
      setTerminalHistory(prev => [...prev, response]);
      setIsTypingSim(false);
    }, 450);

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
        `[ACADEMY EXAM SECURED] Correct answer registered. Handshaking XP extraction...`,
        `[OK] XP rewards transfer secured: +${activeChapter.xpReward} XP written successfully.`
      ]);
      if (user && profile) {
        await completeRoom(activeChapter.id, activeChapter.xpReward);
      }
    } else {
      setTerminalHistory(prev => [
        ...prev, 
        `[ACADEMY EXAM EXCEPTION] Diagnostic fail: Answer patterns reject matching index.`
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
    <div className="pt-24 min-h-screen bg-[#08090b] text-zinc-100 font-sans select-none">
      
      {/* 1. CHECK FOR ANONYMOUS SESSIONS LOCKOUT */}
      {!user || !profile ? (
        <div className="w-full min-h-[85vh] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-md bg-zinc-950 border border-zinc-850 rounded-lg text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-400" />
            <Lock className="text-emerald-500 mx-auto mb-5" size={42} />
            <h2 className="text-lg font-display font-medium uppercase tracking-wider text-white mb-2">
              Sign In Required
            </h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">
              Please sign in to your Kogla Tech account or register a profile to access interactive technical labs and course workspaces.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link 
                to="/auth/login" 
                className="py-2.5 bg-[#10b981] hover:bg-[#059669] font-bold text-black text-xs uppercase tracking-widest font-display rounded transition-all text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20"
              >
                <KeyRound size={12} /> Sign In to Access
              </Link>
              <Link 
                to="/auth/signup" 
                className="py-2.5 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs uppercase tracking-widest font-mono rounded transition-all text-center flex items-center justify-center gap-1.5"
              >
                <UserPlus size={12} /> Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      ) : (

        // 2. LOGGED IN MASTER SPACE
        <div className="max-w-7xl mx-auto px-6 pb-20 select-text">

          {/* VIEW A: NO roomId IN URL -> RENDER SYLLABUS OVERVIEW INDEX CONTAINER */}
          {!roomId ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Back to Catalog Breadcrumb */}
              <div>
                <Link 
                  to="/academy" 
                  className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft size={12} /> Back to core catalog
                </Link>
              </div>

              {/* Headings & Premium TryHackMe branding deck */}
              <div className="border-b border-zinc-850 pb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[#10b981] text-[10px] uppercase font-mono tracking-widest font-bold rounded-md">
                  <Award size={11} className="animate-pulse" /> Level-4 Interactive Curriculum
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-semibold text-white tracking-tight uppercase">
                  {activePath.title} Syllabus
                </h1>
                <p className="max-w-4xl text-xs md:text-sm text-zinc-400 font-sans leading-relaxed">
                  Welcome to the virtual knowledge workstation. Operating step-by-step, this curriculum empowers security architects and full-stack engineering leads to audit micro-layers, debug complex events, and test live verification units successfully.
                </p>
              </div>

              {/* Progress & Operational Status Deck Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Progress Card */}
                <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block font-bold mb-1">Course Progress Meter</span>
                    <div className="flex justify-between items-end mb-2.5">
                      <span className="text-white text-base font-semibold font-sans">{progressPercentage}% Completed</span>
                      <span className="text-[10px] text-zinc-400 font-mono font-medium">{completedRoomsCount} of {totalRooms} Completed</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#10b981] transition-all duration-700" 
                      style={{ width: `${progressPercentage}%` }} 
                    />
                  </div>
                </div>

                {/* Account XP Valuations */}
                <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block font-bold mb-1">Earned Study Points</span>
                  <span className="text-xl font-mono font-semibold text-[#10b981] block">
                    {profile.xp || 0} XP Points
                  </span>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1 uppercase">Points saved automatically to your profile.</p>
                </div>

                {/* Academic Profile certificate */}
                <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block font-bold mb-1">Certification Status</span>
                  <span className="text-sm font-sans font-semibold text-white block uppercase">
                    {progressPercentage === 100 ? '👑 Certified Lead Architect' : '⚡ Enrolled Student'}
                  </span>
                  <p className="text-[9px] text-zinc-500 font-mono mt-2 uppercase select-none">Student: {profile.name}</p>
                </div>
              </div>

              {/* Syllabus Calibration Select Form */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-850 rounded-lg">
                <div>
                  <span className="text-[9px] text-zinc-400 font-mono uppercase block font-bold">Curriculum Stream Controller</span>
                  <span className="text-zinc-500 text-xs">Instantly redirect to another premium training curriculum segment.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold select-none">STREAM:</span>
                  <select 
                    value={pathSlug}
                    onChange={(e) => navigate(`/study/${e.target.value}`)}
                    className="p-2 bg-black border border-zinc-800 text-xs font-mono text-[#10b981] font-bold focus:border-[#10b981] focus:outline-none rounded cursor-pointer min-w-[250px]"
                  >
                    {Object.values(ACADEMY_PATHS).map((p) => (
                      <option key={p.id} value={p.id} className="bg-black text-zinc-200">{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TryHackMe-Style Curriculum phases with modules and visual chapters */}
              <div className="space-y-8 select-none">
                {activePath.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="p-6 bg-zinc-950/30 border border-zinc-850 rounded-lg space-y-4">
                    
                    {/* Phase Header */}
                    <div className="border-b border-zinc-850 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] text-[#10b981] font-mono font-bold tracking-widest uppercase block mb-0.5">
                          CURRICULUM MODULE {String(modIdx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-base font-display font-medium text-white uppercase tracking-wide">
                          {mod.title}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 bg-black border border-zinc-850 text-[9px] font-mono text-zinc-400 rounded">
                        Estimated Scope: {mod.chapters.length * 15} Min Code Range
                      </span>
                    </div>

                    {/* Rooms / Chapter Sub-Grid */}
                    <div className="grid md:grid-cols-2 gap-3.5">
                      {mod.chapters.map((chap, chapIdx) => {
                        const chapCompleted = profile?.completedRooms?.includes(chap.id);
                        const roomGlobalNum = modIdx * 10 + chapIdx + 1;

                        return (
                          <Link
                            key={chap.id}
                            to={`/study/${pathSlug}/room/${chap.id}`}
                            className="group block p-4 bg-zinc-950/80 hover:bg-[#0c0d10] border border-zinc-900 hover:border-zinc-805 rounded-lg transition-all text-left relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-0.5 h-full bg-zinc-900 group-hover:bg-[#10b981] transition-all" />
                            
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1.5 max-w-[76%]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] text-[#10b981] font-mono font-bold tracking-wider uppercase">
                                    ROOM {roomGlobalNum}
                                  </span>
                                  <span className={`px-1 text-[8px] font-mono font-bold rounded ${
                                    chap.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                                    chap.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' :
                                    chap.difficulty === 'Advanced' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                                    'bg-red-500/10 text-red-400 border border-red-500/15'
                                  }`}>
                                    {chap.difficulty}
                                  </span>
                                </div>
                                <h4 className="text-xs font-sans font-bold text-white group-hover:text-[#10b981] transition-colors line-clamp-1">
                                  {chap.title.replace(`Room ${roomGlobalNum}: `, '')}
                                </h4>
                                <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 font-sans font-medium">
                                  {chap.subtitle}
                                </p>
                              </div>
                              <div className="text-right space-y-2 shrink-0 flex flex-col items-end">
                                <span className="text-[9px] text-zinc-400 font-mono font-bold block">
                                  +{chap.xpReward} XP
                                </span>
                                {chapCompleted ? (
                                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 border border-emerald-500/15 select-none">
                                    ✓ CLEAR
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-mono font-bold uppercase border border-zinc-800 bg-zinc-900 group-hover:bg-[#10b981] group-hover:text-black group-hover:border-[#10b981] px-2 py-0.5 rounded transition-all select-none tracking-wide text-zinc-400">
                                    LAUNCH →
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

            /* VIEW B: ACTIVE CHAPTER LESSON ROOM (FULLY DUAL COLUMN INTEGRATION WORKSTATION) */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Back breadcrumb navigation row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-zinc-950 border border-zinc-850 p-4 rounded-lg select-none">
                <Link
                  to={`/study/${pathSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black border border-zinc-800 text-zinc-400 hover:text-[#10b981] rounded text-[10px] tracking-widest font-mono uppercase transition-colors"
                >
                  <ArrowLeft size={11} className="text-[#10b981] shrink-0" /> Return to Course Syllabus
                </Link>
                <div className="flex items-center gap-3 text-xs font-mono uppercase text-zinc-400">
                  <span className="text-[#10b981] font-bold">STATION AT:</span> 
                  <span className="text-white font-semibold">Active Room {currentRoomIdx !== -1 ? currentRoomIdx + 1 : 1} of {totalRooms}</span>
                  <span className="text-zinc-700">|</span>
                  <span className="px-1.5 py-0.5 bg-zinc-900 text-[#10b981] text-[9.5px] font-bold rounded border border-zinc-800">Sandboxed Terminal Online</span>
                </div>
              </div>

              {/* Dynamic split screen structure: Left side is text documentation, right side is interactive workspace widget and quiz console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN 1: High quality, beautifully parsed documentation lessons (Saves token limits & ensures professional style) */}
                <div className="lg:col-span-7 xl:col-span-8 bg-[#090a0d]/90 border border-zinc-850 p-6 md:p-8 rounded-lg shadow-xl space-y-8 select-text">
                  
                  {/* Dynamic mini tag dashboard */}
                  <div className="flex justify-between items-center gap-4 pb-3 border-b border-zinc-850 select-none">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] rounded font-mono uppercase font-bold tracking-wide">
                      LEVEL: {activeChapter.difficulty.toUpperCase()} RANGE
                    </span>
                    <div className="flex items-center gap-1 text-mono text-[#10b981] text-xs font-bold leading-none">
                      <Coins size={12} className="animate-spin" style={{ animationDuration: '8s' }} /> <span>+{activeChapter.xpReward} XP CREDITS</span>
                    </div>
                  </div>

                  {/* Room Meta details headings */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#10b981] font-mono uppercase tracking-widest block font-bold">
                      COURSE UNIT SECURED STUDY MODULE
                    </span>
                    <h1 className="text-2xl font-display font-medium text-white tracking-widest uppercase">
                      {activeChapter.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 select-none">
                      <Clock size={11} className="text-zinc-500" />
                      <span className="text-[10px] text-zinc-400 font-sans tracking-wide uppercase font-semibold">
                        {activeChapter.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Clean Content Parser output */}
                  <div className="prose prose-sm leading-relaxed max-w-none text-zinc-300 space-y-6">
                    {renderCleanContent(activeChapter.content)}
                  </div>
                </div>

                {/* COLUMN 2: Living testing workspace console representing the authentic TryHackMe right-side interactive shell and verification quiz */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
                  
                  {/* SUITE A: UNIX Terminal Environment (Directly handles terminalHistory & simulation loops) */}
                  <div className="bg-black border border-zinc-850 rounded-lg shadow-xl overflow-hidden flex flex-col">
                    
                    {/* Header Controls Bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[#0c0d10] border-b border-zinc-850">
                      <div className="flex items-center gap-2">
                        <TerminalIcon size={12} className="text-[#10b981]" />
                        <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                          station_simulator_sh
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#10b981] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                        <span>ACTIVE NODE</span>
                      </div>
                    </div>

                    {/* Terminal text layout log */}
                    <div className="p-4 bg-zinc-950 font-mono text-[10.5px] leading-relaxed text-zinc-300 space-y-2 h-[260px] overflow-y-auto select-text scrollbar-thin">
                      {terminalHistory.map((logLine, logIdx) => {
                        let textClass = "text-zinc-400";
                        if (logLine.startsWith('kogla-sh$')) {
                          textClass = "text-[#10b981] font-semibold";
                        } else if (logLine.startsWith('[OK]') || logLine.includes('success')) {
                          textClass = "text-emerald-400 font-semibold";
                        } else if (logLine.startsWith('[ACADEMY') || logLine.startsWith('gdb') || logLine.startsWith('GNU')) {
                          textClass = "text-indigo-400";
                        } else if (logLine.includes('not found') || logLine.includes('WARNING') || logLine.includes('fail')) {
                          textClass = "text-rose-400";
                        }
                        return (
                          <div key={logIdx} className={`${textClass} whitespace-pre-wrap`}>
                            {logLine}
                          </div>
                        );
                      })}
                      {isTypingSim && (
                        <div className="text-zinc-500 italic animate-pulse">
                          Processing response probe...
                        </div>
                      )}
                      <div ref={terminalBottomRef} />
                    </div>

                    {/* Quick run command badge prompts suggestions */}
                    {activeChapter.terminalCommand && (
                      <div className="px-4 py-2.5 bg-[#0a0b0d] border-t border-zinc-850 flex flex-col gap-1.5 select-none">
                        <span className="text-[8.5px] text-zinc-500 font-mono font-bold tracking-widest uppercase">
                          SUGGESTED TERMINAL COMMAND:
                        </span>
                        <div className="flex items-center justify-between gap-2 overflow-x-hidden">
                          <button
                            onClick={() => handleCommandSimulate(activeChapter.terminalCommand || '')}
                            disabled={isTypingSim}
                            className="bg-black text-left hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-[#10b981] font-mono px-3 py-1.5 rounded flex items-center gap-2 transition-all font-semibold shrink-0 cursor-pointer max-w-full truncate"
                          >
                            <span className="text-[#10b981] shrink-0 select-none">$</span> {activeChapter.terminalCommand}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sandbox actual command prompt interactive keyboard interface */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCommandSimulate(terminalInput);
                      }}
                      className="flex border-t border-zinc-850 bg-[#0a0b0d]"
                    >
                      <span className="pl-4 pr-1 py-3 text-[#10b981] font-mono text-xs select-none">kogla-sh$</span>
                      <input 
                        type="text"
                        value={terminalInput}
                        disabled={isTypingSim}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type standard command (e.g. 'ls', 'help', 'clear')..."
                        className="flex-1 py-1 pr-4 bg-transparent font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none disabled:cursor-not-allowed"
                      />
                    </form>
                  </div>

                  {/* SUITE B: Task challenge response verification section */}
                  <div className="p-6 bg-zinc-950 border border-zinc-850 rounded-lg shadow-xl space-y-4">
                    
                    {/* Console Header */}
                    <div className="flex items-center gap-2 border-b border-zinc-850 pb-3 select-none">
                      <HelpCircle size={14} className="text-[#10b981]" />
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#10b981]">
                        TASK SOLUTION VERIFICATION CONSOLE
                      </h4>
                    </div>

                    {/* Quiz question label */}
                    <div className="space-y-1 pb-1">
                      <span className="text-[8.5px] text-zinc-500 font-mono uppercase font-bold select-none">Verification Challenge question:</span>
                      <p className="text-xs text-zinc-200 font-sans font-semibold leading-relaxed">
                        {activeChapter.quiz.question}
                      </p>
                    </div>

                    {/* Options checkboxes container list */}
                    <div className="grid gap-2 select-none">
                      {activeChapter.quiz.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectOption = idx === activeChapter.quiz.correctIndex;
                        
                        let selectClasses = "border-zinc-850 text-zinc-400 bg-black hover:border-zinc-750";
                        if (isSelected) {
                          selectClasses = "border-[#10b981] bg-emerald-505/10 text-[#10b981] font-bold";
                        }
                        if (quizSubmitted) {
                          if (isCorrectOption) {
                            selectClasses = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold cursor-not-allowed";
                          } else if (isSelected) {
                            selectClasses = "border-rose-500 bg-rose-500/10 text-rose-400 font-bold cursor-not-allowed";
                          } else {
                            selectClasses = "border-zinc-900 text-zinc-600 bg-zinc-950/20 cursor-not-allowed";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedOption(idx)}
                            className={`w-full text-left p-3.5 border rounded-lg text-xs transition-colors font-sans flex items-center justify-between ${selectClasses} cursor-pointer`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrectOption && (
                              <span className="text-[8.5px] text-emerald-400 font-mono font-bold uppercase tracking-wider">[VERIFIED]</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Form submit/explanation state dispatcher */}
                    {!quizSubmitted ? (
                      <button
                        disabled={selectedOption === null}
                        onClick={handleQuizCheck}
                        className="w-full py-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-bold text-xs tracking-widest uppercase font-display rounded-md transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer"
                      >
                        SUBMIT OPTION RESPONSE <Play size={10} />
                      </button>
                    ) : (
                      <div className="p-4 bg-black border border-zinc-850 text-xs text-zinc-400 font-sans leading-relaxed space-y-2.5 rounded-lg select-text">
                        <span className="text-[#10b981] block font-mono font-bold uppercase text-[9px] select-none">
                          CONSTRAINTS SOLUTION EXPLANATION
                        </span>
                        <p className="text-zinc-300 pr-1">{activeChapter.quiz.explanation}</p>
                        
                        {quizCorrect ? (
                          <span className="text-emerald-400 font-mono font-bold uppercase flex items-center gap-1.5 mt-3 text-[9px] select-none">
                            <Sparkles size={11} className="text-[#10b981] animate-bounce" /> CONVERTED: WORKSPACE UNIT COMPLETED SUCCESSFULLY.
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setSelectedOption(null);
                              setQuizCorrect(null);
                            }}
                            className="bg-transparent text-[#10b981] hover:text-[#059669] hover:underline uppercase block text-[9.5px] tracking-wider font-mono font-bold mt-2.5 select-none"
                          >
                            [RE-AUDIT RESPONSE INTERFACE]
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Unified room navigation footer controls inside the column sidebar */}
                  <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-lg flex flex-col gap-3 select-none">
                    <div className="flex justify-between items-center gap-2">
                      <button
                        disabled={!prevRoom}
                        onClick={() => navigate(`/study/${pathSlug}/room/${prevRoom?.id}`)}
                        className="flex-1 py-1.5 bg-black hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white text-[10px] font-mono tracking-wider items-center justify-center gap-1 rounded transition-colors uppercase disabled:opacity-20 disabled:pointer-events-none flex"
                      >
                        <ArrowLeft size={10} /> Prev Room
                      </button>
                      <button
                        disabled={!nextRoom}
                        onClick={() => navigate(`/study/${pathSlug}/room/${nextRoom?.id}`)}
                        className="flex-1 py-1.5 bg-[#10b981] hover:bg-[#059669] text-black border border-[#10b981] text-[10px] font-mono tracking-wider items-center justify-center gap-1 rounded transition-all uppercase disabled:opacity-20 disabled:pointer-events-none flex font-bold"
                      >
                        Next Room <ArrowRight size={10} />
                      </button>
                    </div>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase text-center font-bold tracking-widest pt-1 block">
                      CURRICULUM CHAPTER STEP: {currentRoomIdx !== -1 ? currentRoomIdx + 1 : 1} OF {totalRooms}
                    </span>
                  </div>

                  {/* Celebration module when there is no next room */}
                  {!nextRoom && (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-5 bg-emerald-500/5 border border-[#10b981]/30 rounded-lg text-center space-y-3 select-none"
                    >
                      <Award className="text-[#10b981] mx-auto animate-bounce" size={28} />
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        CONGRATULATIONS - COURSE END SECURED
                      </h3>
                      <p className="text-[10px] text-zinc-400 leading-relaxed max-w-sm mx-auto font-sans">
                        You have fully cleared all validation checkpoints inside the {activePath.title} syllabus scope.
                      </p>
                      <Link 
                        to={`/study/${pathSlug}`} 
                        className="inline-block px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] font-bold text-black text-[10px] uppercase font-mono rounded transition-colors"
                      >
                        Return stream overview
                      </Link>
                    </motion.div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}
