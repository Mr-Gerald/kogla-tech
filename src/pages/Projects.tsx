import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const projects = [
    { name: 'AI Automator', category: 'AI Lab', slug: 'ai-infrastructure' },
    { name: 'SecureBank UI', category: 'UX', slug: 'cyber-immunity' },
    { name: 'Data Insights', category: 'Data Analysis', slug: 'digital-transformation' },
    { name: 'Finance App', category: 'Mobile', slug: 'web-ecosystem' },
];

export default function Projects() {
    return (
        <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-12 text-center text-gold-500">Project <span className="text-white">Showcase</span></h1>
            <div className="grid md:grid-cols-2 gap-8">
                {projects.map(p => (
                    <Link key={p.name} to={`/projects/${p.slug}`}>
                        <motion.div whileHover={{ scale: 1.02 }} className="h-64 border border-gray-800 hover:border-gold-500 bg-gray-900/50 flex flex-col justify-end p-8 transition-colors cursor-pointer group">
                            <span className="text-gold-500 mb-2 font-mono text-xs">{p.category}</span>
                            <h3 className="text-3xl font-semibold font-display text-white group-hover:text-gold-500 transition-colors">{p.name}</h3>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
