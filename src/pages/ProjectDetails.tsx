import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Shield, Layers, Zap, CheckCircle, Database, ChevronRight, Activity, CpuIcon, Sparkles } from 'lucide-react';
import React from 'react';

interface CaseStudy {
  title: string;
  subtitle: string;
  challenge: string;
  solution: string;
  results: string[];
  client: string;
  timeline: string;
  techStack: string[];
  metrics: { value: string; label: string }[];
}

const CASE_STUDIES: Record<string, CaseStudy> = {
  'ai-infrastructure': {
    title: 'AI Infrastructure',
    subtitle: 'Enterprise AI/ML Platform & Low-Latency LLM Serving',
    client: 'Apex Financial Services Corp',
    timeline: '5 Months',
    metrics: [
      { value: '+450%', label: 'Inference Speedup' },
      { value: '99.99%', label: 'Hardware Allocation efficiency' },
      { value: '-30%', label: 'Cloud Compute Waste Reduction' }
    ],
    challenge: 'Apex Financial Services was attempting to deploy high-frequency custom predictive LLM endpoints across multiple global nodes. Due to bad infrastructure parallelization and inefficient token pipeline caching, their old cloud setups suffered from volatile request spikes, high latency, and massive cloud hosting costs.',
    solution: 'We engineered a highly resilient micro-scheduling layer on top of a custom Kubernetes setup backed by NVIDIA Triton Inference Server. We implemented smart KV-caching strategy and optimized model weight floating-point sizes (FP16/INT8 quantizations), resulting in deterministic, lower overhead executions.',
    results: [
      'Successfully deployed enterprise model pipelines across 4 global geographic nodes with seamless automated failover.',
      'Reduced average end-to-end user latency from 2400ms down to a stable 350ms.',
      'Saved over $270k in quarterly cloud computing allocation errors within the first month of deployment.'
    ],
    techStack: ['PyTorch', 'NVIDIA Triton', 'Kubernetes', 'Docker', 'Go', 'Terraform', 'Prometheus']
  },
  'cyber-immunity': {
    title: 'Cyber Immunity',
    subtitle: 'Zero-Trust Defense Network & Cryptographic Sanitization',
    client: 'Defense & Aerospace Systems UK',
    timeline: '8 Months',
    metrics: [
      { value: '0', label: 'Successful Intrusions detected' },
      { value: '<50ms', label: 'Breach Isolation & Airgap Trigger' },
      { value: '100%', label: 'Secure Encryption Compliance' }
    ],
    challenge: 'A national critical infrastructure system was targeted by recurrent stealth advanced persistent threat attacks (APTs), bypassing typical deep-packet inspection firewalls and attempting unauthorized memory reads of active payload records.',
    solution: 'We implemented an air-gapped Zero-Trust defense system. Leveraging custom Linux kernel eBPF probes for continuous runtime behavior analysis, we isolated any malicious system behavior instantly (<50ms). We encapsulated application logic in secure WebAssembly sandboxes using post-quantum cryptographic primitives.',
    results: [
      'Eliminated standard peripheral vulnerability attack vectors through full system sandboxing.',
      'Integrated military-grade post-quantum cipher suites for entire multi-node server cluster communication.',
      'Automated peer-to-peer security posture scoring checks to isolate untrusted hardware instantly.'
    ],
    techStack: ['Rust', 'eBPF', 'WireGuard SDK', 'WebAssembly (WASM)', 'Linux Security Modules', 'gRPC']
  },
  'digital-transformation': {
    title: 'Digital Transformation',
    subtitle: 'Retail Headless Commerce & Dynamic Supply Line ERP',
    client: 'Velo Retail Group Globally',
    timeline: '6 Months',
    metrics: [
      { value: '+45%', label: 'Conversion frequency growth' },
      { value: '2.4x', label: 'Supply Chain logistics velocity' },
      { value: '$14M+', label: 'Directly retained online revenue' }
    ],
    challenge: 'Velo Retail operated over 4,200 brick-and-mortar storefronts with a heavily fragmented ERP, sluggish legacy POS databases, and highly fragile checkout portals, leading to massive cart abandonment and poor logistics predictions.',
    solution: 'We architected a unified headless commerce engine. By compiling high-speed data aggregations with Apache Kafka and PostgreSQL, we connected inventory streams in near real-time, allowing live availability guarantees. We completely overhauled the user experience with an responsive Next.js framework.',
    results: [
      'Boosted store-to-store shipping coordination speed by 140% via automated routing vectors.',
      'Unfettered responsive frontend interfaces handling over 250,000 requests per minute with perfect uptime.',
      'Enabled high-fidelity offline sales tracking with local-first Service Worker clients.'
    ],
    techStack: ['React', 'Next.js', 'GraphQL', 'PostgreSQL', 'Apache Kafka', 'Node.js', 'Google Cloud Pub/Sub']
  },
  'web-ecosystem': {
    title: 'Web Ecosystem',
    subtitle: 'Global High-Traffic SaaS Platform & Edge Delivery',
    client: 'Logis Group Technologies Inc',
    timeline: '4 Months',
    metrics: [
      { value: '95ms', label: 'Average Global Load Speed' },
      { value: '99.999%', label: 'High Availability SLA Uptime' },
      { value: '12M+', label: 'Daily edge visual streams rendered' }
    ],
    challenge: 'Logis Group was scaling their global collaborative dashboard, but browser rendering choked on giant telemetry trees, and centralized European database calls caused terrible latency bottlenecks for Asian and North American workspace users.',
    solution: 'We restructured the SaaS layout using a decoupled multi-region micro-frontend framework. We leveraged Cloudflare Worker edge routers to render templates as close to the target browser as possible, paired with smart distributed local database replicas.',
    results: [
      'Successfully compressed application core payload sizes from 4.2 MB down to a sleek 340 KB.',
      'Implemented distributed edge state replication, reducing global server transport delay from 350ms to 95ms.',
      'Integrated real-time vector charts and custom SVG interfaces rendering flawlessly on both phone and desktop screens.'
    ],
    techStack: ['React', 'Tailwind CSS', 'Cloudflare Workers', 'Vite', 'WebAssembly', 'Redis Edge Cache', 'Jest']
  }
};

export default function ProjectDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const projectKey = slug?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const details = CASE_STUDIES[projectKey || ''] || CASE_STUDIES['ai-infrastructure'];

  return (
    <div className="pt-32 px-6 pb-20 max-w-5xl mx-auto text-gray-100 font-sans">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-500 hover:text-gold-500 mb-8 transition-colors text-xs font-display tracking-widest uppercase"
      >
        <ArrowLeft size={14} className="mr-2" /> Back to showcase
      </button>

      {/* Header section */}
      <div className="border-b border-gray-900 pb-10 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display mb-4">
          <Sparkles size={11} /> Featured Case Study
        </div>
        <h1 className="text-3xl md:text-6xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-4">
          {details.title}
        </h1>
        <p className="text-gray-400 text-sm md:text-lg max-w-3xl leading-relaxed uppercase tracking-wider font-mono">
          {details.subtitle}
        </p>
      </div>

      {/* Metadata & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          {details.metrics.map((m, i) => (
            <div key={i} className="p-5 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/30 transition-all text-center">
              <span className="block text-xl md:text-3xl lg:text-4xl font-display font-bold text-gold-500 mb-1">{m.value}</span>
              <span className="block text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest leading-normal">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm text-xs space-y-4 font-mono">
          <div className="flex justify-between border-b border-gray-900 pb-2">
            <span className="text-gray-500 uppercase">Client Profile</span>
            <span className="text-white text-right">{details.client}</span>
          </div>
          <div className="flex justify-between border-b border-gray-900 pb-2">
            <span className="text-gray-500 uppercase">Operational Span</span>
            <span className="text-white">{details.timeline}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 uppercase">Security Clearance</span>
            <span className="text-gold-500">LEVEL-4 (COMPLIANT)</span>
          </div>
        </div>
      </div>

      {/* Content blocks */}
      <div className="grid md:grid-cols-5 gap-12 items-start mb-16">
        <div className="md:col-span-3 space-y-8">
          {/* Challenge */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gold-500 font-display font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> The Core Challenge
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {details.challenge}
            </p>
          </div>

          {/* Solution */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gold-500 font-display font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Our Custom Engineering Solution
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {details.solution}
            </p>
          </div>

          {/* Key Deliverables / Results */}
          <div className="space-y-4 pt-4 border-t border-gray-900">
            <h4 className="text-xs font-display uppercase tracking-widest text-white font-bold mb-2">Key Accomplishments</h4>
            <div className="space-y-3 text-xs md:text-sm text-gray-400">
              {details.results.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={14} className="text-gold-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack Block */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-gradient-to-b from-gray-950 to-black border border-gray-900 rounded-sm space-y-4">
            <h4 className="text-xs font-display uppercase tracking-widest text-gold-500 font-bold">Systems & Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {details.techStack.map((tech) => (
                <span key={tech} className="px-2.5 py-1 bg-black border border-gray-800 hover:border-gold-500/40 text-gray-300 rounded-sm text-[10px] font-mono tracking-wider transition-all">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="p-6 bg-gold-500 text-black rounded-sm space-y-4">
            <h4 className="text-xs font-display uppercase tracking-widest font-black">Request Prototype Consultation</h4>
            <p className="text-[11px] leading-relaxed font-medium">
              Want to see how we can tackle similar system parameters for your own products? Initiate an absolute confidential intake process now.
            </p>
            <button 
              onClick={() => navigate('/contact')}
              className="w-full py-2 bg-black hover:bg-gray-900 text-white font-semibold text-xs uppercase tracking-wider font-display transition-colors rounded-sm"
            >
              Contact Solutions Architect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
