import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Terminal, 
  Send, 
  CheckCircle, 
  PhoneCall, 
  Lock,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { addInquiry } from '../utils/storage';

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Enterprise Port');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Save in Kogla state storage
    addInquiry({
      type: 'contact',
      title: subject,
      senderName: name,
      senderEmail: email,
      description: message
    });

    setFormSubmitted(true);
  };

  const channels = [
    { label: "Enterprise Solutions", email: "solutions@kogla-tech.com", desc: "For private, sovereign automation & defense systems contracts." },
    { label: "Elite Academy", email: "academy@kogla-tech.com", desc: "For admissions, cohorts, corporate educational training audits." },
    { label: "Security & Operations Desk", email: "sec-ops@kogla-tech.com", desc: "For direct threat-isolation telemetry logs or vulnerability reports." }
  ];

  const offices = [
    { 
      name: "Sovereign Lagos Node", 
      location: "Herbert Macaulay Way, Sabo Yaba, Lagos, Nigeria", 
      status: "PRIMARY OPERATIONAL CORE" 
    },
    { 
      name: "London Hub Base", 
      location: "Canary Wharf, London, E14 5LB, United Kingdom", 
      status: "GLOBAL CORRESPONDING RANGE" 
    }
  ];

  return (
    <div className="pt-32 px-6 pb-24 max-w-6xl mx-auto text-gray-100 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page title and headers */}
        <div className="border-b border-gray-900 pb-10 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display mb-4">
            <Lock size={11} className="text-gold-500" /> Intake Gateway
          </div>
          <h1 className="text-4xl md:text-7xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-4">
            Get In <span className="text-gold-500">Touch</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-md uppercase tracking-wider font-mono max-w-3xl leading-relaxed">
            TRANSMIT SECURE INTERFACE COMMANDS AND INTEGRATION INQUIRIES DIRECTLY TO DEPLOYMENT COORDINATION CENTERS.
          </p>
        </div>

        {/* Info Highlights Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-mono text-xs">
          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/10 transition-all flex items-center gap-3">
            <Clock className="text-gold-500 shrink-0" size={16} />
            <div>
              <span className="text-gray-500 uppercase text-[9px] block">Turnaround SLA</span>
              <span className="text-white font-medium">Under 2 hours guaranteed</span>
            </div>
          </div>
          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/10 transition-all flex items-center gap-3">
            <ShieldCheck className="text-gold-500 shrink-0" size={16} />
            <div>
              <span className="text-gray-500 uppercase text-[9px] block">Security Clearance</span>
              <span className="text-white font-medium">Automatic Pre-drafted NDA</span>
            </div>
          </div>
          <div className="p-4 bg-gray-950 border border-gold-500/20 rounded-sm flex items-center gap-3">
            <Terminal className="text-gold-500 shrink-0" size={16} />
            <div>
              <span className="text-gold-500 uppercase text-[9px] block">Sovereign Encryption</span>
              <span className="text-white font-medium">Level-4 Secure Gateway</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Column Left: Interactive State Form */}
          <div className="lg:col-span-3 p-6 md:p-8 bg-gray-950 border border-gray-900 rounded-sm">
            {formSubmitted ? (
              <div className="text-center py-12 space-y-6">
                <CheckCircle2 className="mx-auto text-gold-500" size={48} />
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Transmission Logged</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                    Excellent, <b className="text-gold-500">{name}</b>. Your transmission has been queued under administrative token ID <b className="text-white">KG-TX-{(Math.random() * 10000).toFixed(0)}</b>.
                  </p>
                </div>
                <div className="p-4 bg-black border border-gray-900 font-mono text-[10px] text-gray-500 max-w-sm mx-auto rounded-sm leading-relaxed">
                  SYSTEM RESPONSE: Packet parsed. Standard dispatcher has been requested to coordinate solutions brief. Verification copy routed to <span className="text-gray-300">{email}</span>.
                </div>
                <button 
                  onClick={() => {
                    setFormSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="px-6 py-2.5 bg-transparent hover:bg-gold-500/10 border border-gold-500 text-gold-500 text-[10px] font-mono tracking-widest uppercase transition-all rounded-sm"
                >
                  Generate New Transmission
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">Intake Interface Form</h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">Submit your request below to trigger immediate system audits.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono">Validated Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. Alexandra Sterling" 
                      className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono transition-colors" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono">Verified Corporate Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sterling@apexcorp.luxury" 
                      className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono transition-colors" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono">Strategic Subject Line</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-mono transition-colors"
                  >
                    <option value="General Enterprise Port">General Enterprise Port</option>
                    <option value="Sovereign AI Automation Solutions">Sovereign AI Automation Solutions</option>
                    <option value="Cyber Defense & Encryption Overhaul">Cyber Defense & Encryption Overhaul</option>
                    <option value="Kogla Academy Cohort Intake">Kogla Academy Cohort Intake</option>
                    <option value="Urgent Partnership Proposal">Urgent Partnership Proposal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono">Message & Operational Requirements</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your project specifications, constraints, timelines, and systems integration targets..." 
                    className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white h-36 resize-none rounded-sm font-mono transition-colors" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 active:scale-[0.98] text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-widest font-display rounded-sm"
                >
                  Transmit Secure Message <Send size={13} />
                </button>
              </form>
            )}
          </div>

          {/* Column Right: Direct Channels & Offices */}
          <div className="lg:col-span-2 space-y-8">
            {/* Direct Mailing Channels */}
            <div className="p-6 bg-gray-950 border border-gray-900 rounded-sm space-y-4">
              <h4 className="text-xs font-display font-bold uppercase tracking-widest text-gold-500">Mailing Matrix Channels</h4>
              <div className="space-y-4">
                {channels.map((ch, idx) => (
                  <div key={idx} className="border-b border-gray-900 pb-3 last:border-0 last:pb-0 space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-mono block">{ch.label}</span>
                    <a href={`mailto:${ch.email}`} className="text-white text-xs font-semibold hover:text-gold-500 transition-colors font-mono block">
                      {ch.email}
                    </a>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-mono">{ch.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sovereign Nodes */}
            <div className="p-6 bg-gradient-to-b from-gray-950 to-black border border-gray-900 rounded-sm space-y-4">
              <h4 className="text-xs font-display font-bold uppercase tracking-widest text-gold-500 flex items-center gap-1.5">
                <Globe size={13} /> Geolocation Nodes
              </h4>
              <div className="space-y-4 text-xs font-mono">
                {offices.map((office, idx) => (
                  <div key={idx} className="border-b border-gray-900 pb-3 last:border-0 last:pb-0 space-y-1">
                    <span className="text-gold-500 text-[9px] uppercase tracking-wider block font-bold">{office.status}</span>
                    <span className="text-white font-semibold block">{office.name}</span>
                    <span className="text-gray-500 text-[11px] block leading-relaxed">{office.location}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Protocol Info */}
            <div className="p-5 bg-black border border-gray-900 rounded-sm font-mono text-[10px] text-gray-500 leading-relaxed">
              <span className="text-white font-bold block mb-1">SYSTEM WARNING:</span>
              Intake logs are audited using end-to-end trace parameters. Submitting fraudulent requests or telemetry scanning probes against Kogla Tech network assets will trigger automatic boundary lockout protocols immediately.
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
