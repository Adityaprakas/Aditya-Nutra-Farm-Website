import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Sparkles, Sliders, Check, Flame, Gift, Clock } from 'lucide-react';

interface FestiveOffersBannerProps {
  language: 'en' | 'hi';
  cartTotal?: number;
  isAdmin?: boolean;
  triggerToast?: (message: string, type: 'success' | 'err' | 'info') => void;
}

interface FestivalTheme {
  id: string;
  nameEn: string;
  nameHi: string;
  emoji: string;
  couponCode: string;
  discountAmt: number;
  bannerTitleEn: string;
  bannerTitleHi: string;
  descEn: string;
  descHi: string;
  bgGradient: string;
  accentBorder: string;
  accentText: string;
  particleColor: string;
}

const FESTIVALS: FestivalTheme[] = [
  {
    id: 'monsoon',
    nameEn: 'Monsoon Harvest',
    nameHi: 'मानसून हार्वेस्ट',
    emoji: '🌱',
    couponCode: 'MONSOON25',
    discountAmt: 120,
    bannerTitleEn: 'Monsoon Refresh Sale',
    bannerTitleHi: 'मानसून रिफ्रेश सेल ⛈️',
    descEn: 'Fresh June makhana harvest is here! Flat ₹120 Off + Free Delivery on premium superfoods.',
    descHi: 'जून की ताज़ा मखाना फसल आ गई है! प्रीमियम सुपरफूड्स पर फ्लैट ₹120 की छूट + मुफ़्त डिलीवरी।',
    bgGradient: 'from-emerald-950 via-teal-900 to-slate-900',
    accentBorder: 'border-emerald-500/30 hover:border-emerald-400',
    accentText: 'text-emerald-400',
    particleColor: 'bg-emerald-400/20',
  },
  {
    id: 'diwali',
    nameEn: 'Diwali Festival',
    nameHi: 'दीपावली महोत्सव',
    emoji: '🪔',
    couponCode: 'DIWALI50',
    discountAmt: 150,
    bannerTitleEn: 'Diwali Festive Light Sale',
    bannerTitleHi: 'दीपावली बंपर सेल 🪔',
    descEn: 'Celebrate with divine pure organic jumbo seeds. Up to 50% Off and Free Gift Box on orders above ₹699!',
    descHi: 'पावन और शुद्ध जंबो मखाने के साथ जश्न मनाएं। ₹699 से ऊपर के ऑर्डर्स पर मुफ़्त गोल्ड गिफ्ट बॉक्स!',
    bgGradient: 'from-amber-950 via-red-950 to-amber-900',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    accentText: 'text-amber-400',
    particleColor: 'bg-amber-400/30',
  },
  {
    id: 'holi',
    nameEn: 'Holi Colors',
    nameHi: 'होली उत्सव',
    emoji: '🌈',
    couponCode: 'HOLI20',
    discountAmt: 100,
    bannerTitleEn: 'Holi Festival of Colors',
    bannerTitleHi: 'होली खुशियों के रंग 🎨',
    descEn: 'Get Flat ₹100 Off on all roasted and spicy masala makhana flavors! Celebrate with healthy colors!',
    descHi: 'सभी रोस्टेड और मसालेदार मखाना स्वादों पर पाएं फ्लैट ₹100 की छूट! स्वस्थ त्योहार मनाएं!',
    bgGradient: 'from-[#2e0854] via-[#540237] to-[#140026]',
    accentBorder: 'border-pink-500/40 hover:border-pink-400',
    accentText: 'text-pink-400',
    particleColor: 'bg-[#ff00a0]/25',
  },
  {
    id: 'chhath',
    nameEn: 'Chhath Puja Sourcing',
    nameHi: 'छठ पूजा स्पेशल',
    emoji: '🌅',
    couponCode: 'CHHATH15',
    discountAmt: 85,
    bannerTitleEn: 'Mithila Chhath Special',
    bannerTitleHi: 'मिथिला छठ पूजा स्पेशल 🙏',
    descEn: '100% pure organic jumbo seeds direct from Bihar lakes. High protein puja offerings with ₹85 discount.',
    descHi: 'बिहार के तालाबों से 100% शुद्ध जंबो मखाना। ₹85 की पावन छूट के साथ सेहतमंद अर्घ्य सामग्री।',
    bgGradient: 'from-orange-950 via-amber-900 to-yellow-950',
    accentBorder: 'border-orange-500/40 hover:border-orange-400',
    accentText: 'text-orange-400',
    particleColor: 'bg-orange-400/35',
  },
  {
    id: 'newyear',
    nameEn: 'New Year Warmth',
    nameHi: 'नव वर्ष स्पेशल',
    emoji: '🎉',
    couponCode: 'NEWYEAR20',
    discountAmt: 90,
    bannerTitleEn: 'New Year Winter Wellness',
    bannerTitleHi: 'नव वर्ष सेहत सेल 🥳',
    descEn: 'Kickstart your healthy habits! Stay fit with hot ghee-roasted winter superfoods. Flat ₹90 Off.',
    descHi: 'नए साल में स्वस्थ आदतों की शुरुआत! गाय के शुद्ध घी में भूने मखानों पर फ्लैट ₹90 की छूट।',
    bgGradient: 'from-indigo-950 via-slate-900 to-blue-950',
    accentBorder: 'border-cyan-400/30 hover:border-cyan-300',
    accentText: 'text-cyan-400',
    particleColor: 'bg-cyan-400/20',
  }
];

export default function FestiveOffersBanner({ language, cartTotal, isAdmin, triggerToast }: FestiveOffersBannerProps) {
  // Determine default festival automatically based on local time
  // June/July -> monsoon, Oct/Nov -> diwali, Mar -> holi, Sep/Oct -> chhath, Dec/Jan -> newyear
  const getAutoDetectedFestival = (): FestivalTheme => {
    const currentMonth = new Date().getMonth(); // 0-indexed: 0=Jan, 5=June
    if (currentMonth === 5 || currentMonth === 6) {
      return FESTIVALS[0]; // June or July -> Monsoon
    } else if (currentMonth === 9 || currentMonth === 10) {
      return FESTIVALS[1]; // October or November -> Diwali
    } else if (currentMonth === 2) {
      return FESTIVALS[2]; // March -> Holi
    } else if (currentMonth === 8) {
      return FESTIVALS[3]; // Sept -> Chhath Sourcing
    } else {
      return FESTIVALS[4]; // Default -> New Year Winter Warmth (Dec, Jan, Feb etc)
    }
  };

  const getInitialFestival = (): FestivalTheme => {
    const override = localStorage.getItem('an_active_festive_season');
    if (override) {
      const match = FESTIVALS.find(f => f.id === override);
      if (match) return match;
    }
    return getAutoDetectedFestival();
  };

  const [activeTheme, setActiveTheme] = React.useState<FestivalTheme>(getInitialFestival());
  const [showPicker, setShowPicker] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState({ hours: 7, minutes: 42, seconds: 15 });
  const [alreadyClaimed, setAlreadyClaimed] = React.useState(false);

  // Synchronise whether user has claimed a festive offer in their history
  React.useEffect(() => {
    const checkClaimStatus = () => {
      const claimed = localStorage.getItem('an_used_festive_offer_claimed') === 'true';
      setAlreadyClaimed(claimed);
    };
    checkClaimStatus();

    window.addEventListener('storage', checkClaimStatus);
    window.addEventListener('festive-offer-redeemed', checkClaimStatus);
    return () => {
      window.removeEventListener('storage', checkClaimStatus);
      window.removeEventListener('festive-offer-redeemed', checkClaimStatus);
    };
  }, []);

  // Dynamically select festive theme based on admin override or cart price ranges
  React.useEffect(() => {
    // 1. If admin override exists, respect it immediately
    const override = localStorage.getItem('an_active_festive_season');
    if (override) {
      const match = FESTIVALS.find(f => f.id === override);
      if (match) {
        if (match.id !== activeTheme.id) {
          setActiveTheme(match);
          setApplied(false);
        }
        return;
      }
    }

    if (cartTotal === undefined) return;
    if (localStorage.getItem('an_used_festive_offer_claimed') === 'true') return;

    let selected = activeTheme;
    if (cartTotal >= 499) {
      selected = FESTIVALS.find(f => f.id === 'diwali') || FESTIVALS[1];
    } else if (cartTotal >= 399) {
      selected = FESTIVALS.find(f => f.id === 'monsoon') || FESTIVALS[0];
    } else if (cartTotal >= 299) {
      selected = FESTIVALS.find(f => f.id === 'holi') || FESTIVALS[2];
    } else if (cartTotal >= 249) {
      selected = FESTIVALS.find(f => f.id === 'newyear') || FESTIVALS[4];
    } else if (cartTotal >= 199) {
      selected = FESTIVALS.find(f => f.id === 'chhath') || FESTIVALS[3];
    } else {
      // Default auto theme if subtotal is below ₹199
      selected = getAutoDetectedFestival();
    }

    if (selected.id !== activeTheme.id) {
      setActiveTheme(selected);
      setApplied(false);
    }
  }, [cartTotal]);

  // Synchronize manual override updates (including storage changes or admin events)
  React.useEffect(() => {
    const handleOverrideChange = () => {
      const override = localStorage.getItem('an_active_festive_season');
      if (override) {
        const match = FESTIVALS.find(f => f.id === override);
        if (match) {
          setActiveTheme(match);
          setApplied(false);
        }
      } else {
        // Recalculate automatic
        let selected = getAutoDetectedFestival();
        if (cartTotal !== undefined) {
          if (cartTotal >= 499) {
            selected = FESTIVALS.find(f => f.id === 'diwali') || FESTIVALS[1];
          } else if (cartTotal >= 399) {
            selected = FESTIVALS.find(f => f.id === 'monsoon') || FESTIVALS[0];
          } else if (cartTotal >= 299) {
            selected = FESTIVALS.find(f => f.id === 'holi') || FESTIVALS[2];
          } else if (cartTotal >= 249) {
            selected = FESTIVALS.find(f => f.id === 'newyear') || FESTIVALS[4];
          } else if (cartTotal >= 199) {
            selected = FESTIVALS.find(f => f.id === 'chhath') || FESTIVALS[3];
          }
        }
        setActiveTheme(selected);
        setApplied(false);
      }
    };
    window.addEventListener('storage', handleOverrideChange);
    window.addEventListener('festive-override-updated', handleOverrideChange);
    return () => {
      window.removeEventListener('storage', handleOverrideChange);
      window.removeEventListener('festive-override-updated', handleOverrideChange);
    };
  }, [cartTotal]);

  // Slide-in auto trigger after 3.2 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has closed it in this session
      const dismissed = sessionStorage.getItem(`an_festive_dismissed_${activeTheme.id}`);
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 3200);
    return () => clearTimeout(timer);
  }, [activeTheme.id]);

  // Handle countdown clock decrements
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // reset
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeTheme.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Apply the coupon by dispatching a custom event that App.tsx listens to
    const event = new CustomEvent('apply-festive-coupon', {
      detail: { code: activeTheme.couponCode, discount: activeTheme.discountAmt }
    });
    window.dispatchEvent(event);

    setApplied(true);
    setTimeout(() => setApplied(false), 4000);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(`an_festive_dismissed_${activeTheme.id}`, 'true');
  };

  // Festive offers pill/banner is now persistent so users can discover limits & copy holiday coupon codes!
  const normalizedCartTotal = cartTotal ?? 0;

  return (
    <>
      {/* Mini notification pill for manual re-opening if closed */}
      <AnimatePresence>
        {!isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(true)}
            className="fixed bottom-24 left-6 z-40 bg-[#0E1013] hover:bg-[#1A1D24] text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            id="festive-revival-pill"
          >
            <span className="animate-pulse">{activeTheme.emoji}</span>
            <span>{language === 'hi' ? 'विशेष ऑफर' : 'Festive Offers'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -50, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            className={`fixed bottom-24 left-6 z-40 w-[90vw] sm:w-[325px] rounded-2xl shadow-2xl p-4 border flex flex-col gap-3.5 bg-gradient-to-br ${activeTheme.bgGradient} ${activeTheme.accentBorder} transition-all duration-500 overflow-hidden text-left`}
            id="festive-offers-banner-root"
          >
            {/* Ambient Animated Particles / Sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
              <div className={`absolute top-2 left-6 w-1 hover:w-2 h-1 rounded-full ${activeTheme.particleColor} animate-ping`} style={{ animationDuration: '3s' }} />
              <div className={`absolute bottom-3 right-12 w-1.5 h-1.5 rounded-full ${activeTheme.particleColor} animate-ping`} style={{ animationDuration: '4s', animationDelay: '1s' }} />
              <div className={`absolute top-1/2 left-1/3 w-1 h-1 rounded-full ${activeTheme.particleColor} animate-pulse`} style={{ animationDuration: '2s' }} />
            </div>

            {/* Header section */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl inline-block drop-shadow-md animate-bounce transform origin-bottom" style={{ animationDuration: '2s' }}>
                  {activeTheme.emoji}
                </span>
                <div>
                  <h4 className="text-white text-xs font-bold tracking-tight uppercase flex items-center gap-1">
                    {language === 'hi' ? activeTheme.bannerTitleHi : activeTheme.bannerTitleEn}
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Sparkles size={11} className={`${activeTheme.accentText}`} />
                    </motion.span>
                  </h4>
                  <p className="text-[9px] text-[#A37B24] font-bold tracking-widest uppercase">
                    {language === 'hi' ? 'सीमित समय धमाका' : 'Limited Time Celebration Promo'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Manual demo mode switcher */}
                {isAdmin && (
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer"
                    title="Demo Options: Select Active Festival Season Theme"
                    aria-label="Demo Options: Select Active Festival Season Theme"
                  >
                    <Sliders size={13} />
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer"
                  aria-label="Close Promo"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Custom Demo Selector view */}
            <AnimatePresence>
              {isAdmin && showPicker && (
                <motion.div
                  initial={{ opacity: 0, h: 0 }}
                  animate={{ opacity: 1, h: 'auto' }}
                  exit={{ opacity: 0, h: 0 }}
                  className="bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col gap-1 relative z-23 pointer-events-auto"
                >
                  <div className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest px-1 py-0.5">
                    Demo Mode: Select Festive Season
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FESTIVALS.map((fest) => (
                      <button
                        key={fest.id}
                        onClick={() => {
                          localStorage.setItem('an_active_festive_season', fest.id);
                          window.dispatchEvent(new Event('festive-override-updated'));
                          setActiveTheme(fest);
                          setShowPicker(false);
                          setApplied(false);
                          if (triggerToast) {
                            triggerToast(
                              language === 'hi' 
                                ? `सक्रिय उत्सव को ${fest.nameHi} में बदल दिया गया है!` 
                                : `Active festive theme updated to ${fest.nameEn}!`,
                              'success'
                            );
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-medium flex items-center gap-1 transition-all border leading-none cursor-pointer ${
                          activeTheme.id === fest.id
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span>{fest.emoji}</span>
                        <span className="truncate">{language === 'hi' ? fest.nameHi : fest.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description card */}
            <div className="text-white text-[11px] leading-relaxed font-sans font-light relative z-10">
              {language === 'hi' ? activeTheme.descHi : activeTheme.descEn}
            </div>

            {/* Dynamic Tier Upgrades Tracker */}
            {!alreadyClaimed && (
              <div className="bg-white/5 border border-white/5 rounded-xl p-2 select-none text-[9.5px] relative z-10" id="festive-tiers-progress">
                <div className="text-[8.5px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>🎯 {language === 'hi' ? 'उत्सव अपग्रेड मार्ग:' : 'Tier Upgrades Tracker:'}</span>
                  <span className="bg-[#D4AF37]/10 px-1.5 py-0.5 rounded text-[8px] font-mono font-black text-white">Cart: ₹{cartTotal || 0}</span>
                </div>
                <div className="space-y-1.5 text-gray-300 font-sans">
                  {cartTotal !== undefined && cartTotal < 199 && (
                    <div className="text-amber-300 font-bold text-[8.5px] mb-1 animate-pulse border-b border-white/5 pb-1">
                      {language === 'hi' 
                        ? `✨ ₹${(199 - cartTotal).toFixed(0)} और जोड़ें छठ पूजा स्पेशल (₹85 छूट) अनलॉक करने के लिए!` 
                        : `✨ Add ₹${(199 - cartTotal).toFixed(0)} more to unlock Chhath Puja Special (₹85 Off)!`}
                    </div>
                  )}
                  {cartTotal !== undefined && cartTotal >= 199 && cartTotal < 249 && (
                    <div className="text-amber-300 font-bold text-[8.5px] mb-1 animate-pulse border-b border-white/5 pb-1">
                      {language === 'hi' 
                        ? `✨ ₹${(249 - cartTotal).toFixed(0)} और जोड़ें नव वर्ष स्पेशल (₹90 छूट) अनलॉक करने के लिए!` 
                        : `✨ Add ₹${(249 - cartTotal).toFixed(0)} more to unlock Winter Warmth (₹90 Off)!`}
                    </div>
                  )}
                  {cartTotal !== undefined && cartTotal >= 249 && cartTotal < 299 && (
                    <div className="text-amber-300 font-bold text-[8.5px] mb-1 animate-pulse border-b border-white/5 pb-1">
                      {language === 'hi' 
                        ? `✨ ₹${(299 - cartTotal).toFixed(0)} और जोड़ें होली उत्सव (₹100 छूट) अनलॉक करने के लिए!` 
                        : `✨ Add ₹${(299 - cartTotal).toFixed(0)} more to unlock Holi Colors (₹100 Off)!`}
                    </div>
                  )}
                  {cartTotal !== undefined && cartTotal >= 299 && cartTotal < 399 && (
                    <div className="text-amber-300 font-bold text-[8.5px] mb-1 animate-pulse border-b border-white/5 pb-1">
                      {language === 'hi' 
                        ? `✨ ₹${(399 - cartTotal).toFixed(0)} और जोड़ें मानसून ऑफर (₹120 छूट) अनलॉक करने के लिए!` 
                        : `✨ Add ₹${(399 - cartTotal).toFixed(0)} more to unlock Monsoon Harvest (₹120 Off)!`}
                    </div>
                  )}
                  {cartTotal !== undefined && cartTotal >= 399 && cartTotal < 499 && (
                    <div className="text-amber-300 font-bold text-[8.5px] mb-1 animate-pulse border-b border-white/5 pb-1">
                      {language === 'hi' 
                        ? `✨ ₹${(499 - cartTotal).toFixed(0)} और जोड़ें ग्रैंड दिवाली (₹150 छूट) अनलॉक करने के लिए!` 
                        : `✨ Add ₹${(499 - cartTotal).toFixed(0)} more to unlock Grand Diwali (₹150 Off)!`}
                    </div>
                  )}

                  <div className="grid grid-cols-5 gap-1 text-[8.5px] text-center uppercase tracking-tighter">
                    <div className={`p-1.5 rounded transition-all ${cartTotal !== undefined && cartTotal >= 499 ? 'bg-[#D4AF37]/30 font-black border border-[#D4AF37] text-white animate-pulse' : 'bg-neutral-800/40 opacity-40 text-gray-500'}`}>
                      Diwali<br/>₹499
                    </div>
                    <div className={`p-1.5 rounded transition-all ${cartTotal !== undefined && cartTotal >= 399 && cartTotal < 499 ? 'bg-[#D4AF37]/30 font-black border border-[#D4AF37] text-white' : 'bg-neutral-800/40 opacity-40 text-gray-500'}`}>
                      Monsoon<br/>₹399
                    </div>
                    <div className={`p-1.5 rounded transition-all ${cartTotal !== undefined && cartTotal >= 299 && cartTotal < 399 ? 'bg-[#D4AF37]/30 font-black border border-[#D4AF37] text-white' : 'bg-neutral-800/40 opacity-40 text-gray-500'}`}>
                      Holi<br/>₹299
                    </div>
                    <div className={`p-1.5 rounded transition-all ${cartTotal !== undefined && cartTotal >= 249 && cartTotal < 299 ? 'bg-[#D4AF37]/30 font-black border border-[#D4AF37] text-white' : 'bg-neutral-800/40 opacity-40 text-gray-500'}`}>
                      New Year<br/>₹249
                    </div>
                    <div className={`p-1.5 rounded transition-all ${cartTotal !== undefined && cartTotal >= 199 && cartTotal < 249 ? 'bg-[#D4AF37]/30 font-black border border-[#D4AF37] text-white' : 'bg-neutral-800/40 opacity-40 text-gray-500'}`}>
                      Chhath<br/>₹199
                    </div>
                  </div>
                </div>
              </div>
            )}

            {alreadyClaimed ? (
              /* Already Claimed State representation */
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center text-white relative z-10 flex flex-col items-center gap-1.5 animate-fade-in select-none">
                <div className="w-8 h-8 rounded-full bg-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Check size={16} className="stroke-[3]" />
                </div>
                <div className="text-[11px] font-bold text-emerald-300">
                  {language === 'hi' ? 'प्रोमो ऑफर सफलतापूर्वक भुनाया गया!' : 'Festive Promo Redeemed!'}
                </div>
                <p className="text-[9.5px] text-gray-300 leading-normal max-w-xs">
                  {language === 'hi' 
                    ? 'आपने अपने खाते पर एक प्रकार के वन-टाइम उत्सव प्रोमो ऑफर का सफलतापूर्वक उपयोग कर लिया है।' 
                    : 'You have successfully availed yourself of your one-time promotional discount tier for this session.'}
                </p>
              </div>
            ) : (
              <>
                {/* Promo timer with real live decrements */}
                <div className="bg-black/30 border border-white/5 rounded-xl px-2.5 py-1.5 flex items-center justify-between select-none relative z-10" id="festive-timer-row">
                  <div className="flex items-center gap-1.5 text-gray-300 text-[10px]">
                    <Clock size={11} className={`animate-pulse ${activeTheme.accentText}`} />
                    <span>{language === 'hi' ? 'ऑफर समाप्त:' : 'Ends in:'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white font-mono text-[11px] font-bold">
                    <span className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                      {timeLeft.hours.toString().padStart(2, '0')}h
                    </span>
                    <span className="opacity-70 animate-pulse">:</span>
                    <span className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                      {timeLeft.minutes.toString().padStart(2, '0')}m
                    </span>
                    <span className="opacity-70 animate-pulse">:</span>
                    <span className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5 text-amber-400">
                      {timeLeft.seconds.toString().padStart(2, '0')}s
                    </span>
                  </div>
                </div>

                {/* Tactile claim button & voucher display */}
                <div className="flex items-center gap-2 relative z-10">
                  <div className="bg-black/40 border border-dashed border-[#D4AF37]/50 rounded-xl px-3 py-2 flex-1 flex items-center justify-between overflow-hidden">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-400 font-bold uppercase leading-none">{language === 'hi' ? 'कूपन कोड' : 'PROMO CODE'}</span>
                      <span className="text-[#D4AF37] font-mono text-xs font-black tracking-wide mt-0.5">{activeTheme.couponCode}</span>
                    </div>
                    <div className="text-[11px] text-white font-bold bg-[#D4AF37]/15 rounded-md px-1.5 py-0.5 border border-[#D4AF37]/20 uppercase">
                      -₹{activeTheme.discountAmt}
                    </div>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-97 shadow-lg border-none hover:scale-103 ${
                      applied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#D4AF37] hover:bg-[#C59F2E] text-black'
                    }`}
                    aria-label="Claim Festive Offer"
                    id="claim-festive-btn"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>
                      {copied 
                        ? (language === 'hi' ? 'लागू हुआ!' : 'Applied!') 
                        : (language === 'hi' ? 'दावा करें' : 'Claim')}
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* Decorative festive label at bottom */}
            <div className="text-[8.5px] text-center text-gray-500 font-mono tracking-widest uppercase relative z-10 flex items-center justify-center gap-1 pointer-events-none select-none">
              <span>★</span>
              <span>{language === 'hi' ? 'बिहार से सीधे आपके द्वार' : 'Direct-to-consumer superfoods'}</span>
              <span>★</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
