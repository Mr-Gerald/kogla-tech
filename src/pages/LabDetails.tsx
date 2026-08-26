import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Shield, Settings, Zap, CheckCircle, Database, GitBranch, Terminal, Sparkles, Award } from 'lucide-react';

interface LabResearch {
  title: string;
  subtitle: string;
  focus: string;
  overview: string;
  experiments: { id: string; name: string; desc: string; status: 'completed' | 'active' | 'scheduled' }[];
  specifications: { label: string; value: string }[];
  milestones: string[];
}

const LABS_DATA: Record<string, LabResearch> = {
  'llm-optimization': {
    title: 'LLM Optimization',
    subtitle: 'Low-latency quantized models, efficient KV caching, and dynamic parallelization parameters.',
    focus: 'Model Quantization & Distributed Weights Deployment',
    overview: 'Our LLM Optimization lab addresses the substantial computational overhead of deploying large language models. Through high-fidelity mixed-precision quantization (FP16 down to INT4) and optimized custom kernel operations on modern GPU clusters, we enable sub-100ms first-token latency on enterprise-scale foundation models without sacrificing output semantic accuracy.',
    specifications: [
      { label: 'Cluster Bandwidth', value: '400 Gbps RoCE v2' },
      { label: 'Hardware Base', value: 'NVIDIA H100 Tensor Core Clusters' },
      { label: 'Target Latency', value: '<50ms Time-To-First-Token' },
      { label: 'Quantization Formats', value: 'AWQ, GPTQ, GGUF, FP8/FP4' }
    ],
    experiments: [
      { id: 'EXP-902', name: 'FlashAttention-3 Kernel Tuning', desc: 'Custom assembly-level modifications to attention blocks for reduced memory bandwidth traffic.', status: 'completed' },
      { id: 'EXP-924', name: 'Speculative Decoding Pipeline', desc: 'Sparsified draft models running ahead of primary generative endpoints with real-time acceptance verification.', status: 'active' },
      { id: 'EXP-980', name: 'Multi-GPU Tensor Parallelism v4', desc: 'Bypassing host PCIe bottleneck via high-speed NVLink direct peer memory copying.', status: 'scheduled' }
    ],
    milestones: [
      'Successfully compressed Llama-3 70B parameters down to highly-dense FP8 without degrading perplexity indices.',
      'Achieved a stable 250 words per second throughput rate on decentralized edge consumer nodes.',
      'Released optimized custom CUDA kernel matrices supporting asynchronous tensor core math instructions.'
    ]
  },
  'cyber-security-labs': {
    title: 'Cyber Security Labs',
    subtitle: 'Zero-trust runtime verification, eBPF infrastructure telemetry, and sandboxed execution environments.',
    focus: 'Stealth Intrusion Containment & Kernel-Level Safeguards',
    overview: 'Our Cyber Security Labs specialize in building proactive and sovereign security postures. Rather than waiting for known signatures, we engineer real-time threat-detection layers at the system boundary using eBPF probes. This permits sandboxing and air-gapping vulnerable system processes instantly before a single malicious instruction can exploit server memory registers.',
    specifications: [
      { label: 'Isolation Velocity', value: '<15ms System Intercept' },
      { label: 'Sandboxing Engine', value: 'WebAssembly (WASM) & microVM container runtimes' },
      { label: 'Cryptography Matrix', value: 'Kyber & Dilithium (Post-Quantum Compliant)' },
      { label: 'Ingress Bandwidth', value: 'Automated 1.2 Tbps DDoS scrubbing capabilities' }
    ],
    experiments: [
      { id: 'SEC-402', name: 'eBPF Memory Pointer Guard', desc: 'Real-time validation of memory addresses requested by kernel modules to mitigate buffer overflows.', status: 'completed' },
      { id: 'SEC-419', name: 'Quantum-Resistant HSM Bridging', desc: 'Establishing encrypted peer-to-peer tunnels using Lattice-based key encapsulations.', status: 'active' },
      { id: 'SEC-500', name: 'Sovereign ID Verification Blocks', desc: 'Decentralized identity authorization parameters to reduce reliance on third-party validation registries.', status: 'scheduled' }
    ],
    milestones: [
      'Completed zero-trust behavior blueprints deployed across high-speed financial network interfaces.',
      'Pioneered instant threat-isolation parameters triggering localized virtual network cut-offs.',
      'Secured enterprise-wide system infrastructure handling level-4 government defense parameters.'
    ]
  },
  'automation-os': {
    title: 'Automation OS',
    subtitle: 'Stateful workflow scheduling, agentic execution runtimes, and local-first microservice compilers.',
    focus: 'Deterministic Workflow Execution & Multi-Agent Coordination',
    overview: 'Automation OS is our foundational operating matrix for orchestration of AI agents and corporate process pipelines. We focus on state stability, event-driven deterministic execution, and seamless human-in-the-loop validation parameters to eliminate runaway automation errors across complex distributed ERP software systems.',
    specifications: [
      { label: 'State Sync Latency', value: 'Sub-3ms Local-First' },
      { label: 'Message Queue', value: 'Automated ultra-high throughput event streams' },
      { label: 'Agentic Framework', value: 'Sovereign State-Machine Scheduling' },
      { label: 'Offline Execution', value: 'Full peer recovery with cached storage' }
    ],
    experiments: [
      { id: 'AUT-102', name: 'Transactional Event Rollbacks', desc: 'Automatic reversion of multiple sequential API actions if any step in an orchestration sequence fails.', status: 'completed' },
      { id: 'AUT-240', name: 'Dynamic Resource-Load Balancer', desc: 'Predicting automation traffic flows to provision memory assets automatically before processing spikes.', status: 'active' },
      { id: 'AUT-310', name: 'Conversational Code Generator', desc: 'Generating self-healing local micro services compiled directly back to optimized assembly scripts.', status: 'scheduled' }
    ],
    milestones: [
      'Successfully automated 100% of standard inventory synchronization flows for multinational partners.',
      'Integrated real-time streaming charts across 4 global administrative control rooms.',
      'Reduced automation orchestration friction by over 80% through deterministic event-cycle models.'
    ]
  }
};

export default function LabDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const labKey = slug?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const details = LABS_DATA[labKey || ''] || LABS_DATA['llm-optimization'];

  return (
    <div className="pt-32 px-6 pb-20 max-w-5xl mx-auto text-gray-100 font-sans">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-500 hover:text-gold-500 mb-8 transition-colors text-xs font-display tracking-widest uppercase"
      >
        <ArrowLeft size={14} className="mr-2" /> Back to research hub
      </button>

      {/* Header section */}
      <div className="border-b border-gray-900 pb-10 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display mb-4">
          <Award size={11} className="text-gold-500" /> AI Research Lab
        </div>
        <h1 className="text-3xl md:text-6xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-4">
          {details.title}
        </h1>
        <p className="text-gray-400 text-sm md:text-lg max-w-3xl leading-relaxed uppercase tracking-wider font-mono">
          {details.subtitle}
        </p>
      </div>

      {/* Lab Parameters & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gold-500 font-display font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Core Research Focus
            </h3>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed">
              <strong>{details.focus}:</strong> {details.overview}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-900 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">Research Milestones & Core Accomplishments</h3>
            <ul className="space-y-3 text-xs md:text-sm text-gray-400">
              {details.milestones.map((milestone, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle size={14} className="text-gold-500 shrink-0 mt-0.5" />
                  <span>{milestone}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm">
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-500 font-bold mb-4">Technical Specifications</h4>
          <div className="space-y-4 font-mono text-xs">
            {details.specifications.map((spec, idx) => (
              <div key={idx} className="flex flex-col border-b border-gray-900 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-500 uppercase text-[10px] tracking-wider mb-1">{spec.label}</span>
                <span className="text-white font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sandbox Experiments / Projects */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-900 pb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-white">Active Research Sandbox</h3>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Experimental Pipelines & Integration Repositories</p>
          </div>
          <span className="px-2.5 py-1 bg-black border border-gray-800 text-[10px] text-gray-400 font-mono tracking-widest rounded-sm uppercase">
            STATUS: ACTIVE DEPLOYMENT
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {details.experiments.map((exp) => (
            <div key={exp.id} className="p-5 bg-gray-950 border border-gray-900 rounded-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-gold-500 tracking-wider bg-gold-500/5 px-2 py-0.5 border border-gold-500/10 rounded-sm">{exp.id}</span>
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                    exp.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    exp.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-gray-800/10 text-gray-400 border border-gray-800/20'
                  }`}>
                    {exp.status}
                  </span>
                </div>
                <h4 className="text-xs font-display font-bold text-white mb-2">{exp.name}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{exp.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-900 text-[10px] font-mono text-gray-500 flex items-center justify-between">
                <span>Access Level</span>
                <span className="text-gold-500">Enterprise Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
