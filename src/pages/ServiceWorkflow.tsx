import { useParams, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Send, CheckSquare, ShieldCheck, Building2, Layers, Cpu, Code, Settings2, BarChart3, CloudLightning, Mail, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { addInquiry } from '../utils/storage';

interface ServiceBlueprint {
  title: string;
  subtitle: string;
  overview: string;
  specifications: { label: string; value: string }[];
  methodology: { step: string; title: string; desc: string }[];
  caseStudy: { focus: string; outcome: string };
  duration: string;
}

const SERVICES_REGISTRY: Record<string, ServiceBlueprint> = {
  'ai-automation': {
    title: 'Enterprise AI Automation & Orchestration',
    subtitle: 'Sovereign agentic workflows, LLM parameter optimization, and secure automation engines.',
    overview: 'Replace fragile manual integrations with stateful, self-healing cognitive automations. Rather than simple script triggers, we deploy multi-agent autonomous coordination loops. These systems run inside secure system boundaries, parsing corporate documents, automating high-throughput inventory workflows, and validating results against deterministic guidelines with zero data leaks.',
    specifications: [
      { label: 'Agent Coordination Uptime', value: '99.99% Stateful Continuity' },
      { label: 'Decision Latency Bound', value: 'Sub-150ms Cognitive Loop' },
      { label: 'Integration Capability', value: 'Legacy ERP, SAP, custom internal SQL bases' },
      { label: 'Security Compliance', value: 'Level-4 Private Token Guard Sandbox' }
    ],
    methodology: [
      { step: 'Phase I', title: 'Workflow Topology Analysis', desc: 'Detailing legacy workflow constraints, database bottlenecks, and processing targets.' },
      { step: 'Phase II', title: 'Deterministic Agent Formulations', desc: 'Developing structured step validation algorithms with automated rollback actions if checks fail.' },
      { step: 'Phase III', title: 'Secure Container Deployments', desc: 'Deploying optimized fine-tuned weights sandboxed within isolated local server clusters.' }
    ],
    caseStudy: {
      focus: 'Multinational Tech Inventory Logistics',
      outcome: 'Fully automated 92% of shipping and sorting state decisions, slashing sync friction by 84% while logging zero operational failures.'
    },
    duration: '4-6 Weeks deployment'
  },
  'cyber-defense-infrastructure': {
    title: 'Sovereign Cyber Defense & eBPF Telemetry',
    subtitle: 'Kernel-level intrusion isolation, zero-trust configurations, and post-quantum keys.',
    overview: 'Traditional defensive software fails because it looks for known virus signatures after damage has occurred. Kogla Tech constructs dynamic security posture matrices directly inside system boundaries. Leveraging fast eBPF hooks at the kernel layer, we monitor syscall commands in real-time, instantly sandboxing altered processes before unauthorized instructions can leak memory layers.',
    specifications: [
      { label: 'Intrusion Block Time', value: '<15ms System Intercept' },
      { label: 'Cryptographic Standard', value: 'Post-Quantum Lattice Kyber & Dilithium' },
      { label: 'Scrubbing Threshold', value: '1.2 Tbps Ingress DDoS mitigation' },
      { label: 'Monitoring Coverage', value: 'Full operating system shell & filesystem event hooks' }
    ],
    methodology: [
      { step: 'Phase I', title: 'System-Level Access Mapping', desc: 'Configuring custom eBPF collectors to detail normal system operation benchmarks.' },
      { step: 'Phase II', title: 'Quantum-Safe Tunnel Deployments', desc: 'Replacing traditional SSL tunnels with Lattice keys to secure server endpoints dynamically.' },
      { step: 'Phase III', title: 'Immutable Runtime Guarding', desc: 'Setting custom secure runtimes to cleanly trap and isolate malicious script commands.' }
    ],
    caseStudy: {
      focus: 'Government Maritime Logistics Cloud',
      outcome: 'Constructed an airtight multi-region private network. Mitigated 4 massive spoofing operations with zero unauthorized access records.'
    },
    duration: '6-8 Weeks deployment'
  },
  'web-development': {
    title: 'High-Performance Multi-Region Web Platforms',
    subtitle: 'Ultra-fast React 19 visual systems, responsive optimization, and resilient backends.',
    overview: 'Your web presence is the front-door of your enterprise. We engineer lightning-fast architectures optimized for perfect score parameters. We completely avoid sluggish bloatware, utilizing raw typescript matrices, custom spatial visual aesthetics with responsive physics-based motion transitions, and resilient multi-db queries yielding unparalleled interface feedback speed.',
    specifications: [
      { label: 'Visual Performance Index', value: '100/100 Core Web Vitals Standard' },
      { label: 'Client Synchronizations', value: 'Sub-5ms multi-region data locks' },
      { label: 'Peak Request Scaling', value: 'Serves 50k requests / second comfortably' },
      { label: 'Framework Stack', value: 'React 19, TypeScript, Tailwind v4, Vite' }
    ],
    methodology: [
      { step: 'Phase I', title: 'High-Contrast Grid Formulation', desc: 'Engineering custom typographic pair scales, spacing rules, and sleek dark palettes.' },
      { step: 'Phase II', title: 'Database Optimization Tuning', desc: 'Materializing analytics, scaling raw index structures, and nesting pipeline caches.' },
      { step: 'Phase III', title: 'Global Edge Package Replications', desc: 'Deploying static bundles across high speed isolated container locations globally.' }
    ],
    caseStudy: {
      focus: 'Financial Settlement Portal',
      outcome: 'Boosted average conversion rates by 42% by reducing load limits down to 240ms while satisfying strict privacy standards.'
    },
    duration: '1-2 Weeks deployment'
  },
  'mobile-app-development': {
    title: 'High-Performance Mobile Architectures',
    subtitle: 'Native Swift/Kotlin systems, biometric safe enclaves, and offline-first storage engines.',
    overview: 'Provide your consumers with beautiful, offline-resilient mobile applications compiled to run native without lag layers. We build Swift and Kotlin architectures that operate seamlessly without a continuous cloud connection, utilizing localized transactional databases that automatically sync up changes when network access returns.',
    specifications: [
      { label: 'Render Refresh Scale', value: 'Constant, stable 120 FPS performance' },
      { label: 'Offline Persistence', value: 'Localized SQLite engine with automated sync conflict solvers' },
      { label: 'Privacy Boundaries', value: 'Biometric authorization structures locked in hardware enclaves' },
      { label: 'Target Platforms', value: 'Apple iOS (Swift), Google Android (Kotlin)' }
    ],
    methodology: [
      { step: 'Phase I', title: 'Touch-Optimized Layout Blueprints', desc: 'Applying strict 44px target sizes, smart spring gestures, and instant layout actions.' },
      { step: 'Phase II', title: 'Resilient Local Sync Engines', desc: 'Coding structured offline states resolving network data collisions cleanly.' },
      { step: 'Phase III', title: 'Secured Build Package Compilation', desc: 'Preparing deployment binary files validated against app store requirements.' }
    ],
    caseStudy: {
      focus: 'Off-Grid Agricultural Asset Registry',
      outcome: 'Empowered 2,500 remote field workers to log hardware assets with zero connectivity, syncing 100% data safely on return.'
    },
    duration: '8-10 Weeks deployment'
  },
  'cloud-solution-hosting': {
    title: 'Sovereign Cloud Hosting & Clusters',
    subtitle: 'Private private-subnet sandboxes, automated elastic autoscaling, and proxy walls.',
    overview: 'Gain complete digital independence. Kogla Tech bypasses generic public hosting structures, building highly isolated, customized private-subnet cloud clusters with automated scaling boundaries. Keep customer databases insulated from general internet nodes, routing inquiries through high-capacity defensive proxy filters and secure SSL/TLS blocks.',
    specifications: [
      { label: 'Uptime Availability SLA', value: '99.999% Seamless Execution guarantee' },
      { label: 'Provision Reaction Time', value: 'Spins up server resources in <5 seconds under spikes' },
      { label: 'Container Isolation', value: 'Airtight MicroVM sandboxing with zero sharing leaks' },
      { label: 'CDN edge endpoints', value: 'Over 120 global edge locations' }
    ],
    methodology: [
      { step: 'Phase I', title: 'Declarative Terraform Design', desc: 'Coding cloud topology configurations deterministically to prevent drift issues.' },
      { step: 'Phase II', title: 'MicroVM Container Packaging', desc: 'Isolating server workloads inside optimized sandboxes scaling dynamically.' },
      { step: 'Phase III', title: 'Advanced routing configurations', desc: 'Setting up DNS failovers, private tunnel layers, and DDoS scrubbing arrays.' }
    ],
    caseStudy: {
      focus: 'Real-time Payment Cleardown Hub',
      outcome: 'Maintained 100% continuous execution status through 3 separate global hosting downtime events via automatic region redirections.'
    },
    duration: '4-5 Weeks deployment'
  }
};

const DEFAULT_BLUEPRINT: ServiceBlueprint = {
  title: 'Elite Specialized Solutions Architecture',
  subtitle: 'Engineered digital operations, optimized custom stacks, and senior delivery pipelines.',
  overview: 'Partner with Kogla Tech to integrate custom, highly optimized digital operations. From advanced system-level backend programming to comprehensive database architectures and secure network controls, we design resilient workflows tailored exclusively to satisfy your corporate delivery benchmarks.',
  specifications: [
    { label: 'Consultation Timeline', value: 'Under 2 hours to assign Lead Solutions Architect' },
    { label: 'Audit standard', value: 'Comprehensive static scan of existing codebase' },
    { label: 'SLA Response Guarantee', value: 'Airtight 24/7/365 active server monitoring' },
    { label: 'Assigned Engineers', value: 'Senior level developers only' }
  ],
  methodology: [
    { step: 'Step 1', title: 'Technical Intake Assessment', desc: 'Establishing scope constraints, legacy tech compatibility, and delivery targets.' },
    { step: 'Step 2', title: 'Iterative Development Sprints', desc: 'Writing modular codebases verified by automated test pipelines.' },
    { step: 'Step 3', title: 'SLA Deployment Handover', desc: 'Migrating production packages with detailed operational guidelines.' }
  ],
  caseStudy: {
    focus: 'Enterprise Operational Integration',
    outcome: 'Completed system migration with zero downtime, upgrading client process velocities by over 50% across departments.'
  },
  duration: '3-6 Weeks delivery'
};

export default function ServiceWorkflow() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const serviceKey = slug?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
  const details = SERVICES_REGISTRY[serviceKey] || DEFAULT_BLUEPRINT;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [timeline, setTimeline] = useState('Immediate (< 1 month)');
  const [requirements, setRequirements] = useState('');

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !requirements) return;

    addInquiry({
      type: 'solution_inquiry',
      title: details.title.toUpperCase(),
      senderName: `${name} (${company || 'Individual/Startup'})`,
      senderEmail: email,
      description: `Timeline: ${timeline}. Brief details: ${requirements}`
    });

    setFormSubmitted(true);
  };

  return (
    <div className="pt-32 px-6 pb-20 max-w-5xl mx-auto text-gray-100 font-sans">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-gold-500 mb-8 transition-colors text-xs font-display tracking-widest uppercase"
      >
        <ArrowLeft size={14} className="mr-2" /> Return to catalog
      </button>

      {/* Header section */}
      <div className="border-b border-gray-900 pb-10 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display mb-4 font-bold">
          <ShieldCheck size={11} className="text-gold-500" /> Secure Corporate Intake
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-4 leading-tight">
          {details.title}
        </h1>
        <p className="text-gray-400 text-sm md:text-md max-w-3xl leading-relaxed uppercase tracking-wider font-mono">
          {details.subtitle}
        </p>
      </div>

      {/* SLA Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gold-500 block mb-1">Standard Delivery Timeline</span>
          <span className="text-white text-sm font-bold flex items-center gap-1.5 font-display uppercase">
            <Zap size={14} className="text-gold-500" /> {details.duration}
          </span>
        </div>
        <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gold-500 block mb-1">Response Guarantee SLA</span>
          <span className="text-white text-sm font-bold flex items-center gap-1.5 font-display uppercase">
            <Building2 size={14} className="text-gold-500" /> Under 2 Hours
          </span>
        </div>
        <div className="p-4 bg-gray-950 border border-gold-500/20 rounded-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gold-500 block mb-1">Mutual NDA Standard</span>
          <span className="text-white text-sm font-bold flex items-center gap-1.5 font-display uppercase">
            <ShieldCheck size={14} className="text-gold-500" /> Instant pre-drafted
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-5 gap-12 items-start mb-16">
        <div className="md:col-span-3 space-y-10">
          
          {/* Overview Statement */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gold-500 font-display font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Service Overview & Specifications
            </h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {details.overview}
            </p>
          </div>

          {/* Technical Specifications Matrix */}
          <div className="p-5 bg-gray-950 border border-gray-900 rounded-sm space-y-3">
            <h4 className="text-xs uppercase font-display tracking-widest text-white font-bold">Systems Capabilities Outline</h4>
            <div className="grid gap-2 text-xs font-mono">
              {details.specifications.map((spec, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-900 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-500 uppercase text-[9px] tracking-wider">{spec.label}</span>
                  <span className="text-gray-300 font-medium text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Methodology */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">Standard Delivery Blueprint</h3>
            <div className="space-y-4">
              {details.methodology.map((meth, i) => (
                <div key={i} className="flex gap-4 items-start border-l-2 border-gold-500 pl-4">
                  <div className="shrink-0 mt-0.5">
                    <span className="text-[10px] font-mono text-gold-500 uppercase tracking-widest">{meth.step}</span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">{meth.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{meth.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-world Case Study */}
          <div className="space-y-3 border-t border-gray-900 pt-8">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">Client Execution Highlight</h3>
            <div className="p-5 bg-gradient-to-r from-gray-950 to-black border border-gray-900 rounded-sm space-y-2">
              <span className="text-gold-500 font-mono text-[9px] uppercase tracking-widest block font-bold">Case Brief: {details.caseStudy.focus}</span>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                "{details.caseStudy.outcome}"
              </p>
            </div>
          </div>

        </div>

        {/* Sidebar Intake Form */}
        <div className="md:col-span-2">
          {formSubmitted ? (
            <div className="p-6 bg-gray-950 border-2 border-gold-500 text-center rounded-sm space-y-4">
              <CheckSquare className="mx-auto text-gold-500" size={36} />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Inquiry Authenticated</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Thank you, <span className="text-gold-500 font-semibold">{name}</span>. Your technology portfolio brief has been logged with system code <b className="text-white">KG-SOL-{(Math.random() * 1000).toFixed(0)}</b>.
              </p>
              <p className="text-[10px] text-gray-500">
                A Kogla Tech Solutions Architect is compiling your custom NDA and proposal. We will contact you at your business mailbox <b className="text-white">{email}</b> within 2 business hours.
              </p>
              <button 
                onClick={() => navigate('/')} 
                className="mt-4 w-full py-2 bg-transparent hover:bg-gold-500/10 border border-gold-500 text-gold-500 text-xs transition-all uppercase tracking-widest font-display rounded-sm"
              >
                Return Home
              </button>
            </div>
          ) : (
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-sm space-y-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-gold-500" />
                <h3 className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">Corporate Intake Brief</h3>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal font-mono">
                Define your delivery constraints and legacy integrations below.
              </p>
              
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <div>
                  <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Warren Buffet" 
                    className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Company / Organization</label>
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="E.g. Berkshire Enterprises" 
                    className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Corporate Mailbox</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="collaboration@company.co" 
                    className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Anticipated SLA Timeline</label>
                  <select 
                    value={timeline} 
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono"
                  >
                    <option value="Immediate (< 1 month)">Immediate (&lt; 1 month)</option>
                    <option value="Short term (1-3 months)">Short term (1-3 months)</option>
                    <option value="Mid term (3-6 months)">Mid term (3-6 months)</option>
                    <option value="Strategic Research & Development">Strategic R&D Roadmap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Operational Constraints</label>
                  <textarea 
                    required
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Detail your legacy infrastructure integrations, access requirements, and specific delivery goals..." 
                    className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white h-24 resize-none rounded-sm font-mono" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider font-display rounded-sm"
                >
                  Submit Operational Packet <Send size={12} />
                </button>
              </form>

              {/* Instant Contact Options (Email first, then WhatsApp) */}
              <div className="pt-4 border-t border-gray-900 space-y-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 block tracking-wider">Instant Direct Contact</span>
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`mailto:solutions@koglatech.com?subject=${encodeURIComponent(`Inquiry & Priority Booking: ${details.title} - Kogla Tech`)}`}
                    className="py-2 px-3 bg-gold-500 hover:bg-gold-600 text-black font-bold text-[10px] uppercase tracking-wider font-display rounded-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail size={13} /> Send Email
                  </a>
                  <a 
                    href={`https://wa.me/2347012489041?text=${encodeURIComponent(`Hello Kogla Tech, I want to book your ${details.title} service. Let's discuss!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] uppercase tracking-wider font-display rounded-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
