import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PATHS = [
  {
    slug: 'advanced-cybersecurity',
    title: 'Advanced Cybersecurity & Kernel Safeguards',
    description: 'Bypass old signature defenses. Code low-level assembly checks, deploy eBPF kernel triggers, and compile post-quantum lattice network tunnels.',
    difficulty: 'Elite',
    duration: '12 Weeks',
    xpValue: 800,
    icon: Shield,
    accent: 'border-red-500/10 hover:border-red-500/40 text-red-400'
  },
  {
    slug: 'full-stack-engineering',
    title: 'Full-Stack Systems Engineering',
    description: 'Architect complex distributed state machines. Deep dive straight into React 19 concurrent cycles, websocket pools, database clusters, and memory caching.',
    difficulty: 'Advanced',
    duration: '12 Weeks',
    xpValue: 380,
    icon: Cpu,
    accent: 'border-blue-500/10 hover:border-blue-500/40 text-blue-400'
  },
  {
    slug: 'machine-learning-operations',
    title: 'MLOps & Quantized Model Pipelines',
    description: 'Bridge ML math and high-throughput systems. Calibrate FP16 neural weights into INT8/INT4 using AWQ and optimize latency via NVIDIA Triton instances.',
    difficulty: 'Extreme',
    duration: '14 Weeks',
    xpValue: 160,
    icon: Brain,
    accent: 'border-purple-500/10 hover:border-purple-500/40 text-purple-400'
  },
  {
    slug: 'ui-ux-engineering',
    title: 'UI/UX Fluid Engineering & Physics',
    description: 'Construct fluid responsive coordinate interfaces. Learn motion spring theory (friction, mass, tension), strict optical grids, and WCAG accessibility standards.',
    difficulty: 'Intermediate',
    duration: '10 Weeks',
    xpValue: 100,
    icon: Layers,
    accent: 'border-amber-500/10 hover:border-amber-500/40 text-amber-400'
  },
  {
    slug: 'cloud-native-devops',
    title: 'Cloud-Native DevOps & Global Scale',
    description: 'Orchestrate self-healing, multi-node cloud clusters. Coordinate global deployments with Terraform declarative code setups, Kubernetes meshes, and CDNs.',
    difficulty: 'Advanced',
    duration: '12 Weeks',
    xpValue: 140,
    icon: Globe,
    accent: 'border-emerald-500/10 hover:border-emerald-500/40 text-emerald-400'
  }
];

export default function Academy() {
  const { profile } = useAuth();

  return (
    <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto font-sans text-gray-100">
      
      {/* Page Title & Headers */}
      <div className="border-b border-gray-900 pb-10 mb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-mono mb-4">
          <Award size={11} /> Kogla Training Academy Cores
        </div>
        <h1 className="text-4xl md:text-7xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-4 uppercase mt-2">
          Kogla <span className="text-gold-500">Academy</span>
        </h1>
        <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider font-mono max-w-3xl mx-auto leading-relaxed">
          ELITE MULTI-PATH SYLLABUSES INTEGRATING INTENSIVE SYSTEMS AUDITS, HEAVY-LOAD STATE ENGINE OPTIMIZATIONS, AND INTERACTIVE WEB WORKSPACES.
        </p>
      </div>

      {/* Gamification Dashboard Card if Authenticated */}
      {profile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-gray-950 via-black to-gray-950 border border-gold-500/20 rounded-sm mb-12 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white flex items-center justify-center md:justify-start gap-1.5">
              <CheckCircle2 className="text-gold-500" size={15} /> Academic Core Synchronized
            </h3>
            <p className="text-[11px] text-gray-400 font-mono tracking-wide leading-relaxed uppercase">
              Developer Profile: <b className="text-white">{profile.name}</b> holds clearance of <b className="text-gold-500 font-bold">{profile.xp || 0} XP</b> across <span className="text-white">{(profile.completedRooms || []).length} completed compartments</span>.
            </p>
          </div>
          <Link 
            to="/study"
            className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-[0.98] transition-all text-black font-semibold text-xs uppercase tracking-widest font-display rounded-sm shrink-0 flex items-center gap-2"
          >
            Launch Interactive Workspace <Terminal size={12} />
          </Link>
        </motion.div>
      )}

      {/* Grid of 5 Modules Options */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PATHS.map((path, idx) => {
          const IconComponent = path.icon;

          return (
            <motion.div 
              key={path.slug} 
              className={`p-6 bg-gray-950 border rounded-sm flex flex-col justify-between hover:scale-[1.01] transition-all group ${path.accent}`}
            >
              <div className="space-y-4">
                {/* Path Accent & Header Icon */}
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-black border border-gray-901 rounded-sm shrink-0">
                    <IconComponent size={20} className="text-gold-500" />
                  </div>
                  <div className="flex flex-col text-right font-mono text-[9px] uppercase tracking-wider text-gray-500 space-y-0.5">
                    <span>{path.duration}</span>
                    <span>{path.difficulty} TIER</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-display font-semibold text-white tracking-wide group-hover:text-gold-500 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    {path.description}
                  </p>
                </div>
              </div>

              {/* Action launchers buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-4 border-t border-gray-901">
                <Link 
                  to={`/study/${path.slug}`} 
                  className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 select-none text-black font-semibold font-display text-center text-[10px] tracking-widest uppercase transition-colors rounded-xs flex items-center justify-center gap-1.5"
                >
                  <Terminal size={11} /> Study Online
                </Link>
                <Link 
                  to={`/academy/${path.slug}`} 
                  className="flex-1 py-2.5 bg-transparent hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-white font-mono text-center text-[10px] tracking-widest uppercase transition-colors rounded-xs"
                >
                  Syllabus Details
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
