import { motion } from 'motion/react';
import { Mail, MapPin } from 'lucide-react';

export default function Contact() {
    return (
        <div className="pt-32 px-6 pb-20 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-16 text-center">Get In <span className="text-gold-500">Touch</span></h1>
            
            <div className="grid md:grid-cols-2 gap-16">
              <form className="space-y-6">
                  <input type="text" placeholder="Name" className="w-full p-4 bg-gray-900 border border-gray-800" />
                  <input type="email" placeholder="Email" className="w-full p-4 bg-gray-900 border border-gray-800" />
                  <textarea placeholder="Message" className="w-full p-4 bg-gray-900 border border-gray-800 h-40" />
                  <button className="w-full px-8 py-4 bg-gold-500 text-black font-semibold hover:opacity-90">Send Message</button>
              </form>
              <div className="space-y-8">
                  <div className="flex gap-4"><Mail className="text-gold-500" /> <span>info@koglatech.com</span></div>
                  <div className="flex gap-4"><MapPin className="text-gold-500" /> <span>Kogla Tech Global Headquarters</span></div>
              </div>
            </div>
        </div>
    );
}
