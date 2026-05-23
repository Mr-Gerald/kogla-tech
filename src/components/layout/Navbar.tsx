import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const LOGO_URL = 'https://scontent.xx.fbcdn.net/v/t1.15752-9/679033424_1340416481327917_3114449704387631566_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_ohc=QTFzuqvVyEwQ7kNvwEQ3HkO&_nc_oc=Adq0Aps1oCzdcFqAZAUORHxlDuik930FWgR7q_bG6Rrw_VSh-1RqFtChA7cCqPbZbATlZ4M_Wu3uMuKpC9WlPuHY&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD5QFiQMxoovDD8V-pDwIuGMWsjPDrhbJXde89ezXPA-rM5w&oe=6A39344C';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const navItems = [
    { name: 'Home', path: isHome ? '#home' : '/' },
    { name: 'Academy', path: isHome ? '#academy' : '/academy' },
    { name: 'About', path: isHome ? '#about' : '/about' },
    { name: 'Services', path: isHome ? '#services' : '/services' },
    { name: 'Projects', path: isHome ? '#projects' : '/projects' },
    { name: 'Contact', path: isHome ? '#contact' : '/contact' },
  ];
  
  const handleNavClick = (path: string) => {
    setIsOpen(false);
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between p-4 bg-black-950/80 backdrop-blur-md border-b border-gray-800">
      <Link to="/" onClick={() => setIsOpen(false)}>
        <img src={LOGO_URL} alt="Kogla Tech" className="h-8 border border-gold-500/50 p-1 rounded-sm" />
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center text-sm font-medium">
        {navItems.map(item => (
          <a key={item.name} href={item.path} onClick={() => handleNavClick(item.path)} className="hover:text-gold-500 transition-colors">
            {item.name}
          </a>
        ))}
        <Link to="/auth/login" className="ml-4 px-3 py-1.5 border border-gold-500 text-gold-500 text-xs hover:bg-gold-500 hover:text-black transition-all">Login</Link>
      </div>

      {/* Mobile Hamburger */}
      <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-black border-b border-gray-800 flex flex-col p-4 gap-4 md:hidden z-50"
          >
            {navItems.map(item => (
              <a key={item.name} href={item.path} onClick={() => handleNavClick(item.path)} className="text-sm font-medium hover:text-gold-500 transition-colors">
                {item.name}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-900">
              <Link to="/auth/login" onClick={() => setIsOpen(false)} className="px-4 py-2 text-center border border-gold-500 text-gold-500 text-xs rounded-sm">Login</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
