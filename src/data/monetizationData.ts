export interface MonetizationGuide {
  id: string;
  title: string;
  category: 'career' | 'freelancing' | 'referrals' | 'agency' | 'saas_products' | 'cyber_bounties' | 'content_creator';
  earningPotential: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeToFirstIncome: string;
  description: string;
  steps: string[];
  toolsAndPlatforms: string[];
  proTips: string[];
  recommendedKoglaTrack?: string;
  koglaTrackLink?: string;
  calculator?: {
    metricLabel: string;
    unitPrice: number;
    defaultUnits: number;
    explanation: string;
  };
}

export const MONETIZATION_GUIDES: MonetizationGuide[] = [
  {
    id: 'kogla-ambassador-referrals',
    title: 'Kogla Tech Ambassador & Referral Ecosystem',
    category: 'referrals',
    earningPotential: '₦100,000 – ₦1,500,000+ / Month',
    difficulty: 'Beginner',
    timeToFirstIncome: '1 – 7 Days',
    description: 'Directly monetize your network, campus, social media audience, and WhatsApp communities by referring aspiring devs and enterprise clients to Kogla Tech cohorts & software services.',
    steps: [
      'Activate your unique referral code & tracking link in the Affiliate Portal (/affiliate-portal).',
      'Share your link or promo code with tech enthusiasts, campus groups, and founders seeking software development.',
      'Students receive an automatic 5% tuition discount upon entering your code.',
      'You earn 6% Base Commission on the first 3 cohort enrollments.',
      'Unlock the 10% Accelerator Tier on all subsequent enrollments in the cohort cycle.',
      'Withdraw directly to your Nigerian bank account with automated settlement logs within 3-5 business days.'
    ],
    toolsAndPlatforms: ['Kogla Affiliate Portal', 'WhatsApp Groups', 'Instagram / TikTok Bio', 'LinkedIn Posts', 'Campus Tech Clubs'],
    proTips: [
      'Place your referral link in your bio as "🎓 Official Tech Ambassador @koglatech".',
      'Share your real learning journey or project screenshots to build organic trust.',
      'DM friends who are looking to transition from non-tech to software engineering or cybersecurity.'
    ],
    recommendedKoglaTrack: 'Kogla Tech Brand Ambassador Program',
    koglaTrackLink: '/affiliate-portal',
    calculator: {
      metricLabel: 'Monthly Student Enrollments',
      unitPrice: 25000,
      defaultUnits: 5,
      explanation: 'Average commission per student enrollment (ranging from ₦15,000 at 6% up to ₦35,000+ at 10% on premium tracks).'
    }
  },
  {
    id: 'freelance-fullstack-dev',
    title: 'High-Ticket Global Freelance Web & App Development',
    category: 'freelancing',
    earningPotential: '$1,500 – $8,000 / Project (₦2.2M – ₦12M+)',
    difficulty: 'Intermediate',
    timeToFirstIncome: '30 – 60 Days',
    description: 'Build modern responsive web applications, SaaS dashboards, and mobile apps for international clients in the US, UK, Europe, and Canada.',
    steps: [
      'Master React, TypeScript, Tailwind CSS, Node.js, and Cloud Databases in the Kogla Tech Full-Stack Track.',
      'Deploy 3 production-grade portfolio projects with live URLs, GitHub source code, and video walkthroughs.',
      'Optimize your Upwork, Contra, and LinkedIn profiles with niche service offerings (e.g. "Next.js Fintech Web App Specialist").',
      'Submit targeted proposals using personalized Loom video breakdowns highlighting speed and security.',
      'Charge fixed milestone rates or $35–$75/hr and receive payouts in USD via Payoneer, Geegpay, or direct wire transfer.'
    ],
    toolsAndPlatforms: ['Upwork', 'Contra', 'Fiverr Pro', 'LinkedIn Jobs', 'GitHub', 'Vercel / Cloud Run', 'Geegpay / Grey'],
    proTips: [
      'Never bid on generic job postings without showing a live relevant demo.',
      'Specialize in high-demand stacks: React + Node.js + Firebase/Postgres.',
      'Offer maintenance retainers ($500/month) after delivering client projects.'
    ],
    recommendedKoglaTrack: 'Full-Stack Web Development Bootcamp',
    koglaTrackLink: '/academy/full-stack-web-development',
    calculator: {
      metricLabel: 'Monthly Client Projects',
      unitPrice: 1500000,
      defaultUnits: 2,
      explanation: 'Standard contract fee for custom web applications and full-stack software portals.'
    }
  },
  {
    id: 'ethical-hacking-bug-bounties',
    title: 'Bug Bounty Hunting & Security Auditing',
    category: 'cyber_bounties',
    earningPotential: '$500 – $25,000+ / Vulnerability',
    difficulty: 'Advanced',
    timeToFirstIncome: '60 – 90 Days',
    description: 'Identify critical security vulnerabilities (SQL Injection, IDOR, RCE, SSRF, Broken Auth) in global platforms and receive high-value ethical hacker bounties legally.',
    steps: [
      'Enroll in the Kogla Tech Cybersecurity & Ethical Hacking Track.',
      'Master Linux command line, Burp Suite, Nmap, Wireshark, and OWASP Top 10 vulnerabilities.',
      'Practice legally on HackTheBox, TryHackMe, and Kogla Interactive Defense Labs.',
      'Register on HackerOne, Bugcrowd, and Intigriti.',
      'Focus on target reconnaissance and report valid, reproducible vulnerability findings with remediation steps.'
    ],
    toolsAndPlatforms: ['HackerOne', 'Bugcrowd', 'Intigriti', 'Burp Suite Pro', 'OWASP ZAP', 'Shodan', 'Kali Linux'],
    proTips: [
      'Read disclosed reports on HackerOne to understand real-world triage techniques.',
      'Focus on business logic flaws rather than automated vulnerability scanners.',
      'Consistency in recon is how elite hunters find overlooked subdomains.'
    ],
    recommendedKoglaTrack: 'Cybersecurity & Ethical Hacking Mastery',
    koglaTrackLink: '/academy/cybersecurity-ethical-hacking',
    calculator: {
      metricLabel: 'Valid Bounty Submissions / Month',
      unitPrice: 750000,
      defaultUnits: 2,
      explanation: 'Average payout for Medium-to-High severity vulnerabilities on international programs ($500–$2,000).'
    }
  },
  {
    id: 'ai-automation-agency',
    title: 'AI Automation Agency (AAA) for Businesses',
    category: 'agency',
    earningPotential: '$2,000 – $10,000 / Month Retainer',
    difficulty: 'Intermediate',
    timeToFirstIncome: '14 – 30 Days',
    description: 'Build custom AI customer support agents, automated CRM lead capture pipelines, and automated content engines for real estate, e-commerce, and healthcare businesses.',
    steps: [
      'Learn AI agent workflows, function calling, Gemini / OpenAI SDKs, and Make/n8n automation in Kogla AI Labs.',
      'Build a portfolio demo: an autonomous WhatsApp or Web booking agent that syncs with Google Calendar and Stripe/Paystack.',
      'Pitch local and international business owners on saving 20+ staff hours weekly.',
      'Charge an initial setup fee ($1,500 – $3,000) plus a monthly maintenance/API management retainer ($500 – $1,500/mo).'
    ],
    toolsAndPlatforms: ['Gemini API', 'n8n', 'Make.com', 'Voiceflow', 'Supabase / Firebase', 'WhatsApp Business API'],
    proTips: [
      'Sell the business outcome (e.g. "Recover 35% of lost leads automatically"), not the underlying code.',
      'Target high-ticket industries like legal firms, luxury real estate, and medical clinics.'
    ],
    recommendedKoglaTrack: 'AI Automation & Prompt Engineering',
    koglaTrackLink: '/academy/ai-prompt-engineering',
    calculator: {
      metricLabel: 'Monthly Business Retainers',
      unitPrice: 450000,
      defaultUnits: 3,
      explanation: 'Recurring monthly support and API maintenance retainers per business client.'
    }
  },
  {
    id: 'remote-global-salary',
    title: 'Landing High-Paying Remote Tech Jobs in US / Europe',
    category: 'career',
    earningPotential: '$40,000 – $120,000 / Year (₦60M – ₦180M/yr)',
    difficulty: 'Intermediate',
    timeToFirstIncome: '3 – 6 Months',
    description: 'Secure full-time salaried remote engineering positions working for US, UK, and European startups and scale-ups from anywhere in the world.',
    steps: [
      'Complete a Kogla Tech flagship academy track and earn your verified digital certificate.',
      'Build a polished GitHub with meaningful open-source commits and complete documentation.',
      'Revamp your ATS-optimized resume emphasizing business impact, test coverage, and architecture.',
      'Apply systematically to remote-friendly job platforms and message hiring managers directly on LinkedIn.',
      'Ace technical take-home challenges and live coding interviews using Kogla interview prep frameworks.'
    ],
    toolsAndPlatforms: ['Wellfound (AngelList)', 'RemoteOK', 'WeWorkRemotely', 'LinkedIn Jobs', 'GitHub', 'LeetCode'],
    proTips: [
      'Highlight timezone overlap (Nigerian time GMT+1 aligns exceptionally well with UK and European companies).',
      'Demonstrate async communication excellence and proactive documentation.'
    ],
    recommendedKoglaTrack: 'Full-Stack Web Development Bootcamp',
    koglaTrackLink: '/academy/full-stack-web-development',
    calculator: {
      metricLabel: 'Monthly Base Salary (USD Converted)',
      unitPrice: 3500000,
      defaultUnits: 1,
      explanation: 'Typical junior-to-mid level remote developer salary ($2,500–$4,000/month).'
    }
  },
  {
    id: 'micro-saas-niche-tools',
    title: 'Building & Monetizing Micro-SaaS Applications',
    category: 'saas_products',
    earningPotential: '$500 – $15,000+ / Month (MRR)',
    difficulty: 'Advanced',
    timeToFirstIncome: '60 – 120 Days',
    description: 'Create small, hyper-focused software tools that solve specific pain points for creators, marketers, or small businesses, and charge recurring monthly subscriptions.',
    steps: [
      'Identify a painful, repetitive workflow in an online niche (e.g. invoice generation for Nigerian freelancers, automated social media repurposing).',
      'Build a lean MVP in 2–3 weeks using React, Tailwind, and Firebase / Cloud SQL.',
      'Integrate subscription billing via Paystack, Stripe, or Lemon Squeezy.',
      'Launch on Product Hunt, X (Twitter), Reddit, and targeted industry communities.',
      'Iterate on user feedback and scale monthly recurring revenue (MRR).'
    ],
    toolsAndPlatforms: ['React / Vite', 'Firebase / Cloud SQL', 'Stripe / Lemon Squeezy / Paystack', 'Product Hunt', 'X / Twitter'],
    proTips: [
      'Solve one problem 10x better than existing bloated software suites.',
      'Charge from day one — paying customers give the highest quality feedback.'
    ],
    recommendedKoglaTrack: 'Full-Stack Web Development Bootcamp',
    koglaTrackLink: '/academy/full-stack-web-development',
    calculator: {
      metricLabel: 'Monthly Active Paying Subscribers',
      unitPrice: 7500,
      defaultUnits: 50,
      explanation: 'Standard subscription price per user per month (₦7,500 or ~$10-$15/mo).'
    }
  },
  {
    id: 'ui-ux-design-systems',
    title: 'UI/UX Design Systems & Mobile Prototyping',
    category: 'freelancing',
    earningPotential: '$800 – $4,000 / Design Project',
    difficulty: 'Beginner',
    timeToFirstIncome: '21 – 45 Days',
    description: 'Design high-converting mobile applications, SaaS dashboards, and landing page wireframes in Figma for startups and enterprise clients.',
    steps: [
      'Complete the Kogla Tech UI/UX Design System Track.',
      'Build 3 comprehensive Figma case studies covering user research, wireframing, high-fidelity prototypes, and design tokens.',
      'Publish your work on Behance, Dribbble, and LinkedIn.',
      'Partner with Kogla engineering students to build and ship live products together.',
      'Sell custom UI kits, design audits, and end-to-end product design sprints.'
    ],
    toolsAndPlatforms: ['Figma', 'FigJam', 'Behance', 'Dribbble', 'LottieFiles', 'Relume'],
    proTips: [
      'Always design with developers in mind: use auto-layout, named layers, and structured design tokens.',
      'Case studies that show metrics (e.g. "Increased checkout conversion by 28%") win enterprise contracts.'
    ],
    recommendedKoglaTrack: 'UI/UX Design & Product Strategy',
    koglaTrackLink: '/academy/ui-ux-design',
    calculator: {
      metricLabel: 'Completed Design Sprints / Month',
      unitPrice: 650000,
      defaultUnits: 2,
      explanation: 'Average fee for an end-to-end mobile app or SaaS dashboard UI/UX package.'
    }
  },
  {
    id: 'tech-content-creator',
    title: 'Tech Content Creation & Brand Sponsorships',
    category: 'content_creator',
    earningPotential: '$300 – $5,000+ / Sponsored Video or Post',
    difficulty: 'Intermediate',
    timeToFirstIncome: '30 – 90 Days',
    description: 'Document your coding journey, share cybersecurity tips, review software tools on TikTok, YouTube Shorts, and Instagram, and monetize through brand deals and affiliate partnerships.',
    steps: [
      'Choose your niche: Web dev tutorials, cybersecurity breakdowns, day in the life of a dev, or AI tool guides.',
      'Post short, high-value 30-60 second clips 4-5 times a week.',
      'Embed your Kogla Tech affiliate link in your bio to earn passive tuition commissions on every follower who enrolls.',
      'Reach out to dev tool companies (hosting providers, IDE extensions, API tools) for paid sponsorships once you have 5k+ engaged followers.'
    ],
    toolsAndPlatforms: ['CapCut', 'OBS Studio', 'TikTok', 'Instagram Reels', 'YouTube Shorts', 'Kogla Affiliate Portal'],
    proTips: [
      'Hook viewers in the first 2 seconds with a clear problem and visual demonstration.',
      'Combine tech education with your Kogla ambassador promo code for compounding revenue.'
    ],
    recommendedKoglaTrack: 'Kogla Creator & Ambassador Program',
    koglaTrackLink: '/affiliate-portal',
    calculator: {
      metricLabel: 'Monthly Sponsored Posts / Video Deals',
      unitPrice: 200000,
      defaultUnits: 3,
      explanation: 'Sponsorship rates for niche tech creators with engaged audiences.'
    }
  }
];

export const TECH_CAREER_ROADMAPS = [
  {
    title: 'Path to ₦1,000,000+ ($1,000) Monthly via Software Engineering',
    timeline: '6-Month Structured Sprint',
    phases: [
      {
        month: 'Month 1-2',
        focus: 'Core Foundations & DOM Manipulation',
        milestones: ['Master HTML5, CSS3, Tailwind CSS & JavaScript ES6+', 'Build 5 responsive interactive applications', 'Deploy live to Vercel/Netlify with custom domain']
      },
      {
        month: 'Month 3-4',
        focus: 'Full-Stack Architecture & Cloud Databases',
        milestones: ['React 18, TypeScript, Node.js, Express, PostgreSQL / Firestore', 'Build an authenticated multi-user SaaS or eCommerce engine', 'Implement secure payment webhooks (Paystack / Stripe)']
      },
      {
        month: 'Month 5-6',
        focus: 'Monetization & Client Acquisition',
        milestones: ['Setup Upwork, Contra & LinkedIn inbound client funnel', 'Join Kogla Ambassador Program for immediate referral cash flow', 'Close first 2 international freelance clients or land remote role']
      }
    ]
  },
  {
    title: 'Path to $5,000+ per Bounty via Cybersecurity',
    timeline: '6-Month Defense Sprint',
    phases: [
      {
        month: 'Month 1-2',
        focus: 'Networking, Linux & Reconnaissance',
        milestones: ['TCP/IP, DNS, OSI model, subnetting, Wireshark', 'Master Bash scripting and Linux system administration', 'Automate subdomain enumeration with Amass & Sublist3r']
      },
      {
        month: 'Month 3-4',
        focus: 'Web Application Pentesting & Burp Suite',
        milestones: ['OWASP Top 10 mastery (SQLi, XSS, CSRF, IDOR, SSRF)', 'Complete 50+ labs on PortSwigger Web Security Academy', 'Simulate offensive operations in Kogla Cyber War Room']
      },
      {
        month: 'Month 5-6',
        focus: 'Live Bug Bounty Hunting & Triage',
        milestones: ['Target HackerOne / Bugcrowd private & public scopes', 'Submit valid vulnerability reports with proof-of-concept videos', 'Earn first international bug bounty payout']
      }
    ]
  }
];
