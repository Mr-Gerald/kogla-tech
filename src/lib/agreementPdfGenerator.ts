import jsPDF from 'jspdf';

export interface AmbassadorAgreementData {
  ambassadorName: string;
  promoCode: string;
  email?: string;
  instagramHandle?: string;
  tier1Rate?: number; // default 6
  tier2Rate?: number; // default 10
  discountRate?: number; // default 5
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  agreementDate?: string;
  cohortBatchName?: string;
  cohortStartDate?: string;
  cohortEndDate?: string;
  logoUrl?: string;
}

/**
 * Loads an image from a URL or data URI and converts it to a base64 data URL for jsPDF
 */
async function getImageDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 200;
        canvas.height = img.naturalHeight || img.height || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const dataUri = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUri);
      } catch (e) {
        console.warn('Canvas conversion failed for logo:', e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates and downloads an official Ambassador & Creator Legal Partnership PDF with Kogla Tech Logo
 */
export async function generateAmbassadorAgreementPdf(data: AmbassadorAgreementData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const name = data.ambassadorName?.trim() || 'Ambassador Partner';
  const code = (data.promoCode?.trim() || 'CREATOR').toUpperCase();
  const dateStr = data.agreementDate || new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const t1 = data.tier1Rate || 6;
  const t2 = data.tier2Rate || 10;
  const disc = data.discountRate || 5;
  const cohortName = data.cohortBatchName || 'COHORT CO-2026';
  const cohortStart = data.cohortStartDate || 'September 24, 2026';
  const cohortEnd = data.cohortEndDate || 'December 18, 2026';

  // 1. TOP HEADER BANNER (Deep Luxury Dark with Gold Accent Lines)
  doc.setFillColor(10, 10, 12);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(212, 175, 55);
  doc.rect(0, 35, 210, 1.2, 'F');

  // Try to load and embed the actual Kogla Tech Logo
  let logoEmbedded = false;
  if (data.logoUrl) {
    try {
      const logoData = await getImageDataUrl(data.logoUrl);
      if (logoData) {
        doc.setFillColor(20, 20, 24);
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.6);
        doc.roundedRect(12, 6, 22, 22, 2, 2, 'FD');
        doc.addImage(logoData, 'JPEG', 13, 7, 20, 20);
        logoEmbedded = true;
      }
    } catch (e) {
      console.warn('Could not embed custom logo into PDF:', e);
    }
  }

  // Draw Gold Vector Crest Monogram fallback if image is not loaded
  if (!logoEmbedded) {
    doc.setFillColor(20, 20, 24);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.roundedRect(12, 6, 22, 22, 2, 2, 'FD');

    doc.setTextColor(212, 175, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('KT', 23, 19, { align: 'center' });
    doc.setFontSize(4.5);
    doc.text('GLOBAL', 23, 24, { align: 'center' });
  }

  // Company Name and Legal Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('KOGLA TECH GLOBAL', 38, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text('CREATOR & BRAND AMBASSADOR LEGAL MEMORANDUM', 38, 21);

  doc.setFontSize(6.5);
  doc.setTextColor(160, 160, 165);
  doc.text('ACCREDITED DIGITAL ACADEMY & TECHNOLOGY SOLUTIONS - RC-REGISTERED', 38, 27);

  // Right Header Metadata
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`PROMO CODE: ${code}`, 198, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 185);
  doc.text(`EFFECTIVE DATE: ${dateStr}`, 198, 20, { align: 'right' });
  doc.text(`STATUS: ACTIVE BINDING CONTRACT`, 198, 26, { align: 'right' });

  let y = 46;

  // 2. PARTIES SUMMARY BOX
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, y, 186, 26, 1.5, 1.5, 'FD');

  doc.setTextColor(15, 15, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CONTRACTING PARTIES & OFFICIAL CHANNELS:', 16, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.text(`Party 1 (The Academy): Kogla Tech Global • Email: solutions@koglatech.com • Phone: +234 701 248 9041`, 16, y + 11.5);
  doc.text(`Active Cohort Target: ${cohortName} • Official Start Date: ${cohortStart} (Target Graduation: ${cohortEnd})`, 16, y + 16);
  doc.text(`Party 2 (The Ambassador): ${name}${data.instagramHandle ? ` (${data.instagramHandle})` : ''}${data.email ? ` • ${data.email}` : ''}`, 16, y + 21);

  y += 32;

  // 3. SECTION 1: COMMISSION ESCALATOR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 10, 12);
  doc.text(`1. COMMISSION STRUCTURE & COHORT SCHEDULE (${cohortName})`, 12, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 55);

  const c1Lines = [
    `* Active Cohort Campaign: This partnership agreement governs the admissions sprint for ${cohortName} commencing on ${cohortStart}.`,
    `* Tier 1 (Cohort Base Rate): Ambassador earns ${t1}% commission on the net tuition fee of the first 3 verified student enrollments in this active cohort.`,
    `* Tier 2 (Cohort Accelerator - 10% Rate): Beginning from the 4th confirmed student within this specific cohort cycle, the commission rate elevates to ${t2}% on all subsequent enrollments.`,
    `* Cohort Cycle Reset Policy: The 10% elevated accelerator is active for the duration of this specific admission cohort. Each new official Academy intake resets the performance sprint, maintaining continuous momentum.`,
    `* Student Tuition Benefit: Every student registering via promo code "${code}" or the ambassador's tracking link receives a direct ${disc}% discount off their tuition fee across all course tracks.`
  ];

  c1Lines.forEach(line => {
    const split = doc.splitTextToSize(line, 186);
    doc.text(split, 12, y);
    y += split.length * 3.8 + 1.2;
  });
  y += 2.5;

  // 4. SECTION 2: VERIFICATION & SETTLEMENT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 10, 12);
  doc.text('2. PAYMENT VERIFICATION & SETTLEMENT TIMELINE', 12, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 55);

  const c2Lines = [
    `* Initial Attribution: When a student submits registration with code "${code}", the inquiry is recorded in real time as "Pending Payment".`,
    `* Clearance: Upon tuition payment verification by the Academy accounts office, status automatically transitions to "Confirmed & Earned".`,
    `* Settlement Window: Earned commissions are disbursed directly to the Ambassador's registered bank account within 3 to 5 business days following payment clearance.`
  ];

  c2Lines.forEach(line => {
    const split = doc.splitTextToSize(line, 186);
    doc.text(split, 12, y);
    y += split.length * 3.8 + 1.2;
  });
  y += 2.5;

  // 5. SECTION 3: AMBASSADOR ONBOARDING & BIO LINK CLAUSE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 10, 12);
  doc.text('3. AMBASSADOR ACTIVATION, DEDICATED PORTAL & SOCIAL BIO LINK CLAUSE', 12, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 55);

  const c3Lines = [
    `* Official Brand Representation: Ambassador agrees to feature their verified partner status and tracking link (e.g. "Tech Ambassador @koglatech | koglatech.com/academy?ref=${code}") prominently in their public bio / link tree across active social profiles.`,
    `* Real-Time Tracking Portal: Ambassador accesses their private tracking dashboard at /affiliate-portal to view real-time student attributions, confirmed enrollments, and live payout ledgers.`,
    `* Settlement Details: Ambassador maintains their preferred bank account details directly within their portal profile for swift automated processing.`
  ];

  c3Lines.forEach(line => {
    const split = doc.splitTextToSize(line, 186);
    doc.text(split, 12, y);
    y += split.length * 3.8 + 1.2;
  });
  y += 2.5;

  // 6. SECTION 4: LEGAL INDEMNIFICATION & IP
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 10, 12);
  doc.text('4. INDEPENDENT CONTRACTOR, INDEMNIFICATION & LEGAL PROTECTION', 12, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 55);

  const c4Lines = [
    `* Independent Contractor: The Ambassador operates strictly as an independent marketing partner and is not an employee, agent, or joint venturer.`,
    `* Indemnification: Ambassador agrees to defend, indemnify, and hold harmless Kogla Tech Global, its founder, officers, and employees against any claims or liabilities arising out of Ambassador's unauthorized claims, misleading advertising, or breach of this agreement.`,
    `* Intellectual Property: All course curriculum, brand assets, logos, trademarks, and software remain the exclusive property of Kogla Tech Global.`
  ];

  c4Lines.forEach(line => {
    const split = doc.splitTextToSize(line, 186);
    doc.text(split, 12, y);
    y += split.length * 3.8 + 1.2;
  });
  y += 5;

  // 7. SIGNATURE BLOCK
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(12, y, 198, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 15, 18);
  doc.text('FOR: KOGLA TECH GLOBAL', 12, y);
  doc.text('FOR: BRAND AMBASSADOR PARTNER', 115, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Gerald Emechebe', 12, y);
  doc.text(name, 115, y);
  y += 4;

  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 105);
  doc.text('Founder & CEO, Kogla Tech Global (solutions@koglatech.com)', 12, y);
  doc.text(`Authorized Creator Partner (Code: ${code})`, 115, y);

  // Bottom Footer
  doc.setFillColor(15, 15, 18);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(6.5);
  doc.text('KOGLA TECH GLOBAL • Email: solutions@koglatech.com • Phone/WhatsApp: +234 701 248 9041 • koglatech.com', 105, 293, { align: 'center' });

  // Download filename
  const cleanName = name.replace(/[^A-Z0-9_-]/gi, '_');
  const cleanCode = code.replace(/[^A-Z0-9_-]/gi, '_');
  const isPlaceholder = code.includes('YOUR') || code.includes('CODE') || code.includes('[') || code.includes(']</u>');
  
  const fileName = (isPlaceholder || !code || code === 'CREATOR')
    ? `Kogla_Tech_Ambassador_Agreement_${cleanName || 'Template'}.pdf`
    : `Kogla_Tech_Ambassador_Agreement_${cleanName}_${cleanCode}.pdf`;

  doc.save(fileName);
}
