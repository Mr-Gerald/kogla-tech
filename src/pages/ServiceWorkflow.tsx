import { useParams, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Send, CheckSquare, ShieldCheck, Building2 } from 'lucide-react';
import React, { useState } from 'react';
import { addInquiry } from '../utils/storage';

export default function ServiceWorkflow() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const formattedTitle = slug ? slug.replace(/-/g, ' ').toUpperCase() : 'PREMIUM SERVICE';

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
            title: formattedTitle,
            senderName: `${name} (${company || 'Individual/Startup'})`,
            senderEmail: email,
            description: `Timeline: ${timeline}. Details: ${requirements}`
        });

        setFormSubmitted(true);
    };

    return (
        <div className="pt-32 px-6 pb-20 max-w-4xl mx-auto text-gray-100">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-gold-500 mb-8 transition-colors text-xs font-display tracking-widest uppercase">
                <ArrowLeft size={14} className="mr-2" /> Back to solutions
            </button>

            <div className="grid md:grid-cols-5 gap-12 items-start">
                <div className="md:col-span-3 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display">
                        <ShieldCheck size={12} className="text-gold-500" /> Secure Corporate Intake
                    </div>

                    <h1 className="text-3xl md:text-5xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent capitalize">
                        {slug?.replace(/-/g, ' ')}
                    </h1>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        Partner with Kogla Tech and tap into our elite engineering and delivery pools to implement secure, robust, and highly dynamic product architectures. Customize the exact parameters of {slug?.replace(/-/g, ' ')} for your company's specifications.
                    </p>

                    <div className="border-t border-gray-800 pt-6 space-y-4">
                        <h4 className="text-xs font-display uppercase tracking-widest text-gold-500">Service SLA standard</h4>
                        <div className="space-y-3 text-xs text-gray-400">
                            <div className="flex items-start gap-2.5">
                                <span className="p-1 rounded bg-gold-500/10 text-gold-500 mt-0.5">✔</span>
                                <div>
                                    <strong className="block text-white">2 Hour Consultant Response Time</strong>
                                    We assign a specialized Solutions Architect immediately after your brief is received.
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <span className="p-1 rounded bg-gold-500/10 text-gold-500 mt-0.5">✔</span>
                                <div>
                                    <strong className="block text-white">Zero NDA Hurdles</strong>
                                    Instant pre-drafted mutual non-disclosure documents generated for enterprise safety.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {formSubmitted ? (
                        <div className="p-6 bg-gray-950 border-2 border-gold-500 text-center rounded-sm space-y-4">
                            <CheckSquare className="mx-auto text-gold-500" size={44} />
                            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">Inquiry Active</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Thank you, <span className="text-gold-500 font-semibold">{name}</span>. Your technology portfolio brief for <b className="text-white">{formattedTitle}</b> has been received.
                            </p>
                            <p className="text-[10px] text-gray-500">
                                A Kogla Tech Business Solutions specialist has been notified. We will contact you at your business mailbox <b className="text-white">{email}</b> shortly.
                            </p>
                            <button 
                                onClick={() => navigate('/')} 
                                className="mt-4 w-full py-2 bg-transparent hover:bg-gold-500/10 border border-gold-500 text-gold-500 text-xs transition-all uppercase tracking-widest font-display"
                            >
                                Return Home
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 bg-gray-950 border border-gray-800 rounded-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-gold-500" />
                                <h3 className="text-sm font-display font-bold uppercase text-gold-500 tracking-wider">Corporate Intake Brief</h3>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                Define your constraints below. A tailored business proposal will be drafted based on this statement.
                            </p>
                            
                            <form onSubmit={handleSubmitInquiry} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Your Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Warren Buffet" 
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Company / Organization</label>
                                    <input 
                                        type="text" 
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="E.g. Berkshire Enterprises" 
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Corporate Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="collaboration@company.co" 
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Anticipated Timeline</label>
                                    <select 
                                        value={timeline} 
                                        onChange={(e) => setTimeline(e.target.value)}
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white"
                                    >
                                        <option value="Immediate (< 1 month)">Immediate (&lt; 1 month)</option>
                                        <option value="Short term (1-3 months)">Short term (1-3 months)</option>
                                        <option value="Mid term (3-6 months)">Mid term (3-6 months)</option>
                                        <option value="Strategic Research">Strategic Research & Development</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Detailed Technical Constraints</label>
                                    <textarea 
                                        required
                                        value={requirements}
                                        onChange={(e) => setRequirements(e.target.value)}
                                        placeholder="State your legacy stack integration, security constraints, and specific goals..." 
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white h-24 resize-none" 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider font-display"
                                >
                                    Submit brief <Send size={12} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
