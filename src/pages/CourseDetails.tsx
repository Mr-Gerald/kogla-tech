import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Send, CheckCircle2, Award, Shield, Cpu, BookOpenCheck } from 'lucide-react';
import React, { useState } from 'react';
import { addInquiry } from '../utils/storage';

export default function CourseDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    
    const rawTitle = slug ? slug.replace(/-/g, ' ') : 'ELITE PROGRAM';
    const displayTitle = rawTitle.split(' ').map(w => {
        if (w.toLowerCase() === 'ui' || w.toLowerCase() === 'ux') return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ').replace('Ui Ux', 'UI/UX').replace('Ui/ux', 'UI/UX');

    const formattedTitle = displayTitle.toUpperCase();

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [motivation, setMotivation] = useState('');

    const handleEnroll = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        addInquiry({
            type: 'enrollment',
            title: formattedTitle,
            senderName: name,
            senderEmail: email,
            description: motivation || `Requesting details to enroll in the ${formattedTitle} premium course.`
        });

        setFormSubmitted(true);
    };

    return (
        <div className="pt-32 px-6 pb-20 max-w-4xl mx-auto text-gray-100">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-gold-500 mb-8 transition-colors text-xs font-display tracking-widest uppercase">
                <ArrowLeft size={14} className="mr-2" /> Back to ecosystem
            </button>

            <div className="grid md:grid-cols-5 gap-12 items-start">
                <div className="md:col-span-3 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-full uppercase tracking-widest font-display">
                        <BookOpenCheck size={12} /> Live Interactive Cohort
                    </div>

                    <h1 className="text-3xl md:text-5xl font-display font-bold bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent">
                        {displayTitle}
                    </h1>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        Master the skills necessary to succeed in {displayTitle} with our expert-led, intense curriculums. From fundamental engineering architectures to corporate integration processes, this cohort covers critical, real-world case studies designed solely to turn ambition into enterprise-grade career outcomes.
                    </p>

                    <div className="border-t border-gray-800 pt-6 space-y-4">
                        <h4 className="text-xs font-display uppercase tracking-widest text-gold-500">Program Highlights</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-gray-950 border border-gray-900 rounded-sm">
                                <span className="block text-gold-500 font-bold mb-1">Duration</span>
                                <span className="text-gray-400">12 Weeks • Intense</span>
                            </div>
                            <div className="p-3 bg-gray-950 border border-gray-900 rounded-sm">
                                <span className="block text-gold-500 font-bold mb-1">Format</span>
                                <span className="text-gray-400">Live Hands-On & Projects</span>
                            </div>
                            <div className="p-3 bg-gray-950 border border-gray-900 rounded-sm">
                                <span className="block text-gold-500 font-bold mb-1">Mentorship</span>
                                <span className="text-gray-400">1-on-1 Weekly Reviews</span>
                            </div>
                            <div className="p-3 bg-gray-950 border border-gray-900 rounded-sm">
                                <span className="block text-gold-500 font-bold mb-1">Credential</span>
                                <span className="text-gray-400">Kogla Certified Engineer</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {formSubmitted ? (
                        <div className="p-6 bg-gray-950 border-2 border-gold-500 text-center rounded-sm space-y-4 animate-pulse">
                            <CheckCircle2 className="mx-auto text-gold-500" size={44} />
                            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">Application Received</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Thank you, <span className="text-gold-500 font-semibold">{name}</span>. Your enrollment slot request for <b className="text-white">{formattedTitle}</b> has been successfully recorded. 
                            </p>
                            <p className="text-[10px] text-gray-500">
                                An academic consultant will review your professional profile and send your admission documents to <b className="text-white">{email}</b> within 2 business hours.
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
                            <h3 className="text-sm font-display font-bold uppercase text-gold-500 tracking-wider">Request Enrollment Slot</h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                Complete this short application process. Your profile is automatically passed to our admissions advisor list.
                            </p>
                            
                            <form onSubmit={handleEnroll} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Alexandra Sterling" 
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Business Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="sterling@company.luxury" 
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Expectation & Experience</label>
                                    <textarea 
                                        value={motivation}
                                        onChange={(e) => setMotivation(e.target.value)}
                                        placeholder="E.g., I want to deploy enterprise system integrations and lead the AI transformation in my startup" 
                                        className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white h-24 resize-none" 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider font-display"
                                >
                                    Submit Application <Send size={12} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
