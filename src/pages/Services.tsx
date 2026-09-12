import { motion } from 'motion/react';
import { Smartphone, Shield, Cpu, Mail, Globe, Briefcase, BarChart3, Cloud, Layers, Zap, MessageCircle, Send, X, Palette, MessageSquare, Clock, Award, Video, PieChart, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

export default function Services() {
    const [selectedService, setSelectedService] = useState<{ title: string; desc: string; timeline: string } | null>(null);

    const services = [
        { 
            title: 'Web Development', 
            desc: 'Enterprise-grade web applications, resilient backend servers, and high-performance frontend runtimes.', 
            timeline: '1-2 weeks',
            icon: Globe 
        },
        { 
            title: 'Mobile App Development', 
            desc: 'Native iOS & Android apps built with React Native / Flutter, secure APIs, and flawless UI/UX.', 
            timeline: '2-3 weeks',
            icon: Smartphone 
        },
        { 
            title: 'AI Automation', 
            desc: 'Custom LLM integration, autonomous workflow automation, and intelligent agentic pipelines.', 
            timeline: '3-5 days',
            icon: Cpu 
        },
        { 
            title: 'Cybersecurity', 
            desc: 'Zero-trust infrastructure audits, penetration testing, eBPF kernel checks, and defense hardening.', 
            timeline: '3-5 days',
            icon: Shield 
        },
        { 
            title: 'Product Management', 
            desc: 'End-to-end product roadmapping, user research, agile backlog grooming, and MVP launch execution.', 
            timeline: '1-2 weeks setup',
            icon: Briefcase 
        },
        { 
            title: 'Digital Marketing', 
            desc: 'Growth engineering, targeted acquisition campaigns, SEO supremacy, and high-conversion funnels.', 
            timeline: 'Ongoing weekly campaigns',
            icon: BarChart3 
        },
        { 
            title: 'UI/UX Design', 
            desc: 'Fluid responsive coordinate interfaces, optical grid mathematics, and motion spring physics.', 
            timeline: '4-7 days',
            icon: Layers 
        },
        { 
            title: 'Video Editing & Motion Graphics', 
            desc: 'Professional cinematic video editing, 2D/3D motion graphics, brand promos, social reels, and VFX animation.', 
            timeline: '3-5 days turnaround',
            icon: Video 
        },
        { 
            title: 'Data Analysis', 
            desc: 'Advanced statistical data analytics, SQL/Python data mining, interactive BI dashboards, and growth insights.', 
            timeline: '4-7 days turnaround',
            icon: PieChart 
        },
        { 
            title: 'Social Media Management', 
            desc: 'Strategic brand campaigns, multi-channel community engagement, scheduled publishing, and audience analytics.', 
            timeline: 'Instant start • 4-5 posts/week',
            icon: MessageSquare 
        },
        { 
            title: 'Graphic Designs', 
            desc: 'High-impact visual brand identities, vector assets, promotional creative, and marketing collateral.', 
            timeline: '2-3 days turnaround',
            icon: Palette 
        },
        { 
            title: 'Business Technology Solutions', 
            desc: 'Comprehensive IT architecture advisory, scalable systems integration, and full digital transformation roadmaps.', 
            timeline: '1-3 weeks',
            icon: Cloud 
        },
    ];

    return (
        <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto font-sans text-gray-100">
            
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-mono font-bold tracking-widest uppercase rounded-full">
                  <Zap size={12} className="text-gold-400" /> Enterprise Solutions & Services
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-wider">
                  Our <span className="text-gold-500">Service Solutions</span>
                </h1>
                <p className="text-xs md:text-sm text-gray-400 font-sans leading-relaxed">
                  We engineer bespoke software, web & mobile applications, AI workflows, security audits, and UI/UX design. Standard delivery ranges from 1-2 weeks. <strong className="text-gold-400">Note: Higher priority payment guarantees faster delivery!</strong>
                </p>

                {/* 20% DISCOUNT PROMO BANNER FOR SERVICES */}
                <div className="p-4 bg-gradient-to-r from-gold-500/15 via-zinc-900 to-gold-500/10 border border-gold-500/40 rounded-sm text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={13} /> Exclusive 20% Service Discount Promo
                    </span>
                    <p className="text-xs text-zinc-200">
                      Quote code <b className="text-gold-400 bg-black/60 px-2 py-0.5 rounded font-mono border border-gold-500/30">KOGLA21</b> when booking on WhatsApp or email to claim <strong className="text-white">20% OFF</strong> your total service charge!
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/2347012489041?text=${encodeURIComponent(`Hello Kogla Tech, I want to request a service (Website / Mobile App / UI/UX / Graphics / AI). I am using promo code KOGLA21 to claim my 20% discount on the service charge!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs uppercase font-mono tracking-wider rounded-sm shrink-0 flex items-center gap-1.5 transition-all"
                  >
                    <MessageCircle size={14} /> Claim 20% Discount
                  </a>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(s => {
                    const IconComp = s.icon;
                    return (
                        <motion.div 
                            key={s.title} 
                            whileHover={{ y: -4 }} 
                            onClick={() => setSelectedService(s)}
                            className="p-6 bg-gray-950 border border-gray-850 hover:border-gold-500 transition-all rounded-sm flex flex-col justify-between group cursor-pointer shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold-500/0 via-gold-500/40 to-gold-500/0 group-hover:from-gold-500 group-hover:to-gold-400 transition-all" />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-sm flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                                        <IconComp size={22} />
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-400 bg-black px-2 py-1 rounded-sm border border-gray-900 flex items-center gap-1 max-w-[160px] truncate" title={s.timeline}>
                                        <Clock size={12} className="text-gold-500 shrink-0" /> <span className="truncate">{s.timeline}</span>
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold mb-2 font-display text-white group-hover:text-gold-500 transition-colors uppercase tracking-wide">
                                        {s.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-sans leading-relaxed">
                                        {s.desc}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-900 text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider flex items-center justify-between group-hover:text-gold-300">
                                <span>Contact WhatsApp To Book</span>
                                <span>&rarr;</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* INSTANT SERVICE CONTACT MODAL */}
            {selectedService && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-950 border border-gold-500/40 rounded-sm max-w-lg w-full p-8 relative space-y-6 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-400" />
                        
                        <button 
                            onClick={() => setSelectedService(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-sm"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-2">
                            <span className="text-[9px] text-gold-500 font-mono font-bold tracking-widest uppercase bg-gold-500/10 border border-gold-500/20 px-2.5 py-0.5 rounded-full">
                                Solution & Service Booking
                            </span>
                            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">
                                {selectedService.title}
                            </h3>
                            <p className="text-xs text-gray-300 font-sans leading-relaxed">
                                {selectedService.desc}
                            </p>
                        </div>

                        <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-2 font-mono text-[11px] text-gray-400">
                            <div className="flex justify-between text-gold-400 font-bold uppercase">
                                <span>Standard Timeline:</span>
                                <span className="text-white">{selectedService.timeline}</span>
                            </div>
                            <p className="text-[10px] text-gray-400">⚡ Note: Higher priority payment guarantees faster delivery and dedicated senior engineering bandwidth.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                            <a 
                                href={`https://wa.me/2347012489041?text=${encodeURIComponent(`Hello Kogla Tech, I want to book your ${selectedService.title} service. My requirement is: [describe project]. I am applying promo code KOGLA21 for 20% off my service charge. Let's discuss!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-widest font-display rounded-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={15} /> WhatsApp (20% Off)
                            </a>
                            <a 
                                href={`mailto:solutions@koglatech.com?subject=${encodeURIComponent(`[KOGLA21 20% OFF] Priority Booking: ${selectedService.title} - Kogla Tech`)}`}
                                className="py-3 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs uppercase tracking-widest font-display rounded-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Mail size={15} /> Send Email
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
}
