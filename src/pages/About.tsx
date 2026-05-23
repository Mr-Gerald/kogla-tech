import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="pt-32 px-6 pb-20 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">Who is <span className="text-gold-500">Kogla Tech?</span></h1>
        <p className="text-gray-400 text-xl mb-12">Kogla Tech is a premium, futuristic technology ecosystem focused on digital transformation, elite software solutions, and empowering the next generation of global innovators.</p>
        
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <h3 className="text-2xl font-bold mb-4 font-display">Our Mission</h3>
                <p className="text-gray-400">To bridge the gap between practical technology education and real-world digital enterprise demands through innovation and excellence.</p>
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-4 font-display">Our Vision</h3>
                <p className="text-gray-400">To scale as a billion-dollar global technology conglomerate, fostering startups, entrepreneurs, and digital solutions worldwide.</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
