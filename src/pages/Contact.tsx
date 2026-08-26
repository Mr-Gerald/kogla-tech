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
    { label: "Enterprise Solutions", email: "solutions@koglatech.com", desc: "For enterprise automation, cloud infrastructure, and consulting inquiries." },
    { label: "Elite Academy", email: "solutions@koglatech.com", desc: "For admissions, cohorts, and corporate team training inquiries." },
    { label: "Security & Operations Desk", email: "solutions@koglatech.com", desc: "For technical inquiries, system operations, and security reports." }
  ];

  const offices = [
    { 
      name: "Lagos Hub", 
      location: "Herbert Macaulay Way, Sabo Yaba, Lagos, Nigeria", 
      status: "PRIMARY OPERATIONAL HEADQUARTERS" 
    },
    { 
      name: "London Hub", 
      location: "Canary Wharf, London, E14 5LB, United Kingdom", 
      status: "GLOBAL CORRESPONDING OFFICE" 
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
            <Lock size={11} className="text-gold-500" /> Contact & Inquiries
          </div>
          <h1 className="text-4xl md:text-7xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent mb-4">
            Get In <span className="text-gold-500">Touch</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-md uppercase tracking-wider font-mono max-w-3xl leading-relaxed">
            Send your project specifications, questions, or partnership inquiries directly to our team.
          </p>
        </div>

        {/* Info Highlights Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-mono text-xs">
          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/10 transition-all flex items-center gap-3">
            <Clock className="text-gold-500 shrink-0" size={16} />
            <div>
              <span className="text-gray-500 uppercase text-[9px] block">Turnaround Time</span>
              <span className="text-white font-medium">Under 2 hours typical response</span>
            </div>
          </div>
          <div className="p-4 bg-gray-950 border border-gray-900 rounded-sm hover:border-gold-500/10 transition-all flex items-center gap-3">
            <ShieldCheck className="text-gold-500 shrink-0" size={16} />
            <div>
              <span className="text-gray-500 uppercase text-[9px] block">Confidentiality</span>
              <span className="text-white font-medium">Pre-drafted NDA on Request</span>
            </div>
          </div>
          <div className="p-4 bg-gray-950 border border-gold-500/20 rounded-sm flex items-center gap-3">
            <Terminal className="text-gold-500 shrink-0" size={16} />
            <div>
              <span className="text-gold-500 uppercase text-[9px] block">Security Standards</span>
              <span className="text-white font-medium">Encrypted & Secure Communication</span>
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
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Message Received</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                    Thank you, <b className="text-gold-500">{name}</b>. We have received your inquiry under reference ID <b className="text-white">KG-REQ-{(Math.random() * 10000).toFixed(0)}</b>.
                  </p>
                </div>
                <div className="p-4 bg-black border border-gray-900 font-sans text-xs text-gray-400 max-w-sm mx-auto rounded-sm leading-relaxed">
                  Our solutions team has been notified and will review your inquiry shortly. A confirmation has been routed to <span className="text-gray-200">{email}</span>.
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
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">Contact Form</h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-1">Please fill out the form below and our team will get back to you promptly.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. Alexandra Sterling" 
                      className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans transition-colors" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexandra@example.com" 
                      className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans transition-colors" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono">Inquiry Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white rounded-sm font-sans transition-colors"
                  >
                    <option value="General Enterprise Inquiry">General Enterprise Inquiry</option>
                    <option value="Enterprise AI & Automation Solutions">Enterprise AI & Automation Solutions</option>
                    <option value="Cloud Infrastructure & Security">Cloud Infrastructure & Security</option>
                    <option value="Kogla Academy Cohort Intake">Kogla Academy Cohort Intake</option>
                    <option value="Partnership Proposal">Partnership Proposal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] text-gray-400 uppercase tracking-widest font-mono">Message / Project Details</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your project requirements, goals, timelines, or questions..." 
                    className="w-full p-3.5 bg-black border border-gray-900 focus:border-gold-500 focus:outline-none text-xs text-white h-36 resize-none rounded-sm font-sans transition-colors" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 active:scale-[0.98] text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-widest font-display rounded-sm"
                >
                  Send Message <Send size={13} />
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

            {/* Global Offices */}
            <div className="p-6 bg-gradient-to-b from-gray-950 to-black border border-gray-900 rounded-sm space-y-4">
              <h4 className="text-xs font-display font-bold uppercase tracking-widest text-gold-500 flex items-center gap-1.5">
                <Globe size={13} /> Global Offices
              </h4>
              <div className="space-y-4 text-xs font-mono">
                {offices.map((office, idx) => (
                  <div key={idx} className="border-b border-gray-900 pb-3 last:border-0 last:pb-0 space-y-1">
                    <span className="text-gold-500 text-[9px] uppercase tracking-wider block font-bold">{office.status}</span>
                    <span className="text-white font-semibold block font-sans">{office.name}</span>
                    <span className="text-gray-400 text-[11px] block leading-relaxed font-sans">{office.location}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Security Note */}
            <div className="p-5 bg-black border border-gray-900 rounded-sm font-sans text-[11px] text-gray-400 leading-relaxed">
              <span className="text-gold-500 font-bold block mb-1 font-mono uppercase text-[10px]">Data Privacy & Security</span>
              All inquiries submitted through this portal are handled confidentially and securely in accordance with our data privacy standards.
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
