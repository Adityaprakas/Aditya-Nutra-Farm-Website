import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, AlertCircle, ShoppingBag, ChevronRight, MessageSquareCode } from 'lucide-react';
import { Product } from '../types.ts';

interface ChatbotProps {
  language: 'en' | 'hi';
  products: Product[];
  handleOpenProductDetail: (p: Product) => void;
  triggerToast: (msg: string, type: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedProductIds?: number[];
  timestamp: Date;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  language,
  products,
  handleOpenProductDetail,
  triggerToast,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatbotRef = React.useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close the chatbot when clicking anywhere outside of it (all device compatibility)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        // Ensure we are not clicking the floating trigger button itself to avoid toggling conflicts
        const trigger = document.getElementById('chatbot-floating-trigger');
        if (trigger && trigger.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle cursor hover state changes gracefully so it doesn't immediately vanish on quick accidental slide-offs
  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 2500); // Gives 2.5 seconds window so users don't loose their typing state on accidental leaves
  };

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Initialize with welcome message if empty
  React.useEffect(() => {
    if (messages.length === 0) {
      const greeting = language === 'hi' 
        ? "नमस्ते! 🙏 आदित्य न्युट्रा फार्म में आपका स्वागत है। मैं 'आदि' हूं, आपका मखाना और टेस्ट एक्सपर्ट। आज आप किस प्रकार का मखाना या हेल्दी स्नैक्स ढूंढ रहे हैं? (उदा. तीखा मसाला, मीठा गुड़, नमकीन या बिल्कुल सादा मखाना)"
        : "Hello! 🙏 Welcome to Aditya Nutra Farm. I am 'Adi', your personal Makhana & Taste Expert here in Bihar. Which variety of Makhana or healthy snacks are you looking for today? (e.g. spicy masala, sweet jaggery, calorie-free raw, or roasted with pink salt)";
      
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [language, messages.length]);

  // Scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Listen for product details opening anywhere in the app to close the chatbot automatically as requested
  React.useEffect(() => {
    const handleCloseChatbot = () => {
      setIsOpen(false);
    };
    window.addEventListener('close-chatbot', handleCloseChatbot);
    return () => {
      window.removeEventListener('close-chatbot', handleCloseChatbot);
    };
  }, []);

  const parseRecommendations = (text: string) => {
    const productIds: number[] = [];
    const regex = /\[RECOMMEND:\s*(\d+)\]/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const id = parseInt(match[1]);
      if (!isNaN(id)) {
        productIds.push(id);
      }
    }
    const cleanText = text.replace(regex, '').trim();
    return { cleanText, productIds };
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Gather list of previous messages to maintain context
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI server');
      }

      const data = await response.json();
      
      // Parse any RECOMMEND markers
      const { cleanText, productIds } = parseRecommendations(data.reply || '');

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: cleanText,
          recommendedProductIds: productIds.length > 0 ? productIds : undefined,
          timestamp: new Date()
        }
      ]);
    } catch (error: any) {
      console.error('Chat error:', error);
      triggerToast(
        language === 'hi'
          ? "माफ़ करें, आदि से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।"
          : "Sorry, I could not connect with Adi. Please check connection and try again.",
        "err"
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetClick = (presetText: string) => {
    handleSendMessage(presetText);
  };

  // English & Hindi quick replies
  const PRESET_QUICK_REPLIES = language === 'hi' 
    ? [
        { text: "🔥 बेस्टसेलर मसाला मखाना कौन सा है?", label: "बेस्टसेलर" },
        { text: "🍃 क्या आपके पास बिना तेल/घी का मखाना है?", label: "डाइट मखाना" },
        { text: "🎁 त्योहार या गिफ्ट के लिए कॉम्बो दिखाएं।", label: "गिफ्ट बॉक्स" },
        { text: "🌾 क्या आपका मखाना सीधा बिहार का है?", label: "सूटर्स फार्मिंग" }
      ]
    : [
        { text: "🔥 What is your best-selling flavored Makhana?", label: "Best-seller" },
        { text: "🍃 Do you have calorie-free/diet Phool Makhana?", label: "Diet/No-oil" },
        { text: "🎁 Show me premium gift packs or combos.", label: "Gift Box" },
        { text: "🌾 Are your products sourced directly from Bihar?", label: "Bihar Farming" }
      ];

  return (
    <>
      {/* 1. CHAT FLOATING TRIGGER BUTTON (Scaled down for discrete beauty) */}
      <button
        id="chatbot-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[88px] right-6 z-40 bg-[#16181D] hover:bg-[#1D212A] text-[#D4AF37] p-2.5 rounded-full shadow-2xl flex items-center justify-center border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
        title="Chat with Adi, our AI Sourcing Expert"
        aria-label="Chat with Adi, our AI Sourcing Expert"
      >
        <div className="absolute inset-0 rounded-full border border-[#D4AF37] opacity-40 animate-ping" />
        <Bot size={18} className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[8px] font-bold px-1 py-0.2 rounded-full uppercase tracking-wider scale-90">
          AI
        </span>
      </button>

      {/* 2. CHAT DRAW PANEL COLLAPSIBLE DRAWER (Scaled down to 300px width and 390px height) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-draw-panel"
            ref={chatbotRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[88vw] sm:w-[290px] h-[390px] bg-[#0E1013]/98 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header (More compact) */}
            <div className="p-2 bg-gradient-to-r from-[#121417] to-[#1C1F26] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="relative p-1 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] border border-[#D4AF37]/20">
                  <Bot size={14} className="animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 border border-[#0E1013] rounded-full" />
                </div>
                <div>
                  <h3 className="text-white text-[11px] font-bold tracking-tight flex items-center gap-1">
                    Adi <span className="text-[8px] bg-gradient-to-r from-[#D4AF37] to-amber-500 bg-clip-text text-transparent font-extrabold uppercase">Expert</span>
                  </h3>
                  <p className="text-[#888] text-[8px] leading-none">
                    {language === 'hi' ? 'सक्रिय • मखाना सहायक' : 'Online • Sourcing Assistant'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white bg-transparent hover:bg-[#FF3333]/15 p-1 rounded-lg transition-all cursor-pointer border-none"
                aria-label="Close Assistant"
                title={language === 'hi' ? 'चैट बंद करें' : 'Exit'}
              >
                <X size={14} />
              </button>
            </div>

            {/* Chat Area Scroll container (Optimized margins and spacing) */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m) => {
                const isBot = m.role === 'assistant';
                return (
                  <div key={m.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-0.5`}>
                    {/* Role name/Avatar top margin */}
                    <div className={`flex items-center gap-1 text-[8px] font-mono text-[#666] ${isBot ? 'pl-0.5' : 'pr-0.5'}`}>
                      {isBot ? (
                        <>
                          <Sparkles size={8} className="text-[#D4AF37]" />
                          <span>ADI</span>
                        </>
                      ) : (
                        <span>YOU</span>
                      )}
                    </div>

                    {/* Chat Bubble card (Scaled down font size and padding) */}
                    <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[11px] inline-block leading-normal shadow-sm ${
                      isBot 
                        ? 'bg-[#1D212A] text-gray-200 rounded-tl-none border border-white/5' 
                        : 'bg-[#D4AF37] text-black font-semibold rounded-tr-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>

                    {/* Highly interactive clickable recommended products list (Compact size) */}
                    {isBot && m.recommendedProductIds && m.recommendedProductIds.length > 0 && (
                      <div className="w-[85%] mt-1 space-y-1.5 pl-0.5 animate-fadeIn">
                        <div className="text-[8px] text-[#A37B24] font-bold uppercase tracking-wider flex items-center gap-1">
                          <ShoppingBag size={8} />
                          <span>{language === 'hi' ? 'उत्पाद (क्लिक करें):' : 'Click to View:'}</span>
                        </div>
                        {m.recommendedProductIds.map((id) => {
                          const prod = products.find(p => p.id === id);
                          if (!prod) return null;
                          return (
                            <div 
                              key={id}
                              onClick={() => {
                                handleOpenProductDetail(prod);
                                triggerToast(
                                  language === 'hi' 
                                    ? `${prod.name} का विवरण खोला जा रहा है...` 
                                    : `Opening ${prod.name} details...`,
                                  "success"
                                );
                                // Automatically close the chatbot drawer when a product is clicked
                                setIsOpen(false);
                              }}
                              className="bg-[#12141A]/90 hover:bg-[#1C202A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 p-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:translate-x-1 active:translate-x-0"
                            >
                              <img 
                                src={prod.image} 
                                alt={prod.name} 
                                className="w-7 h-7 rounded object-cover bg-neutral-800 border border-white/10 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-[9px] font-bold truncate">{prod.name}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[#D4AF37] font-semibold text-[9px]">₹{prod.price}</span>
                                  {prod.mrp > prod.price && (
                                    <span className="text-gray-500 line-through text-[8px]">₹{prod.mrp}</span>
                                  )}
                                </div>
                              </div>
                              <div className="p-0.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded font-bold shrink-0">
                                <ChevronRight size={10} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bot thinking dots animation (More compact) */}
              {isTyping && (
                <div className="flex flex-col items-start space-y-0.5 pr-10 animate-pulse">
                  <div className="text-[8px] font-mono text-[#666] pl-0.5">ADI...</div>
                  <div className="bg-[#1D212A] rounded-xl rounded-tl-none px-2.5 py-1.5 border border-white/5 flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Presets footer */}
            {messages.length <= 2 && (
              <div className="px-2.5 py-1 border-t border-white/5 bg-[#0A0B0E] flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 scroll-smooth">
                {PRESET_QUICK_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetClick(reply.text)}
                    className="text-[8px] text-gray-300 bg-[#16181E] border border-white/10 hover:border-[#D4AF37]/40 px-2 py-1 rounded-full hover:bg-black transition-all font-medium cursor-pointer shrink-0"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form area (Highly tactile & miniature) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-1.5 bg-[#0E1013] border-t border-white/5 flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={language === 'hi' ? 'आदि से पूछें...' : 'Ask Adi...'}
                className="flex-1 bg-[#12141A] text-white text-[11px] px-2.5 py-1.5 rounded-lg border border-white/10 focus:border-[#D4AF37] focus:outline-none transition-all placeholder:text-gray-600 font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className={`p-2 rounded-lg border-none font-bold cursor-pointer transition-all ${
                  inputValue.trim() && !isTyping
                    ? 'bg-[#D4AF37] hover:bg-[#B9962D] text-black hover:scale-103 active:scale-97'
                    : 'bg-[#1C1F26] text-gray-500 cursor-not-allowed'
                }`}
                aria-label="Send Message"
              >
                <Send size={11} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
