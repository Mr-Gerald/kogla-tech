import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig, SiteConfig } from '../context/SiteConfigContext';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getImageConfig, 
  saveImageConfig, 
  Inquiry, 
  ImageConfig,
  DEFAULT_IMAGES 
} from '../utils/storage';
import { UserProfile } from '../types';
import { Link } from 'react-router-dom';
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
  Upload,
  Users,
  Bell,
  Send,
  Loader2,
  Calendar,
  CheckCircle,
  FileText,
  Terminal
} from 'lucide-react';

export default function AdminPortal() {
  const { user, profile, logout, loading } = useAuth();
  
  // Site Settings config hooks
  const { config, updateConfig, images: syncImages, updateImages } = useSiteConfig();

  const [images, setImages] = useState<ImageConfig>(syncImages);

  useEffect(() => {
    if (syncImages) {
      setImages(syncImages);
    }
  }, [syncImages]);

  // Firestore DB states
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Notifications Dispatcher state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tab, setTab] = useState<'leads' | 'users' | 'images' | 'settings'>('leads');

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [siteForm, setSiteForm] = useState<SiteConfig>(config);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (config) {
      setSiteForm(config);
    }
  }, [config]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateConfig(siteForm);
      triggerSuccess('Site configurations synchronized globally across the live database!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed updating configurations: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSiteForm(prev => ({ ...prev, logoUrl: reader.result }));
          triggerSuccess('Logo file loaded! Submit settings below to commit changes.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSiteForm(prev => ({ ...prev, faviconUrl: reader.result }));
          triggerSuccess('Favicon file loaded! Submit settings below to commit changes.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Load local state & Firestore Listeners on Auth load
  useEffect(() => {
    if (profile?.role === 'admin') {
      // 1. Listen to dynamic child inquiries from Firestore
      const inquiriesRef = collection(db, 'inquiries');
      const unsubInquiries = onSnapshot(inquiriesRef, (snapshot) => {
        const loaded: Inquiry[] = [];
        snapshot.forEach((snap) => {
          loaded.push(snap.data() as Inquiry);
        });
        // Sort stably on client side descending by timestamp
        loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setInquiries(loaded);
      }, (err) => {
        console.error('Firestore inquiries sync failed:', err);
      });

      // 2. Listen to registered profiles database
      const usersRef = collection(db, 'users');
      const unsubUsers = onSnapshot(usersRef, (snapshot) => {
        const loaded: UserProfile[] = [];
        snapshot.forEach((snap) => {
          loaded.push(snap.data() as UserProfile);
        });
        // Sort by XP of users
        loaded.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        setUsers(loaded);
      }, (err) => {
        console.error('Firestore users sync failed:', err);
      });

      return () => {
        unsubInquiries();
        unsubUsers();
      };
    }
  }, [profile]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUpdateImage = (key: keyof ImageConfig, value: string) => {
    const updated = { ...images, [key]: value };
    setImages(updated);
    updateImages(updated).catch((err) => {
      console.error('Failed to update image globally:', err);
    });
    triggerSuccess(`Landing panel image "${key}" updated live!`);
  };

  // Convert files locally to Base64
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

  const handleStatusChange = async (id: string, newStatus: Inquiry['status']) => {
    setIsUpdatingStatus(true);
    try {
      const docRef = doc(db, 'inquiries', id);
      await updateDoc(docRef, { status: newStatus });
      
      // Update local state references instantly too
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }

      // If updating to contacted or processing, build an automated user notification
      const targetInq = inquiries.find(i => i.id === id);
      if (targetInq && targetInq.userId) {
        const autoNotifId = `auto-inq-${Date.now()}`;
        const notifRef = doc(db, 'notifications', autoNotifId);
        await setDoc(notifRef, {
          id: autoNotifId,
          userId: targetInq.userId,
          title: `Project State: ${newStatus}`,
          body: `Director status updated: Your intake request regarding "${targetInq.title}" is now set to ${newStatus}. An executive engineer will trace contact.`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }

      triggerSuccess(`Intake status updated successfully, and automated notification dispatched!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed updating status: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTogglePaid = async (userId: string, currentPaidState?: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isPaid: !currentPaidState, updatedAt: new Date().toISOString() });
      if (selectedUser && selectedUser.uid === userId) {
        setSelectedUser({ ...selectedUser, isPaid: !currentPaidState });
      }
      triggerSuccess(`User paid clearance successfully updated to ${!currentPaidState ? 'PAID / APPROVED' : 'UNPAID'}!`);
    } catch (err: any) {
      setErrorMsg(`Failed updating user paid status: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Verify: Permanently purge this database inquiries file?')) {
      try {
        const docRef = doc(db, 'inquiries', id);
        await deleteDoc(docRef);
        setSelectedInquiry(null);
        triggerSuccess('Intake record purged securely.');
      } catch (err: any) {
        console.error(err);
        setErrorMsg(`Failed to delete record: ${err.message}`);
        setTimeout(() => setErrorMsg(''), 5000);
      }
    }
  };

  // Transmit customized system notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!notifTitle.trim() || !notifBody.trim()) {
      alert('Notification Title and Description are required parameters.');
      return;
    }

    setIsSendingNotif(true);
    try {
      const notifId = `sys-notif-${Date.now()}`;
      const docRef = doc(db, 'notifications', notifId);
      await setDoc(docRef, {
        id: notifId,
        userId: selectedUser.uid,
        title: notifTitle.trim(),
        body: notifBody.trim(),
        read: false,
        timestamp: new Date().toISOString()
      });

      setNotifTitle('');
      setNotifBody('');
      triggerSuccess(`Sovereign alert payload dispatched directly into ${selectedUser.name}'s account inbox!`);
    } catch (err: any) {
      console.error(err);
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const presetImagesList: Record<keyof ImageConfig, Array<{ label: string; url: string }>> = {
    hero: [
      { label: 'Original Cinematic Workspace', url: DEFAULT_IMAGES.hero },
      { label: 'Nigerian Tech Developer Workspace', url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1200' },
      { label: 'Lagos Tech Hub Innovation Founder', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200' },
      { label: 'Cyberpunk Command Center', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200' },
      { label: 'Luxury Minimalist Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200' }
    ],
    academy: [
      { label: 'Original Tech Students', url: DEFAULT_IMAGES.academy },
      { label: 'Nigerian Tech Students Cohort', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000' },
      { label: 'Lagos Peer Programming Workshop', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000' },
      { label: 'African Cloud Engineers Seminar', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000' },
      { label: 'Minimal Laboratory', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1000' }
    ],
    services: [
      { label: 'Original High-End Dashboard', url: DEFAULT_IMAGES.services },
      { label: 'African SaaS Solutions Briefing', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000' },
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

  // 1. Loading screen segment
  if (loading) {
    return (
      <div className="pt-40 pb-40 text-center font-mono text-xs text-gray-500 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-gold-500 mb-3" size={20} />
        Synchronizing system roles clearance keys...
      </div>
    );
  }

  // 2. Lockdown check for users without active "admin" status
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="pt-32 px-4 pb-32 max-w-lg mx-auto text-gray-100 font-sans flex flex-col items-center justify-center min-h-[75vh]">
        <div className="w-full bg-gray-950 border border-gray-900 p-8 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-full mb-3">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-display font-bold uppercase text-white tracking-widest">
              Administrative Access Restricted
            </h2>
            <p className="text-[11px] text-gray-400 mt-2 font-sans">
              This area is reserved for authorized administrators only.
            </p>
          </div>

          <div className="p-4 bg-black border border-gray-900 rounded-sm text-xs text-gray-300 font-sans leading-relaxed mb-6 space-y-3">
            <p>
              Please sign in with an administrator account to manage platform settings, view lead inquiries, and configure website content.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-center text-xs text-gray-400 font-sans mb-2">
                  Currently signed in as: <span className="text-white font-semibold">{user.email}</span> (Standard User)
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-semibold text-xs uppercase tracking-wider font-display transition-all rounded-sm"
                >
                  Sign Out / Switch Account
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link 
                  to="/auth/login" 
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider font-display text-center rounded-sm transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/auth/signup" 
                  className="flex-1 py-3 bg-transparent hover:bg-gray-900 border border-gray-800 text-white font-semibold text-xs uppercase tracking-wider font-display text-center rounded-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Clear Administrative dashboard screen
  return (
    <div className="pt-28 px-4 md:px-8 pb-32 max-w-7xl mx-auto text-gray-100 font-sans">
      
      {/* Top Banner and System stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-8 rounded-sm mb-8 flex flex-col md:flex-row md:items-center md:white justify-between gap-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-display tracking-widest uppercase">Kogla Administrator Suite</span>
            </div>
            <button 
              onClick={() => logout()}
              className="px-2 py-0.5 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 text-[9px] uppercase tracking-wider rounded-sm transition-all bg-red-950/20"
            >
              Sign Out
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            Operations command console
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Audit live incoming client requests, dispatch system alerts to student account databases, and calibrate background theme panels dynamically.
          </p>
        </div>

        {/* Action Quick Stats */}
        <div className="grid grid-cols-3 gap-3 bg-black/40 p-3 border border-gray-800/60 rounded-sm font-mono text-[11px]">
          <div className="px-3 py-1">
            <span className="block text-[9px] text-gray-500 uppercase">Lead Pipeline</span>
            <span className="text-base font-bold text-white">{inquiries.length}</span>
          </div>
          <div className="px-3 py-1 border-l border-gray-800/60">
            <span className="block text-[9px] text-gray-500 uppercase">Students Core</span>
            <span className="text-base font-bold text-cyan-400">{users.length}</span>
          </div>
          <div className="px-3 py-1 border-l border-gray-800/60">
            <span className="block text-[9px] text-gray-500 uppercase">Unread Log</span>
            <span className="text-base font-bold text-red-400">
              {inquiries.filter(i => i.status === 'Unread').length}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time feedback lines */}
      {successMsg && (
        <div className="p-3.5 bg-gold-500 text-black font-semibold text-xs rounded-sm mb-6 flex items-center gap-2 justify-center font-mono">
          <CheckCircle size={14} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-950 text-red-400 border border-red-500/20 text-xs rounded-sm mb-6 flex items-center gap-2 justify-center font-mono">
          <Lock size={14} /> [ERROR]: {errorMsg}
        </div>
      )}

      {/* Tabs list menu */}
      <div className="flex border-b border-gray-800 mb-8 font-display bg-gray-950 rounded-sm p-1 gap-1">
        <button 
          onClick={() => setTab('leads')}
          className={`flex-1 md:flex-none px-5 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'leads' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Mail size={13} /> Project Requests ({inquiries.length})
        </button>
        <button 
          onClick={() => {
            setTab('users');
            setSelectedUser(null);
          }}
          className={`flex-1 md:flex-none px-5 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'users' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Users size={13} /> Registered Students ({users.length})
        </button>
        <button 
          onClick={() => setTab('images')}
          className={`flex-1 md:flex-none px-5 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'images' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <ImageIcon size={13} /> Landing Page Images
        </button>
        <button 
          onClick={() => setTab('settings')}
          className={`flex-1 md:flex-none px-5 py-3 text-[10px] md:text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 ${
            tab === 'settings' 
              ? 'bg-gold-500 text-black font-bold' 
              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
          }`}
        >
          <Settings size={13} /> Dynamic Site Settings
        </button>
      </div>

      {/* Tab 1: Leads Section */}
      {tab === 'leads' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Stream pipeline table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-950 border border-gray-800 rounded-sm">
              <div className="p-4 border-b border-gray-800 bg-black/40 flex items-center justify-between font-mono">
                <span className="text-xs font-display font-semibold text-gold-500 uppercase tracking-wider">
                  Leads Stream Log Files
                </span>
                <span className="text-[9px] text-gray-500 uppercase">
                  Select a record to audit payload
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-16 text-center text-gray-600 text-xs font-mono">
                  [EMPTY SUITE]: No admissions requests or custom project intakes received yet.
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
                          <div className="p-2 rounded-sm bg-cyan-950/60 text-cyan-400 border border-cyan-800/30">
                            <BookOpen size={14} />
                          </div>
                        ) : (
                          <div className="p-2 rounded-sm bg-purple-950/60 text-purple-400 border border-purple-800/30">
                            <Zap size={14} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-white truncate font-display uppercase tracking-wide">
                            {inq.senderName}
                          </h4>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {new Date(inq.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gold-550 font-display font-semibold mb-1 truncate">
                          {inq.title}
                        </p>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                          {inq.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold font-mono border ${
                            inq.status === 'Unread' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : inq.status === 'In Progress'
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : inq.status === 'Contacted'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-50s/20'
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

          {/* CRM Lead Inspector */}
          <div className="lg:col-span-1">
            {selectedInquiry ? (
              <div className="bg-gray-950 border border-gray-800 p-6 rounded-sm sticky top-28 space-y-6">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Inquiry telemetry panel</span>
                  <h3 className="text-base font-display font-bold text-white mt-1 break-words">
                    {selectedInquiry.senderName}
                  </h3>
                  <p className="text-xs text-gold-500 font-mono mt-1 font-semibold">
                    {selectedInquiry.senderEmail}
                  </p>
                </div>

                <div className="border-y border-gray-900 py-4 space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service Theme:</span>
                    <span className="text-white font-medium text-right max-w-[140px] truncate">
                      {selectedInquiry.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Intake Index:</span>
                    <span className="text-gray-300">{selectedInquiry.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recorded:</span>
                    <span className="text-gray-400">
                      {new Date(selectedInquiry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="text-white font-semibold capitalize">
                      {selectedInquiry.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-display text-gold-500 font-semibold mb-2 uppercase tracking-wide">
                    Description brief statement:
                  </h4>
                  <div className="p-4 bg-black border border-gray-900 rounded-sm text-xs text-gray-300 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line font-mono text-[11px]">
                    {selectedInquiry.description}
                  </div>
                </div>

                <div className="space-y-3 font-mono">
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest">
                    Status assignments workflow:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry.id, 'In Progress')}
                      className={`py-2 text-[10.5px] rounded-sm transition-all border uppercase tracking-wider ${
                        selectedInquiry.status === 'In Progress'
                          ? 'bg-yellow-500 text-black font-semibold border-yellow-500'
                          : 'bg-transparent border-gray-900 hover:border-yellow-500/50 text-yellow-500'
                      }`}
                    >
                      In Progress
                    </button>
                    <button 
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry.id, 'Contacted')}
                      className={`py-2 text-[10.5px] rounded-sm transition-all border uppercase tracking-wider ${
                        selectedInquiry.status === 'Contacted'
                          ? 'bg-green-500 text-black font-semibold border-green-500'
                          : 'bg-transparent border-gray-900 hover:border-green-500/50 text-green-400'
                      }`}
                    >
                      Contacted
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedInquiry.id, 'Unread')}
                      className="flex-1 py-1.5 bg-gray-900 hover:bg-gray-800 text-[9px] uppercase tracking-widest border border-gray-800 text-gray-400"
                    >
                      Reset Log status
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedInquiry.id)}
                      className="px-3 bg-red-950/40 hover:bg-red-950 hover:text-red-300 text-red-400 border border-red-900/40 rounded-sm flex items-center justify-center transition-colors"
                      title="Purge record file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-sm text-center text-gray-500 text-xs font-mono">
                Select an active intake file from the stream list to audit dynamic blueprints and alter tracking states.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Users (Registered Students Accounts) Section */}
      {tab === 'users' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Users Database roster table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-950 border border-gray-800 rounded-sm">
              <div className="p-4 border-b border-gray-800 bg-black/40 flex items-center justify-between font-mono">
                <span className="text-xs font-display font-semibold text-gold-500 uppercase tracking-wider">
                  Registered developer accounts roster
                </span>
                <span className="text-[9px] text-gray-500 uppercase">
                  Sort: High-to-low XP metrics
                </span>
              </div>

              {users.length === 0 ? (
                <div className="p-16 text-center text-gray-650 text-xs font-mono">
                  [EMPTY DATABASE]: No developer registry profiles discovered.
                </div>
              ) : (
                <div className="divide-y divide-gray-900 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/60 text-gray-500 font-mono text-[9px] uppercase tracking-wider border-b border-gray-900">
                        <th className="p-4">Developer Profile</th>
                        <th className="p-4">Status &amp; Role</th>
                        <th className="p-4 text-center">Completed</th>
                        <th className="p-4 text-right">Metrics (XP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {users.map((item) => (
                        <tr 
                          key={item.uid}
                          onClick={() => setSelectedUser(item)}
                          className={`hover:bg-gray-900/40 transition-all cursor-pointer ${
                            selectedUser?.uid === item.uid ? 'bg-gold-500/5' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-white uppercase tracking-wide">{item.name}</div>
                            <div className="text-gray-500 font-mono text-[10px]">{item.email}</div>
                          </td>
                          <td className="p-4 font-mono text-[10px]">
                            <span className={`px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold ${
                              item.role === 'admin' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : 'bg-gray-900 text-gray-400 border border-gray-800'
                            }`}>
                              {item.role || 'user'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-cyan-400 font-semibold">
                            {item.completedRooms?.length || 0} Rooms
                          </td>
                          <td className="p-4 text-right font-display font-bold text-gold-500">
                            {item.xp || 0} XP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User inspector & system alerts dispatch terminal */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className="bg-gray-950 border border-gray-800 p-6 rounded-sm sticky top-28 space-y-6">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Academic inspector tools</span>
                  <h3 className="text-base font-display font-bold text-white mt-1 uppercase">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-gold-500 font-mono mt-1">
                    {selectedUser.email}
                  </p>
                </div>

                <div className="border-y border-gray-900 py-3.5 space-y-2.5 font-mono text-[10px] text-gray-400">
                  <div className="flex justify-between">
                    <span>Account UID Key:</span>
                    <span className="text-gray-300 text-[9px]">{selectedUser.uid.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clearance Level:</span>
                    <span className="text-white uppercase font-bold">{selectedUser.role || 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rooms Mastered:</span>
                    <span className="text-cyan-400 font-bold">{selectedUser.completedRooms?.length || 0} Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registered On:</span>
                    <span>
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Academy Paid Clearance Approval Toggle */}
                <div className="pt-2 pb-4 border-b border-gray-900 space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Academy Paid Status:</span>
                    <span className={`px-2 py-0.5 rounded-sm font-bold uppercase ${selectedUser.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                      {selectedUser.isPaid ? '✓ PAID & APPROVED' : 'LOCKED (UNPAID)'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleTogglePaid(selectedUser.uid, selectedUser.isPaid)}
                    className={`w-full py-2.5 uppercase tracking-widest font-bold rounded-sm border transition-all ${
                      selectedUser.isPaid 
                        ? 'bg-red-950/40 border-red-900/60 text-red-400 hover:bg-red-900 hover:text-white' 
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                    }`}
                  >
                    {selectedUser.isPaid ? 'Revoke Paid Clearance' : 'Approve & Grant Paid Clearance'}
                  </button>
                </div>

                {/* Direct notifications dispatch form */}
                <form onSubmit={handleSendNotification} className="space-y-4 pt-2">
                  <div className="flex items-center gap-1.5 border-b border-gray-900 pb-2">
                    <Bell size={13} className="text-gold-500" />
                    <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                      Transmit Sovereign Notification
                    </h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                    Instantly broadcast raw system warnings, badges, or special guidance alerts directly into this student's notification system log.
                  </p>

                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider font-mono mb-1">Alert Headline Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Cyber Program Level Verified"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-black border border-gray-800 text-white rounded-sm placeholder:text-gray-700 font-mono focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider font-mono mb-1">Payload Content (Instructions)</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g. Well done! Your advanced exploit scripts has completed bypass constraints... +200 XP Awarded."
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      className="w-full text-xs p-2.5 bg-black border border-gray-800 text-white rounded-sm placeholder:text-gray-700 font-mono focus:border-gold-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSendingNotif}
                    className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/20 text-black font-semibold text-xs uppercase tracking-widest font-display rounded-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    {isSendingNotif ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Transmitting...
                      </>
                    ) : (
                      <>
                        <Send size={11} /> Deploy Alert Payload
                      </>
                    )}
                  </button>
                </form>

              </div>
            ) : (
              <div className="bg-gray-950 border border-gray-805 p-8 rounded-sm text-center text-gray-500 text-xs font-mono">
                Select any user from the account ledger on the left to review metrics details and build custom system notifications alerts.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Images Section */}
      {tab === 'images' && (
        <div className="space-y-12 animate-fade-in">
          
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
                    {presetImagesList.hero.map((opt) => (
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
                    {presetImagesList.academy.map((opt) => (
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
                    {presetImagesList.services.map((opt) => (
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
                    Projects Showcase Visual
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
                    {presetImagesList.projects.map((opt) => (
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
            <div className="bg-gray-950 border border-gray-855 rounded-sm flex flex-col justify-between">
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
                  <label className="block text-[10px] text-gray-405 uppercase mb-1">Direct Image Web Address (URL)</label>
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
                    {presetImagesList.labs.map((opt) => (
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
            <h4 className="text-xs font-display text-gold-500 font-bold uppercase tracking-wider mb-2">💡 Operational Note</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              When configuring image records or applying Base64 file codes, calculations execute inside client state. To support seamless Nigerian imagery options, click on the preset buttons labeled "Nigerian Tech Developer Workspace", "Nigerian Tech Students Cohort", or "African SaaS Solutions" above, which links directly to beautiful alternative photography.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={async () => {
                try {
                  await updateImages(images);
                  triggerSuccess('All website images successfully saved and synchronized globally!');
                } catch (err: any) {
                  setErrorMsg(`Failed synchronizing images: ${err.message}`);
                  setTimeout(() => setErrorMsg(''), 5000);
                }
              }}
              className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs font-display uppercase tracking-widest rounded-sm transition-all shadow-lg flex items-center gap-2"
            >
              Save Image Configuration
            </button>
          </div>

        </div>
      )}

      {/* Tab 4: Site Settings Section */}
      {tab === 'settings' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 animate-fade-in text-gray-100"
        >
          <div className="bg-gray-950 border border-gray-900 rounded-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600"></div>
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-gold-500" size={18} />
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-white">Dynamic Brand Control Console</h2>
            </div>
            
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* GROUP 1: Brand & Logo */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Sparkles size={12} /> Live Identity Branding
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Company Legal Name</label>
                    <input 
                      type="text"
                      required
                      value={siteForm.companyName}
                      onChange={(e) => setSiteForm({ ...siteForm, companyName: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Logo Fallback Text</label>
                    <input 
                      type="text"
                      required
                      value={siteForm.logoText}
                      onChange={(e) => setSiteForm({ ...siteForm, logoText: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Active Logo Image URL</label>
                    <input 
                      type="text"
                      value={siteForm.logoUrl}
                      onChange={(e) => setSiteForm({ ...siteForm, logoUrl: e.target.value })}
                      placeholder="Paste image web address (URL) or upload a logo file..."
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={13} />
                      Upload Logo PNG/JPG
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {siteForm.logoUrl && (
                  <div className="p-3 bg-gray-950 border border-gray-850 rounded-sm w-fit">
                    <span className="block text-[9px] text-gray-500 uppercase font-mono mb-1.5">Live Header Logo Preview</span>
                    <img src={siteForm.logoUrl} alt="Logo preview" className="h-9 border border-gold-500/30 p-1 bg-black object-contain" />
                  </div>
                )}

                {/* Dynamic Browser Favicon Customizer */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-901">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Active Browser Favicon URL</label>
                    <input 
                      type="text"
                      value={siteForm.faviconUrl || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, faviconUrl: e.target.value })}
                      placeholder="Paste image web address (URL) or upload a favicon file..."
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 active:scale-95 border border-dashed border-gold-500/30 text-gold-500 text-xs rounded-sm cursor-pointer transition-all uppercase tracking-widest font-display select-none">
                      <Upload size={13} />
                      Upload Favicon PNG/JPG
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFaviconUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {siteForm.faviconUrl && (
                  <div className="p-3 bg-gray-950 border border-gray-850 rounded-sm w-fit">
                    <span className="block text-[9px] text-gray-500 uppercase font-mono mb-1.5">Live Tab Favicon Preview</span>
                    <img src={siteForm.faviconUrl} alt="Favicon preview" className="h-6 w-6 border border-gold-500/30 p-0.5 bg-black object-contain" />
                  </div>
                )}
              </div>

              {/* GROUP 2: Contact Numbers & Community Links */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Mail size={12} /> Global Contact Nodes & Support Phone Numbers
                </h3>
                
                <div className="p-3 bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-300 font-mono rounded-sm leading-relaxed">
                  💡 <b>Contact Controls Note:</b> You can set different or identical numbers for WhatsApp and Call Us Hotline. Any changes here instantly update all WhatsApp buttons, Call Us hotlines, and contact links across the entire platform.
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-1 font-mono">
                      WhatsApp Contact Number
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="+234 912 071 3573"
                      value={siteForm.whatsappPhone || ''}
                      onChange={(e) => {
                        const newPhone = e.target.value;
                        const cleanDigits = newPhone.replace(/[^0-9]/g, '');
                        const newLink = cleanDigits ? `https://wa.me/${cleanDigits}` : siteForm.whatsappLink;
                        setSiteForm({ 
                          ...siteForm, 
                          whatsappPhone: newPhone,
                          whatsappLink: newLink
                        });
                      }}
                      className="w-full p-2.5 bg-gray-950 border border-gold-500/50 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Target WhatsApp number for all chat triggers.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-1 font-mono">
                      "Call Us" Hotline Phone Number
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="+234 912 071 3573"
                      value={siteForm.contactPhone}
                      onChange={(e) => setSiteForm({ ...siteForm, contactPhone: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gold-500/50 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Direct phone hotline for voice calls (tel:).
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Inquiry Support Email
                    </label>
                    <input 
                      type="email"
                      required
                      value={siteForm.contactEmail}
                      onChange={(e) => setSiteForm({ ...siteForm, contactEmail: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Main email address for support & inquiries.
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-gray-900">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Direct Chat WhatsApp Link
                    </label>
                    <input 
                      type="text"
                      required
                      value={siteForm.whatsappLink}
                      onChange={(e) => setSiteForm({ ...siteForm, whatsappLink: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Auto-generated wa.me link (or custom link).
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Join WhatsApp Community Link
                    </label>
                    <input 
                      type="text"
                      required
                      value={siteForm.communityLink}
                      onChange={(e) => setSiteForm({ ...siteForm, communityLink: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Group invite link for WhatsApp Community.
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Telegram Channel Link
                    </label>
                    <input 
                      type="text"
                      required
                      value={siteForm.telegramLink}
                      onChange={(e) => setSiteForm({ ...siteForm, telegramLink: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">
                      Telegram channel or group link.
                    </span>
                  </div>
                </div>
              </div>

              {/* GROUP 3: Homepage Headlines & Advertisements */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Layers size={12} /> Marketing Copy & Headings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Primary Hero Main Headline</label>
                    <input 
                      type="text"
                      required
                      value={siteForm.heroHeadline}
                      onChange={(e) => setSiteForm({ ...siteForm, heroHeadline: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Hero Subheadline Explanation Text</label>
                    <textarea 
                      required
                      value={siteForm.heroSubheadline}
                      onChange={(e) => setSiteForm({ ...siteForm, heroSubheadline: e.target.value })}
                      className="w-full p-2.5 bg-gray-950 border border-gray-800 h-20 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 border-t border-gray-900 pt-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">About Section Headline</label>
                      <input 
                        type="text"
                        required
                        value={siteForm.aboutHeadline}
                        onChange={(e) => setSiteForm({ ...siteForm, aboutHeadline: e.target.value })}
                        className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">About Long Description Description</label>
                      <textarea 
                        required
                        value={siteForm.aboutText}
                        onChange={(e) => setSiteForm({ ...siteForm, aboutText: e.target.value })}
                        className="w-full p-2.5 bg-gray-950 border border-gray-800 h-20 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GROUP 4: Footer compliance */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-4">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <Terminal size={12} /> Footer Copyright Info
                </h3>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Footer Legal Credits & Disclaimers</label>
                  <input 
                    type="text"
                    required
                    value={siteForm.footerCredits}
                    onChange={(e) => setSiteForm({ ...siteForm, footerCredits: e.target.value })}
                    className="w-full p-2.5 bg-gray-950 border border-gray-800 text-xs text-white rounded-sm focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>

              {/* GROUP 5: Dynamic Accessibility & Visual Theme Controls */}
              <div className="p-4 bg-black border border-gray-900 rounded-sm space-y-5">
                <h3 className="text-xs font-display font-medium text-gold-500 uppercase tracking-widest pb-1 border-b border-gray-900 flex items-center gap-1.5">
                  <span className="text-xs">🎨</span> Display, Accessibility & Theme Tones
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Font Sizer */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                        Global Font Scale Factor
                      </label>
                      <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[10px] font-mono font-bold rounded">
                        {siteForm.fontSizeScale || 100}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Scale the entire site typography proportionately and simultaneously. Relative headers and body fonts grow and shrink together.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-500">80%</span>
                      <input 
                        type="range"
                        min="80"
                        max="180"
                        step="5"
                        value={siteForm.fontSizeScale || 100}
                        onChange={(e) => setSiteForm({ ...siteForm, fontSizeScale: parseInt(e.target.value) })}
                        className="flex-1 accent-gold-500 h-1.5 rounded-lg cursor-pointer bg-gray-950"
                      />
                      <span className="text-[10px] font-mono text-gray-300">180%</span>
                    </div>
                  </div>

                  {/* Theme Mode Toggles */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                      Corporate Visual Mode
                    </label>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Toggle between Dark (default cosmic), Light (high-contrast eye-safe light background), or Mixed (amber cyber deck) mode. Texts automatically adapt contrast rates.
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {(['dark', 'light', 'mixed'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setSiteForm({ ...siteForm, themeMode: mode })}
                          className={`py-2 text-[10px] font-mono uppercase tracking-wider border rounded-xs transition-all ${
                            (siteForm.themeMode || 'dark') === mode
                              ? 'bg-gold-500 border-gold-500 text-black font-bold'
                              : 'bg-transparent border-gray-901 hover:border-gray-800 text-gray-400'
                          }`}
                        >
                          {mode} Mode
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <button 
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 active:scale-[0.99] disabled:bg-gold-500/40 text-black font-semibold text-xs transition-all uppercase tracking-widest font-display rounded-sm flex items-center justify-center gap-2 select-none h-12 shadow-md shadow-gold-500/10"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Synchronizing configurations...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} /> Commit Dynamic Changes Live
                  </>
                )}
              </button>

            </form>

          </div>
        </motion.div>
      )}

    </div>
  );
}
