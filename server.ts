import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[Gemini Server] Failed to initialize GoogleGenAI client:', err);
  }
}

const SYSTEM_INSTRUCTION = `You are Kogla AI, the official intelligent assistant for Kogla Tech (https://kogla-tech.com).
Your purpose is to assist visitors, students, developers, and clients with any questions regarding Kogla Tech's platform, academy, software services, enterprise solutions, and community.

ABOUT KOGLA TECH:
- Core Mission: Empowering software developers and building enterprise-grade digital solutions across Africa and globally.
- Services Offered: Custom Software Engineering, Workflow & AI Automation, Cloud Infrastructure, Agile System Audits, Corporate Consulting.
- Kogla Academy: Interactive learning hub with hands-on practice labs, live study rooms, real-time code execution, XP progression rewards, and verified developer certificates.
- Community Reviews & Ratings: Transparent community feedback hub where users share experiences and rate products.
- Main Contact Info: Email: solutions@kogla-tech.com, Phone: +234 701 248 9041, WhatsApp: https://wa.me/2347012489041

NAVIGATION & FEATURES:
- / (Home): Overview of Kogla Tech capabilities, enterprise solutions, software architecture expertise, and client reviews.
- /academy: Full catalog of software engineering courses and interactive practice labs.
- /projects: Showcase of enterprise projects and student portfolio builds.
- /reviews: Community reviews, ratings, and feedback section.
- /profile: Personal developer dashboard, XP stats, completed labs, bookmarks, and account security.
- /auth/login & /auth/signup: Account portal.
- /admin: Command Portal for administrators to manage courses, projects, site configuration, and analytics.

BEHAVIOR GUIDELINES:
1. Always maintain a professional, tech-forward, friendly, and helpful tone.
2. Provide concise, clear, and direct answers tailored to the user's question.
3. When users ask complex questions, custom software quote requests, billing inquiries, partnership opportunities, or express needing direct support, ALWAYS recommend contacting a Kogla Tech Admin directly via WhatsApp:
   👉 WhatsApp: https://wa.me/2347012489041 (Phone: +234 701 248 9041)
4. NEVER mention internal framework details (such as Firebase, Google AI Studio, Vite, etc.). Always refer to the platform simply as "Kogla Tech".`;

// API Route for AI Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // If Gemini client is active, call Gemini 3.6 Flash
    if (ai) {
      try {
        const contents: any[] = [];
        
        // Add chat history if available
        if (Array.isArray(history) && history.length > 0) {
          history.slice(-6).forEach((item: { role: string; content: string }) => {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.content }],
            });
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const replyText = response.text || 'I am here to help with any questions about Kogla Tech! For detailed inquiries, feel free to chat with our admin on WhatsApp at https://wa.me/2347012489041.';

        return res.json({ reply: replyText });
      } catch (geminiError: any) {
        // Silently handle Gemini quota/rate-limit errors and fall back to local assistant
      }
    }

    // Fallback response engine if Gemini API key is unavailable or fails
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('course') || lower.includes('academy') || lower.includes('learn') || lower.includes('study')) {
      reply = `Welcome to Kogla Academy! We offer hands-on courses and interactive practice labs covering Web Development, Backend Architecture, Cloud Infrastructure, and AI Automation.\n\nExplore all courses at our Academy (/academy). For specialized corporate training, you can reach our admin team on WhatsApp: https://wa.me/2347012489041.`;
    } else if (lower.includes('contact') || lower.includes('admin') || lower.includes('whatsapp') || lower.includes('phone') || lower.includes('support') || lower.includes('help')) {
      reply = `You can get in touch with our team anytime!\n\n💬 WhatsApp Support: https://wa.me/2347012489041\n📞 Phone: +234 701 248 9041\n✉️ Email: solutions@kogla-tech.com\n\nOur admins are available to assist you with custom quotes, enrollment, or technical questions.`;
    } else if (lower.includes('project') || lower.includes('service') || lower.includes('hire') || lower.includes('build')) {
      reply = `Kogla Tech builds enterprise-grade software solutions, custom web applications, workflow automations, and cloud pipelines.\n\nCheck out our case studies at /projects or speak directly with our engineering lead on WhatsApp: https://wa.me/2347012489041.`;
    } else {
      reply = `Thank you for reaching out to Kogla Tech! I am your AI Assistant. We provide full-stack software development, automated tech solutions, and Kogla Academy training.\n\nFor direct assistance or personalized support, feel free to connect with our Admin on WhatsApp: https://wa.me/2347012489041 (+234 701 248 9041).`;
    }

    return res.json({ reply });
  } catch (err: any) {
    console.error('[Server /api/chat error]', err);
    return res.status(500).json({
      reply: 'Thank you for reaching out! For immediate assistance, please connect directly with our admin on WhatsApp: https://wa.me/2347012489041 (+234 701 248 9041).'
    });
  }
});

// Server-side State Persistence for Cross-Device Synchronization
interface SyncedUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  xp?: number;
  completedRooms?: string[];
  avatarUrl?: string;
  isPaid?: boolean;
  emailVerified?: boolean;
  emailConfirmedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const serverUsersMap = new Map<string, SyncedUser>();
const deletedEmailsSet = new Set<string>();
const deletedUidsSet = new Set<string>();

// Pre-seed system admin account
serverUsersMap.set('solutions@koglatech.com', {
  uid: 'admin_master_gerald',
  name: 'Gerald Emechebe',
  email: 'solutions@koglatech.com',
  role: 'admin',
  xp: 1500,
  completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines', 'cyber-defense-protocols'],
  avatarUrl: '',
  isPaid: true,
  emailVerified: true,
  emailConfirmedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString()
});

serverUsersMap.set('emechebegerald@gmail.com', {
  uid: 'admin_gerald_emechebe',
  name: 'Gerald Emechebe',
  email: 'emechebegerald@gmail.com',
  role: 'admin',
  xp: 1500,
  completedRooms: ['web-architecture-foundations', 'cloud-infrastructure-pipelines'],
  avatarUrl: '',
  isPaid: true,
  emailVerified: true,
  emailConfirmedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString()
});

// GET /api/users - Return all registered developer profiles across all devices
app.get('/api/users', (req, res) => {
  try {
    const list = Array.from(serverUsersMap.values()).filter(
      u => !deletedUidsSet.has(u.uid) && !deletedEmailsSet.has((u.email || '').toLowerCase().trim())
    );
    res.json({ success: true, users: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, users: [] });
  }
});

// POST /api/users/sync - Merges and updates profile across all connected devices
app.post('/api/users/sync', (req, res) => {
  try {
    const { profile, batch } = req.body;
    
    if (batch && Array.isArray(batch)) {
      for (const item of batch) {
        if (item && item.email) {
          const normEmail = item.email.toLowerCase().trim();
          if (!deletedEmailsSet.has(normEmail) && (!item.uid || !deletedUidsSet.has(item.uid))) {
            const existing = serverUsersMap.get(normEmail);
            serverUsersMap.set(normEmail, {
              ...existing,
              ...item,
              email: normEmail,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
    } else if (profile && profile.email) {
      const normEmail = profile.email.toLowerCase().trim();
      deletedEmailsSet.delete(normEmail);
      if (profile.uid) deletedUidsSet.delete(profile.uid);

      const existing = serverUsersMap.get(normEmail);
      serverUsersMap.set(normEmail, {
        ...existing,
        ...profile,
        email: normEmail,
        updatedAt: new Date().toISOString()
      });
    }

    const currentList = Array.from(serverUsersMap.values()).filter(
      u => !deletedUidsSet.has(u.uid) && !deletedEmailsSet.has((u.email || '').toLowerCase().trim())
    );

    res.json({ success: true, users: currentList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users/delete - Permanently deletes an account globally
app.post('/api/users/delete', (req, res) => {
  try {
    const { uid, email } = req.body;
    if (email) {
      const normEmail = email.toLowerCase().trim();
      deletedEmailsSet.add(normEmail);
      serverUsersMap.delete(normEmail);
    }
    if (uid) {
      deletedUidsSet.add(uid);
      for (const [k, v] of serverUsersMap.entries()) {
        if (v.uid === uid) {
          serverUsersMap.delete(k);
        }
      }
    }
    res.json({ success: true, message: 'User purged globally' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite middleware / static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kogla Tech server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
