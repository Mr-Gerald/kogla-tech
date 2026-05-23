import { motion } from 'motion/react';

const projects = [
    { name: 'AI Automator', category: 'AI Lab' },
    { name: 'SecureBank UI', category: 'UX' },
    { name: 'Data Insights', category: 'Data Analysis' },
    { name: 'Finance App', category: 'Mobile' },
];

export default function Projects() {
    return (
        <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-12 text-center text-gold-500">Project <span className="text-white">Showcase</span></h1>
            <div className="grid md:grid-cols-2 gap-8">
                {projects.map(p => (
                    <motion.div key={p.name} whileHover={{ scale: 1.02 }} className="h-64 border border-gray-800 bg-gray-900/50 flex flex-col justify-end p-8">
                        <span className="text-gold-500 mb-2">{p.category}</span>
                        <h3 className="text-3xl font-semibold font-display">{p.name}</h3>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
