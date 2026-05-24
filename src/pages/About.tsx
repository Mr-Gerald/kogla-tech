import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Cpu, 
  BookOpen, 
  Award, 
  Layers, 
  Terminal, 
  Globe, 
  Zap, 
  Users, 
  TrendingUp, 
  Activity, 
  ArrowUpRight 
} from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: <Cpu size={20} className="text-gold-500" />,
      title: "Enterprise Solutions Engineering",
      desc: "Our Solutions division engineers secure sovereign cloud architectures, bespoke ERP adapters, and high-performance Web 19/mobile platforms designed to perform flawlessly under maximum transactional volume."
    },
    {
      icon: <BookOpen size={20} className="text-gold-500" />,
      title: "Advanced Tech Academy",
      desc: "Kogla Tech Academy serves as an elite talent refinery, producing world-class engineers through rigorous, curriculum-intensive cohorts. Our graduates are deployed across modern distributed systems environments globally."
    },
    {
      icon: <Shield size={20} className="text-gold-500" />,
      title: "Zero-Trust Cybersecurity Labs",
      desc: "Operating directly at system margins, our Security division leverages eBPF telemetry hooks and post-quantum cryptography key-encapsulation algorithms to secure high-value nodes and client cloud perimeters."
    },
    {
      icon: <Layers size={20} className="text-gold-500" />,
      title: "AI Research & Cognitive Automation",
      desc: "From LLM parallelization and AWQ/FP8 weight optimizations to autonomous agentic schedulers with transaction-safe rollbacks, our labs push forward cutting-edge operational intelligence models."
    }
  ];

  const metrics = [
    { label: "Active Collaborations", value: "1,000+" },
    { label: "Certified Engineers", value: "250+" },
    { label: "Sovereign Node Ingress", value: "1.2 Tbps" },
    { label: "Deployment Success SLA", value: "99.999%" }
  ];

  const values = [
    {
      title: "Architectural Integrity",
      desc: "We completely reject generic templates, low-fidelity code sandboxes, and unoptimized logic. Every system we build represents pristine craftsmanship, extreme type-safety, and optimized performance profiles."
    },
    {
      title: "Sovereign & Compliant Operations",
      desc: "We build secure data systems keeping crucial resources separated matching stringent regulations (GDPR, ISO 27001), ensuring client intellectual data yields maximal utility without exposure risks."
    },
    {
      title: "Hyper-Velocity Execution",
      desc: "In high-stakes corporate environments, latency translates to real-world financial loss. All our workflows, rendering stacks, and cognitive systems are tuned for lightning-fast sub-second operational execution cycles."
    }
  ];

  return (
    <div className="pt-32 px-6 pb-24 max-w-6xl mx-auto text-gray-100 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-16"
      >
        {/* Dynamic Headings & Introductory Statement */}
        <div className="border-b border-gray-900 pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display mb-6 font-bold">
            <Award size={11} /> Enterprise Technology Ecosystem
          </div>
          <h1 className="text-4xl md:text-7xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-6 tracking-tight">
            KOGLA <span className="text-gold-500">TECH</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-xl max-w-4xl leading-relaxed uppercase tracking-wider font-mono">
            ENGINEERING THE PARADIGM OF ADVANCED COGNITIVE AUTOMATIONS, ULTRA-SECURE ZERO-TRUST RUNTIMES, AND HIGH-PERFORMANCE GLOBAL ENTERPRISE WEB STRUCTURES.
          </p>
        </div>

        {/* Corporate Profile: Full Detailed Genesis */}
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-gold-500 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Corporate Genesis & Visionary Mandate
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-gray-400 leading-relaxed">
              <p>
                Founded at the intersection of complex high-throughput engineering and strict organizational security, **Kogla Tech** has established itself as an absolute standard of technological execution. What started as an aggressive research initiative targeting model quantization parameters and system bottleneck reductions has evolved into a global conglomerate across multiple digital horizons.
              </p>
              <p>
                Our structure integrates four primary divisions: our Solutions Suite, which deploys custom multi-region microservices and native mobile ecosystems; the Kogla Tech Academy, focusing on turning ambitious programmers into elite full-stack system architects; our Cyber Defense labs, protecting system environments from modern threats; and our AI Research Hub, engineering optimized LLM infrastructures and self-healing multi-agent pipelines.
              </p>
              <p>
                We do not build typical web applications. Our entire methodology is driven by absolute determinism—replacing brittle framework bloat with highly optimized, type-safe configurations. Whether orchestrating decentralized database sync states or deploying secure hardware-enclave authorization vectors, our teams ensure every parameter guarantees seamless transaction stability and unmatched performance indices.
              </p>
            </div>
          </div>

          {/* Mission and Vision Bento Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/10 transition-all">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Globe size={14} className="text-gold-500" /> The Mission
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-mono">
                To build, secure, and accelerate global enterprise runtime systems. We bridge standard technological applications with high-velocity, sovereign computing pipelines, cultivating a highly technical network of elite system architects globally.
              </p>
            </div>

            <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/10 transition-all">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <TrendingUp size={14} className="text-gold-500" /> The Vision
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-mono">
                To continuously scale our high-impact sovereign model across international technology clusters, transforming legacy administrative operations into robust autonomous frameworks while setting the standard for Level-4 compliance interfaces.
              </p>
            </div>
          </div>
        </div>

        {/* Real World Impact Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 border-t border-gray-900">
          {metrics.map((metric, i) => (
            <div key={i} className="p-5 bg-gradient-to-b from-gray-950 to-black border border-gray-900 rounded-sm text-center hover:border-gold-500/20 transition-all">
              <div className="text-xl md:text-3xl font-display font-bold text-gold-500 mb-1">{metric.value}</div>
              <div className="text-[9px] md:text-[10px] text-gray-500 font-mono tracking-widest uppercase">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Operational Pillars Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-gold-500 font-mono flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Our Pillars of Excellence
            </h2>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-mono">The core structural arms of the Kogla Tech ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="p-6 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/30 group transition-all duration-300">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-gold-500/5 group-hover:bg-gold-500/10 border border-gold-500/10 rounded-sm shrink-0 transition-all">
                    {pillar.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider group-hover:text-gold-500 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership and Operational Values section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-gold-500 font-mono flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Values & Engineering Mandates
            </h2>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-mono">Guidelines that dictate our standard of delivery across all products.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((val, idx) => (
              <div key={idx} className="p-6 bg-gray-950 border border-gray-950 hover:border-gray-900 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-gold-500 bg-gold-500/5 px-2 py-0.5 border border-gold-500/10 rounded-sm tracking-wider uppercase">MANDATE-0{idx + 1}</span>
                  <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">{val.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{val.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-900 text-[9px] font-mono text-gray-500 flex items-center justify-between">
                  <span>SYSTEM EXECUTION RECORD</span>
                  <span className="text-gold-500">VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Footer Box */}
        <div className="p-6 bg-black border border-gray-900 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 font-mono text-xs text-gray-400">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-1.5 text-white font-bold text-[10px] uppercase tracking-widest">
              <Shield size={12} className="text-gold-500" /> Operational Compliance Code: COG-SEC-77
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Kogla Tech operates under level-4 secure network protocols. Critical databases are distributed and insulated from public routes. Standard communications are wrapped in post-quantum lattice-key tunnels (Kyber v1), matching global GDPR & sovereign data governance directives perfectly.
            </p>
          </div>
          <span className="shrink-0 px-3 py-1 bg-gold-500/15 border border-gold-500/40 text-gold-500 text-[10px] uppercase font-bold tracking-widest rounded-sm">
            SECURE INFRASTRUCTURE ACTIVE
          </span>
        </div>

      </motion.div>
    </div>
  );
}
