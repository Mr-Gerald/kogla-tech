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
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function Footer() {
  const { config } = useSiteConfig();

  return (
    <footer className="bg-black border-t border-gray-900 text-gray-405 text-xs font-sans">
      {/* Top Section with high density grids */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Column 1: Brand & Security Compliance */}
        <div className="space-y-4 lg:col-span-1">
          <Link to="/" className="text-lg font-display font-bold text-white tracking-widest flex items-center gap-2 uppercase">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.companyName} className="h-8 border border-gold-500/50 p-1 rounded-sm bg-black/50 object-contain" />
            ) : (
              <span>
                {config.logoText.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-gold-500' : 'text-white'}>{word} </span>
                ))}
              </span>
            )}
          </Link>
          <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
            Next-generation enterprise software solutions, mission-critical workflow automations, and premium artificial intelligence academies.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[9px] font-mono rounded-sm uppercase tracking-wider">
              <Shield size={11} /> Compliance: Secure
            </span>
          </div>
          <div className="space-y-1 font-mono text-[10px] text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin size={11} className="text-gold-500/70" />
              <span>Headquarters: Lagos, Nigeria</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={11} className="text-gold-500/70" />
              <span>{config.contactEmail}</span>
            </div>
            {config.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone size={11} className="text-gold-500/70" />
                <a href={`tel:${config.contactPhone.replace(/[^0-9+]/g, '')}`} className="hover:text-gold-500 transition-colors">
                  Call Us: {config.contactPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Solutions Ecosystem */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <Cpu size={11} className="text-gold-500" /> Solutions Ecosystem
          </h4>
          <ul className="space-y-1.5 font-mono text-[10px] text-gray-400">
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
                Enterprise Cloud Hosting <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Academy & Pathways */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <BookOpen size={11} className="text-gold-500" /> Academy & Training
          </h4>
          <ul className="space-y-1.5 font-mono text-[10px] text-gray-400">
            <li>
              <Link to="/academy/full-stack-engineering" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Full-Stack Systems <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/machine-learning-operations" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                MLOps & Data Science <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/advanced-cybersecurity" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Cybersecurity Paths <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/ui-ux-engineering" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                UI/UX Design Systems <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
            <li>
              <Link to="/academy/cloud-native-devops" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Cloud-Native DevOps <ArrowUpRight size={10} className="opacity-0 hover:opacity-100" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Join Community */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <Globe size={11} className="text-gold-500" /> Join Community
          </h4>
          <ul className="space-y-1.5 font-mono text-[10px] text-gray-405">
            <li>
              <a href={config.communityLink} target="_blank" rel="noreferrer" className="hover:text-gold-500 transition-colors flex items-center gap-1 text-gold-500 font-bold">
                WhatsApp Community <ArrowUpRight size={10} />
              </a>
            </li>
            <li>
              <a href={config.telegramLink} target="_blank" rel="noreferrer" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Telegram Channel <ArrowUpRight size={10} />
              </a>
            </li>
            <li>
              <a href={config.whatsappLink} target="_blank" rel="noreferrer" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Chat on WhatsApp <ArrowUpRight size={10} />
              </a>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold-500 transition-colors flex items-center gap-1">
                Book Consultation <ArrowUpRight size={10} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 5: Portals & Operators */}
        <div className="space-y-3">
          <h4 className="text-white font-display text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-900 pb-2">
            <Terminal size={11} className="text-gold-500" /> Account Portal
          </h4>
          <ul className="space-y-1.5 font-sans text-[11px] text-gray-400">
            <li>
              <Link to="/auth/login" className="hover:text-gold-500 transition-colors font-medium text-gold-500">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-gold-500 transition-colors">
                Management Console
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold-500 transition-colors">
                Corporate Profile
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold-500 transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Disclaimers & Legal Footnotes */}
      <div className="border-t border-gray-900 bg-gray-950/40">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-mono">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Security Policy</span>
            <span>&bull;</span>
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Privacy Protocol</span>
            <span>&bull;</span>
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Compliance</span>
          </div>

          <div className="text-center md:text-right text-gray-400">
            &copy; {new Date().getFullYear()} {config.companyName}. {config.footerCredits}
          </div>
        </div>
      </div>
    </footer>
  );
}
