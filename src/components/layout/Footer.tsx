import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  MapPin, 
  Cpu, 
  Phone, 
  Terminal, 
  ArrowUpRight, 
  Globe, 
  Award,
  Layers,
  BookOpen
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900 text-gray-400 text-xs font-sans">
      {/* Top Section with high density grids */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Column 1: Brand & Security Compliance */}
        <div className="space-y-4 lg:col-span-1">
          <Link to="/" className="text-lg font-display font-bold text-white tracking-widest flex items-center gap-2">
            KOGLA<span className="text-gold-500">TECH</span>
          </Link>
          <p className="text-[11px] text-gray-500 leading-relaxed font-mono">
            Next-generation digital operations center engineering, mission-critical workflow automatons, and custom sovereign AI sandboxes.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[9px] font-mono rounded-sm uppercase tracking-wider">
              <Shield size={11} /> Compliance: Level-4 Secure
            </span>
          </div>
          <div className="space-y-1 font-mono text-[10px] text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin size={11} className="text-gold-500/70" />
              <span>Sovereign Nodes [EU-WEST-2]</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={11} className="text-gold-500/70" />
              <span>solutions@kogla-tech.com</span>
            </div>
          </div>
        </div>

        {/* Column 2: Solutions Ecosystem */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <Cpu size={11} className="text-gold-500" /> Solutions Ecosystem
          </h4>
          <ul className="space-y-1.5 font-mono text-[10px] text-gray-500">
            <li>
              <Link to="/services/ai-automation" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                AI Automation <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/services/cyber-defense-infrastructure" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Cyber Defense Infra <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/services/web-development" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Web Development <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/services/mobile-app-development" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Mobile Architectures <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/services/cloud-solution-hosting" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Sovereign Cloud Hosting <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Academy & Pathways */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <BookOpen size={11} className="text-gold-500" /> Academy & Training
          </h4>
          <ul className="space-y-1.5 font-mono text-[10px] text-gray-500">
            <li>
              <Link to="/academy/full-stack-engineering" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Full-Stack Systems <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/machine-learning-operations" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                MLOps & Quantization <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/advanced-cybersecurity" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Penetration Defense <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/ui-ux-engineering" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                UI/UX Fluid Dynamics <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/cloud-native-devops" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Cloud-Native DevOps <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Research Labs */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <Layers size={11} className="text-gold-500" /> Innovation Labs
          </h4>
          <ul className="space-y-1.5 font-mono text-[10px] text-gray-500">
            <li>
              <Link to="/labs/llm-optimization" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                LLM Optimizations <ArrowUpRight size={10} className="opacity-0" />
              </Link>
            </li>
            <li>
              <Link to="/labs/cyber-security-labs" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Security Sandboxing <ArrowUpRight size={10} className="opacity-0" />
              </Link>
            </li>
            <li>
              <Link to="/labs/automation-os" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Agentic Workflows <ArrowUpRight size={10} className="opacity-0" />
              </Link>
            </li>
            <li>
              <a href="#projects" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Active Client Matrices <ArrowUpRight size={10} className="opacity-0" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 5: Portals & Operators */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <Terminal size={11} className="text-gold-500" /> Enterprise Ports
          </h4>
          <ul className="space-y-1.5 font-mono text-[10px] text-gray-500">
            <li>
              <Link to="/auth/login" className="hover:text-gold-500 transition-colors">
                Administrative Terminal
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-gold-500 transition-colors">
                Operator Dashboard
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold-500 transition-colors">
                Corporate Profile
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold-500 transition-colors">
                Intake Protocol
              </Link>
            </li>
            <li className="text-[9px] text-gold-500/50 uppercase tracking-widest pt-2">
              SECTOR GATE: COG-SEC-77
            </li>
          </ul>
        </div>

      </div>

      {/* Disclaimers & Legal Footnotes */}
      <div className="border-t border-gray-900 bg-gray-950/40">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-mono">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Security Policy</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Post-Quantum Keys</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer">Zero-Trust Protocol</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 transition-colors cursor-pointer">GDPR Sovereign Compliance</span>
          </div>

          <div className="text-center md:text-right">
            &copy; {new Date().getFullYear()} Kogla Tech. All system execution logs reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
