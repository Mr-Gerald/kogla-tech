import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  PhoneCall, 
  MessageCircle, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantChat: React.FC = () => {
  const { config } = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('kogla_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: `Hello! I am **Kogla AI Assistant**. How can I help you today? Feel free to ask about our courses, software engineering services, projects, or community. \n\nIf you need custom quotes or direct human help, you can also reach our Admin on WhatsApp anytime.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kogla_ai_chat_history', JSON.stringify(messages));
    } catch (_) {}
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || inputMsg;
    if (!messageContent.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageContent.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyPayload,
        }),
      });

      const data = await response.json();
      const assistantText = data.reply || `Thank you for reaching out! You can also chat directly with our Admin on WhatsApp at ${config.whatsappLink || 'https://wa.me/2347012489041'}.`;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[AI Chat Error]', err);
      const whatsappUrl = config.whatsappLink || 'https://wa.me/2347012489041';
      const fallbackMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: `I'm having a brief connection delay. Please feel free to reach our Admin directly on WhatsApp for immediate assistance: ${whatsappUrl}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const welcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'assistant',
      text: `Chat history cleared. How else may I assist you with Kogla Tech services or courses today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
    localStorage.removeItem('kogla_ai_chat_history');
  };

  // Helper function to render text with bold formatting and embedded WhatsApp CTA buttons
  const renderFormattedText = (text: string) => {
    // Check if text contains WhatsApp link or phone number
    const whatsappUrl = config.whatsappLink || 'https://wa.me/2347012489041';
    const hasWhatsAppLink = text.includes('wa.me') || text.includes('WhatsApp');

    // Split text into lines
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <br key={idx} />;

          // Process bold tags **text**
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          const renderedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-gold-300">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          return <p key={idx}>{renderedParts}</p>;
        })}

        {hasWhatsAppLink && (
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow-md transition-all hover:scale-[1.02] border border-emerald-400/30 font-sans"
            >
              <MessageCircle size={14} className="fill-current" />
              <span>Contact Admin on WhatsApp</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="relative group px-3 py-2 sm:px-3.5 sm:py-2 bg-zinc-950/95 border border-gold-500/60 hover:border-gold-400 text-gold-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.25)] flex items-center justify-center transition-all overflow-hidden"
              title="Open Kogla AI Assistant"
            >
              {/* Outer subtle glow */}
              <span className="absolute inset-0 rounded-full bg-gold-500/10 pointer-events-none"></span>
              
              <div className="relative flex items-center gap-1.5">
                <Bot size={15} className="text-gold-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                  KOGLA AI
                </span>
              </div>

              {/* Status dot */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-950"></span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* CHAT WINDOW MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed z-[9999] font-sans transition-all duration-300 ${
              isMinimized
                ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 h-14 overflow-hidden rounded-lg shadow-2xl bg-zinc-950 border border-gold-500/40'
                : 'bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-xl shadow-2xl bg-zinc-950/95 backdrop-blur-xl border border-gold-500/30 flex flex-col overflow-hidden'
            }`}
          >
            {/* HEADER BAR */}
            <div className="p-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                      Kogla AI Assistant
                    </h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded">
                      24/7 Support
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>Online • Instant AI Answers</span>
                  </div>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors rounded hover:bg-zinc-900"
                  title="Clear Chat History"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded hover:bg-zinc-900"
                  title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded hover:bg-zinc-900"
                  title="Close Assistant"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* DIRECT ADMIN CONTACT QUICK BAR */}
                <div className="bg-zinc-900/90 px-3 py-2 border-b border-zinc-850 flex items-center justify-between text-[10px] sm:text-[11px] gap-2 flex-wrap">
                  <span className="text-zinc-300 font-mono flex items-center gap-1.5 shrink-0">
                    <PhoneCall size={12} className="text-gold-400" /> Direct Support:
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${(config.contactPhone || '+2347012489041').replace(/[^0-9+]/g, '')}`}
                      className="px-2 py-0.5 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 font-mono text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                      title="Call Us Directly"
                    >
                      <PhoneCall size={10} /> Call {config.contactPhone || '+234 701 248 9041'}
                    </a>
                    <a
                      href={config.whatsappLink || 'https://wa.me/2347012489041'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                      title="Chat Admin on WhatsApp"
                    >
                      <MessageCircle size={10} /> WhatsApp
                    </a>
                  </div>
                </div>

                {/* MESSAGES CONTAINER */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans custom-scrollbar">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 shadow-md ${
                          msg.sender === 'user'
                            ? 'bg-gold-500 text-black font-medium border border-gold-400/50 rounded-br-none'
                            : 'bg-zinc-900/90 text-zinc-100 border border-zinc-800 rounded-bl-none'
                        }`}
                      >
                        {msg.sender === 'user' ? (
                          <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        ) : (
                          renderFormattedText(msg.text)
                        )}
                        <span
                          className={`text-[9px] font-mono mt-1.5 block ${
                            msg.sender === 'user' ? 'text-black/60 text-right' : 'text-zinc-500 text-left'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* TYPING INDICATOR */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg rounded-bl-none p-3 flex items-center gap-2">
                        <Bot size={14} className="text-gold-400 animate-bounce" />
                        <span className="text-[11px] text-zinc-400 font-mono">
                          Kogla AI is thinking...
                        </span>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-ping"></span>
                          <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-ping delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-ping delay-200"></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* SUGGESTED QUICK PROMPTS */}
                <div className="px-3 py-2 bg-zinc-950/80 border-t border-zinc-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase shrink-0">Quick Ask:</span>
                  {[
                    '🚀 Academy Courses',
                    '💬 Admin WhatsApp',
                    '🛠️ Custom Services',
                    '⭐ User Reviews',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, 'Tell me about '))}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-300 hover:text-gold-400 rounded-full shrink-0 transition-all font-mono"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* INPUT FORM */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-zinc-950 border-t border-zinc-850 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask Kogla AI anything about our services..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-gold-500 focus:outline-none rounded px-3 py-2 text-xs text-white placeholder-zinc-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMsg.trim()}
                    className="p-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 text-black font-bold rounded transition-all shadow shrink-0"
                    title="Send message"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
