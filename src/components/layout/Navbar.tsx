import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, LogOut, ShieldAlert, Award, Star, CheckSquare, Mail, MessageCircle, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const { user, profile, notifications, logout, markNotificationRead } = useAuth();
  const { config } = useSiteConfig();
  
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Academy', path: '/academy' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];
  
  const handleNavClick = () => {
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between p-4 bg-black/95 backdrop-blur-md border-b border-gray-900 font-sans">
      <Link to="/" onClick={() => setIsOpen(false)} className="shrink-0 transition-opacity hover:opacity-90 flex items-center gap-2">
        {config.logoUrl ? (
          <img src={config.logoUrl} alt={config.companyName} className="h-9 border border-gold-500/50 p-1 rounded-sm object-contain bg-black/50" />
        ) : (
          <span className="text-lg font-display font-bold text-white tracking-widest uppercase flex items-center gap-1">
            {config.logoText.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-gold-500' : 'text-white'}>{word}</span>
            ))}
          </span>
        )}
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden lg:flex gap-6 items-center text-xs font-mono uppercase tracking-wider">
        {navItems.map(item => (
          <Link 
            key={item.name} 
            to={item.path} 
            onClick={handleNavClick} 
            className={`hover:text-gold-500 transition-colors ${location.pathname === item.path ? 'text-gold-500 font-bold' : 'text-gray-300'}`}
          >
            {item.name}
          </Link>
        ))}

        {user && profile ? (
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-900 relative">
            
            {/* XP and progress overview */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 text-[10px] rounded-sm">
              <Award size={12} />
              <span>{profile.xp || 0} XP</span>
              <span className="text-gray-600">|</span>
              <CheckSquare size={12} className="text-gray-400" />
              <span className="text-gray-300">{(profile.completedRooms || []).length} rooms</span>
            </div>

            {/* Notifications Button */}
            <div className="relative" ref={notifDropdownRef}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-1.5 hover:bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors relative"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-80 bg-gray-950 border border-gray-900 shadow-xl overflow-hidden z-50 text-left font-sans text-xs rounded-sm"
                  >
                    <div className="p-3 bg-black border-b border-gray-900 flex justify-between items-center">
                      <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block font-bold">
                        NOTIFICATIONS ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[9px] text-gold-500 uppercase font-mono">Live logs</span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-950">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-600 font-mono text-[10px]">
                          No notifications broadcasted.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={async () => {
                              if (!notif.read) {
                                await markNotificationRead(notif.id);
                              }
                            }}
                            className={`p-3.5 transition-colors cursor-pointer ${notif.read ? 'bg-transparent text-gray-500' : 'bg-gold-500/5 hover:bg-gold-500/10 text-gray-200'}`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="font-display font-medium text-[11px] text-white uppercase tracking-wider block">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-1 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                              {notif.body}
                            </p>
                            <span className="text-[8px] text-gray-600 font-mono mt-1.5 block uppercase">
                              {new Date(notif.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Page Link */}
            <Link 
              to="/profile"
              className="p-1.5 hover:bg-gray-900 bg-transparent border border-gray-800 text-gray-300 hover:text-gold-500 transition-colors flex items-center gap-1"
              title="Manage Profile & Settings"
            >
              <User size={14} />
            </Link>

            {/* Admin Command Portal Shortcut if Admin */}
            {profile.role === 'admin' && (
              <Link 
                to="/admin" 
                className="p-1.5 hover:bg-red-950/30 border border-red-500/20 text-red-500 hover:text-red-400 transition-colors"
                title="Administrative Access Panel"
              >
                <ShieldAlert size={14} />
              </Link>
            )}

            {/* Log Out */}
            <button 
              onClick={logout}
              className="p-1.5 hover:bg-gray-900 bg-transparent border border-gray-800 text-gray-300 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Link to="/auth/login" className="ml-4 px-4 py-1.5 border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black transition-all font-semibold rounded-sm">
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Hamburger navigation */}
      <div className="flex items-center gap-3 lg:hidden">
        {user && profile && (
          <Link to="/academy" className="text-[10px] font-mono px-2 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-500 uppercase rounded-sm">
            {profile.xp || 0} XP
          </Link>
        )}
        <button className="text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-black border-b border-gray-800 flex flex-col p-4 gap-4 lg:hidden z-50 font-mono text-xs uppercase"
          >
            {navItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
                onClick={handleNavClick} 
                className="text-sm text-gray-300 hover:text-gold-500 transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* Instant Contact Options in Mobile Menu Dropdown */}
            <div className="pt-3 border-t border-gray-900 grid grid-cols-3 gap-1.5">
              <a 
                href={`mailto:${config.contactEmail || 'solutions@koglatech.com'}?subject=Inquiry%20-%20Kogla%20Tech`}
                onClick={() => setIsOpen(false)}
                className="py-2 px-1.5 bg-gray-900 border border-gray-800 hover:border-gold-500 text-white font-bold text-[9px] uppercase tracking-wider font-display rounded-sm flex items-center justify-center gap-1"
              >
                <Mail size={11} /> Email
              </a>
              <a 
                href={`tel:${(config.contactPhone || '+2347012489041').replace(/[^0-9+]/g, '')}`}
                onClick={() => setIsOpen(false)}
                className="py-2 px-1.5 bg-gold-500 text-black font-bold text-[9px] uppercase tracking-wider font-display rounded-sm flex items-center justify-center gap-1"
              >
                <Phone size={11} className="fill-current" /> Call Us
              </a>
              <a 
                href={config.whatsappLink || 'https://wa.me/2347012489041'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="py-2 px-1.5 bg-emerald-600 text-white font-semibold text-[9px] uppercase tracking-wider font-display rounded-sm flex items-center justify-center gap-1"
              >
                <MessageCircle size={11} /> WhatsApp
              </a>
            </div>

            {user && profile ? (
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-900">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Academy Profile</span>
                  <span className="text-gold-500 font-bold">{profile.xp || 0} XP accumulated</span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-center bg-zinc-900 hover:bg-zinc-800 text-gold-400 border border-gold-500/30 text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 rounded-sm"
                >
                  <User size={13} /> Manage Profile & Account
                </Link>
                {profile.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)} 
                    className="py-2.5 text-center bg-red-950/30 text-red-400 border border-red-500/20 text-[10px]"
                  >
                    Administrative Portal
                  </Link>
                )}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="py-2.5 text-center bg-gray-950 text-gray-300 border border-gray-800 text-[10px] uppercase flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-900">
                <Link to="/auth/login" onClick={() => setIsOpen(false)} className="py-2.5 text-center border border-gold-500 text-gold-500 text-[10px] tracking-widest uppercase">
                  Sign In
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
