import React, { useState, useEffect } from 'react';
import { 
  getImageConfig, 
  saveImageConfig, 
  getInquiries, 
  updateInquiryStatus, 
  deleteInquiry, 
  Inquiry, 
  ImageConfig,
  DEFAULT_IMAGES
} from '../utils/storage';
import { 
  Settings, 
  Layers, 
  Image as ImageIcon, 
  Mail, 
  Check, 
  Trash2, 
  TrendingUp, 
  BookOpen, 
  Zap, 
  RefreshCw, 
  Lock, 
  Eye, 
  Briefcase, 
  Sparkles, 
  ArrowUpRight,
  Upload
} from 'lucide-react';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('kogla_admin_auth') === 'true';
  });
  const [localUsername, setLocalUsername] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [images, setImages] = useState<ImageConfig>({
    hero: '',
    academy: '',
    services: '',
    projects: '',
    labs: ''
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [tab, setTab] = useState<'leads' | 'images'>('leads');

  // Load state on mount
  useEffect(() => {
    if (isAuthenticated) {
      setImages(getImageConfig());
      setInquiries(getInquiries());
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUsername.toUpperCase() === 'ADMIN' && localPassword === 'ADMIN77') {
      setIsAuthenticated(true);
      sessionStorage.setItem('kogla_admin_auth', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Unauthorized administrative credentials. Verification failed.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kogla_admin_auth');
    setLocalUsername('');
    setLocalPassword('');
  };

  const handleUpdateImage = (key: keyof ImageConfig, value: string) => {
    const updated = { ...images, [key]: value };
    setImages(updated);
    saveImageConfig(updated);
    triggerSuccess('Image configuration saved and live!');
  };

  const handleStatusChange = (id: string, newStatus: Inquiry['status']) => {
    const updated = updateInquiryStatus(id, newStatus);
    setInquiries(updated);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this lead record?')) {
      const updated = deleteInquiry(id);
      setInquiries(updated);
      setSelectedInquiry(null);
      triggerSuccess('Lead deleted successfully.');
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Convert files locally to Base64 in standard way for React
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof ImageConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleUpdateImage(key, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset premium high-quality stock technology background options
  const presets: Record<keyof ImageConfig, Array<{ label: string; url: string }>> = {
    hero: [
      { label: 'Original Cinematic Workspace', url: DEFAULT_IMAGES.hero },
      { label: 'Cyberpunk Command Center', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200' },
      { label: 'Luxury Minimalist Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200' }
    ],
    academy: [
      { label: 'Original Tech Students', url: DEFAULT_IMAGES.academy },
      { label: 'Minimal Laboratory', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1000' },
      { label: 'Corporate Tech Brainstorm', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000' }
    ],
    services: [
      { label: 'Original High-End Dashboard', url: DEFAULT_IMAGES.services },
      { label: 'Server Matrix Blades', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000' },
      { label: 'Clean Enterprise Graphs', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000' }
    ],
    projects: [
      { label: 'Original Product Showcase', url: DEFAULT_IMAGES.projects },
      { label: 'Sleek Smart Device UI', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000' },
      { label: 'Mobile Mockup Studio', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000' }
    ],
    labs: [
      { label: 'Original Innovation Lab', url: DEFAULT_IMAGES.labs },
      { label: 'Quantum Supercomputer Spark', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000' },
      { label: 'Futuristic AI Array', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000' }
    ]
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 px-4 pb-32 max-w-md mx-auto text-gray-100 font-sans flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full bg-gray-950 border border-gray-800 p-8 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full"></div>
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-full mb-3">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-display font-bold uppercase text-white tracking-widest">
              Administrative Gate
            </h2>
            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
              Kogla Tech secure operation credentials
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs text-center rounded-sm mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                Username / Identifier
              </label>
              <input 
                type="text" 
                required
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="Identifier" 
                className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white uppercase" 
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                Security Password
              </label>
              <input 
                type="password" 
                required
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
                placeholder="Password" 
                className="w-full p-2.5 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-xs text-white" 
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-[0.98] text-black font-semibold text-xs uppercase tracking-wider font-display transition-all"
            >
              Verify Credentials
            </button>
          </form>

          <p className="text-[10px] text-center text-gray-500 mt-6 leading-relaxed">
            Authorized administrative access protocol. Unauthorized connections or system tampering are logged under zero-trust defense architectures.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-4 md:px-8 pb-32 max-w-7xl mx-auto text-gray-100 font-sans">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-8 rounded-sm mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-display tracking-widest uppercase">Kogla Administrator Suite</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-2 py-0.5 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 text-[9px] uppercase tracking-wider rounded-sm transition-all bg-red-950/20"
            >
              Sign Out
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            System Operations Panel
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Audit live incoming program enrollments, review enterprise customized architectural briefs, and update landing page imagery in real-time.
          </p>
        </div>

        {/* Action Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/40 p-3 border border-gray-800/60 rounded-sm">
          <div className="px-3 py-1">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Total Leads</span>
            <span className="text-lg font-display font-bold text-white">{inquiries.length}</span>
          </div>
          <div className="px-3 py-1 border-l border-gray-800">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Unread</span>
            <span className="text-lg font-display font-bold text-gold-500">
              {inquiries.filter(i => i.status === 'Unread').length}
            </span>
          </div>
          <div className="px-3 py-1 border-l border-gray-800">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Enrollments</span>
            <span className="text-lg font-display font-bold text-cyan-400">
              {inquiries.filter(i => i.type === 'enrollment').length}
            </span>
          </div>
          <div className="px-3 py-1 border-l border-gray-800">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Inquiries</span>
            <span className="text-lg font-display font-bold text-purple-400">
              {inquiries.filter(i => i.type === 'solution_inquiry').length}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Status feedback bar */}
      {successMsg && (
        <div className="p-3 bg-gold-500 text-black font-semibold text-xs rounded-sm mb-6 flex items-center gap-2 animate-bounce justify-center">
          <Check size={14} /> {successMsg}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-gray-800 mb-8 font-display">
        <button 
          onClick={() => setTab('leads')}
          className={`px-6 py-3 text-xs uppercase tracking-widest transition-all ${
            tab === 'leads' 
              ? 'border-b-2 border-gold-500 text-gold-500 bg-gray-900/30 font-semibold' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          User Requests & CRM Lead List ({inquiries.length})
        </button>
        <button 
          onClick={() => setTab('images')}
          className={`px-6 py-3 text-xs uppercase tracking-widest transition-all ${
            tab === 'images' 
              ? 'border-b-2 border-gold-500 text-gold-500 bg-gray-900/30 font-semibold' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Landing Page Image Controls
        </button>
      </div>

      {tab === 'leads' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Incoming Stream list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-950 border border-gray-800 rounded-sm">
              <div className="p-4 border-b border-gray-800 bg-black/40 flex items-center justify-between">
                <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                  Lead stream logs & records
                </span>
                <span className="text-[10px] text-gray-400">
                  Select a record to inspect full briefs
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">
                  No submissions recorded yet. Try filling an enrollment or service form to see your requests pop up here in real-time!
                </div>
              ) : (
                <div className="divide-y divide-gray-900 max-h-[600px] overflow-y-auto">
                  {inquiries.map((inq) => (
                    <div 
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`p-4 transition-all cursor-pointer flex items-start gap-4 hover:bg-gray-900/30 ${
                        selectedInquiry?.id === inq.id ? 'bg-gold-500/5 border-l-2 border-gold-500' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {inq.type === 'enrollment' ? (
                          <div className="p-1.5 rounded-sm bg-cyan-950 text-cyan-400">
                            <BookOpen size={16} />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-sm bg-purple-950 text-purple-400">
                            <Zap size={16} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-white truncate font-display">
                            {inq.senderName}
                          </h4>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {new Date(inq.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gold-500 font-display font-semibold mb-1 truncate">
                          {inq.title}
                        </p>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                          {inq.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold font-mono border ${
                            inq.status === 'Unread' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' 
                              : inq.status === 'In Progress'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : inq.status === 'Contacted'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full Inspector card */}
          <div className="lg:col-span-1">
            {selectedInquiry ? (
              <div className="bg-gray-950 border border-gray-800 p-6 rounded-sm sticky top-28 space-y-6">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Inquiry Inspect Tool</span>
                  <h3 className="text-base font-display font-bold text-white mt-1 break-words">
                    {selectedInquiry.senderName}
                  </h3>
                  <p className="text-xs text-gold-500 font-mono mt-1 font-semibold">
                    {selectedInquiry.senderEmail}
                  </p>
                </div>

                <div className="border-y border-gray-900 py-4 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Program / Technology:</span>
                    <span className="text-white font-medium text-right break-words max-w-[140px]">
                      {selectedInquiry.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Inquiry Intake ID:</span>
                    <span className="text-gray-400 font-mono">{selectedInquiry.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Recorded:</span>
                    <span className="text-gray-400">
                      {new Date(selectedInquiry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Category:</span>
                    <span className="text-white font-semibold capitalize font-mono text-xs">
                      {selectedInquiry.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-display text-gold-400 font-semibold mb-2 uppercase tracking-wide">
                    Client Description Statement & Timeline:
                  </h4>
                  <div className="p-4 bg-black border border-gray-900 rounded-sm text-xs text-gray-300 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line font-serif">
                    {selectedInquiry.description}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest">
                    Operational Status Actions:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleStatusChange(selectedInquiry.id, 'In Progress')}
                      className={`py-2 text-xs rounded-sm transition-all border ${
                        selectedInquiry.status === 'In Progress'
                          ? 'bg-yellow-500 text-black font-semibold border-yellow-500'
                          : 'bg-transparent border-gray-800 hover:border-yellow-500/50 text-yellow-500'
                      }`}
                    >
                      Set In Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedInquiry.id, 'Contacted')}
                      className={`py-2 text-xs rounded-sm transition-all border ${
                        selectedInquiry.status === 'Contacted'
                          ? 'bg-green-500 text-black font-semibold border-green-500'
                          : 'bg-transparent border-gray-800 hover:border-green-500/50 text-green-400'
                      }`}
                    >
                      Set Contacted
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(selectedInquiry.id, 'Unread')}
                      className="flex-1 py-1.5 bg-gray-900 hover:bg-gray-800 text-[10px] uppercase tracking-wider border border-gray-800 text-gray-400"
                    >
                      Reset to Unread
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedInquiry.id)}
                      className="px-3 bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 rounded-sm flex items-center justify-center transition-colors"
                      title="Permanently remove record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-sm text-center text-gray-500 text-xs">
                Select an intake file from the left panel to inspect detailed telemetry, system timeline logs, and edit assignment states.
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Landing page images grid configuration */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* HERO BG */}
            <div className="bg-gray-950 border border-gray-800 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Hero Workspace Background
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Main Banner
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img src={images.hero} alt="Hero background configuration preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.hero} 
                    onChange={(e) => handleUpdateImage('hero', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3"
                    placeholder="Paste public image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presets.hero.map((opt) => (
                      <button 
                        key={opt.url} 
                        onClick={() => handleUpdateImage('hero', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all ${
                          images.hero === opt.url ? 'border-gold-500 bg-gold-500/5 text-gold-500' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={14} />
                      Choose or Capture Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'hero')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ACADEMY BG */}
            <div className="bg-gray-950 border border-gray-850 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Academy Section Collage
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Learning Section
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img src={images.academy} alt="Academy image preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.academy} 
                    onChange={(e) => handleUpdateImage('academy', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presets.academy.map((opt) => (
                      <button 
                        key={opt.url} 
                        onClick={() => handleUpdateImage('academy', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all ${
                          images.academy === opt.url ? 'border-gold-500 bg-gold-500/5 text-gold-500' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={14} />
                      Choose or Capture Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'academy')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES BG */}
            <div className="bg-gray-950 border border-gray-850 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Services Display Banner
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Intake & Solutions
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img src={images.services} alt="Services visual preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.services} 
                    onChange={(e) => handleUpdateImage('services', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presets.services.map((opt) => (
                      <button 
                        key={opt.url} 
                        onClick={() => handleUpdateImage('services', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all ${
                          images.services === opt.url ? 'border-gold-500 bg-gold-500/5 text-gold-500' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={14} />
                      Choose or Capture Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'services')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* PROJECTS BG */}
            <div className="bg-gray-950 border border-gray-850 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Projects & Case Studies Visual
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    Showcase
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img src={images.projects} alt="Projects visual preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.projects} 
                    onChange={(e) => handleUpdateImage('projects', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presets.projects.map((opt) => (
                      <button 
                        key={opt.url} 
                        onClick={() => handleUpdateImage('projects', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all ${
                          images.projects === opt.url ? 'border-gold-500 bg-gold-500/5 text-gold-500' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={14} />
                      Choose or Capture Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'projects')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* LABS BG */}
            <div className="bg-gray-950 border border-gray-850 rounded-sm flex flex-col justify-between">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase text-gold-500 tracking-wider">
                    Innovation Labs Hardware Header
                  </span>
                  <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-mono rounded">
                    AI Research Labs
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-32 bg-black border border-gray-900 overflow-hidden rounded-sm relative group">
                  <img src={images.labs} alt="Labs hardware preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-gray-300 transition-all">
                    Active Landing Live View
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Direct Image Web Address (URL)</label>
                  <input 
                    type="text" 
                    value={images.labs} 
                    onChange={(e) => handleUpdateImage('labs', e.target.value)}
                    className="w-full p-2 bg-black border border-gray-800 text-xs text-white rounded-sm mb-3"
                    placeholder="Paste image link..." 
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Or select theme presets:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {presets.labs.map((opt) => (
                      <button 
                        key={opt.url} 
                        onClick={() => handleUpdateImage('labs', opt.url)}
                        className={`p-1.5 text-[10px] text-left border rounded-sm truncate transition-all ${
                          images.labs === opt.url ? 'border-gold-500 bg-gold-500/5 text-gold-500' : 'border-gray-900 hover:border-gray-800 text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-900 pt-3 space-y-2">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">Upload Custom Image (Phone &amp; Desktop):</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500/90 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={14} />
                      Choose or Capture Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'labs')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="p-6 bg-black border border-gray-900 rounded-sm">
            <h4 className="text-xs font-display text-gold-500 font-bold uppercase tracking-wider mb-2">💡 Quick Administrative Tip</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              When pasting raw URLs or custom pictures, the system immediately applies them globally inside our shared state layout configurations without rebooting. If any image breaks, you can press any of the preset button selectors above to return instantly to our optimized high-fidelity generated corporate image assets.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
