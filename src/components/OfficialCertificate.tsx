import React, { useRef, useState } from 'react';
import { Award, ShieldCheck, QrCode, Download, Printer, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { CertificateRecord } from '../types';
import { useSiteConfig } from '../context/SiteConfigContext';
import { getFounderSignature } from '../lib/certificates';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OfficialCertificateProps {
  certificate: CertificateRecord;
  showActions?: boolean;
}

export const OfficialCertificate: React.FC<OfficialCertificateProps> = ({
  certificate,
  showActions = true
}) => {
  const { config } = useSiteConfig();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setDownloadingPdf(true);
    try {
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Kogla_Certificate_${certificate.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback to print
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const currentSignature = certificate.signatureImage || getFounderSignature();

  return (
    <div className="space-y-6">
      {/* ACTION BAR (Hidden during print) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-lg print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-gold-400" size={18} />
            <span className="text-xs font-mono uppercase text-zinc-300">
              Verified Credential: <b className="text-gold-400">{certificate.id}</b>
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 active:scale-95 text-black font-bold text-xs uppercase tracking-wider font-display rounded-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={14} /> Download Certificate (PDF)
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs uppercase font-mono tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer size={14} /> Print
            </button>
            <a
              href={`/verify-certificate/${certificate.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-755 text-zinc-400 hover:text-zinc-200 text-xs uppercase font-mono tracking-wider rounded-sm flex items-center gap-1.5 transition-all"
            >
              <ExternalLink size={13} /> Public Link
            </a>
          </div>
        </div>
      )}

      {/* OFFICIAL HIGH-RESOLUTION PRINTABLE CERTIFICATE FRAME */}
      <div 
        ref={certRef}
        className="official-certificate-container relative bg-zinc-950 text-white border-8 border-double border-gold-500/80 p-8 sm:p-12 md:p-16 rounded-sm shadow-2xl overflow-hidden print:border-4 print:p-8 print:shadow-none print:bg-black print:text-black font-sans max-w-4xl mx-auto"
        style={{
          boxShadow: '0 0 50px -10px rgba(234, 179, 8, 0.15), inset 0 0 40px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* CORNER ORNAMENTAL ACCENTS */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-gold-400 pointer-events-none"></div>
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-gold-400 pointer-events-none"></div>
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-gold-400 pointer-events-none"></div>
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-gold-400 pointer-events-none"></div>

        {/* WATERMARK BACKGROUND EMBLEM */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Award size={420} className="text-gold-400" />
        </div>

        {/* HEADER BRAND ZONE */}
        <div className="relative z-10 text-center space-y-3 pb-6 border-b border-gold-500/30">
          <div className="flex items-center justify-center gap-3">
            {config.logoUrl ? (
              <img 
                src={config.logoUrl} 
                alt={config.companyName} 
                className="h-12 sm:h-14 object-contain border border-gold-500/40 p-1 rounded-sm bg-black/60" 
              />
            ) : (
              <div className="px-3 py-1 bg-gold-500/10 border border-gold-500/40 rounded text-gold-400 font-display font-black text-xl tracking-widest uppercase">
                {config.companyName || 'KOGLA TECH'}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-gold-400 font-bold block">
              ACADEMIC COUNCIL & CERTIFICATION BOARD
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-wider uppercase text-white drop-shadow">
              Certificate of Completion
            </h1>
            <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
              THIS CERTIFIES THAT
            </p>
          </div>
        </div>

        {/* RECIPIENT NAME IN LUXURY DISPLAY TYPE */}
        <div className="relative z-10 text-center py-6 sm:py-8 space-y-3">
          <div className="inline-block relative">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-white via-gold-300 to-white bg-clip-text text-transparent px-6 py-2 tracking-tight">
              {certificate.studentName}
            </h2>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-1"></div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto leading-relaxed font-sans pt-2">
            has successfully fulfilled all rigorous academic standards, practical systems audits, and project capstone benchmarks for the professional specialization in
          </p>

          <div className="py-2">
            <span className="inline-block px-5 py-2 bg-gold-500/10 border border-gold-500/40 text-gold-400 font-display font-bold text-lg sm:text-2xl tracking-wide uppercase rounded-sm">
              {certificate.courseTitle}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400 pt-1">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle2 size={13} className="text-gold-400" /> Format: <b className="text-white">{certificate.mode}</b>
            </span>
            {certificate.grade && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300">
                  Honors: <b className="text-gold-400">{certificate.grade}</b>
                </span>
              </>
            )}
          </div>
        </div>

        {/* FOOTER VERIFICATION, SEAL & SIGNATURES */}
        <div className="relative z-10 pt-8 mt-6 border-t border-gold-500/30 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center sm:text-left">
          
          {/* LEFT: ISSUANCE & VERIFICATION METADATA */}
          <div className="space-y-2 text-xs font-mono text-zinc-400">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block">Certificate ID</span>
              <span className="text-gold-400 font-bold tracking-wider">{certificate.id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block">Issue Date</span>
              <span className="text-zinc-200">{certificate.issueDate}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block">Completion Date</span>
              <span className="text-zinc-200">{certificate.completionDate}</span>
            </div>
          </div>

          {/* CENTER: GOLD EMBOSSED SECURITY SEAL */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-gold-400 bg-gradient-to-br from-amber-500/20 via-gold-500/30 to-amber-700/20 shadow-xl p-2 text-center">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-gold-300/80"></div>
              <div className="flex flex-col items-center justify-center z-10 space-y-0.5">
                <Award className="text-gold-400" size={24} />
                <span className="text-[8px] font-mono font-bold tracking-widest text-gold-300 uppercase leading-tight">
                  OFFICIAL SEAL
                </span>
                <span className="text-[7px] font-mono text-zinc-300 uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: FOUNDER & CEO SIGNATURE */}
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right space-y-1">
            {/* Signature rendering */}
            <div className="h-16 flex items-end justify-center sm:justify-end pb-1">
              {currentSignature ? (
                <img 
                  src={currentSignature} 
                  alt="Gerald Emechebe Signature" 
                  className="max-h-14 max-w-[180px] object-contain drop-shadow" 
                />
              ) : (
                <div 
                  className="font-serif italic text-2xl sm:text-3xl text-gold-300 tracking-wider select-none transform -rotate-3"
                  style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
                >
                  Gerald Emechebe
                </div>
              )}
            </div>

            <div className="w-48 border-t border-gold-500/60 pt-1.5">
              <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                {certificate.founderName || 'Gerald Emechebe'}
              </h4>
              <p className="text-[10px] text-gold-400 font-mono uppercase tracking-tight">
                {certificate.founderTitle || 'Founder & CEO, Kogla Tech'}
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM AUTHENTICITY BARCODE & VERIFY URL */}
        <div className="relative z-10 mt-6 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-zinc-500 gap-2">
          <span className="flex items-center gap-1">
            <QrCode size={11} className="text-gold-500" /> Verify Authenticity: {certificate.credentialUrl || `${window.location.origin}/verify-certificate/${certificate.id}`}
          </span>
          <span className="text-zinc-600 uppercase">
            Kogla Tech Global Academic Registry • All Rights Reserved
          </span>
        </div>

      </div>
    </div>
  );
};
