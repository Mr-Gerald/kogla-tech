import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Send, CheckCircle2, Award, Shield, Cpu, BookOpenCheck, Clock, Layers, Users, Star } from 'lucide-react';
import React, { useState } from 'react';
import { addInquiry } from '../utils/storage';

interface CourseData {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  intensity: string;
  level: string;
  syllabus: { week: string; topic: string; details: string }[];
  tools: string[];
  outcomes: string[];
}

const COURSES_REGISTRY: Record<string, CourseData> = {
  'full-stack-engineering': {
    title: 'Full-Stack Systems Engineering',
    subtitle: 'High-performance distributed web systems, state engines, and complex microservices.',
    description: 'An intensive, system-level curriculum built to transition developers into senior web architects. This course bypasses standard starter templates, deep-diving straight into concurrent rendering pipelines (React 19), distributed databases, type-safe RPC architectures, custom web sockets state-synchronization engines, and scalable backends.',
    duration: '12 Weeks',
    intensity: 'High (15-20 hrs/week)',
    level: 'Advanced-Intermediate',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Concurrent React & State Mechanics', details: 'Hydration cycles, server-side actions, custom render loops, and client-side transaction pools.' },
      { week: 'Weeks 4-6', topic: 'Advanced API & Storage Architectures', details: 'PostgreSQL optimization, raw SQL query compiling, Redis caching clusters, and high-performance gRPC pipelines.' },
      { week: 'Weeks 7-9', topic: 'Real-time Event Synchronization', details: 'WebSockets servers, conflict-free replicated data types (CRDTs), and transactional message queues.' },
      { week: 'Weeks 10-12', topic: 'Orchestration & Deployments', details: 'Docker packaging, custom bash monitoring scripts, and automated blue-green cloud deployments.' }
    ],
    tools: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'gRPC'],
    outcomes: [
      'Architect highly robust real-time synchronization systems handling 10k+ concurrent websocket frames.',
      'Deploy resilient multi-node database clusters with zero single-point-of-failure vectors.',
      'Compile custom build engines and optimization configurations resulting in sub-300ms core load speeds.'
    ]
  },
  'web-development': {
    title: 'Full-Stack Web Development',
    subtitle: 'High-performance distributed web systems, state engines, and complex microservices.',
    description: 'An intensive, system-level curriculum built to transition developers into senior web architects. This course bypasses standard starter templates, deep-diving straight into concurrent rendering pipelines (React 19), distributed databases, type-safe RPC architectures, custom web sockets state-synchronization engines, and scalable backends.',
    duration: '12 Weeks',
    intensity: 'High (15-20 hrs/week)',
    level: 'Advanced-Intermediate',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Concurrent React & State Mechanics', details: 'Hydration cycles, server-side actions, custom render loops, and client-side transaction pools.' },
      { week: 'Weeks 4-6', topic: 'Advanced API & Storage Architectures', details: 'PostgreSQL optimization, raw SQL query compiling, Redis caching clusters, and high-performance gRPC pipelines.' },
      { week: 'Weeks 7-9', topic: 'Real-time Event Synchronization', details: 'WebSockets servers, conflict-free replicated data types (CRDTs), and transactional message queues.' },
      { week: 'Weeks 10-12', topic: 'Orchestration & Deployments', details: 'Docker packaging, custom bash monitoring scripts, and automated blue-green cloud deployments.' }
    ],
    tools: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'gRPC'],
    outcomes: [
      'Architect highly robust real-time synchronization systems handling 10k+ concurrent websocket frames.',
      'Deploy resilient multi-node database clusters with zero single-point-of-failure vectors.',
      'Compile custom build engines and optimization configurations resulting in sub-300ms core load speeds.'
    ]
  },
  'machine-learning-operations': {
    title: 'MLOps & Quantized Model Pipelines',
    subtitle: 'NVIDIA Tritonserving, model optimization weight quantization, and cluster performance.',
    description: 'Bridge the gap between pure ML theoretical mathematics and high-throughput real-world deployment pipelines. In this course, we analyze speculative model decoding algorithms, GPU memory allocation, INT8/FP8 quantization techniques, raw CUDA operation tuning, and Triton Inference Server parallel structures.',
    duration: '14 Weeks',
    intensity: 'Extreme (20-25 hrs/week)',
    level: 'Advanced (Mathematical/Systems focus)',
    syllabus: [
      { week: 'Weeks 1-4', topic: 'Neural Weight Quantization Mechanics', details: 'Implementing GPTQ, AWQ and FP8 calibration pipelines to shrink models with zero perplexity loss.' },
      { week: 'Weeks 5-7', topic: 'Low-latency NVIDIA Triton Pipelines', details: 'Configuring dynamic request batching, multiple model routing states, and GPU instance pooling.' },
      { week: 'Weeks 8-10', topic: 'Distributed GPU Clusters with Ray', details: 'Bypassing PCIe bus limitations via direct NVLink memory channels and multi-GPU parallelizations.' },
      { week: 'Weeks 11-14', topic: 'Confidential Edge ML Deployments', details: 'Compiling custom WebAssembly runtimes executing encrypted inference loops securely on isolated chips.' }
    ],
    tools: ['PyTorch', 'NVIDIA Triton', 'TensorRT-LLM', 'Ray Framework', 'Kubernetes', 'HuggingFace SDK', 'FP8 Format'],
    outcomes: [
      'Scale enterprise model pipelines to serve over 100,000 global client requests with sub-100ms response barriers.',
      'Reduce core machine learning cloud compute expenditures by over 50% via aggressive INT4/FP8 optimizations.',
      'Build fully automated fine-tuning loops processing incoming vector logs securely.'
    ]
  },
  'ai-automation': {
    title: 'AI & Automation Engineering',
    subtitle: 'NVIDIA Tritonserving, model optimization weight quantization, and cluster performance.',
    description: 'Bridge the gap between pure ML theoretical mathematics and high-throughput real-world deployment pipelines. In this course, we analyze speculative model decoding algorithms, GPU memory allocation, INT8/FP8 quantization techniques, raw CUDA operation operation tuning, and Triton Inference Server parallel structures.',
    duration: '14 Weeks',
    intensity: 'Extreme (20-25 hrs/week)',
    level: 'Advanced (Mathematical/Systems focus)',
    syllabus: [
      { week: 'Weeks 1-4', topic: 'Neural Weight Quantization Mechanics', details: 'Implementing GPTQ, AWQ and FP8 calibration pipelines to shrink models with zero perplexity loss.' },
      { week: 'Weeks 5-7', topic: 'Low-latency NVIDIA Triton Pipelines', details: 'Configuring dynamic request batching, multiple model routing states, and GPU instance pooling.' },
      { week: 'Weeks 8-10', topic: 'Distributed GPU Clusters with Ray', details: 'Bypassing PCIe bus limitations via direct NVLink memory channels and multi-GPU parallelizations.' },
      { week: 'Weeks 11-14', topic: 'Confidential Edge ML Deployments', details: 'Compiling custom WebAssembly runtimes executing encrypted inference loops securely on isolated chips.' }
    ],
    tools: ['PyTorch', 'NVIDIA Triton', 'TensorRT-LLM', 'Ray Framework', 'Kubernetes', 'HuggingFace SDK', 'FP8 Format'],
    outcomes: [
      'Scale enterprise model pipelines to serve over 100,000 global client requests with sub-100ms response barriers.',
      'Reduce core machine learning cloud compute expenditures by over 50% via aggressive INT4/FP8 optimizations.',
      'Build fully automated fine-tuning loops processing incoming vector logs securely.'
    ]
  },
  'advanced-cybersecurity': {
    title: 'Advanced Cybersecurity & Kernel Safeguards',
    subtitle: 'Zero-trust infrastructure security, eBPF telemetry, and post-quantum cryptographic tunnels.',
    description: 'Learn to safeguard modern systems from advanced persistent threat (APT) attacks. Bypassing old-school signature-based antivirus solutions, this curriculum centers on eBPF memory monitoring, runtime integrity verification at the operating system layer, secure cryptographic isolation, and WASM sandbox containers.',
    duration: '12 Weeks',
    intensity: 'High (18 hrs/week)',
    level: 'Advanced',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'eBPF Kernel Telemetry Probes', details: 'Writing custom C-based eBPF scripts to detect and block memory write violations.' },
      { week: 'Weeks 4-6', topic: 'Zero-Trust Sandboxing Architectures', details: 'Securing runtime logic using WebAssembly (WASM) compilers and lightweight isolated microVMs.' },
      { week: 'Weeks 7-9', topic: 'Post-Quantum Defense Engineering', details: 'Deploying NTRU and Kyber lattice algorithms to immune communication pathways.' },
      { week: 'Weeks 10-12', topic: 'Red Team Scenario Auditing', details: 'Deconstructing custom buffer-overflow and side-channel threats in our isolated security ranges.' }
    ],
    tools: ['Rust & eBPF', 'Linux Security Modules', 'Kyber Encryption', 'WebAssembly', 'WireGuard SDK', 'Docker Sandbox'],
    outcomes: [
      'Establish airtight Zero-Trust security barriers securing corporate clusters handling billions in asset transactions.',
      'Deploy instant alert-action networks capturing system drift behaviors in less than 15ms.',
      'Analyze and audit binary exploits at the assembly code level with absolute precision.'
    ]
  },
  'cybersecurity': {
    title: 'Advanced Cybersecurity & Kernel Safeguards',
    subtitle: 'Zero-trust infrastructure security, eBPF telemetry, and post-quantum cryptographic tunnels.',
    description: 'Learn to safeguard modern systems from advanced persistent threat (APT) attacks. Bypassing old-school signature-based antivirus solutions, this curriculum centers on eBPF memory monitoring, runtime integrity verification at the operating system layer, secure cryptographic isolation, and WASM sandbox containers.',
    duration: '12 Weeks',
    intensity: 'High (18 hrs/week)',
    level: 'Advanced',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'eBPF Kernel Telemetry Probes', details: 'Writing custom C-based eBPF scripts to detect and block memory write violations.' },
      { week: 'Weeks 4-6', topic: 'Zero-Trust Sandboxing Architectures', details: 'Securing runtime logic using WebAssembly (WASM) compilers and lightweight isolated microVMs.' },
      { week: 'Weeks 7-9', topic: 'Post-Quantum Defense Engineering', details: 'Deploying NTRU and Kyber lattice algorithms to immune communication pathways.' },
      { week: 'Weeks 10-12', topic: 'Red Team Scenario Auditing', details: 'Deconstructing custom buffer-overflow and side-channel threats in our isolated security ranges.' }
    ],
    tools: ['Rust & eBPF', 'Linux Security Modules', 'Kyber Encryption', 'WebAssembly', 'WireGuard SDK', 'Docker Sandbox'],
    outcomes: [
      'Establish airtight Zero-Trust security barriers securing corporate clusters handling billions in asset transactions.',
      'Deploy instant alert-action networks capturing system drift behaviors in less than 15ms.',
      'Analyze and audit binary exploits at the assembly code level with absolute precision.'
    ]
  },
  'ui-ux-engineering': {
    title: 'UI/UX Fluid Engineering & Micro-Interactions',
    subtitle: 'Physics-based layouts, advanced typography hierarchies, and user interaction mechanics.',
    description: 'Transform visuals into beautifully responsive, touch-optimized user interfaces. This course goes beyond simple design mockups, training designers to think of layouts as fluid, physics-based, resilient coordinate graphs. We focus on interaction mechanics, typography spacing, color science contrast, and performance-first CSS.',
    duration: '10 Weeks',
    intensity: 'Medium-High (12 hrs/week)',
    level: 'Intermediate-Advanced',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Grid Mathematics & Spatial Rhythm', details: 'Perfecting responsive page flow using fluid typography scales, strict optical grids, and human readability studies.' },
      { week: 'Weeks 4-6', topic: 'Motion Physics & Micro-Animations', details: 'Leveraging structural spring physics (friction, mass, tension) instead of fixed linear durations.' },
      { week: 'Weeks 7-8', topic: 'Accessibility Compliance standards', details: 'Understanding AA/AAA color contrast, responsive keyboard tab-trap controls, and screen-readers structures.' },
      { week: 'Weeks 9-10', topic: 'User Behavior Event Telemetry', details: 'Integrating performance-neutral event monitors to trace and iterate confusing interface friction states.' }
    ],
    tools: ['Figma Masters', 'Tailwind CSS v4', 'Framer Motion', 'Lottie Files', 'CSS Physics Engine', 'WCAG Audits'],
    outcomes: [
      'Design fully accessible, responsive application frameworks rendering flawlessly on mobile, tablet, and ultra-wide screens.',
      'Implement state-driven transitions resulting in a cohesive, premium brand aesthetic across complex dashboard pipelines.',
      'Compile light weight, highly interactive SVG animations and bento-grid layouts with smooth loading transitions.'
    ]
  },
  'ui-ux-design': {
    title: 'UI/UX Design Engineering',
    subtitle: 'Physics-based layouts, advanced typography hierarchies, and user interaction mechanics.',
    description: 'Transform visuals into beautifully responsive, touch-optimized user interfaces. This course goes beyond simple design mockups, training designers to think of layouts as fluid, physics-based, resilient coordinate graphs. We focus on interaction mechanics, typography spacing, color science contrast, and performance-first CSS.',
    duration: '10 Weeks',
    intensity: 'Medium-High (12 hrs/week)',
    level: 'Intermediate-Advanced',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Grid Mathematics & Spatial Rhythm', details: 'Perfecting responsive page flow using fluid typography scales, strict optical grids, and human readability studies.' },
      { week: 'Weeks 4-6', topic: 'Motion Physics & Micro-Animations', details: 'Leveraging structural spring physics (friction, mass, tension) instead of fixed linear durations.' },
      { week: 'Weeks 7-8', topic: 'Accessibility Compliance standards', details: 'Understanding AA/AAA color contrast, responsive keyboard tab-trap controls, and screen-readers structures.' },
      { week: 'Weeks 9-10', topic: 'User Behavior Event Telemetry', details: 'Integrating performance-neutral event monitors to trace and iterate confusing interface friction states.' }
    ],
    tools: ['Figma Masters', 'Tailwind CSS v4', 'Framer Motion', 'Lottie Files', 'CSS Physics Engine', 'WCAG Audits'],
    outcomes: [
      'Design fully accessible, responsive application frameworks rendering flawlessly on mobile, tablet, and ultra-wide screens.',
      'Implement state-driven transitions resulting in a cohesive, premium brand aesthetic across complex dashboard pipelines.',
      'Compile light weight, highly interactive SVG animations and bento-grid layouts with smooth loading transitions.'
    ]
  },
  'cloud-native-devops': {
    title: 'Cloud-Native DevOps & Global Scale',
    subtitle: 'Terraform, distributed stateful engines, Kubernetes namespaces, and automated CDN caching.',
    description: 'Learn the system-level infrastructure patterns that power the worlds largest platforms. This course breaks down Multi-region high availability architectures, cloud resource orchestration using code models, declarative package deployment frameworks, and edge content caching systems.',
    duration: '12 Weeks',
    intensity: 'High (16-18 hrs/week)',
    level: 'Advanced-Intermediate',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Declarative Cloud Infrastructures', details: 'Coding complex multi-cloud structures using reusable, versioned Terraform plans.' },
      { week: 'Weeks 4-6', topic: 'Kubernetes Namespace Orchestrations', details: 'Managing real-time service meshes, load-balancers, cluster ingresses, and automated microVM failovers.' },
      { week: 'Weeks 7-9', topic: 'High-Throughput delivery pipelines', details: 'Writing fast, secure continuous verification scripts running static audits before deployment.' },
      { week: 'Weeks 10-12', topic: 'Distributed Datastores & Edge Caches', details: 'Deploying globally replicated cluster architectures and Cloudflare Worker routing states.' }
    ],
    tools: ['Terraform', 'Kubernetes (K8s)', 'Github Actions', 'AWS Cloud', 'GCP Engine', 'Cloudflare Workers', 'ArgoCD'],
    outcomes: [
      'Deploy immutable multi-region cloud infrastructures that auto-heal and scale dynamically with incoming load parameters.',
      'Design continuous validation scripts reducing deployment failures to absolute zero.',
      'Deploy globally cached assets reaching average users in less than 80ms worldwide.'
    ]
  },
  'cloud-architecture': {
    title: 'Cloud-Native Architecture & DevOps',
    subtitle: 'Terraform, distributed stateful engines, Kubernetes namespaces, and automated CDN caching.',
    description: 'Learn the system-level infrastructure patterns that power the worlds largest platforms. This course breaks down Multi-region high availability architectures, cloud resource orchestration using code models, declarative package deployment frameworks, and edge content caching systems.',
    duration: '12 Weeks',
    intensity: 'High (16-18 hrs/week)',
    level: 'Advanced-Intermediate',
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Declarative Cloud Infrastructures', details: 'Coding complex multi-cloud structures using reusable, versioned Terraform plans.' },
      { week: 'Weeks 4-6', topic: 'Kubernetes Namespace Orchestrations', details: 'Managing real-time service meshes, load-balancers, cluster ingresses, and automated microVM failovers.' },
      { week: 'Weeks 7-9', topic: 'High-Throughput delivery pipelines', details: 'Writing fast, secure continuous verification scripts running static audits before deployment.' },
      { week: 'Weeks 10-12', topic: 'Distributed Datastores & Edge Caches', details: 'Deploying globally replicated cluster architectures and Cloudflare Worker routing states.' }
    ],
    tools: ['Terraform', 'Kubernetes (K8s)', 'Github Actions', 'AWS Cloud', 'GCP Engine', 'Cloudflare Workers', 'ArgoCD'],
    outcomes: [
      'Deploy immutable multi-region cloud infrastructures that auto-heal and scale dynamically with incoming load parameters.',
      'Design continuous validation scripts reducing deployment failures to absolute zero.',
      'Deploy globally cached assets reaching average users in less than 80ms worldwide.'
    ]
  }
};

const DEFAULT_COURSE: CourseData = {
  title: 'Elite Engineering Systems Cohort',
  subtitle: 'A high-impact training track focused on modern corporate specifications and operational excellence.',
  description: 'Our standard enterprise curriculum, focusing on cutting-edge production-grade stacks, high-performance database architectures, continuous security auditing parameters, and fluid interactive visuals designed to convert raw talent into sector-leading field experts.',
  duration: '10 Weeks',
  intensity: 'High (12-14 hrs/week)',
  level: 'Intermediate-Advanced',
  syllabus: [
    { week: 'Weeks 1-3', topic: 'System Overviews and Clean Stacks', details: 'Enforcing strict TypeScript rules, compiling optimized bundles, and formatting clean data flows.' },
    { week: 'Weeks 4-7', topic: 'Data Layer Management and Caching', details: 'Relational schema design, asynchronous query execution pipelines, and caching optimizations.' },
    { week: 'Weeks 8-10', topic: 'Security Standards and Edge Performance', details: 'Applying Zero-trust guidelines, securing client cookies, and deployment optimization checks.' }
  ],
  tools: ['TypeScript', 'Vite', 'Node.js', 'PostgreSQL', 'Tailwind v4', 'Jest Testing Engine'],
  outcomes: [
    'Deploy modular web systems adhering fully to standard type-safety requirements.',
    'Build reliable server-side endpoint pipelines protecting corporate sensitive fields from leaks.',
    'Formulate secure local storage managers restoring state cleanly after site restarts.'
  ]
};

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const courseKey = slug?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
  const details = COURSES_REGISTRY[courseKey] || DEFAULT_COURSE;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [motivation, setMotivation] = useState('');

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addInquiry({
      type: 'enrollment',
      title: details.title.toUpperCase(),
      senderName: name,
      senderEmail: email,
      description: motivation || `Enrolling in course: ${details.title}.`
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

      {/* Hero section */}
      <div className="border-b border-gray-900 pb-10 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display mb-4">
          <BookOpenCheck size={11} className="text-gold-500" /> Live Interactive Cohort
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-4 leading-tight">
          {details.title}
        </h1>
        <p className="text-gray-400 text-sm md:text-md max-w-3xl leading-relaxed font-mono uppercase tracking-wider">
          {details.subtitle}
        </p>
      </div>

      {/* Meta Specs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/25 transition-all">
            <span className="text-gray-500 text-[9px] uppercase tracking-widest font-mono block mb-1">Duration</span>
            <span className="text-white text-sm font-semibold flex items-center gap-1.5 font-display">
              <Clock size={14} className="text-gold-500" /> {details.duration}
            </span>
          </div>
          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/25 transition-all">
            <span className="text-gray-500 text-[9px] uppercase tracking-widest font-mono block mb-1">Commitment</span>
            <span className="text-white text-sm font-semibold flex items-center gap-1.5 font-display">
              <Layers size={14} className="text-gold-500" /> {details.intensity}
            </span>
          </div>
          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/25 transition-all">
            <span className="text-gray-500 text-[9px] uppercase tracking-widest font-mono block mb-1">Target Proficiency</span>
            <span className="text-white text-sm font-semibold flex items-center gap-1.5 font-display">
              <Users size={14} className="text-gold-500" /> {details.level}
            </span>
          </div>
        </div>

        <div className="p-4 bg-gray-950 border border-gold-500/20 rounded-sm flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-gold-500 font-bold block">Admissions Port</span>
            <span className="text-gray-500 uppercase text-[9px]">Status: Slots Open</span>
          </div>
          <span className="text-white bg-gold-500/10 border border-gold-500/30 px-2 py-1 rounded-sm text-[9px]">ADM-2026/SEC</span>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid md:grid-cols-5 gap-12 items-start mb-16">
        <div className="md:col-span-3 space-y-10">
          
          {/* Detailed Description */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gold-500 font-display font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Profile Overview
            </h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {details.description}
            </p>
          </div>

          {/* Syllabus Curriculum */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">Comprehensive Curriculum Syllabus</h3>
            <div className="space-y-4">
              {details.syllabus.map((item, index) => (
                <div key={index} className="p-5 bg-gray-950 border border-gray-900 rounded-sm flex flex-col md:flex-row gap-4 hover:border-gold-500/20 transition-all">
                  <div className="md:w-1/4">
                    <span className="text-gold-500 font-mono text-[10px] uppercase tracking-widest bg-gold-500/5 border border-gold-500/10 px-2 py-1 rounded-sm block text-center">
                      {item.week}
                    </span>
                  </div>
                  <div className="md:w-3/4 space-y-1">
                    <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">{item.topic}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-4 border-t border-gray-900 pt-8">
            <h3 className="text-xs uppercase tracking-widest text-white font-display font-bold">Key Engineering Outcomes</h3>
            <div className="grid gap-3 text-xs md:text-sm text-gray-400">
              {details.outcomes.map((outcome, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 size={15} className="text-gold-500 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Controls (Tools, Admissions Code, Application) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Systems and tools container */}
          <div className="p-6 bg-gradient-to-b from-gray-950 to-black border border-gray-900 rounded-sm space-y-4">
            <h4 className="text-xs font-display uppercase tracking-widest text-gold-500 font-bold">Stack & Operational Tools</h4>
            <div className="flex flex-wrap gap-2">
              {details.tools.map((item) => (
                <span key={item} className="px-2.5 py-1 bg-black border border-gray-800 hover:border-gold-500/30 text-gray-300 rounded-sm text-[10px] font-mono tracking-wider transition-all">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic Intake Form */}
          <div className="p-6 bg-gray-950 border border-gray-800 rounded-sm">
            {formSubmitted ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="mx-auto text-gold-500" size={36} />
                <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">Application Received</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Excellent, <b className="text-gold-500">{name}</b>. Your admissions code has been validated. 
                </p>
                <p className="text-[10px] text-gray-500 leading-normal font-mono uppercase">
                  Admission offer and requirements packet dispatching to {email}.
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full py-2 bg-transparent hover:bg-gold-500/10 border border-gold-500 text-gold-500 text-[10px] uppercase font-mono tracking-widest rounded-sm transition-all"
                >
                  Return to Hub
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider mb-1">Admissions Ingestion Standard</h4>
                  <p className="text-[10px] text-gray-500 leading-normal">Configure your academic request profile below.</p>
                </div>

                <div className="space-y-3 shrink-0">
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Validate Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexandra Sterling" 
                      className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Validated Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sterling@company.luxury" 
                      className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Target Statement & Ambition</label>
                    <textarea 
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="E.g., I aim to deploy enterprise systems and lead AI transformations." 
                      className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white h-20 resize-none rounded-sm" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 font-semibold text-black text-xs uppercase tracking-widest font-display transition-colors rounded-sm"
                >
                  Submit Academic Packet
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
