import { motion } from 'motion/react';

const courses = [
    { title: 'Full Stack Web Dev', level: 'Advanced', duration: '6 Months' },
    { title: 'Cybersecurity Analyst', level: 'Intermediate', duration: '4 Months' },
    { title: 'AI & Machine Learning', level: 'Advanced', duration: '8 Months' },
    { title: 'UI/UX Design', level: 'Beginner', duration: '3 Months' },
    { title: 'Data Analysis', level: 'Intermediate', duration: '5 Months' },
    { title: 'Product Management', level: 'Intermediate', duration: '4 Months' },
    { title: 'Digital Marketing', level: 'Beginner', duration: '2 Months' },
];

export default function Academy() {
    return (
        <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-12 text-center">Kogla <span className="text-gold-500">Academy Core</span></h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(c => (
                    <motion.div key={c.title} whileHover={{ y: -5 }} className="p-8 border border-gray-800 bg-gray-900/50">
                        <h3 className="text-2xl font-semibold mb-3 font-display">{c.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-400 mb-6">
                            <span>Level: {c.level}</span>
                            <span>Duration: {c.duration}</span>
                        </div>
                        <button className="px-6 py-2 border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black">Enroll Now</button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
