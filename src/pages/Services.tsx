import { motion } from 'motion/react';
import { Smartphone, Shield, Cpu, Mail, Globe, Briefcase, BarChart3, Cloud, Layers, Zap } from 'lucide-react';

export default function Services() {
    const services = [
        { title: 'Web Development', desc: 'Enterprise-grade websites.', icon: Globe },
        { title: 'Mobile Apps', desc: 'High-performance iOS/Android apps.', icon: Smartphone },
        { title: 'Cybersecurity', desc: 'Secure infrastructure & auditing.', icon: Shield },
        { title: 'AI Solutions', desc: 'Custom LLMs & automation.', icon: Cpu },
        { title: 'Business Automation', desc: 'Efficiency-driven workflows.', icon: Zap },
        { title: 'Digital Branding', desc: 'Identity design & strategy.', icon: Layers },
        { title: 'UI/UX Design', desc: 'Crafting premium user experiences.', icon: Cloud },
        { title: 'IT Consulting', desc: 'Strategic technology advisory.', icon: Briefcase },
        { title: 'Product Strategy', desc: 'Market-ready product roadmaps.', icon: BarChart3 },
        { title: 'Cloud Solutions', desc: 'Scalable cloud architecture.', icon: Cloud },                
    ];
    return (
        <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-12 text-center underline decoration-gold-500 underline-offset-8">Our <span className="text-gold-500">Service Ecosystem</span></h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(s => (
                    <motion.div key={s.title} whileHover={{ y: -5 }} className="p-8 border border-gray-800 bg-gray-900/50 group hover:border-gold-500 transition-all">
                        <s.icon className="text-gold-500 mb-6" size={40} />
                        <h3 className="text-2xl font-semibold mb-3 font-display">{s.title}</h3>
                        <p className="text-gray-400">{s.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
