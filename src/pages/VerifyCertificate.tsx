import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Search, Award, ArrowLeft, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { verifyCertificate } from '../lib/certificates';
import { CertificateRecord } from '../types';
import { OfficialCertificate } from '../components/OfficialCertificate';

export default function VerifyCertificate() {
  const { certId } = useParams();
  const [searchId, setSearchId] = useState(certId || '');
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.style.overflow = 'auto';
  }, []);

  const fetchCert = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await verifyCertificate(id.trim());
      setCertificate(res);
    } catch (err) {
      console.error('Certificate verification error:', err);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certId) {
      fetchCert(certId);
    }
  }, [certId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchCert(searchId);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-gray-100 font-sans">
      
      {/* TOP BREADCRUMB */}
      <div className="mb-6">
        <Link 
          to="/academy" 
          className="inline-flex items-center text-xs font-mono uppercase text-zinc-400 hover:text-gold-400 transition-colors"
        >
          <ArrowLeft size={13} className="mr-1.5" /> Back to Kogla Academy
        </Link>
      </div>

      {/* HEADER */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] rounded-full uppercase tracking-widest font-mono">
          <ShieldCheck size={12} /> Official Academic Credential Verification
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-white tracking-tight">
          Verify <span className="text-gold-500">Certificate</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
          Authenticate official credentials issued by the Kogla Tech Academic Board with permanent tamper-proof validation.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. KOGLA-CERT-2026-8941)"
              className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-sm focus:border-gold-500 focus:outline-none text-xs sm:text-sm text-white font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-widest font-display rounded-sm transition-all shadow-md shrink-0"
          >
            {loading ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>
      </div>

      {/* VERIFICATION RESULTS */}
      {loading ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-lg">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-mono uppercase text-zinc-400">Verifying certificate details...</p>
        </div>
      ) : certificate ? (
        <div className="space-y-8">
          {/* SUCCESS STATUS BADGE */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
                <CheckCircle className="text-emerald-400" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Official Credential Verified & Valid
                </h3>
                <p className="text-xs text-emerald-300 font-mono">
                  Issued to <b>{certificate.studentName}</b> on {certificate.issueDate} for {certificate.courseTitle}.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-emerald-500 text-black px-2.5 py-1 rounded uppercase tracking-wider">
              AUTHENTIC
            </span>
          </div>

          {/* RENDER CERTIFICATE */}
          <OfficialCertificate certificate={certificate} showActions={true} />

          <div className="flex justify-center pt-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer"
            >
              &uarr; Back to Top Search
            </button>
          </div>
        </div>
      ) : searched ? (
        <div className="p-10 text-center bg-zinc-950 border border-red-500/20 rounded-lg space-y-3">
          <AlertTriangle className="text-red-400 mx-auto" size={32} />
          <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
            Certificate Record Not Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No matching credential was found for ID <b className="text-red-400 font-mono">"{searchId}"</b>. Please ensure the certificate serial number is typed accurately.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchId('KOGLA-CERT-2026-8941');
                fetchCert('KOGLA-CERT-2026-8941');
              }}
              className="text-xs text-gold-400 hover:text-gold-300 underline font-mono"
            >
              Try sample valid certificate: KOGLA-CERT-2026-8941
            </button>
          </div>
        </div>
      ) : null}

    </div>
  );
}
