import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Settings, 
  Bell, 
  Award, 
  MessageSquare, 
  Bookmark, 
  Globe, 
  Github, 
  Linkedin, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  Sparkles, 
  Lock, 
  Smartphone, 
  Layers, 
  Volume2, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  UserCheck, 
  Upload, 
  Camera, 
  Image as ImageIcon,
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, ReviewRecord } from '../types';
import { subscribeToReviews, deleteReview } from '../lib/reviews';

type TabType = 'personal' | 'referrals' | 'security' | 'display' | 'notifications' | 'academy' | 'reviews' | 'bookmarks' | 'connected';

export default function Profile() {
  const { user, profile, logout, resetPassword, updateProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  // Form State for Personal Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState(false);

  // Direct Device File Upload Ref & Handler
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const signatureInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingDp, setUploadingDp] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

  const handleDeviceDpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    setUploadingDp(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400; // Optimize for fast profile loading
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(dataUrl);
        }
        setUploadingDp(false);
      };
      img.onerror = () => {
        setUploadingDp(false);
        alert('Failed to read image file. Please try another image.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeviceSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a signature image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setUploadingSig(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.92);
          setSignatureUrl(dataUrl);
        }
        setUploadingSig(false);
      };
      img.onerror = () => {
        setUploadingSig(false);
        alert('Failed to read signature image.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Form State for Security
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Form State for Display Preferences
  const [themeTone, setThemeTone] = useState<'dark' | 'gold' | 'midnight'>('dark');
  const [fontSize, setFontSize] = useState<'normal' | 'compact' | 'large'>('normal');
  const [soundEffects, setSoundEffects] = useState(true);
  const [savingDisplay, setSavingDisplay] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(false);

  // Form State for Notification Preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [digestNotifs, setDigestNotifs] = useState(true);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // User Reviews List
  const [myReviews, setMyReviews] = useState<ReviewRecord[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Populate local form fields when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setTitle(profile.title || 'Academy Student');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
      setGithubUrl(profile.githubUrl || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setAvatarUrl(profile.avatarUrl || user?.photoURL || '');
      setSignatureUrl(profile.signatureUrl || '');
      
      if (profile.preferences) {
        setThemeTone(profile.preferences.themeTone || 'dark');
        setFontSize(profile.preferences.fontSize || 'normal');
        setSoundEffects(profile.preferences.soundEffects !== false);
        setEmailNotifs(profile.preferences.emailNotifications !== false);
        setDigestNotifs(profile.preferences.activityDigest !== false);
      }
    }
  }, [profile, user]);

  // Subscribe to user reviews
  useEffect(() => {
    if (!user) return;
    setLoadingReviews(true);
    const unsubscribe = subscribeToReviews((allReviews) => {
      const userOwned = allReviews.filter((r) => r.userId === user.uid);
      setMyReviews(userOwned);
      setLoadingReviews(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Handle Save Personal Info
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPersonal(true);
    setPersonalSuccess(false);

    try {
      await updateProfileData({
        name: name.trim(),
        phone: phone.trim(),
        title: title.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        avatarUrl: avatarUrl.trim(),
        signatureUrl: signatureUrl.trim(),
      });
      setPersonalSuccess(true);
      setTimeout(() => setPersonalSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update personal settings:', err);
    } finally {
      setSavingPersonal(false);
    }
  };

  // Handle Save Display Settings
  const handleSaveDisplay = async () => {
    if (!user) return;
    setSavingDisplay(true);
    try {
      await updateProfileData({
        preferences: {
          ...profile?.preferences,
          themeTone,
          fontSize,
          soundEffects,
        },
      });
      setDisplaySuccess(true);
      setTimeout(() => setDisplaySuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDisplay(false);
    }
  };

  // Handle Save Notifications
  const handleSaveNotifs = async () => {
    if (!user) return;
    setSavingNotifs(true);
    try {
      await updateProfileData({
        preferences: {
          ...profile?.preferences,
          emailNotifications: emailNotifs,
          activityDigest: digestNotifs,
        },
      });
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotifs(false);
    }
  };

  // Handle Password Reset Request
  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    setSecurityError('');
    try {
      await resetPassword(user.email);
      setResetSent(true);
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to send reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  // Delete review
  const handleDeleteUserReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await deleteReview(reviewId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-lg mx-auto text-center space-y-4">
        <Lock size={40} className="mx-auto text-gold-500" />
        <h2 className="text-2xl font-bold font-display text-white uppercase">Authentication Required</h2>
        <p className="text-xs text-zinc-400">Please sign in to access your account profile settings.</p>
      </div>
    );
  }

  // Calculate XP Level rank
  const xp = profile?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpToNext = 100 - (xp % 100);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto font-sans text-gray-100">
      
      {/* Hidden File Input for Device DP Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleDeviceDpUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* PROFILE TOP BANNER */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-6 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar Display with Direct Device Upload Trigger */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Click to upload new DP from device">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={profile?.name} 
                className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gold-500/70 shadow-xl group-hover:opacity-85 transition-opacity"
              />
            ) : (
              <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gold-500/20 border-2 border-gold-500/70 flex items-center justify-center text-gold-400 font-bold font-display text-3xl shadow-xl group-hover:opacity-85 transition-opacity">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            {/* Camera Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-gold-400 gap-1 p-2 text-center">
              <Camera size={20} />
              <span className="text-[9px] font-mono uppercase font-bold text-white">Upload DP</span>
            </div>

            <span className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-zinc-950 w-5 h-5 rounded-full shadow" title="Account Active"></span>
          </div>

          {/* User Meta Summary */}
          <div className="text-center md:text-left flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase tracking-wide">
                {profile?.name || user.displayName || 'Kogla Member'}
              </h1>
              <span className="px-2.5 py-0.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-mono rounded uppercase font-bold">
                {profile?.role === 'admin' ? 'Kogla Executive' : `Level ${level} Developer`}
              </span>
            </div>

            <p className="text-xs text-gold-400 font-mono font-medium">
              {profile?.title || 'Full Stack Engineer & Academy Developer'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-400 font-mono pt-1">
              <span className="flex items-center gap-1"><Mail size={12} className="text-zinc-500" /> {user.email}</span>
              {profile?.phone && <span className="flex items-center gap-1"><Phone size={12} className="text-zinc-500" /> {profile.phone}</span>}
              {profile?.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-zinc-500" /> {profile.location}</span>}
            </div>
          </div>

          {/* Level XP Progress Badge */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg min-w-[200px] text-center space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Total XP</span>
              <span className="text-gold-400 font-bold">{xp} XP</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-gold-500 h-full transition-all" style={{ width: `${(xp % 100)}%` }}></div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono block">
              {xpToNext} XP to Level {level + 1}
            </span>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION GRID (8 SECTIONS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR TABS LIST */}
        <div className="space-y-1 font-mono text-xs">
          {[
            { id: 'personal', label: '1. Personal Details', icon: User },
            { id: 'referrals', label: '2. Referral & Ambassador Code', icon: Tag },
            { id: 'security', label: '3. Security & Auth', icon: Key },
            { id: 'display', label: '4. Display & Theme', icon: Settings },
            { id: 'notifications', label: '5. Notifications', icon: Bell },
            { id: 'academy', label: '6. Academic Progress', icon: Award },
            { id: 'reviews', label: '7. My Feedback & Activity', icon: MessageSquare },
            { id: 'bookmarks', label: '8. Saved Bookmarks', icon: Bookmark },
            { id: 'connected', label: '9. Connected Accounts', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full text-left px-4 py-3 rounded-md flex items-center justify-between transition-all ${
                  isActive 
                    ? 'bg-gold-500 text-black font-bold shadow-md' 
                    : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </span>
                <ChevronRight size={14} className={isActive ? 'text-black' : 'text-zinc-600'} />
              </button>
            );
          })}

          <div className="pt-4 border-t border-zinc-900">
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 rounded-md bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 transition-colors font-mono"
            >
              <LogOut size={14} /> Sign Out Account
            </button>
          </div>
        </div>

        {/* MAIN TAB CONTENT AREA */}
        <div className="md:col-span-3 bg-zinc-950 border border-zinc-850 rounded-lg p-6 shadow-xl">
          
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <User size={18} className="text-gold-500" /> Edit Personal Information
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Update your display credentials, professional headline, and contact details.
                </p>
              </div>

              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                      Professional Title / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer, Academy Student"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+234..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lagos, Nigeria / Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* DP Avatar Upload Block */}
                <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] text-zinc-300 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                      <Camera size={13} className="text-gold-400" /> Display Picture (DP) Avatar
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">Mobile Gallery & Camera Supported</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* DP Preview Box */}
                    <div className="relative shrink-0">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="DP Preview" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-gold-500/70 shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-500/70 flex items-center justify-center text-gold-400 font-bold font-display text-xl">
                          {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>

                    {/* Device Upload Button & URL input */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingDp}
                          className="px-4 py-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold text-xs uppercase font-mono rounded inline-flex items-center gap-2 transition-all shadow-md"
                        >
                          {uploadingDp ? (
                            <>
                              <Loader2 size={13} className="animate-spin" /> Processing Photo...
                            </>
                          ) : (
                            <>
                              <Upload size={13} /> Upload DP From Device
                            </>
                          )}
                        </button>

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-mono rounded"
                            title="Remove DP"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="url"
                          placeholder="Or paste image URL (https://...)"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital Signature Upload Block */}
                <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] text-zinc-300 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                      <Award size={13} className="text-gold-400" /> Digital Signature (For Official Certificates & Contracts)
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">PNG / Transparent Recommended</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Signature Preview Box */}
                    <div className="relative shrink-0 w-32 h-16 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center p-1">
                      {signatureUrl ? (
                        <img 
                          src={signatureUrl} 
                          alt="Signature Preview" 
                          className="max-h-full max-w-full object-contain filter invert contrast-200"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono italic">No signature uploaded</span>
                      )}
                    </div>

                    {/* Upload button & URL input */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => signatureInputRef.current?.click()}
                          disabled={uploadingSig}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-gold-400 font-bold text-xs uppercase font-mono rounded inline-flex items-center gap-2 transition-all border border-gold-500/30 shadow"
                        >
                          {uploadingSig ? (
                            <>
                              <Loader2 size={13} className="animate-spin" /> Processing Signature...
                            </>
                          ) : (
                            <>
                              <Upload size={13} /> Upload Signature File
                            </>
                          )}
                        </button>

                        {signatureUrl && (
                          <button
                            type="button"
                            onClick={() => setSignatureUrl('')}
                            className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-mono rounded"
                            title="Remove Signature"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="url"
                          placeholder="Or paste signature image URL (https://...)"
                          value={signatureUrl}
                          onChange={(e) => setSignatureUrl(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden File Inputs for DP & Signature */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleDeviceDpUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={signatureInputRef} 
                  onChange={handleDeviceSignatureUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                    Bio / Technical Background
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief developer background..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={savingPersonal}
                    className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-2"
                  >
                    {savingPersonal ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Personal Profile
                  </button>

                  {personalSuccess && (
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 size={14} /> Profile updated!
                    </span>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: REFERRALS & AMBASSADOR CODE */}
          {activeTab === 'referrals' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag size={18} className="text-gold-500" /> Ambassador & Referral Engine
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Generate your unique promo code, invite students to earn 6% &rarr; 10% lifetime commissions, and grant them a 5% discount.
                </p>
              </div>

              {/* ACTIVE CODE & SHAREABLE LINK */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
                <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold block">
                  YOUR PERSONAL ATTRIBUTION ASSETS
                </span>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Your Unique Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={profile?.referralCode || (profile?.name ? profile.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : user.uid.slice(0, 8).toUpperCase())}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-gold-400 font-mono font-bold uppercase select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const code = profile?.referralCode || (profile?.name ? profile.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : user.uid.slice(0, 8).toUpperCase());
                          navigator.clipboard.writeText(code);
                          alert(`Promo code ${code} copied to clipboard!`);
                        }}
                        className="px-3 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1 font-mono transition-all cursor-pointer shrink-0"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                      Shareable 1-Click Referral Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/?ref=${profile?.referralCode || (profile?.name ? profile.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : user.uid.slice(0, 8).toUpperCase())}`}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-gold-400 font-mono select-all truncate"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const code = profile?.referralCode || (profile?.name ? profile.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : user.uid.slice(0, 8).toUpperCase());
                          const url = `${window.location.origin}/?ref=${code}`;
                          navigator.clipboard.writeText(url);
                          alert(`Referral link copied to clipboard: ${url}`);
                        }}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1 font-mono transition-all cursor-pointer shrink-0"
                      >
                        <Copy size={12} /> Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMMISSION TIERS BREAKDOWN */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded space-y-1 font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Student Incentive</span>
                  <div className="text-xl font-bold text-emerald-400">5% OFF</div>
                  <p className="text-[10px] text-zinc-400 font-sans">Direct tuition discount across all 11 academy tracks.</p>
                </div>

                <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded space-y-1 font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Tier 1 Commission</span>
                  <div className="text-xl font-bold text-gold-400">6% Rate</div>
                  <p className="text-[10px] text-zinc-400 font-sans">Earned on first 3 verified student enrollments.</p>
                </div>

                <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded space-y-1 font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Tier 2 Lifetime</span>
                  <div className="text-xl font-bold text-gold-300">10% Boost</div>
                  <p className="text-[10px] text-zinc-400 font-sans">Elevates permanently from the 4th student onward.</p>
                </div>
              </div>

              {/* QUICK LINK TO FULL PARTNER DASHBOARD */}
              <div className="p-4 bg-black/60 border border-gold-500/30 rounded flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-display">Deep Analytics & Payouts</h4>
                  <p className="text-[11px] text-zinc-400">View real-time attribution logs and save your Nigerian bank account.</p>
                </div>
                <Link
                  to="/affiliate-portal"
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold text-xs uppercase tracking-wider rounded font-display flex items-center gap-1.5 transition-all shadow"
                >
                  Open Dashboard &rarr;
                </Link>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SECURITY & AUTH */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Key size={18} className="text-gold-500" /> Security & Authentication
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage your credentials, password reset email triggers, and session security.
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-display">Authentication Provider</h4>
                    <p className="text-[11px] text-zinc-400">
                      Primary sign-in method: <span className="text-gold-400 font-mono font-bold">{user.providerData[0]?.providerId || 'password'}</span>
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono rounded uppercase">
                    Active & Verified
                  </span>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-md space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-display">Reset Account Password</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Request an automated secure password reset link sent directly to <span className="text-white font-mono">{user.email}</span>.
                </p>

                {securityError && (
                  <div className="p-2.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded font-mono">
                    {securityError}
                  </div>
                )}

                {resetSent ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2 font-mono">
                    <CheckCircle2 size={14} /> Password reset link dispatched! Please check your inbox.
                  </div>
                ) : (
                  <button
                    onClick={handleRequestPasswordReset}
                    disabled={sendingReset}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase font-mono rounded inline-flex items-center gap-2"
                  >
                    {sendingReset ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} Send Reset Email
                  </button>
                )}
              </div>

              <div className="bg-zinc-900/50 border border-zinc-850 p-4 rounded-md space-y-2 font-mono text-xs">
                <div className="text-zinc-400">Account UID: <span className="text-zinc-200">{user.uid}</span></div>
                <div className="text-zinc-400">Creation Date: <span className="text-zinc-200">{new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</span></div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: DISPLAY & THEME SETTINGS */}
          {activeTab === 'display' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings size={18} className="text-gold-500" /> Interface & Theme Settings
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Customize the visual contrast, typography density, and interactive sound effects.
                </p>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Accent Theme Palette
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Dark Obsidian', desc: 'Standard high-contrast dark theme' },
                    { id: 'gold', label: 'Gold Sovereign', desc: 'Warm metallic highlights' },
                    { id: 'midnight', label: 'Midnight Blue', desc: 'Deep technical blue highlights' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeTone(t.id as any)}
                      className={`p-3 text-left rounded border transition-all ${
                        themeTone === t.id
                          ? 'border-gold-500 bg-gold-500/10 text-white font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-mono">{t.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Density Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Layout & Font Density
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: 'Standard' },
                    { id: 'compact', label: 'Compact' },
                    { id: 'large', label: 'Spaced' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontSize(f.id as any)}
                      className={`p-3 text-center rounded border transition-all text-xs font-mono ${
                        fontSize === f.id
                          ? 'border-gold-500 bg-gold-500/10 text-gold-400 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-md">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-gold-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-display">Audio Feedback</h4>
                    <p className="text-[11px] text-zinc-400">Play subtle sound clicks on interactive lab actions.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleSaveDisplay}
                  disabled={savingDisplay}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-2"
                >
                  {savingDisplay ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Display Preferences
                </button>
                {displaySuccess && <span className="text-xs text-emerald-400 font-mono">Preferences saved!</span>}
              </div>
            </motion.div>
          )}

          {/* TAB 4: NOTIFICATION PREFERENCES */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Bell size={18} className="text-gold-500" /> Notification Controls
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Choose how and when Kogla Tech sends announcements and updates.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-md">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-display">Email Broadcasts & Course Alerts</h4>
                    <p className="text-[11px] text-zinc-400">Receive new lab releases, certificates, and course updates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4 h-4 accent-gold-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-md">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-display">Community Discussion Digest</h4>
                    <p className="text-[11px] text-zinc-400">Receive email alerts when another user replies to your review.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={digestNotifs}
                    onChange={(e) => setDigestNotifs(e.target.checked)}
                    className="w-4 h-4 accent-gold-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleSaveNotifs}
                  disabled={savingNotifs}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider font-display rounded flex items-center gap-2"
                >
                  {savingNotifs ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Notifications
                </button>
                {notifSuccess && <span className="text-xs text-emerald-400 font-mono">Notification settings updated!</span>}
              </div>
            </motion.div>
          )}

          {/* TAB 5: ACADEMIC PROGRESS */}
          {activeTab === 'academy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award size={18} className="text-gold-500" /> Academic & XP Achievements
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Track your completed hands-on labs, earned experience points, and certificates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md text-center">
                  <span className="text-2xl font-bold font-display text-gold-400">{profile?.xp || 0}</span>
                  <span className="block text-[10px] font-mono text-zinc-400 uppercase mt-1">Total Earned XP</span>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md text-center">
                  <span className="text-2xl font-bold font-display text-emerald-400">{profile?.completedRooms?.length || 0}</span>
                  <span className="block text-[10px] font-mono text-zinc-400 uppercase mt-1">Completed Labs</span>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md text-center">
                  <span className="text-2xl font-bold font-display text-white">Level {level}</span>
                  <span className="block text-[10px] font-mono text-zinc-400 uppercase mt-1">Current Developer Rank</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Completed Labs & Modules
                </h4>
                {!profile?.completedRooms || profile.completedRooms.length === 0 ? (
                  <div className="p-6 bg-zinc-900/50 border border-zinc-850 rounded text-center text-xs text-zinc-500 font-mono">
                    No completed labs yet. Visit the Kogla Academy to begin interactive labs!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.completedRooms.map((room) => (
                      <div key={room} className="p-3 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between text-xs font-mono">
                        <span className="text-white font-bold flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400" /> {room}
                        </span>
                        <span className="text-gold-400">+50 XP Completed</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: MY REVIEWS & ACTIVITY */}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare size={18} className="text-gold-500" /> My Reviews & Community Activity
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage all public feedback and replies you have posted across Kogla Tech.
                </p>
              </div>

              {loadingReviews ? (
                <div className="text-center py-8 text-xs text-zinc-500 font-mono">Loading activity...</div>
              ) : myReviews.length === 0 ? (
                <div className="p-8 bg-zinc-900/40 border border-zinc-850 rounded text-center space-y-2">
                  <MessageSquare size={28} className="mx-auto text-zinc-600" />
                  <p className="text-xs text-zinc-400">You haven't posted any community reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gold-400 font-bold">{rev.title || 'Community Feedback'}</span>
                        <span className="text-zinc-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-zinc-300">{rev.content}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-xs font-mono">
                        <span className="text-zinc-500">{rev.likeCount} Likes received</span>
                        <button
                          onClick={() => handleDeleteUserReview(rev.id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 size={12} /> Delete Post
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 7: SAVED BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Bookmark size={18} className="text-gold-500" /> Saved Bookmarks & Resources
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Quick access to your saved courses, solutions, and documentation.
                </p>
              </div>

              <div className="p-8 bg-zinc-900/40 border border-zinc-850 rounded text-center space-y-2">
                <Bookmark size={28} className="mx-auto text-zinc-600" />
                <p className="text-xs text-zinc-400">No saved bookmarks currently added to your library.</p>
              </div>
            </motion.div>
          )}

          {/* TAB 8: CONNECTED ACCOUNTS & API */}
          {activeTab === 'connected' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={18} className="text-gold-500" /> Connected Accounts & API Tokens
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Third-party integrations and developer environment workspace tokens.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-md">
                  <div className="flex items-center gap-3">
                    <UserCheck className="text-gold-400" size={20} />
                    <div>
                      <h4 className="text-xs font-bold text-white font-display uppercase">Google Identity Sync</h4>
                      <p className="text-[11px] text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono rounded">
                    Connected
                  </span>
                </div>

                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 uppercase">Developer Token</span>
                    <button 
                      onClick={() => alert(`Your API token: kogla_live_${user.uid}`)}
                      className="text-gold-400 hover:underline text-[11px]"
                    >
                      Copy Token
                    </button>
                  </div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded text-zinc-400 text-[10px]">
                    kogla_live_{user.uid.substring(0, 16)}...
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
