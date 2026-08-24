import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Home, BookOpen, MessageSquare, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] pt-32 pb-20 px-6 max-w-4xl mx-auto flex items-center justify-center text-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 md:p-12 bg-black/80 border border-zinc-800 rounded-lg max-w-xl w-full space-y-6 shadow-2xl backdrop-blur-md"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 mx-auto">
          <Compass size={32} className="animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono text-gold-400 uppercase tracking-widest">
            HTTP 404 • Resource Relocated
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase text-white tracking-wider">
            Page Not Found
          </h1>
          <p className="text-sm text-zinc-400 font-sans max-w-md mx-auto leading-relaxed">
            The pathway you requested does not exist or has been restructured within our software architecture.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2 transition-all shadow"
          >
            <Home size={14} /> Return to Homepage
          </Link>
          <Link
            to="/academy"
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-medium text-xs uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen size={14} className="text-gold-400" /> Explore Academy
          </Link>
        </div>

        <div className="pt-6 border-t border-zinc-900 text-xs text-zinc-500 flex items-center justify-center gap-4">
          <Link to="/contact" className="hover:text-gold-400 flex items-center gap-1.5 transition-colors">
            <MessageSquare size={12} /> Contact Engineering Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
