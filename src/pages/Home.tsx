import { motion } from 'motion/react';
import { ArrowRight, Cpu, Shield, Zap, BookOpen, BarChart3, Globe, ChevronRight, Mail, Users, Building, Code, Smartphone, Layers, Cloud, Briefcase, Award, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
    { label: 'Global Students', value: '15,000+' },
    { label: 'Projects Completed', value: '4,200+' },
    { label: 'Expert Mentors', value: '250+' },
    { label: 'Global Divisions', value: '14' },
];

const ecosystem = ['Academy', 'Solutions', 'AI', 'Cybersecurity', 'Labs', 'Digital', 'Innovations', 'Incubator'];
const courses = ['Web Development', 'Cybersecurity', 'AI & Automation', 'UI/UX Design', 'Data Analysis', 'Product Mgmt', 'Digital Marketing', 'Cloud Architecture', 'Mobile Apps'];
const services = ['AI Automation', 'Cyber Defense Infrastructure', 'Web Development', 'Mobile App Development', 'Business Tech Consulting', 'Digital Branding & Design', 'Product Strategy', 'Cloud Solution Hosting', 'Workflow Optimization', 'Technical Mentorship'];

export default function Home() {
  return (
    <div className="text-gray-100">
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/src/assets/images/hero_coder_image_1779562735408.png" alt="Programming workspace" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-center relative z-10">
          <h1 className="text-4xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-b from-white via-gold-500 to-white bg-clip-text text-transparent">
            Learn. Build. Innovate.
          </h1>
          <p className="text-xs md:text-base text-gray-400 max-w-lg mx-auto mb-8">
            Kogla Tech is the premium ecosystem for the next generation of digital innovators. We turn ambition into enterprise-grade reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button className="px-5 py-2.5 bg-gold-500 text-black font-semibold rounded-sm flex items-center justify-center gap-1.5 text-xs">
              Get Started <ArrowRight size={14} />
            </button>
            <button className="px-5 py-2.5 border border-gray-700 hover:border-gold-500 rounded-sm text-xs">
              Explore Ecosystem
            </button>
          </div>
        </motion.div>
        
        {/* Animated Marquee CTA */}
        <div className="w-full overflow-hidden whitespace-nowrap bg-gray-900/50 py-3 border-y border-gray-800">
            <motion.div animate={{ x: ['100%', '-100%'] }} transition={{ repeat: Infinity, duration: 15, ease: 'linear' }} className="text-gold-500 text-xs font-display tracking-widest uppercase">
                Register Now for Our Next Cohort • Expert-Led Tech Training • Advanced AI Masterclasses • Global Internship Programs • Apply Today • Build Your Future
            </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-950 border-y border-gray-900 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
            <div key={s.label} className="text-center border-r last:border-r-0 border-gray-800">
                <div className="text-3xl md:text-4xl font-display text-gold-500 mb-1">{s.value}</div>
                <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">{s.label}</div>
            </div>
        ))}
      </section>

      <section id="about" className="py-20 px-6 bg-black text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">About Kogla Tech</h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">Kogla Tech is a premium, futuristic technology ecosystem focused on digital transformation, elite software solutions, and empowering innovators globally. We operate at the intersection of practical education and enterprise-grade tech delivery.</p>
      </section>

      <section id="academy" className="py-20 px-6 bg-gray-900 border-t border-gray-800">
          <img src="/src/assets/images/academy_image_1779563651039.png" alt="Academy" className="w-full h-48 object-cover mb-8 rounded-sm"/>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">Academy & Learning Paths</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {courses.map(title => (
                <Link key={title} to={`/academy/${title.toLowerCase().replace(/ /g, '-')}`} className="p-4 border border-gray-800 bg-gray-950 hover:border-gold-500 transition-all flex flex-col items-center text-center">
                    <BookOpen className="text-gold-500 mb-3" size={20} />
                    <h3 className="text-xs font-semibold font-display">{title}</h3>
                </Link>
            ))}
          </div>
      </section>

      <section id="services" className="py-20 px-6 bg-black border-t border-gray-800">
          <img src="/src/assets/images/services_image_1779563668755.png" alt="Services" className="w-full h-48 object-cover mb-8 rounded-sm"/>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">Premium Solution Ecosystem</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {services.map(title => (
                <Link key={title} to={`/services/${title.toLowerCase().replace(/ /g, '-')}`} className="p-6 border border-gray-800 bg-gray-900 hover:border-gold-500 transition-all flex items-center gap-3">
                    <Zap className="text-gold-500" size={20} />
                    <h3 className="text-xs font-semibold font-display">{title}</h3>
                </Link>
            ))}
          </div>
      </section>

      <section id="projects" className="py-20 px-6 bg-gray-950 border-t border-gray-800">
          <img src="/src/assets/images/projects_image_1779563685288.png" alt="Projects" className="w-full h-48 object-cover mb-8 rounded-sm"/>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">Featured Case Studies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[['AI Infrastructure', 'Enterprise AI/ML'], ['Cyber Immunity', 'Zero-Trust Defense'], ['Digital Transformation', 'Retail Enterprise'], ['Web Ecosystem', 'Global SaaS']].map(([title, desc]) => (
                <div key={title} className="h-40 p-6 border border-gray-800 bg-gray-900 flex flex-col justify-end">
                    <h3 className="text-lg font-display font-bold">{title}</h3>
                    <p className="text-[10px] text-gray-500">{desc}</p>
                </div>
            ))}
          </div>
      </section>

      <section className="py-20 px-6 bg-black border-t border-gray-800">
        <img src="/src/assets/images/labs_image_1779563699805.png" alt="Labs" className="w-full h-48 object-cover mb-8 rounded-sm"/>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">Innovation Labs & AI Research</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {['LLM Optimization', 'Cyber Security Labs', 'Automation OS'].map(title => (
                <div key={title} className="p-8 border border-gray-800 bg-gray-900 text-center">
                    <Cpu size={32} className="text-gold-500 mx-auto mb-4"/>
                    <h3 className="text-sm font-bold font-display">{title}</h3>
                </div>
            ))}
        </div>
      </section>

      <section id="contact" className="py-20 px-6 bg-gray-950 border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 text-center">Get In Touch</h2>
            <form className="space-y-3">
                <input type="text" placeholder="Name" className="w-full p-2.5 bg-black border border-gray-800 text-xs" />
                <input type="email" placeholder="Business Email" className="w-full p-2.5 bg-black border border-gray-800 text-xs" />
                <textarea placeholder="Message" className="w-full p-2.5 bg-black border border-gray-800 h-20 text-xs" />
                <button className="w-full px-6 py-2.5 bg-gold-500 text-black font-semibold text-xs">Send Request</button>
            </form>
        </div>
      </section>
    </div>
  );
}
