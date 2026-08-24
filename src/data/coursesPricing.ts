export interface CourseTrack {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  onlinePrice: number;
  physicalPrice: number;
  duration: string;
  intensity: string;
  level: string;
  tools: string[];
  outcomes: string[];
  syllabus: { week: string; topic: string; details: string }[];
  featured?: boolean;
}

export const ACADEMY_COURSES: CourseTrack[] = [
  {
    slug: 'web-development',
    title: 'Full-Stack Web Development',
    category: 'Engineering',
    tagline: 'Modern distributed web architecture, React 19, Node.js, database clusters, and cloud production.',
    description: 'An intensive, system-level curriculum built to transition developers into industry-ready full-stack software engineers. Master modern JavaScript/TypeScript, React concurrent rendering cycles, REST & GraphQL APIs, relational database normalization with PostgreSQL, in-memory caching, authentication security, and CI/CD pipelines.',
    onlinePrice: 350000,
    physicalPrice: 450000,
    duration: '12 Weeks',
    intensity: 'High (15-20 hrs/week)',
    level: 'Beginner to Advanced',
    tools: ['React 19', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Git'],
    outcomes: [
      'Architect and deploy high-performance full-stack web applications handling real-world transaction volume.',
      'Design normalized SQL schemas and secure server-side API proxy middleware.',
      'Deploy production apps on modern cloud platforms with automated zero-downtime workflows.'
    ],
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Modern JavaScript & React 19 Architecture', details: 'Deep dive into hooks, state mechanics, concurrent hydration, server components, and clean UI engineering.' },
      { week: 'Weeks 4-6', topic: 'Backend APIs & Relational Databases', details: 'Node.js, Express/Fastify, PostgreSQL, schema migrations, ORM optimization, and JWT/OAuth authentication.' },
      { week: 'Weeks 7-9', topic: 'Real-Time Systems & State Engines', details: 'WebSocket state synchronization, background workers, caching with Redis, and error telemetry.' },
      { week: 'Weeks 10-12', topic: 'Capstone Project & Cloud Deployment', details: 'Building an enterprise-scale SaaS application, Docker containerization, security hardening, and live launch.' }
    ],
    featured: true
  },
  {
    slug: 'data-analysis',
    title: 'Data Analysis & Business Intelligence',
    category: 'Analytics',
    tagline: 'SQL pipelines, PowerBI dashboards, Python exploratory analysis, and executive decision models.',
    description: 'Master practical data analytics from raw dataset cleaning to automated executive dashboards. Learn advanced Excel, SQL querying, PowerBI modeling, DAX calculations, and Python for data manipulation (Pandas, NumPy, Matplotlib) to turn business metrics into high-revenue strategic decisions.',
    onlinePrice: 250000,
    physicalPrice: 350000,
    duration: '10 Weeks',
    intensity: 'Medium-High (12-15 hrs/week)',
    level: 'Beginner to Intermediate',
    tools: ['PowerBI', 'SQL (PostgreSQL/MySQL)', 'Python (Pandas)', 'Advanced Excel', 'Tableau', 'DAX'],
    outcomes: [
      'Extract, clean, and transform messy real-world corporate datasets with SQL and Python.',
      'Build dynamic, interactive executive BI dashboards with automated KPI reporting.',
      'Perform exploratory data analysis and statistical predictive forecasting for business growth.'
    ],
    syllabus: [
      { week: 'Weeks 1-2', topic: 'Advanced Spreadsheet Modeling & Data Sanitation', details: 'Pivot tables, XLOOKUP, nested logic, Power Query transformation, and financial summary structures.' },
      { week: 'Weeks 3-5', topic: 'Relational Database Queries & SQL Mastery', details: 'Complex joins, window functions, CTEs, aggregation grouping, subqueries, and database performance.' },
      { week: 'Weeks 6-8', topic: 'PowerBI & Interactive Business Dashboards', details: 'Data modeling, star schemas, custom DAX measures, automated refreshing, and visual storytelling.' },
      { week: 'Weeks 9-10', topic: 'Python for Data Analysis & Capstone Audit', details: 'Pandas DataFrames, statistical correlation, automated chart exports, and executive capstone presentation.' }
    ],
    featured: true
  },
  {
    slug: 'cybersecurity',
    title: 'Advanced Cybersecurity & Defense',
    category: 'Security',
    tagline: 'Ethical hacking, network defense, penetration testing, threat hunting, and SOC operations.',
    description: 'A comprehensive defensive and offensive security bootcamp. Learn penetration testing methodologies, network packet analysis with Wireshark, Linux security administration, vulnerability scanning with Nessus/Burp Suite, web application security (OWASP Top 10), and SOC incident response procedures.',
    onlinePrice: 450000,
    physicalPrice: 550000,
    duration: '12 Weeks',
    intensity: 'High (16-20 hrs/week)',
    level: 'Intermediate to Advanced',
    tools: ['Kali Linux', 'Wireshark', 'Burp Suite', 'Metasploit', 'Nmap', 'Splunk SIEM', 'Snort IDS'],
    outcomes: [
      'Conduct authorized penetration tests and vulnerability assessments on corporate infrastructures.',
      'Identify and remediate critical OWASP Top 10 vulnerabilities in live web architectures.',
      'Configure Security Information & Event Management (SIEM) log monitoring and incident response.'
    ],
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Networking Fundamentals & Linux Hardening', details: 'TCP/IP protocols, subnetting, packet inspection, Linux security permissions, and firewall rule configurations.' },
      { week: 'Weeks 4-6', topic: 'Ethical Hacking & Vulnerability Assessment', details: 'Reconnaissance, port scanning, exploitation frameworks, privilege escalation, and credential auditing.' },
      { week: 'Weeks 7-9', topic: 'Web Application Security & OWASP Top 10', details: 'SQL injection, Cross-Site Scripting (XSS), CSRF, authentication bypass, and API endpoint hardening.' },
      { week: 'Weeks 10-12', topic: 'SOC Operations, Threat Hunting & Capstone Audit', details: 'SIEM alert analysis, digital forensics, incident containment runbooks, and audit reporting.' }
    ],
    featured: true
  },
  {
    slug: 'product-management',
    title: 'Product Management & Growth Strategy',
    category: 'Management',
    tagline: 'Product roadmaps, user research, agile execution, unit economics, and feature launch strategy.',
    description: 'Transform customer problems into high-growth digital products. Learn how to write bulletproof Product Requirement Documents (PRDs), run user interviews, prioritize backlogs using RICE/MoSCoW, manage cross-functional engineering sprints with Jira, and design product-led growth flywheels.',
    onlinePrice: 300000,
    physicalPrice: 400000,
    duration: '10 Weeks',
    intensity: 'Medium-High (12-14 hrs/week)',
    level: 'Beginner to Intermediate',
    tools: ['Jira', 'Figma for PMs', 'Mixpanel', 'Notion', 'Miro', 'Productboard', 'Postman'],
    outcomes: [
      'Write comprehensive, developer-ready Product Requirement Documents (PRDs) and user stories.',
      'Formulate data-backed product roadmaps aligned with key business North Star metrics.',
      'Lead Agile Scrum ceremonies and run high-converting A/B testing growth experiments.'
    ],
    syllabus: [
      { week: 'Weeks 1-2', topic: 'Product Strategy & Market Opportunity Assessment', details: 'Problem discovery, competitor benchmarking, customer persona mapping, and value proposition design.' },
      { week: 'Weeks 3-5', topic: 'Product Roadmapping & PRD Authoring', details: 'Feature prioritization frameworks, writing comprehensive user stories, acceptance criteria, and wireframing.' },
      { week: 'Weeks 6-8', topic: 'Agile Execution & Cross-Functional Leadership', details: 'Sprint planning, backlog grooming, managing engineering and design handoffs, and release management.' },
      { week: 'Weeks 9-10', topic: 'Product Analytics & Go-To-Market (GTM) Launch', details: 'Funnel analytics, retention cohorts, user feedback loops, product-led growth, and capstone launch.' }
    ]
  },
  {
    slug: 'graphic-design',
    title: 'Graphic Design & Visual Brand Identity',
    category: 'Design',
    tagline: 'Brand systems, typography, vector illustration, commercial print, and high-impact marketing visuals.',
    description: 'Build timeless visual brand identities from scratch. Master industry-standard graphic design tools (Photoshop, Illustrator, InDesign), color psychology, typographic hierarchy, editorial layout grids, logo marks, vector illustrations, and multi-channel marketing collateral.',
    onlinePrice: 250000,
    physicalPrice: 350000,
    duration: '8 Weeks',
    intensity: 'Medium (10-12 hrs/week)',
    level: 'Beginner to Intermediate',
    tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Vector Systems'],
    outcomes: [
      'Create complete, commercial-grade corporate brand identity style guides and logo suites.',
      'Design high-converting social media creatives, outdoor billboards, packaging, and marketing kits.',
      'Master professional print production guidelines, CMYK color profiles, and vector exports.'
    ],
    syllabus: [
      { week: 'Weeks 1-2', topic: 'Design Fundamentals, Typography & Composition', details: 'Grid structures, visual balance, contrast ratios, font pairing principles, and color harmony theories.' },
      { week: 'Weeks 3-4', topic: 'Vector Illustration & Logo Architecture (Illustrator)', details: 'Pen tool precision, geometrical mark construction, logo guidelines, and brand iconography.' },
      { week: 'Weeks 5-6', topic: 'Photo Manipulation & Digital Retouching (Photoshop)', details: 'Advanced masking, blend modes, lighting adjustment, commercial product mockup creation.' },
      { week: 'Weeks 7-8', topic: 'Editorial Layouts & Full Brand Identity Capstone', details: 'Print preparation, bleed marks, brand guideline book creation, and professional portfolio curation.' }
    ]
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design & Product Architecture',
    category: 'Design',
    tagline: 'Figma design systems, auto-layout mastery, interactive prototyping, and user testing.',
    description: 'Design world-class web and mobile interfaces that users love. Go from raw wireframes to high-fidelity interactive prototypes. Master Figma components, variants, auto-layout, design tokens, responsive typography scales, user journey mapping, and developer handoff documentation.',
    onlinePrice: 250000,
    physicalPrice: 350000,
    duration: '10 Weeks',
    intensity: 'Medium-High (12-15 hrs/week)',
    level: 'Beginner to Advanced',
    tools: ['Figma', 'FigJam', 'Design Tokens', 'Maze User Testing', 'Notion', 'Lottie'],
    outcomes: [
      'Build scalable, production-grade Figma design systems with components and auto-layout.',
      'Design seamless, intuitive mobile and desktop UI flows backed by user research and usability testing.',
      'Deliver developer-ready design specs with tokenized variables and micro-interaction documentation.'
    ],
    syllabus: [
      { week: 'Weeks 1-2', topic: 'UX Research & Information Architecture', details: 'User interviews, affinity mapping, user personas, journey flows, and low-fidelity wireframing.' },
      { week: 'Weeks 3-5', topic: 'Visual UI Design & Figma Power Workflows', details: 'Auto-layout, responsive constraints, typography grids, color styles, and component variant sets.' },
      { week: 'Weeks 6-8', topic: 'Design Systems & Advanced Prototyping', details: 'Tokens, variables, micro-interactions, smart animations, usability testing, and UX audit loops.' },
      { week: 'Weeks 9-10', topic: 'Case Study Formulation & Developer Handoff', details: 'Writing compelling design case studies, design inspection specs, and portfolio presentation.' }
    ]
  },
  {
    slug: 'real-estate-development',
    title: 'Real Estate Development & PropTech',
    category: 'Business & Tech',
    tagline: 'Property development feasibility, digital land acquisition, PropTech solutions, and project financing.',
    description: 'A cutting-edge program merging traditional real estate development with modern PropTech technologies. Learn property feasibility modeling, land acquisition due diligence, architectural design oversight, construction project management, real estate financing/syndication, and digital marketing for property sales.',
    onlinePrice: 250000,
    physicalPrice: 350000,
    duration: '10 Weeks',
    intensity: 'Medium-High (12-14 hrs/week)',
    level: 'Beginner to Intermediate',
    tools: ['Real Estate Financial Models', 'PropTech CRMs', 'AutoCAD Overview', 'Project Management Tools'],
    outcomes: [
      'Calculate investment returns, NPV, IRR, and cash-flow projections for property development projects.',
      'Navigate legal title verification, zoning laws, permits, and contract negotiations in Nigeria.',
      'Leverage digital marketing funnels and PropTech software to syndicate and pre-sell development units.'
    ],
    syllabus: [
      { week: 'Weeks 1-2', topic: 'Fundamentals of Property Development & Land Due Diligence', details: 'Market research, land title verification (C of O, Governor\'s Consent), zoning regulations, and site assessment.' },
      { week: 'Weeks 3-5', topic: 'Financial Modeling & Project Feasibility', details: 'Development pro-formas, construction costing, IRR/ROI calculation, and securing equity & debt financing.' },
      { week: 'Weeks 6-8', topic: 'Design Coordination, Permitting & Construction Management', details: 'Architectural planning, contractor selection, milestones monitoring, and quality control management.' },
      { week: 'Weeks 9-10', topic: 'PropTech Innovations, Sales Funnels & Project Launch', details: 'Digital property syndication, virtual tours, pre-sales campaigns, and asset handover management.' }
    ]
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile App Engineering (Flutter & React Native)',
    category: 'Engineering',
    tagline: 'Cross-platform iOS and Android apps, state management, native device APIs, and app store deployment.',
    description: 'Build native-performing iOS and Android applications with single-codebase cross-platform frameworks. Learn state management (Riverpod/Zustand), offline-first caching, camera and geolocation native modules, push notifications, in-app purchases, and automated Google Play & Apple App Store releases.',
    onlinePrice: 500000,
    physicalPrice: 600000,
    duration: '14 Weeks',
    intensity: 'High (18-22 hrs/week)',
    level: 'Intermediate to Advanced',
    tools: ['Flutter / Dart', 'React Native', 'Firebase Mobile', 'Xcode', 'Android Studio', 'Fastlane'],
    outcomes: [
      'Build and publish high-performance cross-platform mobile apps for both iOS and Android stores.',
      'Implement real-time sync, offline databases (SQLite/WatermelonDB), and background location tracking.',
      'Integrate payment gateways (Paystack, Flutterwave, Stripe) and push notifications via FCM.'
    ],
    syllabus: [
      { week: 'Weeks 1-4', topic: 'Mobile UI Layouts & Component Lifecycle', details: 'Responsive screen rendering, navigation routing stacks, custom gestures, and adaptive device styling.' },
      { week: 'Weeks 5-8', topic: 'State Management & Offline-First Storage', details: 'Architecting scalable state stores, local caching, optimistic UI updates, and REST/GraphQL syncing.' },
      { week: 'Weeks 9-11', topic: 'Native Hardware Integration & Push Alerts', details: 'Accessing device camera, biometrics, GPS mapping, background audio, and Firebase notifications.' },
      { week: 'Weeks 12-14', topic: 'Testing, App Store Optimization & Live Deployment', details: 'Automated test suites, building release APK/IPA bundles, App Store submission guidelines, and launch.' }
    ],
    featured: true
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing & Growth Hacking',
    category: 'Marketing',
    tagline: 'Meta Ads, Google Search Ads, SEO optimization, email automation, and conversion rate optimization.',
    description: 'Learn performance marketing that generates measurable ROI. Master Meta Ads Manager (Facebook/Instagram), Google Search & Performance Max ads, technical SEO keyword ranking, TikTok organic growth, high-converting copywriting, and automated email nurturing sequences that convert leads into paying customers.',
    onlinePrice: 250000,
    physicalPrice: 350000,
    duration: '8 Weeks',
    intensity: 'Medium (10-12 hrs/week)',
    level: 'Beginner to Intermediate',
    tools: ['Meta Ads Manager', 'Google Ads', 'Google Analytics 4 (GA4)', 'SEMrush', 'Mailchimp/Klaviyo', 'Canva Pro'],
    outcomes: [
      'Set up and optimize profitable Meta and Google advertising campaigns with strict target ROAS.',
      'Implement full-funnel tracking with GA4, Google Tag Manager, and Meta Pixel Conversion API.',
      'Build automated email sequences with high open rates and automated lead qualification.'
    ],
    syllabus: [
      { week: 'Weeks 1-2', topic: 'Customer Personas & High-Converting Copywriting', details: 'Direct-response copywriting formulas (AIDA, PAS), compelling hook generation, and landing page wireframes.' },
      { week: 'Weeks 3-4', topic: 'Meta Advertising Mastery (Facebook & Instagram)', details: 'Audience targeting, creative testing framework, budget optimization (CBO/ABO), and Pixel event setup.' },
      { week: 'Weeks 5-6', topic: 'Google Ads & Search Engine Optimization (SEO)', details: 'Keyword research, search intent matching, on-page SEO, backlink strategies, and Google Search campaigns.' },
      { week: 'Weeks 7-8', topic: 'Email Automation, Analytics & Full Growth Funnel', details: 'GA4 attribution modeling, automated drip sequences, lead magnet optimization, and capstone campaign review.' }
    ]
  },
  {
    slug: 'sales-funnels-ai-automation',
    title: 'Sales Funnels, AI & Automation',
    category: 'Automation',
    tagline: 'Automated lead capture, WhatsApp chatbots, CRM workflows, Make.com, and AI agent integration.',
    description: 'Automate business growth with zero-code and low-code AI workflows. Learn how to architect high-converting sales funnels, connect Zapier/Make.com webhooks, deploy intelligent WhatsApp & Telegram CRM bots, automate invoicing and customer onboarding, and integrate OpenAI/Gemini LLMs into business operations.',
    onlinePrice: 250000,
    physicalPrice: 350000,
    duration: '8 Weeks',
    intensity: 'Medium-High (12-14 hrs/week)',
    level: 'Beginner to Intermediate',
    tools: ['Make.com', 'Zapier', 'WhatsApp Cloud API', 'OpenAI/Gemini APIs', 'HubSpot/GoHighLevel', 'Airtable'],
    outcomes: [
      'Build automated multi-step business pipelines connecting landing pages, CRMs, and messaging apps.',
      'Deploy 24/7 AI-powered conversational chatbots handling customer inquiries and booking appointments.',
      'Save businesses 20+ hours weekly by automating manual data entry, invoices, and follow-ups.'
    ],
    syllabus: [
      { week: 'Weeks 1-2', topic: 'Sales Funnel Architecture & Conversion Optimization', details: 'Lead magnet design, opt-in pages, upsell mechanics, automated thank-you workflows, and CRM tracking.' },
      { week: 'Weeks 3-4', topic: 'Workflow Automation with Make.com & Zapier', details: 'Webhooks, API endpoints, routers, error handlers, and connecting disparate business SaaS platforms.' },
      { week: 'Weeks 5-6', topic: 'Conversational Bots & WhatsApp Automation', details: 'WhatsApp Business API, automated message templates, interactive menu triggers, and appointment scheduling.' },
      { week: 'Weeks 7-8', topic: 'Integrating AI Agents (LLMs) & Capstone Client System', details: 'Custom GPT assistants, automated customer support answering, automated proposal generators, and client handoff.' }
    ],
    featured: true
  },
  {
    slug: 'cloud-architecture',
    title: 'Cloud Architecture & DevOps Engineering',
    category: 'Engineering',
    tagline: 'AWS/GCP infrastructure, Terraform, Kubernetes, microservices, and high-availability systems.',
    description: 'Learn enterprise cloud infrastructure engineering. Master AWS core services (EC2, S3, RDS, Lambda), Infrastructure as Code with Terraform, Docker containerization, Kubernetes container orchestration, continuous deployment with GitHub Actions, and 99.99% high-availability system designs.',
    onlinePrice: 450000,
    physicalPrice: 550000,
    duration: '12 Weeks',
    intensity: 'High (16-18 hrs/week)',
    level: 'Intermediate to Advanced',
    tools: ['AWS', 'GCP', 'Terraform', 'Kubernetes (K8s)', 'Docker', 'GitHub Actions', 'Prometheus & Grafana'],
    outcomes: [
      'Provision scalable, multi-region cloud infrastructures using declarative Terraform code.',
      'Deploy and orchestrate fault-tolerant microservices running on Kubernetes clusters.',
      'Implement automated continuous integration and delivery (CI/CD) pipelines with security gating.'
    ],
    syllabus: [
      { week: 'Weeks 1-3', topic: 'Cloud Fundamentals & AWS Architecture', details: 'VPC networking, IAM security roles, EC2 compute instances, S3 storage policies, and RDS managed databases.' },
      { week: 'Weeks 4-6', topic: 'Containers & Microservices with Docker & Kubernetes', details: 'Dockerfiles optimization, multi-stage builds, Kubernetes pods, services, ingress controllers, and auto-scaling.' },
      { week: 'Weeks 7-9', topic: 'Infrastructure as Code (IaC) with Terraform', details: 'Writing reusable Terraform modules, remote state management, environment separation, and drift detection.' },
      { week: 'Weeks 10-12', topic: 'CI/CD Pipelines, Monitoring & Enterprise Capstone', details: 'GitHub Actions deployment workflows, Prometheus/Grafana metrics monitoring, and high-availability disaster recovery.' }
    ]
  }
];

export function getCourseBySlug(slug: string): CourseTrack | undefined {
  const norm = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return ACADEMY_COURSES.find(c => c.slug === norm || norm.includes(c.slug) || c.slug.includes(norm));
}

export function formatNaira(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG');
}

export function calculateCommission(amount: number, tier: 1 | 2 = 1): { rate: number; commission: number } {
  const rate = tier === 2 ? 10 : 6;
  const commission = Math.round((amount * rate) / 100);
  return { rate, commission };
}
